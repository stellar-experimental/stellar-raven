import { describe, expect, it } from "vitest";
import { assertNoNonExposedRefsInText } from "../scripts/emitted-text-guard.mjs";
import {
  SOURCE_BASIS_MANIFEST_MAX_CHARS,
  buildSourceBasisManifest,
  projectSourceBasisTelemetry,
  sanitizeCanonicalUrls,
  sourceBasisShapeFromValue,
  type BuildSourceBasisManifestInput,
  type SourceBasisCall,
  type SourceBasisShape,
  type SourceBasisTelemetry
} from "../src/policy/source-basis.ts";

const validObjectShape: SourceBasisShape = { kind: "object", serializedChars: 20, totalKeys: 2 };
const validArrayShape: SourceBasisShape = { kind: "array", serializedChars: 20, totalItems: 2 };
const validStringShape: SourceBasisShape = { kind: "string", serializedChars: 20, stringChars: 20 };

// @ts-expect-error Object shapes require totalKeys.
const objectWithoutTotalKeys: SourceBasisShape = { kind: "object", serializedChars: 20 };
// @ts-expect-error Array shapes require totalItems.
const arrayWithoutTotalItems: SourceBasisShape = { kind: "array", serializedChars: 20 };
// @ts-expect-error String shapes require stringChars.
const stringWithoutStringChars: SourceBasisShape = { kind: "string", serializedChars: 20 };
// @ts-expect-error Object shapes exclude counts from other variants.
const objectWithTotalItems: SourceBasisShape = { kind: "object", serializedChars: 20, totalKeys: 2, totalItems: 2 };
// @ts-expect-error Array shapes exclude counts from other variants.
const arrayWithStringChars: SourceBasisShape = { kind: "array", serializedChars: 20, totalItems: 2, stringChars: 20 };
// @ts-expect-error String shapes exclude counts from other variants.
const stringWithTotalKeys: SourceBasisShape = { kind: "string", serializedChars: 20, stringChars: 20, totalKeys: 2 };

function calls(count: number): SourceBasisCall[] {
  const outcomes = ["ok", "error", "soft-empty"] as const;
  return Array.from({ length: count }, (_, i) => ({
    op: `service.synthetic_operation_${String(i).padStart(3, "0")}_${"x".repeat(80)}`,
    outcome: outcomes[i % outcomes.length]!,
    ms: 10 + i
  }));
}

