# Final pre-spend launch review

Date: 2026-09-03

Role: final independent launch reviewer

## Decision

The real-runtime adapter proof passes.
The runner, candidate, and baseline revisions are clean and exact.
The paired 500-case contract is coherent after the command correction below.

This review authorizes the paid P6 self-test as the first paid method.
The candidate arm can start only after that self-test passes.
The baseline arm can start only after the candidate artifact passes every stop rule.

I made no paid call and no code change.

## Evidence reviewed

I read the truth-maintenance ledger and both applicable runbooks.
I read `adapter-real-runtime-proof.md` and both pre-spend amendment reports.
I inspected the three exact worktrees.
I inspected the adapter, runner, pairing guard, and P6 wrapper.

The restricted test run could not bind a loopback socket.
The unrestricted free retry passed all 177 focused tests.
The static judge test passed all 15 prompt hashes.
The paired simulator passed all six deterministic gates.
`npm run eval:selftest` passed.
`npm run eval:routing -- --gate` passed.

## Clean revision confirmation

| role | worktree | revision | state |
|---|---|---|---|
| runner | `/private/tmp/stellar-raven-tm-runner` | `65d2f98dd80305e9a2b9000c46e9a91ba0557cbc` | clean |
| candidate | `/private/tmp/stellar-raven-tm-candidate` | `65d2f98dd80305e9a2b9000c46e9a91ba0557cbc` | clean |
| baseline | `/private/tmp/stellar-raven-tm-baseline` | `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0` | clean |

Each revision resolves to the exact local commit.
Each worktree has its own named branch.
The runner and candidate point to the same reviewed commit.

Both server worktrees contain identical `.dev.vars` bytes.
Their SHA-256 is `b1a85bbbf92700747e1f9a85aa6b919151d79b64ee0f28c93bf2b5078e311273`.
No check printed a secret value.

## Real-runtime adapter confirmation

The adapter SHA-256 is `473690c7f10d5384be252bb97f9aa16ee88428d23589779289f5910c08e60303`.
The adapter is part of runner revision `65d2f98`.

The candidate proof used `verify-native` mode.
Its direct and adapted surfaces both used SHA-256 `21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af`.
Its initialize and deterministic search bodies remained byte-identical.
Its preflight and postflight attestations were byte-identical.

The baseline proof used `add-missing` mode.
Its direct and adapted surfaces both used SHA-256 `6cf5d1cdd3cd16c6b8bdb09a45917755cffaf0781f321734d7c9f7649a71d238`.
The direct baseline omitted `serverInfo.sourceRevision`.
The adapter added only revision `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0`.
The normalized initialize messages matched.
The deterministic search bodies remained byte-identical.

I repeated the live baseline comparison.
The direct and adapted surfaces again matched the recorded baseline hash.
The normalized initialize messages matched.
The direct and adapted search response bytes matched.
The current attestation SHA-256 remains `b68c2246e84aa1e0502c27a053367e3d8781f0f39bc529f6f2931d1604a11110`.

The focused tests cover JSON, SSE, gzip, deflate, raw deflate, and Brotli.
They also cover status, headers, errors, schemas, session data, and streaming.
The adapter proof therefore supports the planned current-runtime comparison.

## Listener identity confirmation

The current public listener is the baseline adapter.
It is not the candidate launch listener.

| listener | port | PID | command | worktree | revision | state |
|---|---:|---:|---|---|---|---|
| adapter | 8788 | 67853 | `node` | `/private/tmp/stellar-raven-tm-runner` | `65d2f98dd80305e9a2b9000c46e9a91ba0557cbc` | clean |
| upstream | 8790 | 67557 | `workerd` | `/private/tmp/stellar-raven-tm-baseline` | `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0` | clean |

The adapter attestation reports `matches: true`.
It reports the same upstream PID, worktree, revision, port, and clean state.
The baseline upstream PID also matches `adapter-real-runtime-proof.md`.

The candidate proof recorded upstream PID 63580.
That candidate listener is no longer active.
This is expected because each arm uses the same ports sequentially.

The listener owner must stop the baseline pair before the paid candidate arm.
The owner must then start the candidate pair on ports 8788 and 8790.
The runner will attest both listeners before and after collection.

## Frozen measurement pins

