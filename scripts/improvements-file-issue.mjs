#!/usr/bin/env node
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  GITHUB_REPO_RE,
  oneLineTitle,
  parseFinding,
  readIntake,
  resolveIntake,
  section,
  writeFindingFrontmatter,
} from "./improvements-lib.mjs";

const args = parseArgs(process.argv.slice(2));
// Canonical whole-ref match, so a successor ref is compared as a ref and never as a substring of
// one: `issues/2` must not "match" `issues/2593`. The trailing class excludes letters, `_` and `-`
// as well as digits — a digits-only lookahead still parsed the malformed `issues/99evil` as issue
// 99, which would let a token that is not a real ref satisfy the guard.
const GITHUB_REF_RE = /https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/(?:issues|pull)\/\d+(?![\w-])/g;
const RAVEN_REPO = "stellar-experimental/stellar-raven";
const HANDOFF_TEMPLATE = "upstream-improvement-ready.yml";
const AUTOMATION_MARKER = "<!-- generated-by-stellar-raven -->";
const AUTOMATION_NOTICE =
  `This issue was filed from [Stellar Raven](https://github.com/${RAVEN_REPO})'s automated evaluation pipeline. Evidence and a public source record are included below. The finding may still be incomplete or incorrect — please verify against the live surface before acting on it.`;
if (!args.file) {
  console.error("usage: node scripts/improvements-file-issue.mjs --file improvements/...md [--repo owner/name] [--dry-run] [--render-body-file /tmp/body.md]");
  process.exit(2);
}

const finding = parseFinding(path.resolve(args.file));
const repo = args.repo ?? resolveRepo(finding);
if (!GITHUB_REPO_RE.test(repo)) {
  console.error(`invalid repo '${repo}'; expected owner/repo`);
  process.exit(2);
}
const title = issueTitle(finding);
const body = renderBody(finding);

if (args.dryRun) {
  console.log(`# ${title}\n\n${body}`);
  process.exit(0);
}

if (args.renderBodyFile) {
  writeFileSync(args.renderBodyFile, body);
  console.log(args.renderBodyFile);
  process.exit(0);
}

// A finding outside the repository has no public source record, so filing it points a public issue
// at a path only the filer's machine can see. `path.relative` does not fail on an out-of-tree path
// — it walks up with `../` until it reaches — and `renderBody` joins that onto a blob URL, so the
// link is dead by construction. That is how a `mktemp` test fixture became
// stellar/stellar-docs#2716 (reported in stellar-experimental/stellar-raven#4).
//
// The gate sits AFTER --dry-run and --render-body-file deliberately: inspecting the body of an
// out-of-tree finding is useful and posts nothing. Only the path that writes to a public
// repository fails closed.
if (finding.relPath.split(path.sep)[0] === "..") {
  console.error(`${finding.frontmatter.id}: ${args.file} resolves outside the repository`);
  console.error(`Its source record would render as ${finding.relPath}, which is not a repo path.`);
  console.error("Use --dry-run to inspect the body without posting.");
  process.exit(2);
}

