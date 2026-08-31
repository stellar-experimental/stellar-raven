# Repository recovery contract card review

- Reviewer: Grok 4.6, high effort. Independent of the Sol diagnosis, the Fable plan, and the Terra implementation.
- Date: 2026-08-30
- Status: final
- Mode: audit only. No repository file changed.
- HEAD: `2b9a9c7325e8f31d7e48f780b06d5de7afedf305`
- Repair commit: `4e2bb6bfa381f2e2ce83a0971268c377697a9368`
- Ledger commit: `2b9a9c7325e8f31d7e48f780b06d5de7afedf305`
- Branch base: `014a4e7c8d428036e34a7883e46923eeb8d591b2`
- Tree: clean
- Inputs read: `AGENTS.md`, the audit-reviewability skill and rubric, `sol-diagnosis-third-run.md`, `fable-plan-third-run.md`, `/tmp/repo-recovery-contract-card-terra.md`, commits `4e2bb6b` and `2b9a9c7`, and the product, test, catalog, eval, and ledger files they touch.

## Verdict

The repair matches the approved plan.

The receipt block now carries the manifest contract.

The signed receipt appears once, inside a copyable execute JSON object.

Guard order, missing-receipt placement text, catalog identity, generated hashes, frozen corpus, and ledger identities check out.

The tests prove the live failure classes that this repair owns.

No blocking defect was found.

## Blocking findings

None.

## Residual risks (not blocking)

1. The JSON `code` template hard-codes `{ q, repo }`.
   The description and `renderSignature` output come from the catalog entry.
   The example arguments do not.
   The catalog has one `recovery-only` operation, `scout.explainRepo`.
   A later second recovery-only target would still render, and it would get the wrong example.
   The unknown-target throw only fires when the id is missing or is not an operation.

2. The playground smoke test is weaker than the MCP test.
   `test/smoke/demo-tools.test.ts` checks the header, the callable line, one token occurrence, and JSON keys.
   It does not check `example.recoveryReceipt` equality or the archived identity sentence.
   Both surfaces call `recoveryReceiptBlock(getCatalog(), ...)`.
   Product parity holds. The demo test would miss a demo-only field swap.

3. `test/policy.test.ts` names consumption behavior and only checks hint text.
   `guard()` never sees a receipt.
   `test/executor-providers.test.ts` is the real consumption-order proof.

4. `scout.explainRepo` still accepts extra properties.
   `{ owner, name, q }` can still pass the guard and consume a receipt.
   The plan kept the schema and the frozen cases unchanged.
   The contract card is the intended model-facing fix.

5. This review did not re-score routing, run the full unit suite, run secrets scan, or run a paid collection.

## Scope and spec

Audit mode. Fixed point `014a4e7` for the branch.

Deep review of `4e2bb6b` and `2b9a9c7`.

The spec is the Fable plan at `.agents/rounds/2026-08-30-repository-tooling-recovery/fable-plan-third-run.md`.

That plan accepted the Sol diagnosis and required three changes: manifest-derived rendering, one receipt inside the JSON example, and missing-receipt placement text.

The implementation matches those three changes.

Frozen cases, digests, grader, annotations, reviewed artifact, and receipt state algorithm were not edited.

## Focus area results

### Manifest-derived rendering

`recoveryReceiptBlock(catalog, grants)` resolves each grant target in the loaded catalog.

It throws if the entry is missing or is not an operation.

It throws if `renderSignature` returns empty.

It then prints, in order: header, `entry.description`, compact signature, `q`/`repo` instruction, placement instruction, JSON example.

A live render of the real catalog produced `type ExplainRepoInput`, `q: string`, `repo?: string`, and `scout.explainRepo(input: ExplainRepoInput)`.

The description in the block is the current manifest text, including the 2026-08-30 identity note.

Repository names are not hard-coded in `src/policy/recovery-receipt.ts`.

### Receipt secrecy and single occurrence

The signed receipt is not in the header.

It is not in the description or signature.

`JSON.stringify` places it only in `recoveryReceipt`.

`block.split(receipt)` has length 2 in the unit, MCP, demo, and Dynamic Worker tests.

Existing denial telemetry still logs `outcome` and `target` without receipt bytes.

The new renderer adds no log of the block.

The model-facing execute result still contains the receipt. That is the handoff.

### JSON example correctness

The last line of the isolated block is valid JSON.

Keys are exactly `code` and `recoveryReceipt`.

A render produced:

```json
{"code":"async () => scout.explainRepo({ q: \"<remaining code question>\", repo: \"<owner/name>\" })","recoveryReceipt":"signed-host-receipt"}
```

That object matches `executeInputSchema` in `src/mcp/tools.ts`.

The demo execute tool uses the same schema object and passes `args.recoveryReceipt` as the top-level runner field.

`test/smoke/executor.test.ts` parses that JSON, replaces the two placeholders, and runs `example.code` with `example.recoveryReceipt` on a real Dynamic Worker.

It asserts one Scout fetch, `ok: true`, and replay failure.

The example is executable as emitted, after placeholder replacement.

