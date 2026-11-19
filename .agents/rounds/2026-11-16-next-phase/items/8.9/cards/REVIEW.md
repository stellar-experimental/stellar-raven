# Review: item 8.9, lane `cards` (`<noun>_detail` card binding)

- Scope: `git diff origin/main...HEAD` on `np/8.9-cards` (one commit, `ac2a043d`): `eval/lib/grade.mjs`,
  `eval/self-test.mjs`, `test/routing-card-binding.test.mjs`, `eval/gates.json`, `eval/README.md`.
- Specs reviewed against: `.agents/TODO.md` "Bind the `scout_hackathon_detail` card to its operation",
  lane `cards` in `orch/8.9-LANES.md`, `AGENTS.md`, `eval/README.md` "Card-name normalizer" and "Gate evidence".
- Reviewer: Claude Opus 5.5, high effort, read-only. Runs on Antigravity; the lane author is Gemini 4 Neon.
- Date: 2026-11-19.

## Verdict: PASS WITH FINDINGS

The change is correct and narrow, and it meets the TODO's "Done when" condition. Before the change,
exactly two operation cards in the compiled corpus bound to nothing. Both were `_detail` cards. After it,
none are unbound. The new corpus test fails when the rule is reverted. Gate evidence is consistent and
reproduces exactly. No finding is Critical, High or Medium. The Low findings are about documentation
accuracy, a duplicated guard, and one silent-skip path.

## Verification (all run bare, exit codes as reported by the shell)

| Command | Exit | Result |
|---|---|---|
| `npm run eval:selftest` | 0 | 38 checks ok, including the new `<noun>_detail` check |
| `npx vitest run test/routing-card-binding.test.mjs` | 0 | 5/5 tests pass |
| `npm run eval:routing -- --gate` | 0 | GATE PASS. Legacy 338: top-1 64.8% (219), top-3 86.7% (293), top-5 96.4% (326), card@5 62.6% of 182 (114). Scout card@5 71.6% of 95 (68). Skills top-1 17/23. Holdout top-1/3/5 12/26/30, forbidden captures 11/49 |

Independent aggregate-only checks (scratch scripts outside the repo; they print counts and manifest entry
IDs only, never a case id, question or card label):

- **Before/after on the same top-5 hits.** This compares `origin/main`'s `grade.mjs` with HEAD's. Legacy
  card@5 goes from 113 to 114 of 182: one row gained, zero lost, and the gained row is not in
  `eval/routing-qa-overlap.json`. Extended (16/28) and skills (23/23) do not change. The holdout grade uses
  `cardMatchesExact`, so the new rule cannot reach it.
- **Rule 4's reach over the whole corpus.** I checked every expected, acceptable and forbidden card in
  every lane against every manifest entry. Rule 4 adds exactly two new (card, entry) pairs:
  `scout.getHackathon` and `scout.getSkill`. It adds no other match anywhere. Unbound operation cards: 2
  before, 0 after.
- **Mutation: rule 4 reverted** in a scratch copy of `grade.mjs`. `findUnboundRoutingCards` over
  legacy, extended and skills returns 4 failures (2 `unbound`, 2 `no-catalog-card`). The corpus test would
  go red.
- **Mutations on an in-memory corpus copy:**
  - A typo'd service prefix fails (unbound plus no-catalog-card).
  - A case whose only card is external fails (`no-catalog-card`).
  - A card whose only match is marked `searchable: false` fails.
  - A truncated label such as `scout_hack` passes (see N1).
  - A renamed `expected_cards` field passes (see L3).
- The new test is in `npm test`: vitest's default include picks it up, and `vitest.config.ts` does not
  exclude it. CI runs `npm test`, `eval:selftest` and `eval:routing -- --gate` (`.github/workflows/ci.yml`).
- No Worker bytes change: the diff touches nothing under `src/`, `package*.json` or `wrangler.jsonc`.

## Findings

### L1 (Low): "single-resource" overstates what rule 4 checks

Rule 4 is a pure name rule: `<noun>_detail` binds to `get_<noun>` or `get<noun with underscores removed>`.
It never checks that the target fetches a single resource. For example, `scout_people_detail` binds to
`scout.getPeople`, which is a collection endpoint, because the plural is irregular. A plural noun such as
`changes_detail` would bind to `scout.getChanges` the same way. Today's corpus is not affected: its only two
`_detail` cards each bind to exactly one entry. But the wording appears in three places:

- `eval/README.md` rule 4
- the `cardMatches` doc comment
- the `gates.json` note

