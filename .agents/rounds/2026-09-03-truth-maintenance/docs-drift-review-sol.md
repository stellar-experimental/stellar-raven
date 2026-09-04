# Independent Docs drift review

## Verdict

The Docs-only drift is valid.

The routing gate needs a manifest fingerprint rebaseline.
This rebaseline is mechanical because no ordered route ID or gate total changed.

The pass applies only to the permitted edits below.
The working tree contains unrelated round changes.

## HEAD comparison

I compared the drift with `HEAD` commit `2ee801f80d626e68f010392a7d541aab7997349d`.

`inventory/stellar-docs-titles.json` has one new title row.

- Path: `/docs/tokens/usdt0-layerzero`
- Title: `USDT0 Transfers with LayerZero`
- Total: `649` to `650`
- Added rows: `1`
- Removed rows: `0`

The index name and source object remain unchanged.
The refresh changed `fetchedAt` to `2026-09-03T17:09:55.410Z`.

`catalog/manifest.json` has one semantic change.
The builder appended `usdt0`, `layer`, and `zero` to `stellarDocs.search_asset_token_docs.keywords`.
The builder also copied the new `generatedAt` value.

The manifest still contains 252 entries.
It still exposes 30 Scout operations.

## Scout check

`inventory/stellar-light.json` is byte-identical with `HEAD`.

- OpenAPI version: `1.9.1`
- File SHA-256: `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0`

No Scout `1.9.23` content remains in this drift.

## Routing comparison

I built two isolated trees from the same `HEAD` revision.
One tree used the `HEAD` Docs inventory.
The other tree used the current Docs inventory.

Both trees used identical code and routing corpora.
Each tree compiled 338 legacy cases and 122 extended cases.

The ordered top-five route IDs are byte-identical across all 544 rows.
The canonical ordered-ID SHA-256 is `5e4507a35677efe2258eb515fe3a100e3a8f85c2c27287d89bdb52c361d3922b`.

All gate totals remain identical.

| Lane | Result |
| --- | --- |
| Legacy | `213 / 279 / 312`, unchanged |
| Legacy card hits | `95`, unchanged |
| Skills | `16 / 23 / 23`, unchanged |
| Holdout | `10 / 22 / 26`, unchanged |
| Holdout forbidden captures | `11`, unchanged |
| Holdout passes | `21`, unchanged |

Five raw scores increased for `stellarDocs.search_asset_token_docs`.
The new keywords caused these expected score changes.
No score change moved a route.

| Case | Rank | Score |
| --- | ---: | ---: |
| `q-pc-l2-payment-channels-starlight` | 1 | `384` to `392` |
| `q-pc-sponsored-reserves` | 1 | `535` to `537` |
| `q-sor-evm-to-soroban-porting` | 3 | `700` to `708` |
| `q-sor-freeze-account-allowance` | 2 | `526` to `528` |
| `q-ti-historical-events-beyond-retention` | 5 | `531` to `533` |

Thus, complete result rows are not byte-identical because they include scores.
The route rankings are byte-identical because their ordered IDs are unchanged.

The isolated candidate gate failed for one reason.
Its manifest file SHA-256 differs from the committed gate fingerprint.

## Generated-artifact verification

I regenerated the chain in an isolated temporary tree.
The tree used `HEAD` plus only the current Docs inventory.
The builders used the pinned local skill cache.

| Artifact | SHA-256 | Result |
| --- | --- | --- |
| `inventory/stellar-docs-titles.json` | `9494de6789fc509ceab1056f8df49e4d4440484d0bd9cb5ccb41f30ce27478e2` | Current input |
| `inventory/stellar-light.json` | `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0` | Unchanged |
| `catalog/manifest.json` | `b613201846076e9fbaa70edfee4f506841c7cf690265e69c8d07afde567f6729` | Exact reproduction |
| `src/mcp/micro-map.ts` | `eda38f9d752dc28a300c4450dd6033349e7de21a17f620a7637f9e72d9f4a77f` | Exact reproduction; unchanged |
| `eval/plan/op-classes.json` | `4cda9783f098c9e55cfb399ad3d1c77ced8acf3f81f37d6170b1d82048b196bb` | Exact reproduction; unchanged |
| `eval/routing-cases.json` | `9e863cedc1f1754f67b3955bfe744254da6ae0d069502aefc7964530493fafd3` | Exact reproduction; unchanged |

The catalog builder reported canonical manifest SHA-256 `0b1c978b026d342cad886c94bd322704eba023d2bc75d0566dd5612b2c97c00c`.
This canonical hash intentionally differs from the gate's file hash.

The current super-spec also reproduces from the current builder.
Its file SHA-256 is `93799e8c9e5c9045b1f2352d2611c1741d2d2458e12712de81da878a33147538`.

The Docs drift changes only two super-spec timestamps under the current generator.
The larger super-spec diff belongs to the separate compaction work.

The evidence in `drift-terra.md` is otherwise consistent with these checks.
Its claim about unchanged scores needs the five-score qualification above.

## Permitted edits

The Docs drift may contain these edits only.

1. Update `inventory/stellar-docs-titles.json` with the recorded refresh output.
2. Rebuild `catalog/manifest.json` with `node scripts/build-catalog.mjs`.
3. Rebuild `specs/super-spec.json` with `npm run spec:build`.
4. Update the manifest input fingerprint in `eval/gates.json` to `b613201846076e9fbaa70edfee4f506841c7cf690265e69c8d07afde567f6729`.
5. Update `baselinedAt` to the clean gate run time.
6. Update `evidence.localTrace` to that clean gate result filename.
7. Replace the gate note with the exact decision text below.

```text
2026-09-03 Stellar Docs title refresh: the title inventory added only /docs/tokens/usdt0-layerzero, titled USDT0 Transfers with LayerZero. The generated asset-token Docs entry gained the derived keywords usdt0, layer, and zero. Ordered top-five route IDs and all committed gate totals remain unchanged across the same inputs. Only the catalog manifest evidence fingerprint changes. Scout remains OpenAPI 1.9.1. Decision record: .agents/rounds/2026-09-03-truth-maintenance/docs-drift-review-sol.md.
```

Keep every numeric gate value unchanged.
Keep the other three evidence input hashes unchanged.
Do not update protocol-history source pins in this mechanical rebaseline.

Do not include Scout, vector, corpus, adapter, scorer, or exposure changes.
Do not include the super-spec compaction implementation under this drift decision.

## Required clean tests

Run these commands from the final clean worktree.

```sh
node scripts/build-catalog.mjs
npm run micro-map:build
npm run spec:build
node eval/plan/build-op-classes.mjs
npm run eval:compile
npm run eval:routing -- --gate
npm run typecheck
npm test
npm run build
npm run secrets:scan -- --tree
git diff --check
```

The routing gate must pass after the fingerprint update.
The generated file hashes must match the table above.
The current final generator must reproduce the selected super-spec hash.

I also ran the focused catalog suite in the isolated Docs-only tree.
All 146 tests passed across five files.

```sh
npm test -- test/catalog-guards.test.mjs test/catalog.test.ts test/search-resolution.test.ts test/search.test.ts test/spec-sandbox.test.ts
```

PASS-REBASE-MANIFEST
