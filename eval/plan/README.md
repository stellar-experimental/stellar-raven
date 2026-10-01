# Multi-tool plan eval — grading the PLAN, not just the answer

The golden Q→A eval (`eval/qa/`) judges the final answer. Real questions, though, often need
**many tools plus follow-up calls**: SCF questions legitimately span scout AND
lumenloop, project lookups span scout AND lumenloop, OpenZeppelin-Soroban questions live in the
skills bundle — and specific answers demand a broad→detail call progression, not one-shot
routing. This eval re-grades an existing results file's per-row tool `transcript` on three axes:

1. **Set coverage** — did the plan touch the right SET of services, graded against an
   acceptable-set per case (`coverage-rules.json`)?
2. **Progression** — where the question class demands specifics, did a *broad* op (collection
   search/list) precede a *detail* op (get one thing by id) for some touched service?
3. **Correlation** — how do both split against the judge verdicts already in the file?

**Anti-overfitting is a hard rule:** every acceptable-set entry derives from *documented service
coverage* — `research/services/lumenloop.md`, `research/services/stellar-light.md`,
`docs/stellar-docs.md`, `catalog/manifest.json` — never from what agents
happened to pick in past runs. Each rule carries a `why` citing its coverage source.

## Run

```bash
node eval/plan/grade-plan.mjs eval/qa/results/<stamp>.json          # or: npm run eval:plan -- <file>
node eval/plan/grade-plan.mjs <file> --rules eval/plan/coverage-rules.json
```

Writes `<file>.plan.json` next to the input and prints a summary table (same style as
`eval/qa/lib.mjs`). No live server needed — it reads stored transcripts only.

## Rule schema (`coverage-rules.json`)

Ordered rules, evaluated top-to-bottom, **first match wins**; the last rule is a mandatory
catch-all. `overrides` (keyed by case id, used sparingly, each with a `comment` citing the
coverage doc) beat all rules.

```jsonc
{
  "overrides": { "<case-id>": { "comment": "why", /* plan fields */ } },
  "rules": [{
    "id": "scf-grants-builders",
    "why": "cite the coverage doc that justifies the sets",
    "match": {                       // all present matchers must pass (AND)
      "category": "scf-grants-builders",  // tags.category — string or array
      "service": ["scout", "lumenloop"],  // tags.service  — string or array
      "question": "openzeppelin"          // case-insensitive regex over the question
    },
    "plan": {
      "required": [],                     // services a good plan MUST all touch
      "anyOf": ["scout", "lumenloop"],    // at least ONE must be touched (expresses legitimate overlap)
      "acceptable": ["scout", "lumenloop", "skills"],  // the full on-plan set (⊇ required ∪ anyOf)
      "progressionExpected": true         // this question class demands broad→detail
    }
  }]
}
```

`skills` counts as a service (`codemode.skill.read` / catalog skill entries). Grades per row:

- `requiredCovered` — all `required` touched AND (if `anyOf` non-empty) at least one touched
- `onPlanRatio` — touched ∩ acceptable ÷ touched (`null` when no service ops ran)
- `offPlanServices` — touched but not acceptable (informational, not automatically bad)
- `progression` / `progressionUsed` — per touched service, did a broad op precede a detail op
  anywhere in transcript order; counted in the summary only when `progressionExpected`

## Op extraction and classes

The grader extracts direct service calls from stored execute `{code}` inputs with this regex:
`\b(lumenloop|scout|stellarDocs)\.(\w+)\s*\(`.
It also recognizes `codemode.skill.read`, `codemode.skill.run`, and their supported aliases as `skills` calls.
It expands a captured `skill.run` ID through the runner registry's declared operations.
Each expansion carries `via: <skillId>`. These declarations do not prove which host calls actually ran.
An absent registry, unknown ID, or missing ID leaves the call unexpanded.

The grader also extracts direct tools named `mcp__<server>__<service>_<operation>` from per-operation transcripts.
It treats `codemode.search/catalog/spec/describe` as `meta-discovery`, outside the touched service set.
A `codemode.search` or top-level MCP search supplies the broad step for a later skill call.

`op-classes.json` is **generated** — rebuild with `node eval/plan/build-op-classes.mjs` after a
catalog change; never hand-edit. It classes every catalog operation as `broad` (returns
collections: search_/list_/find_/match_ plus explicit plural-`get*` overrides), `detail` (one
thing by id: get_/read_/explain/compare), or `meta` (status/changelog/vocabularies/writes/metered
compute). Unmatched ops default to `meta` and are listed under `unmatched` + warned at build time
so misclassification stays visible.

## Limitations (honest)

- **Regex op extraction misses dynamic dispatch** — code like `const svc = scout; svc[opName]()`
  or ops invoked through helper variables won't be counted; extraction is a lower bound on what
  the plan touched.
- **Acceptable-sets are category-granular** (refined by the golden `service` label and a few id
  overrides). Individual questions inside a category can still have tighter or looser true sets;
  `offPlanServices` is therefore informational, never an automatic penalty.
