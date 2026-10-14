# Answer-style signals — measurement ledger

Plan: [`measurement-plan.md`](measurement-plan.md). Design: [`design.md`](design.md).

Authorization: the orchestrator signed it on 2026-10-11 under the owner's delegation of
2026-10-10. Total cap $84: four collections at `--max-budget-usd 19`, two directed re-judges at
`--max-budget-usd 4`. Order B1, C1, C2, B2. One server at a time on port 8799.

## Preconditions

- The owner's paired collection finished on 2026-10-11. `/private/tmp/stellar-raven-paired-launch`
  is absent. No listener was on port 8799 before the first server start.
- Leftover idle `node -e … setInterval` sleepers from `test/qa-paired-launch.test.mjs` fixtures
  exist under `$TMPDIR/paired-launch-*`. They hold no port and no worktree. This lane left them
  alone.

## Pins (recorded before the first paid call)

| Pin | Value |
|---|---|
| Baseline revision (B) | `d15a4ce52c997577313779872d9f89de7725debc` |
| Candidate revision (C) | `2612f86ab6a2e9197be149230ff2bdb2251ebf5a` |
| Runner | Clean detached worktree at the baseline revision, `raven-w1010-a-qa-runner` |
| Server worktrees | `raven-w1010-a-qa-srvB` (B) and `raven-w1010-a-qa-srvC` (C), both clean |
| Answering and judge models | Runner defaults (`claude-sonnet-5`); no `--model`, no `--judge-model` |
| Claude executable | `~/.local/share/claude/versions/2.1.296` (`2.1.296 (Claude Code)`), linked from a private `bin` directory |
| `AGENT_BINARY_SHA256` | `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937` |
| Collection environment | `env -i` with `HOME`, `USER`, `LOGNAME`, `LANG`, `SHELL=/bin/zsh`, `TERM=dumb`, `TMPDIR`, `DISABLE_AUTOUPDATER=1`, and a fixed `PATH` (private `bin`, `/usr/local/bin`, system directories). No `CLAUDE_*` or `ANTHROPIC_*` variable. |
| `AGENT_ENVIRONMENT_SHA256` | `1fddfbcb124e4bc7693393315fbe5657f67b6ebfb76a665e16b473e4e683adf1` |
| Remote identity probe | `eval/qa/probe-remote-identities.mjs`, SHA-256 `bde386a01ceb5bfdd325f3cd24369e00e2c111f7b4747ec7c0c9e77bc84485ef` |
| `REMOTE_IDENTITY_SHA256` | `1a927dce05ba9a1b4e7481c85ebfc7c4d4110aa2cb681de0f0a11fc7d43c0c7b` (three captures five minutes apart, all equal) |
| Judge-stability register | Generated once from the stored results in the main checkout (538 cases, 199 artifacts), frozen read-only outside the runner. SHA-256 `73ed8a11f5ac290da200c3753eb2133814de5afb391c90ed94170efd5ac1b793` |
| Server `.dev.vars` identity | One fresh salt for both worktrees. Both gave the same 10 names and hash `e4e67a8dc2ae9065a7410f749e1d341802cec182788edd0800e79c6d6a9faaa1`. |
| Baseline surface | `656feeef8966cbac326db00479f69b3171c401e94c5c4239364d04a28e754c4a` (instructions 7,864 characters) |
| Candidate surface | `3de271a5ae860db88eaa84c8bf5644bb4456484bc272add757ccc5aeaef74d9d` (instructions 7,839 characters) |

## Case swap (before spend)

The plan requires a pre-launch check of `q-pc-protocol-upgrade-timing` against the Protocol 28
date-contingent trap. The trap has fired. Live Horizon on 2026-10-11 reports
`current_protocol_version` 29. The consistency register records Protocol 28 on Mainnet from
ledger 64458446 (2026-09-16). The golden still describes Protocol 27 as the latest observed
upgrade. The golden is stale, so the plan's fixed swap rule applies.

Replacement: `q-pc-quantum-preparedness-dormant`. It is the next row after the stale row in
battery order that is `active`, `live`, not a trap, and served by Stellar Docs. It is not in the
selected list. The volatile slice keeps eight rows.

Final ID list (34, the runner keeps battery order):

