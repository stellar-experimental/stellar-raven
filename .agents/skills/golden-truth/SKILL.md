---
name: golden-truth
description: "Change the golden Q→A corpus without codifying lies: classify the truth domain, triangulate across independent source classes, encode disputed or unverifiable facts honestly, and land provenance-bearing edits to the owned per-case corpus. Use when editing eval golden answers, key facts, avoid clauses, sources, grader notes, or truth metadata."
---

# Golden truth

A wrong agent answer costs one verdict. A wrong golden corrupts every later round, and a golden
"corrected" from thin evidence is worse, because it carries the authority of a review. So:

> Never change gospel from a single source class, never pin a disputed fact, and never change truth
> because a score would improve.

This skill governs every change to judge-facing gospel (`question`, `golden.answer`,
`golden.keyFacts`, `golden.avoid`, `golden.notes`, `tags.freshness`, `tags.trap`) and to the
judge-blind `truth` block. Edits land in `eval/qa/corpus/battery/<category>/<id>.json`. The CI
gospel-change lint rejects a judge-facing change unless `truth.verified` changed in the same diff
with `evidence` and `rootCause`. A separately frozen suite whose contract invokes this skill uses
the same bar and stays in its own file.

Spend verification effort where it can change the edit: meet the bar below for each claim you
change, then stop.

## 1. Classify each claim

| Domain | Gospel means | Examples |
|---|---|---|
| real-world / protocol | Primary sources and source code. A lagging aggregator is an `improvements/` finding, never a reason to weaken the golden | RPC limits, CLI commands, SEP semantics |
| corpus-grounded | What the live community corpora support now, cross-checked against the world. Label corpus-only facts as source-relative. A corpus-vs-world contradiction is a finding, graded leniently on both sides | Events, builder directories, project records |
| freshness-sensitive | A behavior, never a pinned value. A point-in-time figure needs an `asOf` date in the golden text, `tags.freshness: "scheduled"`, and `truth.reverifyBy` | SCF amounts, versions, rosters |

Record `truth.domain` (`real-world`, `corpus-grounded`, or `mixed`) per case; classify per claim.

- An index or corpus miss creates no documentation obligation. Find the canonical owner and
  whether the tested surface undertakes to host the fact. Otherwise record a coverage diagnostic.
- An owner's decline is evidence about placement, not proof that the fact is false. Keep
  corroborated truth and add a symmetric grader caution so neither accurate phrasing is penalized.

**Canonical-page conflicts.** When a canonical page or aggregator conflicts with stronger
authority, verify both claims. A reconciled answer may be `correct`; an attributed but unresolved
canonical-page claim is at most `partial`; the same false claim without attribution is `wrong`. Put
the caution in that case's `golden.notes` in the lint-canonical form: name the page or source,
state that an attributed quote is not a wrong claim, and state the cap. A cap must name an active
`improvements/` finding (`verified`, `reported-upstream`, or `declined-upstream`) or the
`cap-finding` lint fails (ADR-0008). File that finding once its live re-check passes, and remove
the cap in the change that marks the finding `fixed-upstream`.

## 2. Source classes

Independence is between classes. Two hits from one class are one witness.

| Class | Source |
|---|---|
| A | Official primary docs and sites |
| B | Source code and repos: the ground truth for limits and behavior |
| C | Live service APIs. The aggregator under check never corroborates its own claim. Use documented read paths; treat provisioning or creation endpoints as side effects even on `GET` |
| D | General-web research (metered; use it when a claim needs it). Paid Lumenloop research stays off |
| E | The Stellar Docs search index: checks the fact and its discoverability |
| F | Empirical execution on testnet or free live operations: the strongest class for how-to claims |

These letters are the `class` values in `truth.sources[]` and corroboration rows.

## 3. The bar by claim type

| Claim | Minimum |
|---|---|
| Numeric limits, versions, amounts, dates | Two independent classes, at least one primary (A or B) |
| Entity attribution or status | A primary source plus one independent class |
| Existence or footprint | One authoritative source plus a no-contradiction web sweep. For corpus facts, the live corpus plus external footprints for at least five sampled items |
| Negative claims | Absence from primary records plus an explicit web sweep, phrased as of a date and relative to the source |

Record rows in `truth.corroboration[]`: `{claim, verdict, evidence: [{class, ref, observedAt,
note}]}`. Verdicts are `confirmed`, `confirmed-as-of`, `disputed`, `unverifiable`, `corpus-only`,
and `contradicted`. `contradicted` is legal only for a claim mirrored in `golden.avoid`. The lint
requires rows for `disputed` or `unverifiable` status, for cases named by a register
`numericInvariants` entry, and for numeric, version, or date key facts on `real-world` cases.

