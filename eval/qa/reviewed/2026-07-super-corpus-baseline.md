# 2026-07 super-corpus baseline of record

This is the first answer-quality baseline after the owned corpus reached 484 cases. It replaces
the pre-rebuild aggregate checkpoints as the baseline of record. The full 484-case sequential
run was deliberately not run: the designed headline sample and the two separately denominated
live contracts are the baseline instruments.

## Exact runs

All runs used the shipped variant A `search` tool and `execute` against the existing Solo dev
process 2948 on `localhost:8787`. Its MCP initialize readiness probe returned 200. The runner
revision was `c8a3b4d46d0d9bc45c3f99d49889a834cb199617`; answering and judging both used the
unaltered `claude-sonnet-5` defaults under rubric `v2.4` / evidence pack `p3`.

| Lane | Contract / selection | Results stamp | Raw result |
|---|---|---|---|
| Headline | deterministic owned-battery sample 30, variant A | `2026-07-11T15-36-44-variantA.json` | 8 correct / 18 partial / 4 wrong / 0 error |
| Canonical live | `live-data-canonical-v2`, frozen 10 | `2026-07-11T15-50-19-variantA.json` | 8 correct / 2 partial / 0 wrong / 0 error |
| Digest supplement | `live-digest-supplement-v2`, frozen 2 | `2026-07-11T15-52-51-variantA.json` | 2 correct / 0 partial / 0 wrong / 0 error |

The local results JSON files are evidence and remain gitignored. Total recorded model cost was
$22.81 headline, $5.79 canonical live, and $1.31 digest supplement.

## Headline result

“Pass rate” below is the strict `correct / total` rate. Counts remain visible because partials
and wrongs carry different product meaning.

| Scope | Correct | Partial | Wrong | Error | n | Strict pass rate |
|---|---:|---:|---:|---:|---:|---:|
| Overall | 8 | 18 | 4 | 0 | 30 | 26.7% |
| stellarDocs | 5 | 8 | 2 | 0 | 15 | 33.3% |
| scout | 2 | 5 | 1 | 0 | 8 | 25.0% |
| skills | 1 | 1 | 0 | 0 | 2 | 50.0% |
| lumenloop | 0 | 3 | 1 | 0 | 4 | 0.0% |
| none | 0 | 1 | 0 | 0 | 1 | 0.0% |

| Category | Correct | Partial | Wrong | Error | n | Strict pass rate |
|---|---:|---:|---:|---:|---:|---:|
| assets-anchors-seps | 3 | 1 | 0 | 0 | 4 | 75.0% |
| compliance-rwa-payments | 0 | 3 | 0 | 0 | 3 | 0.0% |
| defi-ecosystem | 0 | 2 | 1 | 0 | 3 | 0.0% |
| edge-behavior | 0 | 1 | 1 | 0 | 2 | 0.0% |
| history-org-tokenomics | 0 | 1 | 1 | 0 | 2 | 0.0% |
| protocol-core | 1 | 1 | 1 | 0 | 3 | 33.3% |
| retail-consumer | 1 | 2 | 0 | 0 | 3 | 33.3% |
| scf-grants-builders | 2 | 1 | 0 | 0 | 3 | 66.7% |
| soroban | 1 | 3 | 0 | 0 | 4 | 25.0% |
| tooling-infra | 0 | 3 | 0 | 0 | 3 | 0.0% |

## Live-lane behavioral result

The canonical live-10 raw result was 8 correct / 2 partial / 0 wrong. Live re-execution found
that `q-live-oracle-repo-triage`'s supposedly unsupported Blend audit claim was present in the
Scout audit corpus (OtterSec, Certora, and Code4rena records). Its other required behaviors were
present, so that partial is a bounded evidence-pack/judge artifact. The reviewed behavioral read
is therefore **9 correct / 1 partial / 0 wrong (90.0% strict)**. The remaining partial,
`q-live-zk-repos-current`, used real live repo statistics but promoted `soroban-examples` into a
fixed canonical #1 and attached unsupported Groth16-content specifics; it remains a real agent
synthesis miss.

