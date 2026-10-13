# Call-pattern triage — 2026-10-12

Lane T of the 2026-10-12 round. Author: Claude Opus 5.5 (Claude Opus tier). Base: `main` `63396840`.
Branch: `w1012/t`. The lane made no paid call, started no server, and posted nothing upstream.
The independent review is complete. Its findings are reconciled below.

The lane triaged two answering-agent call patterns from `.agents/TODO.md`:

1. `stellarDocs.*` calls without a required argument (the anchor `query` pattern).
2. Misreads of `data.sections` after a sectioned `codemode.skill.read`.

## Evidence and revisions

All artifacts are ignored local files. The lane read them and did not change them.
QA artifacts are under `eval/qa/results/` in the main checkout. Playground artifacts are under
`/private/tmp/raven-ai-upgrade/results/`.

| Run | Artifact | Server revision | Surface | Answer model | Rows |
| --- | --- | --- | --- | --- | ---: |
| paired-1 baseline | `2026-10-11-paired-attempt-1/baseline-results/2026-10-11T02-01-12-variantA.json` | `90d0ba75` | MCP | `claude-sonnet-5` | 145 |
| paired-1 candidate | `2026-10-11-paired-attempt-1/candidate-results/2026-10-11T02-01-12-variantA.json` | `0dc353b9` | MCP | `claude-sonnet-5` | 145 |
| paired-3 baseline | `2026-10-11-paired-attempt-3/baseline-results/2026-10-11T07-03-19-variantA.json` | `90d0ba75` | MCP | `claude-sonnet-5` | 142 |
| paired-3 candidate | `2026-10-11-paired-attempt-3/candidate-results/2026-10-11T07-03-37-variantA.json` | `8bca4167` | MCP | `claude-sonnet-5` | 142 |
| answer-style B1, B2 | `2026-10-11-answer-style/2026-10-11T08-17-16-variantA.json`, `…T10-36-13…` | `d15a4ce5` | MCP | `claude-sonnet-5` | 34 each |
| answer-style C1, C2 | `2026-10-11-answer-style/2026-10-11T09-04-33-variantA.json`, `…T09-48-55…` | `2612f86a` | MCP | `claude-sonnet-5` | 34 each |
| ai-upgrade baseline-1, baseline-2 | `baseline-{1,2}/…-playground-semantic.json` | `0dc353b9` | Playground | `openai/gpt-5.6-terra` | 6 each |
| ai-upgrade candidate-1, candidate-2 | `candidate-{1,2}/…-playground-semantic.json` | `32d22a71` | Playground | `openai/gpt-5.6-terra` | 6 each |

- The revisions come from each run's `*-surface.json` file or from the ai-upgrade `results.md`.
- Revision `90d0ba75` (2026-08-18) predates PR #247. On it, `skill.read` returns `sections` at the top level.
- Every other revision returns `{ ok: true, data: { … } }`. The section element is
  `{ section, content, url }` on every revision.
- `2612f86a` is the C-arm commit of draft PR #268.

## Pattern 1: `stellarDocs.*` calls without a required argument

### Counts

A scanner read every `execute` script and extracted each `stellarDocs.<op>(…)` argument text.
It compared the text with the operation's `inputSchema.required` in `catalog/manifest.json`.
Five scanner flags were false positives (a `...` inside a query string). Each had `query`.

| Surface | Runs | Calls to ops with a required argument | Calls without it | By operation |
| --- | ---: | ---: | ---: | --- |
| MCP (Claude Sonnet 5) | 8 | 1,891 | 0 | `search_anchor_sep_docs` 0 of 182; `search_asset_token_docs` 0 of 91 |
| Playground (GPT-5.6 Terra) | 4 | 28 | 6 | `search_anchor_sep_docs` 4 of 6; `search_asset_token_docs` 2 of 3 |

Playground calls without `query`, by arm and revision:

| Run | Revision | Row | Operation | Arguments |
| --- | --- | --- | --- | --- |
| baseline-1 | `0dc353b9` | `q-anchor-list-builders-discovery` | `search_anchor_sep_docs` | `{ hitsPerPage: 3 }` |
| baseline-2 | `0dc353b9` | `q-anchor-list-builders-discovery` | `search_anchor_sep_docs` | `{ hitsPerPage: 3 }` |
| baseline-2 | `0dc353b9` | `q-asset-stablecoin-issuers-discovery` | `search_asset_token_docs` | `{ hitsPerPage: 3 }` |
| candidate-1 | `32d22a71` | `q-anchor-list-builders-discovery` | `search_anchor_sep_docs` | `{ hitsPerPage: 3 }` |
| candidate-2 | `32d22a71` | `q-anchor-list-builders-discovery` | `search_anchor_sep_docs` | `{ hitsPerPage: 5 }` |
| candidate-2 | `32d22a71` | `q-asset-stablecoin-issuers-discovery` | `search_asset_token_docs` | `{ hitsPerPage: 3 }` |

