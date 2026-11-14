# Brief: instrument changes and the apply script

Read `briefs/common.md` first. Your lane is `instrument`. You write code in this lane; the write
set is below. Do not commit; the orchestrator commits.

## Context

The case audit is done. `audit/*.json` holds one record per case, `verify/*.json` holds the
independent reviewer's decisions, and `map/taxonomy.json` is the coverage map (167 leaves, a
target of about 249 cases). A `coverage` lane is now writing `coverage/coverage.json`
(`briefs/coverage.md` defines its shape): the final verdict, survivor, and leaf per case, the
extra cuts, the tool-lane decisions, and the open slots.

About 100 cases retire, about 84 merge into a survivor, about 300 get a compact rewrite, and up to
18 move out of the headline battery. Hand-editing that many files invites errors, so the edits are
applied by a script from the reviewed records.

Read first: `eval/qa/README.md` ("Case schema and golden lifecycle"), `eval/qa/corpus/README.md`,
`.agents/skills/golden-truth/SKILL.md`, `eval/qa/compile-qa.mjs`, `eval/qa/lifecycle.mjs`,
`eval/qa/lint-corpus.mjs`, `eval/qa/register-helper.mjs`, and the tests that cover them.

## Part 1: design note

Write `.agents/rounds/2026-11-14-golden-coverage-audit/apply/DESIGN.md` before you write code.
Keep it short. It answers:

1. **Retire.** The exact retirement record the compiler and lint require (no case has been retired
   before; `corpus/retired/` does not exist). Where the reviewer, evidence, last digest, and
   replacement ids go. A merged case is a retirement whose replacement id is its survivor.
2. **Rewrite.** What a judge-facing change needs to pass the gospel-change lint: the
   `truth.verified` event, `evidence`, and a legal `rootCause`. The orchestrator will add one
   `.agents/TODO.md` entry for this round; say what anchor form `rootCause` must take. Where text
   moved out of `golden.notes` goes in the `truth` block (propose one field; keep it small).
3. **Leaf.** How a case records its taxonomy leaf. Preferred: a judge-blind `truth.leaf` (and
   optional `truth.secondaryLeaf`), with the taxonomy committed as `eval/qa/taxonomy.json`
   (id, title, domain, weight, volatility, cases target only; no research notes). Directories and
   `tags.category` stay as they are unless you find a strong reason.
4. **Floors.** Replace `CATEGORY_FLOORS` with coverage rules from the taxonomy: every active
   case has a valid leaf; a leaf never has more primary cases than its target plus one; and
   `--enforce-floors` fails when a leaf of weight 2 or 3 has no active case, unless the leaf is
   listed in a committed `openSlots` list with a reason (new cases arrive as proposals in a later
   change, so open slots must be legal on day one and shrink over time). Review the other floors
   (operation floor, skill floor, cross-service, NEG, VOCAB, catalog-note traps, the 35% scheduled
   cap): the headline battery now scores Stellar truth, so a floor that forces Raven-mechanics
   cases into it must go or move to the tool lane. State what each floor protects and your call.
5. **Tool lane.** The smallest way to keep a few Raven-mechanics cases outside the headline with
   their own denominator. Compare a separate cases file beside the frozen live lanes with a
   lifecycle state or tag. Prefer the option with the least new code. If the coverage lane leaves
   fewer than five such cases, say whether a lane is worth having at all.
6. **Everything pinned.** List every test, generated file, count, digest, register entry,
   sentinel, sample, and doc that the change moves (`LEDGER_SOURCE_COUNTS`, the migration ledger,
   `lifecycle-registry.json`, `consistency-register.json`, `source-sentinels.json`, `sample.json`,
   `eval/gates.json` if touched, CI workflows, README numbers), and how each is regenerated or
   edited.
7. **Held-out split.** A rule that draws tuning, held-out, and reserve sets from the final battery
   deterministically (for example by a hash of the id, stratified by domain and freshness), and
   where the rule lives. The split file itself must stay out of any place a product-tuning lane
   reads by default; say where.

Forward-only: no compatibility shim for the old floors or old field layout. Delete what the new
rules replace. Add no code that this round does not use.

## Part 2: code

Write set: `eval/qa/**` (not `eval/qa/corpus/battery/**` or `corpus/proposed/**` content),
`eval/qa/taxonomy.json`, tests under `test/` that cover the changed files, `package.json` scripts
if one is needed, and `.agents/rounds/2026-11-14-golden-coverage-audit/apply/**`.

1. Implement parts 3 to 5 and whatever part 1 needs (the retirement path may already work; prove
   it with a test).
2. Write `.agents/rounds/2026-11-14-golden-coverage-audit/apply/apply.mjs`, a one-off script:
   - Inputs: `audit/*.json`, `verify/*.json`, `coverage/coverage.json`.
   - Final verdict and rewrite per case: `coverage.json` first, then the verifier, then the
     auditor.
   - `tighten` and merge survivors: write the rewrite's `question` (when set), `answer`,
     `keyFacts`, `avoid`, and `notes`; move the old notes and `movedToTruth` text into the truth
     block; set `truth.leaf`; write the `truth.verified` event with the round ledger path, the
     rot evidence refs, and the root cause. Keep `truth.asOf` and `reverifyBy` unless the record
     carries evidence observed in this round for that case. Normalize avoid items to "Do NOT ...".
   - `keep`: set `truth.leaf` only.
   - `retire` and `merge`: write the retirement record and remove the case from the battery.
   - `move-tool-lane`: per your design.
   - `--dry-run` prints a per-case plan and a summary; `--only <id,id>` limits the run.
   - It fails loudly on a record it cannot apply (missing rewrite, unknown survivor, a rewrite
     with no key facts) and lists them all before it changes anything.
   - It is idempotent.
3. Do not run the script for real. Dry-run it against the inputs that exist (if `coverage.json`
   is not there yet, build a small fixture from the audit and verify files) and apply it for real
   only inside a scratch copy to prove that `npm run eval:qa:compile`, `npm run eval:qa:lint`,
   `npm run eval:qa:register`, and `npm test` can pass afterwards. Report which gates pass in the
   scratch copy and what still fails.

Run `npm ci` in the worktree if `node_modules` is missing. `npm run typegen` needs a placeholder
`.dev.vars` (see `README.md`, "Run locally").

## Report

`apply/DESIGN.md`, plus `apply/REPORT.md`: what you built, the gate results in the scratch copy
with exact commands and exit codes, records the script refused and why, and open questions for the
orchestrator. Send the path of `apply/REPORT.md`.
