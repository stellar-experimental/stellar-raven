# Independent drift and alias review — 2026-11-05

Reviewer: Scout lane, user-pinned Astra/high, distinct from root author. Base `fec1c79f3ae4e4210e7d988c3aff40cda9928482`. Read live-drift-resolution, full source/test/doc diff, all eleven skill-body diffs in `tmp/truth-2026-11-05/skills-update.log`, and root routing evidence. No code edits, agents, paid calls or Wrangler processes.

## Findings

1. **Medium, inherited redirect escape in touched function.** `src/hosts.ts` constructs the target by resolving pathname+search against the canonical base. `new URL('//evil.example/mcp', 'https://raven.stellar.org').href` is `https://evil.example/mcp`. Thus an alias URL with that path violates the promised canonical-host invariant. This already existed for browser paths; it is not a newly introduced exposure. Sent root a concrete fix: construct the canonical URL first and assign pathname/search, with a double-slash regression test. Final disposition/recheck appended below.
2. **Low, metadata typo.** New `eval/gates.json` evidence.notes ends in literal `undefined`; remove it. The old top-level note and localTrace describe prior verification, while the new notes describe this refresh. Current evidence identity is the SHA and durable report, not that old local trace.

## Independent derivation

- `node scripts/diff-inventory.mjs {surface,text,deep} fec1c79f:inventory/stellar-light.json inventory/stellar-light.json`: surface/text empty; deep paths/components both false. **Schema drift, not provenance-only.** Sixteen operation objects change, as enumerated in `research/audits/2026-11-05-drift-routing.json`; manually checked full changed schemas, not merely four text fields. Shared partner, repository, RFP, rubric, TVL and stablecoin structures align with the independently live-tested distinctions in `scout.md`. No new path/method or operation ID.
- Manifest exact ID set is unchanged:284 entries,60 operations. Exposure policy, runners and transport ownership are unchanged. Excluded partner administration/AI surfaces remain excluded. The three declared runner operations are `lumenloop.search_content_semantic`, `lumenloop.list_documents`, `lumenloop.find_content_by_entity`; intersection with changed Scout operations is empty. No runner live re-execution is justified.
- Independently reran baseline and candidate routing: **544 complete rows, zero grade changes**. Full-result JSON comparison excludes only topHits for grading;495-row dump omits holdouts and is not used as full coverage. Three score movements and one top-five-order movement match root evidence exactly: negative-auth-events rank5 becomes scout.analyzeEcosystem; Horizon searchResearch and holdout SEP24 matchPartners scores move without order changes. Current `--gate` passes. Thresholds/accepted totals did not change. This is evidence-fingerprint refresh, not a new relaxed performance floor. Existing protocol-history failure remains visible, unchanged.
- The Docs title hold remains necessary. Root fresh-title counterfactual moves wallet_dapp out of top5 for q-tool-wallets-kit; retaining held titles avoids that precise loss. Service-level grade equivalence alone would have concealed it.
- Pin review covered all eleven files: x402 funding/error handling and Varial name; assets funding/signers; cross-chain and cctp wallet references; dapp single-operation rule and Varial SDK/hook; react and smart-accounts references; standards ecosystem Docs MCP description; Scout overview, API reference and examples. No new privilege, credential flow or exposed callable operation. The MCP install snippet describes the separately named official service, not an invented Raven tool. Assets custom-SAC admin residual is tracked separately as sk-038; this review does not declare that upstream prose fully repaired. `node scripts/check-mirrors.mjs --fetch` independently passed all67 selected file hashes; pin-review guard accepts both reviewed selections.
- Live `GET https://developers.stellar.org/docs/build/guides/basics/create-account` returned200. Old exact aria-label selector matches0; current parser returns Create a Keypair/create-a-keypair, Create an Account/create-an-account-1, Fetch Balances/fetch-balances, Full Example/full-example. Exact matching href protects against unrelated heading links. Disabled script/file evaluation and script stripping remain. The zero-heading check precedes atomic write and preserves previous index on failure.
- Current anchor diff vs base is **976 pages/4,081 headings/82 ambiguous, six changed pages (one existing +five new), no removals**. Existing change: submit-transaction-wait-js; additions: SDP UI reports, API get-account-statement/get-transaction-notice/reports, JS SDK helpers. A prior root snapshot said two existing changes; this is current independent count. Duplicate IDs remain ambiguity-aware rather than guessed.
- Alias behavior intentionally redirects MCP/OAuth/well-known before authentication with308; old issuer grants require reconnect. README, public guide, architecture now say so. Root also corrected stale server/wrangler comments after review. No compatibility shim or new issuer semantics introduced.

## Reproduction and verification

From repository root (public live read, no credentials):

```sh
git show fec1c79f:catalog/manifest.json > /tmp/scout-baseline-manifest.json
node eval/run-routing.mjs --manifest /tmp/scout-baseline-manifest.json --dump-ranked /tmp/scout-baseline-ranked.json
node eval/run-routing.mjs --gate --dump-ranked /tmp/scout-candidate-ranked.json
node scripts/diff-inventory.mjs surface fec1c79f:inventory/stellar-light.json inventory/stellar-light.json
node scripts/diff-inventory.mjs text fec1c79f:inventory/stellar-light.json inventory/stellar-light.json
node scripts/diff-inventory.mjs deep fec1c79f:inventory/stellar-light.json inventory/stellar-light.json
node scripts/check-mirrors.mjs --fetch
node scripts/check-pin-review.mjs --base fec1c79f
npx vitest run test/hosts.test.ts test/adapters.test.ts test/stellar-docs-anchors.test.ts test/stellar-docs-anchor-build.test.mjs test/refresh-anchor-workflow.test.mjs
npx vitest run test/catalog-guards.test.mjs test/catalog.test.ts test/skill-exposure-classification.test.ts test/skills.test.ts test/super-spec.test.ts test/spec-sandbox.test.ts
```

Focused tests:151+243 pass. Surface/text exit0; deep exit1 correctly records contract drift. No additional full suite/build/smoke executed by reviewer; root owns assembled-worker/full checks and deployment. Review is conditional on redirect fix and metadata typo reconciliation; all other audited drift is acceptable with existing holds/residuals retained.

## Final disposition — ACCEPT

Root fixed both findings. Independent re-read confirms the target is built from the fixed canonical origin, then pathname and search are assigned; the same double-slash path now stays on raven.stellar.org. `npx vitest run test/hosts.test.ts` passed all5 tests including both aliases' double-slash cases. The metadata `undefined` suffix is gone. Server and Wrangler comments now match redirect-before-auth behavior. No unresolved drift/alias blocker remains; the retained Docs title hold and separately tracked upstream content residuals remain explicit.
