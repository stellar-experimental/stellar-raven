# Step 3 implementation: the identifier pointer, item 5 (free work, no paid run)

Implementer: Claude Sonnet 5.5 (`claude-sonnet-5-5`), terminal `loop2-impl3` (`t1py`), worktree `raven-wt/loop2`, branch `tune/loop-2`.
Orchestrator: Claude Fable 5.2 (`kalepail-c3614nvxph-mbp/t40f`). Plan: [`PLAN.md`](PLAN.md) item 5 and section 4 ("R"), with [`PLAN-AMENDMENTS.md`](PLAN-AMENDMENTS.md) A6 (the trigger accepts only
a hyphenated or joined token) and the notes of both step reviews that touch item 5. Step 2 is decided (the round ledger, "P2 result, step 2 decided"; the source stays unproven, called on 3 of 58 rows, no
intrusion, no traced displacement, nothing read as shipped value). No model-calling command ran, no collection ran, nothing was deployed or uploaded. **The targeted read R is not authorized by this file.**

## 1. Commits

| Commit | What | Diff |
|---|---|---|
| `7b17bb2f` | Round ledger: P2's result, step 2 decided, with the run lane's caveats | 1 file, +25 |
| **`a49ee918`** | **Item 5, the pointer.** Catalog field, token rule, call ledger, one checkpoint sentence, tests, `eval/gates.json` fingerprint. One commit; the wording was frozen here before any stored answer, transcript or golden was read | 16 files, +594 −44 |
| `3d65d0ff` | Replay tooling: a static reader of stored scripts and the env-gated replay test | tests and `eval/` only |
| `ed6fd569` | The replay's outputs, the live check and its outputs (`scans/step3/`) | data and scripts only |
| this file's commit | `STEP-3-IMPL.md`, the ledger entry | docs only |

`git diff a49ee918 HEAD -- src scripts catalog specs package.json wrangler.jsonc env.d.ts` is empty: the Worker of every later commit is `a49ee918`'s. **Reverting:** `git revert a49ee918` applies clean, and
the product paths (`src scripts catalog specs eval/gates.json package.json`) are then identical to `bd9719fb` (checked in a scratch worktree: 0 differing lines). The replay test and its helper import the reverted
code, so they go with it. Item 5 changes execute results only (section 3).

## 2. What changed

