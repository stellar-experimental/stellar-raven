> Copy of the second review report. Its relative links (`evidence/`, `evidence2/`, `fixtures/`) point
> to the reviewer's scratch folder `tmp/rv-fu/` in the review worktree. That folder is not committed.

| Item | Severity | Verdict |
| --- | --- | --- |
| `sd-080` | NOTE | Previous Cargo, winget, and intake blockers are reconciled. The exact dry run passes. |
| `wai-001` | NOTE | Previous body and disposition fixes are reconciled. Keep `declined-upstream`. |
| `sd-059` | FIX | Evidence is correctly qualified. Two body claims remain too broad. |
| Research links and `sls-113` | FIX | Snapshot links work. The claimed resolution receipts do not exist yet. |
| Existing TODO additions | NOTE | The search and migration corrections match the verified evidence. |
| `sd-081` | FIX | The WASM-hash source is correct. Preserve the omitted shared-import residual. |
| `sls-114` | FIX | FILE-WITH-FIXES: add the missing `store/src/lib.rs` attribution. |
| `sk-032` | NOTE | RETIRE, subject to the deletion steps below. |
| `sk-033` | NOTE | RETIRE, subject to the deletion steps below. |
| `sk-034` | NOTE | RETIRE, subject to the deletion steps below. |
| `sk-035` | NOTE | RETIRE, subject to the deletion steps below. |
| `sk-036` | NOTE | RETIRE, subject to the deletion steps below. |
| New pin TODO | FIX | The pin claim is correct. Its overnight-ledger link does not resolve in this worktree. |
| Round ledger and copied review | FIX | Previous ledger corrections remain outstanding. The copied review has broken relative evidence links. |

# Scope and checks

Reviewer: Codex, continuing the distinct review lane.
Reviewed commit: `f020ad52616aa37794249a31a7cef768368bc732`.
The worktree was clean when this review started.
I read `git log --oneline -3`, `git show HEAD`, and the complete diff without the copied first report.
I used the previously read improvements-pipeline instructions.
I edited no tracked file, committed nothing, and posted nothing to GitHub.

Fresh evidence is under [evidence2/](evidence2/).
The review metadata records the checked commit and the source hashes.
I used `gh api` for issue, comment, PR, patch, review, and check reads.
All five skill PRs merged and closed their corresponding issues.
Their reported checks passed or were explicitly skipped; no returned check failed.

I fetched nine affected files from both `raw.githubusercontent.com/stellar/stellar-dev-skill/main/` and `https://skills.stellar.org/`.
Each deployed response returned HTTP 200 and matched its `main` source byte for byte.
The checked upstream head is `9c604c2be6ae69f962fbb578bce6b681d462fea5`.
This verifies publication independently of the merge records.
It also resolves the earlier bot comment about the cancelled deployment for PR #170.

`npm run improvements:lint` passes with `125` findings.
Both requested finding dry runs pass.
The local SDK checks submitted no transaction to a network.

# 1. Reconciliation of the first review

## `sd-080` — NOTE — reconciled

The corrected record distinguishes `stellar-cli` from its `soroban-cli` library dependency.
It correctly states that the documented Cargo command installs only `stellar`.
The winget evidence names the tagged installer source and states that nobody ran the installer.
The intake override resolves to `stellar/stellar-docs`.
These corrections match the published manifests and installer sources inspected during the first review.

I reran the exact command:

```sh
npm run improvements:file -- --file https://github.com/stellar-experimental/stellar-raven/blob/610a7c3c25b2d582709f17a0beb8628a0f8f9cf5/improvements/stellar-docs/sd-080-fuzzing-note-soroban-contract-build.md --dry-run
```

It exits `0` and renders the corrected body.
The previous filing blockers are cleared.

## `wai-001` — NOTE — reconciled

The Finding body now identifies npm `4.0.1` as the observed latest version.
It records the continuing failure and deprecation.
The Evidence body correctly describes PR #639 as closed unmerged.
The disposition no longer treats a Raven migration as an upstream fix.
It requires a reviewed lifecycle decision before closing the declined record.
No further correction is required for these items.

