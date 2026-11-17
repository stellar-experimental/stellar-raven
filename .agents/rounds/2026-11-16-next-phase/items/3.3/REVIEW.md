# Review of the item 3.3 plan

Reviewer: Claude Fable 5.2, high effort, 2026-11-17, worktree `np-3.3` at `e710b5d3`. Read-only.
No model call, no paid call, no local server, no subagent. I opened no QA corpus file, no
`eval/qa/cases.json` row, no split file and no holdout row.

What I ran, all in-process on `main` code:

- `measure.mts` with the FAM file (SHA-256 checked: `0246ad02…f56cf89c`). It prints every number
  the plan states: probe 0 / 1 / 3 and SDF 2 / 2 / 4, off-golden 8 / 8 / 10 and 14 / 16 / 18, FAM
  55 / 58 / 63 of 64.
- `compare-routing.mjs --lists` on the existing `eval/results/routing-2026-11-17T09-44-41-918Z.json`
  against itself (exit 0, all zero), and a field count per lane. I printed no row.
- A scratch diagnostic that calls `searchCatalogPage` on the public probe and spot queries and
  prints each card's `tier` and score, and classifies which `scoreField` branch each query token
  takes. It runs no variant of either mechanism. Finding 1 gives the recipe.

Findings are ordered by severity.

## Findings

### 1. Blocking. Neither mechanism can move the decision metric, so rule 5 fixes the result before the run

Section: "Decision", "Pass rule" rule 5, "The two mechanisms".

Evidence. The three non-SDF displacement rows at limit 10 on `e710b5d3`:

| Probe query | `stellarOrg` card | Tier | Score | Query tokens it matches, and how | Gated candidates |
|---|---|---|---|---|---|
| soroban security best practices | `search_site`, rank 6 | backfill | 45 | `soroban`, `security`: exact description tokens | 0 |
| security review before mainnet launch soroban | `search_site`, rank 9 | backfill | 43 | `security`, `soroban`: exact description tokens | 1 |
| stellar rpc getEvents pagination | `get_page`, rank 8 | backfill | 200 | `stellar`: exact id, service, description; `get`: exact id and name | 9 |

- In all three the card fails the gate and arrives through tier-2 backfill. No token matches through
  the prefix branch.
- **M1 cannot remove it.** M1 changes only the prefix branch (`src/catalog/vendor/search-scoring.ts:85`,
  `src/catalog/scoring.ts:491`). These three scores come from exact matches, so they do not move.
  M1 only removes matches from other entries, so no ungated score rises and no entry newly passes
  the gate. The card keeps its place or moves up.
- **M2 cannot remove it.** M2 runs "on a full gated page only". These pages have 0, 1 and 9 gated
  candidates at limit 10, so `gatedPageIsFull` is false (`src/catalog/search.ts:1254`) and M2 does not
  execute. Where M2 does run, its victim is a gated card and its winner is a gate-failed card. Here
  the `stellarOrg` card is the gate-failed card.
- **The metric is "the card is on the page".** `measure.mts:21-24` counts a row as displaced when a
  `stellarOrg` card is on the full-catalog page and a bare-catalog card is missing. A bare page of 10
  cards always loses one when a new card enters, so the two counts are equal in every cell
  (0 = 0, 1 = 1, 3 = 3). "Falls below 3" therefore needs a `stellarOrg` card to leave one of these
  three pages.
- **The source says so.** `STEP-2-REVIEW.md:106-107` assigns the probe's security displacements to
  cause 1, the description's words. Causes 2 and 3 are shown on other queries (lines 108-119), which
  this plan reports and does not gate (`measure.mts:60-63`). On `main` those are:
  - `org` prefix: "which organizations run validators" at limit 5 has `get_page` at rank 1, gated,
    through `organizations` against the short token `org` in id, service and description. "Tier 1
    organization validators quorum requirements" at limit 8 has both operations at ranks 1 and 2 by
    the same match.
  - gate fill: "soroban reentrancy security" at limit 8 has 8 gated candidates, a full page, and
    `stellarDocs.search_soroban_contract_docs` (111, gate-failed) is absent.