describe("source-basis manifest", () => {
  it("reports the required count for each shape variant and primitive fallback", () => {
    expect(validObjectShape).toEqual({ kind: "object", serializedChars: 20, totalKeys: 2 });
    expect(validArrayShape).toEqual({ kind: "array", serializedChars: 20, totalItems: 2 });
    expect(validStringShape).toEqual({ kind: "string", serializedChars: 20, stringChars: 20 });

    expect(sourceBasisShapeFromValue({ left: 1, right: 2 })).toMatchObject({ kind: "object", totalKeys: 2 });
    expect(sourceBasisShapeFromValue([1, 2, 3])).toMatchObject({ kind: "array", totalItems: 3 });
    expect(sourceBasisShapeFromValue("stellar")).toMatchObject({ kind: "string", stringChars: 7 });
    expect(sourceBasisShapeFromValue(123)).toMatchObject({ kind: "string" });
  });

  it("is deterministic for identical input bytes", () => {
    const input: BuildSourceBasisManifestInput = {
      shape: sourceBasisShapeFromValue({
        meta: { count: 2 },
        rows: Array.from({ length: 2_000 }, (_, i) => ({ id: i, value: "x".repeat(20) })),
        extra: "z".repeat(10_000)
      }),
      calls: calls(6),
      canonicalUrls: [
        "https://user:pass@example.test/path?a=1#frag",
        "http://ignored.test/path",
        "https://example.test/path?a=2"
      ],
      artifact: {
        state: "available",
        id: "artifact-123",
        sha256: "abcdef1234567890",
        bytes: 123456,
        expiresAt: "2026-07-14T00:00:00.000Z"
      }
    };

    const first = buildSourceBasisManifest(input);
    const second = buildSourceBasisManifest(input);
    expect(Buffer.from(first, "utf8")).toEqual(Buffer.from(second, "utf8"));
    expect(first).toContain("--- SOURCE BASIS ---");
    expect(first).toContain("codemode.artifact.read(id)");
  });

  it("enforces the hard budget on worst-case lists after serialization", () => {
    const wideObject = Object.fromEntries(
      Array.from({ length: 300 }, (_, i) => [`field_${String(i).padStart(3, "0")}`, "x".repeat(500)])
    );
    const text = buildSourceBasisManifest({
      shape: sourceBasisShapeFromValue(wideObject),
      calls: calls(250),
      canonicalUrls: Array.from(
        { length: 80 },
        (_, i) => `https://user:secret@example${i}.test/a/very/long/path/${"b".repeat(80)}?token=secret#frag`
      ),
      artifact: { state: "skipped", reason: `size-cap-${"x".repeat(500)}` }
    });

    expect(text.length).toBeLessThanOrEqual(SOURCE_BASIS_MANIFEST_MAX_CHARS);
    expect(text).toContain("calls:");
    expect(text).toContain("totals ok=");
    expect(text).toContain("canonicalUrls: data-derived/untrusted");
    expect(text).toContain("guidance:");
  });

  it("sanitizes canonical URLs as data-derived and untrusted", () => {
    const sanitized = sanitizeCanonicalUrls([
      "https://user:pass@example.test/path?secret=1#frag",
      "http://example.test/insecure",
      "not a url",
      "https://example.test/path?other=2",
      "https://example.test/path?dedupe=3",
      "https://second.test/a#frag"
    ]);

    expect(sanitized).toEqual(["https://example.test/path", "https://second.test/a"]);

    const text = buildSourceBasisManifest({
      shape: { kind: "array", serializedChars: 100, approxTokens: 25, totalItems: 3 },
      calls: [],
      canonicalUrls: [
        "https://user:pass@example.test/path?secret=1#frag",
        "http://example.test/insecure",
        "https://second.test/a?secret=1#frag"
      ],
      artifact: { state: "absent", reason: "oauth-only-or-not-truncated" }
    });
    expect(text).toContain("data-derived/untrusted");
    expect(text).toContain("https://example.test/path");
    expect(text).toContain("https://second.test/a");
    expect(text).not.toContain("user");
    expect(text).not.toContain("pass");
    expect(text).not.toContain("secret=");
    expect(text).not.toContain("#frag");
    expect(text).not.toContain("http://");
  });

  it("uses truncate.ts loss detail for generic shape summaries", () => {
    const shape = sourceBasisShapeFromValue({
      small: { ok: true },
      rows: Array.from({ length: 5_000 }, (_, i) => ({ i, pad: "x".repeat(25) })),
      tail: "y".repeat(20_000)
    });
    const text = buildSourceBasisManifest({ shape, calls: [], artifact: { state: "skipped", reason: "not-oauth" } });

    expect(text).toContain("shape: object");
    expect(text).toContain("top-level keys");
    expect(text).toContain("Bulk lost from top-level keys:");
    expect(text).toMatch(/\"rows\" ~\d+(\.\d+)?k chars \(cut\)/);
  });

  it("keeps template prose clear of non-exposed operation and retired-skill references", () => {
    const text = buildSourceBasisManifest({
      shape: { kind: "string", serializedChars: 10, approxTokens: 3, stringChars: 10 },
      calls: [],
      artifact: { state: "absent" }
    });

    expect(() => assertNoNonExposedRefsInText(text, "source-basis manifest template")).not.toThrow();
  });

  it("narrows guidance when the artifact is skipped or absent", () => {
    const base = {
      shape: { kind: "string" as const, serializedChars: 10, approxTokens: 3, stringChars: 10 },
      calls: []
    };

    const skipped = buildSourceBasisManifest({
      ...base,
      artifact: { state: "skipped", reason: "size-cap" }
    });
    const absent = buildSourceBasisManifest({
      ...base,
      artifact: { state: "absent", reason: "unavailable" }
    });

    expect(skipped).toContain("guidance: prefer a narrower re-run");
    expect(absent).toContain("guidance: prefer a narrower re-run");
    expect(skipped).not.toContain("codemode.artifact.read");
    expect(absent).not.toContain("codemode.artifact.read");
  });

  it("wires skillSectionAdvice into the source-basis guidance without changing the budget", () => {
    const text = buildSourceBasisManifest({
      shape: { kind: "string", serializedChars: 10, approxTokens: 3, stringChars: 10 },
      calls: calls(80),
      artifact: { state: "absent" },
      skillSectionAdvice: true
    });

    expect(text).toContain("return specific sections or aggregates, not whole skill bodies");
    expect(text.length).toBeLessThanOrEqual(SOURCE_BASIS_MANIFEST_MAX_CHARS);
  });
});

describe("source-basis telemetry", () => {
  it("projects bounded calls and excludes canonical URL values", () => {
    const input: BuildSourceBasisManifestInput = {
      shape: validObjectShape,
      calls: calls(15),
      canonicalUrls: ["https://sensitive.example/private-result"],
      artifact: { state: "available", id: "artifact-1", sha256: "abc", bytes: 3, expiresAt: "later" },
      skillSectionAdvice: true
    };

    const mcpTelemetry: SourceBasisTelemetry | null = projectSourceBasisTelemetry(input, 12);
    const demoTelemetry = projectSourceBasisTelemetry(input, 8);

    expect(mcpTelemetry).toMatchObject({
      shape: "object",
      calls: {
        total: 15,
        omitted: 3,
        totals: { ok: 5, error: 5, "soft-empty": 5 }
      },
      canonicalUrlCount: 1,
      artifactState: "available",
      skillSectionAdvice: true
    });
    expect(mcpTelemetry?.calls.first).toHaveLength(12);
    expect(demoTelemetry?.calls.first).toHaveLength(8);
    expect(demoTelemetry?.calls.omitted).toBe(7);
    expect(JSON.stringify(mcpTelemetry)).not.toContain("sensitive.example");
  });

  it("preserves null and absent-field defaults", () => {
    expect(projectSourceBasisTelemetry(undefined, 12)).toBeNull();
    expect(
      projectSourceBasisTelemetry(
        {
          shape: validStringShape,
          calls: []
        },
        8
      )
    ).toEqual({
      shape: "string",
      calls: {
        first: [],
        total: 0,
        omitted: 0,
        totals: { ok: 0, error: 0, "soft-empty": 0 }
      },
      canonicalUrlCount: 0,
      artifactState: "absent",
      skillSectionAdvice: false
    });
  });
});
