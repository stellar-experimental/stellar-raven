# Issue #124 same-service selector — design review — Grok 4.6 high — 2026-09-09

Reviewer: Grok 4.6, high effort.
This is a bounded design review, not implementation acceptance.
No source edit, GitHub write, paid call, gate run, or eval-case tuning.
This file is the only write.

Read: `.agents/rounds/2026-09-09-search-124-sol.md`, accepted `b6913d1` catalog cards, `src/catalog/scoring.ts` diversity comments, and `src/catalog/types.ts` retrieval lanes.
The worktree experiment is not proof.

## Verdict

The fourteen rules are one general overflow reservation, not a two-query special case.

They do not name `scout.getLeaderboard`, the two leaderboard strings, or any other operation id.

One numeric floor is example-shaped and should change before implementation freeze.

**Required correction:** drop independent rule 5 (“at least four distinct query content tokens”).
Replace it with a remainder rule: the description must cover at least two query content tokens on its own.

Proceed on that restated intent test. Do not treat this note as code acceptance.

## What the mechanism is

Existing diversity already keeps a service’s first in-page hit and trims later same-service rows to the quota.
On a five-hit page the Scout quota is two.
For both issue queries, `scout.searchProjects` and `scout.searchRepos` take those two slots.
`scout.getLeaderboard` is already gated (108 and 129) and then dropped.

The proposal does not retune the scorer.
It inspects gated overflow after that quota cut.
It may replace one later same-service slot when overflow is a complete source reading of the query and the occupant is not.

That is a selection-set repair. It matches the diagnosed cause.

Rules 1–3 and 10–14 are containment around current diversity.
Rules 4 and 6–9 are the intent test.
The list looks like fourteen knobs. It is two layers.

## Focused rationales

### Four query tokens — correct this

The shorter issue query has four content tokens: `top`, `projects`, `github`, `activity`.
The longer query has five.
A floor of four is the length of the short example.

Rules 6–8 already require a hard shape: one phrase, two-token overlap, and at least one token that the description lacks.
Those rules, not the integer four, keep unigram keyword bags from qualifying.

The integer’s extra effect is to reject shorter queries that the same shape would accept, such as a three-token ranking query whose description already names the objects.
That is under-general, and it is keyed to the example length.

Do not keep an unexplained constant that equals the short probe.

**Replacement:** the description alone must cover at least two query content tokens.
Then the completing phrase is a fragment, not the whole query.
`top projects` (two tokens) fails.
The two issue queries still pass, because the accepted description already carries `projects`, `GitHub`, and `activity`.

### Single positive phrase — keep

One contiguous published span is one source claim.
Joining two `useWhen` or `exampleQuestions` strings would let a card stitch unrelated intents.
Joining `routingKeywords` unigrams would be worse: accepted `getLeaderboard` and `searchRepos` both carry a `top` token in that bag.

“Positive” must mean purpose / useWhen / exampleQuestions, never `notFor`.
The catalog already drops `notFor` so `getBuilders` does not inherit `leaderboard`.

A phrase is a source substring, not two keywords that happen to co-occur.

### Two-token overlap — keep

Two is the minimum that distinguishes a phrase from a keyword.
The accepted completing span `top projects` is two tokens. That does not make the minimum a special case.
A one-token overlap would let any routing unigram that fills the missing word qualify.

Do not raise this to three. That would shrink the rule to this one span.

### Full description-plus-phrase coverage — keep

This is the load-bearing general test.
The overflow card must be a complete reading of the query from description plus one phrase.
Schema `keywords` do not count.

On accepted `1.9.1` that is why `searchRepos` loses `activity` and `getLeaderboard` does not.
The description of `getLeaderboard` already states ranked projects, GitHub, and activity.
The phrase supplies `top`, which the prose never says.

Do not weaken this to partial coverage. Partial coverage is ordinary scoring, and scoring is out of scope.

### Preserve the first slot — keep

Lever 3 already never displaces a service’s first in-page hit.
The selector only competes for a later quota slot.

That is conservatism, not a leaderboard encoding.
The first Scout hit on both issue queries is a name-boosted `searchProjects`.
The repair leaves that hit in place and only challenges `searchRepos`.

If a later query put a weak occupant first, this rule would refuse to fix it.
That is an accepted limit, not a defect in #124.

### Detail exclusion — keep, with one implementation bound

`RETRIEVAL_LANES` already includes `detail`.
The rule must use `retrievalProfile.lane === "detail"`.

It must not use a `get*` name prefix.
Accepted `getLeaderboard` is a collection. Eval `op-classes.json` already overrides it to `broad` for that reason.
A prefix test would exclude the issue target.

Accepted `getLeaderboard` has **no** `retrievalProfile`.
Treat missing lane as not-detail, never as detail.
`searchProjects` and `searchRepos` are `directory`. They remain eligible occupants.

This guard is not required to move the two issue queries. It stops a one-entity read from taking a later slot when a phrase happens to cover the query.

## What is not a flaw

- Ignoring schema `keywords` is required. Those tokens are field shrapnel. They are why `searchRepos` can mention activity without ranking projects.
- At most one later slot, restore existing score order, and keep service counts are blast-radius limits. They are not example checks.
- Leaving jobs/freelance and Blend/`explainRepo` to source wording is correct. Those are not gated selection defects on `1.9.1`.
- The selector must not ship as a `1.9.49` admission repair. That is a separate decision.

## Smallest principled correction

Replace rule 5 only.

Keep: gated overflow only; one positive contiguous phrase; two-token overlap; phrase adds a token the description lacks; description plus that phrase cover every content token; skip `detail` lanes; never move the first same-service hit; replace at most one weaker later slot; restore score order.

Do not add operation ids, query lists, or leaderboard vocabulary.

## Implementation acceptance is separate

This review does not clear tests, routing gates, or a worktree diff.
If the candidate keeps this restated intent test and the containment rules, a later independent code review can check the patch.
