#!/usr/bin/env node
/**
 * scan-secrets.mjs — zero-dependency secret guard (local pre-commit + CI backstop).
 *
 * Why this exists: this repo is public (since 2026-07-03), so GitHub's native
 * secret scanning + push protection are active on top (see
 * .github/secret_scanning.yml for the path exclusions). This engine is
 * defense-in-depth UNDER that — it catches a secret earlier and works
 * regardless of GitHub plan/visibility: (1) a pre-commit hook that blocks a
 * secret before it becomes a commit, and (2) a CI job that re-scans the tree
 * as a server-side backstop. No npm deps — runs with `node` alone (Node >= 24,
 * like the other scripts/*.mjs).
 *
 * Modes:
 *   --staged  (default)  scan only lines ADDED in the staged diff. Used by the
 *                        pre-commit hook. Also blocks staging .env / .dev.vars.
 *   --tree               scan all tracked files. Used by CI (which runs
 *                        `node scripts/scan-secrets.mjs --tree` directly) and
 *                        for a full local audit (npm run secrets:scan -- --tree).
 *
 * Detection layers (high precision — a noisy hook is a disabled hook):
 *   A. Env files must never be staged/tracked (belt-and-suspenders over .gitignore).
 *   B. Exact-match against the LIVE values in local .env / .dev.vars, if present.
 *      Catches THIS repo's real secrets without ever hardcoding them here. Public
 *      identifiers (application/client IDs, dev flags) are excluded — see PUBLIC_KEYS.
 *      In CI those files don't exist, so this layer no-ops and the regexes carry.
 *   C. High-signal token formats (private keys, PATs, provider keys, JWTs, Stellar
 *      secret seeds) — everywhere except vendored fixtures (IGNORE_GLOBS).
 *   D. keyword = "long secret-looking literal" — code/config files only (never .md
 *      or the eval corpus, which are full of documented public examples).
 *
 * Escape hatches: a line containing `secret-scan:allow` is skipped; literals in
 * KNOWN_PUBLIC (documented public values) never fire. Commit bypass (discouraged):
 * `git commit --no-verify`.
 *
 * Exit 0 = clean, 1 = findings, 2 = usage/internal error.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();

// Private aggregate data needs a separate boundary from credential patterns.
execFileSync(process.execPath, [join(ROOT, "scripts/check-private-usage.mjs"), process.argv.includes("--tree") ? "--tree" : "--staged"], { stdio: "inherit" });

// ── Config ──────────────────────────────────────────────────────────────────

// Env-var NAMES whose values are public identifiers, not secrets — excluded from
// layer B so e.g. the Algolia Application ID (VNSJF5AWIZ, in hostnames/docs by
// design) never trips the scanner.
const PUBLIC_KEYS = /(APPLICATION_ID|CLIENT_ID|DEV_ALLOW|_PUBLIC$|PUBLIC_)/i;

// Documented public values that appear in research docs on purpose. Belt over
// layer C/D so an edit to those docs never false-positives.
const KNOWN_PUBLIC = new Set([
  "VNSJF5AWIZ",                          // Algolia Application ID (public)
  "c932e7670879e29070e269d202fb6740",    // DocSearch search-only key (ships in docs.stellar.org)
  "yXtzs-p7TOyu9BQddSwV9g",              // Algolia-hosted MCP URL path token (documented non-secret)
]);

// Vendored fixtures / binaries: base64 blobs + example tokens live here (see
// eval/corpus/PROVENANCE.md). Excluded from format/keyword heuristics (layers
// C/D) — layers A/B still apply everywhere.
const IGNORE_GLOBS = [
  /^eval\/corpus\//,
  // Public per-case SHA-256 maps include ids ending in "auth"/"token";
  // line-oriented assignment heuristics otherwise misclassify those hashes.
  /^eval\/qa\/consistency-register\.json$/,
  /\.(gz|zip|tar|tgz|png|jpg|jpeg|gif|pdf|webp|ico|woff2?)$/i,
];

// Code/config extensions where layer D (keyword = long literal) is allowed.
const CODE_EXT = /\.(ts|tsx|js|mjs|cjs|json|jsonc|yml|yaml|toml|sh|bash|env|ini|cfg|conf)$/i;

// Layer C — high-signal token formats. Each: [label, regex].
const PATTERNS = [
  ["private key block", /-----BEGIN (?:RSA |EC |OPENSSH |PGP |DSA )?PRIVATE KEY-----/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
  ["Slack token", /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/],
  ["Google API key", /\bAIza[0-9A-Za-z_\-]{35}\b/],
  ["OpenAI/Anthropic-style key", /\b(?:sk|rk)-[A-Za-z0-9]{20,}\b/],
  ["AWS access key id", /\bAKIA[0-9A-Z]{16}\b/],
  ["JWT", /\beyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\b/],
  ["Stellar secret seed", /\bS[A-D][A-Z2-7]{54}\b/],
];

// Layer D — a secret-looking assignment. Keyword on the left, a long literal on
// the right. The value filter below rejects placeholders/env-refs.
const ASSIGN =
  /\b(api[_-]?key|secret|token|password|passwd|access[_-]?key|auth|credential|private[_-]?key)\b["'\s]*[:=]\s*["'`]([^"'`\n]{16,})["'`]/i;

const PLACEHOLDER =
  /^(x+|<|\$\{|process\.env|env\.|import\.meta|your[_-]|example|redacted|placeholder|changeme|todo|dummy|test|sample|fake|null|undefined|true|false)/i;

// ── Value filter (shared by layers B & D) ─────────────────────────────────────

const looksSecret = (v) =>
  v.length >= 12 &&
  !PLACEHOLDER.test(v) &&
  !KNOWN_PUBLIC.has(v) &&
  /[A-Za-z]/.test(v) && /[0-9]/.test(v) && // mixed alnum
  new Set(v).size > 4; // not "xxxxxxxx" / "AAAA..."

// ── Load live secret values from local env files (layer B) ────────────────────

function loadLiveSecrets() {
  const values = [];
  for (const f of [".env", ".dev.vars"]) {
    const p = `${ROOT}/${f}`;
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      const [, key, rawVal] = m;
      if (PUBLIC_KEYS.test(key)) continue;
      let v = rawVal.trim().replace(/^["']|["']$/g, "");
      if (looksSecret(v)) values.push({ key, value: v });
    }
  }
  return values;
}

// ── Collecting content to scan ────────────────────────────────────────────────

const isIgnored = (path) => IGNORE_GLOBS.some((re) => re.test(path));

// Staged mode: parse `git diff --cached -U0` → added lines with file + line no.
function stagedAdditions() {
  const out = execFileSync(
    "git",
    ["diff", "--cached", "--no-color", "-U0", "--diff-filter=ACM"],
    { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 },
  );
  const adds = [];
  let file = null,
    lineNo = 0;
  for (const line of out.split("\n")) {
    if (line.startsWith("+++ ")) {
      const p = line.slice(4).replace(/^b\//, "");
      file = p === "/dev/null" ? null : p;
    } else if (line.startsWith("@@")) {
      const m = line.match(/\+(\d+)/);
      lineNo = m ? parseInt(m[1], 10) : 0;
    } else if (line.startsWith("+") && !line.startsWith("+++")) {
      if (file) adds.push({ file, line: lineNo, text: line.slice(1) });
      lineNo++;
    }
  }
  return adds;
}

// Tree mode: every line of every tracked, non-binary, non-ignored file.
function treeLines() {
  const files = execFileSync("git", ["ls-files"], {
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
  })
    .split("\n")
    .filter(Boolean);
  const rows = [];
  for (const file of files) {
    const p = `${ROOT}/${file}`;
    let buf;
    try {
      buf = readFileSync(p);
    } catch {
      continue;
    }
    if (buf.includes(0)) continue; // binary
    const text = buf.toString("utf8");
    text.split("\n").forEach((t, i) => rows.push({ file, line: i + 1, text: t }));
  }
  return rows;
}

// Staged filenames (for layer A).
function stagedFiles() {
  return execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACM"], {
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);
}

// ── Scan ──────────────────────────────────────────────────────────────────────

function scan({ mode }) {
  const findings = [];
  const push = (f) => findings.push(f);

  // Layer A — env files must never enter git.
  const ENV_FILE = /(^|\/)(\.env|\.dev\.vars)(\..*)?$/;
  if (mode === "staged") {
    for (const f of stagedFiles())
      if (ENV_FILE.test(f)) push({ file: f, line: 0, kind: "env file staged", detail: "secret env files must never be committed" });
  } else {
    for (const f of execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n").filter(Boolean))
      if (ENV_FILE.test(f)) push({ file: f, line: 0, kind: "env file tracked", detail: "secret env file is committed to the repo" });
  }

  const live = loadLiveSecrets();
  const rows = mode === "staged" ? stagedAdditions() : treeLines();

  for (const { file, line, text } of rows) {
    if (/secret-scan:allow/.test(text)) continue;
    // Extension from the BASENAME's last dot — "" for dotless files (e.g.
    // scripts/git-hooks/pre-commit) so layer D still covers them; a dot in a
    // parent dir (foo.bar/baz) must not be mistaken for an extension.
    const base = file.slice(file.lastIndexOf("/") + 1);
    const dot = base.lastIndexOf(".");
    const ext = dot === -1 ? "" : base.slice(dot);

    // Layer B — live .env/.dev.vars values (applies to ALL file types).
    for (const s of live)
      if (text.includes(s.value)) push({ file, line, kind: `live secret (${s.key})`, detail: "value from your .env/.dev.vars appears here" });

    if (isIgnored(file)) continue;

    // Layer C — high-signal token formats.
    for (const [label, re] of PATTERNS) {
      const m = text.match(re);
      if (m && !KNOWN_PUBLIC.has(m[0])) push({ file, line, kind: label, detail: redact(m[0]) });
    }

    // Layer D — keyword = long literal (code/config only; skip docs/prose).
    if (CODE_EXT.test(ext) || ext === "") {
      const m = text.match(ASSIGN);
      if (m && looksSecret(m[2])) push({ file, line, kind: "secret-looking assignment", detail: `${m[1]} = ${redact(m[2])}` });
    }
  }
  return findings;
}

const redact = (s) => (s.length <= 8 ? "****" : `${s.slice(0, 4)}…${s.slice(-2)} (${s.length} chars)`);

// ── gitleaks upgrade path ─────────────────────────────────────────────────────
// If gitleaks is installed, run it too (broader ruleset). Non-fatal if absent.
function tryGitleaks(mode) {
  try {
    execFileSync("gitleaks", ["version"], { stdio: "ignore" });
  } catch {
    return null;
  }
  // Use the repo config so gitleaks honours the same generated-file allowlist
  // the custom layers already apply (see IGNORE_GLOBS). Without it the two
  // scanners disagree and gitleaks blocks on known-public content hashes.
  const configPath = join(ROOT, ".gitleaks.toml");
  const configArgs = existsSync(configPath) ? ["--config", configPath] : [];
  // Tree mode's full-tree coverage comes from the custom layers above; the
  // gitleaks backstop scans only the last commit. `gitleaks dir` would widen
  // it but drags in untracked files — including .env, whose real secrets must
  // never reach a scanner report — so the narrower git-mode invocation stays.
  const args = mode === "staged"
    ? ["git", "--staged", "--redact", ...configArgs]
    : ["git", "--redact", "--log-opts=-1 HEAD", ...configArgs];
  try {
    execFileSync("gitleaks", args, { cwd: ROOT, stdio: "inherit" });
    return true; // clean
  } catch {
    return false; // gitleaks found something (it printed its own report)
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
if (argv.includes("--help") || argv.includes("-h")) {
  console.log("Usage: node scripts/scan-secrets.mjs [--staged|--tree]\n  --staged  scan staged additions (default; used by pre-commit hook)\n  --tree    scan all tracked files (used by CI)");
  process.exit(0);
}
const mode = argv.includes("--tree") ? "tree" : "staged";

let findings;
try {
  findings = scan({ mode });
} catch (err) {
  console.error(`secret-scan: internal error — ${err.message}`);
  process.exit(2);
}

// Dedupe: same file+line+kind reported once (e.g. a value present in both .env
// and .dev.vars, or a pattern matching twice on a line).
findings = [...new Map(findings.map((f) => [`${f.file}:${f.line}:${f.kind}`, f])).values()];

const gl = tryGitleaks(mode);

if (findings.length === 0 && gl !== false) {
  const glNote = gl === true ? " (+ gitleaks)" : "";
  console.log(`secret-scan: clean${glNote} — scanned ${mode === "staged" ? "staged changes" : "all tracked files"}.`);
  process.exit(0);
}

if (findings.length) {
  console.error(`\n✖ secret-scan: ${findings.length} potential secret${findings.length > 1 ? "s" : ""} in ${mode === "staged" ? "staged changes" : "the tree"}:\n`);
  for (const f of findings) console.error(`  ${f.file}${f.line ? `:${f.line}` : ""}  [${f.kind}]  ${f.detail}`);
  console.error(`\n  If a hit is a false positive, append \`secret-scan:allow\` to that line, or add the literal to KNOWN_PUBLIC in scripts/scan-secrets.mjs.`);
  console.error(`  To bypass entirely (discouraged): git commit --no-verify\n`);
}
process.exit(1);
