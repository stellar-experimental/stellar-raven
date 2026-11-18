/**
 * Guard for the subscriptions-first rule (AGENTS.md "Spend and evidence"; eval/EVALS.md "Model-call
 * billing"). A code file outside the listed exceptions must not name a provider endpoint, an AI
 * Gateway token, the Playground chat route or an AI SDK import. It is a deny-list of strings: it
 * catches the obvious forms, not every API client.
 *
 * It scans code files, skill Markdown and GitHub Actions workflows only, skips the case-bearing paths that the `.ignore` files
 * name, and on failure prints a path and a pattern name, never a line.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO = join(import.meta.dirname, "..");

const CODE_FILE = /\.(?:mjs|js|cjs|ts|mts|sh)$/;
const SKILL_DOC = /^\.agents\/skills\/.*\.md$/;
const WORKFLOW = /^\.github\/workflows\/.*\.ya?ml$/;
const OUT_OF_SCOPE_DIRECTORIES = ["src/", "test/", "research/", ".agents/rounds/"];
// Case-bearing paths: each `.ignore` entry is anchored to its own folder.
const IGNORE_FILES = ["eval/.ignore", "eval/qa/.ignore"];

// An import or require of an AI SDK or of an `agents/models/` provider integration.
// `workers-ai-provider` is also a plain service ID in improvements/ scripts, so match only the
// import forms.
const SDK_MODULE = String.raw`(?:ai|@ai-sdk\/[^"']+|workers-ai-provider(?:\/[^"']*)?|agents\/models\/[^"']+)`;
const SDK_IMPORT = new RegExp(String.raw`(?:from\s*|import\s*\(?\s*|require\s*\(\s*)["']${SDK_MODULE}["']`);
const WORKERS_AI_RUN = /\bAI\.run\(/;

const PATTERNS = [
  ["gateway.ai.cloudflare.com", (text) => /gateway\.ai\.cloudflare\.com/.test(text)],
  ["CF_AIG_TOKEN", (text) => text.includes("CF_AIG_TOKEN")],
  ["cf-aig-", (text) => text.includes("cf-aig-")],
  ["AI.gateway(", (text) => text.includes("AI.gateway(")],
  ["AI.run(", (text) => WORKERS_AI_RUN.test(text)],
  [".gateway( with getLog", (text) => text.includes(".gateway(") && text.includes("getLog")],
  ["api.openai.com", (text) => /api\.openai\.com/.test(text)],
  ["api.anthropic.com", (text) => /api\.anthropic\.com/.test(text)],
  ["api.x.ai", (text) => /api\.x\.ai/.test(text)],
  ["openrouter.ai", (text) => /openrouter\.ai/.test(text)],
  ["/ai/run", (text) => text.includes("/ai/run")],
  ["playground/chat", (text) => text.includes("playground/chat")],
  ["DEMO_AI_GATEWAY_ID", (text) => text.includes("DEMO_AI_GATEWAY_ID")],
  ["AI SDK import", (text) => SDK_IMPORT.test(text)]
];

// Each entry names its exception in eval/EVALS.md "Model-call billing", or its reason.
const ALLOWLIST = new Map([
  // E1: the Playground semantic eval answers through the local /playground/chat route.
  ["scripts/run-playground-semantic-eval.mjs", "E1"],
  // E2: the Playground transport and tool-loop smoke test on the same route.
  ["scripts/run-demo-model-gauntlet.mjs", "E2"],
  // The artifact contract that E1 and E2 write and validate.
  ["eval/playground/artifact-contract.mjs", "E1/E2 contract"],
  // Reads AI Gateway logs through the Cloudflare API; makes no model call.
  [".agents/skills/cloudflare-observability-review/SKILL.md", "observability read"]
]);

function listFiles() {
  // Untracked files that git does not ignore count too, so a new script is caught before its commit.
  return execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    cwd: REPO,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024
  })
    .split("\0")
    .filter(Boolean);
}

function ignoredPrefixes() {
  return IGNORE_FILES.flatMap((file) => {
    const folder = file.slice(0, file.lastIndexOf("/") + 1);
    return readFileSync(join(REPO, file), "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((entry) => folder + entry.replace(/^\//, ""));
  });
}

function inScope(file, skipped) {
  if (OUT_OF_SCOPE_DIRECTORIES.some((directory) => file.startsWith(directory))) return false;
  if (skipped.some((prefix) => file === prefix || file.startsWith(prefix))) return false;
  return CODE_FILE.test(file) || SKILL_DOC.test(file) || WORKFLOW.test(file);
}

/** Pattern names that match each in-scope file outside the allowlist, plus stale allowlist entries. */
function findBillingProblems({ files, read, skipped = [], allowlist = ALLOWLIST }) {
  const unlisted = [];
  const matchedAllowlist = new Set();
  for (const file of files) {
    if (!inScope(file, skipped)) continue;
    const text = read(file);
    const names = PATTERNS.filter(([, test]) => test(text)).map(([name]) => name);
    if (!names.length) continue;
    if (allowlist.has(file)) matchedAllowlist.add(file);
    else unlisted.push({ file, patterns: names });
  }
  const stale = [...allowlist.keys()].filter((file) => !matchedAllowlist.has(file));
  return { unlisted, stale };
}

