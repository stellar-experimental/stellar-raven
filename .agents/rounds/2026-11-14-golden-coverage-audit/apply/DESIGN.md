# Apply design — golden coverage audit, 2026-11-14

Lane `instrument`. Scope: how the reviewed audit records become corpus edits, and the coverage
rules that replace `CATEGORY_FLOORS`. Code is in `eval/qa/` and `apply/apply.mjs`.

## 1. Retire

The retirement path already exists (`tombstoneProblems`, `buildLifecycleRegistry`). No case was
retired before, so `corpus/retired/` is created by the first tombstone. The record is
`eval/qa/corpus/retired/<id>.json`:

```json
{
  "id": "q-…",
  "lifecycle": { "state": "retired", "reviewState": "resolved" },
  "retired": {
    "date": "2026-11-14",
    "author": "audit-<lane> (golden coverage audit)",
    "reviewer": "verify-<lane> (golden coverage audit)",
    "reason": "<verifier why, else auditor reason; score-independent>",
    "ledger": ".agents/rounds/2026-11-14-golden-coverage-audit.md",
    "evidence": ["<audit record path#id>", "<verify record path#id>", "<coverage.json#id>", "<rot refs>"],
    "lastCaseContentSha256": "<contentSha256(case) — equals the committed registry digest>",
    "replacementIds": ["<survivor>"]
  }
}
```

- A merged case is a retirement whose `replacementIds` is `[survivor]`; a plain retirement has `[]`.
- `reason` must pass `SCORE_CAUSE_RE` (no "score", "verdict", "headline", "accuracy", `t1`…).
  Ten auditor reasons and fourteen verifier notes trip it. The script uses the first clean text
  from coverage `note`, verifier `why`, auditor `reason`, and refuses the record when none is
  clean.
- The reviewer is the verifier lane. A case no verifier checked (five `keep` records) can only be
  retired through a coverage decision; the reviewer is then the coverage lane.
- The compiler checks `lastCaseContentSha256` against the git-anchored registry. Case files that
  retire are untouched before retirement, so the digest matches whichever registry was last
  committed.
- **Migration ledger.** 689 ledger rows name battery cases as destinations; compile and lint failed
  any destination that is not a battery case. Destinations may now also be retired IDs (the
  ledger is history, the tombstone points forward). The `truth.origin` check applies only to a
  live destination. No ledger row changes, so `LEDGER_SOURCE_COUNTS` stays.

## 2. Rewrite

A judge-facing change passes the gospel lint (`lintGospelChanges`) with a new `truth.verified`:

```json
{
  "date": "2026-11-14",
  "by": "Golden coverage audit 2026-11-14 (audit-<lane>, verify-<lane>; .agents/rounds/2026-11-14-golden-coverage-audit.md)",
  "evidence": ["Audit record: …/audit/<lane>.json#<id>", "Verifier decision: …/verify/<lane>.json#<id>",
               "Live <class> <observedAt>: <ref> -- '<quote>'", "…"],
  "rootCause": [".agents/TODO.md — <exact ### heading of the round entry>"]
}
```

- **rootCause anchor.** The golden-truth skill allows an `improvements/` path, a `.agents/TODO.md`
  entry, or `freshness-drift`. The corpus convention is `.agents/TODO.md — <exact heading text>`
  (no `#`, an em dash, the heading without the `### `). The script takes the heading as
  `--todo-heading`; the orchestrator's TODO entry must use that exact text. Suggested heading:
  `Apply the 2026-11-14 golden coverage audit`. `freshness-drift` is added only when a rot entry
  for the case is `changed`.
- **Corroboration.** The lint fails a real-world numeric/version/date key fact with no covering
  `truth.corroboration` claim. Each `holds` rot entry with evidence becomes a row
  (`confirmed-as-of` for scheduled/live, `confirmed` for stable). A `changed` entry states the old
  claim, so it goes to `truth.verified.evidence` only. Old rows stay.
- **Moved notes.** One new field, `truth.notes` (string): the old `golden.notes` verbatim, judge-blind.
  It replaces nothing else; `movedToTruth` labels only index that text and are not stored. An
  empty rewrite note deletes `golden.notes`.
- **Dates.** `truth.asOf` moves to the round date only when the case already has `asOf`, every rot
  entry for it is `holds` or `changed` with evidence observed in the round, it lists no
  `notRechecked` item, and it has no source sentinel (a sentinel's `caseAsOf` may move only after a
  live anchor read). `reverifyBy` never moves.
- **Avoid items** are normalized to `Do NOT …`: `Do not`/`Don't` prefixes are recased; a leading
  gerund (`Claiming`, `Calling`, …) becomes its base verb from an explicit map; any other sentence
  becomes `Do NOT claim that …`. An unknown leading gerund is a refusal, not a guess.

## 3. Leaf

`truth.leaf` (required for every headline battery case) and optional `truth.secondaryLeaf`, both
judge-blind. `eval/qa/taxonomy.json` (schema `qa-taxonomy-v1`) holds `domains` (`id`, `title`),
`leaves` (`id`, `title`, `domain`, `weight`, `volatility`, `cases`), and `openSlots`. It is
generated once from `map/taxonomy.json` by `apply.mjs --write-taxonomy` and then hand-owned.
Directories and `tags.category` stay; category is a filing aid, the leaf is the coverage unit.

## 4. Floors

`lintCoverage` now reads the taxonomy:

