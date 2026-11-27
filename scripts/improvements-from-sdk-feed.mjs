#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  IMPROVEMENTS_DIR,
  listFindingFiles,
  parseFinding,
  readResolved,
  writeIndex,
} from "./improvements-lib.mjs";
import { writeFileAtomic } from "./lib/shared.mjs";

const DEFAULT_FEED =
  "https://raw.githubusercontent.com/devodii/state-of-soroban/main/docs/data/raven-feed-soroban-sdk.json";
const DOCS_TEXT = "https://developers.stellar.org/llms-full.txt";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const feedSource = argValue("--feed") ?? DEFAULT_FEED;
const minRepos = Number(argValue("--min-repos") ?? 300);
const today = new Date().toISOString().slice(0, 10);

const feed = JSON.parse(
  /^https?:/.test(feedSource)
    ? await (await fetch(feedSource)).text()
    : readFileSync(feedSource, "utf8"),
);
const skillsText = readPinnedSkills();
const findings = listFindingFiles().map(parseFinding);
const known = findings.map((finding) => finding.raw).join("\n");
const ids = [
  ...findings.map((finding) => finding.frontmatter.id),
  ...(readResolved().entries ?? []).map((entry) => entry.id),
];
let nextId = Math.max(0, ...ids.filter((id) => /^sd-\d+$/.test(id)).map((id) => Number(id.slice(3)))) + 1;

let written = 0;
for (const entry of feed.entries.filter((item) => item.repos >= minRepos)) {
  if (known.includes(`\`${entry.symbol}\``) || known.includes(`${entry.symbol}(`)) {
    console.log(`skip ${entry.symbol}: already mentioned in a finding`);
    continue;
  }
  const inSkills = new RegExp(`\\b${entry.symbol}\\b`).test(skillsText);
  if (inSkills && !entry.gaps.includes("docs-teach-deprecated")) {
    console.log(`skip ${entry.symbol}: a pinned skill already covers it`);
    continue;
  }
  const record = buildRecord(entry, `sd-${nextId}`, inSkills);
  const file = path.join(IMPROVEMENTS_DIR, "stellar-docs", `sd-${nextId}-${slug(entry.symbol, record.kind)}.md`);
  console.log(`${dryRun ? "would write" : "write"} ${path.relative(process.cwd(), file)}`);
  if (!dryRun) writeFileAtomic(file, record.text);
  nextId += 1;
  written += 1;
}
if (written && !dryRun) writeIndex();
console.log(`${written} record(s) ${dryRun ? "planned" : "written"} from ${feed.crate} ${feed.version}`);

function buildRecord(entry, id, inSkills) {
  const name = `${entry.owner}::${entry.symbol}`;
  const count = entry.repos.toLocaleString("en-US");
  const teaches = entry.gaps.includes("docs-teach-deprecated");
  const deprecated = entry.deprecated !== null;
  const kind = teaches ? "teaches-deprecated" : deprecated ? "deprecation-unmentioned" : "undocumented";
  const title = {
    "teaches-deprecated": `Docs pages still call deprecated \`${name}\`, which ${count} Soroban repos use`,
    "deprecation-unmentioned": `Docs never use deprecated \`${name}\`, and ${count} Soroban repos still call it`,
    undocumented: `Docs never use \`${name}\`, which ${count} Soroban repos call`,
  }[kind];
  const probe = teaches
    ? { url: `${entry.docs_urls[0]}.md`, line: `contains:\n      - ${JSON.stringify(`${entry.symbol}(`)}` }
    : { url: DOCS_TEXT, line: `excludes:\n      - ${JSON.stringify(`${entry.symbol}(`)}` };
  const evidence = [
    `${today} Usage: ${count} non-fork Soroban repos call \`${entry.symbol}\` in parsed Rust (${entry.repos_defining_same_name} of them also define a function with that name). Counts come from ${DEFAULT_FEED} (${feed.crate} ${feed.version}, ${feed.repos_scanned.toLocaleString("en-US")} repos scanned, generated ${feed.generated_at}).`,
    `${today} SDK: ${feed.crate} ${feed.version} ${entry.file}, \`${name}\`: ${entry.summary}${deprecated ? ` Deprecated: ${entry.deprecated}.` : ""}`,
    teaches
      ? `${today} Docs: ${feed.docs_source} (${feed.docs_pages_read} pages) calls \`${entry.symbol}(\` on ${entry.docs_pages} page(s), first ${entry.docs_urls.length}: ${entry.docs_urls.join(", ")}.`
      : `${today} Docs: ${feed.docs_source} (${feed.docs_pages_read} pages) contains no call to \`${entry.symbol}(\`.`,
    inSkills
      ? `${today} Skills: the pinned skills already mention \`${entry.symbol}\`, so the fix is in the docs.`
      : `${today} Skills: no pinned skill under ecosystem-skills/.cache mentions \`${entry.symbol}\`.`,
    `Example callers: ${entry.example_repos.map((repo) => `https://github.com/${repo}`).join(", ")}.`,
  ];
  const finding = {
    "teaches-deprecated": `Stellar Docs still show \`${entry.symbol}(\` in ${entry.docs_pages} page(s), but \`${name}\` is deprecated in ${feed.crate} ${feed.version} (${entry.deprecated}). ${count} non-fork Soroban repos call it, so an answer grounded in these pages teaches the deprecated call.`,
    "deprecation-unmentioned": `\`${name}\` is deprecated in ${feed.crate} ${feed.version} (${entry.deprecated}) and the docs contain no call to it. ${count} non-fork Soroban repos still call it, so a builder who meets the deprecation warning finds nothing in the docs that resolves it.`,
    undocumented: `\`${name}\` exists in ${feed.crate} ${feed.version} and ${count} non-fork Soroban repos call it, but the docs contain no call to it.`,
  }[kind];
  const recommendation = {
    "teaches-deprecated": `Replace \`${entry.symbol}(\` in the listed pages with the replacement the SDK names.`,
    "deprecation-unmentioned": `Add the replacement the SDK names (${entry.deprecated}) where the sibling APIs are explained, so the old name resolves to it.`,
    undocumented: `Document \`${name}\` where the sibling APIs are explained. The SDK summary is: ${entry.summary}`,
  }[kind];
  const text = `---
id: ${id}
service: stellar-docs
status: proposed
discovered: ${today}
upstreamTitle: ${JSON.stringify(title)}
probe:
  type: http-text
  url: ${probe.url}
  expect:
    status: 200
    ${probe.line}
evidence:
${evidence.map((line) => `  - ${JSON.stringify(line)}`).join("\n")}
---

## Finding

${finding}

## Evidence

${evidence.join("\n\n")}

## Recommendation

${recommendation}
`;
  return { kind, text };
}

function readPinnedSkills() {
  const dir = path.join(IMPROVEMENTS_DIR, "..", "ecosystem-skills", ".cache");
  if (!existsSync(dir)) {
    console.error("ecosystem-skills/.cache is empty; run npm test once to fetch the pinned skills");
    process.exit(1);
  }
  return readdirSync(dir)
    .map((name) => readFileSync(path.join(dir, name), "utf8"))
    .join("\n");
}

function slug(symbol, kind) {
  return `${symbol.replaceAll("_", "-")}-${kind}`;
}

function argValue(name) {
  const at = args.indexOf(name);
  return at === -1 ? undefined : args[at + 1];
}