```text
q-edge-noinfo-sep-9999,q-edge-noinfo-stellar-pos-staking-rewards,q-edge-noinfo-stellar-native-privacy-default,q-edge-noinfo-exact-tvl-figure,q-edge-strupey-ambiguous-stellar-history,q-edge-ambig-stellar-token-meaning,q-raph-xlm-staking,q-edge-xlm-price-investment-advice,q-edge-closed-world-builder-directory-miss,q-edge-open-world-recovery-after-narrow-miss,q-gap-builders-person-empty,q-gap-related-projects-empty,q-gap-contracts-domain-empty,q-edge-lumenloop-person-entity-empty,q-gap-semantic-directory-fallback,q-edge-doc-title-zero-hits,q-eco-defi-tvl-current,q-eco-stablecoins-on-stellar,q-asset-rwa-tokenized-freshness,q-defi-category-funding-ratio-live,q-history-ecosystem-index-freshness-live,q-eco-most-active-defi-projects,q-pc-quantum-preparedness-dormant,q-jutsu-cash-crypto-ramps,q-aas-burn-clawback-redemption-mechanics,q-asset-trustline-basics,q-defi-defindex-honest,q-pc-sequence-numbers-ordering-replace,q-raph-xlm-simple,q-sep-interactive-deposit-withdraw,q-soroban-cross-contract-call,q-soroban-fuzz-testing,q-stellar-recurring-payments,q-hist-scp-rewrite-2015
```

All 34 IDs resolve in `eval/qa/cases.json` at the baseline revision, and all are `active`.

## Collections

| Run | Arm | Result stamp | Rows | `comparable` | Cost USD |
|---|---|---|---|---|---|
| B1 | Baseline | `2026-10-11T08-17-16` | 34 | true | 11.64 |
| C1 | Candidate | `2026-10-11T09-04-33` | 34 | true | 12.08 |
| C2 | Candidate | `2026-10-11T09-48-55` | 34 | true | 11.65 |
| B2 | Baseline | `2026-10-11T10-36-13` | 34 | true | 11.85 |

Each server start re-asserted its revision and surface before the next paid call. The baseline
surface matched `656feeef…` at both starts. The candidate surface matched `3de271a5…`.

## Consistent-change list (recorded before the re-judge spend)

Rule: both candidate grades differ from both baseline grades in the same direction, after T4 and
T5 exclusions.

- `q-edge-strupey-ambiguous-stellar-history` (abstention): regression. B correct, correct; C wrong, wrong.
- `q-gap-contracts-domain-empty` (absence): regression. B correct, correct; C wrong, wrong.
- `q-eco-most-active-defi-projects` (volatile): improvement. B wrong, wrong; C correct, correct.
- `q-pc-quantum-preparedness-dormant` (volatile): improvement. B partial, partial; C correct, correct.

Excluded: `q-edge-open-world-recovery-after-narrow-miss`. C1 has a judge consistency failure (T4).
Noise floor: B1 and B2 disagree on 8 rows. C1 and C2 disagree on 7 rows.

Re-judge selection: these four IDs, once in B1 and once in C1.

## Directed re-judge

| Run | Re-judge stamp | Cost USD |
|---|---|---|
| B1 | `2026-10-11T10-37-13-rejudge` | 0.33 |
| C1 | `2026-10-11T10-38-57-rejudge` | 0.36 |

| ID | B1 stored → re-judge | C1 stored → re-judge | Outcome |
|---|---|---|---|
| `q-edge-strupey-ambiguous-stellar-history` | correct → **error** (`failureClass: "consistency"`, `partial-without-issue`; T4) | wrong → wrong (avoid 1 and 2 fire again) | Confirmation incomplete: the baseline re-judge is T4 |
| `q-gap-contracts-domain-empty` | correct → partial | wrong → partial | Not reproduced. The judge also rejects a real candidate-host field. |
| `q-eco-most-active-defi-projects` | wrong → wrong | correct → correct | Judge artifact, not an improvement |
| `q-pc-quantum-preparedness-dormant` | partial → partial | correct → correct | Missing-fact improvement reproduced (with unsupported extra advice) |

