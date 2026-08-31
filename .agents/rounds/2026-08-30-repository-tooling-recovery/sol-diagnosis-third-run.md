# Third live repository-recovery collection diagnosis

## Verdict

The collection is valid, complete, comparable, and correctly reviewed.

The receipt handoff is the primary defect.
It names the recovery operation but omits its exact input contract.
It also omits a copyable top-level `execute` input.

The model guessed three incompatible argument shapes.
It also placed receipts inside sandbox code or service arguments.

The host does not consume a receipt when argument validation fails.
The host does consume a receipt after valid arguments pass the guard.
This includes valid calls that return no answer.

The smallest repair is a manifest-derived receipt handoff.
The handoff must include the exact callable signature and a top-level example.
It must also identify the current Horizon and Go SDK repositories.

Do not change the frozen cases, annotations, reviewed artifact, grader, or receipt state algorithm.

## Evidence identity

- Revision: `d23766db4ccd41eab5e6f232ac8aca6803030791`
- Surface: `8a2232842f10d28f985881c93dbc1760e1aa15365be3f7162cf682e2e219769b`
- Canonical collection SHA-256: `88b70743cb1b74e7e40d7b1810799c86f47b48fb4295b34b62ff4111e865898c`
- Collection file SHA-256: `a325559c9f4d3eb47c1d4ceba2252e06700cfc41ce5a6d87f234ad3068a3b457`
- Review packet file SHA-256: `bd806eb8d2d018112cc22271e3bf27e1c6661079f04ddd3fd2e93186b01030b1`
- Annotation file SHA-256: `aedbccf432352b7003cf94ad93ea86b6c5d6eb2208355faa7987bc42f35a5df4`
- Canonical annotation SHA-256: `29ccb06c06f47417ad069bf6dde2c50294aabcf39b7749f24fd07b896363f6d1`
- Reviewed file SHA-256: `e3af5bc1386f2eb8533052546c68cc6308cc253be2d9abf8d025262903bc4704`
- Reported cost: `$6.5671102`
- Paid calls: `20`
- Retries: `0`

The packet, annotations, and reviewed artifact reference the same canonical collection SHA-256.
All four artifacts contain 20 rows.
The deterministic join passes its integrity checks.

## Reproduction loop

This command is the red, deterministic, stored-evidence loop:

```sh
npm run eval:repo-recovery:grade -- \
  eval/repo-recovery/results/repository-tooling-recovery-v1-reviewed.json --gate
```

It exits with status 1.
It reports these exact results:

- Positive sequence passes: `0/12`
- Required positive passes: `10/12`
- Negative premature detours: `0/8`
- Correct answers: `13/20`
- Grounded answers: `19/20`
- Projection errors: `0`
- Identity and review integrity: `PASS`

The focused current tests also pass:

```text
npx vitest run test/recovery-receipt.test.ts test/executor-providers.test.ts \
  test/repo-recovery.test.mjs test/repo-recovery-artifact.test.mjs

4 files passed, 107 tests passed
```

These tests confirm the implemented contract.
They do not test the missing model-facing handoff.

## Failure partition

The sequence failures have a complete partition.

- Nine positives contain repeated `scout.explainRepo` syntax projections.
- Two positives contain no `scout.explainRepo` projection.
- One positive contains one call with the wrong repository.

Eight positives first used arguments missing the required `q` field.
Those calls returned `invalid arguments ... no call was made`.

Two positives misplaced receipts.
They made four misplaced attempts in total.

Seven positives failed answer review.
Only `rr-pos-js-rpc-durability-values` also failed grounding review.

All eight negatives avoided `scout.explainRepo`.
All eight negative answers were correct and grounded.

## Positive trace review

### 1. `rr-pos-go-sdk-trade-resolutions`

- Initial authority: `stellarDocs.search_sdk_cli_tools_docs`, adjacent, execute 4.
- First recovery: `{ owner, name, query }` with a top-level receipt.
- Host result: missing `q`; no adapter call; no receipt consumption.
- Later recovery: `{ repo: "stellar/go", q }` with a fresh receipt.
- Sequence defect: two projected calls and the wrong frozen repository.
- Answer review: correct and grounded.
- Answer source: the archived `stellar/go` repository.

