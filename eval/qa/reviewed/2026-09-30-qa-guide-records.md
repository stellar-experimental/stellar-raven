# Retained eval/qa/README.md records — 2026-09-30

These sections preserve dated evidence cited by current artifacts.
Their wording describes each recorded run, not the current system.
Source guide: `eval/qa/README.md` at merge commit `49e04c16`.

## 2026-08-28 same-100 rerun on current main (checkpoint, not a re-baseline)

This run recollected the same 100 case ids as the 2026-08-27 benchmark against current main. It
is the first stored run under the tiered judging policy. Nothing was tuned after collection and
the numbers are as-is.

| Pin | Value |
| --- | --- |
| Results stamp | `2026-08-28T19-27-08-variantA.json` |
| SHA-256 | `3fa1bf01fe831e999c5282b332ec1309b7dcb9804e6cc4ec41135ab0681531dd` |
| Server + runner revision | `644f3649c449d899021d2c95c52641fcb09d1966` |
| Surface SHA-256 | `21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af` |
| Agent binary SHA-256 | `625869b01e0050f260b2980fac248fd9cef9e462612bded4ec9d3d49ff8969a5` (Claude Code 2.1.251) |
| Tuple | `claude-sonnet-5` answering / `claude-sonnet-5` judging / `v2.8` / `p5` |
| Results schema | `qa-agent-result-v4` |

Every guard passed: revision pin, surface pin before and after, listener-process stability,
clean runner tree, agent-binary match, neutral agent cwd, `safeMode: false`, and the `raven` MCP
server `connected` on all 100 rows. `meta.comparable` is `true` with no comparability reasons,
completeness is 100/100 with zero agent-failure rows, and every one of the 120 judge calls and
100 agent runs reported a cost.

| Metric | 2026-08-27 baseline | this run |
| --- | ---: | ---: |
| raw verdicts | 48C / 35P / 13W / 4E | 45C / 35P / 16W / 4E |
| half-credit | 65.5% | 62.5% |
| strict-correct | 48.0% | 45.0% |
| core-answer-correct | 91.7% | 88.5% |
| mean continuous coverage | 71.7% | 67.1% |

**Read the 100-case row as a diagnostic, not a delta.** Three things moved together: 59 of the
100 goldens changed judge-facing content in the 2026-08-27 golden-truth burn-down, the server
advanced from `9bb465d` through PRs #69, #71, #73, #81, #87, and #88, and judging moved from
one call per row to the tiered policy. `meta.inputSnapshot.caseIdsSha256` is identical on both
runs (`bca7442590e1a0ede954aa3e27243cb338dff63956b044c6001f1eff8f684622`), so the *membership*
is provably the same 100; the *content* is not.

The honest comparison is the **41 ids whose question and golden are byte-identical across both
runs**: baseline 25C / 10P / 3W / 3E, this run 25C / 10P / 5W / 1E. Correct is unchanged, and
both baseline errors that were gradeable this time became one partial and one wrong. Restricting
further to the 25 of those 41 that were judge-stable at collection time gives baseline
15C / 8P / 1W / 1E against 16C / 5P / 4W / 0E.

Per-row any-flip rates were 26% over all 100, 22% over the comparable 41, and 24% over the
stable 25 — all at the committed 23.3% noise floor. `re-judge.mjs --flips-vs` is unusable against
this baseline: `verifyBaselineIdentity` requires byte-identical content for every shared id, and
59 fail, so the tool refuses before selection. The tuple matches on both sides, so no re-judge was
needed to compare the 41.

Judge tiers: **90 `single`, 10 `panel`**. The stability register was deliberately absent during
collection, so every escalation came from the boundary path: 20 `boundary-partial` and 11
`boundary-wrong-claim` met the condition, the `--max-panel-cases 10` cap admitted 10, and 21
recorded `panelEscalationSkipped: "max-panel-cases"`. Two thirds of the rows the policy itself
flagged as borderline were therefore graded on one call.

All four `error` rows are verdict-consistency downgrades with `agent.failure: null` — no agent
failed. Two are `successful-trap-refusal-not-correct` (`q-edge-1xlm-activation-fee`,
`q-n3-ssrf-metadata-endpoint`) and two are `fired-avoid-not-wrong`
(`q-edge-exchange-memo-lost-funds`, `q-scf-v7-changes`). The baseline decomposed the same way on
three of its four. The mechanism is deterministic and repeats across unrelated cases.

