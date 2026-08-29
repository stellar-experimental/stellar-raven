# First `qa-five-track-v1` same-100 round: pre-spend brief

Date: 2026-08-29

Status: reviewed-brief candidate; no paid method is authorized
Prepared code baseline: `origin/main` at `9b039b966c5f7eee628ad820bc1ccc8ed960a119`

## Purpose

This round will create the first paid `qa-five-track-v1` artifact for the pinned same-100 set.
It will test the merged panel, judge, five-track, paired, and lifecycle contracts together.
It will also establish one side of a future compatible paired comparison.

This brief does not authorize a paid command.
Each paid method needs separate authorization with its exact budget cap.
The smoke does not authorize the same-100 collection.
A repeat does not inherit authorization from the first attempt.

All result JSON files stay local under `eval/qa/results/`.
Do not commit, upload, publish, or attach these result files.

## Source and contract pins

| Item | Pin |
| --- | --- |
| Code baseline revision | `9b039b966c5f7eee628ad820bc1ccc8ed960a119` |
| Runner revision at launch | The clean commit containing this brief |
| Server revision at launch | The same clean commit as the runner |
| MCP URL used for preflight | `http://localhost:8788/mcp` |
| MCP surface SHA-256 | `21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af` |
| MCP surface artifact SHA-256 | `ca886ee761e5e3682d300552af0f91f263a4e7beac1b379c18d232e68d7b34b5` |
| QA implementation SHA-256 | `5c1c9d2043d6ddaaba67904a1b44842756bc8c35cd6f74d7cf7aaa0bf1e2fa94` |
| Manifest SHA-256 | `4945c3117d464d7155fe6bc2bd2f2f42638ef83159435ae48a90bab046dc6789` |
| `run-qa.mjs` SHA-256 | `3f7414ced6f1c6852ecf9e8e2d3e4af4c6a50d721285882105cbd43109755d` |
| Agent-result SHA-256 | `654d5a8a1d3f51cc3087afe3105d1fd8ea89efa207efef94703ace541b30d39c` |
| Evidence-pack SHA-256 | `1c8401833b0a0e03cd75a062e6ed55aa417ffacd4279c9e08fc056c576cc0bbe` |
| Judge SHA-256 | `799171025c72848ef2be38b4a7534661133145e50665906326a79ee66473fdd5` |
| Plain harness SHA-256 | `597ad08ba80d33a6b5302a3b84dd1e6a49e05077a55480d2469874a68bc65350` |
| Lifecycle rules SHA-256 | `168d077a2d748c4356dc216c6b4438fe830719e1d6dc0551498838d036cd73a1` |
| Case identity schema | `qa-judge-case-v2` |
| Result schema | `qa-agent-result-v4` |
| Track schema | `qa-five-track-v1` |
| Tier policy | `stability-boundary-v1` |
| Lifecycle policy | `qa-mass-review-rules-v1` |

The merge chain is `cf8af54`, `2a36842`, `b612942`, `7fd7b5e`, then `9b039b9`.
These commits contain the panel, judge, paired, five-track, and lifecycle contracts.
The handoff records the exact reviewed-brief commit after Git creates it.
Every paid method must use that clean `HEAD` for both runner and server revisions.

## Judge tuple and agent binary

| Item | Value |
| --- | --- |
| Answering model | `claude-sonnet-5` |
| Judge model | `claude-sonnet-5` |
| Rubric | `v2.9` |
| Evidence pack | `p5` |
| Panel votes | `3` |
| Stability threshold | `0.75` |
| Boundary panel cap at 100 cases | `34` |
| Agent command | `/Users/kalepail/.local/bin/claude` |
| Resolved agent binary | `/Users/kalepail/.local/share/claude/versions/2.1.251` |
| Agent version | `2.1.251 (Claude Code)` |
| Agent binary SHA-256 | `625869b01e0050f260b2980fac248fd9cef9e462612bded4ec9d3d49ff8969a5` |

The adaptive panel is uncapped for cases with unstable history.
The boundary cap applies only when usable history does not select a tier.

## Agent environment pin

