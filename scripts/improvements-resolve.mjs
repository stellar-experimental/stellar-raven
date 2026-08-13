#!/usr/bin/env node
import { unlinkSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  GITHUB_REPO_RE,
  INTAKE_PATH,
  RESOLVED_PATH,
  oneLineTitle,
  parseFinding,
  readIntake,
  readResolved,
  resolveIntake,
  writeIndex,
} from "./improvements-lib.mjs";
import { writeFileAtomic } from "./lib/shared.mjs";

const RAVEN_REPO = "stellar-experimental/stellar-raven";
const githubRefRe = /https:\/\/github\.com\/[^/\s)]+\/[^/\s)]+\/(?:issues|pull)\/\d+/gi;
const githubRefExactRe = /^https:\/\/github\.com\/[^/\s)]+\/[^/\s)]+\/(?:issues|pull)\/\d+$/i;
const args = parseArgs(process.argv.slice(2));

if (!args.file || !args.liveRecheck || !args.reviewEvidence) {
  usage();
  process.exit(2);
}

const finding = parseFinding(path.resolve(args.file));
const { id, service, status, discovered } = finding.frontmatter;
if (status !== "fixed-upstream") {
  fail(`${id}: status must be fixed-upstream before resolution; got ${status}`);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(args.resolved)) {
  fail(`invalid --resolved date '${args.resolved}'; expected YYYY-MM-DD`);
}

const intake = readIntake();
const repo = args.repo ?? resolveRepo(finding, intake);
if (!GITHUB_REPO_RE.test(repo)) fail(`invalid repo '${repo}'; expected owner/repo`);

const sourceCommit = latestSourceCommit(finding.relPath);
if (!/^[0-9a-f]{40}$/.test(sourceCommit)) {
  fail(`${id}: finding must exist in git history before it can be resolved`);
}
const sourceUrl = `https://github.com/${RAVEN_REPO}/blob/${sourceCommit}/${finding.relPath}`;
const upstreamRefs = [...new Set(finding.raw.match(githubRefRe) ?? [])].sort();
const resolvingRefs = [...new Set(args.resolvingRefs.length ? args.resolvingRefs : upstreamRefs)].sort();
if (resolvingRefs.some((ref) => !githubRefExactRe.test(ref))) {
  fail("every --resolving-ref must be a GitHub issue or PR URL");
}

if (!args.referencesReviewed) {
  fail("pass --references-reviewed only after reconciling every repo-wide reference to the finding id");
}
if (upstreamRefs.length && !args.upstreamCommented) {
  fail("pass --upstream-commented only after posting the resolution result and immutable source permalink");
}
if (!upstreamRefs.length && !args.upstreamCommentNa) {
  fail("a finding without upstream refs requires --upstream-comment-na");
}

const ledger = readResolved();
ledger.entries ??= [];
if (ledger.entries.some((entry) => entry.id === id)) fail(`${id}: already exists in improvements/resolved.json`);

const entry = {
  id,
  title: oneLineTitle(finding),
  service,
  discovered,
  resolved: args.resolved,
  repo,
  upstreamRefs,
  resolvingRefs,
  liveRecheck: args.liveRecheck,
  reviewEvidence: args.reviewEvidence,
  sourceCommit,
  sourceUrl,
};

const resolutionComment = [
  `Raven independently rechecked ${id} on ${args.resolved} and confirmed the original trigger is resolved live.`,
  "",
  `Live recheck: ${args.liveRecheck}`,
  "",
  `The active finding is being retired under the ephemeral improvements lifecycle. Immutable source snapshot: ${sourceUrl}`,
].join("\n");

if (args.dryRun) {
  console.log(JSON.stringify(entry, null, 2));
  console.log("\n--- suggested upstream resolution comment ---\n");
  console.log(resolutionComment);
  process.exit(0);
}

