import { describe, expect, it } from "vitest";
import {
  ARTIFACT_CUSTOM_METADATA_MAX_BYTES,
  ARTIFACT_MAX_BYTES,
  ARTIFACT_TTL_MS,
  artifactCustomMetadataByteLength,
  info,
  put,
  read,
  type ArtifactPutInput
} from "../src/artifacts/store.ts";
import { redactSecrets } from "../src/policy/redact.ts";
import { MemoryR2Bucket } from "./helpers/memory-r2.ts";

function input(overrides: Partial<ArtifactPutInput> = {}): ArtifactPutInput {
  return {
    body: JSON.stringify({ rows: [{ id: 1, name: "Blend" }] }),
    mime: "application/json",
    requestId: "req-123",
    rayId: "ray-abc",
    capTokens: 6000,
    originalChars: 38,
    opLedger: [{ op: "scout.getProject", status: "ok", ms: 42 }],
    catalogGeneratedAt: "2026-07-07T00:00:00.000Z",
    now: new Date("2026-07-07T12:00:00.000Z"),
    ...overrides
  };
}

function largeLedger(count: number) {
  const statuses = ["ok", "error", "soft-empty"] as const;
  return Array.from({ length: count }, (_, i) => ({
    op: `service.synthetic_operation_${String(i).padStart(3, "0")}_${"x".repeat(120)}`,
    status: statuses[i % statuses.length]!,
    ms: 10 + i
  }));
}