**Build.** `src/catalog/document-series.ts` holds the one definition of a document series: an operation in a candidate lane (`semantic`, `research`, `av`) with a string `q` or `query` input, an input enum
`source`, and an output array whose rows carry `source` and `url` (the two fields arm 2's `exactRowsOf` already reads). The series are the enum's values that are plain lower-case letters. The build
(`scripts/build-catalog.mjs`, `attachDocumentSeries`) records `documentSeries: { filter, query, values }` on that entry; `loadManifest` recomputes it, so a hand edit, a missing field or a field on an
operation the schemas do not support fails (tests for each). No list of standards exists in the host. Today the rule matches one operation, `scout.searchResearch`, with seven series from Scout's own enum:
`sep`, `cap`, `paper`, `lumenloop`, `audit`, `incident`, `release` (`sdf-blog` and the other hyphenated values cannot be the letters of an identifier). The plan said "today only `scout.searchResearch`, `source`" for any
enum filter its rows carry; the schemas hold twelve such filters (`getHackathons.source`, `listSkills.source`, `searchResearch.severity`, `searchProjects.category` and others), so the rule is narrowed to arm 2's own
identity fields (decision D2).

**Token rule.** `src/policy/identifier-token.ts`: letters, an optional hyphen, digits, no space (`SEP-45`, `CAP-0046`, `sep24`); a token followed by `-` or `.` and a digit is a longer identifier and is not read
(`CVE-2024-1234`, `SEP-43.1`). Zero padding is one number. Arm 2 now calls the same function with its spaced form unchanged (a query may say `SEP 45`); a test pins both.

**Ledger.** `OpLedgerCall.identifiers` (`src/executor/providers.ts`): the joined tokens of a declared series that a call's string arguments name (values of objects and arrays, to depth 4 and 64 strings), on every outcome,
including a call the guard refused. Nothing is recorded for a call that names none.

**Pointer.** `identifierPointersOf` (`src/executor/run.ts`): one pointer per identifier that a call named and that no call to the series' operation named (any spelling of the same number; any outcome of that call),
in order of first appearance, at most three (`MAX_IDENTIFIER_POINTERS`). `evidenceRecoveryHint` carries it as `identifier` beside `detail`; the `EVIDENCE CHECKPOINT` block renders it after the detail sentence and before the
alternatives sentence, and alone when nothing else renders. The Playground's pointer path generalised: `detailOnlyHint` is `pointersOnlyHint` and the mode `"detail-only"` is `"pointers-only"`, so a pointer never spends the
Playground's one recovery-advice cycle (decision D5).

## 3. What it must not change, and the evidence

| Claim | Evidence |
|---|---|
| `search` hits, order, `recovery` and the routing rows are untouched | The ordered top-five lists of **all 495 routing cases** (legacy, extended, skills lane, protocol-history lane) are **byte-identical** between the previous manifest on the previous code (the commit before `a49ee918`, `7b17bb2f`, in a detached worktree) and this manifest (`--dump-ranked`, `cmp`). `eval:routing --gate` exits 0. Only the manifest fingerprint in `eval/gates.json` moves (re-baselined explicitly, note and trace updated; decision D4) |
| Served text is unchanged | `node eval/report-live-surface.mjs` on this tip: surface `42ec61020a5f38c73ac30eb204ff424f30220f68ee3827373071c077ada8f17f` (**P2's pin**), instructions 1,899 characters (`67a6bd0b…6c00`), `search` 1,960, `execute` 1,964, descriptions 3,924, input schemas 1,661 |
| The new manifest field is not model-visible | A live `search`, `codemode.describe("scout.searchResearch")` and `codemode.catalog()` do not contain `documentSeries` |
| A result with no such identifier is byte-identical | A unit test; the live `execute` with no identifier carries the same blocks as before; the replay's non-firing executes are unchanged by construction (the sentence needs a ledger identifier) |

## 4. The exact text added, with character counts

The only text a model can read that did not exist before is one sentence in the `EVIDENCE CHECKPOINT` block, built from the pointer: the token as the call wrote it, the series letters (lower-case) from the
manifest, the operation id from the manifest, and the filter and query input names from the manifest. **Frozen in `a49ee918`.**

> If `SEP-45` names a document, `scout.searchResearch` holds documents of source `sep`: call it with `{ q: "SEP-45", source: "sep" }`. A row it marks exact is the document itself.

| Form | Characters |
|---|---:|
| Template, fields as placeholders (`<token>`, `<target>`, `<filter>`, `<series>`, `<query>`) | 187; 126 fixed |
| `SEP-45` (the example above) | **177** |
| `SEP-9` (shortest seen in the replay) | 175 |
| `CAP-0046` (longest seen in the replay) | 181 |
| `SEP-99999` (a named identifier that does not exist) | 183 |
| Three sentences in one result, joined by single spaces | 531 to 541 (replay) |
| The block header before it, when it stands alone | 30 |

Changes from the plan's draft (about 175 characters, opening "`SEP-45` names a document."): "If … names a document," because the host cannot know that
the identifier names one (A6's non-existent identifier; a test checks that the sentence asserts nothing about existence), and the operation, the series and the two input names are read from the manifest instead of
being fixed text. The draft's length is kept (177).

Not model-readable: the manifest field `documentSeries` (13 lines), the ledger field, and the telemetry that already logs the recovery hint (now with an `identifier` list).

## 5. Unit tests (`test/identifier-pointer.test.ts`, 31 cases; `test/smoke/executor.test.ts`, one case)

- **Series from the manifest:** only `scout.searchResearch`; its values equal the upstream enum's plain-letter values; `sdf-blog` is absent; the rule needs an input enum, a string query, rows with `source` and `url`, a candidate lane, and an operation; the manifest check fails on a removed, extra, altered or unsupported field.
- **A6's non-identifier tokens do not fire:** `audit 2024`, `release 23`, `incident 2023`, `paper 1`, `SEP 45`, `version 2`, `CVE-2024-1234`, `SEP-43.1`, `protocol-23.2`.
- **Fires:** `SEP-45`, `CAP-0046`, `sep24`, with the token as written.
- **A named identifier that does not exist:** `SEP-99999` fires, and the sentence says "If … names a document".
- **An identifier already answered:** silent when a research call names it in any spelling (`SEP-45`, `sep-45`, `SEP-0045`, `sep45`, inside a longer query), when that call carries an exact row, and when it failed, soft-emptied or was refused.
- **Scripts that mix lanes:** a Docs search naming `SEP-45` and `CAP-46`, a directory call, a Lumenloop call naming `sep-10`, and a research call naming `CAP-46`: pointers for `SEP-45` and `sep-10` only, in that order. More than three identifiers give three.
- **Arm 2 is unchanged:** its spaced form still marks the exact row, and `audit 45` does not.
- **The ledger:** an ok call and a failed call record their identifiers; a call that names none records none; the smoke case runs the real sandbox with the real catalog (a Docs search naming `SEP-45`, a script that researches `sep-0045`, a script of phrases).

## 6. Free checks

All free, no model call. The wording was committed and pushed (`a49ee918`) before any of this. **What was read:** the scripts (`transcript[].input`) and the result text (`transcript[].result`) of execute entries. The replay code
does not read `answer`, `truth` or `verdict`. The results files are parsed whole, so those fields are in memory; the rows were selected by `sets.tuning` id first (`selectById`, counts asserted: 79, 50, 50, 50, 58, 58, 10, 10,
58). No held-out or reserve row was selected; none is in these files' selection.

### 6.1 The replay over the stored tuning executes

`test/replay-identifier-pointer.test.ts` (skipped without its environment variables, so `npm test` never reads a results file), run over nine stored runs: the four loop 1 runs (`baseline` 79 rows, `step0prime`, `arm1`, `arm3`,
50 each), P0, P1 pass 1 and P2 (58 each), and P1's two repeat passes over the guard rows (`P1b`, `P1c`, 10 each). Each execute's called operations and outcomes come from the footer of its stored result
(`calls: op=ok/…`); the arguments each call held come from the script's syntax tree (`eval/qa/replay-call-args.mjs`, acorn), following literals, `const` names, templates, concatenation, and `.map` or `for…of` parameters.
The sentence, the ledger, `identifierPointersOf` and the hint builder are the real ones. **Certain** = no research call can have named the identifier, even if every research call the reader could not follow had named every
string of the script. **Possible only** = the identifier reaches a call only through an argument the reader could not follow. Reproduce: `RAVEN_REPLAY_SPLIT=<split> RAVEN_REPLAY_RUNS=<label=path,…> RAVEN_REPLAY_OUT=<report.json>
npx vitest run test/replay-identifier-pointer.test.ts`, then `node scans/step3/summarize.mjs <report.json>` (outputs: `scans/step3/replay-report.json`, `replay-summary.md`).

#### Replay: how often the pointer fires

| Run | Rows | Executes with calls | Executes naming a series identifier | Executes that fire, certain | Executes that fire, possible only | Rows, certain | Rows, possible | Series that fired |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| baseline | 79 | 138 | 21 | 15 | 0 | 13 | 0 | sep 20, cap 3 |
| step0prime | 50 | 84 | 26 | 22 | 0 | 15 | 0 | sep 28, cap 4 |
| arm1 | 50 | 81 | 18 | 15 | 1 | 13 | 1 | sep 19, cap 3 |
| arm3 | 50 | 78 | 22 | 18 | 1 | 14 | 1 | sep 24, cap 2 |
| P0 | 58 | 113 | 23 | 17 | 0 | 14 | 0 | sep 20, cap 3 |
| P1 | 58 | 106 | 18 | 13 | 0 | 12 | 0 | sep 17, cap 3 |
| P1b | 10 | 16 | 1 | 1 | 0 | 1 | 0 | sep 1 |
| P1c | 10 | 19 | 0 | 0 | 0 | 0 | 0 | none |
| P2 | 58 | 107 | 19 | 15 | 1 | 12 | 1 | sep 19, cap 1 |

#### Replay: against the agent's own research calls

| Run | Fires | Research for that identifier earlier in the row | Research for it in a later execute of the row | Fires on a row outside the 17 | Fires whose identifier the script's literals do not hold |
|---|---:|---:|---:|---:|---:|
| baseline | 23 | 0 | 1 | 3 | 0 |
| step0prime | 32 | 0 | 1 | 0 | 0 |
| arm1 | 21 | 0 | 1 | 0 | 0 |
| arm3 | 24 | 0 | 0 | 2 | 0 |
| P0 | 23 | 0 | 2 | 0 | 0 |
| P1 | 20 | 0 | 1 | 0 | 0 |
| P1b | 1 | 0 | 0 | 0 | 0 |
| P1c | 0 | 0 | 0 | 0 | 0 |
| P2 | 19 | 0 | 1 | 0 | 0 |

#### The 17 identifier rows, per run

| Run | Of the 17 rows present | Row names a series identifier in a call | Pointer fires on the row | Research called with a series identifier in the row |
|---|---:|---:|---:|---:|
| baseline | 17 | 16 | 12 | 5 |
| step0prime | 17 | 16 | 15 | 2 |
| arm1 | 17 | 15 | 13 | 3 |
| arm3 | 17 | 15 | 13 | 2 |
| P0 | 17 | 16 | 14 | 4 |
| P1 | 17 | 14 | 12 | 3 |
| P1b | 2 | 1 | 1 | 0 |
| P1c | 2 | 0 | 0 | 0 |
| P2 | 17 | 13 | 12 | 2 |

#### Rows where the pointer fires in at least one stored run (certain)

| Row | In the 17 | Runs where it fires | Identifiers |
|---|---|---:|---|
| `q-comp-aml-analytics-vendors` | yes | 1 | SEP-12 |
| `q-comp-sep8-regulated-assets-approval-server` | yes | 7 | SEP-0008, SEP-8 |
| `q-crp-oz-rwa-erc3643-trex` | yes | 5 | SEP-57 |
| `q-crp-remittance-founder-advisory` | no | 1 | SEP-24, SEP-31, SEP-6 |
| `q-edge-asset-site-scam-detection` | yes | 5 | SEP-1, SEP-8 |
| `q-edge-inject-ignore-instructions` | yes | 7 | SEP-10, SEP10 |
| `q-net-protocol-meeting-notes-find-cap` | yes | 7 | CAP-0046, CAP-67 |
| `q-nft-vault-contract-standards` | yes | 6 | SEP-0050, SEP-0056, SEP-41, SEP-50, SEP-56 |
| `q-pc-cross-redstone-sep40` | yes | 7 | SEP-40, SEP40 |
| `q-pc-quantum-preparedness-dormant` | yes | 2 | CAP-87 |
| `q-protocol-tier1-requirements` | no | 1 | SEP-1, SEP-20 |
| `q-sep-43-web-wallet-api` | yes | 7 | SEP-0043, SEP-43 |
| `q-sep-45-contract-auth` | yes | 7 | SEP-10, SEP-45 |
| `q-sep-53-sign-verify-message` | yes | 5 | SEP-0053, SEP-53 |
| `q-sep24-interactive-deposit-flow` | yes | 7 | SEP-10, SEP-24, SEP24 |
| `q-sep6-sep24-sep31-choice` | yes | 7 | SEP-24, SEP-31, SEP-6 |
| `q-soroban-oz-token` | yes | 7 | SEP-41 |
| `q-zk-host-functions-status` | yes | 5 | CAP-0075, CAP-0080, CAP-74, CAP-75 |

#### Replay: measured lengths (characters)

| Run | Firing executes | Sentences per execute (max) | Executes with more than three identifiers (cap drops the rest) | One sentence, min to max | All sentences of an execute, median / max | Added to the result, median / max | Stored result of a firing execute, median / max | Firing executes with a stored result of 20,000 or more |
|---|---:|---:|---:|---|---|---|---|---:|
| baseline | 15 | 3 | 1 | 175 to 181 | 177 / 531 | 178 / 532 | 7893 / 19327 | 0 |
| step0prime | 22 | 3 | 0 | 175 to 181 | 177 / 533 | 178 / 534 | 6725 / 21290 | 2 |
| arm1 | 15 | 3 | 0 | 175 to 181 | 177 / 531 | 178 / 532 | 8160 / 21545 | 2 |
| arm3 | 18 | 3 | 0 | 175 to 181 | 177 / 541 | 178 / 542 | 7416 / 22237 | 1 |
| P0 | 17 | 3 | 0 | 175 to 181 | 177 / 531 | 178 / 532 | 7593 / 27467 | 3 |
| P1 | 13 | 3 | 0 | 175 to 181 | 181 / 531 | 182 / 532 | 10144 / 27044 | 1 |
| P1b | 1 | 1 | 0 | 177 to 177 | 177 / 177 | 178 / 178 | 16100 / 16100 | 0 |
| P1c | 0 | | | | | | | |
| P2 | 15 | 3 | 1 | 175 to 181 | 177 / 531 | 178 / 532 | 9697 / 25936 | 3 |

Pooled over the seven full runs (115 firing executes): one sentence 175 to 181; the checkpoint block without the pointer, median 1046, with it, median 1246; the stored result, median 8160, so the pointer is 2% of a median firing result.

#### Replay: what the static reading could not see

| Run | Call sites | Sites with an argument it could not follow | Executes whose script shows a different operation set from the result's footer |
|---|---:|---:|---:|
| baseline | 254 | 5 | 1 |
| step0prime | 142 | 1 | 1 |
| arm1 | 143 | 2 | 1 |
| arm3 | 135 | 1 | 2 |
| P0 | 201 | 0 | 2 |
| P1 | 183 | 0 | 1 |
| P1b | 39 | 0 | 1 |
| P1c | 40 | 0 | 0 |
| P2 | 178 | 3 | 3 |

**What the replay shows.**

- **How often, and where.** The sentence is predicted on 13 to 22 executes and 12 to 15 rows per run (P0 17 executes on 14 rows, P1 pass 1 13 on 12, P2 15 on 12). 12 to 15 of those rows are in the 17 identifier rows in every
  panel run; the few outside (`q-crp-remittance-founder-advisory`, `q-protocol-tier1-requirements`) are rows that name a series identifier in one stored run only, so the plan's two-run rule left them out.
- **Never where research already named it.** In-execute this holds by construction and is tested; across the row it holds in the data: **0 fires in nine runs have a research call for that identifier earlier in the row**.
  1 or 2 per run have one in a *later* execute (agents that research the identifier without being asked): that is the baseline the pointer has to beat.
- **Never where no call names an identifier.** Every fire's identifier is held by the script's string literals as the committed scan reads them (0 exceptions in 163 certain fires across the nine runs), so no fire rests on the syntax reader alone.
- **Series.** Only `sep` and `cap` fire, in all nine runs: **A6's read list (a firing whose series is not `sep` or `cap`) is empty.** No `audit-…`, `release-…`, `paper…` or `incident…` token appears in any stored call string.
- **Ambiguity.** The reader followed 99% of the 1,315 call sites (12 it could not follow; the last table of `replay-summary.md`). Possible-only fires (an identifier that reaches a call through an argument it could not follow): arm 1 one, arm 3 one, P2 one. The
  footer lists a different operation set from the script in 0 to 3 executes per run (a helper dispatches the call, or the script lists operations a branch did not reach); those executes are treated as unresolved in the loose case.
- **The cap of three** drops identifiers in 2 executes of 115 (baseline one with six identifiers, P2 one with five).

### 6.2 The 17 identifier rows, by the committed rule

The rule, as `PLAN.md` section 3 states it and `eval/qa/scan-corroboration.mjs` computes it: of the 50 loop 1 panel rows, those where an `execute` string names a series identifier (letters, an optional hyphen, digits, no space) in two or more
of the four stored runs, selected by tuning id before any other field is read. The replay test calls the committed scan's own `identifiersIn` and `seriesOfCatalog` and **asserts the result equals `scans/corroboration.json`'s
`identifierRows` and `PLAN.md`'s list: 17 rows, equal**. The ids are in `scans/step3/identifier-ids.txt`. Per run, of the 17 rows (replay-summary section "The 17 identifier rows"): rows that name a series identifier in a call
— baseline 16, step 0′ 16, arm 1 15, arm 3 15, **P0 16, P1 14, P2 13**; rows where the pointer fires — 12, 15, 13, 13, **14, 12, 12**. Rows whose research call's own arguments name a series identifier: P0 4, P1 3, P2 2. The share
that `R0` compares against is the committed definition (a script that names an identifier also calls research), reported in `P2.md` section 5 as P0 25% (4 of 16), P1 29% (4 of 14), P2 23% (3 of 13); R0's bar stays above 33% and
above the highest of these.

### 6.3 The live check: the mechanism's ceiling, and the end-to-end result

`scans/step3/live-check.mjs`, against my own `npm run dev:eval` server (port 8812, then 8813 for the surface and visibility checks; both are my terminal `step3-server`, killed, ports closed). Keyless, read-only, no model.

- **Ceiling.** For each of the **22** distinct identifiers the replay fired on (`scans/step3/identifiers.json`: `cap-46`, `cap-67`, `cap-74`, `cap-75`, `cap-80`, `cap-87`, `sep-1`, `-6`, `-8`, `-10`, `-12`, `-20`, `-24`, `-31`, `-40`, `-41`,
  `-43`, `-45`, `-50`, `-53`, `-56`, `-57`), the call the sentence names, `scout.searchResearch({ q: <token as written>, source: <series>, limit: 5 })`: **22 of 22 ok, 22 of 22 with rows, 22 of 22 returned an exact row** that arm 2
  marked (`exactRows`). The plan's "about 25" was a count of identifiers named; 22 is the count the pointer fires on. This is the ceiling for what the sentence can lead to: it says nothing about whether the agent follows it.
- **A named identifier that does not exist.** `scout.searchResearch({ q: "SEP-99999", source: "sep" })` returns 5 adjacent rows, `caveat: "unverified-match"` and **no exact row**. The sentence claims nothing about it.
- **End to end through MCP `execute`.** A Docs search naming `SEP-45`: the sentence once, in the checkpoint block. The same with `audit 2024 release 23 paper 1 incident 2023` in the query: the sentence for `SEP-45` once, none for the phrases.
  Phrases only (even `SEP 45`): none. `SEP-45` researched in the same script: none. `SEP-45` named and `CAP-46` researched: the sentence for `SEP-45` only. `SEP-99999`: the sentence once. No identifier: none.

### 6.4 The measured lengths of the result blocks

From the replay's 115 firing executes (seven full runs; real hint builder; characters), `scans/step3/replay-summary.md`: one sentence **175 to 181**; up to three sentences **531 to 541**; the pointer adds **178 characters** to the result
at the median (182 in P1) and 532 at most. The `EVIDENCE CHECKPOINT` block: median 1,046 without the pointer, 1,246 with it (the block exists already on most results: the Docs detail sentence and the alternatives sentence).
The stored result of a firing execute: median 8,160, longest 27,467, so the pointer is **2% of a median firing result**. **Firing executes whose stored result is 20,000 characters or more: 0 to 3 per run (P0 3, P1 1, P2 3)**; on those the pointer
sits past Grok's 20,000-byte keep, like every host block (plan license table, R6). No other block grows.

## 7. Gates, each bare, exit code (tip `ed6fd569`, clean tree; the Worker is `a49ee918`'s)

`npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke`, `npm run eval:routing -- --gate`, the ten CI generators then `git diff --exit-code --stat` on the CI path list, `npm run secrets:scan -- --tree`. Output to files.

| Tip | typecheck | test | build | smoke | routing | sync build | sync diff | secrets |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `a49ee918` (the product commit) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `ed6fd569` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

`npm test`: 3,633 passed at `a49ee918`, 3,639 passed and 6 skipped at `ed6fd569` (the env-gated replay is the added skip); smoke 145 (144 plus the new case). **One failing run on the way, not on a tip:** the first `npm test` after the
build change failed `test/run-routing-manifest-evidence.test.mjs` (the manifest fingerprint in `eval/gates.json`); the explicit re-baseline in section 3 fixed it, and the run on the next line is the one that passed. The docs-only commits after `ed6fd569` (this file, the ledger entry) were checked with
the secrets scan and the generated-artifacts diff; both exit 0.

## 8. Deviations and decisions for the orchestrator

- **D1, A6's `audit-2024`.** A6 says `audit-2024` "fires only if the build records `audit` as a numbered series". The manifest cannot say which series are numbered, and a list of the numbered ones is the hand-written list the plan
  forbids, so the build records every plain-letter enum value as a series and **a series name joined to digits fires** (`audit-2024`, `release-23`, `paper1`). The spaced forms (A6's four phrases) do not. A test pins this behaviour and
  says why. In the nine stored runs it never occurs (A6's read list is empty); the R read must list any such firing as a defect. **The orchestrator may order the build to record numbered series from a source it names, or to
  fire for `sep` and `cap` only; neither is a catalog-derived rule today.**
- **D2, the build rule is narrower than the plan's sentence.** See section 2: twelve enum filters carry their own key in rows; the rule uses arm 2's identity fields, which gives one operation and seven series.
- **D3, the cap of three.** Two executes in 115 would have named more. A cap protects the result size (a sentence is 175 to 181 characters). It is the implementer's choice, not the plan's; the replay says it drops 3 sentences in one execute and 2 in another, of 115.
- **D4, `eval/gates.json` re-baselined** for the manifest fingerprint, as its own rule requires, with the all-495-lists-identical evidence in the note and the new local trace. The decision is recorded in this file and the ledger entry.
- **D5, a rename in the same commit.** `detailOnlyHint` to `pointersOnlyHint`, mode `"detail-only"` to `"pointers-only"` (five files). The behaviour of the detail pointer is unchanged and its sentence is byte-identical (`test/stellar-org-detail-hint.test.ts`, `test/replay-detail-hint.test.ts` pass untouched).
- **D6, the replay is static.** The stored rows hold the call footer and the script, not the arguments. The report separates certain from possible fires and counts the sites it could not follow (about 1%); a live replay is not possible without
  model calls.
- **D7, an incidental exposure.** The first `npm test` failure (the gate fingerprint) printed the routing runner's per-case tables in its failure message, including the routing holdout lane's case ids and top-five results
  (`q-holdout-*`). I did not use them and did not open the table again; the later runs were read by exit code and counts. If those rows are among the off-limits routing rows, this is the record.
- **D8, ports and terminals.** `step3-server` (`t1q0`, then `t1q1`) was started and killed by me; ports 8812 and 8813 are closed. No other terminal was touched. `hc ls` shows `loop2-run` (`t1pm`, not mine) and this terminal.
- **D9, the wording.** "If … names a document" for the plan's "names a document", and the template reads the operation, the series and the two input names from the manifest (section 4).
- **Not done:** the independent review of this diff (the plan's completion gate; the author is Claude Sonnet 5.5 and the orchestrator Claude Fable 5.2, so the reviewer is neither: the routing table's match for an executor and
  policy change is Codex frontier, or Grok for assumption attack; the orchestrator's call), the A7 egress check (item 5 adds no egress), and R itself.

## 9. The targeted read, R (not run; needs the independent review reconciled and the owner's authorization line in the ledger)

**Decision it changes:** keep or revert `a49ee918` (plan section 1, item 5). **Smallest run:** the 17 identifier rows twice (34 collections). The control is P2, the surface this step builds on; each changed row is also compared
with its P0 and P1 samples (the "returned" rule). Estimate USD 6.8 (P2: USD 0.20 per case; the plan's 6.5), **cap USD 8.5** (pass 1 capped at 4.5, pass 2 at 4.0), about 22 minutes. A cap stop voids that pass; no resume, no re-judge. Stop rules are
the keep rule below.

```sh
cd /home/tyler/code/raven-wt/gca-eval && git fetch origin && git checkout --detach "$R_COMMIT"   # tune/loop-2, this file's commit or later
npm ci && npm run typegen && test -z "$(git status --porcelain)"
# The Worker must be code-identical to a49ee918 (the pointer):
git diff --quiet a49ee918 HEAD -- src scripts catalog specs package.json wrangler.jsonc env.d.ts || { echo "Worker changed since a49ee918"; exit 1; }
SERVER_REVISION=$(git rev-parse HEAD); PORT=8806
hc run --bg --name r-server --cwd /home/tyler/code/raven-wt/gca-eval npm run dev:eval -- --port "$PORT"
hc wait r-server --output Ready        # then the initialize POST from the run-evals skill must return 200
node eval/report-live-surface.mjs --port "$PORT" --expect-source-revision "$SERVER_REVISION" \
  --expect-sha256 42ec61020a5f38c73ac30eb204ff424f30220f68ee3827373071c077ada8f17f --json /tmp/raven-eval-surface-r.json
# Stop if the report does not show: instructions 1899 chars, sha 67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00,
# search 1960, execute 1964, descriptions 3924 (all equal to P2's; --expect-sha256 already fails the call on a surface mismatch).

export DISABLE_AUTOUPDATER=1
PIN_BIN=$(mktemp -d) && ln -s ~/.local/share/claude/versions/2.1.325 "$PIN_BIN/claude" && export PATH="$PIN_BIN:$PATH"
AGENT_BINARY_SHA256=$(sha256sum "$PIN_BIN/claude" | cut -d' ' -f1)   # must be 0dc4f4a9a165fc60746d7ae8489712e5fc352f1e7ad4eb22e7141bd0812eb0cf
AGENT_ENVIRONMENT_SHA256=$(node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; process.stdout.write(agentEnvironmentIdentity().sha256)')
REMOTE_IDENTITY_PROBE=eval/qa/probe-remote-identities.mjs
REMOTE_IDENTITY_PROBE_SHA256=$(shasum -a 256 "$REMOTE_IDENTITY_PROBE" | cut -d' ' -f1)   # must be aabfb83fb8e956856d70f9b5657ea6fca2f64551073812fb646b3689a8f28d99
REMOTE_IDENTITY_SHA256=$(env -i PATH="$PATH" "$REMOTE_IDENTITY_PROBE" --stable-sha256)   # must equal P0's, P1's and P2's: 046b02808eabfdca9477d7e90c2d3ef3a15729911a86280ba4f91471c4a727e8 (a moved vector is reported)
STABILITY_REGISTER=/home/tyler/code/raven-wt/gca-eval/eval/qa/judge-stability.json   # sha 4322dd4d1ebfc30bc02a9def008039aba4f4b2395b1f9da5cabef56ec24bf458
IDENTIFIER_IDS=$(tr -d '\n' < .agents/rounds/2026-11-15-tuning-loop-2/scans/step3/identifier-ids.txt)
test "$(echo "$IDENTIFIER_IDS" | tr ',' '\n' | sort -u | wc -l)" = 17   # the job count, before spend

# One judge policy (R2): P0's value (58), read from P0's results file, on both passes.
P0_RESULTS=eval/qa/results/2026-11-15T04-31-41-variantA.json
MAX_PANEL_CASES=$(node -e 'process.stdout.write(String(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).meta.judgeTiering.maxPanelCases))' "$P0_RESULTS")
test "$MAX_PANEL_CASES" = 58 || { echo "P0 judge cap is $MAX_PANEL_CASES, not 58: stop and ask the orchestrator"; exit 1; }

COMMON="--variant A --port $PORT --max-panel-cases $MAX_PANEL_CASES --stability-register $STABILITY_REGISTER --server-revision $SERVER_REVISION \
  --expect-sha256 42ec61020a5f38c73ac30eb204ff424f30220f68ee3827373071c077ada8f17f \
  --expect-agent-binary-sha256 $AGENT_BINARY_SHA256 --expect-agent-environment-sha256 $AGENT_ENVIRONMENT_SHA256 \
  --remote-identity-probe $REMOTE_IDENTITY_PROBE --expect-remote-identity-probe-sha256 $REMOTE_IDENTITY_PROBE_SHA256 \
  --expect-remote-identity-sha256 $REMOTE_IDENTITY_SHA256"
node eval/qa/run-qa.mjs $COMMON --ids "$IDENTIFIER_IDS" --max-budget-usd 4.5     # pass 1: the 17 identifier rows
node eval/qa/run-qa.mjs $COMMON --ids "$IDENTIFIER_IDS" --max-budget-usd 4.0     # pass 2: the same 17 rows (total cap 8.5)
# then, free: npm run eval:plan -- eval/qa/results/<stamp>-variantA.json ; hc kill r-server
```

Pins, hashes only, all equal to P0's, P1's and P2's where they were pinned: surface `42ec6102…f17f` (P2's: item 5 changes no served text, section 3), Claude Code `2.1.325` (binary `0dc4f4a9…eb0cf`), probe `aabfb83f…8d99`, remote
vector `046b0280…27e8`, stability register `4322dd4d…f458`, `--max-panel-cases` 58 (read from P0), judge `claude-sonnet-5`, answering `claude-sonnet-5-5`.

**Keep rule, restated (PLAN.md section 4, "R", with A4 and A6).**

| Rule | Keep | Otherwise |
|---|---|---|
| R0, delivered | The sentence is in every execute result of the 34 passes where the replay (`test/replay-identifier-pointer.test.ts` on R's own transcripts) predicts it, and in none where it does not; **and** research is called with the identifier afterwards in a larger share of passes than the same rows showed without the sentence: **above 33%**, the highest of the stored shares (P0 25%, P1 29%, P2 23%; the four loop 1 runs 19% to 33%). For reference, arm 1's detail pointer was followed on 48% of rows | A missing or extra sentence is a build fault and voids the run for the pointer. A share at or below 33% is "inconclusive" |
| R1, gain | Two **different** rows go up, each traced to an exact row the pointer led to, and traced ups outnumber traced downs. Two is the skill's bar for acting | Inconclusive |
| H1 | No row becomes `wrong` by a traced down | Revert |
| H2 | No row that was correct in the control goes down by a traced down; every trap row among the 17 keeps its trap behaviour (a failure classed as a judge artifact is recorded and does not revert) | Revert |
| H3 | The untraced net (downs minus ups) is below T. T for n = 17 under A4's model at P0's measured flip rate 0.13 is **2**; at the repository's 0.16 it is 3; at loop 1's mixed-tier 0.34 it is 4. **Proposed T = 3** (the middle value, as T = 5 was for the 58 rows), the orchestrator's to fix before the read; report the tier-matched net and its own T beside the all-rows net | Stop and re-plan; a result that reaches T only on all rows is "no decision" (A4) |
| A6 read list | Every firing whose series is not `sep` or `cap` is listed, and each is a defect. The replay predicts none | Fix the rule (D1) |
| Cost flags | Cost per answer up more than 20% or median turns up by more than 1 on unchanged rows is a flag, not a rule | Report |

**Inconclusive reverts** (`git revert a49ee918`), and item 5 leaves the loop red with this record. **A6's generality note:** the pointer is derived from the catalog and is not a boost; it has exactly one instance today (one operation of
one source, two series that fire), so a keep is evidence for that operation only.

**Reading rules for R.** (a) Select rows by the committed ids; no other row is opened. (b) Each changed row is compared with its P0, P1 and P2 samples, with verdicts and judge tiers; a verdict equal to P0's after a P1 or P2 move the earlier
trace classed as noise is "returned" and counts only if the R transcript traces it. (c) Report the research-call share on the 17 rows by the committed definition and by argument (section 6.2), per pass. (d) Report per row whether the sentence was
delivered, which identifier, and whether a research call followed in a later execute of the pass. (e) Judge tiers are reported for every changed row; the tier-matched net is read first.

**What an R result must not be read as:** an improvement for any other source of documents or any other series than `sep` and `cap`; a result for Codex, Grok, OpenCode, the Playground or claude.ai (the Playground gets the same sentence, not measured); a result about
`search` ranking of the research lane, which stays red (plan section 1, item 5: three reviewed mechanisms failed and PH3 is the owner's); evidence on any set but these 17 rows; a held-out result.

## 10. State

Everything is committed and pushed on `tune/loop-2`. The worktree was clean at each gate run. `step3-server` is killed and ports 8812 and 8813 are closed; two scratch worktrees (the before-manifest routing comparison, the revert check) were
removed. Nothing in `gca-eval` was touched. No paid run was started or authorized.