| pin | value |
|---|---|
| runner revision | `65d2f98dd80305e9a2b9000c46e9a91ba0557cbc` |
| candidate revision | `65d2f98dd80305e9a2b9000c46e9a91ba0557cbc` |
| baseline revision | `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0` |
| candidate surface | `21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af` |
| baseline surface | `6cf5d1cdd3cd16c6b8bdb09a45917755cffaf0781f321734d7c9f7649a71d238` |
| adapter SHA-256 | `473690c7f10d5384be252bb97f9aa16ee88428d23589779289f5910c08e60303` |
| P6 wrapper SHA-256 | `7526fdfb2f9c2c6a50d6b653830d818b403989a9eec5e26ab9470511e79e50f8` |
| QA implementation SHA-256 | `295e727844b574c9772bca81c70886764b9498cd35a23e0db5e613ea61ccf544` |
| generated cases file SHA-256 | `1042c0e226ad44b5ffab8844e1c97a2752f94a3096b13e628ed630fd0f015c7f` |
| selected cases SHA-256 | `623cd65816979285338865d7e62043bbe2247f083f5b1492d94b5c8805a1d915` |
| ordered case IDs SHA-256 | `b557bcb5cff8a434ad684b90a60343358360330ca1f91072089ceb57a38310d0` |
| case count | 500 active and 500 unique |
| case identity | `qa-judge-case-v2` |
| result tracks | `qa-five-track-v1` |
| answering model | `claude-sonnet-5` |
| judge model | `claude-sonnet-5` |
| judge rubric | `v2.10` |
| evidence pack | `p6` |
| judge policy | `stability-boundary-v1` |
| stability threshold | `0.75` |
| full-arm panel cap | 34 |
| stability register | `/private/tmp/stellar-raven-tm-paired-stability.json` |
| stability register SHA-256 | `06d3835b63ae05f40f808b9890628add8b905f32f60a65df19cbee1a751f9480` |
| stability register state | available, 538 cases, 197 source artifacts |
| public and private ports | 8788 and 8790 |
| prompt append | unset |

The current Claude executable resolves to `/Users/kalepail/.local/bin/claude`.
Its real path is `/Users/kalepail/.local/share/claude/versions/2.1.259`.
Its version is `2.1.259 (Claude Code)`.
Its SHA-256 is `884baa38fe1a624be25c4a91568bf5a08b5cf4e7d7acf29b7760e3525d964898`.

The owned runner pane is `w2R:p2`.
Its Claude environment SHA-256 is `c5ba1368ef107f174613e0e467918dc8b2fe3c1e414af7a2163d9f0e9f6faa1b`.
I did not access that unowned pane.
The owner supplied its read-only identity result.

My review shell produced a different environment hash.
Therefore, the paid commands must use the owned runner pane hash.
The runner records environment names without recording their values.

I independently loaded the frozen stability register.
It reports schema version 1 and no skipped artifacts.
Its generation time is `2026-09-03T18:03:48.044Z`.

The affected-case stratum remains a secondary descriptive view.
It selects 496 cases and changes no paid-arm membership.
Its selected-ID SHA-256 is `0aca348f479a095e9657fc225652ef2b77e48d52926da982a13044fe97c8ceec`.

## Upstream interval pins

The latest free refresh reports stable Lumenloop identity data.
It also reports stable Stellar Docs settings and 650 titles.

Scout advertises OpenAPI version `1.9.23`.
Its canonical live inventory SHA-256 is `ec0c345b297220e8225c211adcc8c8eae91d07c24f33b645ad0142f2abd4fee5`.

The committed Raven inventory remains Scout `1.9.1`.
The round rejected the Scout `1.9.23` inventory change with recorded evidence.
Both paid arms still call the same live Scout `1.9.23` service.

Therefore, the pair does not estimate the Scout release effect.
It estimates the current service-revision effect under one live upstream interval.
The operator must repeat these identity checks around both arms.

## Paired measurement contract

The method uses two fresh, complete 500-case arms.
The candidate runs first and also supplies the current-quality result.
The exact old revision runs second.

Both arms use the current runner, corpus, models, rubric, pack, prompt, and stability register.
Both arms also use the same live upstream interval.
Each arm uses its own server revision and surface hash.

The candidate adapter mode is `verify-native`.
The baseline adapter mode is `add-missing`.
Both arms use one adapter revision, adapter hash, and port pair.

The primary estimates are the paired differences for `correct` and `correct or partial`.
The default `0.08` value is a no-change radius.
It is not a product tolerance.

The paired printer requires at least 100 eligible IDs.
It excludes the union of T4 and T5 rows.
Any candidate-only T4 or T5 loss stops the method.
No repeat has authorization.

The two full arms each have a `$400` total cap.
The P6 self-test has a `$3.50` total cap.
Each optional flip rejudge batch has a `$25` total cap.
The paired-method maximum remains `$853.50`.

The later live-data amendment remains separate.
Its maximum remains `$29` after the paired review passes.
Its earlier adapter hash `ff392a22...` is obsolete.
The authoritative adapter hash is `473690c7...`.

## Exact launch commands

The earlier paired command omitted four mandatory adapter flags.
These commands replace that stale command shape.

Run the P6 self-test first from the clean runner worktree:

```sh
npm run eval:qa:selftest -- \
  --runner-revision 65d2f98dd80305e9a2b9000c46e9a91ba0557cbc \
  --claude-path /Users/kalepail/.local/bin/claude \
  --expect-claude-binary-sha256 884baa38fe1a624be25c4a91568bf5a08b5cf4e7d7acf29b7760e3525d964898 \
  --expect-claude-environment-sha256 c5ba1368ef107f174613e0e467918dc8b2fe3c1e414af7a2163d9f0e9f6faa1b
```

Run the candidate only after the self-test passes:

```sh
node eval/qa/run-qa.mjs \
  --cases eval/qa/cases.json \
  --variant A \
  --surface search-execute \
  --model claude-sonnet-5 \
  --judge-model claude-sonnet-5 \
  --max-panel-cases 34 \
  --stability-register /private/tmp/stellar-raven-tm-paired-stability.json \
  --port 8788 \
  --upstream-port 8790 \
  --adapter-mode verify-native \
  --adapter-revision 65d2f98dd80305e9a2b9000c46e9a91ba0557cbc \
  --expect-adapter-sha256 473690c7f10d5384be252bb97f9aa16ee88428d23589779289f5910c08e60303 \
  --server-revision 65d2f98dd80305e9a2b9000c46e9a91ba0557cbc \
  --expect-sha256 21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af \
  --expect-agent-binary-sha256 884baa38fe1a624be25c4a91568bf5a08b5cf4e7d7acf29b7760e3525d964898 \
  --expect-agent-environment-sha256 c5ba1368ef107f174613e0e467918dc8b2fe3c1e414af7a2163d9f0e9f6faa1b \
  --max-budget-usd 400
```

Run the baseline only after the candidate artifact passes:

```sh
node eval/qa/run-qa.mjs \
  --cases eval/qa/cases.json \
  --variant A \
  --surface search-execute \
  --model claude-sonnet-5 \
  --judge-model claude-sonnet-5 \
  --max-panel-cases 34 \
  --stability-register /private/tmp/stellar-raven-tm-paired-stability.json \
  --port 8788 \
  --upstream-port 8790 \
  --adapter-mode add-missing \
  --adapter-revision 65d2f98dd80305e9a2b9000c46e9a91ba0557cbc \
  --expect-adapter-sha256 473690c7f10d5384be252bb97f9aa16ee88428d23589779289f5910c08e60303 \
  --server-revision 90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0 \
  --expect-sha256 6cf5d1cdd3cd16c6b8bdb09a45917755cffaf0781f321734d7c9f7649a71d238 \
  --expect-agent-binary-sha256 884baa38fe1a624be25c4a91568bf5a08b5cf4e7d7acf29b7760e3525d964898 \
  --expect-agent-environment-sha256 c5ba1368ef107f174613e0e467918dc8b2fe3c1e414af7a2163d9f0e9f6faa1b \
  --max-budget-usd 400
```

Do not add `--sample`, `--ids`, `--judge-panel`, or `--no-judge`.
Use the baseline artifact as the first paired-printer argument.
Use the candidate artifact as the second argument.

## Remaining launch-time assertions

These assertions are time-dependent.
They must pass immediately before each applicable paid method.

1. Recheck the runner, server, adapter, binary, environment, corpus, and stability hashes.
2. Confirm `QA_AGENT_PROMPT_APPEND` remains unset.
3. Record both listener identities and the adapter attestation.
4. Probe the MCP surface and source revision through the public adapter.
5. Record every available Scout, Lumenloop, and Stellar Docs identity.
6. Stop when an advertised upstream identity changes during the paired window.
7. Preserve candidate-first order and one Wrangler process at a time.
8. Require the P6 summary to report seven successful calls and complete costs.
9. Require every collection artifact to report `meta.comparable: true`.
10. Require every row to report the `raven` MCP server as connected.

These are fail-closed launch checks.
They do not require another design review when every value matches this report.
Any mismatch stops the next paid call.

LAUNCH-OK

## P6 direct-node command correction

Date: 2026-09-03

The first P6 invocation stopped during its environment preflight.
It made no paid call.
Therefore, it did not consume the authorized P6 method.

The `npm` package wrapper changed the observed environment SHA-256 to
`c233...`.
The preflight correctly rejected that value against the `c5ba...` pin.
The `c233...` value is not a replacement measurement pin.

Run the P6 wrapper directly in owned runner pane `w2R:p2`:

```sh
node eval/qa/run-p6-judge-self-test.mjs \
  --runner-revision 65d2f98dd80305e9a2b9000c46e9a91ba0557cbc \
  --claude-path /Users/kalepail/.local/bin/claude \
  --expect-claude-binary-sha256 884baa38fe1a624be25c4a91568bf5a08b5cf4e7d7acf29b7760e3525d964898 \
  --expect-claude-environment-sha256 c5ba1368ef107f174613e0e467918dc8b2fe3c1e414af7a2163d9f0e9f6faa1b
```

This command uses the same direct-node environment as both full-arm commands.
It preserves one environment identity across P6, candidate, and baseline methods.

The wrapper still permits exactly seven sequential calls.
Each call keeps its `$0.50` cap.
The P6 method keeps its `$3.50` maximum.

Stop if the direct command does not observe the exact `c5ba...` environment hash.
Stop if the wrapper, runner, or Claude binary identity differs.
Require seven successful records and complete reported costs before the candidate arm.

Do not use `npm run eval:qa:selftest` for this paid P6 method.
The direct-node correction changes no code, model, rubric, pack, or budget contract.

LAUNCH-OK