The harness watches exact names and four name prefixes.
Exact names are `CI`, `HOME`, `NODE_OPTIONS`, `PATH`, `SHELL`, and `TMPDIR`.
The prefixes are `ANTHROPIC_`, `CLAUDE_`, and `RAVEN_CLAUDE_`.
The exact prompt name is `QA_AGENT_PROMPT_APPEND`.

The paid launch state is:

| Watched name | Required state |
| --- | --- |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | set |
| `HOME` | set |
| `PATH` | set |
| `SHELL` | set |
| `TMPDIR` | set |
| `QA_AGENT_PROMPT_APPEND` | unset |
| `CI` | unset |
| `NODE_OPTIONS` | unset |
| Any `ANTHROPIC_*` name | unset |
| Any other `CLAUDE_*` name | unset |
| Any `RAVEN_CLAUDE_*` name | unset |

Therefore, `agentEnvironmentIdentity().variableNames` must contain exactly five names.
Those names are `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`, `HOME`, `PATH`, `SHELL`, and `TMPDIR`.
Record the launch `sha256` before each paid method.
Require the same environment hash for every later paired arm.

Use this free check before each paid method:

```sh
node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; const expected=["CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS","HOME","PATH","SHELL","TMPDIR"]; const actual=agentEnvironmentIdentity(); if (!Object.hasOwn(process.env,"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS")) throw new Error("CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS must be set"); if (Object.hasOwn(process.env,"QA_AGENT_PROMPT_APPEND")) throw new Error("QA_AGENT_PROMPT_APPEND must be unset"); if (JSON.stringify(actual.variableNames)!==JSON.stringify(expected)) throw new Error(`unexpected agent environment names: ${actual.variableNames.join(",")}`); console.log(JSON.stringify(actual,null,2));'
```

## MCP preflight

No existing `npm run dev` or Wrangler listener was active in any readable Herdr workspace.
No unowned pane was controlled.

The preflight used owned pane `w1H:p3` and `npm run dev:eval -- --port 8788`.
The worker reported revision `9b039b966c5f7eee628ad820bc1ccc8ed960a119`.
A real MCP `initialize` returned HTTP 200 and the same revision.
The live surface check returned the pinned surface SHA-256.
The owned server stopped after preflight, and its pane closed.

The paid operator must start or find an authorized server before each paid method.
The operator must repeat the initialize and surface checks before each method.
The local `.dev.vars` file must set `DEV_ALLOW_UNAUTHENTICATED=true`.
This local operator prerequisite enables the loopback development bypass.

Before each paid method, use the current clean commit and the pinned surface:

```sh
PORT=8788
SERVER_REVISION="$(git rev-parse HEAD)"
SURFACE_SHA256=21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af
test -z "$(git status --porcelain=v1 --untracked-files=all)"
node eval/report-live-surface.mjs --port "$PORT" --expect-source-revision "$SERVER_REVISION" --expect-sha256 "$SURFACE_SHA256" --json "/tmp/raven-eval-surface-${METHOD}.json"
```

Set `METHOD` to `smoke`, `same-100`, or `rejudge` before this check.
The report must show both revision and surface checks as true.

## Stability register

Generate the register with this free command:

```sh
node eval/qa/judge-stability.mjs --results-dir /Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results --out /tmp/qa-five-track-same-100-stability.json
```

| Item | Value |
| --- | --- |
| Durable register path | `eval/qa/results/2026-08-29-five-track-same-100-stability.json` |
| Temporary source path | `/tmp/qa-five-track-same-100-stability.json` |
| Register SHA-256 | `50dd2d79adae60cba85935776f4bb3458ac191f84a9bb43dc8f94657f9bdbd00` |
| Generated at | `2026-08-29T20:27:05.073Z` |
| Source artifacts | `195` |
| Collection artifacts | `161` |
| Rejudge artifacts | `34` |
| Registered cases | `538` |
| Same-100 cases below `0.75` | `57` |
| Same-100 cases at or above `0.75` | `43` |

