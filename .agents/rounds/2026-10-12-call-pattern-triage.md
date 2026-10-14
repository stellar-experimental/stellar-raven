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

## Review RP reconciliation

Review RP (Codex `gpt-6-astra`, high) returned CHANGES-NEEDED on `704d84ae`, with 8 findings.
Lane P (Claude Opus 5.5) reconciled all 8 in the three plans and the counter. No paid call ran.
These figures replace the "Measurement notes" figures above.

| Finding | Change |
| --- | --- |
| 1 Combined change unmeasured | The section screen now has four arms (A, T, G, TG; TG tree `8d32d670…`) in eight collections. The guard verdict compares T with TG when the text passes, and A with G otherwise. The claimed bound is gone. |
| 2 Missing grades | A grade-coverage rule: every row needs a grade in every compared collection, or the verdict is INDETERMINATE. `agent-limit` counts as `wrong`. Initial-judge retries have their own bounded reserve. No repair collection. |
| 3 Text exposure | All 16 rows stay in the text regression check. Section-read counts serve the mechanism only. |
| 4 Zero denominator | No section reads in T (or fewer than half of A) makes the rate claim INDETERMINATE. Read avoidance is a separate count. |
| 5 Counter | The counter parses scripts with acorn, marks unresolved calls `unknown`, and self-checks 14 fixtures (the 3 RP fixtures included). On the stored runs: 1,887 parsed MCP docs calls plus 4 in one unparsed script (1,891, as recorded), 0 omissions, 199 section-read scripts, and 6 of 28 Playground omissions. The 7 unresolved references are existence checks, not calls. |
| 6 Cost contracts | Sources listed by group. Primary estimate (rubric `v2.11` judge costs): $6.00 per collection, $9.88 upper reference. The `v2.10` runs are supplementary. Collection cap raised from $10 to $12. Re-judge median: $0.3443. |
| 7 Playground environment | An environment-hash assertion runs before every paid Playground command. |
| 8 Counter path | Both plans run a pinned copy of the counter outside every worktree, with its SHA-256 recorded before collection. |

New caps: $22 for the Playground screen, $132 for the shared section screen, and $74 for one
section change alone.

## Review RP2 reconciliation

Review RP2 (Codex `gpt-6-astra`, high) returned CHANGES-NEEDED on `4a5d17a1`, with four P2
findings. Lane P (Claude Opus 5.5) reconciled all four. No paid call ran.

| Finding | Change |
| --- | --- |
| 1 Prefix parse | The counter parses the whole script: first as a program, then as one expression that must consume the input (only semicolons and comments may follow). Anonymous function expressions still parse. A two-call fixture with an omission in the second call passes. |
| 2 Aliased reads | The counter follows each `codemode` reference through the syntax tree, including bracket steps. A reference that is not a direct `codemode.skill.read` call is an unknown skill read, even when the script also has a resolved read. The `alias-bracket` and `mixed-alias` fixtures pass. The self-check has 23 fixtures. |
| 3 Confirmation order | A fixed confirmation sequence: text first (K1 in A1, K2 in T1), then the guard comparison that the text verdict selects (K3 in B1, K4 in C1). A guard ID already re-judged in the same artifact reuses that grade. Four commands at $3 and four retries at $2. The section cap rises from $132 to $136. |
| 4 Agent-limit | An `agent-limit` cell keeps 0 through confirmation and is never re-judged. Only the gradeable side is confirmed. Two candidate `agent-limit` cells against two baseline grades above 0 are a confirmed system-failure regression. A skipped unsuccessful answer is never judge variance. No answering retry is authorized. |

Re-run on the stored results, the counter gives the same counts: 1,887 parsed MCP docs calls plus
4 in one unparsed script (1,891), 0 omissions, 199 section-read scripts, 0 unknown skill reads,
and 6 of 28 Playground omissions. Caps: $22 (Playground), $136 (section screen), $74 (one section
change alone).

## Review RP3 and the launch gate

Review RP3 (Codex `gpt-6-astra`, high) returned LAUNCH-OK on `619f5ffb`. It confirmed the four
RP2 fixes, the nine-step confirmation sequence for both text outcomes, the $136 cap, and the
stored counts. It found one P3: the `re-judge.mjs --dry-run` output does not report skipped rows.
The orchestrator replaced that instruction in `plan-section-guard.md` with a pre-command check
that calls `isUngradeableSavedRow`. On a stored artifact the check printed `[]` for two gradeable
IDs, and exited 1 for an unknown ID and for a synthetic `agent-limit` row.