## `sd-059` — FIX — partially reconciled

The new evidence correctly separates the site MCP path from the author's authenticated production measurement.
It names the Discovery endpoint, the candidate window, and the adapter's filtering.
It states that raw candidates were not compared with adapter output.
The recommendation's recheck now names Discovery explicitly.

Two body statements still overstate the evidence:

- The first sentence says Discovery “does not find text” inside `<ResponseField>` components.
- The final Finding sentence says a reader cannot find the page explaining an error code.

The record itself reports successful retrieval for some component text.
It also records successful site MCP searches for all seven checked queries.
Use a measured statement such as: “Discovery often fails to retrieve pages for text inside `<ResponseField>` components.”
Limit the reader-impact statement to the tested Discovery path.
Do not imply that site MCP readers share that failure.

The seven-query production column remains author evidence.
This review does not claim a new authenticated Raven measurement.

## Research links and `sls-113` — FIX — links repaired, state claims premature

I fetched both immutable snapshots through their new URLs.
Both return HTTP 200 and contain the intended finding.
The link repair is correct.

However, these lines claim completed resolution:

- `research/audits/2026-09-17-routing-audit/soroswap-contract-role.md:115`
- `research/audits/2026-09-17-routing-audit/aquarius-description-roles.md:10`
- `improvements/stellar-light-scout/sls-113-dex-venue-role-sparse.md:12`

The research lines also claim receipts in `improvements/resolved.json`.
That ledger contains neither `sls-085` nor `sls-086`.
Both active finding files still exist with `fixed-upstream` status.

Until resolution completes, say “fixed upstream; retirement pending”.
Alternatively, complete the authorized resolver steps before finalizing those claims.
The immutable links can remain as written.

The dated `sls-099` dedupe sentence remains unchanged.
I accept it as historical evidence; it contains no broken file link.
It must not become evidence that `sls-085` remains an unresolved contract-role defect.

## The two existing TODO additions — NOTE — reconciled

The search TODO now reports seven relevant first hits.
It explains the shared `op_low_reserve` code and Set Options' third-place result.
It attributes the Raven result to the author.
It requires comparison of raw candidates with adapter output before assigning the cause.

The migration TODO now distinguishes module availability from catalog support.
That matches the first review's local tests:

- `agents` `0.28.1` exports `createAI` but rejects `moonshotai/kimi-k3`.
- `agents` `0.32.0` accepts that ID before a binding call.

The migration condition also preserves the declined-package lifecycle distinction.
These requested corrections are reconciled.

# 2. Successor records

## `sd-081` — FIX — the core recommendation is correct

Commands run:

```sh
gh api repos/stellar/stellar-docs/issues/2562
gh api repos/stellar/stellar-docs/issues/2562/comments
curl -fsSL https://developers.stellar.org/docs/build/guides/archival/restore-contract-js.md
```

Issue #2562 remains open and has no comments.
Its body reports the empty return type and missing `xdr` import in `restore-contract-js.mdx`.
The record correctly identifies which defects that existing issue covers.
It does not falsely claim that the expanded runtime defects were posted upstream.
Using that issue for `reported-upstream` is justified for the overlapping defect.

Recommendation step 2 selects the correct source for the WASM hash.
The hash comes from the returned instance entry, rather than the instance ledger key.
For SDK `17.4.0`, the checked path is:

```typescript
response.entries[0].val.value.val.value.executable.value
```

The required union checks are:

```text
LedgerEntryData.type == "contractData"
ScVal.type == "scvContractInstance"
ContractExecutable.type == "contractExecutableWasm"
```

I ran [check-restore-fixed.mjs](fixtures/check-restore-fixed.mjs) against SDK `17.4.0` with local fixtures.
It reads the instance response through that path and builds a contract-code `LedgerKey`.
It places two real `LedgerKey` values in the read-write footprint.
It sets time bounds, signs the transaction, and verifies the signature.
It also rejects a missing instance entry.
The [output](evidence2/restore-fixed.log) passes all three checks.