- **Truncated inputs**: stored runs can contain execute code cut at 600 characters. Such rows are flagged
  (`truncatedInputs` per row, `truncatedRows` in the summary) — their op sets undercount and
  progression may read false. Re-run the QA eval for full-fidelity plan grading.
- **Progression is order-only**: a broad call before a detail call counts even if the detail call
  didn't use the broad call's output; true data-flow tracking would need sandbox instrumentation.
- `anyOf`/`required` grade presence, not quality — calling `scout.getStatus` alone marks scout as
  touched. Op classes soften this (meta ops never satisfy progression) but not set coverage.

## Results — 2026-07-02 fresh run (30 stratified cases, variant A, full execute capture;
`eval/qa/results/2026-07-02T18-18-36-variantA{,.plan}.json`, git-ignored/local-only)

Answer quality (context): **18 correct / 9 partial / 3 wrong / 0 errors** — weighted 75%, the
best run on this sample to date (the same 30 cases scored 65.5% weighted in the A/B round; the
delta is at least partly the post-ADR-0001 tool naming plus normal run variance, n=30).

Plan grades:

| metric | value |
|---|---|
| requiredCovered | **28/30 (93%)** |
| mean onPlanRatio | 0.97 |
| off-plan touches | 2 cases (informational) |
| progression (11 expected) | 4 used / 7 skipped |

- **Verdict × requiredCovered**: covered → 17C/8P/3W; missed → 1C/1P. Both misses still produced
  usable answers, but they are real plan gaps, not grader noise — e.g.
  `q-aas-list-token-on-exchanges-aggregators` (labeled scout) was answered entirely from
  stellarDocs + skills without ever consulting scout's structured project directory: a
  right-answer-wrong-evidence pattern the answer-only eval cannot see.
- **Progression barely correlates with correctness at this n** (used → 1C/2P/1W; skipped →
  3C/3P/1W): agents usually satisfy detail-demanding questions from broad-call payloads (Scout
  rows carry rich inline data), so skipping `get_*` follow-ups is often rational, not lazy.
  Keep the metric informational; do not gate on it.
- Off-plan touches were 1× lumenloop + 1× stellarDocs across 30 cases — service boundaries in the
  catalog descriptions are holding.

Conclusion for todo 799: multi-tool set-grading is live and the acceptable-sets hold up (93%
coverage with honest misses); progression is measurable but not (yet) predictive. Revisit
progression weighting only if a future run shows detail-starved wrong answers.

## Results — 2026-07-03 post-nudge checkpoint (same 30 cases, variant A;
`eval/qa/results/2026-07-03T16-06-45-variantA{,.plan}.json`, git-ignored/local-only)

Answer quality (context): **20 correct / 9 partial / 1 wrong** — the wrong overturned as a
judge artifact on live review (see `eval/qa/README.md`), so zero true wrongs. This run is the
checkpoint todo 807 was waiting for: the `execute` description now carries a broad→detail
progression nudge (todo 824 item 7), deployed between the 07-02 run and this one.

| metric | 2026-07-02 (pre-nudge) | this run |
|---|---|---|
| requiredCovered | 28/30 (93%) | 28/30 (93%) |
| mean onPlanRatio | 0.97 | 0.97 |
| progression (11 expected) | 4 used / 7 skipped | **7 used / 4 skipped** |
| verdict × used | 1C/2P/1W | 3C/4P/0W |
| verdict × skipped | 3C/3P/1W | 1C/2P/1W |

- **The nudge moved behavior** (36% → 64% progression usage) at zero coverage cost.
- **The tripwire never fired.** The one skipped-bucket wrong was live-dissected
  (Solo scratchpad 521): the broad payloads carried every needed specific
  (`detailStarvation: NO` — the case is a counterexample to progression-gating, and the
  verdict itself was a judge artifact). Cumulatively, across three graded runs no
  detail-starved wrong answer has ever been observed.
- **Decision:** progression stays informational, never gated — now evidence-backed at the
  post-nudge checkpoint, not just provisional. Todo 807 closed 2026-07-03; reopen only if a
  future run produces an actual detail-starvation transcript.

## Results — 2026-07-09 truth-maintenance closeout

Fresh sample-30 QA result `eval/qa/results/2026-07-09T19-53-07-variantA.json` (answering and
judge model `claude-sonnet-5`, rubric v2.4 / evidence pack p3) scored 20 correct / 8 partial /
2 wrong and reported $16.6216 cost. Its free offline plan sidecar is
`eval/qa/results/2026-07-09T19-53-07-variantA.plan.json`.

| metric | value |
|---|---:|
| requiredCovered | **28/30 (93%)** |
| mean onPlanRatio | **0.977777…** |
| progression (11 expected) | **4 used / 7 skipped** |
| truncated transcript inputs | **0** |

This closes the plan record for the July 9 headline checkpoint: set coverage stayed at the
established 28/30 level, mean on-plan ratio remained high, and the no-truncation condition makes
the extraction complete under this grader. Progression remains informational; 4/11 does not
override the standing decision without a detail-starved wrong-answer mechanism.