The expected repository is `stellar/go-stellar-sdk`.

### 2. `rr-pos-go-sdk-query-enums`

- Initial authority: `stellarDocs.search_sdk_cli_tools_docs`, adjacent, execute 4.
- First recovery: `{ owner, name, query }` with a top-level receipt.
- Host result: missing `q`; no adapter call; no receipt consumption.
- Second recovery: `{ owner, name, q }` with the same receipt.
- Host result: schema-valid, consumed receipt, unpinned upstream call.
- Upstream result: `answered: false` with `repo: null`.
- Sequence defect: two projected calls and no exact repository pin.
- Answer review: incorrect but grounded.

The validator accepts `owner` and `name` because the schema permits extra properties.

### 3. `rr-pos-js-rpc-sleep-strategies`

- Initial authority: `stellarDocs.search_sdk_cli_tools_docs`, adjacent, execute 4.
- First recovery: `{ repo, question }` with a top-level receipt.
- Host result: missing `q`; no adapter call; no receipt consumption.
- Second recovery: `{ repo, q }` with the same receipt.
- Upstream result: answered from `stellar/js-stellar-sdk`.
- Sequence defect: two projected calls.
- Answer review: correct and grounded.

This trace proves that an invalid-argument call does not burn its receipt.

### 4. `rr-pos-go-sdk-default-horizon-clients`

- Initial authority: `stellarDocs.search_sdk_cli_tools_docs`, adjacent, execute 6.
- First recovery: `{ owner, name, question }` with a top-level receipt.
- Host result: missing `q`; no adapter call; no receipt consumption.
- Second recovery: `{ repo: "stellar/go", q }` with the same receipt.
- Third recovery: another `{ repo: "stellar/go", q }` with a new receipt.
- Sequence defect: three projected calls and the wrong frozen repository.
- Answer review: correct and grounded.

The model reran Docs to obtain the third receipt.
The expected repository is `stellar/go-stellar-sdk`.

### 5. `rr-pos-env-host-depth-limit`

- Initial authority: `stellarDocs.search_soroban_contract_docs`, empty, execute 4.
- First recovery: `{ owner, name, query }` with a top-level receipt.
- Host result: missing `q`; no adapter call; no receipt consumption.
- Second recovery: `{ q }` without a top-level receipt.
- Host result: blocked before the adapter.
- Third recovery: `{ q }` with a fresh top-level receipt.
- Upstream result: auto-routed to `blend-capital/blend-contracts`.
- Sequence defect: three projected calls and no repository pin.
- Answer review: incorrect but grounded.

The expected repository is `stellar/rs-soroban-env`.

### 6. `rr-pos-js-rpc-durability-values`

- Initial authority: `stellarDocs.search_sdk_cli_tools_docs`, adjacent, execute 4.
- Receipt blocks observed: five.
- Recovery calls observed: zero.
- Sequence defect: missing `scout.explainRepo`.
- Answer review: incorrect and ungrounded.

The answer confused the RPC string enum with `xdr.ContractDataDurability` constructors.

### 7. `rr-pos-cli-config-home-env`

- Ranked searches placed `stellarDocs.search_sdk_cli_tools_docs` first twice.
- The model used generic Docs search and page-section operations instead.
- Required initial authority observed: none.
- Receipt blocks observed: zero.
- Recovery calls observed: zero.
- Sequence defect: missing initial authority and missing recovery.
- Answer review: incorrect but grounded.

The answer omitted `STELLAR_CONFIG_HOME` priority and local ancestor traversal.

### 8. `rr-pos-cli-stellar-soroban-dir-precedence`

- Initial authority: `stellarDocs.search_sdk_cli_tools_docs`, adjacent, execute 2.
- First recovery placed the receipt inside service arguments.
- That call also used `{ owner, name, question }`.
- Host result: missing `q`; no receipt consumption.
- Two later calls used `{ repo, q, recoveryReceipt }` inside service arguments.
- Host result: both lacked a top-level receipt and were blocked.
- Final recovery used `{ repo, q }` with a top-level receipt.
- Upstream result: answered from `stellar/stellar-cli`.
- Sequence defect: four projected calls.
- Answer review: correct and grounded.