### Import cycles

`src/policy/recovery-receipt.ts` imports `renderSignature` from `src/catalog/search.ts`.

`src/catalog/**` does not import `recovery-receipt` or other policy modules.

Callers already imported both catalog load and the receipt module.

No cycle exists.

The worker already bundled `search.ts`. The new import does not add a new catalog graph.

### Unknown-target failure

A missing id throws `recovery receipt target ${id} is not an exposed operation`.

`test/recovery-receipt.test.ts` covers `scout.unknown`.

A present non-operation id takes the same branch and is untested.

Production issuance uses `recoveryTransitionsFromLedger`, which only selects recovery-only operations.

The throw is fail-closed, as the plan required.

If it fired in MCP execute, the Docs result would be lost. That is the accepted cost.

### MCP and demo parity

`src/mcp/tools.ts` and `src/demo/tools.ts` both pass `getCatalog()`.

`getCatalog()` loads `catalog/manifest.json` through `loadManifest`.

MCP renders the block only after a successful execute.

Demo does the same.

Both keep the block after the evidence checkpoint.

Demo may append a truncation advisory and logs after the block.

MCP may append logs after the block.

The JSON line is therefore not always the last line of a full execute result.

The model is told to copy the shape inside the receipt block, not the last line of the whole result.

Tests that parse the last line use empty logs. That is a test convenience.

### Argument-guard consumption order

`src/executor/providers.ts` still runs `guard(entry, args)` first.

A guard refusal returns before `consumeRecoveryReceipt`.

`test/executor-providers.test.ts` issues one receipt, calls `explainRepo({ repo })` without `q`, and asserts:

- hint contains `codemode.describe("scout.explainRepo")`
- hint contains `did not consume`
- zero fetches
- zero `recovery_receipt` events

The same receipt then succeeds with `{ q, repo }`.

That yields one fetch and one `outcome: "consumed"` event.

This is the live class where missing `q` did not burn the receipt.

### Missing-receipt guidance

The missing path in `providers.ts` now says to pass `recoveryReceipt` as the top-level execute field beside `code`.

The `failure()` map in `recovery-receipt.ts` is unchanged, as the plan required.

The misplaced-args case in `test/executor-providers.test.ts` puts `recoveryReceipt` inside the service argument object and omits the top-level field.

The host returns the new placement sentence and does not fetch.

### Catalog truth

`scripts/description-notes.mjs` is the source for the identity note.

`catalog/manifest.json` and `specs/super-spec.json` carry the rebuilt description.

The note keeps the `data.ok` sentence.

It marks `stellar/go` archived as of 2026-08-30.

It names `stellar/stellar-horizon` and `stellar/go-stellar-sdk`.

It states the general pin rule.

The upstream sentence still says `Horizon/go`. The note says that list is stale.

That pair is the plan, not a leftover error.

Keyword drops (`archived`, `questions`, `sdk`) match keyword extraction: those tokens now live in the description, so they are excluded from `keywords`.

`scout.explainRepo` remains `searchable: false` and `discoveryMode: "recovery-only"`.

`searchCatalog` skips that class, so keyword churn does not change ordinary ranking.

### Generated artifacts

Manifest SHA-256 is `6417a51391464e6de81ecbcd224de10b3d6acf55dc1c66a8a8a2430b7177a779`.

That value matches `eval/gates.json` and the ledger.

`src/mcp/micro-map.ts` did not change. It does not contain `explainRepo`.

`eval/routing-cases.json`, `eval/skills-cases.json`, and `eval/holdout-cases.json` hashes match `eval/gates.json`.

The repair did not hand-edit the micro-map.

### Routing evidence

Stored trace `eval/results/routing-2026-08-30T23-13-52-388Z.json` has `ranAt` `2026-08-30T23:13:52.388Z`.

That matches `eval/gates.json` `baselinedAt` and `localTrace`.

Trace totals: legacy 209/280/312, card@5 95/182, extended 90/109/117, skills 16/23/23, holdout 11/23/26 with 11 forbidden captures and 22 passes.

The trace `gate.pass` is false because it still compared the new manifest to the previous fingerprint `efd567d0…`.

`4e2bb6b` then wrote the new fingerprint and kept the same totals.

That is the correct re-baseline.

This review did not re-score routing.

### Ledger accuracy

`.agents/rounds/2026-08-30-repository-tooling-recovery.md` third-collection section matches the Sol identities.

Verified with Node `JSON.stringify` SHA-256:

| Identity | Recorded | Verified |
| --- | --- | --- |
| Collection file | `a325559c9f4d3eb47c1d4ceba2252e06700cfc41ce5a6d87f234ad3068a3b457` | `repository-tooling-recovery-v1-third-handoff-failed-collection.json` |
| Canonical collection | `88b70743cb1b74e7e40d7b1810799c86f47b48fb4295b34b62ff4111e865898c` | `JSON.stringify(collection)` and packet `collectionSha256` |
| Packet file | `bd806eb8d2d018112cc22271e3bf27e1c6661079f04ddd3fd2e93186b01030b1` | `…-review-packet.json` |
| Annotation file | `aedbccf432352b7003cf94ad93ea86b6c5d6eb2208355faa7987bc42f35a5df4` | `…-annotations.json` |
| Canonical annotation | `29ccb06c06f47417ad069bf6dde2c50294aabcf39b7749f24fd07b896363f6d1` | `JSON.stringify(annotations)` and reviewed `annotationsSha256` |
| Reviewed file | `e3af5bc1386f2eb8533052546c68cc6308cc253be2d9abf8d025262903bc4704` | `…-reviewed.json` |
| Manifest | `6417a51391464e6de81ecbcd224de10b3d6acf55dc1c66a8a8a2430b7177a779` | `catalog/manifest.json` |

Surface SHA, cost `$6.5671102`, 20 calls, 0 retries, and gate `0/12`, `0/8`, `13/20`, `19/20` match the Sol diagnosis.

Repair revision in the ledger is `4e2bb6b`. That is the product commit, not the later ledger commit.

### Frozen corpus integrity

`eval/repo-recovery/cases.json` last changed in `ffd5ba6`.

`eval/repo-recovery/contract.mjs` last changed in `d37d749`.

`4e2bb6b` changed only `eval/repo-recovery/README.md` under that tree.

Frozen digest still equals `sha256(JSON.stringify(cases))=5dee41663f80bde85328e624a02f6fd8f21f2d39a93bac04ef028c1265195534`.

Ordered-id digest still equals `sha256(ids.join("\\n"))=1883592ca7b52ac06cc40881efa49e4b84b2054875aee459be2245f71372115f`.

`npm run eval:repo-recovery:lint` passed: 12 positive, 8 negative.

`npm run eval:repo-recovery -- --gate` passed: 12/12 eligible, 0/8 premature rank risks.

Third-run artifacts still have 20 rows and join on canonical collection `88b70743…`.

### Tests versus live failure classes

| Live class | Proof | Result |
| --- | --- | --- |
| Missing `q` / guessed `query`/`question` | Guard hint plus `q: string` in the card; providers retry with the same receipt | Proved |
| `{ owner, name }` instead of `repo` | Card shows `repo?: string` and `repo: "<owner/name>"`; schema still allows extra keys | Model-facing proved; schema unchanged on purpose |
| Receipt inside service arguments | Providers test with `recoveryReceipt` in args and no top-level field | Proved |
| Receipt as a second positional argument or inside script | Same missing top-level path; one-occurrence JSON test proves the example does not put the token in `code` | Proved for the emitted example; positional form shares the missing path |
| Stale `stellar/go` pin | Catalog note plus MCP test for `stellar/go is archived` | Proved |
| Recovery-only search-hit hint | Guard now names `codemode.describe(id)` and non-consumption | Proved |
| Unknown target render | Unit throw test | Proved for a missing id |
| Example not callable | Dynamic Worker smoke: parse, replace, run, replay | Proved |
| MCP/demo split | Both surfaces render the block from `getCatalog()` | Proved, with a weaker demo assertion |

The tests check behavior at the public boundaries, not only source-string mirrors.

## Full branch from `014a4e7`

The branch adds the recovery contract, collector, receipts, and three live collections.

This review did not re-open every earlier commit in the same depth.

For the named focus areas, the branch still holds:

- Frozen cases and contract digests are unchanged after `d37d749`.
- Third-run artifacts are present and hash-stable.
- The repair at `4e2bb6b` is the handoff fix. It does not retune goldens or the grader.
- `2b9a9c7` only records that repair in the round ledger.

## Verification run in this review

```text
npx vitest run test/recovery-receipt.test.ts test/executor-providers.test.ts \
  test/policy.test.ts test/server.test.ts test/catalog.test.ts
# 5 files, 241 tests passed

npx vitest run --config test/smoke/vitest.config.ts \
  test/smoke/demo-tools.test.ts test/smoke/executor.test.ts
# 2 files, 61 tests passed

npm run typecheck
# exit 0

npm run eval:repo-recovery:lint
# PASS, frozen repository-tooling-recovery-v1

npm run eval:repo-recovery -- --gate
# pass true, 12/12 eligible, 0/8 risks

git diff --check 014a4e7..HEAD
# clean
```

Independent Node SHA-256 checks confirmed the ledger identities listed above.

A direct `recoveryReceiptBlock` render confirmed one receipt, valid JSON, and the identity note.

These focused counts match the Terra card.

This review did not run `npm test`, full `npm run test:smoke`, `npm run build`, `npm run eval:routing -- --gate`, or `npm run secrets:scan -- --tree`.

## Reviewability

The product diff is small and local.

Generated catalog and spec output follows `scripts/description-notes.mjs`.

Round notes belong in `.agents/rounds/`.

ARCHITECTURE, ADR-0009, and `eval/repo-recovery/README.md` describe present dispatch order.

No session narrative was left in product source.

## Actions not taken

No repository file changed.

No paid eval ran.

No service deployed.

No branch was pushed.

No pull request or merge occurred.

PASS