The digest-2 result is separately **2 correct / 0 partial / 0 wrong (100.0%)**. It is not added
to the canonical denominator.

## Wrong and partial triage

Every row below was joined to its golden before review. All four headline wrongs were
re-judged once on identical saved input; all four remained wrong. Each disputed wrong claim was
also re-executed through the dev service. “Transcript” means the saved execute evidence was
checked against the joined golden; “live” means an additional post-run execute probe was made.

| Lane | Case | Raw | Evidence and disposition | Step-5 root cause |
|---|---|---|---|---|
| headline | `q-aas-list-token-on-exchanges-aggregators` | partial | Transcript supports the core listing flow; SEP-32 was mischaracterized as asset-name resolution. Real partial. | Agent failure: unsupported synthesis |
| headline | `q-agent-identity-erc8004-stellar` | partial | Registry/feedback mechanics were covered, but the answer omitted that signals do not prove trust or payment. Real partial. | Agent failure: caveat omission |
| headline | `q-asset-rwa-tokenized-freshness` | partial | The answer's own $785M→$3B figures contradict its “5x” arithmetic. Real partial. | Agent failure: arithmetic/synthesis |
| headline | `q-crp-become-an-anchor-licensing` | partial | Transcript labels Etherfuse Protocol/Contract; the answer promoted it to an anchor and omitted legal-scoping qualifications. Real partial. | Agent failure: classification and omissions |
| headline | `q-crp-remittance-founder-advisory` | partial | Protocol guidance was useful but the business-control architecture was materially incomplete. Real partial. | Agent failure: scope omission |
| headline | `q-defi-liquid-staking-whitespace` | partial | The answer omitted distinctions among issuer yield, lending/LP/vault positions, and native-validator staking, plus dated search framing. | Agent failure: taxonomy/scoping omission |
| headline | `q-defi-streaming-payments-prior-art` | wrong | Live Scout still labels Fluxity and related projects `Live`, but provides no contract/network deployment proof; the answer inferred deployment and audit maturity. Re-judge stayed wrong. | Agent failure; recurrence of upstream Scout lifecycle semantics (`sls-024`) |
| headline | `q-eco-stellar-rwa-stablecoin-volume` | partial | The answer attached specific meeting/Messari provenance not supported by its source basis. Real partial. | Agent failure: source attribution |
| headline | `q-edge-1xlm-activation-fee` | partial | Base reserve was explained; transaction inclusion fees were omitted. Real partial. | Agent failure: completeness omission |
| headline | `q-edge-noinfo-sep-9999` | wrong | Live SEP search found no SEP-9999 but did not justify a durable numbering ceiling; the answer asserted one. Re-judge stayed wrong. | Agent failure: trap handling/overclaim |
| headline | `q-hist-quantum-preparedness-plan` | wrong | Live Scout research returned the June 9 SDF plan and staged roadmap; the answer confidently denied its existence. Re-judge stayed wrong. | Agent failure: retrieval and false absence |
| headline | `q-hot-sdf-xlm-holdings-sales` | partial | The funding/sales distinction was present, but the named exchange/direct-sale mechanism was omitted. Real partial. | Agent failure: completeness omission |
| headline | `q-pc-muxed-accounts` | partial | Core muxed-account behavior was correct; the Soroban invocation/source restriction was omitted. Real partial. | Agent failure: compatibility caveat omission |
| headline | `q-protocol-27-cap-0071` | wrong | Live Scout research returned Protocol 27 mainnet activation; the answer inferred “not active” from CAP Accepted status. Re-judge stayed wrong. | Agent failure: freshness/status inference |
| headline | `q-raph-offramp-xlm-usdc` | partial | The answering model made zero tool calls and omitted exact asset/network/memo checks. Real partial. | Agent failure: tool-use omission |
| headline | `q-scf-current-hackathons-compare-live` | partial | The answer used live event data but omitted `generatedAt` and explicit event status. Real partial. | Agent failure: snapshot metadata omission |
| headline | `q-sor-build-target-wasm32v1` | partial | Build target guidance was correct but lacked the required as-of framing. Real partial. | Agent failure: freshness framing omission |
| headline | `q-sor-scval-conversion` | partial | After extensive retrieval, the answer still omitted BytesN length enforcement and the generated/spec-driven preference. | Agent failure: synthesis omission |
| headline | `q-soroban-no-std-constraints` | partial | The answer omitted ledger-time and public/validator-influenceable PRNG behavior. Real partial. | Agent failure: completeness omission |
| headline | `q-ti-cli-rust-windows-troubleshooting` | partial | Testnet funding guidance was present but the explicit “no Friendbot on mainnet” boundary was omitted. | Agent failure: safety caveat omission |
| headline | `q-ti-explain-repo-payload-status` | partial | The host envelope was explained, but nested payload `data.ok` / graceful-degradation interpretation was omitted. | Agent failure: envelope interpretation omission |
| headline | `q-ti-stellar-lab-usage-and-new-ui` | partial | Live transcript supports the cited UI locations, so that part of the rationale overreached; plaintext saved-key security and trustline-does-not-credit facts were still missing. Real partial. | Agent failure with non-dispositive judge overreach |
| live-10 | `q-live-zk-repos-current` | partial | Live re-execution supports the repo statistics, but not the fixed canonical #1/Groth16-content promotion. Real partial. | Agent failure: ranking/content overclaim |
| live-10 | `q-live-oracle-repo-triage` | partial | Live re-execution found all three named Blend audit families. All behavioral key facts were present; calibrated to correct. | Judge artifact: bounded pack omitted evidence |