// The dedupe guard and the lint's "a cited GitHub URL implies a filing" rule are both correct,
// but together they deadlock one real case: a finding that WAS filed, whose issue then closed
// covering something else, and whose residual now needs a fresh report. It cannot stay
// reported-upstream (the filer refuses) and it cannot drop to verified (the lint refuses).
// --successor-to is the narrow way through, and every clause below is load-bearing. The first
// version of this guard was substring-only over the whole evidence list, which meant
// `--successor-to https` satisfied it for any finding citing any URL — including declined and
// fixed ones the lifecycle says must never be re-filed. That was a duplicate-filing hole, not a
// containment.
if (["reported-upstream", "declined-upstream", "fixed-upstream"].includes(finding.frontmatter.status)) {
  // declined and fixed are never re-filable. Declined means an owner said no and the pipeline
  // says do not pester; fixed means there is nothing left to report. Only a live report that
  // closed without covering its finding can have a successor.
  if (finding.frontmatter.status !== "reported-upstream") {
    console.error(
      `${finding.frontmatter.id}: status is ${finding.frontmatter.status}; this finding is not re-filable`,
    );
    console.error("declined-upstream and fixed-upstream are terminal for filing — do not re-file them.");
    process.exit(2);
  }
  if (!args.successorTo) {
    console.error(
      `${finding.frontmatter.id}: status is ${finding.frontmatter.status}; dedupe and live-recheck before filing a new issue`,
    );
    console.error("If the cited report closed without covering this finding, pass --successor-to <that issue/PR URL>.");
    console.error("Use --dry-run or --render-body-file to inspect the issue body without posting.");
    process.exit(2);
  }
  // EXACT match against canonical refs parsed out of the evidence — not a substring of the raw
  // text. Substring matching accepted a bare scheme, and `issues/2` also "matches" `issues/2593`.
  const citedRefs = new Set(
    (finding.frontmatter.evidence ?? []).flatMap((entry) => String(entry).match(GITHUB_REF_RE) ?? []),
  );
  if (!citedRefs.has(args.successorTo)) {
    console.error(
      `${finding.frontmatter.id}: --successor-to ${args.successorTo} is not an exact issue/PR ref recorded in this finding's evidence`,
    );
    console.error(`recorded refs: ${[...citedRefs].join(", ") || "(none)"}`);
    process.exit(2);
  }
  // The superseded report must live in the repo we are filing into. Without this, a closed ref in
  // ANY cited repo would authorise a new issue in a DIFFERENT one — a finding citing several
  // upstreams could be used to open an issue somewhere that never had a predecessor at all. A
  // successor supersedes a report where that report actually lives; anything else is a new finding.
  const successorRepo = args.successorTo.split("/").slice(3, 5).join("/");
  if (successorRepo !== repo) {
    console.error(
      `${finding.frontmatter.id}: --successor-to points at ${successorRepo} but this filing targets ${repo}`,
    );
    console.error("A successor must supersede a report in the same repository it is filed into.");
    process.exit(2);
  }
  // A ref that is still OPEN has an owner tracking it, so a second issue is a duplicate by
  // definition. Read live state rather than trusting the caller — this is the condition the whole
  // flag exists to assert, so it is the one thing not taken on faith.
  const state = readIssueState(args.successorTo);
  if (state !== "closed") {
    console.error(
      `${finding.frontmatter.id}: --successor-to ${args.successorTo} is ${state}; only a CLOSED report can have a successor`,
    );
    console.error("An open report already has an owner — follow up there instead of filing a duplicate.");
    process.exit(2);
  }
  // Checking only the NAMED ref is not dedupe. Once a successor has been filed it joins the
  // evidence, so the finding can cite an old closed report AND a live open one — and naming the
  // old one again would open a third issue while the second is still being worked. Every recorded
  // ref must be closed before another is opened.
  for (const ref of citedRefs) {
    if (ref === args.successorTo) continue;
    // Require a confident "closed", exactly as for the named ref. Blocking only on literal
    // "open" would let an UNREADABLE sibling through — a transient gh failure, a deleted or
    // private ref, or junk output — and an unreadable live report is not evidence that it closed.
    // This is the same fail-open shape that was just repaired above; it must not survive here.
    const refState = readIssueState(ref);
    if (refState !== "closed") {
      console.error(`${finding.frontmatter.id}: recorded ref ${ref} is ${refState}, not closed`);
      console.error(
        refState === "open"
          ? "This finding already has a live report. Follow up there rather than filing another successor."
          : "Could not prove that report is closed, so a successor cannot be authorised. Re-check it by hand.",
      );
      process.exit(2);
    }
  }
}

const dir = mkdtempSync(path.join(tmpdir(), "improvement-issue-"));
const bodyFile = path.join(dir, "body.md");
writeFileSync(bodyFile, body);