### What the model saw

- **Catalog and spec.** `specs/stellar-docs.json` is an own-repo, authored spec. Both operations
  mark `query` as required, with `type: string`. The `query` property has no description.
- **MCP `search` card.** `renderSignature` keeps the input type block in full. The card shows
  `query: string;` without `?`.
- **Playground `search` card.** `clipSignature` in `src/demo/tools.ts` keeps a 400-character
  budget. It keeps the callable line and only about 170 characters of head. The input block lists
  `hitsPerPage`, then the long `includeContent` comment, then `query`. The cut falls before
  `query: string;`. The stored card shows `hitsPerPage?: number;`, the start of the
  `includeContent` comment, and `… [middle clipped for the demo]`.
- **Micro-map.** It names the Stellar Docs family. It names no arguments.
- **`codemode.describe`.** No Playground script called it. It renders the full signature.
- **Host error.** The guard rejected each call with `invalid arguments for … — no call was made`,
  `details: [{ path: "query", message: "required" }]`. The `calls:` line read
  `[invalid-args: query]`. The error already names the missing argument. Its hint points to the
  `search` hit signature, which the Playground clipped.

### Cause and decision

- **Cause: own-repo, Playground-only.** The Playground signature clip hides required input
  fields. The model saw only optional fields and called the operation with optional fields only.
  The MCP surface shows the full input block, and 0 of 1,891 MCP calls omitted a required argument.
- The cause is not SDK-specific: both arms of the ai-upgrade screen show it.
- **Scope.** 56 of 61 callable entries exceed the 400-character budget. For 22 of them, the head
  cut hides at least one required field. These are 12 `stellarDocs` operations, 8 `lumenloop`
  operations, `scout.getChanges`, and the runnable skill `skills.lumenloop.stellar-ecosystem-digest`.
- **No upstream finding.** The upstream surface is not at fault. The spec is own-repo and correct.
- **Fix (branch `w1012/t`).** When `clipSignature` clips, the marker names the entry's required
  top-level input fields: `… [middle clipped for the demo] required input: query`. The total stays
  within 400 characters. Test: `test/smoke/demo-tools.test.ts`, "names required input fields that
  a clipped signature hides".
- Rejected: keep the whole input block. Across the 61 callable entries, the input block plus the
  callable line has a median of about 516 characters and a maximum of about 4,551. That undoes the
  prefill cap.
- Rejected: change the shared guard hint. The MCP lane shows no need, and the hint is production
  model-facing text.
- The review found that a fallback dropped the marker when the callable line alone fills the
  budget. The fallback now keeps the marker, so it can exceed 400 characters. No current entry
  reaches it.
- **Model-facing: Playground only.** The fix needs a measurement before merge (see below).

## Pattern 2: `data.sections` misreads

### Counts

The lane read every `execute` script that calls `codemode.skill.read` (205 scripts). The
independent review then recounted all of them. A misread is a read that loses or garbles the
section text, or that throws. Correct `sections || content` fallbacks, `JSON.stringify` of the
whole array, and deliberate shape inspection do not count.

The first count found 13 misreads. It missed 13 silent reads of an absent top-level `content` on
the historical revision `90d0ba75`. On that revision, a section read returns `sections` at the
top level and has no `content`. The lane checked each added script against its stored code and
result. The corrected count follows.

