import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const REPO = resolve(import.meta.dirname, "..");
let root;
const definition = { id: "picked", owner: "o", repo: "r", path: "skills", ref: "release", mode: "pick", picks: ["one"] };
const source = { ...definition, type: "github", commit: "a".repeat(40), skills: [{ name: "one" }] };

const one = { title: "One", copyValue: "https://example.com/one", description: "Description." };
const two = { title: "Two", copyValue: "https://example.com/two", description: "Description." };

function check({ mode = "pick", path = "skills", exclusions = {}, malformed = false, community = [one], markdown, communitySource } = {}) {
  root = mkdtempSync(join(tmpdir(), "skills-drift-"));
  mkdirSync(join(root, "scripts", "lib"), { recursive: true });
  mkdirSync(join(root, "ecosystem-skills"));
  symlinkSync(join(REPO, "node_modules"), join(root, "node_modules"), "dir");
  copyFileSync(join(REPO, "scripts", "check-skills-drift.mjs"), join(root, "scripts", "check-skills-drift.mjs"));
  for (const name of ["shared", "skill-source-definitions", "stellar-community"]) {
    copyFileSync(join(REPO, "scripts", "lib", `${name}.mjs`), join(root, "scripts", "lib", `${name}.mjs`));
  }
  writeFileSync(join(root, "ecosystem-skills", "MANIFEST.json"), JSON.stringify({ sources: [{ ...source, path }] }));
  writeFileSync(join(root, "ecosystem-skills", "sources.json"), JSON.stringify([{ ...definition, mode, path, picks: mode === "all" ? [] : ["one"] }]));
  writeFileSync(join(root, "ecosystem-skills", "groups.json"), JSON.stringify({ unpinnedUpstream: exclusions }));
  writeFileSync(join(root, "ecosystem-skills", "catalog.json"), JSON.stringify({ entries: [] }));
  writeFileSync(join(root, "ecosystem-skills", "community.json"), JSON.stringify({ fetched_at: "date", entries: [{ title: "One", url: "https://example.com/one" }] }));
  const mock = join(root, "mock.mjs");
  writeFileSync(mock, `
    globalThis.fetch = async (url) => {
      const parsed = new URL(url);
      let body;
      if (parsed.pathname.endsWith('/commits')) body = [{ sha: '${source.commit}' }];
      else if (parsed.pathname.includes('/contents')) {
        if (parsed.searchParams.get('ref') !== 'release') throw new Error('contents ignored source ref');
        body = ${malformed ? "{}" : JSON.stringify([{ type: "dir", name: "one" }, { type: "dir", name: "new-sibling" }, { type: "file", name: "README.md" }])};
      } else if (parsed.href === 'https://raw.githubusercontent.com/stellar/stellar-dev-skill/main/site/src/data/skills.ts') {
        return new Response(${JSON.stringify(communitySource ?? ('export const ECOSYSTEM_CARDS = ' + JSON.stringify(community) + ' as const;'))});
      } else if (parsed.hostname === 'skills.stellar.org') {
        return new Response(${JSON.stringify(markdown ?? '')});
      } else if (parsed.pathname === '/api/skills') body = { skills: [] };
      else throw new Error('unexpected URL ' + url);
      return new Response(JSON.stringify(body));
    };
  `);
  return spawnSync(process.execPath, ["--import", mock, join(root, "scripts", "check-skills-drift.mjs"), "--json"], { encoding: "utf8" });
}

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = undefined;
});

