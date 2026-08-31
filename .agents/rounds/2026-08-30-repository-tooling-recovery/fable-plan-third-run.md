# Third-run receipt handoff repair: product and API review and implementation plan

- Reviewer: Claude Fable 5, high effort. Independent of the Sol diagnosis author and of every commit author on `next/repo-tooling-recovery`.
- Date: 2026-08-30
- Revision reviewed: `d23766db4ccd41eab5e6f232ac8aca6803030791` (clean tree)
- Inputs read: `AGENTS.md`, `/tmp/repo-recovery-third-run-diagnosis-sol.md`, the stable review packet
  `eval/repo-recovery/results/repository-tooling-recovery-v1-review-packet.json`
  (SHA-256 `bd806eb8d2d018112cc22271e3bf27e1c6661079f04ddd3fd2e93186b01030b1`, verified locally), the reviewed artifact
  (SHA-256 `e3af5bc1386f2eb8533052546c68cc6308cc253be2d9abf8d025262903bc4704`, verified locally),
  `src/policy/recovery-receipt.ts`, `src/executor/providers.ts`, `src/executor/run.ts`, `src/policy/guard.ts`,
  `src/mcp/tools.ts`, `src/demo/tools.ts`, `src/catalog/search.ts`, `scripts/description-notes.mjs`,
  `scripts/build-catalog.mjs`, the `scout.explainRepo` manifest entry, `eval/repo-recovery/contract.mjs`,
  `eval/repo-recovery/cases.json`, `eval/repo-recovery/README.md`, `research/decisions/0009-recovery-only-discovery-receipts.md`,
  `ARCHITECTURE.md` §Recovery-only operation receipts, the round ledger, and the existing receipt tests.
- Mode: review and plan only. No repository file changed. No paid eval, deploy, push, or merge ran.

## 1. Verdict summary

The Sol diagnosis is correct on mechanism. I confirmed every claim I could check against the stored packet:

- Guard order. `src/executor/providers.ts:455-470` runs `guard(entry, args)` and returns before the recovery branch at
  `:471`. A missing `q` therefore never reaches `consumeRecoveryReceipt`. The packet shows the same receipt accepted after
  a hard rejection in four cases.
- Argument shapes. The packet shows `{ owner, name, question }`, `{ owner, name, query }`, `{ repo, question }`, and
  `{ owner, name, q }`. The schema permits extra properties, so `{ owner, name, q }` passed the guard, consumed the receipt,
  and auto-routed to `repo: null` (`rr-pos-go-sdk-timebound-factories`).
- Receipt placement. Two cases put `recoveryReceipt` inside the service argument object; one case passed it as a second
  positional argument. The host cannot see either. The refusal text says only "a recovery receipt is required".
- Repository identity. Five cases pinned `stellar/go`. Scout returned `repoMeta.isArchived: true` and
  `lastCommitAt: 2025-12-10` for that pin. Docs outputs in all 12 positive transcripts name no GitHub repository, so the
  model cannot learn the current owner/name from its evidence. The only in-product cue is the upstream description text
  "Horizon/go", which is stale.
- The current handoff (`src/policy/recovery-receipt.ts:283-292`) names the target and the field but omits the callable
  contract. The guard hint (`src/policy/guard.ts:22`) points to a `search` hit signature that recovery-only operations
  never have.

The proposed repair is the right product shape. I accept it with three changes, listed in §3. The frozen cases, grader,
contract digests, and receipt state algorithm stay unchanged; I found no evidence that requires touching them.

## 2. Design decisions

### 2.1 Should the receipt handoff include the exact signature? Yes.

A receipt is a capability. A capability handed over without its usage contract forces the receiver to discover the
contract elsewhere. Ranked `search` excludes the target by design (ADR-0009), so the ordinary discovery path is closed.
The block is the one surface that is guaranteed to be in front of the model when the capability exists. Rendering the
manifest signature there is the colocation fix, and it is manifest-derived, so it cannot drift from `describe`.

Render it with the existing `renderSignature(entry, { compactOversizedOutput: true })` from `src/catalog/search.ts:460`.
That is the same string `describe` and search hits use. Do not write a second renderer, and do not hand-write
`type ExplainRepoInput` in TypeScript source. The rendered input type already carries the `q` and `repo` property
descriptions from the schema.

### 2.2 Should the handoff include a top-level `execute` input example? Yes, and the receipt must appear only inside it.