The three reviews are in this folder: `review-rp-astra.md`, `review-rp2-astra.md`, and
`review-rp3-astra.md`. The pre-spend review gate is closed. LAUNCH-OK does not authorize spend:
the paid runs still need a spend authorization ($22 Playground, $136 section screen) and a free
paired-collection window.

## Measurement results

Collector: lane T (Claude Opus 5.5, high), 2026-10-13. Orchestrator: pane `w3W:p1P`.

### Spend authorization

The owner approved the spend on 2026-10-13 in chat: "approved for your next collection of work,
don't do stuff you don't need to, but do what's truely valuable and needful". The orchestrator
relayed it. It authorizes, once each, at their own caps:

- the Playground clip-marker A/B (`plan-clip-marker.md`), total cap $22;
- the four-arm section screen (A, T, G, TG) (`plan-section-guard.md`), total cap $136.

It does not authorize the $74 section-text-alone plan. `plan-section-text.md` supplies only its
reading rules. No continuation, no re-run, and no raised cap.

### Launch amendment 1: new `main`

`main` moved from `6891dca2` to `f7b1b77506acda9b674fb67610fbfd8b8e029e13` before launch. The
commits between them: #277 (catalog refresh guard), #278 (one corpus `truth.verified` change and
the consistency register), #279 (`agents` 0.28.1 and the MCP SDK packages), and #272 (judge pack
`p9`). The lane read `main` just before it built the arms. Draft PR #271 is not merged and is not
used.

All arms were rebuilt on `f7b1b775` with the same cherry-picks. Each cherry-pick applied without a
conflict.

| Arm | Commit | Tree |
| --- | --- | --- |
| BASE and A (`main`) | `f7b1b77506acda9b674fb67610fbfd8b8e029e13` | `227ee549a1d91aa09b03eb9946df09b0047be740` |
| CANDIDATE (clip marker) | `fb84c1996108cd80a9d737d9f866dbaf7222a8ce` | `ee10375356c64084bc328f7eedc2116f63aaadf0` |
| T (text) | `52415bb074d6347b12815232812b3f06b8e7dba8` | `0c8f0cca8e911b12af5ab20beea93f155924938f` |
| G (guard) | `7c2b203083376b6cc42dba9e21388f86a8fe400a` | `886b8ef6b3734e5cbe19f557d6e6d95f2dbefa1e` |
| TG (text and guard) | `e972a6f114009395e563440068e0aa5fa2aaf7a8` | `7117040bd2be9ffc2d8ec0d2d4a0371321145f41` |

Diff check (no new review needed):

- For each arm, `git diff <new main tree> <new arm tree>` is byte-identical to
  `git diff ab4c63e3 <reviewed arm tree>`, blob index lines included. So each arm diff shows the
  same changed lines as its commits.
- File lists: CANDIDATE `src/demo/tools.ts`, `test/smoke/demo-tools.test.ts`. T: the six reviewed
  files. G: the three reviewed files. TG: the seven files. `git diff T TG` shows the same lines as
  `git diff A G`.
