import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
// @ts-expect-error The operator script is intentionally plain Node ESM.
import { kvKey, parseArgs, run, tokenDigest } from "../scripts/mcp-key.mjs";

const dirs: string[] = [];

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

function wrangler(existing = false, listing: unknown = existing ? [{ name: kvKey("admin") }] : []) {
  const calls: string[][] = [];
  let writtenDigest: string | undefined;
  return {
    calls,
    get writtenDigest() {
      return writtenDigest;
    },
    run(args: string[]) {
      calls.push(args);
      if (args[2] === "list") {
        return {
          status: 0,
          stdout: JSON.stringify(listing),
          stderr: ""
        };
      }
      const pathIndex = args.indexOf("--path");
      if (pathIndex !== -1) writtenDigest = readFileSync(args[pathIndex + 1]!, "utf8");
      return { status: 0, stdout: "", stderr: "" };
    }
  };
}

describe("mcp-key operator command", () => {
  it("validates actions, names, and --out placement", () => {
    expect(parseArgs(["create", "admin"])).toMatchObject({ action: "create", name: "admin" });
    expect(parseArgs(["rotate", "devrel-2", "--out", "/tmp/key"])).toMatchObject({
      action: "rotate",
      name: "devrel-2",
      out: "/tmp/key"
    });
    for (const argv of [
      [],
      ["list", "admin"],
      ["create", "Admin"],
      ["create", "2admin"],
      ["revoke", "admin", "--out", "/tmp/key"],
      ["create", "admin", "--unknown"]
    ]) {
      expect(() => parseArgs(argv)).toThrow(/usage/);
    }
  });

  it("creates only missing keys with remote OAUTH_KV and a token digest", async () => {
    const fake = wrangler(false);
    const result = await run(["create", "admin"], { runWrangler: fake.run });
    expect(result.credential).toMatch(/^admin:[A-Za-z0-9_-]{43}$/);
    expect(fake.writtenDigest).toBe(tokenDigest(result.credential));
    expect(fake.calls).toHaveLength(2);
    for (const call of fake.calls) {
      expect(call).toContain("--binding");
      expect(call).toContain("OAUTH_KV");
      expect(call).toContain("--remote");
    }
    expect(fake.calls[1]).not.toContain(result.credential);

    await expect(run(["create", "admin"], { runWrangler: wrangler(true).run }))
      .rejects.toThrow(/already exists/);
  });

  it("requires an existing key for explicit rotation and revocation", async () => {
    await expect(run(["rotate", "admin"], { runWrangler: wrangler(false).run }))
      .rejects.toThrow(/does not exist/);
    await expect(run(["revoke", "admin"], { runWrangler: wrangler(false).run }))
      .rejects.toThrow(/does not exist/);

    const rotate = wrangler(true);
    expect((await run(["rotate", "admin"], { runWrangler: rotate.run })).credential)
      .toMatch(/^admin:[A-Za-z0-9_-]{43}$/);
    expect(rotate.calls[1]?.slice(0, 3)).toEqual(["kv", "key", "put"]);

    const revoke = wrangler(true);
    await expect(run(["revoke", "admin"], { runWrangler: revoke.run }))
      .resolves.toEqual({ message: 'Revoked API key "admin".' });
    expect(revoke.calls[1]).toEqual([
      "kv", "key", "delete", kvKey("admin"), "--binding", "OAUTH_KV", "--remote"
    ]);
  });

  it.each([
    ["object", { name: kvKey("admin") }],
    ["null", null],
    ["string", "invalid"]
  ])("rejects a malformed %s key listing before every mutation", async (_shape, listing) => {
    for (const action of ["create", "rotate", "revoke"]) {
      const fake = wrangler(false, listing);
      await expect(run([action, "admin"], { runWrangler: fake.run }))
        .rejects.toThrow(/invalid API key listing/);
      expect(fake.calls).toHaveLength(1);
      expect(fake.calls[0]?.slice(0, 3)).toEqual(["kv", "key", "list"]);
      expect(fake.calls.some((call) => call[2] === "put" || call[2] === "delete")).toBe(false);
    }
  });

  it("writes credentials with mode 0600 and does not return the token", async () => {
    const dir = await mkdtemp(join(tmpdir(), "raven-mcp-key-test-"));
    dirs.push(dir);
    const out = join(dir, "admin.credential");
    const result = await run(["create", "admin", "--out", out], {
      runWrangler: wrangler(false).run
    });
    expect(result).toEqual({ message: `Wrote credential to ${out}.` });
    expect((await stat(out)).mode & 0o777).toBe(0o600);
    expect(await readFile(out, "utf8")).toMatch(/^admin:[A-Za-z0-9_-]{43}\n$/);
    await expect(run(["create", "admin", "--out", out], {
      runWrangler: wrangler(false).run
    })).rejects.toMatchObject({ code: "EEXIST" });
  });
});