const issueArgs = [
  "issue",
  "create",
  "--repo",
  repo,
  "--title",
  title,
  "--body-file",
  bodyFile,
];
if (repoHasLabel(repo, "raven")) issueArgs.push("--label", "raven");
const result = spawnSync("gh", issueArgs, { encoding: "utf8" });

if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.stderr.write(result.stdout);
  process.exit(result.status ?? 1);
}

function resolveRepo(finding) {
  const resolution = resolveIntake(finding, readIntake());
  if (resolution.kind === "repo") return resolution.repo;
  if (resolution.kind === "unclear") {
    console.error(`${finding.frontmatter.id}: intake is unclear (${resolution.reason}); pass --repo only after manual triage`);
    process.exit(2);
  }
  if (resolution.kind === "mixed") {
    console.error(`${finding.frontmatter.id}: intake is mixed (${resolution.reason}); add a finding override or pass --repo after manual triage`);
    process.exit(2);
  }
  console.error(`${finding.frontmatter.id}: intake unresolved (${resolution.reason}); update improvements/intake.json`);
  process.exit(2);
}

function repoHasLabel(repo, label) {
  const result = spawnSync("gh", ["label", "list", "--repo", repo, "--search", label, "--json", "name", "--jq", `map(select(.name == \"${label}\")) | length`], {
    encoding: "utf8",
  });
  return result.status === 0 && Number(result.stdout.trim()) > 0;
}

const url = result.stdout.trim();
const verify = spawnSync("gh", ["issue", "view", url, "--json", "url", "--jq", ".url"], {
  encoding: "utf8",
});
if (verify.status !== 0 || verify.stdout.trim() !== url) {
  process.stderr.write(verify.stderr ?? "");
  console.error(`issue was created at ${url}, but GitHub read-back failed; local finding was not mutated`);
  process.exit(1);
}
console.log(url);
writeFindingFrontmatter(finding, {
  status: "reported-upstream",
  evidenceAppend: `upstream issue filed ${new Date().toISOString().slice(0, 10)}: ${url}`,
});
const indexResult = spawnSync(process.execPath, [path.join(import.meta.dirname, "improvements-index.mjs")], {
  encoding: "utf8",
});
if (indexResult.status !== 0) {
  process.stderr.write(indexResult.stderr);
  process.stderr.write(indexResult.stdout);
  console.error("issue was filed and the finding was updated, but improvements/INDEX.md regeneration failed");
  process.exit(indexResult.status ?? 1);
}

function renderBody(finding) {
  const fm = finding.frontmatter;
  const sourceUrl = `https://github.com/${RAVEN_REPO}/blob/main/${finding.relPath}`;
  const sourceCommit = latestMatchingSourceCommit(finding);
  const immutableSourceUrl = sourceCommit
    ? `https://github.com/${RAVEN_REPO}/blob/${sourceCommit}/${finding.relPath}`
    : null;
  const handoffUrl = `https://github.com/${RAVEN_REPO}/issues/new?template=${HANDOFF_TEMPLATE}&title=${encodeURIComponent(`[upstream-ready] ${fm.id}: `)}`;
  return [
    AUTOMATION_MARKER,
    "",
    "> [!NOTE]",
    `> **Automated notice:** ${AUTOMATION_NOTICE}`,
    "",
    "## Finding",
    "",
    scrub(section(finding.body, "Finding")),
    "",
    "## Evidence",
    "",
    scrub(section(finding.body, "Evidence")),
    "",
    "Additional recorded evidence:",
    "",
    ...fm.evidence.map((entry) => scrub(entry)).filter(Boolean).map((entry) => `- ${entry}`),
    "",
    "## Recommendation",
    "",
    scrub(section(finding.body, "Recommendation")),
    "",
    "## Source Record",
    "",
    `This was found by the downstream Raven eval/improvements loop and recorded as ${fm.id} (${fm.service}, discovered ${fm.discovered}).`,
    "",
    `Public source record: [${finding.relPath}](${sourceUrl})`,
    ...(immutableSourceUrl ? ["", `Immutable source snapshot: [${sourceCommit.slice(0, 12)}](${immutableSourceUrl})`] : []),
    "",
    "## Resolution Handoff",
    "",
    "When a fix is deployed, please link the resolving issue or PR to the source record above and notify Raven through:",
    "",
    handoffUrl,
    "",
    "Include the finding id, resolving issue/PR, deployed version or timestamp, and the smallest live recheck. Raven independently verifies the upstream surface before changing the finding to `fixed-upstream`; issue closure or a merged PR alone is not treated as proof. After a distinct reviewer repeats the live check, the active finding is retired to Raven's resolved ledger; a commit-pinned snapshot is preserved when available.",
    "",
  ].join("\n");
}

