/**
 * The model family resolver (scripts/lib/model-family.mjs): version ordering, hidden and suffixed
 * entries, Claude alias pass-through, and fail-closed errors. Fixtures are hand-written; no test
 * reads a real ~/.codex or ~/.grok cache.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { resolveFamily, resolveFamilyDetail } from "../scripts/lib/model-family.mjs";

const SCRIPT = join(import.meta.dirname, "../scripts/latest-model.mjs");
const dirs = [];
afterAll(() => {
  while (dirs.length > 0) rmSync(dirs.pop(), { recursive: true, force: true });
});

function home(catalog, raw) {
  const dir = mkdtempSync(join(tmpdir(), "model-family-"));
  dirs.push(dir);
  writeFileSync(join(dir, "models_cache.json"), raw ?? JSON.stringify(catalog));
  return dir;
}

const codex = (slugs, fetched_at = "2026-01-01T00:00:00Z") => ({
  fetched_at,
  models: slugs.map(([slug, visibility = "list"]) => ({ slug, visibility })),
});
const grok = (entries) => ({
  models: Object.fromEntries(entries.map(([id, hidden = false]) => [id, { info: { id, hidden } }])),
});

describe("Claude families", () => {
  it.each(["sonnet", "opus", "fable"])("passes %s through as the CLI alias", (family) => {
    expect(resolveFamily(family, { codexHome: "/nonexistent", grokHome: "/nonexistent" })).toBe(family);
  });
});

describe("Codex families", () => {
  const codexHome = home(
    codex([
      ["gpt-6.2-sol"],
      ["gpt-6.10-sol"],
      ["gpt-6.1-sol"],
      ["gpt-7-sol", "hide"],
      ["gpt-6.2-astra"],
      ["gpt-6-astra"],
      ["gpt-6.1-terra"],
      ["gpt-6.1-terra-preview"],
      ["gpt-6-luna"],
    ]),
  );

  it("orders versions numerically, so 6.10 is above 6.2", () => {
    expect(resolveFamily("sol", { codexHome })).toBe("gpt-6.10-sol");
  });

  it("ignores hidden entries and suffixed variants", () => {
    expect(resolveFamily("sol", { codexHome })).not.toBe("gpt-7-sol");
    expect(resolveFamily("terra", { codexHome })).toBe("gpt-6.1-terra");
  });

  it("takes the newest of each family independently", () => {
    expect(resolveFamily("astra", { codexHome })).toBe("gpt-6.2-astra");
  });

  it("reports the catalog's fetched_at without reading anything else", () => {
    expect(resolveFamilyDetail("astra", { codexHome })).toEqual({
      id: "gpt-6.2-astra",
      fetchedAt: "2026-01-01T00:00:00Z",
    });
  });

  it("is case-insensitive on the family name", () => {
    expect(resolveFamily("Astra", { codexHome })).toBe("gpt-6.2-astra");
  });

  it("throws when the family has no visible model", () => {
    const only = home(codex([["gpt-6-sol", "hide"], ["gpt-6-luna"]]));
    expect(() => resolveFamily("sol", { codexHome: only })).toThrow(/no visible sol model/);
  });
});

describe("Grok family", () => {
  it("takes the highest plain version and skips suffixed and hidden entries", () => {
    const grokHome = home(
      grok([["grok-4.5"], ["grok-4.6"], ["grok-4.7"], ["grok-4.7-build-fast"], ["grok-4.8", true], ["grok-4.10"]]),
    );
    expect(resolveFamily("grok", { grokHome })).toBe("grok-4.10");
  });

  it("skips a hidden newest entry", () => {
    const grokHome = home(grok([["grok-4.6"], ["grok-4.7", true]]));
    expect(resolveFamily("grok", { grokHome })).toBe("grok-4.6");
  });
});

describe("fail closed", () => {
  it("throws on an unknown family without echoing it", () => {
    expect(() => resolveFamily("haiku")).toThrow(/unknown model family/);
    expect(() => resolveFamily("haiku")).not.toThrow(/haiku/);
  });

  it("throws on a missing cache", () => {
    expect(() => resolveFamily("sol", { codexHome: "/nonexistent-codex-home" })).toThrow(/missing or unreadable/);
    expect(() => resolveFamily("grok", { grokHome: "/nonexistent-grok-home" })).toThrow(/missing or unreadable/);
  });

  it("throws on an unparsable cache without echoing its content", () => {
    const bad = home(null, '{"api_key":"sk-not-a-real-key" nope');
    let message = "";
    try {
      resolveFamily("sol", { codexHome: bad });
    } catch (error) {
      message = error.message;
    }
    expect(message).toMatch(/not valid JSON/);
    expect(message).not.toContain("sk-not-a-real-key");
  });

  it("throws on a catalog of the wrong shape", () => {
    expect(() => resolveFamily("sol", { codexHome: home({ models: "x" }) })).toThrow(/no models list/);
    expect(() => resolveFamily("grok", { grokHome: home({ models: [] }) })).toThrow(/no models map/);
  });
});

describe("latest-model CLI", () => {
  const run = (args, env = {}) =>
    spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8", env: { PATH: process.env.PATH, ...env } });

  it("prints one ID and the fetch time on stderr", () => {
    const dir = home(codex([["gpt-6.2-astra"]], "2026-02-02T00:00:00Z"));
    const result = run(["astra"], { CODEX_HOME: dir });
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("gpt-6.2-astra\n");
    expect(result.stderr).toContain("2026-02-02T00:00:00Z");
  });

  it("exits non-zero with no stdout on failure", () => {
    const result = run(["sol"], { CODEX_HOME: "/nonexistent-codex-home" });
    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toMatch(/missing or unreadable/);
  });

  it("exits 2 on usage errors", () => {
    expect(run([]).status).toBe(2);
    expect(run(["sol", "extra"]).status).toBe(2);
  });
});