| Run | Revision | Result shape | `skill.read` scripts | Map keyed by section | Element used as a string | Absent `content` | Total | Rows |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| paired-1 baseline | `90d0ba75` | top level | 39 | 1 | 0 | 8 | 9 | 6 |
| paired-3 baseline | `90d0ba75` | top level | 39 | 0 | 0 | 7 | 7 | 3 |
| paired-1 candidate | `0dc353b9` | `data` envelope | 40 | 0 | 2 | 0 | 2 | 2 |
| paired-3 candidate | `8bca4167` | `data` envelope | 36 | 1 | 2 | 0 | 3 | 3 |
| answer-style B1 | `d15a4ce5` | `data` envelope | 11 | 0 | 2 | 0 | 2 | 2 |
| answer-style C1 | `2612f86a` | `data` envelope | 12 | 0 | 0 | 1 | 1 | 1 |
| answer-style C2 | `2612f86a` | `data` envelope | 12 | 2 | 0 | 0 | 2 | 1 |
| answer-style B2 | `d15a4ce5` | `data` envelope | 10 | 0 | 0 | 0 | 0 | 0 |
| **MCP, top level** | | | **78** | **1** | **0** | **15** | **16 (20.5%)** | |
| **MCP, `data` envelope** | | | **121** | **3** | **6** | **1** | **10 (8.3%)** | |
| **MCP total** | | | **199** | **4** | **6** | **16** | **26 (13.1%)** | |
| Playground (4 runs) | `0dc353b9`, `32d22a71` | `data` envelope | 6 | 0 | 0 | 0 | 0 | 0 |

The 26 misread scripts, by row (transcript indices are zero-based):

- Map keyed by section: `q-defi-build-staking-for-own-token` (paired-1 baseline, paired-3
  candidate) and `q-stellar-recurring-payments` (C2, two scripts). `sections["file:development.md"]`
  returns `undefined`, so the text is empty or `null`.
- Element used as a string: `q-passkey-smart-account-architecture` (paired-1 and paired-3
  candidate), `q-pc-surge-griefing-threat-model` (paired-1 candidate),
  `q-aas-burn-clawback-redemption-mechanics` (paired-3 candidate), `q-edge-noinfo-sep-9999` and
  `q-soroban-cross-contract-call` (B1). The results are `[object Object]`, a `.slice is not a
  function` error, or `null` after a `typeof … === "string"` check.
- Absent `content`, top-level shape, paired-1 baseline: `q-aas-burn-clawback-redemption-mechanics`
  [4], `q-agent-identity-erc8004-stellar` [6], `q-defi-etherfuse-stablebonds` [4, 5],
  `q-jutsu-check-account-history` [3, 4, 5], `q-pc-address-types-strkey` [3].
- Absent `content`, top-level shape, paired-3 baseline:
  `q-aas-list-token-on-exchanges-aggregators` [5], `q-jutsu-check-account-history` [3, 4, 5],
  `q-scf-pitch-prep-live` [4, 5, 6]. Two `jutsu` scripts throw. The others return `{}`, `""`, or
  omit the field.
- Absent `content`, `data` envelope: `q-soroban-cross-contract-call` (C1) returns empty text.

The answer-style rows match the counts in `review-result-astra.md` on draft PR #268. No script on
a PR #247 revision omitted `.data`.

### What the model saw

- The `execute` description (`src/mcp/tools.ts`) says the read resolves to
  `{ ok: true, data: { id, url, content | sections, availableSections, notice? } }`. It does not
  say that `sections` is an array, or what each element holds.
- `codemode.describe` on a skill says "the result arrives under r.data.sections". It gives no shape.
- The server instructions and search next steps say only `codemode.skill.read(id, { sections })`.
- `codemode.spec()` does state the shape. `specs/super-spec.json` (generated by
  `scripts/build-super-spec.mjs`) describes `sections?: [{section, content, url …}]`. The text was
  the same at `63396840`. A model sees it only if it reads the spec.

### Cause and decision

- **Cause: own-repo guidance gap.** The `execute` description, the `codemode.describe` usage
  line, and the search guidance omit the array shape. Only `codemode.spec()` states it.
- The link from this gap to the misreads is an inference from the stored scripts. Each misread
  class matches one wrong guess about the shape. The data do not prove that the gap alone caused
  every misread.
