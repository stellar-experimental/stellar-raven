#!/usr/bin/env node
/**
 * check-pin-review.mjs — the exposed prompt surface cannot move without a
 * recorded human review.
 *
 * Skill bodies are prompt input and are no longer vendored, so a re-pin commit
 * shows hash changes only: the text a model will start reading never reaches
 * `git diff`. `ecosystem-skills/update.sh` prints the body diff at re-pin time;
 * this makes the review durable by requiring `ecosystem-skills/PIN-REVIEW.md` to
 * name what was reviewed.
 *
 * WHAT IS COMPARED — the whole selection and its location, not just the
 * commit. A source's commit SHA is only one of the fields that decide which
 * bytes get served: the skill names, the file paths, and the per-file blob shas
 * do too. Comparing commits alone let a change retarget an entry to a different
 * markdown file in the same pinned tree, or add/drop a selected skill, with the
 * gate reporting "no skill pin moved". The owner, repo, and path decide WHERE
 * those bytes are fetched from (scripts/lib/skill-mirror.mjs builds the raw URL
 * from them): a location-only change moves every transport URL to a different
 * repository while the served bytes stay hash-verified, so it is a provenance
 * change that needs the same fresh read. So each source is reduced to a
 * canonical projection (id + owner + repo + path + commit + skill names + each
 * file's path and blob sha) and digested; the ledger must name that digest.
 *
 * WHY A DIGEST AND NOT THE COMMIT. The attestation has to be NEW. A bare commit
 * SHA is satisfied by any older line that happens to mention it, so a
 * same-commit selection change could ride in under a previous review. The
 * digest changes whenever the served selection changes, which is exactly the
 * event that needs a fresh human read.
 *
 * Usage:
 *   node scripts/check-pin-review.mjs [--base <ref>]   (default origin/main)
 *   node scripts/check-pin-review.mjs --digests        print current digests
 *
 * Exit 1 if the selection moved without a ledger entry. A repo with no reachable
 * base ref exits 0 with a notice — fail-open there is deliberate: this guards a
 * diff, and with no diff there is nothing to guard.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const baseIdx = process.argv.indexOf("--base");
const BASE = baseIdx >= 0 ? process.argv[baseIdx + 1] : "origin/main";

/** Every field that decides which bytes this source serves, and from where, in a stable order. */
const project = (source) => ({
  id: source.id,
  owner: source.owner,
  repo: source.repo,
  path: source.path,
  commit: source.commit,
  skills: [...(source.skills ?? [])]
    .map((skill) => ({
      name: skill.name,
      files: [...(skill.files ?? [])]
        .map((file) => ({ path: file.path, sha: file.sha }))
        .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0)),
    }))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)),
});

const digest = (source) =>
  createHash("sha256").update(JSON.stringify(project(source))).digest("hex").slice(0, 12);

/** source id -> { commit, digest } */
const pinsOf = (json) =>
  new Map(
    JSON.parse(json).sources.map((source) => [source.id, { commit: source.commit, digest: digest(source) }]),
  );

const manifestPath = join(ROOT, "ecosystem-skills/MANIFEST.json");
const nowPins = pinsOf(readFileSync(manifestPath, "utf8"));

if (process.argv.includes("--digests")) {
  for (const [id, pin] of nowPins) console.log(`${id} ${pin.commit.slice(0, 12)} sel:${pin.digest}`);
  process.exit(0);
}

const showAtBase = (path) =>
  execFileSync("git", ["show", `${BASE}:${path}`], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

let basePins;
let baseLedger;
try {
  basePins = pinsOf(showAtBase("ecosystem-skills/MANIFEST.json"));
  baseLedger = showAtBase("ecosystem-skills/PIN-REVIEW.md");
} catch {
  console.log(`pin-review: base ref ${BASE} unavailable — nothing to compare, skipping.`);
  process.exit(0);
}

const ledger = readFileSync(join(ROOT, "ecosystem-skills/PIN-REVIEW.md"), "utf8");

/**
 * An attestation must be NEW, and it must be an actual `sel:` token.
 *
 * Newness: reading only the current ledger let a change revert a source to any
 * previously recorded selection — or re-add a source that was removed — and pass
 * on the strength of a review someone did months ago for different reasons. The
 * ledger has to have GAINED the token in this diff.
 *
 * Exactness: a bare `includes(digest)` matched a 12-hex string anywhere in the
 * file, including inside the 40-hex commit SHAs the ledger is full of. Requiring
 * the `sel:` prefix means only a real attestation counts.
 */
const attested = (text, digest) => new RegExp(`sel:\`?${digest}\\b`).test(text);
const newlyAttested = (digest) => attested(ledger, digest) && !attested(baseLedger, digest);

// Compare the UNION of base and current source ids. Iterating only the current
// manifest meant deleting a source — which changes every skill it served — moved
// nothing and needed no attestation at all.
const allIds = [...new Set([...basePins.keys(), ...nowPins.keys()])].sort();
const moved = allIds
  .map((id) => ({ id, from: basePins.get(id), to: nowPins.get(id) }))
  .filter(({ from, to }) => from?.digest !== to?.digest);

if (moved.length === 0) {
  console.log("pin-review: no skill pin or file selection moved.");
  process.exit(0);
}

// A removal has no new selection to digest, so it is attested by name instead:
// the ledger must say the source was removed, in this diff.
const removalAttested = (id) =>
  new RegExp(`removed:\\s*\`?${id}\\b`).test(ledger) && !new RegExp(`removed:\\s*\`?${id}\\b`).test(baseLedger);

const token = ({ id, to }) => (to ? `${to.commit.slice(0, 12)} sel:${to.digest}` : `removed: ${id}`);
const ok = (change) => (change.to ? newlyAttested(change.to.digest) : removalAttested(change.id));

const unrecorded = moved.filter((change) => !ok(change));
for (const change of moved) {
  const { id, from, to } = change;
  const before = from ? `${from.commit.slice(0, 12)} sel:${from.digest}` : "(new source)";
  const after = to ? `${to.commit.slice(0, 12)} sel:${to.digest}` : "(source removed)";
  console.log(`pin-review: ${id} ${before} -> ${after}` + (ok(change) ? "  [recorded]" : "  [MISSING FROM LEDGER]"));
}
if (unrecorded.length > 0) {
  console.error(
    `\npin-review FAILED: ${unrecorded.length} source selection change(s) with no NEW entry in ` +
      `ecosystem-skills/PIN-REVIEW.md.\n` +
      `Skill bodies are prompt input: run ./ecosystem-skills/update.sh, READ the body diff it ` +
      `prints (or re-print it with scripts/diff-pins.mjs), then add a ledger entry in the same ` +
      `commit naming:\n` +
      unrecorded.map((change) => `  ${change.id} ${token(change)}`).join("\n") +
      `\n\nAn entry that already existed at ${BASE} does not count — reverting to a previously ` +
      `reviewed selection is still a decision to serve those bytes again today.`,
  );
  process.exit(1);
}
console.log(`pin-review: ${moved.length} selection change(s), all recorded.`);