- The new `main` changes no file in `src/demo/`, `src/executor/`, `src/mcp/`, or `specs/`. It changes
  `src/policy/scout-exposure.ts` (#277) on all arms alike.
- Frozen case bytes: the 22 frozen IDs (6 clip, 16 screen) have the same `eval/qa/cases.json` entry
  bytes and the same `lifecycle-registry.json` hash at `6891dca2` and at `f7b1b775`. All 22 are
  `active`. The #278 change touches only `q-tool-smart-wallet-repos-discovery`, which no plan uses.
- SDK receipt: every arm prints `7.0.137 4.0.91` (`ai`, `@ai-sdk/openai`).
- Judge pack: `main` now defaults to pack `p9` (#272). All eight screen collections use it, as the
  screen plan says. The clip judge also uses the `main` default; the pack is recorded from the first
  judged row. The stored grades are not comparable with these grades.
- Cost basis: a `p9` judge call costs about the same as a `p6` call (about $0.09). The caps stay
  $22 and $136.

### Clip marker: pins and checkpoints

| Pin | Value |
| --- | --- |
| BASE worktree | `/Users/kalepail/Desktop/raven-w1013-base` at `f7b1b775`, clean |
| CANDIDATE worktree | `/Users/kalepail/Desktop/raven-w1013-cand` at `fb84c199`, clean |
| `BASE_GENERATION` | `3f90c8cf41ba3b9b53e620f006277ee1960db5f6c3d3a930e61d6812750cded7` |
| `CANDIDATE_GENERATION` | `c83bb07086209ef2b78e010d6f184224501d101078958ae35c55e3839e545f3b` |
| SDK receipt | `7.0.137 4.0.91` in both arms |
| Smoke | Both arms pass `npm run test:smoke` |
| Dry runs | Both select the six frozen IDs in corpus order |
| Judge executable | Claude Code `2.1.296`, `JUDGE_SHA256` `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937` |
| `AGENT_ENVIRONMENT_SHA256` | `2a41a9e687b744638ab6c7dd6f65e835a05d9345ef3fcb1d317af01133726bec` (14 variable names) |
| Counter | `count-patterns.mjs` from `8c6f4f3c`, SHA-256 `2a99d5146cf48b3438d774f583027764ca225c43cb0c64378c16fcddca88c36f`; self-check 23 of 23 |
| Gateway | `stellar-raven-demo` spend rule read privately: a sliding 24-hour cost limit. The CLI gives no current-spend read; the dashboard was not read. The answer side of this plan costs about $2 at the Gateway; the judge does not use the Gateway. |
| Paired window | `/private/tmp/stellar-raven-paired-launch` absent at 2026-10-14T00:15:09Z |

### Deviation 1: server-slot checkpoint (both plans)

At 2026-10-14T00:15:09Z, `pgrep -f 'wrangler|workerd' | wc -l` printed `5`, not `0`. All five
processes are one `wrangler dev` server of a different project (`buzzchain/worker`, port 8787),
started by another session about three hours earlier. No Raven server ran. The lane did not touch
it and asked the orchestrator.

Decision (orchestrator, pane `w3W:p1P`, 2026-10-13): continue. The slot rule means "no other Raven
server, and no port or CPU contention from a server that starts during the run". Conditions, for
the clip plan and the screen plan:

1. Before each server start, while the lane's own server is stopped, record the count. It must be
   `5` (the baseline) or `0` (the foreign server stopped). Any other value stops the method before
   the next paid call. Never use `pgrep -fl` or `ps` with arguments.
2. Every server start in both plans uses port `8799`. Before each start,
   `lsof -nP -iTCP:8799 -sTCP:LISTEN` must show no listener.
3. All other checkpoints stay as written.

### Clip marker: rule 6 confirmation list (written before the re-judge spend)

After B1, C1, C2, and B2, one row has both CANDIDATE grades worse than both BASE grades:
`q-scf-build-award-cap` (BASE `correct`, `correct`; CANDIDATE `partial`, `partial`). It is a control
row. The list is that one ID. Re-judge it once in B1 and once in C1, at `--max-budget-usd 1` each.

### Clip marker: result

Full record: [result-clip.md](2026-10-12-call-pattern-triage/result-clip.md). Spend $3.3301962 of
the $22 cap (probe, B1, C1, C2, B2, two re-judges). All four runs are complete, with 24 of 24
grades, judge pack `p9`.

- Target M1 (omitted required input on the two target rows): BASE 3, CANDIDATE 0. Controls: 0
  and 0. M2 matches M1. Two readers agree.
- Arm integrity, routing, protocol controls, and tool-loop checks pass.
- Rule 6 list: `q-scf-build-award-cap`. The re-judge reproduced the difference (B1 `correct`, C1
  `partial`).
- **Proposed verdict: FAIL** under the fixed rules (a confirmed verified answer regression on a
  control). The result file gives the trace for the non-author reviewer: C1 omits the installments
  (answer content); C2 has the same wording that B1 and B2 got `correct` for (judge variance).
- **Final verdict on `f7b1b775`: PASS** (post-run review; see "Post-run review reconciliation").

### Section screen: pins (before A1)

| Pin | Value |
| --- | --- |
| Arms | A `f7b1b775` (tree `227ee549`), T `52415bb0` (`0c8f0cca`), G `7c2b2030` (`886b8ef6`), TG `e972a6f1` (`7117040b`); worktrees `raven-w1013-{a,t,g,tg}` |
| Runner | `raven-w1013-runner` at `f7b1b775`, clean |
| Freeze | All five worktrees clean, no untracked file. Each server arm passes `npm run typecheck`, `npm test`, and `npm run test:smoke`. A first parallel `npm test` on T, G, and TG timed out (5-second test timeouts under load); a sequential rerun passed (143 files each). |
| Surface size (`npm run mcp:surface`) | `execute` description: A 9,841, T 10,046, G 9,841, TG 10,046 characters |
| Counter | SHA-256 `2a99d5146cf48b3438d774f583027764ca225c43cb0c64378c16fcddca88c36f`; self-check 23 of 23 |
| `AGENT_BINARY_SHA256` | `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937` (Claude Code `2.1.296`, linked from `/private/tmp/raven-section-screen/bin`) |
| `AGENT_ENVIRONMENT_SHA256` | `190d0b47f86ab39d51716fe67dab7e50a97a92381f230ce156d3f3531b892368` |
| Remote identity probe | SHA-256 `eb06cd89bc6232d6747b7d44973f2deec272b48ba343b9d19a9800b74a18c226`; `--stable-sha256` vector `414667aa38583bc99d775e02c7efe3e5a8a731f33e756668141052e05fe1205e` (00:36:53Z to 00:47:00Z) |
| Judge-stability register | `/private/tmp/raven-section-screen/judge-stability.json`, SHA-256 `aebd5b94346141599ada2e85ab0f4a40beff5937ed52d2e2728ab67e7aa7c54c` (538 cases, 199 artifacts from the main checkout's `eval/qa/results/`) |
| `.dev.vars` identity | One salt across A, T, G, TG; the four lines match (10 names); hash `67f487c7066fa995b5b7c4aa4948873296322a45f675e5144d7c084f181504fc` |
| Paired window | `/private/tmp/stellar-raven-paired-launch` absent |
| Server slot | Deviation 1 applies (count 5 or 0; port 8799) |
| Cost basis | Judge pack `p9`. A `p9` judge call costs about $0.09, as `p6` did (P1 judge median $0.0887; clip `p9` judge calls $0.0563 to $0.1153). The caps do not change: $12 per collection, $136 in all. |

### Section screen: progress and stop

| Collection | Server start | Window (UTC, 2026-10-14) | Spend (USD) | Section-read scripts | Guard messages |
| --- | --- | --- | ---: | ---: | ---: |
| A1 | A-1, surface `656feeef…` | 00:47:52–01:10:35 | 6.6985946 | 23 | 0 |
| T1 | T-1, surface `0e429c70…` | 01:12:15–01:34:00 | 6.6318970 | 15 | 0 |
| G1 | G-1, surface `656feeef…` (equals A) | 01:34:28–01:56:15 | 6.7421682 | 17 | 0 |

Each collection: 16 rows, `comparable: true`, aggregates not suppressed, no missing cost, pack
`p9`, rubric `v2.11`, cases `5872d752…`, `qaImplementationSha256` `5c2f1adb…`.

Incident (no spend): the first T1 command at 01:11:44Z ran from a `zsh` script whose startup
files changed `PATH`. `run-qa.mjs` refused before any model call ("Claude environment: expected
SHA-256 190d0b47…, observed a68db5c5…; refusing paid calls"). It wrote no artifact. The driver
then used `zsh -f`, which keeps the pinned environment, and T1 ran on the same server start.

**Stop (deviation 1, condition 1).** At 01:57:06Z, with the lane's own server stopped, the
server-slot count was 36, not 5 or 0. The new processes are `wrangler dev` servers of six other
`buzzchain` worktrees (another project, other sessions), started from about 01:46Z to 01:57Z,
during G1. The lane did not start TG1. No paid call ran after G1.

### Orchestrator amendment 2 (2026-10-14, before TG1)

Decision (orchestrator, pane `w3W:p1P`): continue the screen. The amendment was made after A1, T1,
and G1, before TG1, and before any data from a later collection existed. (The lane had read the
A1 and T1 script classifications and the G1 grades; no later data existed.)

Reason (orchestrator): idle foreign `wrangler dev` servers on other ports do not share the Raven
server, the port, or DocSearch. Contention is what matters, so the lane measures it directly. The
machine has 16 cores; the 1-minute load at 01:58Z was 7.5.

(Post-run review correction: `result-screen.md` records 19.11 at 01:58Z, from the lane's own read.
The 7.5 is the orchestrator's read. No receipt exists for either value, so the record cannot
reconcile them. Neither was a gate input. TG1's retained pre-start receipt reads 10.36 at
01:59:55Z.)

New conditions. They replace conditions 1 and 2 of deviation 1 for the rest of the screen:

1. Before each start, with the lane's own server stopped: `pgrep -f 'raven-w1013' | wc -l` prints
   `0`, and `lsof -nP -iTCP:8799 -sTCP:LISTEN` shows no listener. Port 8799 stays. The total
   `wrangler|workerd` count is recorded for information only.
2. Before each start, record `uptime`. The 1-minute load average must be 12 or lower. If it is
   higher, wait up to 30 minutes for it to drop. If it stays higher, stop and report.
3. Contention check on G1 and on each later collection, before the next start: count rows with
   an `execute` or sandbox timeout, or a host or server error (not an upstream service error),
   from the artifact. A collection with a count above max(A1, T1) + 1 is non-comparable: stop and
   report.

All other rules, caps, and stop rules stay as written.

Contention check result (01:58Z): A1 0, T1 0, G1 0 rows. The limit is 1, so **G1
keeps its slot**. The only `execute` errors in the three collections are model errors: a `.slice`
on a section object (A1), an undefined `hits` read (A1), a syntax error (G1), and an unknown tool
name (G1).

### Section screen: collection complete, confirmation sequence

All eight collections ran in the plan order (A1, T1, G1, TG1, TG2, G2, T2, A2), seven server
starts, port 8799. Each collection: 16 rows, `comparable: true`, no missing cost, contention
count 0, pack `p9`. The last server stopped at 03:47:09Z.

Confirmation sequence (written before any re-judge spend):

1. Text consistent-change list (A against T, all 16 rows): **empty**. No row has both T grades
   on the same side of both A grades.
2. and 3. K1, K2, K1r, K2r: skipped (empty ID set).
4. Live check of T `wrong` answers on the text list: none (T1 and T2 have no `wrong` grade).
   Text verdict read: see `result-screen.md`.
5. Guard comparison selected: **T against TG** (text verdict proposed PASS).
6. Guard consistent-change list (T against TG): **empty**.
7. and 8. K3, K4, K3r, K4r: skipped (empty ID set).
9. No C `wrong` on the guard list. Guard verdict read: see `result-screen.md`.

No initial-judge retry was needed (no `judge-*` row). No replacement ran.

### Section screen: result

Full record: [result-screen.md](2026-10-12-call-pattern-triage/result-screen.md). Spend $51.4396056
of the $136 cap (eight collections; no re-judge, retry, or replacement).

- **Text (A against T): proposed PASS.** Misreads 4 in 40 section-read scripts (A) against 0 in 31
  (T). No new script-error class. No consistent grade change on the 16 rows. M in A is exactly the
  floor of 4.
- **Guard (T against TG, selected by the text PASS): proposed INDETERMINATE.** E = 0 in TG1 and
  TG2: TG made no misread for the guard to act on. F = 0 and no consistent grade change.
- Diagnostic A against G: the guard fired once, the model recovered, and 4 co-results were lost.
  One unconfirmed consistent drop (`q-defi-build-staking-for-own-token`) on a row where the guard
  did not fire.
- Two readers (Claude Opus 5.5 and Claude Sonnet subagents) agree on all 139 classified scripts.

Total round spend: $3.3301962 (clip) + $51.4396056 (screen) = $54.7698018.

## Post-run review reconciliation

Review: [review-post-run-astra.md](2026-10-12-call-pattern-triage/review-post-run-astra.md)
(Codex `gpt-6-astra`, high, on `26ee296a`; made no paid call). The orchestrator (pane `w3W:p1P`)
accepts all three verdicts. Lane T2 (Claude Opus 5.5, high) reconciled it on 2026-10-14.

| Change | Review verdict | Final verdict on `f7b1b775` | Merge status |
| --- | --- | --- | --- |
| Playground clip marker | CLIP: PASS | **PASS** | Needs one measurement on the new `main` first: #271 changed `src/demo/` evidence labels (orchestrator). |
| Section-shape text | TEXT: PASS-CONFIRMED-NEEDS-REMEASURE | **PASS (needs re-measure)** | Needs one measurement on the new `main` first. |
| Section guard | GUARD: INDETERMINATE-CONFIRMED | **INDETERMINATE** | Does not merge. |

- **Clip.** The proposed FAIL is not confirmed. The reviewer read all four SCF answers, their
  evidence, and both re-judge reasons. C1's omission of the installments is real answer content.
  C2 has the same "four installments" content as B1 and B2; its judge applied a different
  standard (an explicit milestone link). That difference is judge variance under the written
  non-author trace rule (ai-upgrade plan: "A judge verdict alone does not establish a
  regression"). No content regression repeats in both CANDIDATE runs, so clip rule 4 does not
  hold. All stored grades stay. No threshold or exception is added. `result-clip.md` now carries
  the trace and the final verdict.
- **Text.** The PASS follows the fixed rules on `f7b1b775` (A) and `52415bb0` (T). During the
  screen, the orchestrator merged #271 (`0a60d98a`), which changes the `execute` description, the
  server instructions, the success envelopes, and the source footers. A clean cherry-pick proves
  source compatibility only. So the text needs a measurement on the new `main` before merge.
- **Guard.** INDETERMINATE (E = 0 in TG1 and TG2). It does not merge. Do not merge it with the
  text.
- **Report corrections**, made in the result files:
  - `result-clip.md`: 25 answer turns, not 26 (7 + 12 + 6 in the step files).
  - `result-clip.md`: the SCF row in B2 called `scout` only; its routing class stays E.
  - `result-clip.md`: the marker counts per row are for hit cards only. The `widerCandidates`
    cards add C1 SCF 1, C1 SEP-45 1, and C2 SCF 1 (C1 SCF 5, SEP-45 11; C2 SCF 4 in all).
  - This ledger and `result-screen.md`: the 01:58Z load values (7.5 against 19.11) are noted
    above. No receipt exists for either.
- The review also confirmed the counter reruns, the screen counts, all identities, and the spend
  ($54.7698018). The evidence limits it names stay open: the clip generation is operator-asserted,
  and the removed worktrees prevent a repeat of the clean-tree and `.dev.vars` checks.

## Re-measurement on the new `main` (lane T2)

Collector: lane T2 (Claude Opus 5.5, high), pane `w3W:p4V`, 2026-10-14. Orchestrator: pane
`w3W:p1P`. Everything in this section up to "Re-measurement results" was written before the
first paid call.

### Spend authorization 2

The owner approved on 2026-10-13: "approved for your next collection of work, don't do stuff you
don't need to, but do what's truely valuable and needful". The owner also delegated run decisions:
"I approve whatever you need to do just don't run stuff you don't actually need to". Under that
delegation, the orchestrator authorized on 2026-10-14, once each, at their own caps:

1. The clip plan (`plan-clip-marker.md`) again, on the new `main`: cap $22 (expected about $3.40).
2. The text-only fallback of `plan-section-text.md` (A1, T1, T2, A2, with the guard plan's shared
   commands, and the K1/K2 re-judges and retries as the text plan says): cap $74 (expected about
   $27).

No guard arm. No continuation, no re-run, and no raised cap.

Reason: `main` moved after the measurement. The orchestrator merged #271 (answer-style v2,
`0a60d98a`) during the screen. #271 changes the `execute` description, the server instructions,
the success envelopes, the source footers, and the `src/demo/` evidence labels. The measured arms
did not contain it (post-run review, finding 1; the orchestrator applies the same reasoning to the
clip).

### Launch amendment 3: `main` `0a60d98a`

The lane read `main` at 2026-10-14T04:04:40Z: `0a60d98a48e3bc0c7076961e33991aee2c7375d8` (#271 on
top of `f7b1b775`). It rebuilt the clip arms and the A and T arms on it with the same
cherry-picks. Each cherry-pick applied without a conflict (git auto-merged the shared files).

| Arm | Commit | Tree |
| --- | --- | --- |
| BASE and A (`main`) | `0a60d98a48e3bc0c7076961e33991aee2c7375d8` | `488e1aeb923435c8da13799c47d72a5a75097140` |
| CANDIDATE (clip marker: `c3b25d94`, then `6ab15c9f`) | `6e0d11000f6762e773189e66278fd8979fedd880` | `d4cc6e801d68631cd9936c91a4d61d24ce889745` |
| T (text: `7cf3a833`) | `badbda8a045620b64df626e82e8ff2cce579f479` | `eb1a91e2da8fc06a4ab8aebf7560464d302aaab2` |

Diff check (no new review needed):

- For each arm, the changed lines (`+` and `-` lines, per file, in order) of
  `git diff 0a60d98a <arm>` equal those of the reviewed arm diff `git diff f7b1b775 <old arm>`
  (CANDIDATE against `fb84c199`, T against `52415bb0`). The diffs are not byte-identical: #271
  moved the patch context and the hunk positions in `src/demo/tools.ts`,
  `test/smoke/demo-tools.test.ts`, `src/mcp/tools.ts`, `src/executor/providers.ts`, `src/site.ts`,
  and the test files. The brief allows a context difference.
- File lists: CANDIDATE `src/demo/tools.ts`, `test/smoke/demo-tools.test.ts` (21 and 19 changed
  lines). T: the six reviewed files (2, 2, 3, 3, 1, 6 changed lines).
- `eval/`, `catalog/`, `package.json`, `package-lock.json`, and
  `scripts/run-playground-semantic-eval.mjs` are unchanged from `f7b1b775` to `0a60d98a`. So the 22
  frozen case entries and `lifecycle-registry.json` have the same bytes as in launch amendment 1.
  The 22 IDs are `active`.
- Judge default: `eval/qa/evidence-pack.mjs` `PACK_VERSION` is `p9` (unchanged). The pack is
  recorded from the first judged row of each run. Rubric `v2.11` is expected.
- Cost basis: the lane T runs on `f7b1b775` cost $0.76 to $0.80 per clip run and $5.83 to $6.74 per
  screen collection (pack `p9`). #271 adds caveat markers and source footers to the envelopes, so
  the input can grow a little. The caps stay: $3 per clip run, $12 per collection. Expected: about
  $3.40 (clip) and about $27 (text: four collections at about $6.5, plus reserves not used).
- Freeze: the five worktrees `raven-w1013-{base,cand,a,t,runner}` are clean, with no untracked file.
  BASE, CANDIDATE, A, and T pass `npm run test:smoke` (124, 125, 124, 124 tests). A and T pass
  `npm run typecheck` and `npm test` (143 files each; run one at a time). SDK receipt
  `7.0.137 4.0.91` in each arm.

### Clip pins (v2)

| Pin | Value |
| --- | --- |
| `$B` | `/private/tmp/raven-clip-marker-v2` |
| `BASE_GENERATION` | `9743c67c5a9a0568283274f80a4d20b2ed0b49d8e555fdfc111e7214aa258f87` |
| `CANDIDATE_GENERATION` | `6d65ccb545409be3831b6bbcbd5b36dd14c6d9d3bfc1416fdefd02da79950f85` |
| Dry runs | Both select the six frozen IDs in corpus order |
| Judge executable | Claude Code `2.1.299` (the installed version moved from `2.1.296`), `JUDGE_SHA256` `ba5ab7b8c195fa03ab8d5bf3915c76153b576a2c40e79a5c46e265e7ed9744b3` |
| `AGENT_ENVIRONMENT_SHA256` | `44fab7741c89828747de93eb2a8f27dd7946493f907033d3c94427d339b91f12` (14 variable names) |
| Counter | `count-patterns.mjs` from `8c6f4f3c`, SHA-256 `2a99d5146cf48b3438d774f583027764ca225c43cb0c64378c16fcddca88c36f`; self-check 23 of 23 |
| Gateway | Not read: no CLI read exists, and the dashboard is not open to the lane (as in lane T). The answer side costs about $1.40 at the Gateway. |

### Text pins (v2)

| Pin | Value |
| --- | --- |
| `$B` | `/private/tmp/raven-section-text-v2` |
| Arms | A `0a60d98a` (tree `488e1aeb`), T `badbda8a` (tree `eb1a91e2`); worktrees `raven-w1013-{a,t}` |
| Runner | `raven-w1013-runner` at `0a60d98a`, clean |
| Surface size (`npm run mcp:surface`) | `execute` description: A 10,367, T 10,572 characters (difference 205, as on `f7b1b775`) |
| Counter | SHA-256 `2a99d514…`; self-check 23 of 23 from the runner |
| `AGENT_BINARY_SHA256` | `ba5ab7b8c195fa03ab8d5bf3915c76153b576a2c40e79a5c46e265e7ed9744b3` (Claude Code `2.1.299`, linked from `$B/bin`) |
| `AGENT_ENVIRONMENT_SHA256` | `ab375f5217db1e878d6786279d8b5d7134d299db2415e3a1f9ed71c96ca6a12d` (14 names) |
| Remote identity probe | SHA-256 `eb06cd89bc6232d6747b7d44973f2deec272b48ba343b9d19a9800b74a18c226`; `--stable-sha256` vector `414667aa38583bc99d775e02c7efe3e5a8a731f33e756668141052e05fe1205e` (ended 04:18:30Z) |
| Judge-stability register | `$B/judge-stability.json`, SHA-256 `5b5c16ae90547df8252adf60f549dc0cf33ec09d62c855cf8a4d1ffb4f1461a9` (538 cases, 199 artifacts from the main checkout's `eval/qa/results/`, read only) |
| `.dev.vars` identity | One fresh salt across A and T; the two lines match (10 names); hash `326b20074531faf0fb922309cfd6b8f9e22630a45336283594246d7b8a859ba8` |
| Paired window | `/private/tmp/stellar-raven-paired-launch` absent at 04:18:41Z |
| Surfaces | Recorded at each server start (`report-live-surface.mjs`); T must differ from A |

### Slot conditions (orchestrator amendment 2, predeclared for both plans)

1. **Raven-process gate.** Before each server start, with the lane's own server stopped:
   `pgrep -f 'raven-w1013' | wc -l` prints `0`, and `lsof -nP -iTCP:8799 -sTCP:LISTEN` shows no
   listener. Every start uses the fixed port `8799`. The total `pgrep -f 'wrangler|workerd' | wc -l`
   is recorded for information only. Never `pgrep -fl` or `ps` with arguments.
2. **Load gate.** Before each start, record `uptime`. The 1-minute load average must be 12 or
   lower. If it is higher, wait up to 30 minutes for it to drop. If it stays higher, stop and
   report.
3. **Contention check**, before the next start and for every collection: count rows with an
   `execute` or sandbox timeout, or a host or server error (not an upstream service error), from
   the artifact. Limit: the maximum count of the baseline collections completed so far (clip: B1,
   B2; text: A1, A2), plus 1. After the last baseline collection, every collection is checked again
   against max(both baselines) + 1. A count above the limit makes that collection non-comparable:
   stop and report.
4. One Raven server at a time, in a pane split from `w3W:p4V`. No pipes on gate or paid commands.
   Paid drivers run under `zsh -f`.

### Clip v2: rule 6 confirmation list (written before any re-judge spend)

After B1, C1, C2, and B2 (04:27Z to 04:40Z), no row has both CANDIDATE grades worse than both
BASE grades. The list is **empty**. No rule 6 re-judge, no rule 7 retry, and no initial-judge
retry runs (24 of 24 grades are valid).

### Clip v2: result

Full record: [result-clip-v2.md](2026-10-12-call-pattern-triage/result-clip-v2.md). Spend $3.3652473
of the $22 cap (probe, B1, C1, C2, B2; no re-judge). Four complete runs, 24 of 24 grades, pack
`p9`, rubric `v2.11`.

- Target M1: BASE 3, CANDIDATE 0. Controls: 0 and 0. M2 equals M1. Two readers agree.
- Arm integrity, routing, protocol controls, and tool-loop checks pass. Rule 6 list empty.
- Live checks of the two CANDIDATE `wrong` cells find no factual error (must-avoid grades).
- **Proposed verdict on `0a60d98a`: PASS.**

### Text v2: collections complete, confirmation list (written before any re-judge spend)

A1, T1, T2, and A2 ran in the ABBA order (04:42Z to 06:16Z), three server starts (A-1; T-1 for T1
and T2; A-2), port 8799. Each: 16 rows, `comparable: true`, aggregates not suppressed, no missing
cost, pack `p9`, rubric `v2.11`, contention count 0 (limit 1). No `judge-*` or `agent-*` row, so no
initial-judge retry.

Confirmation sequence, steps 1 to 4 (text plan rule 8):

1. Text consistent-change list (A against T, all 16 rows): **`q-defi-build-staking-for-own-token`**
   (A1 1, A2 1; T1 2, T2 2), a consistent **improvement**. No consistent regression.
2. K1: re-judge `q-defi-build-staking-for-own-token` in A1, `--max-budget-usd 3`. K2: the same ID in
   T1, `--max-budget-usd 3`. Both cells are graded (no `agent-limit`).
3. K1r and K2r only if K1 or K2 ends T4 or T5.
4. Live check of every graded T `wrong`: T1 `q-pc-surge-griefing-threat-model` (not on the list).

### Text v2: result

Full record: [result-text-v2.md](2026-10-12-call-pattern-triage/result-text-v2.md). Spend
$27.0449732 of the $74 cap (A1, T1, T2, A2, K1, K2; no retry, initial-judge retry, or
replacement).

- K1 (A1): `partial` → `partial`. K2 (T1): `correct` → `partial`. The staking improvement is not
  reproduced: judge variance, no change. K1r and K2r not needed.
- Live check of the one graded T `wrong` (T1 `q-pc-surge-griefing-threat-model`): no factual
  error (a must-avoid grade); not a consistent change.
- Misreads: A 6 in 38 section-read scripts (A1 2, A2 4), T 0 in 35. No new script-error class. No
  consistent regression. Two readers agree on 72 of 73 scripts; one class difference reconciled.
- **Proposed verdict on `0a60d98a`: PASS.**

### Re-measurement totals

Lane T2 spend: $3.3652473 (clip, cap $22) + $27.0449732 (text, cap $74) = **$30.4102205**. No stop
rule fired. No guard arm ran.

Note (read at the end of the lane): `main` moved to `d6d6ca67` (#281, "demo: name required inputs
in clipped Playground signatures", 2026-10-14T06:15Z). Its tree is `d4cc6e801d68631cd9936c91a4d61d24ce889745`,
the measured clip CANDIDATE tree. #281 changes only `src/demo/tools.ts` and
`test/smoke/demo-tools.test.ts`; no MCP-visible file. So the text arms (A `0a60d98a`, T `badbda8a`)
still differ from a text candidate on `d6d6ca67` only in Playground files.