Correction (2026-10-11, after the independent result review): the first version of this ledger
read the B1 Strupey re-judge as "partial (effective)". That value is the diagnostic `judgeScore`.
The final verdict is `score: "error"`, which records a judge failure and never grades the answer.
It is a T4 outcome.

## Live checks

- `q-edge-strupey-ambiguous-stellar-history` (2026-10-11T10:42Z, public Scout API):
  `/api/projects/resolve?q=Strupey` returns `found: false`. Its note says "No project in this
  directory is named \"Strupey\"". `/api/projects/search?q=Strupey` returns one row, Stroopy.AI,
  with `matchMode: "corrected"`: the query token does not occur in the row. Lumenloop
  `get_project` for `stroopy-ai` in the C1 transcript has `other_names: []`. Both candidate answers
  present Stroopy.AI's SCF history as the history of "Strupey". The wrong grade stands.
- `q-eco-stablecoins-on-stellar` (wrong in C1, C2, and B2): Scout `/api/stablecoins` (dataAsOf
  2026-10-11T06:01Z) has 41 rows. The top `marketCapUSD` row is $537.6M, which matches the USDY
  row in the answers. The wrong grade is about product-class labels, not service data. It is not a
  consistent change.
- `q-gap-contracts-domain-empty`: the C1 claim "the host marks an ok empty result
  `inconclusive: \"empty\"`" is true for the candidate host. Neither candidate answer called
  `scout.listContracts`. The change did not survive the re-judge.
- Not live-checked, because each is a single-run wrong and not a consistent change:
  `q-edge-noinfo-stellar-native-privacy-default` (C2; a check needs the Stellar Docs Algolia key,
  which this authorization reserves for the probe), `q-pc-sequence-numbers-ordering-replace` (C2;
  a stable CAP-0021 `minSeqNum` omission), and `q-defi-defindex-honest` (wrong in B1, C1, and C2;
  `truth.status: "disputed"`).

## Result: INDETERMINATE

Independent result review: [`review-result-astra.md`](review-result-astra.md) (Codex
`gpt-6-astra`, high). Verdict line: "RESULT-REVIEW: DISPUTED: INDETERMINATE". This section
replaces the first reading (FAIL), which used the diagnostic `judgeScore` as a valid grade.

The four collections are complete and comparable. Rule 4 needs a confirmed regression.
Confirmation needs a valid re-judge pair, and the B1 Strupey re-judge is T4. The plan has no
fallback for a failed confirmation re-judge, so the conservative disposition is INDETERMINATE.
Rule 3 cannot give PASS either: a failed confirmation is not evidence of no regression. The merge
stays blocked. A further paid confirmation needs a new bounded authorization.

| Slice | Rows | Excluded | Observed consistent regressions | Confirmed | Notes |
|---|---|---|---|---|---|
| Abstention | 8 | 0 | 1 (Strupey) | Incomplete (baseline re-judge T4) | Real observed attribution failure |
| Absence | 8 | 1 | 1 (contracts-domain) | No (re-judge partial / partial) | Judge rejects a real host field |
| Volatile | 8 | 0 | 0 | — | Activity "improvement" is a judge artifact; quantum missing-fact improvement reproduced |
| Control | 10 | 0 | 0 | — | — |

Wrong counts (read first): B1 2, C1 4, C2 6, B2 3. Correct counts: B1 24, C1 22, C2 24, B2 23.
Noise floor on the common eligible denominator of 33: B1/B2 8, C1/C2 7.

### Strupey diagnosis (kept visible)

B1 and B2 reject an exact match and ask for clarification. C1 says the name "resolves to
Stroopy.AI" and gives a detailed history. C2 marks the identity as inferred, but it still gives
the Stroopy.AI history and does not ask for clarification. The C1 script read
`inconclusive: "candidates"`, the Scout row carried `matchMode: "corrected"` and the
identity-verification warning, and the footer marked the call. The signals reached the client.
The agent still substituted the identity. This is a real observed agent attribution failure, not
a missing warning or a service identity error.

The baseline panel grades also need disclosure: B1 panel `correct, correct, error`; B2 panel
`correct, error, error`. The B2 `correct` rests on one valid panel vote.

The measurement attributes one bundle. Restoring the removed tail "…otherwise say unverified or
ask for context." is a hypothesis for a new measurement, not a proven isolated remedy. Existing
candidate warnings already told the agent to verify identity, so the next change must first
check why the agent ignored that guidance.