Three placement failures happened with plain prose that said "at the top-level execute input". A copyable JSON object with
sibling `code` and `recoveryReceipt` keys removes the interpretation step. Put the signed receipt inside the example's
`recoveryReceipt` value and nowhere else in the block. Two copies of a 600-character token invite the model to paste one
into code. Tests must assert exactly one occurrence.

The example `code` value is a real callable line built from the entry id, not a hand-written string. Use placeholders for
the question and the pin, so the block is question-independent.

### 2.3 Should the block carry the repository identity note? Yes, by rendering the manifest description, not by naming repositories in code.

Sol's item 4 says the block must include "a current repository identity note from the catalog description". I agree
with the goal and reject the literal mechanism. Repository names hard-coded in `src/policy/recovery-receipt.ts` would be
case-specific prose in product code, and they would go stale the same way "Horizon/go" did.

Instead, the block renders `entry.description` verbatim. The description already ends with the catalog note that
`scripts/description-notes.mjs` appends at build time. Correcting the identity note in that one data map therefore
reaches the manifest, `codemode.describe`, `codemode.catalog`, the super spec, and the receipt block from one source. The
block stays a generic "contract card": description, input signature, example.

Cost: the description adds about 600 characters to every execute that completes a qualifying Docs search. Correctness
wins here. The block already carries a 600-character receipt, and the alternative is a model that cannot pin the
repository on the happy path.

### 2.4 Is the repository identity note itself case-specific? No, with two conditions.

The note names `stellar/stellar-horizon` and `stellar/go-stellar-sdk` and marks `stellar/go` as archived. Six of twelve
frozen positives depend on exactly those two names, so the note looks like test tuning. It is not, for these reasons:

- The upstream description already asserts an identity ("Horizon/go"). The note corrects a false statement that the
  product currently emits; it does not add a hint that only the suite needs.
- The fact is independently evidenced: `research/audits/2026-07-11-gt55-cli-sdks-discovery.md:97` records the module
  move, and the live Scout response in this packet reports `isArchived: true` for `stellar/go`.
- The frozen truth sources for the affected cases pin commits in those repositories; the note names no question, value,
  symbol, or case id.