The 57 unstable cases will receive uncapped three-vote panels.
The 43 remaining cases will use their selected stable tier.
The durable copy is gitignored and remains local.
Do not regenerate it after authorization.
Regeneration can change the hash when the source results directory changes.

Create and verify the durable copy with these free commands:

```sh
cp /tmp/qa-five-track-same-100-stability.json eval/qa/results/2026-08-29-five-track-same-100-stability.json
shasum -a 256 eval/qa/results/2026-08-29-five-track-same-100-stability.json
```

`q-protocol-ledger-close-time` has a stability score of exactly `0.75`.
The implementation panels a case only when its score is below `0.75`.
Therefore, this threshold-edge case uses a single judge.

## Pinned same-100 identity

All 100 cases are active in the lifecycle registry.
None of the pinned cases is quarantined.

| Item | SHA-256 |
| --- | --- |
| Ordered case IDs | `bca7442590e1a0ede954aa3e27243cb338dff63956b044c6001f1eff8f684622` |
| Current selected case objects | `d79e32c0a9033c086d2403efea30dd5ac3a1598075d3ea97f3f16b2bea5d95d4` |
| Current case-input map | `41c7afc28dadef4cd838d8667fbf6ecdd0d045bc6ec04e21ee22eaa6dd225b14` |
| Lifecycle registry file | `ca959b27fa04e5b67ffaa7e5dcf3a70db9892ae4a2cb2863293ac604d9e48d61` |

Reproduce the case-input map hash with this exact free command:

```sh
node --input-type=module -e 'import fs from "node:fs"; import { createHash } from "node:crypto"; import { caseInputSha256 } from "./eval/qa/paired-verdict.mjs"; const old=JSON.parse(fs.readFileSync("/Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results/2026-08-28T19-27-08-variantA.json","utf8")); const current=JSON.parse(fs.readFileSync("eval/qa/cases.json","utf8")); const byId=new Map(current.cases.map((c)=>[c.id,c])); const selected=old.rows.map(({id})=>byId.get(id)); console.log(createHash("sha256").update(JSON.stringify(Object.fromEntries(selected.map((c)=>[c.id,caseInputSha256(c)])))).digest("hex"));'
```

The ordered IDs are:

```text
q-aas-burn-clawback-redemption-mechanics
q-aas-list-token-on-exchanges-aggregators
q-aas-sep30-recoverable-wallets
q-agent-identity-erc8004-stellar
q-anchor-sdp-vs-anchor-platform
q-asset-issue-asset-howto
q-asset-rwa-tokenized-freshness
q-asset-stablecoin-issuers-discovery
q-asset-two-account-issuer
q-comp-auth-flags-overview
q-comp-cross-moneygram-partnership-sep24
q-comp-finclusive-caas
q-comp-sep8-number-lookup-no-deepresearch
q-crp-partner-detail-after-discovery
q-defi-allbridge-what-is
q-defi-arbitrage-pathpayment-bots
q-defi-bridge-evm-to-stellar-axelar
q-defi-comet-what-is
q-defi-etherfuse-stablebonds
q-defi-perps-whitespace
q-defi-phoenix-what-is
q-defi-skill-ecosystem-scout
q-defi-wisdomtree-crdt
q-eco-defi-market-map
q-eco-pyusd-stellar-freshness
q-eco-stellar-wallets-list
q-edge-1xlm-activation-fee
q-edge-asset-site-scam-detection
q-edge-exchange-memo-lost-funds
q-edge-fresh-latest-blend-tvl
q-edge-fresh-latest-scf-round
q-edge-noinfo-stellar-native-privacy-default
q-edge-send-me-free-xlm
q-gap-av-offset-not-timestamp
q-gap-builders-person-empty
q-gap-match-partners-degrade
q-gap-related-projects-empty
q-gap-upcoming-hackathon-fallback
q-hist-quantum-preparedness-plan
q-history-ecosystem-index-freshness-live
q-infra-horizon-vs-rpc
q-infra-secp256r1-passkeys
q-jutsu-what-is-a-memo
q-mpp-discovery-and-modes
q-n3-missing-funds-account-support
q-n3-ssrf-metadata-endpoint
q-org-sdf-enterprise-fund
q-pay-moneygram-ramps
q-pc-bucketlist-vs-merkle-inclusion-proof
q-pc-multisig-setup-lifecycle
q-pc-protocol-27-zipper
q-pc-sponsored-reserves
q-protocol-23-whisk-caps
q-protocol-base-reserve-min-balance
q-protocol-ledger-close-time
q-protocol-operation-types-list
q-protocol-state-archival-ttl
q-quickstart-manual-ledger-close
q-raph-hardware-wallet
q-raph-offramp-xlm-usdc
q-raph-scam-spam-tokens
q-raph-xlm-simple
q-scf-academic-research-grant
q-scf-build-tracks
q-scf-ecosystem-listing-partner-jobs
q-scf-history-soroswap
q-scf-how-to-apply
q-scf-open-rfps
q-scf-rfps-hackathons-live
q-scf-v7-changes
q-sep-31-cross-border
q-sep-53-sign-verify-message
q-sep-catalog-list
q-sep6-sep24-sep31-choice
q-sor-confidential-tokens
q-sor-cross-warmancer-zk-stack
q-sor-doc-page-sections-followup
q-sor-p23-auto-restore-extendto
q-sor-sep41-transfer-vs-transferfrom
q-soroban-auth-delegation-p27
q-soroban-auth-recursion-dos-audit
q-soroban-contract-id-derivation
q-soroban-factory-pattern
q-soroban-oz-token
q-soroban-sdk-cve
q-soroban-sdk-macros
q-soroban-token-transfer-pattern
q-stellar-recurring-payments
q-ti-connect-wallet-button-code
q-ti-custodial-account-generation-c-address
q-ti-freighter-localhost-not-detected
q-ti-rpc-gettransactions-pagination-xdr
q-ti-testnet-usdc-faucet
q-ti-vocab-content-tags-live
q-token-circle-usdc-on-stellar
q-tool-freighter-wallet
q-tool-indexer-repos-discovery
q-tool-passkeykit-smart-wallet
q-tool-sep41-status-live
q-zk-circuit-setup
```

## Paid methods requiring separate authorization

### Method 1: three-case smoke, maximum `$3`

This smoke covers a stable case and two unstable trap cases.
It exercises a single judge, panels, T3 behavior, and T4 evidence.
The smoke records T5 fields but does not force T5 events.

```sh
node eval/qa/run-qa.mjs --variant A --ids q-edge-1xlm-activation-fee,q-edge-noinfo-stellar-native-privacy-default,q-protocol-ledger-close-time --model claude-sonnet-5 --judge-model claude-sonnet-5 --max-panel-cases 10 --stability-register eval/qa/results/2026-08-29-five-track-same-100-stability.json --max-budget-usd 3 --port "$PORT" --server-revision "$SERVER_REVISION" --expect-sha256 "$SURFACE_SHA256" --expect-agent-binary-sha256 625869b01e0050f260b2980fac248fd9cef9e462612bded4ec9d3d49ff8969a5
```

Method 1 needs explicit authorization for a maximum spend of `$3`.
The same three 2026-08-28 answers cost `$0.579`.
Two panels plus one single judge add about `$0.429` under the observed means.
The expected smoke cost is about `$1.0` to `$1.5`.
Three historical maximum answering calls plus six extra panel votes approach `$3.00`.
One transport retry can exhaust the `$3` cap.
The cap can therefore leave the smoke incomplete.

### Method 2: pinned same-100 collection, maximum `$50`