describe("skills drift real CLI", () => {
  it.each([{}, { picked: {} }])("reports a new sibling at the same commit with no exclusions: %j", (exclusions) => {
    const result = check({ exclusions });
    expect(result.status, result.stderr).toBe(1);
    expect(JSON.parse(result.stdout).results.find((entry) => entry.id === "picked")).toMatchObject({
      status: "DRIFT", note: expect.stringContaining("new-sibling")
    });
    expect(result.stdout).toContain("ecosystem-skills/sources.json");
    expect(result.stdout).not.toContain("pin them in ecosystem-skills/update.sh");
    expect(result.stderr).toContain("Source remediation:");
    expect(result.stderr).not.toContain("Community remediation:");
  });

  it("accepts a recorded exclusion without inferring the mode from it", () => {
    const result = check({ exclusions: { picked: { "new-sibling": "out of scope" } } });
    expect(result.status, result.stderr).toBe(0);
  });

  it.each([["all", "skills"], ["root", ""]])("does not enumerate %s sources even with exclusions", (mode, path) => {
    const result = check({ mode, path, malformed: true, exclusions: { picked: { ignored: "reason" } } });
    expect(result.status, result.stderr).toBe(0);
  });

  it("supports cherry-picked skill directories at the repository root", () => {
    const result = check({ path: "." });
    expect(result.status, result.stderr).toBe(1);
    expect(result.stdout).toContain("new-sibling");
  });

  it("reports an invalid directory response as a check error", () => {
    const result = check({ malformed: true });
    expect(result.status).toBe(2);
    expect(result.stdout).toContain("contents response has no directory array");
  });

  it("accepts the reviewer's description bullet fixture through the real checker", () => {
    const result = check({ mode: "all", community: [{ ...one, description: "Description.\n- Supports wallets and contracts." }],
      markdown: "## Community Built\n- [One](https://example.com/one): Description.\n- Supports wallets and contracts." });
    expect(result.status, result.stderr).toBe(0);
  });

  it.each(["-", "*", "+"])("detects the second entry when the generated listing uses %s", (marker) => {
    const result = check({ mode: "all", community: [one, two],
      markdown: `## Community Built\n- [One](https://example.com/one): Description.\n${marker} [Two](https://example.com/two): Description.` });
    expect(result.status, result.stderr).toBe(1);
    expect(JSON.parse(result.stdout).results.find((entry) => entry.id === "stellar-community-catalog")).toMatchObject({ status: "DRIFT", note: "added: https://example.com/two" });
    expect(result.stderr).toContain("Community remediation:");
    expect(result.stderr).toContain("node scripts/lib/stellar-community.mjs ecosystem-skills/community.json");
    expect(result.stderr).toContain("node ecosystem-skills/build-index.mjs");
    expect(result.stderr).not.toContain("Source remediation:");
    expect(result.stderr).not.toContain("re-pin");
  });

  it("ignores description headings without truncating later identities", () => {
    const community = [{ ...one, description: "Description.\n## Description heading" }];
    const markdown = "## Community Built\n- [One](https://example.com/one): Description.\n## Description heading";
    expect(check({ mode: "all", community, markdown }).status).toBe(0);
    rmSync(root, { recursive: true, force: true });
    const result = check({ mode: "all", community: [...community, two],
      markdown: markdown + "\n- [Two](https://example.com/two): Description." });
    expect(result.status, result.stderr).toBe(1);
    expect(result.stdout).toContain("added: https://example.com/two");
  });

  it("labels both remediation paths when both kinds drift", () => {
    const result = check({ community: [one, two] });
    expect(result.status, result.stderr).toBe(1);
    expect(result.stderr).toContain("Source remediation:");
    expect(result.stderr).toContain("ecosystem-skills/update.sh");
    expect(result.stderr).toContain("ecosystem-skills/sources.json");
    expect(result.stderr).toContain("Community remediation:");
    expect(result.stderr).toContain("node scripts/lib/stellar-community.mjs ecosystem-skills/community.json");
    expect(result.stderr).toContain("node ecosystem-skills/build-index.mjs");
  });

  it.each([
    'ECOSYSTEM_CARDS.push({ title: "Two", copyValue: "https://example.com/two" });',
    'ECOSYSTEM_CARDS[0].title = "Renamed";',
    'const alias = ECOSYSTEM_CARDS; alias.push({ title: "Two", copyValue: "https://example.com/two" });',
  ])("rejects an external array reference through the real checker: %s", (suffix) => {
    const result = check({ mode: "all", communitySource:
      `export const ECOSYSTEM_CARDS = [${JSON.stringify(one)}];\n${suffix}` });
    expect(result.status, result.stderr).toBe(2);
    expect(JSON.parse(result.stdout).results.find((entry) => entry.id === "stellar-community-catalog"))
      .toMatchObject({ status: "error", note: "stellar community: ECOSYSTEM_CARDS reference outside its declaration" });
    expect(result.stderr).not.toContain("remediation:");
  });

  it("reports labeled main source drift before a directory change deploys", () => {
    const result = check({ mode: "all", community: [one, two],
      markdown: "## Community Built\n- [One](https://example.com/one): Description." });
    expect(result.status, result.stderr).toBe(1);
    expect(JSON.parse(result.stdout).results.find((entry) => entry.id === "stellar-community-catalog"))
      .toMatchObject({ status: "DRIFT", source: "stellar/stellar-dev-skill main",
        upstream: "2 entries (stellar/stellar-dev-skill main source)", note: "added: https://example.com/two" });
    expect(result.stderr).toContain("Community remediation: refresh the stellar/stellar-dev-skill main directory snapshot and index.");
  });

  it("rejects an unsupported second identity through the real checker", () => {
    const result = check({ mode: "all", communitySource:
      `export const ECOSYSTEM_CARDS = [${JSON.stringify(one)}, { title: getTitle(), copyValue: "https://example.com/two" }];` });
    expect(result.status, result.stderr).toBe(2);
    expect(result.stdout).toContain("expected literal title and copyValue");
    expect(result.stderr).not.toContain("remediation:");
  });

  it("fails closed when the Community array is empty", () => {
    const result = check({ mode: "all", community: [] });
    expect(result.status).toBe(2);
    expect(result.stdout).toContain("empty listing");
  });
});
