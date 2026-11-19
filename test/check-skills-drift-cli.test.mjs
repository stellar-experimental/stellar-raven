import { execFile } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const REPO = resolve(import.meta.dirname, "..");
const definition = { id: "picked", owner: "o", repo: "r", path: "skills", ref: "release", mode: "pick", picks: ["one"] };
const source = { ...definition, type: "github", commit: "a".repeat(40), skills: [{ name: "one" }] };

const one = { title: "One", copyValue: "https://example.com/one", description: "Description." };
const two = { title: "Two", copyValue: "https://example.com/two", description: "Description." };

async function check({ mode = "pick", path = "skills", exclusions = {}, malformed = false, community = [one], markdown, communitySource, stellarlightSkills = [], stellarlightMeta } = {}) {
  const root = mkdtempSync(join(tmpdir(), "skills-drift-"));
  try {
    mkdirSync(join(root, "scripts", "lib"), { recursive: true });
    mkdirSync(join(root, "ecosystem-skills"));
    symlinkSync(join(REPO, "node_modules"), join(root, "node_modules"), "dir");
    copyFileSync(join(REPO, "scripts", "check-skills-drift.mjs"), join(root, "scripts", "check-skills-drift.mjs"));
    for (const name of ["shared", "skill-source-definitions", "stellar-community", "stellarlight-catalog"]) {
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
        } else if (parsed.pathname === '/api/skills') body = { ...( ${JSON.stringify(stellarlightMeta ?? null)} ? { meta: ${JSON.stringify(stellarlightMeta ?? null)} } : {}), skills: ${JSON.stringify(stellarlightSkills)} };
        else throw new Error('unexpected URL ' + url);
        return new Response(JSON.stringify(body));
      };
    `);
    return await new Promise((resolveRun) => {
      execFile(
        process.execPath,
        ["--import", mock, join(root, "scripts", "check-skills-drift.mjs"), "--json"],
        { encoding: "utf8" },
        (error, stdout, stderr) => {
          const status = error && typeof error.code === "number" ? error.code : error ? null : 0;
          resolveRun({ status, stdout, stderr });
        }
      );
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe("skills drift real CLI", () => {
  it.concurrent.each([{}, { picked: {} }])("reports a new sibling at the same commit with no exclusions: %j", async (exclusions) => {
    const result = await check({ exclusions });
    expect(result.status, result.stderr).toBe(1);
    expect(JSON.parse(result.stdout).results.find((entry) => entry.id === "picked")).toMatchObject({
      status: "DRIFT", note: expect.stringContaining("new-sibling")
    });
    expect(result.stdout).toContain("ecosystem-skills/sources.json");
    expect(result.stdout).not.toContain("pin them in ecosystem-skills/update.sh");
    expect(result.stderr).toContain("Source remediation:");
    expect(result.stderr).not.toContain("Directory remediation");
  });

  it.concurrent("accepts a recorded exclusion without inferring the mode from it", async () => {
    const result = await check({ exclusions: { picked: { "new-sibling": "out of scope" } } });
    expect(result.status, result.stderr).toBe(0);
  });

  it.concurrent.each([["all", "skills"], ["root", ""]])("does not enumerate %s sources even with exclusions", async (mode, path) => {
    const result = await check({ mode, path, malformed: true, exclusions: { picked: { ignored: "reason" } } });
    expect(result.status, result.stderr).toBe(0);
  });

  it.concurrent("supports cherry-picked skill directories at the repository root", async () => {
    const result = await check({ path: "." });
    expect(result.status, result.stderr).toBe(1);
    expect(result.stdout).toContain("new-sibling");
  });

  it.concurrent("reports an invalid directory response as a check error", async () => {
    const result = await check({ malformed: true });
    expect(result.status).toBe(2);
    expect(result.stdout).toContain("contents response has no directory array");
  });

  it.concurrent("accepts the reviewer's description bullet fixture through the real checker", async () => {
    const result = await check({ mode: "all", community: [{ ...one, description: "Description.\n- Supports wallets and contracts." }],
      markdown: "## Community Built\n- [One](https://example.com/one): Description.\n- Supports wallets and contracts." });
    expect(result.status, result.stderr).toBe(0);
  });

  it.concurrent.each(["-", "*", "+"])("detects the second entry when the generated listing uses %s", async (marker) => {
    const result = await check({ mode: "all", community: [one, two],
      markdown: `## Community Built\n- [One](https://example.com/one): Description.\n${marker} [Two](https://example.com/two): Description.` });
    expect(result.status, result.stderr).toBe(1);
    expect(JSON.parse(result.stdout).results.find((entry) => entry.id === "stellar-community-catalog")).toMatchObject({ status: "DRIFT", note: "added: https://example.com/two" });
    expect(result.stderr).toContain("Directory remediation (stellar-community-catalog):");
    expect(result.stderr).toContain("node scripts/refresh-skill-directories.mjs");
    expect(result.stderr).not.toContain("Source remediation:");
    expect(result.stderr).not.toContain("update.sh");
    expect(result.stderr).not.toContain("re-pin");
  });

  it.concurrent("routes stellarlight-catalog-only drift to directory remediation without update.sh", async () => {
    const result = await check({
      mode: "all",
      stellarlightSkills: [{ slug: "alpha", name: "Alpha", source: "community", kind: "skill-md" }],
    });
    expect(result.status, result.stderr).toBe(1);
    expect(JSON.parse(result.stdout).results.find((entry) => entry.id === "stellarlight-catalog")).toMatchObject({
      status: "DRIFT",
      note: "added: community/alpha",
    });
    expect(result.stderr).toContain("Directory remediation (stellarlight-catalog):");
    expect(result.stderr).toContain("node scripts/refresh-skill-directories.mjs");
    expect(result.stderr).not.toContain("Source remediation:");
    expect(result.stderr).not.toContain("update.sh");
    expect(result.stderr).not.toContain("re-pin");
  });

  it.concurrent("routes combined directory-only drift to the single directory refresh command", async () => {
    const result = await check({
      mode: "all",
      community: [one, two],
      stellarlightSkills: [{ slug: "alpha", name: "Alpha", source: "community", kind: "skill-md" }],
    });
    expect(result.status, result.stderr).toBe(1);
    expect(result.stderr).toContain("Directory remediation (stellar-community-catalog, stellarlight-catalog):");
    expect(result.stderr).toContain("node scripts/refresh-skill-directories.mjs");
    expect(result.stderr).not.toContain("Source remediation:");
    expect(result.stderr).not.toContain("update.sh");
    expect(result.stderr).not.toContain("re-pin");
  });

  it.concurrent("ignores description headings without truncating later identities", async () => {
    const community = [{ ...one, description: "Description.\n## Description heading" }];
    const markdown = "## Community Built\n- [One](https://example.com/one): Description.\n## Description heading";
    const [clean, drifted] = await Promise.all([
      check({ mode: "all", community, markdown }),
      check({ mode: "all", community: [...community, two],
        markdown: markdown + "\n- [Two](https://example.com/two): Description." })
    ]);
    expect(clean.status).toBe(0);
    expect(drifted.status, drifted.stderr).toBe(1);
    expect(drifted.stdout).toContain("added: https://example.com/two");
  });

  it.concurrent("labels both remediation paths when both kinds drift", async () => {
    const result = await check({ community: [one, two] });
    expect(result.status, result.stderr).toBe(1);
    expect(result.stderr).toContain("Source remediation:");
    expect(result.stderr).toContain("ecosystem-skills/update.sh");
    expect(result.stderr).toContain("ecosystem-skills/sources.json");
    expect(result.stderr).toContain("Directory remediation (stellar-community-catalog):");
    expect(result.stderr).toContain("node scripts/refresh-skill-directories.mjs");
  });

  // All reference-outside-declaration AST shapes are covered in test/stellar-community.test.mjs;
  // one CLI check here pins the end-to-end exit status and omitted remediation text.
  it.concurrent("rejects an external array reference through the real checker", async () => {
    const result = await check({ mode: "all", communitySource:
      `export const ECOSYSTEM_CARDS = [${JSON.stringify(one)}];\nECOSYSTEM_CARDS.push({ title: "Two", copyValue: "https://example.com/two" });` });
    expect(result.status, result.stderr).toBe(2);
    expect(JSON.parse(result.stdout).results.find((entry) => entry.id === "stellar-community-catalog"))
      .toMatchObject({ status: "error", note: "stellar community: ECOSYSTEM_CARDS reference outside its declaration" });
    expect(result.stderr).not.toContain("remediation:");
  });

  it.concurrent("reports labeled main source drift before a directory change deploys", async () => {
    const result = await check({ mode: "all", community: [one, two],
      markdown: "## Community Built\n- [One](https://example.com/one): Description." });
    expect(result.status, result.stderr).toBe(1);
    expect(JSON.parse(result.stdout).results.find((entry) => entry.id === "stellar-community-catalog"))
      .toMatchObject({ status: "DRIFT", source: "stellar/stellar-dev-skill main",
        upstream: "2 entries (stellar/stellar-dev-skill main source)", note: "added: https://example.com/two" });
    expect(result.stderr).toContain("Directory remediation (stellar-community-catalog): refresh the directory snapshots and index without moving pins.");
  });

  it.concurrent("rejects an unsupported second identity through the real checker", async () => {
    const result = await check({ mode: "all", communitySource:
      `export const ECOSYSTEM_CARDS = [${JSON.stringify(one)}, { title: getTitle(), copyValue: "https://example.com/two" }];` });
    expect(result.status, result.stderr).toBe(2);
    expect(result.stdout).toContain("expected literal title and copyValue");
    expect(result.stderr).not.toContain("remediation:");
  });

  it.concurrent("fails closed with exit 2 when stellarlight reports a non-live registry fallback", async () => {
    const result = await check({
      mode: "all",
      stellarlightMeta: { registry: { live: false } },
      stellarlightSkills: [],
    });
    expect(result.status, result.stderr).toBe(2);
    expect(JSON.parse(result.stdout).results.find((entry) => entry.id === "stellarlight-catalog")).toMatchObject({
      status: "error",
      note: expect.stringContaining("meta.registry.live is false"),
    });
    expect(result.stderr).not.toContain("remediation");
  });

  it.concurrent("fails closed when the Community array is empty", async () => {
    const result = await check({ mode: "all", community: [] });
    expect(result.status).toBe(2);
    expect(result.stdout).toContain("empty listing");
  });
});