describe("artifact store", () => {
  it("roundtrips JSON, strings, undefined, and fallback text without guessing", async () => {
    const realBucket = new MemoryR2Bucket();
    const bucket = realBucket as unknown as R2Bucket;
    const owner = "oauth-peppered-subject";
    const observedAt = new Date("2026-07-07T12:30:00.000Z");

    const jsonPut = await put(bucket, owner, input());
    if (!jsonPut.ok) throw new Error("unexpected skip");
    expect([...realBucket.objects.values()].at(-1)?.body).toBe(input().body);
    const jsonRead = await read(bucket, owner, jsonPut.artifact.id, observedAt);
    expect(jsonRead).toMatchObject({ ok: true, value: { rows: [{ id: 1, name: "Blend" }] } });
    if (!jsonRead.ok) throw new Error("expected JSON artifact read");
    expect(jsonRead.artifact).not.toHaveProperty("key");

    const stringPut = await put(
      bucket,
      owner,
      input({ body: "plain string result", mime: "text/plain; charset=utf-8" })
    );
    if (!stringPut.ok) throw new Error("unexpected skip");
    expect([...realBucket.objects.values()].at(-1)?.body).toBe("plain string result");
    await expect(read(bucket, owner, stringPut.artifact.id, observedAt)).resolves.toMatchObject({
      ok: true,
      value: "plain string result"
    });

    const undefinedPut = await put(
      bucket,
      owner,
      input({ body: "undefined", mime: "application/x.raven.undefined" })
    );
    if (!undefinedPut.ok) throw new Error("unexpected skip");
    expect([...realBucket.objects.values()].at(-1)?.body).toBe("undefined");
    const undefinedRead = await read(bucket, owner, undefinedPut.artifact.id, observedAt);
    if (!undefinedRead.ok) throw new Error("expected undefined artifact read");
    expect(undefinedRead.value).toBeUndefined();

    const fallbackPut = await put(
      bucket,
      owner,
      input({
        body: "[unserializable result: cyclic object value]",
        mime: "text/plain; charset=utf-8"
      })
    );
    if (!fallbackPut.ok) throw new Error("unexpected skip");
    await expect(read(bucket, owner, fallbackPut.artifact.id, observedAt)).resolves.toMatchObject({
      ok: true,
      value: "[unserializable result: cyclic object value]"
    });
  });

  it("reconstructs from validated metadata when the stored body suggests another MIME", async () => {
    const realBucket = new MemoryR2Bucket();
    const bucket = realBucket as unknown as R2Bucket;
    const body = JSON.stringify({ metadata: "must win" });
    const written = await put(bucket, "owner", input({ body, mime: "application/json" }));
    if (!written.ok) throw new Error("unexpected skip");

    const stored = [...realBucket.objects.values()][0];
    if (!stored) throw new Error("missing stored object");
    stored.customMetadata.mime = "text/plain; charset=utf-8";

    await expect(
      read(bucket, "owner", written.artifact.id, new Date("2026-07-07T12:30:00.000Z"))
    ).resolves.toMatchObject({ ok: true, value: body });
  });

  it("binds keys to the owner hash and never stores the raw owner", async () => {
    const realBucket = new MemoryR2Bucket();
    const bucket = realBucket as unknown as R2Bucket;
    const owner = "peppered-oauth-subject-123";
    const written = await put(bucket, owner, input());
    if (!written.ok) throw new Error("unexpected skip");

    const keys = [...realBucket.objects.keys()];
    expect(keys).toHaveLength(1);
    expect(keys[0]).toMatch(/^art\/[0-9a-f]{16}\/[0-9a-f-]{36}$/);
    expect(keys[0]).not.toContain(owner);
    expect(written.artifact).not.toHaveProperty("key");
    const stored = realBucket.objects.get(keys[0]!);
    expect(JSON.stringify(stored?.customMetadata)).not.toContain(owner);
    expect(stored?.body).not.toContain(owner);
    await expect(read(bucket, "different-peppered-subject", written.artifact.id)).resolves.toEqual({
      ok: false,
      error: { kind: "not-found" }
    });
  });

  it("treats expired artifacts as the same not-found result", async () => {
    const bucket = new MemoryR2Bucket() as unknown as R2Bucket;
    const createdAt = new Date("2026-07-07T12:00:00.000Z");
    const written = await put(bucket, "owner", input({ now: createdAt }));
    if (!written.ok) throw new Error("unexpected skip");

    const expiredAt = new Date(createdAt.getTime() + ARTIFACT_TTL_MS + 1);
    await expect(read(bucket, "owner", written.artifact.id, expiredAt)).resolves.toEqual({
      ok: false,
      error: { kind: "not-found" }
    });
    await expect(info(bucket, "owner", written.artifact.id, expiredAt)).resolves.toEqual({
      ok: false,
      error: { kind: "not-found" }
    });
  });

  it("rejects missing or empty owners", async () => {
    const bucket = new MemoryR2Bucket() as unknown as R2Bucket;
    await expect(put(bucket, undefined, input())).rejects.toThrow(
      "artifact owner must be a non-empty OAuth subject"
    );
    await expect(read(bucket, "", crypto.randomUUID())).rejects.toThrow(
      "artifact owner must be a non-empty OAuth subject"
    );
    await expect(info(bucket, "   ", crypto.randomUUID())).rejects.toThrow(
      "artifact owner must be a non-empty OAuth subject"
    );
  });

  it("skips oversize puts without throwing", async () => {
    const bucket = new MemoryR2Bucket() as unknown as R2Bucket;
    const result = await put(
      bucket,
      "owner",
      input({ body: "x".repeat(ARTIFACT_MAX_BYTES + 1), mime: "text/plain; charset=utf-8" })
    );

    expect(result).toEqual({
      ok: false,
      skipped: "size-cap",
      bytes: ARTIFACT_MAX_BYTES + 1,
      maxBytes: ARTIFACT_MAX_BYTES
    });
  });

  it("writes complete provenance metadata without reading the body", async () => {
    const bucket = new MemoryR2Bucket() as unknown as R2Bucket;
    const written = await put(bucket, "owner", input());
    if (!written.ok) throw new Error("unexpected skip");

    const metadata = await info(
      bucket,
      "owner",
      written.artifact.id,
      new Date("2026-07-07T12:30:00.000Z")
    );
    expect(metadata).toEqual({ ok: true, artifact: written.artifact });
    if (!metadata.ok) throw new Error("expected info");
    expect(metadata.artifact).not.toHaveProperty("key");
    expect(metadata.artifact).toMatchObject({
      id: written.artifact.id,
      createdAt: "2026-07-07T12:00:00.000Z",
      expiresAt: "2026-07-14T12:00:00.000Z",
      bytes: input().body.length,
      mime: "application/json",
      requestId: "req-123",
      rayId: "ray-abc",
      capTokens: 6000,
      originalChars: 38,
      opLedger: JSON.stringify({
        calls: [{ op: "scout.getProject", status: "ok", ms: 42 }],
        total: 1,
        omitted: 0,
        totals: { ok: 1, error: 0, "soft-empty": 0 }
      }),
      catalogGeneratedAt: "2026-07-07T00:00:00.000Z"
    });
    expect(metadata.artifact.sha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it("caps op ledger metadata so >150-call artifacts still write under R2's metadata limit", async () => {
    const realBucket = new MemoryR2Bucket();
    const bucket = realBucket as unknown as R2Bucket;
    const ledger = largeLedger(180);
    const written = await put(bucket, "owner", input({ opLedger: ledger }));
    if (!written.ok) throw new Error("unexpected skip");

    const stored = [...realBucket.objects.values()][0];
    if (!stored) throw new Error("missing stored object");
    expect(artifactCustomMetadataByteLength(stored.customMetadata)).toBeLessThanOrEqual(
      ARTIFACT_CUSTOM_METADATA_MAX_BYTES
    );

    const preFixMetadata = {
      ...stored.customMetadata,
      opLedger: JSON.stringify(ledger)
    };
    expect(artifactCustomMetadataByteLength(preFixMetadata)).toBeGreaterThan(
      ARTIFACT_CUSTOM_METADATA_MAX_BYTES
    );

    const ledgerMetadata = stored.customMetadata.opLedger;
    if (!ledgerMetadata) throw new Error("missing opLedger metadata");
    const opLedger = JSON.parse(ledgerMetadata) as {
      calls: unknown[];
      total: number;
      omitted: number;
      totals: Record<string, number>;
    };
    expect(opLedger.calls).toHaveLength(12);
    expect(opLedger.total).toBe(180);
    expect(opLedger.omitted).toBe(168);
    expect(opLedger.totals).toEqual({ ok: 60, error: 60, "soft-empty": 60 });
  });

  it("stores redacted bytes clean when secrets require JSON escaping", async () => {
    const realBucket = new MemoryR2Bucket();
    const bucket = realBucket as unknown as R2Bucket;
    const secret = 'quote-"slash-\\-unicode-☃-secret';
    const escaped = JSON.stringify(secret).slice(1, -1);
    const redacted = redactSecrets(JSON.stringify({ raw: secret, nested: { again: secret } }), [
      secret
    ]);
    const written = await put(bucket, "owner", input({ body: redacted, mime: "application/json" }));
    if (!written.ok) throw new Error("unexpected skip");

    const stored = [...realBucket.objects.values()][0];
    if (!stored) throw new Error("missing stored object");
    expect(stored.body).not.toContain(secret);
    expect(stored.body).not.toContain(escaped);
    expect(stored.body).toContain("[REDACTED]");
  });

  it("makes missing, wrong-owner, expired, and invalid ids indistinguishable", async () => {
    const bucket = new MemoryR2Bucket() as unknown as R2Bucket;
    const written = await put(bucket, "owner", input());
    if (!written.ok) throw new Error("unexpected skip");
    const notFound = { ok: false, error: { kind: "not-found" } };

    await expect(read(bucket, "owner", crypto.randomUUID())).resolves.toEqual(notFound);
    await expect(read(bucket, "other-owner", written.artifact.id)).resolves.toEqual(notFound);
    await expect(
      read(bucket, "owner", written.artifact.id, new Date("2026-07-20T00:00:00.000Z"))
    ).resolves.toEqual(notFound);
    await expect(read(bucket, "owner", "../bad")).resolves.toEqual(notFound);
  });
});
