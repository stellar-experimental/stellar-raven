# Stellar Docs title drift assessment

Date: 2026-09-16

## Result

The Stellar Docs title count changed from 650 to 651.

The source added one page:

- Path: `/docs/data/analytics/public-dashboards`
- Title: `Public Dashboards`

No title was removed. No existing title changed.

The verdict is a mechanical source refresh with routing review. It requires no policy change.

The title adds routing vocabulary to one existing Docs operation. Therefore, the change is not provenance-only.

The change adds no operation, schema, exposure, runner, threshold, label, or count contract.

## Scope and isolation

The assessment used this owned worktree:

`/tmp/raven-execution-2026-09-16/docs-title-drift`

Its base is accepted PR157 commit `cd87615f8e3f2d9dda2d8b2765acb80c711b7915`.

The accepted worktree remained clean at that commit:

`/tmp/raven-execution-2026-09-16/pr157-integrated`

The current shell had no Herdr control session. No collaboration agent named `rv-drift-fix` was visible.

I therefore enforced coordination through strict filesystem ownership. I did not modify either drift worktree:

- `/tmp/raven-execution-2026-09-16/drift`
- `/tmp/raven-execution-2026-09-16/drift-combined`

Those worktrees retain their existing owner changes. This report does not assess those changes.

No paid work, commit, push, deployment, staging, or production mutation occurred.

## Live source truth

The accepted title snapshot had these values:

- Total: `650`
- `fetchedAt`: `2026-09-03T17:09:55.410Z`
- SHA-256: `9494de6789fc509ceab1056f8df49e4d4440484d0bd9cb5ccb41f30ce27478e2`

The original drift snapshot had these values:

- Total: `651`
- `fetchedAt`: `2026-09-16T18:10:51.011Z`
- SHA-256: `a2d5ce925dd06d750b5bce3b8737419df7be486e503a7b3882ac0fd0f017c7c4`
- Path: `/private/tmp/stellar-raven-drift-0916.mOmBFJ/repo/inventory/stellar-docs-titles.json`

The current live refresh had these values:

- Total: `651`
- `fetchedAt`: `2026-09-16T20:51:36.112Z`
- SHA-256: `2753de9e9ece6e6e89c61ca51cc826d688e938d9d8dae777e3a87bb5d32b9ee5`

The original and current snapshots have this normalized SHA-256 after removing `fetchedAt`:

`a8120f9f795e35d53a88a9f11523c732f6e919eed7978bdcc939468712ac3b21`

Thus, the original snapshot matches the current live source content exactly.

The live index settings remained unchanged. Their file SHA-256 is:

`12f4a55e95d3819fa60e916d4e1aa6db427f096aedcff5503797363607cb754f`

The official rendered page returned HTTP 200 with this canonical URL:

`https://developers.stellar.org/docs/data/analytics/public-dashboards`

The rendered page has the heading `Public Dashboards`.

The captured HTML has SHA-256 `280663725357b44a848fb3fdc617def9c2ec96db2f245e351464c85df84c82f8`.

The page links to this official edit source:

`https://github.com/stellar/stellar-docs/edit/main/docs/data/analytics/public-dashboards.mdx`

The captured source has SHA-256 `a6b2eff8bec4bf59d8b7bc58df0ffa78462341787f9c30cd080ee88479cb341e`.

Its frontmatter title is `Public Dashboards`.

The source describes free public dashboards for network activity, assets, stablecoins, and DeFi.

The source entered `stellar/stellar-docs` in this commit:

- Commit: `ff58a1c8fd8c6c37f2258f48aeb22b5303e4341a`
- Date: `2026-09-11T14:44:16Z`
- Subject: `docs: add Public Dashboards page to Analytics (#2839)`

These independent sources confirm the added title.

## Generated artifact impact

The refresh changed only these tracked files:

- `inventory/stellar-docs-titles.json`
- `catalog/manifest.json`
- `specs/super-spec.json`

The complete unstaged diff has SHA-256:

`584a7aeecb7426ea1367aeea9773cc399aaf716a040c2dc3fc8d34833c7b5259`

The accepted and refreshed artifact hashes are:

| Artifact | Accepted PR157 | Refreshed candidate |
|---|---|---|
| `inventory/stellar-docs-titles.json` | `9494de6789fc509ceab1056f8df49e4d4440484d0bd9cb5ccb41f30ce27478e2` | `2753de9e9ece6e6e89c61ca51cc826d688e938d9d8dae777e3a87bb5d32b9ee5` |
| `catalog/manifest.json` | `0cff03fd280a25b53cce9cb3ce579f5ec72b5a7f7a7dff4ca977ba4681831869` | `d427224ade022bd1b43c28803e2ee02625cb921dcdce3ddc1882ad67bc83054b` |
| `specs/super-spec.json` | `fe0c4c63d76f42c5400a9d4cd4e8875600241dd8c28fe419f15349da358df7d3` | `7eac29acdd16bc41756ab99ce24862d169ba2e1cdfa6ed5fc9d9efdee4b40201` |

The catalog retains 282 entries. The ordered entry-ID list remains byte-identical.

Only `stellarDocs.search_rpc_horizon_data_docs` changed as a catalog entry.

