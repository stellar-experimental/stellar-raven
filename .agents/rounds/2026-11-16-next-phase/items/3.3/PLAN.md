# Item 3.3 plan: two ranker mechanisms, one measurement each

Lead: Claude Opus 5.5, agentpc `t1sj`. Worktree `/home/tyler/code/raven-wt/np-3.3`, branch
`np/3.3-ranker-mechanisms`, base `origin/main` `e710b5d3` (after #462). Binding inputs: round
[PLAN.md](../../PLAN.md) 3.3, [DECISIONS.md](../../DECISIONS.md), the orchestrator note
`/home/tyler/code/raven-wt/orch/3.3-NOTE.md`, the orchestrator's answer to
[QUESTION.md](QUESTION.md) (option (b), 2026-11-17), and `.agents/TODO.md` "Treat stellar.org
routing reach as a lexical and description question".

Names: this plan calls the mechanisms the **prefix floor** and **gate-failed slot keeping**. Write
those names in code comments, tests, the README and the TODO (`M1` and `M2` already mean other
things in this repository).

## Decision

Whether each of two general ranker mechanisms ships: it removes the ranker cause it targets, with no
loss elsewhere. Otherwise it is recorded in the TODO and dropped. USD 0: no model call, no network,
no local server.

The round plan's metric (a `stellarOrg` card displacing a non-SDF card at limit 10, 3 of 25) is not
a target here. All three displacing cards are gate-failed backfill on short pages, matched by exact
description and id tokens. That is cause 1, the `search_site` description, which neither mechanism
touches ([QUESTION.md](QUESTION.md)). It stays a no-rise check.

## Facts re-checked on `e710b5d3`

- The instrument reproduces the tuning loop 2 step 2 reviewer's probe (`STEP-2-REVIEW.md` S3)
  exactly (`measure.mts`, this folder):
  - probe, non-SDF (25 rows): a `stellarOrg` card is on the page, and displaces a card, at limit 5
    on 0, at 7 on 1, at 10 on **3**. SDF (5 rows): on the page at limit 5 on 2, at 10 on 4;
  - off-golden 40 reach: question form 8 / 8 / 10 at limits 5 / 7 / 10, keyword form 14 / 16 / 18;
  - FAM development, 64 labelled rows, operation reach: 55 / 58 / 63 at limits 5 / 7 / 10 (the
    family-decider audit's A0 55 and A1 58).
- The three non-SDF displacements at limit 10, with each card's tier, score and the page's gated
  candidates:
  - `search_site`, rank 6, backfill 45, 0 gated candidates;
  - `search_site`, rank 9, backfill 43, 1 gated candidate;
  - `get_page`, rank 8, backfill 200, 9 gated candidates.
- The targets on `main`. "which organizations run validators" (limit 5) has `stellarOrg.get_page`
  at rank 1, gated 62, through `organizations` against the short token `org`. "Tier 1 organization
  validators quorum requirements" (limit 8) has `get_page` and `search_site` at ranks 1 and 2,
  backfill 52 each. "soroban reentrancy security" (limit 8) fills a full gated page, and
  `stellarDocs.search_soroban_contract_docs` (gate-failed, 111) is absent.
- The prefix rule is `c.startsWith(token) || token.startsWith(c)` in
  `src/catalog/vendor/search-scoring.ts:85` (`scoreField`) and its ungated replica
  `src/catalog/scoring.ts:491` (`scoreFieldUngated`). `tokensOverlap` (`scoring.ts:149`) already
  refuses a prefix match when the shorter canonical token is under 4 characters.
- Gate fill lives in `searchCatalogPage` (`src/catalog/search.ts:1232`). Tier 2 runs only on a short
  gated page. On a full page, `preserveStrongBackfill` admits a gate-failed candidate only with the
  1.6 cross-tier margin, higher intent coverage and a service over quota.
- `eval/gates.json`: holdout forbidden captures 10, ceiling 10.
- The public `search` default is 7 (`src/mcp/tools.ts:55`). `codemode.search` defaults to 10.
- **Prior measurement of the prefix floor's shape.** On 2026-10-02 the same expression with a floor
  of 3, in both scorers, failed the gate. Legacy went 229/303/319 against 219/298/326, extended
  92/104/109 against 93/111/117, and holdout forbidden captures were 12 against 10
  (`.agents/rounds/2026-10-02-routing-adapter-repairs/lane-c-report.md`). A floor of 4 removes every
  match a floor of 3 removed, and more, so the expected result is a rule 1 failure. The 2026-09-17
  audit (`research/audits/2026-09-17-routing-audit/scorer-followup-plan.md`) and the TODO's
  short-token item also advise against length thresholds. The round plan authorizes one measurement
  anyway, and 4 is the existing `tokensOverlap` constant, not one tuned here.

## The two mechanisms, fixed now

No variant, and no constant chosen after a run.

**Prefix floor.** This plan takes the TODO's form ("4 or more characters for the vendor prefix rule,
as `tokensOverlap` already does"). That form applies the floor to both directions, not only to the
field side the round plan names. In both `scoreField` (vendor) and `scoreFieldUngated` (replica):

```ts
} else if (fieldTokens.some((c) => Math.min(c.length, token.length) >= 4 && (c.startsWith(token) || token.startsWith(c)))) {
```

(`field.tokens` in the vendor file.) The exact-token branch and the substring branch
(`raw.includes(token)`) stay unchanged, so the two directions behave differently:

- a short field token against a longer query token (`org` against `organizations`) now matches
  nothing;
- a short query token against a longer field token (`org` against `organizations`) still matches at
  the substring weight 1 and only loses the weight-2 prefix tier.

No ratio rule, and no canonicalization.

**Gate-failed slot keeping.** In `searchCatalogPage`, between the `preserveStrongBackfill` call and
the `preserveIntentWithinServiceQuota` call:

```ts
if (gatedPageIsFull) {
  const gateFailed = scoreCandidates(catalog, opts, scoreEntryWeightedUngated, query,
    (entry) => !gatedIds.has(entry.id));            // sorted by score desc, then id (scoreCandidates)
  const onPage = new Set(selected.map((c) => c.entry.id));
  const counts = service counts over selected;
  // victim: lowest-scoring gated card at index > 0 of `selected` as it stands now
  // (before interleaving); tie → the higher index
  const victimIndex = argmin over i >= 1 with gatedIds.has(selected[i].entry.id) of (selected[i].score, -i);
  if (victimIndex exists) {
    const victim = selected[victimIndex];
    const candidate = first c in gateFailed with !onPage.has(c.entry.id) &&
      (c.entry.service === victim.entry.service || (counts.get(c.entry.service) ?? 0) < serviceQuota(limit));
    if (candidate && candidate.score > victim.score) selected[victimIndex] = candidate;   // in place, no sort
  }
}
```

- The pool comes from `scoreCandidates`, so its existing exclusions still apply: unsearchable
  sections, routing-intent rejections, refused whole skills, and the `opts` kind and service filters.
- The existing `ungated` pool and its admission filter stay unchanged, so `preserveStrongBackfill`
  and `preserveIntentWithinServiceQuota` get the same inputs as today.
- The rule makes at most one swap, whether or not `preserveStrongBackfill` already swapped.
- The swapped-in card's tier is `backfill`. `total` and `truncated` keep their full-page meaning.
- `preserveIntentWithinServiceQuota` runs afterwards and may evict the swapped-in card. That is
  intended: the intent rule keeps the last word.
- Short pages, rank 1 and the other rules are untouched.

## Effect targets (orchestrator, option (b)), fixed before any run

`measure.mts` prints both targets; on `main` both read "not met".

- **Prefix floor:** no `stellarOrg` card on the page for "which organizations run validators"
  (limit 5) or for "Tier 1 organization validators quorum requirements" (limit 8).
- **Slot keeping:** `stellarDocs.search_soroban_contract_docs` is on the page for "soroban
  reentrancy security" at limit 8.

A met target counts only if the no-loss rule also passes. Nothing is tuned toward these queries.

## Steps

Executor: Claude Sonnet 5.5 (the owner's decision; the round plan named Codex frontier before it).

1. **Base commit** on the item branch: this folder's `PLAN.md`, `REVIEW.md`, `QUESTION.md`,
   `probe-queries.json`, `measure.mts`, `compare-routing.mjs`, `briefs/`. Run the base measurement
   ("Measurement" below) and record the base results path.
2. **Prefix floor alone**, on a local branch `np/3.3-prefix-floor` from the base commit.
   1. Make the code change only: the two lines above, in the two files.
   2. Run `npm test` and the measurement. Record every failing existing test by name (not its
      output), and classify it under rule 6.
   3. If rules 1 to 6 pass: add the tests and docs below, then run all the gates. If not, save the
      code diff as `prefix-floor.patch` in this folder and stop work on this mechanism.
   Tests (`test/scoring.test.ts`, both scorers, drift guard green):
   - query `organizations` against field token `org`: no match;
   - query `org` against field token `organizations`: matches at the substring weight;
   - `fund`/`funds`: keeps the prefix weight;
   - `dex`/`dexes`: lost (the known cost);
   - the `cs-001` fragments `s`, `a` and `re` match nothing longer through the prefix branch.
   Docs: the vendor header (the floor is a local adaptation, not upstream math); in
   `src/catalog/scoring.ts:434-462`, the "line for line" and "byte-identical" sentences and the
   re-vendor checklist (carry the floor forward); in `src/catalog/README.md`, the token-match line and
   line 68.
3. **Slot keeping alone**, on `np/3.3-slot-keeping` from the base commit. Same order: code change
   only, then `npm test` and the measurement, then tests and docs if rules 1 to 6 pass; otherwise
   save `slot-keeping.patch` in this folder.
   Fixtures (`test/search.test.ts`):
   - a full gated page whose weakest gated card loses to a higher gate-failed entry;
   - one where the entry does not outscore it;
   - a quota case;
   - a short page unchanged;
   - a page where `preserveStrongBackfill` already swapped and slot keeping swaps once more;
   - a page where `preserveIntentWithinServiceQuota` evicts the swapped-in card.
   Docs: `src/catalog/search.ts` doc comments at 1072-1076 and 1214-1231, `src/catalog/README.md`
   (admission rules, lines 84-86), and the tier description in `ARCHITECTURE.md` (76-84).
4. **Decide per mechanism** by the pass rule:
   - both pass alone: cherry-pick both onto the item branch and measure the combination once;
     if the combination fails, ship neither and report;
   - one passes: cherry-pick that one;
   - none passes: the item branch carries only the records and the patches.
   The measurement branches stay local and are never pushed. A dropped mechanism's code survives as
   its patch file.
5. **Re-baseline only upward**, only for what ships, in the commit that moves it. If the shipped
   change raises a legacy or holdout total or lowers forbidden captures, update `eval/gates.json`:
   `legacy.top1/top3/top5` (`eval/self-test.mjs:78-81` asserts they equal the accepted legacy totals),
   `evidence.acceptedTotals`, `baselinedAt`, `evidence.localTrace` and `evidence.notes`. Add a line
   to the round ledger. `skills.minTop1`, the holdout floors and `maxForbiddenCaptures` stay as they
   are. The manifest does not change, so no fingerprint moves.
6. **Records.**
   - `MEASURE.md` in this folder: one table per mechanism (and the combination), with:
     - the commit, each gate's exit code, and each run's results path;
     - the probe, effect-target, off-golden and FAM cells;
     - the `compare-routing.mjs --lists` output: ids for the legacy, extended, skills and
       protocol-history rows it may name, and counts for the rest (108 legacy and 43 extended rows
       are confirmation-only; holdout rows are counts only);
     - the verdict per rule.
     State that the FAM cells come from a file that exists only on agentpc.
   - `.agents/TODO.md`, the stellar.org reach item:
     - each mechanism's result in one or two sentences, and each dropped one named as dropped with
       no second variant;
     - the round plan's metric (non-SDF displacement at limit 10) is cause 1, the `search_site`
       description, and this item leaves it untouched;
     - the 2026-10-02 floor-3 failure, next to the prefix-floor result.
   - If the prefix floor ships, two more updates:
     - the TODO short-token item gains one sentence: Raven carries a local floor, and the item stays
       open for the upstream repair;
     - `cs-001`'s "Raven impact" evidence line is updated through the `improvements-pipeline` skill,
       then `npm run improvements:lint`.
   - `EXEC.md`, per the lead brief.

## Measurement, per mechanism (and the combination)

- `npm run eval:routing -- --gate > <scratch>/routing-<label>.log 2>&1`, with the exit code
  recorded. The runner prints holdout rows before the gate verdict, so read the log only with
  `sed -n '/^GATE/,$p' <log>`; that section holds the verdict, its reasons, the lane totals and the
  results path. Never open an `eval/results/routing-*.json` file: only `compare-routing.mjs` reads
  it.
- `node .agents/rounds/2026-11-16-next-phase/items/3.3/compare-routing.mjs --lists <base results> <variant results>`.
  It refuses a pair from different manifests or cases, prints a RULE 1 and a RULE 2 line, and exits 1
  on either breach.
- `node .agents/rounds/2026-11-16-next-phase/items/3.3/measure.mts <scratch>/measure-<label>.json ~/backups/fd-2026-11-14/split/fam.development.discovery.json`.
  The script checks the FAM file's SHA-256. Its per-row output stays in scratch, outside the
  repository; only counts go into the records.

## Pass rule

The no-loss half is fixed by the round plan and the orchestrator note. The effect half is the
orchestrator's answer. A mechanism passes only if every rule holds on its first measurement:

1. Legacy, skills and holdout: no row goes hit-to-miss on any metric, no holdout row is newly
   captured, forbidden captures stay at or under 10, and `eval:routing --gate` exits 0
   (`compare-routing.mjs` RULE 1).
2. Extended lane: no strict total (top-1, top-3, top-5, card@5) falls (RULE 2). A hit-to-miss row
   offset by a miss-to-hit row passes this rule, and the per-case reviewer reads every extended
   hit-to-miss id.
3. Off-golden 40: no cell falls (question and keyword form, limits 5, 7 and 10).
4. FAM development: operation reach does not fall at limits 5, 7 or 10.
5. Effect: the mechanism's own target above is met, and non-SDF probe displacement at limit 10 does
   not rise above 3.
6. Unit tests: an existing test that fails is a loss when it asserts the membership, rank, tier or
   admission of a named card that the mechanism's stated rule does not itself define. A test that
   pins a number, or the invariant the mechanism removes, is re-pinned and listed in `EXEC.md`.
   Known cases:
   - prefix floor: the pinned scores (`test/scoring.test.ts:215` `toBe(812)` and the pinned numbers
     in `test/search.test.ts`) are re-pinned;
   - slot keeping: "keeps pages without targeted replacements entirely in tier 1"
     (`test/search.test.ts:1009-1024`) and the one-backfill-hit expectation at 1026-1043 assert the
     invariant it removes, so they are re-pinned.

Protocol-history and the SDF probe rows are reported, not gated.

## Gates

On each shipping commit, bare (redirect, no pipe): `npm run typecheck`, `npm test`,
`npm run build`, `npm run secrets:scan -- --tree`, `npm run eval:routing -- --gate`, and once
`npm run test:smoke` (`codemode.search` and the demo read the ranker). Add `npm run eval:selftest`
when `eval/gates.json` changes, and `npm run improvements:lint` when `improvements/` changes. A
failing unit test can print a routing row, so `EXEC.md` names failing tests only and quotes none of
their output.

## Reviews

- Plan: Claude Fable, [REVIEW.md](REVIEW.md). All 13 findings adopted. Finding 1 went to the
  orchestrator, who chose its option (b).
- Per-case changes (orchestrator note): after execution, a separate Claude Fable child reads
  `MEASURE.md`, the `--lists` output for every measured mechanism, and the shipped diff. Findings go
  to `CASE-REVIEW.md`, and the executor reconciles them.

## Stop rule

The first measurement of each mechanism decides. No rerun after a code change, no second constant,
and no other placement of slot keeping. One case allows a single fix: the code does not do what this
plan states, and the measurement has not been read yet. `EXEC.md` records it. A fix after a reading
is a variant and is not allowed.

## Risks

- The prefix floor is expected to fail rule 1 (the 2026-10-02 floor-3 result above).
- Slot keeping can swap in a high-scoring card that covers one query token. Rules 1 to 4 catch
  losses, and the per-case review reads the gains.
- The holdout lane is at its ceiling, so a single new capture fails either mechanism.
- The runner prints holdout rows to stdout, and the results JSON holds them. Neither is opened.
- If anything ships, Worker bytes change and a deploy follows.

## Out of scope

- Moving the FAM development rows into `eval/discovery/`. The TODO says this is owed with this item,
  but it changes the routing set and needs its own gate run. The lead raises it in the report.
- `stellarOrg` description edits (cause 1). The `src/catalog/README.md` line that still says the
  public `search` defaults to 5 (the code says 7) goes to the lead's report for item 3.5.

## Needs from the orchestrator

Answered: option (b). After execution: a deploy if anything ships, and the production checks in
`REPORT.md`.