The plain receipt instruction did not prevent placement errors.

### 9. `rr-pos-js-rpc-insecure-http-guard`

- Initial authority: `stellarDocs.search_sdk_cli_tools_docs`, empty, execute 8.
- First recovery used `{ owner, name, question }`.
- Host result: missing `q`; no adapter call; no receipt consumption.
- Later recovery used `{ repo, q }` with a fresh receipt.
- Upstream result: answered from `stellar/js-stellar-sdk`.
- Sequence defect: two projected calls.
- Answer review: correct and grounded.

### 10. `rr-pos-go-sdk-timebound-factories`

- Initial authority: `stellarDocs.search_sdk_cli_tools_docs`, adjacent, execute 2.
- First recovery passed the receipt as a second service-call argument.
- Host result: no top-level receipt; adapter blocked.
- Second recovery used `{ owner, name, q }` with the same top-level receipt.
- Host result: receipt consumed by an unpinned call.
- Third recovery used `{ owner, name, q }` with another receipt.
- Upstream result: both valid calls returned no answer.
- Sequence defect: three projected calls, one placement error, and no repository pin.
- Answer review: incorrect but grounded.

The expected repository is `stellar/go-stellar-sdk`.

### 11. `rr-pos-horizon-max-supported-protocol`

- Initial authority: `stellarDocs.search_rpc_horizon_data_docs`, adjacent, execute 6.
- First recovery used `{ owner, name }` with a top-level receipt.
- Host result: missing `q`; no adapter call; no receipt consumption.
- The model then called `codemode.describe("scout.explainRepo")`.
- Second recovery reused the same receipt with `{ repo: "stellar/go", q }`.
- Upstream result: a stale archived answer with value 22.
- Sequence defect: two projected calls and the wrong frozen repository.
- Answer review: incorrect but grounded.

The expected repository is `stellar/stellar-horizon`.
The correct pinned value is 28.

### 12. `rr-pos-go-sdk-horizon-timeout`

- Initial authority: `stellarDocs.search_sdk_cli_tools_docs`, adjacent, execute 8.
- Recovery used `{ repo: "stellar/go", q }` with a top-level receipt.
- Recovery count: exactly one.
- Sequence defect: wrong frozen repository only.
- Answer review: incorrect but grounded.

The values matched the golden answer.
The answer failed because it used the archived repository.
The expected repository is `stellar/go-stellar-sdk`.

## Receipt consumption findings

`buildOpsFns` calls `guard(entry, args)` before the recovery branch.
Therefore, missing `q` returns before `consumeRecoveryReceipt` runs.

The stored traces confirm this order.
Four cases reused the same receipt after a hard argument failure.
The corrected call reached the adapter in each case.

The four cases are:

- `rr-pos-go-sdk-query-enums`
- `rr-pos-js-rpc-sleep-strategies`
- `rr-pos-go-sdk-default-horizon-clients`
- `rr-pos-horizon-max-supported-protocol`

A valid argument object changes the result.
The host consumes the receipt before adapter dispatch.
An upstream `answered: false` result does not restore it.

Misplaced receipts are not consumed.
The host cannot see a receipt inside sandbox code or service arguments.

The collector still projects invalid service-call syntax as an operation.
It parses the model code without using runtime outcomes.
Therefore, a corrected retry still fails the frozen one-call sequence.

Do not weaken this grader rule for the repair.
Prevent the first malformed call at the model-facing boundary.

## Signature availability

The exact signature exists before a valid recovery dispatch.
It is available through these paths:

- `codemode.describe("scout.explainRepo")`
- `codemode.catalog(...)`
- `codemode.spec()`
- Exact recovery discovery with `recoverFrom`

Ordinary ranked search intentionally excludes `scout.explainRepo`.
Therefore, its signature is absent from ordinary ranked hits.

The receipt block exposes only the operation ID and receipt placement prose.
It does not expose `q`, `repo`, or a complete `execute` input.

Five positive rows eventually called `codemode.describe`.
Most calls happened only after an argument or placement failure.

The guard hint says the schema is in the operation's search hit.
That statement is misleading for ordinary recovery-only discovery.