This fixture verifies the SDK object access and transaction construction.
It does not prove that an RPC server returns an archived instance entry in every restoration scenario.
The corrected example should retain the missing-entry and non-WASM guards.
Adding the exact path would make step 2 easier for the upstream maintainer to implement.

One first-review residual was omitted from the successor.
The data-restoration snippets redeclare `Api` when combined with their linked polling-helper imports.
I confirmed TypeScript diagnostic `TS2440` on the combined source:

```text
Import declaration conflicts with local declaration of 'Api'.
```

The check and its output are [check-shared-types.mjs](fixtures/check-shared-types.mjs) and [shared-types.log](evidence2/shared-types.log).
Preserve that residual in `sd-081` or a separate self-contained record before retiring `sd-055`.
Do not expand issue #2562 with a duplicate issue for its existing syntax report.

## `sls-114` — FIX — FILE-WITH-FIXES

Commands run:

```sh
curl -fsSG https://stellarlight.xyz/api/repos/explain \
  --data-urlencode 'repo=stellar/stellar-horizon' \
  --data-urlencode 'q=Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?'
npm run improvements:file -- --file improvements/stellar-light-scout/sls-114-explain-repo-fixture-interfaces-without-paths.md --dry-run
```

I fetched the five matching Rust source files through `gh api` at the returned scanned commit.
The live response still classifies Horizon as `platform` and returns six fixture function signatures without paths.
The scanned commit remains `597544b60c20f8536d532d32abca8462394874f3`.
The core defect and the proposed correction are supported.

The Evidence body omits one source file from its attribution:

| Returned signature | Source below `internal/integration/contracts/` |
| --- | --- |
| `IncrementContract.increment()` | `increment/src/lib.rs` |
| `Contract.add(...)` | `add_u64/src/lib.rs` |
| `Contract.bulk_transfer(...)` | `bulk/src/lib.rs` |
| `Contract.__constructor(...)` | `constructor/src/lib.rs` |
| `Contract.set(...)` | `store/src/lib.rs` |
| `Contract.remove(...)` | `store/src/lib.rs` |

Add `internal/integration/contracts/store/src/lib.rs` to the Evidence body.
The current sentence says the interfaces come from four files, but two signatures come from the fifth file.

Also qualify the dedupe sentence saying issue #1739 and PR #1806 cover product classification “only”.
The old finding's recommendation already requested source paths.
State that the classification was fixed and this path-attribution request remains.

The dry run exits `0`.
Its title and opening state the affected API and the concrete defect.
Its notice, evidence, recommendation, source record, and resolution handoff are present.
After these factual corrections, the body is suitable for filing.

# 3. Independent review of the five skill deletion candidates

I read each original issue and resolving PR through `gh api`.
I also read their comments, reviews, file patches, and reported checks.
The mapping is:

| Finding | Issue | PR | Merge commit |
| --- | --- | --- | --- |
| `sk-032` | `stellar/stellar-dev-skill#162` | `#169` | `c50f7d899a304e40b036fa761cde79131b51d9c2` |
| `sk-033` | `stellar/stellar-dev-skill#163` | `#170` | `b836970a4cd666cf1c8208c027fa15d7fd6977ab` |
| `sk-034` | `stellar/stellar-dev-skill#164` | `#171` | `537558732bee140a15d5d5c05eac0784e5990f53` |
| `sk-035` | `stellar/stellar-dev-skill#165` | `#167` | `267515b0c302781910e882dea18e40d3e7a4c011` |
| `sk-036` | `stellar/stellar-dev-skill#166` | `#168` | `9c604c2be6ae69f962fbb578bce6b681d462fea5` |

For each ID, I ran both reference searches:

```sh
rg -n "<id>" .
rg -n --hidden --glob '!.git/**' --glob '!tmp/**' "<id>" .
```

The exact results are saved as `evidence2/sk-0NN-refs.txt` and `evidence2/sk-0NN-refs-hidden.txt`.
All nine affected source files match their deployed counterparts, as stated above.
The old Raven pin is a separate consumer task and does not negate these upstream fixes.

## `sk-032` — NOTE — RETIRE