Its keyword count changed from 88 to 90. The added keywords are `public` and `dashboards`.

Its canonical object hash changed as follows:

- Accepted: `f3d985255c9b51548c9ebfebdd8de25b44f538de7a87743cc13480084d8f843a`
- Refreshed: `05a1b32813cd9c9d8f4ab84bce8536abd4c9d12a18bf6185a116ca7c89e37f3e`

The operation receives these keywords because its filter includes `/docs/data`.

The super-spec changed only its generation timestamps. Its paths and components remain identical.

The canonical paths hash stayed `8acae1b949670234707766a34a77084093045981a1cb43e32687f196dd489d37`.

The canonical components hash stayed `f64cab7a101d98ac8e52030ee6f3760c82d2563324ce4feea76d96c14957394b`.

These generated artifacts remained unchanged:

- `eval/plan/op-classes.json`: `4cda9783f098c9e55cfb399ad3d1c77ced8acf3f81f37d6170b1d82048b196bb`
- `src/mcp/micro-map.ts`: `bb4aefc536d485379badd0f339d817c4b1e11fb57d820d7fc6301d0b1f419bbf`

No active golden case or improvement finding requires a change for this page.

## Routing comparison

The accepted PR157 ranked dump is:

`/tmp/raven-execution-2026-09-16/pr157-final-metadata-ranked.json`

The refreshed ranked dump is:

`/tmp/raven-execution-2026-09-16/docs-title-drift-ranked.json`

The accepted result file has SHA-256:

`a5e7d13fe7dc6424630cfb68089bc690feca650ada7eed6876f6bf456ec6683a`

Its path is:

`/tmp/raven-execution-2026-09-16/pr157-integrated/eval/results/routing-2026-09-16T20-37-40-896Z.json`

The refreshed result file has SHA-256:

`38b44eeef8757a73eb5e35a0d9c028fa97737531f1ffb9457d588006e72f818b`

Its path is:

`/tmp/raven-execution-2026-09-16/docs-title-drift/eval/results/routing-2026-09-16T20-53-51-227Z.json`

Both 495-row dumps have this SHA-256:

`4e2ece4a33fd1d35706dd5ace182536a5496649820be58eae72669da7d1a1765`

The 49 holdout rows also had identical top hits, scores, ranks, captures, and pass values.

Therefore, the complete 544-row comparison has zero routing movements.

The current measured totals remain:

- Legacy: `213/280/314` of `338`
- Extended: `90/111/116` of `122`
- Skills: `16/23/23`
- Holdout: `10/22/27`, with `11` forbidden captures

These measurements do not change the accepted baseline metadata.

The routing command reported only the expected manifest evidence mismatch.

This assessment did not update the fingerprint or any numerical gate.

Fresh queries showed the intended vocabulary effect:

| Query | Accepted PR157 | Refreshed candidate |
|---|---|---|
| `public dashboards` | Target absent from top five | Target rank 1, score 38 |
| `Stellar public dashboards` | Target absent from top five | Target rank 2, score 69 |
| `analytics dashboards for Stellar` | Target absent from top five | Target rank 1 |
| `dashboard for Horizon API activity` | Target rank 1 | Target rank 1 |
| `build an admin dashboard UI in React` | Target absent from top five | Target absent from top five |
| `public company earnings dashboard` | Target absent from top five | Target absent from top five |

The added vocabulary improves exact subject discovery. It does not capture the tested unrelated dashboard queries.

## Verification

The refresh used existing host credentials. No credential value entered command output.

The principal commands were:

```text
node --env-file=/Users/kalepail/Desktop/stellar-raven-codemode/.env scripts/refresh-inventory.mjs --service stellar-docs
node scripts/build-catalog.mjs
npm run micro-map:build
npm run spec:build
node eval/plan/build-op-classes.mjs
npm run eval:routing -- --dump-ranked /tmp/raven-execution-2026-09-16/docs-title-drift-ranked.json
npm run typegen
npm run typecheck
npm test
WRANGLER_LOG_PATH=/tmp/raven-execution-2026-09-16/docs-title-build.log npm run build
npm run secrets:scan -- --tree
git diff --check
```

Results:

- Type generation passed with a placeholder `.dev.vars`.
- Typecheck passed.
- Unit tests passed: 117 files and 2,087 tests.
- The dry-run build passed.
- The secret scan passed. No staged commit payload existed.
- `git diff --check` passed.
- Smoke tests were not required because no executor or demo file changed.

The first network attempts failed inside the restricted sandbox. Authorized network retries passed.

## Verdict and required combined sequence

The Docs title drift is mechanical. It does not require a policy decision.

The source is current, public, official, and independently corroborated.

The generated catalog change is limited to two relevant keywords on one existing operation.

The accepted 544-row routing behavior remains unchanged. Fresh discovery improves for the new page subject.

For the final combined `#141` candidate:

1. Apply this title snapshot after the accepted PR157 commit.
2. Regenerate the catalog and super-spec from the source.
3. Keep all thresholds, labels, counts, and accepted totals unchanged.
4. Review the final combined diff independently.
5. Update only the required catalog evidence fingerprint after that review.
6. Keep Scout and skill-pin acceptance in their separate gates.

This assessment does not authorize acceptance, commit, push, deployment, or issue closure.