No eval-side golden defect was established, so no gospel changed. Headline wrongs overturned:
**0**; headline wrongs confirmed real: **4**. One canonical-live partial was overturned as a
judge artifact.

## Improvement follow-up

No new finding file lands in this lane, per the phase split. The streaming-prior-art miss
reproduced the already-verified Scout lifecycle-semantics gap in `sls-024`: project `status:
Live` is not contract/network deployment proof. A quick improvements follow-up should append
this Fluxity/SStream recurrence and the `2026-07-11T15-36-44-variantA.json` stamp to that finding
rather than create a duplicate.

## Comparability and interpretation

- **Noise floor:** v2.4/p3 has a 23.3% per-row any-flip rate (15.6% pairwise disagreement).
  Deltas within that scale are not signal without repeated-mechanism or live-transcript support.
- **Denominator changed:** pre-rebuild aggregate checkpoints used approximately 469 vendored
  cases; the current owned battery is 484. Aggregate rates are not directly comparable across
  that boundary. Per-id comparisons remain valid for continuing `q-*` ids because rubric v2.4
  and pack p3 stayed unchanged.
- This run establishes the new post-rebuild baseline, not a claim that 26.7% is a full-corpus
  estimate with narrow confidence bounds. The designed deterministic sample is the headline;
  the canonical and digest contracts measure live grounding separately.

Prior aggregate baselines are archival in
[`research/audits/2026-07-qa-history.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/audits/2026-07-qa-history.md).
The immediately preceding architecture experiment remains separately recorded in
[`2026-07-10-per-operation-architecture-ab.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/eval/qa/reviewed/2026-07-10-per-operation-architecture-ab.md).

## What this establishes

The owned 484-case corpus now has a reproducible baseline-of-record stamp using the unchanged
measurement contract. The headline sample exposes a real completeness/synthesis deficit—four
live-confirmed wrongs and eighteen partials—while the execute-grounding contracts remain much
stronger after review (90% canonical live, 100% digest). Future deltas should compare the same
sample ids and v2.4/p3 tuple, treat sub-noise-floor movement as variance, and read wrong-count
movement before aggregate correct-count movement.