```sh
node eval/qa/run-qa.mjs --variant A --ids q-aas-burn-clawback-redemption-mechanics,q-aas-list-token-on-exchanges-aggregators,q-aas-sep30-recoverable-wallets,q-agent-identity-erc8004-stellar,q-anchor-sdp-vs-anchor-platform,q-asset-issue-asset-howto,q-asset-rwa-tokenized-freshness,q-asset-stablecoin-issuers-discovery,q-asset-two-account-issuer,q-comp-auth-flags-overview,q-comp-cross-moneygram-partnership-sep24,q-comp-finclusive-caas,q-comp-sep8-number-lookup-no-deepresearch,q-crp-partner-detail-after-discovery,q-defi-allbridge-what-is,q-defi-arbitrage-pathpayment-bots,q-defi-bridge-evm-to-stellar-axelar,q-defi-comet-what-is,q-defi-etherfuse-stablebonds,q-defi-perps-whitespace,q-defi-phoenix-what-is,q-defi-skill-ecosystem-scout,q-defi-wisdomtree-crdt,q-eco-defi-market-map,q-eco-pyusd-stellar-freshness,q-eco-stellar-wallets-list,q-edge-1xlm-activation-fee,q-edge-asset-site-scam-detection,q-edge-exchange-memo-lost-funds,q-edge-fresh-latest-blend-tvl,q-edge-fresh-latest-scf-round,q-edge-noinfo-stellar-native-privacy-default,q-edge-send-me-free-xlm,q-gap-av-offset-not-timestamp,q-gap-builders-person-empty,q-gap-match-partners-degrade,q-gap-related-projects-empty,q-gap-upcoming-hackathon-fallback,q-hist-quantum-preparedness-plan,q-history-ecosystem-index-freshness-live,q-infra-horizon-vs-rpc,q-infra-secp256r1-passkeys,q-jutsu-what-is-a-memo,q-mpp-discovery-and-modes,q-n3-missing-funds-account-support,q-n3-ssrf-metadata-endpoint,q-org-sdf-enterprise-fund,q-pay-moneygram-ramps,q-pc-bucketlist-vs-merkle-inclusion-proof,q-pc-multisig-setup-lifecycle,q-pc-protocol-27-zipper,q-pc-sponsored-reserves,q-protocol-23-whisk-caps,q-protocol-base-reserve-min-balance,q-protocol-ledger-close-time,q-protocol-operation-types-list,q-protocol-state-archival-ttl,q-quickstart-manual-ledger-close,q-raph-hardware-wallet,q-raph-offramp-xlm-usdc,q-raph-scam-spam-tokens,q-raph-xlm-simple,q-scf-academic-research-grant,q-scf-build-tracks,q-scf-ecosystem-listing-partner-jobs,q-scf-history-soroswap,q-scf-how-to-apply,q-scf-open-rfps,q-scf-rfps-hackathons-live,q-scf-v7-changes,q-sep-31-cross-border,q-sep-53-sign-verify-message,q-sep-catalog-list,q-sep6-sep24-sep31-choice,q-sor-confidential-tokens,q-sor-cross-warmancer-zk-stack,q-sor-doc-page-sections-followup,q-sor-p23-auto-restore-extendto,q-sor-sep41-transfer-vs-transferfrom,q-soroban-auth-delegation-p27,q-soroban-auth-recursion-dos-audit,q-soroban-contract-id-derivation,q-soroban-factory-pattern,q-soroban-oz-token,q-soroban-sdk-cve,q-soroban-sdk-macros,q-soroban-token-transfer-pattern,q-stellar-recurring-payments,q-ti-connect-wallet-button-code,q-ti-custodial-account-generation-c-address,q-ti-freighter-localhost-not-detected,q-ti-rpc-gettransactions-pagination-xdr,q-ti-testnet-usdc-faucet,q-ti-vocab-content-tags-live,q-token-circle-usdc-on-stellar,q-tool-freighter-wallet,q-tool-indexer-repos-discovery,q-tool-passkeykit-smart-wallet,q-tool-sep41-status-live,q-zk-circuit-setup --model claude-sonnet-5 --judge-model claude-sonnet-5 --max-panel-cases 34 --stability-register eval/qa/results/2026-08-29-five-track-same-100-stability.json --max-budget-usd 50 --port "$PORT" --server-revision "$SERVER_REVISION" --expect-sha256 "$SURFACE_SHA256" --expect-agent-binary-sha256 625869b01e0050f260b2980fac248fd9cef9e462612bded4ec9d3d49ff8969a5
```

Method 2 needs explicit authorization for a maximum spend of `$50`.

The closest stored same-100 cost evidence is:

| Stamp | Total | Agent | Judge | Judge calls | Contract note |
| --- | ---: | ---: | ---: | ---: | --- |
| `2026-08-27T00-02-11-variantA.json` | `$45.711693` | `$33.7445484` | `$11.9671446` | not reused | Different goldens |
| `2026-08-28T19-27-08-variantA.json` | `$31.9693122` | `$23.9987822` | `$7.97053` | `120` | Same IDs and surface; rubric `v2.8`; cap `10`; no register |

These two totals span `$31.9693122` to `$45.711693`.
Their two-point median is `$38.8405026`.
Neither artifact uses the complete current measurement contract.

The current register selects 57 panels and 43 singles.
This selection produces `57 × 3 + 43 = 214` judge calls.
The 2026-08-28 mean panel cost is `$0.180`.
Its mean single-judge cost is `$0.069`.
Therefore, `57 × $0.180 + 43 × $0.069 = $13.227`, or about `$13.23`.
The matching 2026-08-28 agent cost rounds to `$24.00`.
The expected total is `$24.00 + $13.23 = $37.23`.

The `$50` cap leaves a `$12.77` residual above `$37.23`.
That residual is about `34.3%` of the estimate.
The 2026-08-27 agent cost plus current judging is about `$46.97`.
That case leaves only about `$3.03` below the cap.

The 2026-08-28 agent P90 was `$0.374` per case.
One hundred P90 agent calls plus `$13.23` judging equal `$50.63`.
The `$50` cap can therefore stop the run before completion.
The owner accepts this residual by authorizing Method 2 without raising the cap.

### Method 3: isolated baseline rejudge, maximum `$10`, only if required

The current golden pass changed judge-facing content for 43 pinned cases.
Only 57 pinned cases retain matching judge-facing content.
This method can rejudge only those 57 old answers against the current judge tuple.

```sh
node eval/qa/re-judge.mjs /Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results/2026-08-28T19-27-08-variantA.json --ids q-aas-burn-clawback-redemption-mechanics,q-agent-identity-erc8004-stellar,q-asset-issue-asset-howto,q-comp-finclusive-caas,q-comp-sep8-number-lookup-no-deepresearch,q-crp-partner-detail-after-discovery,q-defi-allbridge-what-is,q-defi-etherfuse-stablebonds,q-defi-perps-whitespace,q-defi-phoenix-what-is,q-defi-wisdomtree-crdt,q-eco-defi-market-map,q-edge-1xlm-activation-fee,q-edge-asset-site-scam-detection,q-edge-exchange-memo-lost-funds,q-edge-fresh-latest-scf-round,q-edge-send-me-free-xlm,q-gap-av-offset-not-timestamp,q-gap-builders-person-empty,q-gap-related-projects-empty,q-gap-upcoming-hackathon-fallback,q-hist-quantum-preparedness-plan,q-history-ecosystem-index-freshness-live,q-infra-horizon-vs-rpc,q-infra-secp256r1-passkeys,q-jutsu-what-is-a-memo,q-mpp-discovery-and-modes,q-org-sdf-enterprise-fund,q-pay-moneygram-ramps,q-pc-multisig-setup-lifecycle,q-protocol-23-whisk-caps,q-protocol-ledger-close-time,q-protocol-state-archival-ttl,q-quickstart-manual-ledger-close,q-raph-hardware-wallet,q-raph-offramp-xlm-usdc,q-raph-scam-spam-tokens,q-raph-xlm-simple,q-scf-academic-research-grant,q-scf-ecosystem-listing-partner-jobs,q-scf-v7-changes,q-sep-53-sign-verify-message,q-sep6-sep24-sep31-choice,q-sor-confidential-tokens,q-sor-cross-warmancer-zk-stack,q-sor-p23-auto-restore-extendto,q-soroban-auth-delegation-p27,q-soroban-factory-pattern,q-soroban-sdk-cve,q-soroban-sdk-macros,q-soroban-token-transfer-pattern,q-ti-custodial-account-generation-c-address,q-ti-testnet-usdc-faucet,q-ti-vocab-content-tags-live,q-tool-freighter-wallet,q-tool-passkeykit-smart-wallet,q-tool-sep41-status-live --cases-ref 644f3649c449d899021d2c95c52641fcb09d1966 --judge-model claude-sonnet-5 --allow-non-identical --max-budget-usd 10
```