Technical availability is not sufficient here.
The callable contract must appear at the receipt handoff.

## Root cause

The host creates a capability without colocating its usage contract.

The current handoff says these facts:

- the target ID;
- the one-use rule;
- the expiry;
- the top-level field name.

It omits these facts:

- required argument `q`;
- optional pin `repo`;
- the `owner/name` string shape;
- the complete `execute` input envelope;
- the current Horizon repository;
- the current Go SDK repository.

The upstream Scout description also contains stale `Horizon/go` wording.
That wording encouraged the archived `stellar/go` pin.

## Smallest general repair

Change the one canonical receipt handoff.
Do not add more repeated prose to every broad instruction surface.

The rendered block must include these items:

1. The compact manifest-derived `scout.explainRepo` signature.
2. A copyable top-level `execute` input.
3. The actual signed receipt in the top-level `recoveryReceipt` field.
4. A current repository identity note from the catalog description.
5. One instruction to place the full remaining code question in `q`.

The example should have this exact structure:

```jsonc
{
  "code": "async () => scout.explainRepo({ q: \"<deep code question>\", repo: \"<current owner/name>\" })",
  "recoveryReceipt": "<signed host receipt>"
}
```

The signature must show this input contract:

```ts
type ExplainRepoInput = {
  q: string;
  repo?: string;
}
```

The catalog description must identify these current repositories:

- Horizon: `stellar/stellar-horizon`
- Go SDK: `stellar/go-stellar-sdk`

It must identify `stellar/go` as archived historical source.

This repair is operation-level, not question-level.
It contains no frozen case IDs, phrases, values, or answers.

The repair addresses all observed mechanism classes.
It prevents `query` and `question` substitutions for `q`.
It prevents `owner` and `name` substitutions for `repo`.
It prevents receipt placement inside code or service arguments.
It makes the recovery call salient when the receipt appears.
It also removes the stale repository identity cue.

The frozen threshold tolerates two residual misses.
The third run contains one initial-authority omission and one valid repeated deepening call.
The repair can satisfy the contract without changing those cases.

## Exact implementation files

### Product source

1. `src/policy/recovery-receipt.ts`
   - Make `recoveryReceiptBlock` accept the catalog or a resolved target contract.
   - Render the compact target signature from the manifest entry.
   - Render the copyable top-level `execute` input.
   - Keep receipt text out of logs and telemetry.

2. `src/mcp/tools.ts`
   - Pass the loaded catalog to `recoveryReceiptBlock`.
   - Keep this block after the evidence checkpoint.

3. `src/demo/tools.ts`
   - Pass the same catalog to `recoveryReceiptBlock`.
   - Preserve MCP and playground parity.

4. `scripts/description-notes.mjs`
   - Correct the `scout.explainRepo` repository identity note.
   - Name the current Horizon and Go SDK repositories.
   - Mark `stellar/go` as archived historical source.

5. `src/policy/guard.ts`
   - Give recovery-only operations an accurate invalid-argument hint.
   - Point to `codemode.describe("scout.explainRepo")`.
   - State that argument rejection does not consume the receipt.

### Generated files

Regenerate these files through their owning scripts:

- `catalog/manifest.json`
- `specs/super-spec.json`
- `src/mcp/micro-map.ts`, if its generator changes output

Use these commands:

```sh
node scripts/build-catalog.mjs
npm run spec:build
npm run micro-map:build
```

Do not edit generated files by hand.

### Durable documentation

6. `eval/repo-recovery/README.md`
   - State that argument validation happens before receipt consumption.
   - State that the receipt block carries the exact callable contract.

7. `research/decisions/0009-recovery-only-discovery-receipts.md`
   - Clarify the order as guard, consume, then adapter dispatch.
   - Do not add run history or third-collection narrative.

The ADR update is small but valuable.
It prevents future receipt-consumption ambiguity.

## Exact tests

### Unit tests

1. `test/recovery-receipt.test.ts`
   - Assert the block contains `q: string` and `repo?: string`.
   - Assert the block contains the exact callable line.
   - Assert the example has sibling `code` and `recoveryReceipt` fields.
   - Assert the receipt does not appear inside service arguments.
   - Assert an unknown recovery target fails closed.