### Activity row: judge artifact

B1 and B2 transcript index 3 carry `meta.metricDefinitions.activity`, which defines activity as
`github.commits90d` with recency as the tie-break. Both baseline answers use that definition and
date their source. The judges claim activity means latest-commit recency, and the B1 re-judge
repeats that premise. The evidence pack omitted `metricDefinitions` for the baseline rows. Do not
count this row as a quality win.

### Contracts-domain row (as the reviewer states it)

C1 correctly describes the candidate host: `ok: true` plus `inconclusive: "empty"`. In
`src/executor/providers.ts` that signal exists only on the successful branch. A `soft-empty`
error returns through the separate `ok: false` branch. The judge's claim that the signal
contradicts successful empty data is false. C2's phrase "empty/`soft-empty` result" does blur the
distinction in the answer. Both answers omit explicit preservation of the returned counts and
`generatedAt`. These are answer omissions or ambiguity. They do not show that the host conflates
the two envelopes. The evidence alone does not justify a field rename.

### Other monitor-only rows

- `q-edge-open-world-recovery-after-narrow-miss`: the C1 judge failed its consistency check (T4).
- `q-pc-quantum-preparedness-dormant`: both candidate answers recover the QPP dormant-holder
  passage. C1 and C2 also give future-eligibility advice that the source does not support.
- The review's per-row table covers every other wrong or partial row. None is a consistent change.

## Next step

1. Restore the removed tail "…otherwise say unverified or ask for context." as a hypothesis, after
   a check of why the agent ignored the existing identity warnings.
2. Settle the `inconclusive` versus `soft-empty` wording, so that answers do not merge an ok empty
   result with a `soft-empty` error. The review finds no host conflation and does not prescribe a
   rename.
3. Fix the evaluation gaps that the review names: the evidence pack must carry
   `metricDefinitions`, and judging must accept the candidate host contract.
4. Re-measure under a new bounded authorization.

## Mechanism metrics

| Metric | B1 | C1 | C2 | B2 |
|---|---|---|---|---|
| Volatile answers that state a date | 8/8 | 8/8 | 8/8 | 7/8 |
| Abstention and absence answers with an absence phrase (regex; includes scoped statements and negations, so it does not measure unscoped claims) | 6/16 | 8/16 | 6/16 | 9/16 |
| Avoid matches in abstention and absence | 0 | 3 | 2 | 0 |
| Execute scripts that read `inconclusive` or `asOf` | 0 | 13 | 7 | 0 |
| Execute results with a footer | 27/48 | 51/56 | 44/52 | 27/46 |
| Mean footer characters (when present) | 980 | 750 | 833 | 966 |
| Execute errors (`isError`) | 1 | 1 | 3 | 1 |
| Plan regrade, required covered | 28/34 | 28/34 | 27/34 | 29/34 |

All C-arm avoid matches in the abstention and absence slices come from the Strupey row and the
contracts-domain row. The date regex misses the Unicode date in the B2 quantum answer, so 7/8 is
not a complete manual date audit. The review's manual behavior counts (skill-shape errors, failed
calls with omitted reasons) are in [`review-result-astra.md`](review-result-astra.md).

## Spend

Collections $47.23 (B1 11.64, C1 12.08, C2 11.65, B2 11.85). Re-judges $0.69. Total $47.92 of the
$84 cap. Every budgeted call reported a cost (`missingCosts` 0 in all six artifacts).

## Records

Result JSON, plan regrades, re-judge artifacts, surface reports, and the frozen register stay local
under `eval/qa/results/2026-10-11-answer-style/` in the `w1010/a` worktree (gitignored). The
runner worktree `raven-w1010-a-qa-runner` holds the originals. The two server worktrees were
removed after the run.

---

# Version 2

Plan: [`measurement-plan-v2.md`](measurement-plan-v2.md) on top of
[`measurement-plan.md`](measurement-plan.md). Lane C (Claude Opus 5.5, high) ran it from Herdr pane
`w3W:p4V`. The orchestrator is Claude Opus 5.5 in pane `w3W:p1P`.

## Authorization (version 2)

