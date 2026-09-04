# Evidence support diagnostic review — 2026-09-04 (Fable 5.1 xhigh)

Independent review of commit `37264f9` ("fix qa evidence support omissions", parent `c9f73ea`).
Worktree `/private/tmp/stellar-raven-tm-evidence-support`, branch `codex/tm-evidence-support`.
Reviewer: Fable 5.1 xhigh. Author lane: Sol (`evidence-support-fix-sol.md`).

Read order: `AGENTS.md`, the `run-evals` skill, the implementation diff, the test diff, then the
author report. No implementation file was edited. All probes ran from scratch scripts outside the
repository. No paid model calls were made.

## Verdict

**PASS.** The repair is general, bounded, and diagnostic-only. Both named false negatives and the
third portfolio change reproduce exactly. Exact-term behavior is byte-identical. Packs, prompts,
verdicts, and paid calls do not change. Five non-blocking findings are recorded below. One of them
narrows a statement in the author report.

## Commit scope

Three files: `eval/qa/evidence-pack.mjs` (+124/−3), `test/evidence-pack-per-operation.test.mjs`
(+136), and the author report. `git diff --check c9f73ea 37264f9` is clean.

## Reproduction against the candidate artifact

Artifact: `/private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json`
(500 rows, judge `claude-sonnet-5`, rubric `v2.10`, pack `p6`). I rebuilt each `p6` pack from the
saved row with the current builder and with the parent-commit builder, then ran the parent-commit
diagnostic and the new diagnostic on the row's `wrongClaims`.

| Measure | Result |
| --- | --- |
| Rows with `wrongClaims` and a non-stable freshness tag and a non-empty pack | 39 (25 stable rows skipped, 1 row without a pack) |
| Rebuilt pack SHA-256 and char count equal stored `evidencePack` metadata | 39 of 39 |
| Parent builder output equals current builder output | 39 of 39 |
| Parent diagnostic output equals stored `verdict.evidenceSupportCheck` | 39 of 39 |
| `omittedTerms`, `checkedTerms`, `transcriptSupportedTerms` unchanged | 39 of 39 |
| Prose probes built / supported by the full transcript | 39 / 6 |
| Rows whose status changed `no-pack-omission` → `pack-omission` | 3 |
| Rows that gained a prose omission with unchanged status | 1 |
| `PACK_VERSION` before and after | `p6` and `p6` |
| Slowest row | 3.4 ms |

The three changed rows and the one gained row, with the transcript support I read myself:

- **`q-edge-scf-v7-centralization-myths`** (wrong). `omittedProse: ["launched January 2026"]`.
  Execute #2 carries the SCF handbook text "SCF 7.0 officially launched in January 2026." The
  pack does not carry it. True positive.
- **`q-ti-stellar-lab-usage-and-new-ui`** (wrong). `omittedProse: ["top-right corner"]`. Execute #5
  carries the Quickstart docs text "Navigate to Stellar Lab and in the top right corner, use the
  dropdown". The pack does not carry it. True positive.
- **`q-tool-freighter-wallet`** (partial). `omittedProse: ["5.47.0, 2026-08-31"]`. Execute #2
  carries `activitySignals.releaseTag "5.47.0"`, `lastReleaseAt "2026-08-31T23:16:03.000Z"`, and a
  knowledge note "the browser extension (5.47.0, 2026-08-31)". The pack carries only the lifecycle
  note "5.46.0 released 2026-08-26". The judge wrote "contradicting transcript evidence". That
  contradiction came from the pack, not the transcript. True positive, and a re-judge candidate for
  the round owner.
- **`q-sor-decode-hosterror-codes`** (wrong, status already `pack-omission` on `mock_all_auths`).
  Gained `omittedProse: ["no contract ID"]`. The only transcript support is the agent's own search
  query echoed in a result object (`"q":"no contract ID"`). Weak support. See F3.

## Invariance: packs, prompts, verdicts, paid calls

- The pack builder is untouched. Rebuilt packs match stored hashes for every eligible row, and the
  parent and current builders emit identical text. `PACK_VERSION` stays `p6`.
- `buildJudgePrompt` is untouched. `promptSha256` hashes the prompt only.
- `attachTranscriptEvidenceDiagnostics` runs after the judge CLI returns, after JSON extraction,
  and after `checkVerdictConsistency`. It spreads the normalized verdict and adds one key. `score`,
  `coreAnswer`, `missingFacts`, `wrongClaims`, and `avoidMatches` are not touched.
- No code reads `evidenceSupportCheck.status` or `requiresReview` outside the tests. Panel, tier,
  retry, and re-judge paths do not consult it. No paid call is keyed on it.
- `verify-evidence-pack-fixtures.mjs` reads `omittedTerms`, `checkedTerms`, and
  `transcriptSupportedTerms` only. Those are unchanged.
- Paired and re-judge hashing covers case input and answers, not the verdict object.

## Audit by area

Adversarial probes ran through the public function. Each row states the observed behavior.