## 4. Verify

Verify a small change yourself. For several claim clusters, give one cluster to each research lane
(`AGENTS.md` "Coordination") with an explicit class mix. Lanes do not edit files. Each returns
exact quotes, URLs, and dates that a stranger can re-walk. `unverifiable` is an honest verdict;
when two lanes disagree, run a targeted probe and do not average.

For a disputed fact, a negative claim, or high-weight volatile truth, add a reviewer who re-derives
the fact from live sources without reading the proposer's notes. Reviewer and author differ.

## 5. Encode by verdict

| Verdict | The golden may |
|---|---|
| confirmed | Pin it, with an `asOf` in the text if it is volatile |
| disputed | Never pin. Set `truth.status: "disputed"`, record both sides, add a grader caution ("sources disagree; do not penalize either figure"), use sourcing-guard avoid items instead of number traps, and file the reconciliation upstream |
| contradicted | Fix the golden and record how the wrong fact got in |
| unverifiable | Not claim it. Move it to `golden.notes` or remove it. Label corpus-only facts ("per the Scout corpus") |

- **Gate the durable form** of a contested or volatile fact: the protocol version, the CAP or SEP
  ID, "cite a dated primary source", or the behavior of flagging staleness.
- **Update `truth.verified`** on every gospel change. It holds the latest event only: `date`, `by`,
  `evidence` (URLs or ledger paths), and `rootCause` (an `improvements/` path, a `.agents/TODO.md`
  entry, or `freshness-drift`). A score or verdict is never a root cause.
- **Volatile facts.** Refresh `truth.asOf`. On `scheduled` cases set a new `truth.reverifyBy`,
  quarter-granular and staggered across cases. When a re-check confirms an unchanged value, update
  the date in the golden text at the next judge-facing edit.
- **Source sentinels.** When `truth.asOf` moves on a case in `eval/qa/source-sentinels.json`,
  re-confirm its anchor (`npm run eval:qa:sentinels -- --ids <id>`) and set `caseAsOf` in the same
  change. Add a sentinel when a volatile value sits on a primary page that a plain fetch can read.
- **Sibling sweep.** Search the battery for the same entity and numbers, confirm that no sibling
  case now contradicts the change, and record the cases checked. Then run
  `npm run eval:qa:register`, which re-stamps member hashes and reopens changed clusters.
- **Archives.** `eval/corpus/` is read-only and never a source of gospel. Record a correction in
  the owned case's `truth` block and any finding.
- **Traps** punish only claims that this verification shows are false. A trap that is true only
  until a known future event goes in `consistency-register.json` under `dateContingentTraps` with
  its trigger; re-verify it when the trigger passes.

## 6. Test and close

```sh
npm run eval:qa:compile                  # commit regenerated cases.json and sample.json with the edit
npm run eval:qa:lint -- --since <ref>    # add --stale when reverifyBy dates changed
npm run eval:qa:register
```

- Only the intended cases changed (compare parsed JSON).
- If a stored run's decision depended on the changed golden, re-judge that row and record the
  direction. Fixes that only ever flip verdicts toward `correct` are a warning sign of score
  laundering.
- Record the affected case IDs and corroboration in the round ledger or pull request.

## Lifecycle

`truth.lifecycle.state` is `proposed`, `active`, `quarantined`, or `retired`;
`truth.lifecycle.reviewState` is `none`, `queued`, `in-review`, or `resolved`.
[`eval/qa/README.md`](../../../eval/qa/README.md#case-schema-and-golden-lifecycle) holds the full
contract. The decisions this skill owns:

- **Propose, then activate.** A new ID lands as a proposal in one commit and activates in a later
  commit after source verification, duplicate and boundary checks, and an independent reviewer.
- **Leaf.** A new case names its taxonomy leaf from `eval/qa/taxonomy.json` in `truth.leaf`.
- **Quarantine** before the next aggregate when an independent reviewer confirms a
  score-independent truth or validity conflict. Record author, reviewer, evidence, start date, and
  a decision date within 30 days. That decision corrects, retires, or independently renews the
  case; reactivation is never automatic. Judge noise alone sets `reviewState: queued`.
- **Retire** only for a score-independent reason: duplication, obsolete scope, unanswerable
  wording, or lost relevance. The tombstone keeps evidence, reviewer, date, last digest, and
  replacement IDs. IDs are never reused.
- **Mass review** starts at the earliest of 25 queued active cases, five percent queued, or one
  quarter. Bind it to the `qa-mass-review-rules-v1` digest, keep reviewers blind to the desired
  score movement, and report corpus health separately from system performance.
- A review trigger changes no gospel by itself, and score direction never decides a lifecycle
  verdict.
