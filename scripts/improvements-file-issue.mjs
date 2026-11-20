#!/usr/bin/env node
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  escapesRepo,
  GITHUB_REPO_RE,
  oneLineTitle,
  parseFinding,
  readIntake,
  resolveIntake,
  section,
  UPSTREAM_TITLE_MAX,
  UPSTREAM_TITLE_MIN,
  writeFindingFrontmatter,
  writeIndex,
} from "./improvements-lib.mjs";

const args = parseArgs(process.argv.slice(2));
// Whole-ref match (negative lookahead rejects trailing word/hyphen chars like `issues/99evil`).
const GITHUB_REF_RE = /https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/(?:issues|pull)\/\d+(?![\w-])/g;
const RAVEN_REPO = "stellar-experimental/stellar-raven";
const HANDOFF_TEMPLATE = "upstream-improvement-ready.yml";
const AUTOMATION_MARKER = "<!-- generated-by-stellar-raven -->";
const AUTOMATION_NOTICE =
  `[Stellar Raven](https://github.com/${RAVEN_REPO}) filed this issue from its automated evaluation pipeline. The issue includes evidence and a public source record. Please verify the live surface before you act.`;
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

// Refuse to post findings outside this repo (would link a dead public blob URL).
// Checked after --dry-run / --render-body-file so local inspection still works.
if (escapesRepo(finding.relPath)) {
  console.error(`${finding.frontmatter.id}: ${args.file} resolves outside the repository`);
  console.error(`Its source record would render as ${finding.relPath}, which is not a repo path.`);
  console.error("Use --dry-run to inspect the body without posting.");
  process.exit(2);
}

// Re-filing guard: only `reported-upstream` may file a `--successor-to` issue, and only when the
// target ref is an exact cited ref in the same repo and every cited ref is live-confirmed closed.
if (["reported-upstream", "declined-upstream", "fixed-upstream"].includes(finding.frontmatter.status)) {
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
  const successorRepo = args.successorTo.split("/").slice(3, 5).join("/");
  if (successorRepo !== repo) {
    console.error(
      `${finding.frontmatter.id}: --successor-to points at ${successorRepo} but this filing targets ${repo}`,
    );
    console.error("A successor must supersede a report in the same repository it is filed into.");
    process.exit(2);
  }
  const state = readIssueState(args.successorTo);
  if (state !== "closed") {
    console.error(
      `${finding.frontmatter.id}: --successor-to ${args.successorTo} is ${state}; only a CLOSED report can have a successor`,
    );
    console.error("An open report already has an owner — follow up there instead of filing a duplicate.");
    process.exit(2);
  }
  // Every sibling cited ref must also prove closed (fail closed on "unknown").
  for (const ref of citedRefs) {
    if (ref === args.successorTo) continue;
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

// Everything below runs AFTER the public write. `gh issue create` exited 0, so an issue almost
// certainly exists upstream even when the steps that record it locally fail. The warning differs by
// step, because the risk does. While the finding still shows its pre-filing status, a re-run would
// file a duplicate, so those messages refuse one outright. Once the frontmatter records the issue,
// the reported-upstream dedupe guard refuses a re-run by itself, and only the index repair remains.
const url = result.stdout.trim();
const filedOn = new Date().toISOString().slice(0, 10);
const evidenceLine = `upstream issue filed ${filedOn}: ${url}`;
const REPAIR_BY_HAND = [
  "Forward repair, by hand:",
  `  1. Open ${url} and confirm the issue exists.`,
  `  2. In ${finding.relPath}, set 'status: reported-upstream'.`,
  "  3. Under 'evidence:', append the entry:",
  `       - ${evidenceLine}`,
  "  4. Run npm run improvements:index, then npm run improvements:lint.",
].join("\n");

const verify = spawnSync("gh", ["issue", "view", url, "--json", "url", "--jq", ".url"], {
  encoding: "utf8",
});
if (verify.status !== 0 || verify.stdout.trim() !== url) {
  process.stderr.write(verify.stderr ?? "");
  console.error(`${finding.frontmatter.id}: gh reported the issue at ${url}, but the read-back failed.`);
  console.error("The issue may already exist upstream. Do not re-run this command — a second run files a duplicate.");
  console.error("The local finding was not changed, so the repair only adds what the filing would have added.");
  console.error(REPAIR_BY_HAND);
  process.exit(1);
}
console.log(url);
try {
  writeFindingFrontmatter(finding, { status: "reported-upstream", evidenceAppend: evidenceLine });
} catch (error) {
  console.error(`${finding.frontmatter.id}: the issue was filed at ${url}, but the local finding was not updated.`);
  console.error(`  ${error.message}`);
  console.error("The issue already exists upstream. Do not re-run this command — a second run files a duplicate.");
  console.error("The write is atomic, so the finding still holds its previous content.");
  console.error(REPAIR_BY_HAND);
  process.exit(1);
}
try {
  writeIndex();
} catch (error) {
  console.error(`${finding.frontmatter.id}: the issue was filed at ${url} and the finding records it, but improvements/INDEX.md was not regenerated.`);
  console.error(`  ${error.message}`);
  console.error("The issue exists upstream and the finding already records it, so a re-run is unnecessary.");
  console.error("The finding is now reported-upstream, so the dedupe guard refuses another filing anyway.");
  console.error("Forward repair: run npm run improvements:index, then npm run improvements:lint.");
  process.exit(1);
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
    `Raven recorded this finding as ${fm.id} (${fm.service}, discovered ${fm.discovered}).`,
    "",
    `Public source record: [${finding.relPath}](${sourceUrl})`,
    ...(immutableSourceUrl ? ["", `Immutable source snapshot: [${sourceCommit.slice(0, 12)}](${immutableSourceUrl})`] : []),
    "",
    "## Resolution Handoff",
    "",
    "When you deploy a fix, link the resolving issue or pull request to the source record.",
    "Then notify Raven through:",
    "",
    handoffUrl,
    "",
    "Include the finding ID and the resolving issue or pull request.",
    "Include the deployed version or timestamp. Include the smallest live recheck.",
    "Raven verifies the live surface before it sets the finding to `fixed-upstream`.",
    "An issue closure or merged pull request does not prove the fix.",
    "A separate reviewer repeats the live check before Raven retires the active finding.",
    "Raven keeps a commit-pinned snapshot when one is available.",
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
    // Same cap constants the lint enforces when the record lands (upstreamTitleError in
    // improvements-lib.mjs); duplicating the numbers here would let the two drift.
    if (explicit.length < UPSTREAM_TITLE_MIN || explicit.length > UPSTREAM_TITLE_MAX) {
      console.error(`${finding.frontmatter.id}: upstreamTitle must be ${UPSTREAM_TITLE_MIN}-${UPSTREAM_TITLE_MAX} characters`);
      process.exit(2);
    }
    return explicit;
  }
  if (["proposed", "verified"].includes(finding.frontmatter.status)) {
    console.error(
      `${finding.frontmatter.id}: add a reader-first upstreamTitle (${UPSTREAM_TITLE_MIN}-${UPSTREAM_TITLE_MAX} characters) before filing`,
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