Cost: `$31.9693122` total = `$23.9987822` answering + `$7.97053` judging, over 123 minutes. That
is below the `$45.711693` baseline despite 20 more judge calls, because answering cost fell.

Regenerating `judge-stability.json` over 195 artifacts after this run moved **47 of these 100
cases below the 0.75 threshold to 57**. Eleven crossed into unstable and one crossed out. The
pre-run estimate of judge stability on this set was optimistic.

### Triage of the 20 non-passing rows

Every `wrong` and `error` row was classified. Three rows whose class depended on what the live
services actually return were re-executed against production `execute` on free operations on
2026-08-28; the rest were read against their transcript and golden.

| Root cause | Rows | Notes |
| --- | ---: | --- |
| Judge/measurement artifact | 4 | all four `error` rows; verdict-consistency downgrades, no agent failed |
| Agent failure — answer omits or contradicts a fact the sources did return | 12 | the dominant class; no single shared mechanism |
| Agent failure — fabrication under evidence scarcity | 1 | `q-defi-wisdomtree-crdt`, which also carries the Lumenloop gap below as a secondary cause |
| Upstream data gap | 2 | `q-defi-perps-whitespace` and `q-eco-defi-market-map`, both on Scout project `status` |
| Corpus-coverage diagnostic | 1 | `q-soroban-sdk-cve` |

Two upstream gaps cleared the acting bar and are drafted for `improvements/`:

- **Scout `status` conflates directory listing with mainnet deployment.** Live re-execution on
  2026-08-28 (`scout.searchProjects`, `matchMode: "strict"`,
  `generatedAt 2026-08-28T19:29:47Z`) returns `Stellars Finance` with `status: "Live"`, while
  `Zenex` and `Noether` return `Pre-Release`. The corpus records Stellars Finance's own
  testnet/pre-mainnet self-description. No field separates the two meanings, and the single label
  produced a `wrong` verdict on two unrelated cases in this run — `q-defi-perps-whitespace` and
  `q-eco-defi-market-map`. Successor in spirit to `sls-076`, which covered a different Scout
  matching defect.
- **Lumenloop project records count sub-products without naming them.** `lumenloop.get_project`
  for `wisdomtree` returns 624 characters describing "13 digital funds and a Gold token" and
  names none of them. `lumenloop.search_directory({query:"CRDT"})` falls back to
  `match_mode: "semantic"` and returns DTCC, Stellar Router SDK, Decentrio, OrbitCDP, and DeFarm.
  No `search_content_semantic` row names CRDT or CRDYX. An agent cannot reach the fund from these
  sources, which is what `q-defi-wisdomtree-crdt` asks for.

`q-soroban-sdk-cve` is deliberately **not** filed. `scout.listAudits` (58 reports) is an
audit-report registry, `searchResearch source=security-program` returns only the SDF HackerOne
policy, and `source=release` does index the `rs-soroban-sdk` patched releases — but no exposed
surface undertakes to host CVE/GHSA advisory records, and the canonical owner is the advisory
database itself. Per the root-cause table that is a coverage diagnostic, not a manufactured
upstream issue.

Both fabrication-adjacent rows share one shape worth watching rather than fixing yet:
`q-defi-wisdomtree-crdt` and `q-soroban-sdk-cve` each turned "these sources return nothing" into
a confident world-truth negative, and the first also invented a substitute story. The baseline hit
`error_max_turns` on the same WisdomTree case, so this is the second consecutive round in which
that case failed for an evidence-scarcity reason.

The round record is [`2026-08-28-eval-block2.md`](../../../.agents/rounds/2026-08-28-eval-block2.md).
Result JSONs stay local-only evidence. This is a checkpoint; the baseline of record does not move.

### 2026-07-13 release-closeout targeted diagnostics

Three paid targeted probes exercised the six new cases and their nearest controls. They were
**not** the deterministic sample-30 and are not a new headline baseline. All used
`claude-sonnet-5` for answering and judging under v2.4/p3 against the dirty local runner; the
result metadata records `serverRevision: null`. The owned corpus denominator is 490, while each
row below keeps its explicit targeted N:

| Results stamp                       |                                           Scope |                          Raw QA |                                                 Offline plan regrade |
| ----------------------------------- | ----------------------------------------------: | ------------------------------: | -------------------------------------------------------------------: |
| `2026-07-13T18-59-22-variantA.json` |                    evidence-poor retrieval, N=7 | 2 correct / 4 partial / 1 wrong |  6/7 required covered (86%); mean on-plan 0.94; progression used 1/3 |
| `2026-07-13T19-09-10-variantA.json` |      bounded same-model recovery follow-up, N=3 |                       0 / 2 / 1 |  2/3 required covered (67%); mean on-plan 1.00; progression used 0/2 |
| `2026-07-13T20-07-14-variantA.json` | prior-art preflight plus no-detour control, N=3 |                       0 / 3 / 0 | 3/3 required covered (100%); mean on-plan 1.00; progression used 2/2 |

Transcript review matters more than these tiny-N aggregates. The first probe passed the scoped
closed-world and ambiguous-Strupey behaviors but exposed provenance/completeness failures. The
second improved Tyler attribution yet still missed dated mutable claims and misread an `ok` empty
lane. The third triggered prior-art for both substantial designs and avoided a detour on the WASM
control, but all answers remained partial because the substantial cases mishandled evidence limits
and the control omitted its answer-time as-of date. Post-probe guidance/golden hardening was **not
paid-remeasured**; no claim of a measured post-hardening win follows. The plan sidecars are local
evidence at the same stamps with `.plan.json` suffixes.

## Corpus and sample membership record — 2026-08-28

- **Denominator note**: the owned battery is **500 cases as of 2026-08-28** (499 as of 2026-08-19; the 2026-08-28 block added `q-scf-resolve-passport-superseded-slug`). The retrieval audit
  added five service-semantics cases to the 492-case corpus. The current maintenance change added
  two broad `scout.hackathonBrief` cases to the 497-case corpus. Commit `6e1f979` previously added two
  Soroban cases to the 490-case corpus. The 2026-07-11 baseline remains a historical
  484-case denominator, and the 490-case results remain 490-denominated. Neither denominator is
  retroactively relabeled. The approximately 469-case pre-rebuild aggregates are also archival
  (see the history doc). Per-id comparisons remain valid for continuing cases under the same
  rubric/pack tuple.
- **Deterministic sample history**: the sampler code and N=30 contract did not change. Six new
  cases added three members to the Scout stratum and three to LumenLoop. Because the algorithm
  uses even-spaced picks over each id-sorted service stratum, the 490-case compile retained 25
  sample ids and replaced five: removed `q-defi-liquid-staking-whitespace`,
  `q-hist-quantum-preparedness-plan`, `q-scf-current-hackathons-compare-live`,
  `q-scf-rfps-hackathons-live`, and `q-ti-explain-repo-payload-status`; added
  `q-defi-defindex-honest`, `q-hist-meridian-2026-corrected-venue`, `q-scf-current-round`,
  `q-scf-sdf-bug-bounty`, and `q-ti-openzeppelin-relayer`. None of the six new cases itself
  entered sample-30. The 490→492 expansion retained 24 sample ids and replaced six. Removed:
  `q-protocol-27-cap-0071`, `q-protocol-quorum-slice-vs-quorum`, `q-raph-offramp-xlm-usdc`,
  `q-sep-38-quotes`, `q-sor-build-target-wasm32v1`, and `q-sor-scval-conversion`; added:
  `q-protocol-accounts-signers-thresholds`, `q-protocol-scp-consensus-algorithm`,
  `q-raph-phishing-pending-claim`, `q-sep-41-token-interface`,
  `q-sor-classic-dex-from-contract`, and `q-sor-sep41-transfer-vs-transferfrom`. Compare
  aggregate headline runs across either the 484→490 or 490→492 boundary only on an explicit
  common-id set, or disclose that sample membership changed.
  The 492→497 compile retained 9 sample ids and replaced 21. Two new cases entered sample-30:
  `q-gap-vet-pitch-vertical-null` and `q-ti-scout-refresh-cached-rows`. Use a common-id set for
  comparisons across this boundary, or disclose the sample change.
  The 497→499 compile retained 28 sample ids and replaced two. It removed
  `q-edge-noinfo-exact-tvl-figure` and `q-scf-total-distributed`; it added
  `q-edge-partner-detail-soft-empty` and `q-scf-v7-changes`. Use a common-id set for comparisons
  across this boundary, or disclose the sample change.

## Judge variance measurement

- **Noise floor**: per-row any-flip rate **23.3%** across three identical v2.4/p3 re-judge
  passes (pairwise score disagreement 15.6%). Isolated single-run score movement at or below
  that scale is variance until confirmed by live transcript review or a repeated mechanism.
  Read `wrong` counts before `correct` counts; compare variants on the same sample.