| Area | Observed | Assessment |
| --- | --- | --- |
| False positives | Generic quoted phrases pass the filter when one token has 5+ letters (`'according to the documentation'` flagged). A judge quote of the golden (`'roughly 5–7 seconds'`) is probed like a candidate quote. A negated source sentence ("was never launched in January 2026") counts as support. An echoed query string counts as support. | Precision limits of a lexical review flag. Diagnostic-only. F2, F3. |
| Denial-of-service bounds | 300 units × 400 repeated first tokens: 7 ms. 24-token probe over near-miss units: 5 ms. 200 probes × 120k-token transcript: 340 ms. 20k JSON strings: 16 ms. One 1.6 MB line: 22 ms (unit dropped above 2,000 chars). 200k short sentences: 61 ms. | Bounded. No catastrophic regex. Probe count is bounded by judge output. |
| Unicode and punctuation | Curly quotes and hyphens match (`‘top-right corner’` matches "top right corner"). En dash equals hyphen. `1,000` does not match `1000`. NFD does not match NFC. CJK text yields one token and no probe. A possessive apostrophe inside single quotes breaks the quote. | All misses are conservative. F4. |
| JSON field boundaries | Line-leading JSON, pretty-printed JSON, and top-level arrays never join fields. A phrase across two fields is joined when JSON sits after a text prefix on one line, or when JSON is nested inside a string value. | The host emits line-leading JSON plus footer lines, so the risk is bounded. F1. |
| Quote handling | Straight and curly quotes both open and close. An unbalanced quote falls back to the unquoted path. Duplicate quotes across claims dedupe to one probe. A split keyword inside a quote does not cut the quote. | Correct. |
| Generic-claim filtering | Quotes with under 3 tokens, over 24 tokens, or no long or numeric token yield no probe. The unquoted path needs 5+ content tokens and drops text after `without`, `unsupported`, `unverified`, `fabricated`, `not supported`, and `not shown/present/found/appearing`. | Works as written. The unquoted path is inert on judge prose. F2. |
| Output bounds | 30 supported quoted probes → 24 labels. 24 exact omissions plus 30 prose → 24 exact labels, 0 prose labels, status `pack-omission`. Labels lose trailing `.,;:!?`. | Bounded at 24 total. F5. |
| Exact-term preservation | Parent output equals new output minus the three prose keys on a mixed exact-term case and on all 39 artifact rows. | Preserved. |
| Degenerate input | Empty claims, non-string claims, object and null results, ANSI codes, and tabs do not throw. Search-tool results are not read, the same as the exact-term path. | Robust. |

## Findings

- **F1 (non-blocking, report accuracy).** The author report says "The matcher never joins separate
  JSON fields." The test proves this for single-line `JSON.stringify` output. It is not true for
  JSON after a text prefix on one line, or JSON nested inside a string value. Both joined
  "Validators choose the final ledger" and "through federated agreement." in my probes. Host
  results start with `{` or `[` on their own line, so the artifact shows no such join. Suggested
  follow-up: reword the report to "never joins fields of line-leading JSON", and add a nested-JSON
  test if the guarantee should hold there.
- **F2 (non-blocking, coverage).** The unquoted path produced 18 probes on the artifact and 0
  supported matches. 20 of the 26 unquoted claims start with a judge verb such as "States",
  "Claims", or "Presents". That verb becomes the first probe token, and the source never contains
  it. All 6 supported probes came from the quoted path. The author report lists paraphrase,
  reorder, synonym, and short prose as limits. It does not list this one.
- **F3 (non-blocking, precision).** Support is lexical. A query echo, a negated sentence, or a
  judge quote of the golden can satisfy a probe. One of the four real flags
  (`q-sor-decode-hosterror-codes`) rests on a query echo. The flag only requests review, so the
  cost is reviewer time.
- **F4 (non-blocking, coverage).** A possessive apostrophe inside a single-quoted phrase ends the
  quote early. The fallback then carries the judge verb and misses. Judges quote candidate text
  with possessives often enough to note it.
- **F5 (cosmetic).** The label strip removes a trailing ellipsis (`'stellar contract invoke --id
  C...'` reports as `stellar contract invoke --id C`). The tokens are unaffected.

No finding changes a verdict, a pack, or a prompt. None blocks the commit.

## Tests and commands

| Command | Result |
| --- | --- |
| `./node_modules/.bin/vitest run test/evidence-pack-per-operation.test.mjs` | 52 passed |
| `npm test` | 103 files, 1,777 tests passed |
| `git diff --check c9f73ea 37264f9` | clean |
| `node <scratch>/repro.mjs` (artifact, parent vs current module) | table above |
| `node <scratch>/adversarial.mjs` (39 probes) | table above |
| `node <scratch>/yield.mjs` (quoted vs unquoted probe yield) | 21 quoted probes, 6 supported; 18 unquoted probes, 0 supported |

Scratch scripts import the parent module from `git show c9f73ea:eval/qa/evidence-pack.mjs` and the
current module from the worktree. They live under the session scratchpad and are not committed.

## Risks

- The diagnostic can add review items that rest on weak lexical support (F3). A reviewer must still
  read the transcript before calling a verdict a judge artifact.
- The fixture verifier now runs prose probes over whole candidate answers as claims. It reads only
  the exact-term fields, so the output is unchanged. The cost is small and bounded.
- Rows tagged `freshness: stable` never receive the diagnostic. That gate predates this commit and
  hid 25 rows with wrong claims from this check.

## Blockers

None.