All three describe a guarantee the code does not provide. Fix: describe it as a naming convention ("the
singular-noun getter by name"), or drop "single-resource". Adding a singularity check is not needed.

### L2 (Low): the holdout block in the new test duplicates an existing runtime guard

The test "binds every expected and forbidden card in holdout-cases.json to exactly one searchable entry"
re-implements the check that `eval/run-routing.mjs` already throws on (around line 266, "holdout case #…
resolves to N searchable catalog entries (must be 1)"). CI runs that check on every `eval:routing -- --gate`.
The holdout grade uses `cardMatchesExact`, so rule 4 cannot change its outcome.

AGENTS.md says "Cut what adds no visibility". Either delete the block and name the runner check as the
guard, or justify keeping it in the report. The `gates.json` note also says the new test "now fails on any
unbound … holdout card". That guard already existed in the runner before this change.

### L3 (Low): `findUnboundRoutingCards` silently skips a case with no card list

The function returns early in three cases: `expected_cards` is missing, is not an array, or is empty. A
renamed or dropped field in the compiled corpus would therefore pass the "every card binds" test. Today
the compiler emits a non-empty array for every compiled case (legacy 338/338, extended 122/122, skills
23/23), so nothing is hidden now. But that path is the generic way this test could false-negative. Fix:
report `{ lane, caseIndex, cardIndex: null, reason: "no-cards" }` in place of `return`, since every
compiled routing case is expected to carry operation or service cards.

### N1 (Note): "bound" means "creditable by `cardMatches`", including substring tolerance

`classifyCardBinding` uses the grading matcher, so a label is bound exactly when it could earn card@5.
That is the right definition for this TODO. It inherits rule 3's tolerance, though:

- A truncated or typo'd operation that is a 4-or-more-character substring of a real op counts as bound
  (`scout_hack` binds to `scout.getHackathon`).
- Uniqueness is not required outside the holdout. 2 of the 42 distinct operation cards in the compiled
  lanes match 2 entries each. This predates the change.

No change is requested. A stricter typo guard would be a separate decision.

### N2 (Note): the gates-note report link and the round-ledger entry are still outstanding

The `gates.json` note links `.agents/rounds/2026-11-16-next-phase/items/8.9/cards/REPORT.md`, which does
not exist yet. The lane process writes it after this review, so make sure it lands in the same PR. The
`gates.json` `$comment` also requires the decision to be recorded in the round ledger. The lane rules
reserve that edit for the orchestrator, so the orchestrator should add it when it merges.

### N3 (Note): `acceptedTotals.cardHit5` is not machine-checked

`gateEvidenceFailures` only checks that `acceptedTotals.<lane>` exists. Nothing compares a run's card@5
against it, and card@5 is not a gated metric. The 114 was verified independently above. This is
pre-existing and out of scope.

### N4 (Note): the list of external prefixes now exists in three places

`EXTERNAL_CARD_PREFIXES` (`grade.mjs`), `SKIP_REASONS` (`compile-routing.mjs`) and the `labels.mjs` doc
comment each name `perplexity` and `parallel`. If a new general-web label appears in one place but not the
others, the binding test fails loudly. That is the safe direction, so the duplication is acceptable. One
compiled card currently takes the `external` branch, inside a case that also has a catalog card.

### N5 (Note): minor code tidiness

`findUnboundRoutingCards` filters to searchable entries, then `classifyCardBinding` filters the same list
again. This is harmless. `gradingRule` stays `v3-manifest-exposed`, which matches the precedent for earlier
card-normalizer changes such as `2396700f`.

## Spec and rule checklist

| Requirement | Status |
|---|---|
| The binding is fixed generally, not per card | Met. Name-based rule, same service, exact getter equality. `getHackathons`, `compareHackathons`, `listSkills`, `get_project_tags_vocabulary`, cross-service targets, an empty noun and a double underscore are all rejected (self-test). See L1 for the wording. |
| Every corpus card binds to an operation or service | Met. 0 unbound across legacy, extended and skills (holdout: exact, 1 match each). |
| A test fails on an unbound card | Met. Verified by mutation. See L3 for the silent-skip path. |
| Failure output has no case id, question or card label | Met. Failures carry lane, indices and reason only. The synthetic-marker test asserts it. The routing gate prints aggregates only by default. |
| Accepted-evidence process for the card@5 change | Met. Totals, `baselinedAt`, `localTrace` and the note move together in the same commit. Input SHA-256s and thresholds stay the same, which is correct because no input changed. The numbers reproduce. The ledger entry is pending with the orchestrator (N2). |
| Forward-only, no shim | Met. |
| Manifest is the exposed surface (ADR-0003) | Not affected. No catalog change. |
| Case-text hygiene in committed text | Met. The `gates.json` note names one case id, which follows the existing note precedent. That row is not on the overlap list. The test and self-test use only card labels already named by the TODO and the new rule. |

## Reviewer hard-rule compliance

I opened no case text. Searches used `rg --hidden -g '!.git'` from the shell, and I used no built-in viewer
under `eval/` or `.agents/rounds/`. Scratch scripts loaded `eval/routing-cases.json`,
`eval/skills-cases.json`, `eval/holdout-cases.json` and `eval/routing-qa-overlap.json` programmatically,
the way the committed tests do, and printed counts and manifest entry IDs only. I printed no per-row
output. I read no credential, `.dev.vars` or environment. I made no AI Gateway, Workers AI or provider call.
I deleted the gitignored `eval/results/` file my gate run created. I changed no repository file other than
this one.