Published files checked:

- `skills/smart-contracts/SKILL.md`
- `skills/smart-contracts/development.md`
- `skills/smart-contracts/testing.md`

The version sentence now targets Protocol `29` and SDK `29`.
Both Cargo dependency examples use major `29`.
The Mainnet-version clause is removed from the pin comment.
The rule to check RPC `getVersionInfo` remains.
The upgrade example imports `ContractExecutable` and uses `update_current_contract(ContractExecutable::Wasm(...))`.
The old method appears only in an explicit deprecation explanation.
The adjacent factory example uses `deploy_contract`.

I independently called `getVersionInfo` on Mainnet and Testnet.
Both report `protocolVersion: 29`.
The crates.io API returned HTTP 403, so I checked the public sparse index instead.
Its newest non-yanked stable SDK is `29.0.1`.
The SDK `v29.0.1` source confirms the replacement method and its argument type.
Every recommendation item is satisfied.
I found no residual of the original version or upgrade-example defect.

References requiring deletion work:

- Remove `improvements/intake.json` override `sk-032`, currently at line `270`.
- Remove the active finding and regenerate its `improvements/INDEX.md` row.
- Keep the pin TODO until production serves the repaired text.
- Preserve the dated upstream-filing ledger and its `hackmeridian-review.md` section as historical evidence.

## `sk-033` — NOTE — RETIRE

Published file checked: `skills/smart-contracts/development.md`.

The generated-client result now has the correct nested shape.
The text correctly assigns typed contract errors to `Err(Ok(e))`.
It assigns return conversion failures to `Ok(Err(_))`.
It explains `Err(Err(_))` and includes the requested assertion example.
The adjacent prose distinguishes functions without a `Result` return and non-recoverable failures.

I compared the wording with SDK `v29.0.1` `syn_ext.rs::try_output` and `Env::try_invoke_contract`.
The type signatures agree with the repaired text.
No recommendation item remains unmet.
No repeated swapped-arm claim appeared in the checked files.

References requiring deletion work:

- Remove the `sk-033` intake override, currently at line `274`.
- Remove the active finding and regenerate its index row.
- Preserve the dated upstream-filing ledger and review section.

## `sk-034` — NOTE — RETIRE

Published file checked: `skills/smart-contracts/development.md`.

The table now lists `Footprint entries (read-only + read-write) | 400`.
It labels the `200 / 200` row as disk-read entries and written entries.
It also distinguishes disk-read bytes from all reads.
The adjacent explanation distinguishes live in-memory contract entries from disk reads.
The Lab link and live settings command remain.

I ran:

```sh
stellar network settings --network mainnet --output json
```

The response contains footprint limit `400`, disk-read limit `200`, and write limit `200`.
The CLI warns that it supports Protocol `28`, while the network runs Protocol `29`.
The three fields needed for this finding are present in the returned configuration.
Every recommendation item is satisfied.

References requiring deletion work:

- Remove the `sk-034` intake override, currently at line `278`.
- Remove the active finding and regenerate its index row.
- Preserve the dated filing ledger and review section.
- Preserve the review's separate historical TTL comparison at line `214`.

## `sk-035` — NOTE — RETIRE

Published files checked:

- `skills/assets/SKILL.md`
- `skills/assets/regulated-assets.md`
- `skills/standards/SKILL.md`
- `skills/standards/resources.md`

The assets skill now has the requested SEP-0008 entry.
It names when per-transaction approval is needed and lists the TOML fields.
Its companion explains the issuer flags, transaction shape, request format, and five response statuses.
The standards skill lists SEP-0008 beside SEP-0057.
Its task map distinguishes classic approval-server assets from contract-token patterns.
The companion correctly labels SEP-0057 as Draft.

I compared the new flow with the current SEP-0008 text.
The `success`, `revised`, `pending`, `action_required`, and `rejected` handling agrees with that source.
The revised-transaction inspection requirement remains explicit.
I also verified the referenced Go service removal commit, dated 2025-10-29.
Every recommendation item is satisfied.
I found no adjacent contradiction requiring a successor.