This is analysis of `main`, not a measurement of either mechanism. The measurement can confirm it
in minutes.

Recipe: for each probe query, `searchCatalogPage(full, { query, limit: 10 }).hits` gives the
`stellarOrg` hit's `tier` and `score`; the count of `tier === "gated"` hits at `limit: 50` gives the
gated candidates.

Fix. Do not execute the plan as written. Rule 5 is not in the round plan's pass rule
(`../../PLAN.md:252-253`) or in the orchestrator note; the lead added it from the round plan's
"Decision" line. `DECISIONS.md` says a lead without conviction writes the question and stops. Put
this to the orchestrator before execution, with a recommendation:

- **(a) Keep the decision metric (recommended if the round plan's "Decision" line binds).** Both
  mechanisms have no effect on it by construction. Run the code-only measurement of each for the
  record (the M1 line is in the plan verbatim; no new tests or docs first), record both in the TODO
  as dropped with this evidence, and end the item in records only. Spend is about an hour, not half
  a day.
- **(b) Restate the effect per mechanism on its own target, fixed before any run.** M1: no
  `stellarOrg` card on the two `org…` spot pages. M2: `stellarDocs.search_soroban_contract_docs`
  returns to the reentrancy spot page at limit 8. Rule 5 becomes "non-SDF displacement at limit 10
  does not rise". Rules 1 to 4 and 6 stay. This changes the pass rule, so only the orchestrator can
  choose it.

Either way, add the tier, score and gated-candidate count of each `stellarOrg` card to the
`measure.mts` output, so the record shows why the count did or did not move.

### 2. Should-fix. A direct prior measurement of M1's line is missing from the facts

Section: "Facts re-checked", "Risks".

Evidence. On 2026-10-02 the same expression with floor 3,
`Math.min(c.length, token.length) >= 3 && (…)`, in both scorers, failed the gate:
legacy 229 / 303 / 319 against 219 / 298 / 326, extended 92 / 104 / 109 against 93 / 111 / 117,
holdout forbidden captures 12 against a ceiling of 10
(`.agents/rounds/2026-10-02-routing-adapter-repairs/lane-c-report.md:37-38,94,98`,
`review-lane-c-grok.md:100`, `evidence/prefix-vendor.ts:85`). A floor of 4 removes every match
that floor removed, and more. The plan cites only the 2026-09-17 audit and the TODO.

Fix. Cite it in "Facts" and "Risks", and say the expected result is a rule 1 failure. Reorder
step 2: make the two-line change, run the gates and the measurement, and write the new tests and
the README line only if rules 1 to 5 pass.

### 3. Should-fix. M1 changes more than the plan describes, and its test spec is loose

Section: "The two mechanisms" M1, "Steps" 2, "Risks".

Evidence.

- The round plan states the mechanism on the field side ("the id token `org` no longer
  prefix-matches query words", `../../PLAN.md:249`). The plan's line also floors the query side. That
  follows the TODO wording and `tokensOverlap` (`src/catalog/scoring.ts:153-155`), which is a fair
  reading, but the plan should say it chose the TODO form.
- The two directions do not behave alike. A short field token against a longer query token now
  matches nothing. A short query token against a longer field token still matches at weight 1,
  because a prefix is a substring (`search-scoring.ts:88`); it only loses the weight-2 tier. "Risks"
  describes the first case only.
- "a 3-character field token such as `org` no longer prefix-matches `organizations`" does not say
  which side holds which token. Two implementers would assert different things.
- "a 4-character prefix such as `deploy`/`deployed`" is a 6-character example.

Fix. State both directions in M1. Fix the tests as: query `organizations` against field token `org`
gives no match; query `org` against field token `organizations` matches at the substring weight; a
true 4-character pair such as `fund`/`funds` keeps the prefix weight; `dex`/`dexes` is lost (the
known cost); the `cs-001` fragments `s`, `a` and `re` match nothing
(`improvements/canonical-source/cs-001-codemode-search-short-token-prefix.md`, "Finding").

### 4. Should-fix. M2 is not precise enough for two implementers to write the same code

Section: "The two mechanisms" M2.

Evidence and the choice each point needs:

1. **How the pool is scored.** "Score every entry the gate rejected" read literally scores entries
   that `scoreCandidates` skips: `searchable === false` sections (`search.ts:786`), operations that
   `rejectsRoutingIntent` rejects (790-799), and whole skills that `admitsWholeSkill` refuses
   (815-818). Name the call:
   `scoreCandidates(catalog, opts, scoreEntryWeightedUngated, query, (e) => !gatedIds.has(e.id))`.
2. **"Full gated page"** is `gatedPageIsFull` (`search.ts:1254`). Say so.
3. **"At most one swap per page."** `preserveStrongBackfill` may already have swapped one in
   (`search.ts:1066-1067`), and `preserveIntentWithinServiceQuota` may swap another after M2. Say
   whether the limit is M2's own or page-wide. `test/search.test.ts:1026-1043` expects exactly one
   backfill hit on its page.
4. **In place, no re-sort.** "Takes the victim's slot" should say `selected[victimIndex] = candidate`
   with no sort, as `search.ts:1066` does. It matters: the next rule protects cards by index
   (`indexes.slice(1)` at 967, `index > 0` at 1015).
5. **The slot is not kept through the next rule.** `preserveIntentWithinServiceQuota` can evict the
   swapped-in card, by the same-service replacement (967-996) or the cross-service one (1006-1021).
   Say this is intended, and pin it with a fixture.
6. **Victim index.** Say "index in `selected` at that point, before interleaving".

Fix. Replace the four numbered sentences with about twelve lines of pseudocode against the named
variables, and add fixtures for points 3 and 5 to step 3.

### 5. Should-fix. Rule 6 leaves a judgment to make after the result is seen

Section: "Pass rule" rule 6.

Evidence. The exemption names only M1's case. M2 has existing tests that assert the rule it
removes: "keeps pages without targeted replacements entirely in tier 1" expects every hit of a full
page to be `gated` (`test/search.test.ts:1009-1024`). M1 moves pinned numbers: `toBe(812)` for an
ungated score (`test/scoring.test.ts:215`), and `test/search.test.ts` pins 15 more. As written,
each is "a loss" or not by the executor's reading after the run.

Fix. Define it now. A failing existing test is a loss when it asserts the membership, rank, tier or
admission of a named card that the mechanism's stated rule does not itself define. A test that pins
a number, or the invariant the mechanism removes, is re-pinned and listed in `EXEC.md`. Name the
two tests above for M2.

### 6. Should-fix. `compare-routing.mjs` does not carry rule 2, and three checks are weak

Section: "Measurement", "Pass rule" rules 1 and 2.

Evidence.

- **Rule 2 is outside the exit status.** The extended lane is `gated: false`
  (`compare-routing.mjs:19`), no total or net is printed, and the last line reads "RESULT: no gated
  hit-to-miss" (68). Exit 0 can be read as passing rules 1 and 2.
- **Rule 2's reading allows a trade.** "No strict total falls" lets one hit-to-miss be paid by one
  miss-to-hit. That is a fair reading of "no regression" in the round plan, but the plan should say
  it, and the per-case reviewer should read every extended hit-to-miss id.
- **Captures are compared by count** (60-61). A new capture on one row and a cleared one on another
  pass, unless the row's `pass` flips. The note says "any extra capture fails".
- **No identity check on the two files.** `eval/results/` is ignored and its files are named by
  time. A wrong pair prints all zeros and exits 0; I ran base against base and got exactly that.
- **Protocol-history rows have no boolean metric** (`eval/run-routing.mjs:380-387`), so the script
  shows only list changes for that lane. The header comment (7-8) says lists print for three lanes;
  line 53 also prints protocol-history rows. Those rows are public, so only the comment is wrong.

Verified: the script never prints a holdout or confirmation-only id. Ids are pushed only when
`!hidden` (39-41), lists print only when `!sealed && !r.confirmationOnly` (53), and the thrown
errors carry no id (28, 37). In the current results 108 of 338 legacy rows and 43 of 122 extended
rows are confirmation-only, so the per-case reviewer sees ids for 230 and 79 rows and counts for
the rest. Say that in `MEASURE.md`.

Fix.

- Print net per metric for the extended lane and a second result line for rule 2.
- Print holdout "rows newly captured" and "rows cleared" as counts, and breach on any new capture.
- Assert that `manifest.sha256`, `gradingRule` and `casesFile.generatedAt` match, and print each
  file's `ranAt` and `gate.pass`.
- Print `protocolHistoryLane` top-1, top-3, top-5 and control captures, base against variant.

### 7. Should-fix. The gate log cannot be read as the plan says

Section: "Steps" 1, "Measurement".

Evidence. On failure `grep '^GATE'` returns only `GATE FAIL:`; the reasons are on the next lines
(`eval/run-routing.mjs:601-602`). The results path is on the last line (605), and the plan gives no
way to get it. Everything from the `GATE` line to the end of the log is lane totals and that path.
The results JSON holds holdout rows (509), and the plan forbids opening only the log.

Fix. Read the log with `sed -n '/^GATE/,$p' <log>`. Record each run's results path in `MEASURE.md`.
Add: never open `eval/results/routing-*.json`; only `compare-routing.mjs` reads it.

### 8. Should-fix. The re-baseline step names too few fields

Section: "Steps" 5, "Gates".

Evidence. `eval/self-test.mjs:78-81` asserts that `legacy.top1/top3/top5` equal
`evidence.acceptedTotals.legacy`. The gate file's rule (`eval/gates.json:2`) also asks for the
decision in the round ledger. The plan names only `acceptedTotals` and the note. Precedent on
thresholds goes both ways (tightened 2026-09-16, kept 2026-11-02; `eval/gates.json:55`).

The "only upward" rule itself is right: with zero hit-to-miss on the gated lanes a total can only
rise, and the gate file wants the move in the same commit.

Fix. List the fields: `legacy.top1/top3/top5`, `evidence.acceptedTotals`, `baselinedAt`,
`evidence.localTrace`, `evidence.notes`, and a line in `.agents/rounds/2026-11-16-next-phase.md`.
Decide now whether `skills.minTop1`, the holdout floors and `maxForbiddenCaptures` tighten; I
recommend they stay. Add `npm run eval:selftest` to "Gates" for a commit that edits
`eval/gates.json` (`CONTRIBUTING.md:41`).

### 9. Should-fix. Records and docs the plan does not list

Section: "Steps" 2, 3 and 6.

If M1 ships:

- `src/catalog/scoring.ts:434-446` says the replica mirrors the vendor "line for line EXCEPT the
  coverage gate" and that the vendor file "stays byte-identical". Both become false. Add the floor
  to the re-vendor checklist (448-462) as a local difference to carry forward.
- `src/catalog/README.md:68`, "The vendor scorer remains separate from these adjustments".
- `cs-001`: its "Raven impact" evidence line says the vendor copy and the replica "carry the same
  rule", and cites the replica at `scoring.ts:474` (it is 491 today). Update it through
  `improvements-pipeline` and run `npm run improvements:lint`. The upstream issue stays open.
- The TODO short-token item: its "Done when" asks for the original triggers, the positive controls
  and the routing gates (`.agents/TODO.md:741-742`). Say whether the item closes or stays open for
  the upstream repair.

If M2 ships: the doc comments at `src/catalog/search.ts:1072-1076` and `1214-1231`,
`src/catalog/README.md:84-86`, and the tier description at `ARCHITECTURE.md:76-84`.

If a mechanism is dropped: the branch is local and never pushed, so its code is lost. Save the
diff as a patch in this folder, as earlier rounds did
(`.agents/rounds/2026-10-02-routing-adapter-repairs/evidence/`). Decision 8 asks that no work is
lost without a disposition.

### 10. Should-fix. One branch of the ship rule is undefined

Section: "Steps" 4.

Evidence. "Both pass: … it ships only if the combination also passes." If each passes alone and
the combination fails, the plan does not say what ships. Choosing then is a choice made after the
result. The rest matches the note: each mechanism is measured alone from the base commit, and the
combination once.

Fix. Name the fallback now, for example "ship neither and report".

### 11. Nit. `measure.mts`

- It does not check the FAM hash the plan tells the executor to check (`measure.mts:45-47`). Assert
  it in the script.
- Rule 4 depends on a file outside the repository, on agentpc only. Say in `MEASURE.md` that it
  cannot be reproduced elsewhere.
- "P2's numbers" in "Facts" are the step 2 reviewer's probe (`STEP-2-REVIEW.md:97`), not P2.
- Verified: wherever no `stellarOrg` card is on the page, the bare and full pages are identical
  (90 probe cells), so the catalog-derived token sets do not confound the comparison on `main`.

### 12. Nit. Gates and test output

- `test:smoke` is correctly outside the letter of the rule. `codemode.search` and the demo read the
  ranker (`src/executor/providers.ts:78`, `src/demo/tools.ts:38`) and CI runs the lane. Run it once
  on a shipping commit.
- A failing unit test can print a routing row: `test/scoring.test.ts:211-213` and
  `test/search-page-size.test.ts` read `eval/routing-cases.json`. Record failing test names in
  `EXEC.md`, not their output.

### 13. Nit. Names

"M1" and "M2" already mean other things here ("since the M1 tiered backfill",
`test/search.test.ts:113`; the cap tests at `../../PLAN.md:297`). Keep the labels out of code
comments, tests, the README and the TODO; write "prefix floor" and "gate-failed slot keeping".

## Checked and correct

- Base commit, both prefix-rule lines, `tokensOverlap` at `scoring.ts:149`, `searchCatalogPage` at
  `search.ts:1232`, the `preserveStrongBackfill` conditions, the public default of 7 at
  `src/mcp/tools.ts:55`, the catalog default of 10, the holdout ceiling of 10, and the three named
  displacements with their ranks and lost cards.
- The manifest does not change under either mechanism: the catalog build imports only `tokenize`,
  `canonicalRoutingToken` and `STOPWORDS`.
- The holdout read is counts-only in the plan, apart from findings 6 and 7.
- Executor and reviewer assignments match `DECISIONS.md` and the note.

## Verdict

Not ready to execute: finding 1 needs the orchestrator's answer first, and findings 2 to 10 should
be reconciled in the plan before the executor starts.

## Reconciliation (lead, 2026-11-17)

All 13 findings adopted in PLAN.md. Finding 1: put to the orchestrator in QUESTION.md; answer
option (b) — per-mechanism effect targets fixed before any run, the fixed no-loss rule unchanged,
non-SDF displacement at limit 10 must not rise, the TODO records that the round plan's metric is
cause 1. Finding 6 and 11: `compare-routing.mjs` and `measure.mts` rewritten as recommended (pair
identity check, RULE 1 and RULE 2 lines, holdout new-capture count, protocol-history totals, FAM
hash check, tier and score of each stellarOrg card, the two effect targets). Findings 2-5, 7-10, 12,
13: adopted in the plan's text as written.