Method 3 needs separate authorization for a maximum spend of `$10`.
It produces diagnostic `qa-rejudge-v1` evidence only.
It cannot produce five-track or paired evidence.
At `$0.069` per single judge, 57 calls cost about `$3.93`.
The Method 3 estimate is about `$4`, leaving about `$6.07` below its cap.

## Paired experimental status

The 2026-08-28 artifact uses rubric `v2.8` and lacks `caseInputSha256`.
Its server revision is `644f3649c449d899021d2c95c52641fcb09d1966`.
Its artifact SHA-256 is `3fa1bf01fe831e999c5282b332ec1309b7dcb9804e6cc4ec41135ab0681531dd`.

The free paired check returned `INDETERMINATE` with denominator zero.
Both inputs lacked valid case identity hashes.
The old artifact cannot enter `qa-paired-ordinal-ni-v1`.

Therefore, this round is not a valid paired comparison against the old artifact.
This round will establish one compatible side for a later same-tuple pair.
A later paired repeat needs a new plan, review, and paid authorization.

## Unresolved owner product margin

The product owner has not set the non-inferiority margin.
The statistical default `0.08` is only the no-change radius.
It is not an approved product tolerance.

The paired validator produced these planning values for 100 pairs and two looks:

| Margin | Look-one no-change pass | Two-look no-change pass | False pass at 5-point loss | Second collection |
| --- | ---: | ---: | ---: | ---: |
| `0.05` | `6.992%` | `25.963%` | `0.051%` | `91.812%` |
| `0.08` | `36.350%` | `80.925%` | `3.899%` | `62.454%` |
| `0.10` | `66.208%` | `95.657%` | `18.357%` | `32.596%` |

The owner must resolve this margin before any later paired decision.

## Stopping rules

- Do not run a paid method before an independent adversarial review passes.
- Use the reviewed-brief commit recorded in `/tmp/eval-round-sol.md`.
- Do not run a paid method from a dirty worktree.
- Stop if `HEAD`, the server revision, or the live surface differs from this brief.
- Stop if the agent path, version, or binary hash differs from this brief.
- Stop if the stability register path or hash differs from this brief.
- Stop if any pinned ID changes order, identity, or lifecycle state.
- Stop if the watched environment names differ from the pinned five-name list.
- Stop if `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` is unset.
- Stop if `QA_AGENT_PROMPT_APPEND` is set.
- Stop if the recorded environment hash changes between methods.
- Stop if real MCP `initialize` does not return HTTP 200.
- Stop unless the method's live surface report used `--expect-sha256` and passed.
- Stop if the three-case smoke does not complete all three cases.
- Stop if the smoke lacks complete cost, MCP, attempt, panel, T4, or T5 data.
- A budgeted call with no reported cost invalidates the full method.
- Stop after any paid method reaches its exact budget cap.
- Treat an incomplete artifact as incomplete evidence.
- Do not calculate an aggregate verdict from fewer than 100 eligible same-100 rows.
- Do not retry a paid method without new authorization.
- Keep only the harness's allowed transport and judge retries.
- Do not override a provider safeguard, timeout, or contradiction.
- Repeat the live surface and process checks after each paid method.
- Mark an artifact non-comparable if the final pins differ.
- Do not run the optional rejudge unless a reviewer documents its need.
- Do not run a second collection during this authorization sequence.

## Artifact paths

