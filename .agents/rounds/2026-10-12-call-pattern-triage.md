# Call-pattern triage — 2026-10-12

Lane T of the 2026-10-12 round. Author: Claude Opus 5.5 (Claude Opus tier). Base: `main` `63396840`.
Branch: `w1012/t`. The lane made no paid call, started no server, and posted nothing upstream.
The independent review is outstanding.

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
- **Model-facing: Playground only.** The fix needs a measurement before merge (see below).

## Pattern 2: `data.sections` misreads

### Counts

The lane read every `execute` script that calls `codemode.skill.read` (205 scripts). A regex
flagged 27 candidates. The lane classified each candidate by hand from its code and result. A
misread is a read that loses or garbles the section text, or that throws. Harmless
`sections || content` fallbacks and `JSON.stringify` of the whole array do not count.

| Run | Revision | `skill.read` scripts | Read as a map keyed by section | Element used as a string | `content` on a section read | Rows |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| paired-1 baseline | `90d0ba75` | 39 | 1 | 0 | 1 | 2 |
| paired-1 candidate | `0dc353b9` | 40 | 0 | 2 | 0 | 2 |
| paired-3 baseline | `90d0ba75` | 39 | 0 | 0 | 1 | 1 |
| paired-3 candidate | `8bca4167` | 36 | 1 | 2 | 0 | 3 |
| answer-style B1 | `d15a4ce5` | 11 | 0 | 2 | 0 | 2 |
| answer-style C1 | `2612f86a` | 12 | 0 | 0 | 1 | 1 |
| answer-style C2 | `2612f86a` | 12 | 2 | 0 | 0 | 1 |
| answer-style B2 | `d15a4ce5` | 10 | 0 | 0 | 0 | 0 |
| ai-upgrade (4 runs) | `0dc353b9`, `32d22a71` | 6 | 0 | 0 | 0 | 0 |
| **Total** | | **205** | **4** | **6** | **3** | **12** |

The 13 misread scripts, by row:

- Map keyed by section: `q-defi-build-staking-for-own-token` (paired-1 baseline, paired-3 candidate)
  and `q-stellar-recurring-payments` (C2, two scripts). `sections["file:development.md"]` returns
  `undefined`, so the text is empty or `null`.
- Element used as a string: `q-passkey-smart-account-architecture` (paired-1 and paired-3
  candidate), `q-pc-surge-griefing-threat-model` (paired-1 candidate),
  `q-aas-burn-clawback-redemption-mechanics` (paired-3 candidate), `q-edge-noinfo-sep-9999` and
  `q-soroban-cross-contract-call` (B1). The results are `[object Object]`, a `.slice is not a
  function` error, or `null` after a `typeof … === "string"` check.
- `content` on a section read: `q-jutsu-check-account-history` (paired-1 and paired-3 baseline)
  and `q-soroban-cross-contract-call` (C1). Two scripts throw. One returns empty text.

The answer-style rows match the counts in `review-result-astra.md` on draft PR #268. The paired
attempts add 8 misreads. No script on a PR #247 revision omitted `.data`.

### What the model saw

- The `execute` description (`src/mcp/tools.ts`) says the read resolves to
  `{ ok: true, data: { id, url, content | sections, availableSections, notice? } }`. It does not
  say that `sections` is an array, or what each element holds.
- `codemode.describe` on a skill says "the result arrives under r.data.sections". It gives no shape.
- The server instructions and search next steps say only `codemode.skill.read(id, { sections })`.
- The request takes an array of section keys. The models guessed three result shapes: a map keyed
  by those keys, an array of strings, or one `content` string.

### Cause and decision

- **Cause: own-repo text gap.** The model-facing text never states the element shape. Each
  misread class matches one wrong guess about it.
- **Fix 1, sandbox guard (error path only).** `SECTIONS_GUARD` in `src/executor/providers.ts`
  extends the envelope guard to a successful section read. All traps are non-enumerable.
  - `r.data.content` on a section read logs one `[envelope]` warning and returns `undefined`.
    Harmless `content || sections` fallbacks keep working.
  - `r.data.sections["<key>"]` throws a pointer to `.find((s) => s.section === key).content`.
    Index keys and keys that resolve on the array, such as `find`, are not trapped.
  - `String(section)`, a template literal, or `join` throws instead of returning `[object Object]`.
  - Correct reads, `Object.keys`, JSON, and structured clone are unchanged.
  - On the stored scripts, the guard makes 11 of 13 misreads loud. The `aas-burn` script was
    already loud. The B1 `cross-contract` script hides the element behind a `typeof` check.
  - Tests: `test/executor-providers.test.ts` (two cases) and `test/smoke/executor.test.ts`
    ("guards misreads of a section read and still returns it whole").
- **Fix 2, text (model-facing).** The `execute` description and the `codemode.describe` usage
  line now state that `sections` is an array of `{ section, content, url }` in request order. The
  `execute` text also says that a section read has no `content`. Tests pin both strings. The docs
  page and `src/skills/README.md` state the same shape.
- **Model-facing: Fix 2 changes the MCP tool description.** It needs a measurement before merge.
- Rejected: return sections as a keyed map, or add `content` to a section read. Both add a second
  result format (AGENTS.md forward-only rule).

## Measurement notes

### Playground clip marker (Pattern 1)

- Instrument: the ai-upgrade six-case Playground screen with `openai/gpt-5.6-terra`, no fallback.
- Arms: BASE `main`, CANDIDATE `w1012/t`. Two repetitions per arm.
- Rows that matter: `q-anchor-list-builders-discovery`, `q-asset-stablecoin-issuers-discovery`.
  The other four rows are controls.
- Counts: `stellarDocs.*` calls without a required argument, by operation; `[invalid-args: …]`
  entries in the `calls:` lines; `search` response characters; answer turns; grades.
- Expected: BASE about 6 of 28 calls without `query`. CANDIDATE fewer, and no routing or grade
  regression under the ai-upgrade plan's rules.

### Section-shape text (Pattern 2, Fix 2)

- Instrument: an MCP QA A/B with `claude-sonnet-5` and the judge pin of the current round.
- Arms: A = `main` plus Fix 1. B = A plus Fix 2. Fix 1 stays in both arms, so its messages count
  every misread attempt.
- Rows: the 9 misread rows above, plus 3 controls that read sections correctly:
  `q-soroban-fuzz-testing`, `q-edge-ambig-stellar-token-meaning`, `q-soroban-storage-types`.
  Use at least 2 repetitions per arm.
- Counts per run: `skill.read` scripts; misreads by class (the three guard messages, plus a
  manual read for `typeof` paths); extra `execute` turns after a guard error; grades.
- Base rate: 13 misreads in 199 MCP `skill.read` scripts (6.5%) on 8 runs.
- Expected: fewer misreads in arm B, with no new script error class and no grade regression.

### Fix 1 recount

Fix 1 changes only the error path. A later authorized QA round recounts the three guard messages.

## Outcome

- Pattern 1: cause recorded (own-repo, Playground clip). Fix on `w1012/t`, needs measurement.
  No `improvements/` draft.
- Pattern 2: cause recorded (own-repo text gap). Fix 1 (guard) on `w1012/t`, error path only.
  Fix 2 (text) on `w1012/t`, needs measurement.
- Retained evidence: this ledger. Its consumers are the two `.agents/TODO.md` items.