function latestMatchingSourceCommit(finding) {
  const result = spawnSync("git", ["log", "-1", "--format=%H", "--", finding.relPath], {
    encoding: "utf8",
  });
  const commit = result.status === 0 ? result.stdout.trim() : "";
  if (!commit) return "";
  const blob = spawnSync("git", ["show", `${commit}:${finding.relPath}`], {
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
  return blob.status === 0 && blob.stdout === finding.raw ? commit : "";
}

function issueTitle(finding) {
  const explicit = String(finding.frontmatter.upstreamTitle ?? "").trim();
  if (explicit) {
    if (explicit.length < 20 || explicit.length > 120) {
      console.error(`${finding.frontmatter.id}: upstreamTitle must be 20-120 characters`);
      process.exit(2);
    }
    return explicit;
  }
  if (["proposed", "verified"].includes(finding.frontmatter.status)) {
    console.error(
      `${finding.frontmatter.id}: add a reader-first upstreamTitle (20-120 characters) before filing`,
    );
    process.exit(2);
  }
  // Historical reported records predate upstreamTitle; keep dry-run rendering available.
  return `${finding.frontmatter.id}: ${oneLineTitle(finding)}`;
}

function scrub(text) {
  return String(text)
    .split("\n")
    .filter((line) => !/\b(Solo|scratchpad|todo \d+|(?:workflow\s+)?wf_[\w-]+|comment \d+)/i.test(line))
    .join("\n")
    .replace(/solo:\/\/\S+/gi, "[internal coordination record]")
    .replace(/\/Users\/[^\s)]+/g, "[local path elided]");
}

// Live state of a GitHub issue/PR, read-only. Returns "open" | "closed" | "unknown". Anything
// other than a confident "closed" must block the successor path: an unreadable ref is not
// evidence that the report closed, and this guard exists to stop a duplicate filing.
function readIssueState(url) {
  // Fail CLOSED, in the safety sense: only the literal strings GitHub actually returns count.
  // An earlier draft mapped "anything that isn't 'open'" to closed, which meant empty or junk
  // stdout on a zero exit read as "closed" and ALLOWED the filing — precisely backwards for a
  // guard whose whole job is to refuse when it cannot prove closure.
  const classify = (raw) => {
    const state = String(raw).trim().toLowerCase();
    if (state === "open") return "open";
    if (state === "closed" || state === "merged") return "closed";
    return "unknown";
  };
  const asIssue = spawnSync("gh", ["issue", "view", url, "--json", "state", "--jq", ".state"], {
    encoding: "utf8",
  });
  if (asIssue.status === 0) {
    const state = classify(asIssue.stdout);
    if (state !== "unknown") return state;
  }
  // Fall back to the PR endpoint — `--successor-to` accepts a pull ref too.
  const asPr = spawnSync("gh", ["pr", "view", url, "--json", "state", "--jq", ".state"], {
    encoding: "utf8",
  });
  if (asPr.status !== 0) return "unknown";
  return classify(asPr.stdout);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--file") out.file = argv[++i];
    else if (arg === "--repo") out.repo = argv[++i];
    else if (arg === "--render-body-file") out.renderBodyFile = argv[++i];
    else if (arg === "--successor-to") out.successorTo = argv[++i];
  }
  return out;
}