The owner approved spend on 2026-10-13 in chat: "approved for your next collection of work, don't do
stuff you don't need to, but do what's truely valuable and needful". This authorizes the version 2
plan once, at its caps: total $84 (four collections at `--max-budget-usd 18`, two directed re-judges
at $4, two rule 7 retries at $2 only if needed). No continuation, no re-run, no raised cap.

## Candidate commit

The reviewed head is `5c86fd0a77693786486dd0ec3221f957b7716cc0` (review verdict "CODE: APPROVE",
"PLAN: LAUNCH-OK"). The branch head `c8aeab06` adds only the review record:
`git diff --stat 5c86fd0a c8aeab06` prints one file,
`.agents/rounds/2026-10-10-weekend/answer-style/review-v2-astra.md`, 275 insertions. The candidate
server runs `5c86fd0a`.

## Free pre-launch checks (2026-10-13, before the first paid call)

- **Case bytes.** The final ID list of the section "Case swap (before spend)" selects 34 rows at
  `63396840`. `casesSha256` is `2cc286f6df1cd731c2999f265bac7d10d2800f98d96f5399309e965a8fd78c74`,
  the same as version 1. `caseIdsSha256` is `ca3940d67dfd356ef1ff4324b47cd3ff65ee489d0fd89feb987a9388e9ea9de4`.
- **Lifecycle.** All 34 selected IDs are `active` in `eval/qa/lifecycle-registry.json` at `63396840`.
  No ID is quarantined.
- **Quantum-row golden.** The golden of `q-pc-quantum-preparedness-dormant` is still valid. No
  date-contingent trap names this row in `eval/qa/consistency-register.json`. On 2026-10-13 the QPP
  page (stellar.org) still describes dormant holders only in qualitative terms and defers the
  question to community discussion. The `stellar/stellar-protocol` core tree ends at `cap-0088`.
  CAP-0087 (ML-DSA host functions) and CAP-0088 (millisecond close times) have zero occurrences of
  "dormant" or "inactiv". No CAP defines a dormant-account eligibility rule. One non-judge-facing
  drift: the golden's corroboration notes call CAP-0087 "Draft", and it is now "Accepted"
  (2026-10-07). The keyFacts do not depend on that status. No swap.
- **Local surface** (`npm run mcp:surface`): baseline instructions 7,864 characters, candidate
  7,858 characters, as the plan expects. The `execute` description goes from 9,841 to 10,367
  characters. The `search` description length does not change (4,887); the `search` change is in
  the result `nextSteps` text, not in the description.
- **Evidence pack.** The runner at `63396840` has no `metricDefinitions` in the evidence pack, so the
  runner revision does not change. The judge-contract check applies to the activity row.

## Pins (version 2, recorded before the first paid call)