describe("model-call billing guard", () => {
  it("finds no model-call path outside the listed exceptions", () => {
    const { unlisted, stale } = findBillingProblems({
      files: listFiles(),
      read: (file) => readFileSync(join(REPO, file), "utf8"),
      skipped: ignoredPrefixes()
    });
    // Paths and pattern names only: never print a matching line.
    expect(
      unlisted.map(({ file, patterns }) => `${file}: ${patterns.join(", ")}`),
      "add the path to eval/EVALS.md 'Model-call billing' as an exception, or remove the call"
    ).toEqual([]);
    expect(stale, "an allowlist entry that no longer matches must be removed").toEqual([]);
  });

  it("detects each pattern in a planted file and reports the path and pattern only", () => {
    const planted = {
      "scripts/planted-gateway.mjs": 'fetch("https://gateway.ai.cloudflare.com/v1/a/b/openai")',
      "scripts/planted-token.mjs": "const token = process.env.CF_AIG_TOKEN;",
      "scripts/planted-header.mjs": 'headers["cf-aig-authorization"] = x;',
      "scripts/planted-binding.mjs": "await env.AI.gateway(id).run(input);",
      "scripts/planted-log.mjs": "const log = await ai.gateway(id).getLog(logId);",
      "scripts/planted-openai.mjs": 'fetch("https://api.openai.com/v1/responses")',
      "scripts/planted-anthropic.sh": "curl https://api.anthropic.com/v1/messages",
      "scripts/planted-xai.mjs": 'fetch("https://api.x.ai/v1/chat/completions")',
      "scripts/planted-openrouter.mjs": 'fetch("https://openrouter.ai/api/v1/chat/completions")',
      "scripts/planted-run.mjs": "`/accounts/${id}/ai/run/@cf/model`",
      "scripts/planted-route.mjs": 'fetch(base + "/playground/chat")',
      "scripts/planted-var.mjs": "env.DEMO_AI_GATEWAY_ID",
      "scripts/planted-ai.mjs": 'import { generateText } from "ai";',
      "scripts/planted-sdk.mjs": 'const { createOpenAI } = await import("@ai-sdk/openai");',
      "scripts/planted-provider.mjs": 'import { createWorkersAI } from "workers-ai-provider";',
      ".agents/skills/planted/SKILL.md": "POST https://api.openai.com/v1/responses",
      "scripts/planted-workers-ai.mjs": "const out = await env.AI.run(model, { prompt });",
      "scripts/planted-require.cjs": 'const { createOpenAI } = require("@ai-sdk/openai");',
      "scripts/planted-require-ai.cjs": "const ai = require('ai');",
      "scripts/planted-agents-models.mjs": 'import { aiSdkModel } from "agents/models/ai-sdk";',
      "scripts/planted-agents-opencode.mjs": 'const m = await import("agents/models/opencode");',
      ".github/workflows/planted.yml": "      - run: curl https://api.anthropic.com/v1/messages",
      ".github/workflows/planted.yaml": "      - run: curl -X POST https://api.x.ai/v1/chat/completions"
    };
    const { unlisted, stale } = findBillingProblems({
      files: Object.keys(planted),
      read: (file) => planted[file],
      allowlist: new Map()
    });
    expect(stale).toEqual([]);
    expect(unlisted.map(({ file }) => file)).toEqual(Object.keys(planted));
    expect(unlisted.every(({ patterns }) => patterns.length >= 1)).toBe(true);
    expect(Object.keys(unlisted[0]).sort()).toEqual(["file", "patterns"]);
  });

  it("does not flag a plain provider service ID, only an import of the SDK", () => {
    const { unlisted } = findBillingProblems({
      files: ["scripts/improvements-lib.mjs"],
      read: () => 'const services = ["workers-ai-provider", "ai-gateway"];\nconst note = "the ai package";\nconst runner = robot.run(1);',
      allowlist: new Map()
    });
    expect(unlisted).toEqual([]);
  });

  it("skips case-bearing paths and out-of-scope folders", () => {
    const text = 'fetch("https://api.openai.com/v1/responses")';
    const { unlisted } = findBillingProblems({
      files: [
        "src/demo/chat.ts",
        "test/model-call-billing.test.mjs",
        "research/audits/x/run.mjs",
        ".agents/rounds/x/run.mjs",
        "eval/qa/corpus/x/run.mjs",
        "eval/README.md"
      ],
      read: () => text,
      skipped: ["eval/qa/corpus/"],
      allowlist: new Map()
    });
    expect(unlisted).toEqual([]);
  });

  it("fails an allowlist entry that no longer matches", () => {
    const { stale } = findBillingProblems({
      files: ["scripts/clean.mjs"],
      read: () => "export {};",
      allowlist: new Map([["scripts/clean.mjs", "was E1"]])
    });
    expect(stale).toEqual(["scripts/clean.mjs"]);
  });
});