2. `test/executor-providers.test.ts`
   - Issue one receipt.
   - Call `scout.explainRepo` without `q`.
   - Retry with `{ q, repo }` and the same receipt.
   - Assert one adapter fetch and one consumption event.
   - Assert the first rejection emitted no consumption event.

3. `test/server.test.ts`
   - Assert the MCP receipt block contains the signature and top-level example.
   - Assert the actual receipt appears only in the top-level field.

4. `test/smoke/demo-tools.test.ts`
   - Assert the playground renders the same receipt handoff.
   - Assert the current repository identity note is present.

5. `test/smoke/executor.test.ts`
   - Exercise the generated example through a real Dynamic Worker.
   - Assert one later adapter call succeeds.
   - Assert replay fails.

6. `test/catalog.test.ts`
   - Assert the recovery-only description names both current repositories.
   - Assert the description marks `stellar/go` as archived.

### Focused commands

```sh
npx vitest run \
  test/recovery-receipt.test.ts \
  test/executor-providers.test.ts \
  test/server.test.ts \
  test/catalog.test.ts \
  test/smoke/executor.test.ts \
  test/smoke/demo-tools.test.ts
```

## Required free gates

Run these gates before any paid collection:

```sh
npm run eval:repo-recovery:lint
npm run eval:repo-recovery -- --gate
npm run eval:routing -- --gate
npm run typecheck
npm test
npm run build
npm run test:smoke
npm run secrets:scan -- --tree
git diff --check
```

The routing gate is required because the catalog description changes.
The structural recovery gate must remain `12/12` eligible and `0/8` risks.

The focused receipt tests must pass before the broad suites.

## Live acceptance evidence

No live acceptance exists for the proposed repair.
The third collection measures the current incomplete handoff only.

After implementation, obtain separate authorization for one paid collection.
Use one clean revision for the runner and server.
Pin the revision, surface, Claude binary, process, and implementation hashes.

Before payment, run the existing zero-cost Docs readiness gate.
Also inspect one real receipt block through MCP.
That block must contain the signature and copyable top-level example.

The authorized collection must preserve these requirements:

- Frozen contract and ordered IDs unchanged.
- Exactly 20 completed rows.
- All operation traces retained.
- Every reported cost present.
- No transport retry unless the typed policy allows it.
- Independent high-effort annotation review.
- Deterministic join and integrity validation.

The reviewed live acceptance gate is:

- At least `10/12` positive passes.
- Exactly `0/8` negative premature detours.
- Zero operation projection errors.
- Every passing positive is correct and grounded.
- One later `scout.explainRepo` projection per passing positive.
- Exact frozen repository pin per passing positive.

The trace audit must also report these diagnostic counts:

- Hard invalid `scout.explainRepo` calls.
- Receipts placed outside the top-level input.
- Repeated recovery calls.
- Missing recovery calls.
- Wrong or absent repository pins.
- Correct and grounded answer counts.

Acceptance requires zero hard invalid calls in passing positives.
Acceptance also requires zero misplaced receipts in passing positives.

Record these identities in the round ledger:

- Canonical collection SHA-256.
- Collection file SHA-256.
- Review packet file SHA-256.
- Canonical annotation SHA-256.
- Annotation file SHA-256.
- Reviewed file SHA-256.
- Revision and surface SHA-256.
- Paid call count and total cost.

Deployment needs separate authorization after this gate passes.
After deployment, verify the pre-registered `0%` through `5%` operation-share band.

## Reviewability assessment

The current authority rule appears across several broad instruction surfaces.
Those surfaces already tell the model to use a later receipt.

More repeated prose would increase review cost without fixing the local omission.
The receipt block is the closest model-facing surface to the failure.

The manifest remains the callable contract owner.
The receipt block should render that contract instead of copying a second schema.

The repository identity correction belongs in one catalog note.
Generated artifacts should derive from that source.

Do not add case IDs, question fragments, golden values, or grader exceptions.
Do not change receipt cryptography, replay protection, or atomic R2 consumption.

## Actions not taken

No repository file changed.
No paid eval ran.
No service deployed.
No branch was pushed.
No pull request or merge occurred.

IMPLEMENTATION-READY