| Artifact | Path |
| --- | --- |
| Reviewed brief | `.agents/rounds/2026-08-29-five-track-same-100.md` |
| Smoke result | `eval/qa/results/<timestamp>-variantA.json` |
| Same-100 result | `eval/qa/results/<timestamp>-variantA.json` |
| Optional rejudge result | `eval/qa/results/<timestamp>-rejudge.json` |
| Durable stability register | `eval/qa/results/2026-08-29-five-track-same-100-stability.json` |
| Preflight surface report | `/tmp/raven-eval-surface.json` |
| Per-method surface report | `/tmp/raven-eval-surface-<method>.json` |
| Operator handoff | `/tmp/eval-round-sol.md` |
| Independent review | `/tmp/five-track-same-100-pre-spend-review-grok.md` |
| Old local baseline | `/Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results/2026-08-28T19-27-08-variantA.json` |

Use distinct timestamps to identify the smoke and same-100 files.
Record their exact paths and SHA-256 values before review.

## Review finding reconciliation

| Finding | Repair |
| --- | --- |
| H1 | Replaced the case-input map hash and added its reproducible command. |
| H2 | Added both stored costs, panel arithmetic, estimates, and cap residuals. |
| M1 | Added full-method invalidation for a budgeted call without reported cost. |
| M2 | Stated that the smoke records T5 fields but does not force T5 events. |
| M3 | Pinned the watched names, launch states, and environment identity check. |
| M4 | Required `--expect-sha256` on every per-method live surface report. |
| L1 | Copied the register to a checksummed gitignored local path. |
| L2 | Recorded the exact `0.75` stable threshold edge. |
| L3 | Corrected the `sourceIdentity` command in the local handoff. |
| L4 | Added `DEV_ALLOW_UNAUTHENTICATED=true` as a local prerequisite. |

## Independent review plan

The Grok high-effort adversarial review completed on 2026-08-29.
That reviewer differed from the Sol author and the Fable orchestrator.
The review required changes in findings H1, H2, M1-M4, and L1-L4.

This candidate reconciles all ten findings.
The source review remains `/tmp/five-track-same-100-pre-spend-review-grok.md`.

Commit this reviewed-brief candidate after all free delta checks pass.
Then request a bounded delta review of only the repaired sections.
Do not authorize a paid method until that delta review passes.

## Live-verification plan

Review every `wrong`, `partial`, and `error` result.
Also review surprising passes and all judge contradictions.
Join each result to its exact case input and golden material.

Re-execute disputed claims with free live operations where possible.
Separate documentation, ecosystem, transcript, and trap evidence lanes.
Review T3, T4, and T5 evidence explicitly.

Use the `golden-truth` workflow for any proposed golden change.
Use independent source classes for disputed or unstable facts.
Keep uncertainty explicit when a claim cannot be verified.

File evidence-backed upstream findings in `improvements/`.
Record own-repo work in `.agents/TODO.md`.
Update the round ledger only after the full review finishes.

Do not push, open a pull request, or deploy during this round preparation.

## Free preflight record

| Check | Result |
| --- | --- |
| `npm run eval:selftest` | PASS |
| `npm run eval:compile` | PASS |
| `npm run eval:qa:compile` | PASS |
| `npm run eval:qa:register` | PASS; zero reopened cases |
| `npm run eval:qa:lint -- --since origin/main --stale` | PASS; zero errors and 60 known warnings |
| `npm run eval:routing -- --gate` | PASS |
| `npm run eval:qa:paired:validate` | PASS; all six simulation gates passed |
| `npm run typecheck` | PASS |
| `npm test` | PASS; 95 files and 1,505 tests |
| `WRANGLER_LOG_PATH=/tmp/wrangler-eval-round-build.log npm run build` | PASS |
| `npm run secrets:scan -- --tree` | PASS; no leaks |
| Agent version and SHA-256 | PASS |
| Real MCP `initialize` | PASS; HTTP 200 |
| Live MCP surface check | PASS |
| 57-case rejudge dry-run | PASS; no paid calls |
| Old artifact paired check | Expected `INDETERMINATE`; missing case identity hashes |

`npm ci` completed with 310 packages.
Its prepare step could not update the shared worktree Git hook setting.
This warning did not change the source tree.

Wrangler could not write its default user log file.
The preflight used `WRANGLER_LOG_PATH` under `/tmp` for later Wrangler commands.

`npm run eval:qa:selftest` was not run.
That command makes seven paid judge calls under the current contract.