| Rule | Level |
|---|---|
| A headline case has a `truth.leaf` that exists; a `secondaryLeaf` exists and differs | error, always |
| A leaf has at most `cases + 1` primary headline cases | error, always |
| A leaf of weight 2 or 3 has an active case, or an `openSlots` entry with a reason | error with `--enforce-floors`, warn with `--coverage` |
| An `openSlots` entry names a real leaf, has a reason, and its leaf is still empty | error, always |

Removed, with what each protected:

| Floor | Protected | Call |
|---|---|---|
| `CATEGORY_FLOORS` | battery size per directory | Replaced by leaf rules. |
| Operation floor 2 | every exposed operation reached by some case | Delete. It forced mechanics cases into the headline. Routing gates (`eval/routing-cases.json`) own operation reach. |
| Skill floor 1 (digest 2) | every skill reached | Delete; `eval/skills-cases.json` owns skill selection. |
| Cross-service 12 | multi-source questions | Delete; a leaf's question decides its sources. |
| NEG/soft-empty 20 | honest empty results | Delete; the `behavior.no-info-honesty` leaf covers the Stellar-facing part. |
| VOCAB 6 | vocabulary routing | Delete; routing gates own it. |
| Catalog-note traps (7) | specific Raven envelope quirks | Delete; mechanics, the tool lane at most. |
| Scheduled share ≤ 35% | re-verification load | Delete. The taxonomy targets 109 of 249 cases (44%) as scheduled, so the cap would reject the map. Load is held by `--stale`, sentinels, and `reverifyBy`. |

## 5. Tool lane

Options compared:

- **Separate hand-owned file beside the live lanes.** Needs tombstones for the moved IDs and
  then reuses those IDs outside the lifecycle registry, needs its own schema check (the live
  contract lint requires `freshness: live`), and a CI pin. More code, weaker guarantees.
- **Tag in the battery (chosen).** `truth.lane: "tool"` on a battery case. The case keeps its
  lifecycle, registry entry, and lint. `compile-qa.mjs` writes headline cases to `cases.json`
  and tool cases to `tool-cases.json`; `sample.json` draws from the headline only. Run it with
  `run-qa.mjs --cases eval/qa/tool-cases.json`; the runner needs no change. About 15 lines.

A tool case needs no leaf. If the coverage lane keeps fewer than five tool cases, a lane is not
worth having: one case moves its rate by 20 points or more, so it measures nothing a unit test or
routing gate does not. Then retire them, with the mechanism in each tombstone reason, and delete
the `lane` partition.

## 6. Everything pinned

| Item | Moves | How |
|---|---|---|
| `corpus/battery/**` | rewrites, leaves, deletions | `apply.mjs` |
| `corpus/retired/*.json` | new | `apply.mjs` |
| `eval/qa/taxonomy.json` | new | `apply.mjs --write-taxonomy`, then hand-owned (`openSlots` from coverage) |
| `cases.json`, `sample.json`, `lifecycle-registry.json`, `tool-cases.json` | regenerated | `npm run eval:qa:compile` |
| `consistency-register.json` | retired IDs replaced by the survivor (merge) or removed; clusters under two members, and invariants or traps with no case, are deleted; stale hash keys dropped | `apply.mjs`, then `npm run eval:qa:register` stamps hashes; rewritten members reopen and need a `--review` closure |
| `source-sentinels.json` | sentinels of retired cases removed | `apply.mjs`; listed in its output |
| `migration-ledger.json`, `LEDGER_SOURCE_COUNTS` | unchanged | destinations may now be retired IDs |
| `lifecycle-policy.json` | unchanged | mass review state stays `none`; 2026-11-29 cadence trigger is outside this change |
| `eval/gates.json` | untouched | no QA floor lives there |
| CI `ci.yml` | add `eval/qa/tool-cases.json` to the compile byte-compare list | orchestrator (outside this lane's write set) |
| Tests | `test/qa-corpus-lint.test.mjs` (coverage, ledger), `test/qa-lifecycle.test.mjs` (real retirement) | this lane |
| Tests naming retired cases | any test that reads a case by ID | listed in `REPORT.md` from the scratch run |
| Docs | `eval/qa/README.md` (floors, tool lane, taxonomy, `truth.leaf`/`notes`/`lane`), `eval/qa/corpus/README.md`, `CONTRIBUTING.md` Checks row (unchanged command), `.agents/skills/golden-truth/SKILL.md` (leaf on new cases) | README files in `eval/qa` by this lane; skill and CONTRIBUTING by the orchestrator |
| Counts in prose | `README.md` "501", `consistency-register.json` `$comment` "499-case" | orchestrator, from the compile output |

## 7. Held-out split

Rule, drawn once at close from the final headline battery:

1. Key each case by `sha256("qa-split-2026-11-14:" + id)`.
2. Stratify by `taxonomy domain × tags.freshness`. Within a stratum, sort by key.
3. Deal positions in order: tuning, held-out, held-out, reserve, then repeat. That gives 25 / 50 /
   25 percent, keeps every domain in each set, and is reproducible from the IDs alone.
4. A case added later goes to reserve until the next mass review draws a new salt.

The rule lives in `eval/qa/README.md` ("Held-out split") with the salt; the drawing is a few lines
in the close lane, not committed code. The split file goes to `eval/qa/results/splits/<date>.json`
(git-ignored, never read by a tuning lane by default) with its sha256 in the round ledger. Like the
first-principles round, no ledger or TODO entry names a held-out or reserve ID.