Conditions: the note must carry an as-of date, and it must state the general rule ("pin the current canonical repository;
never pin an archived one") rather than only the two names. Wording proposal:

> Catalog note: the upstream payload carries its own `ok` flag at `data.ok` — distinct from the envelope call-status
> `ok`. The routing list above is stale where it says Horizon/go: `stellar/go` is archived. As of 2026-08-30 Horizon
> lives in `stellar/stellar-horizon` and the Go SDK in `stellar/go-stellar-sdk`. Pin `repo` to the current canonical
> owner/name; auto-routing is a fallback for questions without a known repository.

Keep the sentence about `data.ok`; it is a separate verified trap.

### 2.5 Should the guard hint change? Yes, for every operation, with one recovery-only clause.

The current hint says the schema "is in its `search` hit signature". That is false for a recovery-only entry and is
merely indirect for others, because the model may be inside `execute`. Change the hint to name the in-script path:

> Fix the listed fields and retry; `codemode.describe("<entry.id>")` returns the exact input schema.

When `entry.discoveryMode === "recovery-only"`, append:

> This rejection did not consume the recovery receipt; reuse it on the retry.

The guard already holds the entry, so this needs no new plumbing. It changes behavior for no operation; it changes one
string.

### 2.6 One more message, not in Sol's list: the "missing receipt" refusal must say where the receipt goes.

`src/executor/providers.ts:482` returns "a recovery receipt is required before this operation can run" when the host
sees none. In the packet, the model had a receipt in hand in every such refusal and had placed it inside the script or
the call arguments. Append placement guidance to that message only:

> a recovery receipt is required before this operation can run; pass it as the top-level execute field
> `recoveryReceipt` beside `code`, not inside the script or the call arguments

This is the only refusal text that changes. Leave the `failure()` map in `recovery-receipt.ts` untouched.

### 2.7 What stays unchanged, and why

- `AUTHORITY_REPOSITORY_RULE`, `SEARCH_DESCRIPTION`, `EXECUTE_DESCRIPTION`, `SERVER_INSTRUCTIONS`, and the `describe`
  usage sentence. They are already correct, and more repeated prose raises review cost without fixing the local omission.
- Frozen cases, digests, `contract.mjs`, `grade-results.mjs`, `review-results.mjs`, `measure.mjs`, `lint.mjs`.
- Receipt cryptography, payload shape, TTL, R2 marker transition, telemetry fields.
- The evidence checkpoint block. Its sentence about "canonical owner/name" is consistent with the new note.
- The projected-syntax grader rule. A corrected retry still fails the one-call sequence, which is the intended pressure
  on the model-facing boundary.

## 3. Changes requested against the Sol plan

1. Do not render a hand-written `ExplainRepoInput` type or repository names in `src/policy/recovery-receipt.ts`.
   Render `entry.description` and `renderSignature(entry, { compactOversizedOutput: true })` from the catalog entry.
2. Put the signed receipt in the block exactly once, inside the JSON example.
3. Add the placement clause to the "missing receipt" refusal in `src/executor/providers.ts`.

Everything else in the Sol plan stands.

## 4. Implementation plan

### 4.1 Product source

`src/policy/recovery-receipt.ts`

- Change `recoveryReceiptBlock(grants?)` to `recoveryReceiptBlock(catalog: Catalog, grants?: readonly RecoveryReceiptGrant[])`.
- For each grant, resolve `catalog.entries.find((e) => e.id === grant.target)`. If the entry is missing or is not an
  operation, throw. A receipt for an unknown target is a manifest defect and must fail closed at test time, not render.
- Render, in this order, per grant:
  1. Header: `${source} completed. If its result was empty or adjacent, one later execute may call ${target} once before ${expiresAt}.`
  2. `Contract (from the manifest):` then `entry.description` verbatim.
  3. `renderSignature(entry, { compactOversizedOutput: true })` verbatim.
  4. One instruction line: `Put the whole remaining code question in q. Pin repo to the exact current owner/name when you know it.`
  5. `Send exactly this shape as the execute tool input. The receipt is a top-level field beside code, never inside the script or the call arguments:`
  6. `JSON.stringify({ code: \`async () => ${target}({ q: "<remaining code question>", repo: "<owner/name>" })\`, recoveryReceipt: grant.receipt })`.
- Do not log the block or the receipt. Existing telemetry is unchanged.
- Import `renderSignature` from `../catalog/search.ts`. Check for an import cycle first: `search.ts` does not import
  policy modules today, so none is expected.

`src/mcp/tools.ts:606` and `src/demo/tools.ts:561`

- Pass the loaded catalog: `recoveryReceiptBlock(getCatalog(), outcome.recoveryReceipts)`. Both files already import
  `getCatalog`. Keep the block after the evidence checkpoint in both.

`src/policy/guard.ts:22`

- Replace the hint string as in §2.5. Build it from `entry.id` and `entry.discoveryMode`.

`src/executor/providers.ts:482`

- Extend the "missing" message as in §2.6.

`scripts/description-notes.mjs:263-264`

- Replace the `explainRepo` note with the wording in §2.4. Keep the key unchanged so the orphan check still passes.

### 4.2 Generated files

Regenerate; never hand-edit:

```sh
node scripts/build-catalog.mjs
npm run spec:build
npm run micro-map:build
```

Expected changes: `catalog/manifest.json` (one description), `specs/super-spec.json` (same description). The micro-map
should not change; confirm with `git diff --stat`. Record the new manifest SHA-256 in the ledger.

### 4.3 Documentation

- `ARCHITECTURE.md` §Recovery-only operation receipts: add two sentences. "The execute result renders the target's
  manifest description, input signature, and a copyable execute input beside the receipt. Argument validation runs
  before receipt consumption, so a rejected argument set does not consume the receipt."
- `research/decisions/0009-recovery-only-discovery-receipts.md` §Decision: add "Order at dispatch: argument guard,
  receipt consumption, adapter call." No run history.
- `eval/repo-recovery/README.md`, receipt paragraph: add the same two facts in one sentence each.
- `.agents/rounds/2026-08-30-repository-tooling-recovery.md`: add a "Third collection (2026-08-30)" section with the
  identities from the Sol diagnosis (canonical collection, file, packet, annotation, reviewed SHA-256 values; revision;
  surface; `$6.5671102`; 20 paid calls; 0 retries; `0/12`, `0/8`, `13/20`, `19/20`), the root cause in two sentences, and
  the repair revision once it exists. Do not rewrite earlier sections.

### 4.4 Tests

`test/recovery-receipt.test.ts`

- `recoveryReceiptBlock(catalog)` returns `""` with no grants.
- The block contains `--- RECOVERY RECEIPT ---`, the entry description, `q: string`, `repo?: string`, and the exact
  callable line `scout.explainRepo(input: ExplainRepoInput)`.
- The last line parses as JSON with keys exactly `["code", "recoveryReceipt"]`, `recoveryReceipt` equals the issued
  receipt, and `code` contains `scout.explainRepo({`.
- The receipt string occurs exactly once in the block.
- An unknown target throws.

`test/executor-providers.test.ts`

- Issue one receipt. Call `scout.explainRepo({ repo })` without `q`: expect the guard error, a hint containing
  `codemode.describe("scout.explainRepo")` and "did not consume", zero fetches, and no `recovery_receipt` event.
  Retry with `{ q, repo }` and the same receipt: expect one fetch and one `outcome: "consumed"` event.
- Call with the receipt inside the argument object and none at top level: expect the refusal message to contain
  "top-level execute field" and zero fetches.

`test/policy.test.ts`

- The existing tests (lines 51 and 66) assert only "no call was made". Add a hint assertion for the new
  `codemode.describe("<id>")` text, and add one recovery-only case using a minimal entry with
  `discoveryMode: "recovery-only"` that asserts the "did not consume" clause.

`test/server.test.ts` ("renders the recovery receipt block")

- Keep the injected grant. Assert the signature line, the JSON example line, exactly one receipt occurrence, and the
  description's "archived" sentence, since the real catalog is loaded.

`test/smoke/demo-tools.test.ts`

- Add one execute test with an injected `runExecute` that returns a grant. Assert the same block markers as the MCP
  test. This proves MCP and playground parity at the worker boundary.

`test/smoke/executor.test.ts` (existing receipt test around line 755)

- After the authority run, build the block with `recoveryReceiptBlock(catalog, authority.recoveryReceipts)`, parse its
  last line, replace the two placeholders, and run `example.code` with `example.recoveryReceipt`. Assert one Scout fetch
  and `ok: true`. Then assert replay fails. This proves the rendered example is executable as emitted.

`test/catalog.test.ts`

- Assert the `scout.explainRepo` description contains `stellar/stellar-horizon`, `stellar/go-stellar-sdk`, and the
  word `archived`. Assert the `data.ok` sentence remains.

### 4.5 Acceptance gates (all free, in this order)

```sh
npx vitest run test/recovery-receipt.test.ts test/executor-providers.test.ts test/policy.test.ts test/server.test.ts test/catalog.test.ts
npm run typecheck
npm test
npm run build
npm run test:smoke
npm run eval:repo-recovery:lint
npm run eval:repo-recovery -- --gate
npm run eval:routing -- --gate
npm run secrets:scan -- --tree
git diff --check
```

Required results: every command exits 0; the structural gate stays `12/12` eligible and `0/8` risks; the routing gate
totals stay at the recorded floors (the target is excluded from scoring, so no movement is expected; any movement is a
finding, not a pass). Run each gate bare, never through a pipe.

Also inspect one real receipt block through the running `npm run dev` pane before any paid work. It must show the
description, the signature, and the JSON example with one receipt.

### 4.6 Live acceptance (separate authorization required)

No live evidence exists for the repaired handoff. After the free gates pass and the independent review is reconciled,
request authorization for one paid collection under the frozen contract, using the README procedure with the new clean
revision, surface, binary, and implementation hashes. The reviewed gate is unchanged: at least `10/12` positive passes,
`0/8` premature detours, zero projection errors. Add these trace-audit counts to the ledger: hard-invalid target calls,
misplaced receipts, repeated recovery calls, missing recovery calls, wrong or absent pins. Acceptance requires zero
hard-invalid calls and zero misplaced receipts among passing positives.

Margin note for the owner: the threshold tolerates two misses. The third run already carries one initial-authority
omission (`rr-pos-cli-config-home-env`) and one deepening call with no recovery (`rr-pos-js-rpc-durability-values`). The
repair therefore needs the other ten to pass, and six of those ten depend on the corrected repository identity. That is
a thin margin, and it is the honest state.

## 5. Reviewer assignment for the implementation

Author lane: Terra high (routine implementation with exact tests). Independent reviewer: Grok high for assumption
attack on the block wording and the note; Sol authored the diagnosis and is not eligible for this gate. Fable authored
this plan and is not eligible either.

## 6. Actions not taken

No repository file changed. No paid eval ran. No service deployed. No branch was pushed. No pull request or merge
occurred.

CHANGES-REQUESTED