| Pin | Value |
|---|---|
| Baseline revision (B) | `6339684073571cb752909ebbfee713a05cf72016` |
| Candidate revision (C) | `5c86fd0a77693786486dd0ec3221f957b7716cc0` |
| Runner | Clean detached worktree `/Users/kalepail/Desktop/raven-c-runner` at the baseline revision |
| Server worktrees | `/Users/kalepail/Desktop/raven-c-srvB` (B) and `/Users/kalepail/Desktop/raven-c-srvC` (C), both clean; `npm ci` in each; Wrangler 4.149.0 |
| Port | 8799 for every start |
| Answering and judge models | Runner defaults (`claude-sonnet-5`); no `--model`, no `--judge-model` |
| Rubric and pack | `v2.11` and `p6` in the runner source (confirm on the first judged row of each run) |
| Claude executable | `~/.local/share/claude/versions/2.1.296` (`2.1.296 (Claude Code)`), linked from a private `bin` directory in the lane scratchpad |
| `AGENT_BINARY_SHA256` | `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937` |
| Collection environment | `env -i` with `HOME`, `USER`, `LOGNAME`, `LANG`, `SHELL=/bin/zsh`, `TERM=dumb`, `TMPDIR`, `DISABLE_AUTOUPDATER=1`, and a fixed `PATH` (private `bin`, `/usr/local/bin`, system directories), run through `zsh -f`. No `CLAUDE_*` or `ANTHROPIC_*` variable. |
| `AGENT_ENVIRONMENT_SHA256` | `6936aa4bd19480f7b8124744b05b644ff53ac02da0ab62cfe63e7fd283878632` (variables `HOME`, `PATH`, `SHELL`, `TMPDIR`) |
| Remote identity probe | `eval/qa/probe-remote-identities.mjs`, SHA-256 `eb06cd89bc6232d6747b7d44973f2deec272b48ba343b9d19a9800b74a18c226` |
| `REMOTE_IDENTITY_SHA256` | `414667aa38583bc99d775e02c7efe3e5a8a731f33e756668141052e05fe1205e` (`--stable-sha256`, three captures five minutes apart, exit 0, 2026-10-13 21:02Z to 21:12Z) |
| Judge-stability register | Generated once from the stored results in the main checkout (538 cases, 199 artifacts: 163 collection, 36 re-judge), frozen read-only outside the runner. SHA-256 `9291a8de3bd7a6859951fd0fef6144adf141d7d12be363cab07329a68aab290f` |
| Server `.dev.vars` identity | One fresh salt (`8dd0ec76e61f05551413854396f8e17bd8fac234f47b541e0cb38316847f6f11`) for both worktrees. Both gave the same 10 names and hash `d5124e96134f7931bd68ac10545b6d93a3d2accb1208682b678579bbb0654dc8`. |
| Baseline surface (live, first start) | `656feeef8966cbac326db00479f69b3171c401e94c5c4239364d04a28e754c4a` (instructions 7,864 characters; the same value as version 1, recorded fresh) |
| Candidate surface (live) | Recorded at the C start below |

The collection script asserts the runner revision, a clean runner tree, the binary, environment,
probe, and register pins, and exactly one `--max-budget-usd` with the value 18 before it starts
`run-qa.mjs`.

## Collections (version 2)

| Run | Arm | Result stamp | Rows | `comparable` | Cost USD | Budget calls |
|---|---|---|---|---|---|---|
| B1 | Baseline | `2026-10-13T21-55-44` | 34 | true | 11.5840 | 98/98, `missingCosts` 0 |
| C1 | Candidate | `2026-10-13T22-36-08` | 34 | true | 11.1521 | 98/98, `missingCosts` 0 |
| C2 | Candidate | `2026-10-13T23-18-20` | 34 | true | 11.5902 | 96/96, `missingCosts` 0 |
| B2 | Baseline | `2026-10-13T23-59-41` | 34 | true | 11.5804 | 100/100, `missingCosts` 0 |

Each run is complete, with unsuppressed aggregates, rubric `v2.11`, pack `p6`, and
`claude-sonnet-5` for both roles. Each command passed one `--max-budget-usd 18`. The server and
surface pins matched before and after each run: baseline `656feeef…` at both starts, candidate
`8c2e4dfc3c074fc918223922f10529e980f4414d4b07b5799d0c4011188ad4ad` (instructions 7,858 characters)
at its start and again before C2. One Wrangler process ran at a time, on port 8799, in panes split
from `w3W:p4V` (`w3W:p4W` for B1, `w3W:p4Y` for C1 and C2, `w3W:p4Z` for B2).

## Consistent-change list (version 2, recorded before the re-judge spend)

Rule: both candidate grades differ from both baseline grades in the same direction, after T4 and
T5 exclusions.

- `q-pc-quantum-preparedness-dormant` (volatile): improvement. B wrong, wrong; C correct, correct.
- `q-hist-scp-rewrite-2015` (control): improvement. B partial, partial; C correct, correct.

No consistent regression. Excluded: `q-edge-strupey-ambiguous-stellar-history`. B1 has a judge
consistency failure (T4, `failureClass: "consistency"`, `partial-without-issue`, diagnostic
`judgeScore` partial). Its other grades are C1 wrong, C2 wrong, B2 correct. The exclusion follows
the predeclared rule. The row stays visible under H1 and in the result.

Noise floor on the common eligible denominator of 33: B1/B2 10 rows, C1/C2 7 rows.

Judge-contract check of the two listed rows: neither rationale cites host behavior or a metric
definition. Both rest on golden content (the QPP dormant-account passage; the disputed fork
causation). Both rows count.

Re-judge selection: these two IDs, once in B1 and once in C1, with `--max-budget-usd 4` each.
