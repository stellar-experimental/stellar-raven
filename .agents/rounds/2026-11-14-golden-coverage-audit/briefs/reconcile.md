# Brief: reconcile the surface map

Read `briefs/common.md` first. Your lane is `map-reconcile`.

## Task

Merge `map/map-supply.json` and `map/map-demand.json` into one taxonomy, `map/taxonomy.json`. It
is the coverage map that the battery is measured against, so it must be complete, non-overlapping,
and as small as it can be without hiding a topic.

**Do not read `eval/qa/corpus/` or `audit/*.json` before the taxonomy is written.** After it is
written, read only the `missing` and `crossCategoryDuplicates` arrays of each `audit/*.json` that
exists, and add a leaf for any real topic that both mappers missed. Record each such addition in
`notes`.

## Method

1. Align the two domain lists. Choose the domain set that splits Stellar most cleanly: about 12
   domains, none a catch-all.
2. Merge leaves that test the same knowledge. Split a leaf that one question could not cover.
   Keep a leaf that only one mapper found when its evidence shows real demand or real risk.
3. Set `weight` again across the whole map with one standard (3 = constant need or a wrong answer
   loses funds or breaks a build; 2 = regular; 1 = niche but real). At most a quarter of leaves are
   weight 3. Where the mappers disagree by two steps, check one source and decide.
4. Set `cases`: the number of battery cases the leaf deserves. Weight 3 gets 2 or 3, weight 2 gets
   1 or 2, weight 1 gets 1. Give 3 only when the leaf has clearly separate facets (for example
   concept, how-to, and a failure mode). Add a `facets` list that names them.
5. Keep behavior cases outside the topic tree: add one domain `behavior` whose leaves are the trap
   and safety behaviors an agent must show (scam check, prompt injection, out of scope, fabrication
   bait, no-info honesty, freshness honesty, paid-action refusal, ambiguity, speculation).

## Output

`map/taxonomy.json`, same shape as the mapper files, with these changes per leaf: add `cases`,
`facets`, and `from` (`["supply"]`, `["demand"]`, or both); keep the better `question`. Add
top-level `totals` (`domains`, `leaves`, `cases`, counts by weight and volatility) and `notes`
(merges, splits, drops, and additions, each with a reason).

Also write `map/taxonomy.md`: one table per domain with leaf id, title, weight, volatility, and
cases, for human review.

Done when both files exist, the JSON parses, every leaf id is unique, and `totals` matches.
