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
| `q-edge-strupey-ambiguous-stellar-history` | correct → partial (effective; judge consistency flag `partial-without-issue`) | wrong → wrong (avoid 1 and 2 fire again) | Reproduced: C stays below B |
| `q-gap-contracts-domain-empty` | correct → partial | wrong → partial | Not reproduced: judge variance |
| `q-eco-most-active-defi-projects` | wrong → wrong | correct → correct | Reproduced improvement |
| `q-pc-quantum-preparedness-dormant` | partial → partial | correct → correct | Reproduced improvement |

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
- `q-gap-contracts-domain-empty`: the candidate claim "the host marks an ok empty result
  `inconclusive: \"empty\"`" is true for the candidate host. The change did not survive the
  re-judge, so no live check can confirm it.
- Not live-checked, because each is a single-run wrong and not a consistent change:
  `q-edge-noinfo-stellar-native-privacy-default` (C2; a check needs the Stellar Docs Algolia key,
  which this authorization reserves for the probe), `q-pc-sequence-numbers-ordering-replace` (C2;
  a stable CAP-0021 `minSeqNum` omission), and `q-defi-defindex-honest` (wrong in B1, C1, and C2;
  `truth.status: "disputed"`).

## Result: FAIL

Reading rule 3 needs zero confirmed consistent regressions in abstention and absence together.
`q-edge-strupey-ambiguous-stellar-history` (abstention) is a consistent regression. It survived
the re-judge and the live check. Rule 4 applies: the result is FAIL, and the merge is blocked.

| Slice | Rows | Excluded | Consistent regressions (confirmed) | Consistent improvements (re-judged) |
|---|---|---|---|---|
| Abstention | 8 | 0 | 1 (1) | 0 |
| Absence | 8 | 1 | 1 (0) | 0 |
| Volatile | 8 | 0 | 0 | 2 |
| Control | 10 | 0 | 0 | 0 |

Wrong counts (read first): B1 2, C1 4, C2 6, B2 3. Correct counts: B1 24, C1 22, C2 24, B2 23.
Noise floor: B1 and B2 disagree on 8 rows. C1 and C2 disagree on 7 rows.

Smallest removed sentence that the failed row needs: "…otherwise say unverified or ask for
context." (the tail of the attribution rule). The C1 script read `inconclusive: "candidates"` on
the Scout row, and the footer marked it. The answer still promoted the corrected match to the
subject. The signal reached the client, but it did not replace the rule. Rule 6 applies: the row
supplies a test, not new wording.

## Monitor-only observations

- `q-gap-contracts-domain-empty`: both candidate answers repeat the new `inconclusive: "empty"`
  label for an ok empty result. C2 also merges it with soft-empty ("an empty/`soft-empty` result
  is `inconclusive`"). The re-judge did not confirm a regression. The shared word "inconclusive"
  for soft-empty and for an ok field still puts the AGENTS.md soft-empty versus data distinction
  at risk. The golden says an ok empty result "is not a soft-empty error envelope".
- `q-edge-open-world-recovery-after-narrow-miss`: the C1 answer quotes the
  `inconclusive: "empty"/"candidates"` mechanics. The judge then failed its consistency check
  (T4).
- Two volatile rows improved and reproduced on re-judge. They do not offset an abstention
  regression under the predeclared rules.

## Mechanism metrics

| Metric | B1 | C1 | C2 | B2 |
|---|---|---|---|---|
| Volatile answers that state a date | 8/8 | 8/8 | 8/8 | 7/8 |
| Abstention and absence answers with an absence phrase (regex; includes scoped uses) | 6/16 | 8/16 | 6/16 | 9/16 |
| Avoid matches in abstention and absence | 0 | 3 | 2 | 0 |
| Execute scripts that read `inconclusive` or `asOf` | 0 | 13 | 7 | 0 |
| Execute results with a footer | 27/48 | 51/56 | 44/52 | 27/46 |
| Mean footer characters (when present) | 980 | 750 | 833 | 966 |
| Execute errors (`isError`) | 1 | 1 | 3 | 1 |
| Plan regrade, required covered | 28/34 | 28/34 | 27/34 | 29/34 |

All C-arm avoid matches in the abstention and absence slices come from the Strupey row and the
contracts-domain row.

## Spend

Collections $47.23 (B1 11.64, C1 12.08, C2 11.65, B2 11.85). Re-judges $0.69. Total $47.92 of the
$84 cap. Every budgeted call reported a cost (`missingCosts` 0 in all six artifacts).

## Records

Result JSON, plan regrades, re-judge artifacts, surface reports, and the frozen register stay local
under `eval/qa/results/2026-10-11-answer-style/` in the `w1010/a` worktree (gitignored). The
runner worktree `raven-w1010-a-qa-runner` holds the originals. The two server worktrees were
removed after the run.