References requiring deletion work:

- Remove the `sk-035` intake override, currently at line `282`.
- Remove the active finding and regenerate its index row.
- Correct the current follow-up ledger's claim that PR #167 still awaits review.
- Preserve the dated upstream-filing ledger and review section.

## `sk-036` — NOTE — RETIRE

Published files checked:

- `skills/data/SKILL.md`
- `skills/dapp/SKILL.md`
- `skills/smart-contracts/testing.md`

Both primary examples list the four send statuses.
They throw on `ERROR` using parsed `errorResult`.
They retry `TRY_AGAIN_LATER` with a limit and report exhaustion.
They poll on both `PENDING` and `DUPLICATE`.
The adjacent integration example checks the send status and final result.
The separate error-handling explanation no longer claims that RPC rejection itself throws.
The data skill retains the three `getTransaction` values.

I executed the fresh data and dapp extracts with local RPC fixtures.
All `14` branch checks passed.
They cover pending, duplicate, retry-to-pending, retry-to-duplicate, immediate error, retry exhaustion, and retry-to-error.
The checks verify send counts, polling counts, and the error cause.
See [check-skill-send.mjs](fixtures/check-skill-send.mjs) and [skill-send.log](evidence2/skill-send.log).
Every recommendation item is satisfied.

References requiring deletion work:

- Remove the `sk-036` intake override, currently at line `286`.
- Remove the active finding and regenerate its index row.
- Correct the current follow-up ledger's claim that PR #168 still awaits review.
- Keep the separate production pin TODO until its completion condition is met.
- Preserve the dated upstream-filing ledger and review section.

## Shared retirement requirements — NOTE

The searches found no direct candidate-ID reference in active goldens or the consistency register.
They found no probe frontmatter or other active-finding reference requiring repair.
Each candidate needs a resolved receipt, including this review evidence and its resolving PR.
Each upstream issue and PR still needs the required Raven resolution handoff before deletion.
I did not post those comments or run a mutating resolver.
Retirement must preserve the pending own-repo pin task.

# 4. New pin TODO — FIX

`ecosystem-skills/MANIFEST.json` still pins `stellar-dev` to:

```text
cac64041d0c759a3b10ce6fba4fa3e0672bcbe0f
```

The TODO correctly identifies that pin and the five merged fixes.
The pinned source bytes differ from the repaired published files.
A pin update, regeneration, review attestation, and deployment are required for Raven to serve them.
The production read completion condition is appropriate.

However, this referenced ledger is absent:

```text
.agents/rounds/2026-11-02-golden-overnight.md
```

I checked that path and searched the worktree's hidden round files.
The TODO's deployment dependency cannot be verified from the named record.
Correct the link or add the durable release condition to this repository.
Keep the deployment hold until its actual owner releases the identity pin.

The pin task should invoke the complete update sequence in `ecosystem-skills/README.md`.
It must include selection review for the new `assets/regulated-assets.md` companion.
The updater discovers selected files; a hand-edited commit SHA alone is insufficient.
This review did not change the pin or start a deployment.

# 5. Outstanding ledger and archive corrections — FIX

The round ledger was not corrected in this commit.
It still says the docs content and site search are sound without limiting that claim to the checked queries.
It still assigns the cause exclusively to Discovery ranking and says the docs owner cannot change it.
That contradicts the corrected evidence's explicit uncertainty about adapter filtering.
Its action table still lists a reply on #2995 without a posted reference.
Fresh `gh api` readback still returns only the two triage-bot comments there.
It also still lists the now-merged skill PRs #167 and #168 as awaiting review.
Append a dated reconciliation before closing the round.

The copied first report also has broken relative evidence links.
Its new location is `.agents/rounds/2026-11-02-upstream-followup/rv-fu-review.md`.
Relative targets such as `evidence/` and `fixtures/check-docs.mjs` do not exist beside that copy.
State that those artifacts remain under `tmp/rv-fu/`, or preserve the required durable evidence with working links.
Do not present missing committed paths as retained evidence.

No tracked-file changes were present when I completed this review.
