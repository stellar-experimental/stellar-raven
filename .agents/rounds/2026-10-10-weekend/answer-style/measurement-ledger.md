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