- **Fix 1, sandbox guard.** `SECTIONS_GUARD` in `src/executor/providers.ts` extends the envelope
  guard to a successful section read. All traps are non-enumerable.
  - `r.data.sections["<key>"]` throws a pointer to `.find((s) => s.section === key).content`.
    Index keys, keys that resolve on the array (such as `find`), `toJSON`, and `then` are not
    trapped.
  - `String(section)`, a template literal, or `join` throws instead of returning `[object Object]`.
  - The first version also trapped `r.data.content` on a section read. The review found that the
    accessor made `"content" in r.data` and `Object.hasOwn(r.data, "content")` true, which broke a
    valid shape check. The accessor is removed. A section result again has no `content` property.
  - Correct reads, `in` and `Object.hasOwn` checks, `Object.keys`, JSON, and structured clone are
    unchanged. The guard adds no log line.
  - Coverage on the 10 `data` envelope misreads: the guard makes 7 loud (3 map reads and 4 string
    uses). The `aas-burn` script was already loud. Two stay silent: the B1 `typeof` check and the
    C1 absent `content`. The guard does not apply to the top-level shape. A replay of those 16
    scripts needs shape normalization first.
  - Guard messages are not a complete misread counter. They miss `typeof` paths, `.slice()` on a
    section object, and absent `content`.
  - Tests: `test/executor-providers.test.ts` (three cases, including `in`, `Object.hasOwn`, a valid
    shape branch, and `toJSON` and `then` section names) and `test/smoke/executor.test.ts`.
  - **The guard changes model-visible results.** It turns a successful script with lost text into a
    failed script. An exception can also discard results from other calls in the same script. The
    Playground allows three `execute` calls per turn (`src/demo/budget.ts`). The guard needs a
    measurement before merge.
- **Fix 2, text (model-facing).** The `execute` description and the `codemode.describe` usage
  line now state that `sections` is an array of `{ section, content, url }` in request order. The
  `execute` text also says that a section read has no `content`. Tests pin both strings. The docs
  page and `src/skills/README.md` state the same shape. It needs a measurement before merge.
- Rejected: return sections as a keyed map, or add `content` to a section read. Both add a second
  result format (AGENTS.md forward-only rule).

## Measurement notes

Lane P wrote one pre-spend plan per change on 2026-10-12, after the rebase onto `main`
`6891dca2`. The plans are drafts. Each needs an independent pre-spend review and a spend
authorization. No paid call ran.

| Change | Plan | Instrument | Collections | Cap (USD) |
| --- | --- | --- | --- | ---: |
| Playground clip marker (Pattern 1) | [plan-clip-marker.md](2026-10-12-call-pattern-triage/plan-clip-marker.md) | Six-case Playground screen, `openai/gpt-5.6-terra` | B1, C1, C2, B2 | 20 |
| Section guard (Pattern 2, Fix 1) | [plan-section-guard.md](2026-10-12-call-pattern-triage/plan-section-guard.md) | MCP QA, `claude-sonnet-5`, 16 rows | Shared screen: A1, G1, T1, T2, G2, A2 | 86 (shared) |
| Section-shape text (Pattern 2, Fix 2) | [plan-section-text.md](2026-10-12-call-pattern-triage/plan-section-text.md) | The same shared screen | The same | Included above |

- **Shared baseline.** The two section changes share arm A (`main`). Six collections replace the
  eight of two separate ABBA screens. Each candidate arm differs from A by one change only.
- **Order.** Run the Playground screen first, then the shared section screen. Merge order after
  the verdicts: the clip marker, then the text, then the guard. The guard plan gives the reasons.
- **Arms.** Each arm is `main` plus cherry-picks of its own commits. The plans pin each arm by
  its tree hash.
- **Frozen row change.** The section plans use `q-asset-trustline-basics` in place of the control
  `q-soroban-storage-types`. That row has no MCP row in any stored run since 2026-10-07. Its
  section read was a Playground observation.
- **Correction.** The B1 `typeof` misread is on `q-soroban-cross-contract-call`. The B1
  `q-edge-noinfo-sep-9999` misread calls `.toString()` on the sections array, so the guard traps
  it. The guard-coverage totals above do not change.
- **Counter.** [count-patterns.mjs](2026-10-12-call-pattern-triage/count-patterns.mjs) reads saved
  results without a model or service call. On the stored runs it reproduces the counts of this
  ledger: 1,891 MCP docs calls with 0 omissions, 199 MCP skill-read scripts, and 6 of 28
  Playground omissions. Misread classes still need a direct read.

## Outcome

- Pattern 1: cause recorded (own-repo, Playground clip). Fix on `w1012/t`. Measure first.
  No `improvements/` draft.
- Pattern 2: cause recorded (own-repo guidance gap, inferred). Fix 1 (guard, repaired after
  review) and Fix 2 (text) on `w1012/t`. Measure each first: one verdict each, with a shared
  baseline arm (see "Measurement notes").
- Independent review: `/private/tmp/claude-501/w1012/rt-review.md` (outside the repository). All
  findings are reconciled in this ledger and on the branch.
- Retained evidence: this ledger and the plans and counter in
  `2026-10-12-call-pattern-triage/`. Their consumers are the two `.agents/TODO.md` items.