// Authoritative order: the receipt lands first, then the intake override, then the active file,
// then the index. Each write replaces its destination atomically, so no single file is ever left
// truncated. That guarantee is per file only: it does not make this four-file sequence consistent
// across files. An interruption can leave the receipt written while the override, the active file,
// or the index still describe the finding as open. Every such residue is visible and repairable by
// hand, and each failure branch below prints the exact repair. The receipt is the record that must
// survive; a deleted finding with no receipt would not be.
ledger.entries.push(entry);
ledger.entries.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
writeFileAtomic(RESOLVED_PATH, `${JSON.stringify(ledger, null, 2)}\n`);

if (intake.findings?.[id]) {
  delete intake.findings[id];
  try {
    writeFileAtomic(INTAKE_PATH, `${JSON.stringify(intake, null, 2)}\n`);
  } catch (error) {
    console.error(`${id}: the resolved receipt is written, but improvements/intake.json still holds this finding's override, and the active finding ${finding.relPath} still exists.`);
    console.error(`  ${error.message}`);
    console.error("Do not re-run the resolver — it refuses a receipt that already exists.");
    console.error(`Forward repair: remove the ${id} override from improvements/intake.json, delete ${finding.relPath}, then run npm run improvements:index and npm run improvements:lint.`);
    process.exit(1);
  }
}

try {
  unlinkSync(finding.file);
} catch (error) {
  console.error(`${id}: the resolved receipt is written, but ${finding.relPath} was not deleted.`);
  console.error(`  ${error.message}`);
  console.error("Do not re-run the resolver — it refuses a receipt that already exists.");
  console.error(`Forward repair: delete ${finding.relPath}, then run npm run improvements:index and npm run improvements:lint.`);
  process.exit(1);
}

try {
  writeIndex();
} catch (error) {
  console.error(`${id}: the finding is retired, but improvements/INDEX.md was not regenerated.`);
  console.error(`  ${error.message}`);
  console.error("Do not re-run the resolver — it refuses a receipt that already exists.");
  console.error("Forward repair: run npm run improvements:index, then npm run improvements:lint.");
  process.exit(1);
}

console.log(`${id}: retired to improvements/resolved.json`);
console.log(sourceUrl);

function latestSourceCommit(relPath) {
  const result = spawnSync("git", ["log", "-1", "--format=%H", "--", relPath], { encoding: "utf8" });
  if (result.status !== 0) return "";
  return result.stdout.trim();
}

function resolveRepo(currentFinding, currentIntake) {
  const resolution = resolveIntake(currentFinding, currentIntake);
  if (resolution.kind === "repo") return resolution.repo;
  fail(`${currentFinding.frontmatter.id}: intake is ${resolution.kind}; pass --repo after manual owner triage`);
}

function parseArgs(argv) {
  const out = {
    dryRun: false,
    referencesReviewed: false,
    upstreamCommented: false,
    upstreamCommentNa: false,
    resolved: new Date().toISOString().slice(0, 10),
    resolvingRefs: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--file") out.file = argv[++i];
    else if (arg === "--repo") out.repo = argv[++i];
    else if (arg === "--resolved") out.resolved = argv[++i];
    else if (arg === "--live-recheck") out.liveRecheck = argv[++i];
    else if (arg === "--review-evidence") out.reviewEvidence = argv[++i];
    else if (arg === "--resolving-ref") out.resolvingRefs.push(argv[++i]);
    else if (arg === "--references-reviewed") out.referencesReviewed = true;
    else if (arg === "--upstream-commented") out.upstreamCommented = true;
    else if (arg === "--upstream-comment-na") out.upstreamCommentNa = true;
  }
  return out;
}

function usage() {
  console.error("usage: node scripts/improvements-resolve.mjs --file improvements/...md --live-recheck <evidence> --review-evidence <evidence> [--resolved YYYY-MM-DD] [--repo owner/name] [--resolving-ref URL ...] --references-reviewed (--upstream-commented | --upstream-comment-na) [--dry-run]");
}

function fail(message, code = 2) {
  console.error(message);
  process.exit(code);
}
