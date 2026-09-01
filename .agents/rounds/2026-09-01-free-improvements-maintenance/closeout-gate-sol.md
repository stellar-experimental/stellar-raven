# Free improvements closeout gate — Sol

Date: 2026-09-01

This gate was read-only, except for this report.
The worktree was clean before this report.
The reviewed base was `d9d03b2de67ada625f42193bdca50ffcb0dcaa0b`.

## Verdict

| decision | verdict | reason |
|---|---|---|
| CAP-0075 and `rs-soroban-env` agree on `field: Symbol` and Protocol 25 | **PASS** | Both current heads contain the same field type and protocol gate. |
| Remove the obsolete `U32Val` and Protocol 24 cautions | **PASS** | Current CAP-0075 contains neither obsolete claim. |
| Keep the Poseidon2 degree contradiction separate in `sd-048` | **PASS** | The remaining defect concerns `d`, not `field` or the protocol gate. |
| `sd-048` meets the `verified` evidence bar | **PASS** | Fresh pinned source reads reproduce the defect. |
| `sls-080` meets the `fixed-upstream` evidence bar | **PASS** | The deployed public API now returns source-parity data. |
| The planned `TODO.md` and `NEXT.md` cleanup preserves future work | **PASS WITH CONDITIONS** | The closeout must retain the recovery rules listed below. |

The evidence bars pass, but two records are not write-ready.
`sd-048` remains `proposed`.
`sls-080` remains `reported-upstream`.

The `sd-048` filing also has public-source blockers.
The active `main` source link does not exist.
The local `d9d03b2` commit also does not exist on GitHub.

## Required instruction reads

I read these files completely:

- `AGENTS.md`
- `.agents/skills/golden-truth/SKILL.md`
- `.agents/skills/improvements-pipeline/SKILL.md`
- `improvements/README.md`
- `.agents/rounds/2026-09-01-free-improvements-maintenance.md`
- Every report under `.agents/rounds/2026-09-01-free-improvements-maintenance/`

The report set contained six reports before this gate.

## Decision 1: current field type and protocol gate

The current `stellar/stellar-protocol` head is:

- Commit: `65e2b6262c0825494caf2a94116eb512c8335f22`
- Commit date: `2026-08-31T23:57:00Z`
- Source: `core/cap-0075.md`

The current `stellar/rs-soroban-env` head is:

- Commit: `a7e15b439c4b49b17ba8f9e4527efee8d8119aba`
- Commit date: `2026-09-01T01:01:25Z`
- Source: `soroban-env-common/env.json`

CAP-0075 has these exact values:

- Line 13: `Protocol version: 25`
- Lines 52 and 69: `{ "name": "field", "type": "Symbol" }`
- Lines 62 and 79: `"min_supported_protocol": 25`
- Lines 61 and 78 name `BLS12_381` and `BN254`.

The shipped environment has these exact values:

- Lines 2699 and 2716: `{ "name": "field", "type": "Symbol" }`
- Lines 2709 and 2726: `"min_supported_protocol": 25`
- Lines 2708 and 2725 name `BLS12_381` and `BN254`.

Therefore, the two current sources agree.

Exact positive check:

```sh
gh api 'repos/stellar/stellar-protocol/contents/core/cap-0075.md?ref=65e2b6262c0825494caf2a94116eb512c8335f22' \
  -H 'Accept: application/vnd.github.raw+json' \
  | rg -n 'Protocol version: 25|"name": "field", "type": "Symbol"|"min_supported_protocol": 25'
```

Result:

```text
13:Protocol version: 25
52:      { "name": "field", "type": "Symbol" },
62:   "min_supported_protocol": 25
69:      { "name": "field", "type": "Symbol" },
79:   "min_supported_protocol": 25
```

## Decision 2: obsolete golden cautions

The current CAP has no Protocol 24 sentence.
It also has no `field: U32Val` declaration.

Exact negative check:

```sh
gh api 'repos/stellar/stellar-protocol/contents/core/cap-0075.md?ref=65e2b6262c0825494caf2a94116eb512c8335f22' \
  -H 'Accept: application/vnd.github.raw+json' \
  | rg -n 'Protocol 24|"name": "field", "type": "U32Val"'
```

Result: no output, with exit code `1`.

The obsolete golden text appears only in `q-protocol-bn254-poseidon-xray.json`.
The affected locations are:

- `golden.answer` at line 8
- `golden.avoid` at line 18
- `golden.notes` at line 21
- The stale corroboration row at lines 82 through 100
- Stale verification evidence and `sd-036` root cause entries

The closeout can remove these claims.
It must keep the stable hash-versus-permutation warning.
It must also keep the privacy warning.

The closeout must not add a degree warning to this golden.
The golden does not state the accepted Poseidon2 degree set.
Adding that warning would broaden the grading contract.

The sibling sweep found no other `U32Val` or `sd-036` golden claim.
Other cases only state the stable Protocol 25 assignment.

## Decision 3: the separate Poseidon2 degree defect

CAP-0075 line 78 lists degrees `3, 5, 7, or 11`.
CAP-0075 line 124 says only `d=5` is supported.
CAP-0075 line 157 says other values trap.

The shipped ABI says only degree 5.
Its exact source is `env.json` line 2725.

The host enforces the same restriction:

- `poseidon/mod.rs:19` defines `SUPPORTED_SBOX_DEGREES: [u32; 1] = [5]`.
- `poseidon2_params.rs:32-37` rejects every other value.

Exact host checks:

```sh
gh api 'repos/stellar/rs-soroban-env/contents/soroban-env-host/src/crypto/poseidon/mod.rs?ref=a7e15b439c4b49b17ba8f9e4527efee8d8119aba' \
  -H 'Accept: application/vnd.github.raw+json' \
  | nl -ba | sed -n '17,20p'

gh api 'repos/stellar/rs-soroban-env/contents/soroban-env-host/src/crypto/poseidon/poseidon2_params.rs?ref=a7e15b439c4b49b17ba8f9e4527efee8d8119aba' \
  -H 'Accept: application/vnd.github.raw+json' \
  | nl -ba | sed -n '32,38p'
```

Results:

```text
19 pub(crate) const SUPPORTED_SBOX_DEGREES: [u32; 1] = [5];
32 if !SUPPORTED_SBOX_DEGREES.contains(&d) {
35     "Poseidon2: unsupported s-box degree",
```

`sd-036` never asserted this degree claim.
It asserted the field-selector and protocol-version defects.
Those defects are fixed.

The remaining claim has a different correction.
The correction changes one Poseidon2 documentation string.
Therefore, the successor split is correct.

The local dedupe found only `sd-048` for this claim.
The GitHub issue search returned `total_count: 0`.

Exact GitHub search:

```sh
gh api 'search/issues?q=repo%3Astellar%2Fstellar-protocol+%22S-box%22+CAP-0075+in%3Atitle%2Cbody' \
  --jq '{total_count,items:[.items[]|{number,title,state,html_url}]}'
```

Result:

```json
{"items":[],"total_count":0}
```

## Decision 4: `sd-048` evidence bar

`sd-048` meets the `verified` evidence bar.
The finding records reproducible commands and pinned revisions.
This gate independently repeated all material source reads.

The current heads equal the finding's pinned revisions.
The source defect reproduced at both heads.

`improvements/intake.json` routes `sd-048` to `stellar/stellar-protocol`.
That repository owns CAP-0075.

The base and live lints also accept the finding.

```sh
npm run improvements:lint
npm run improvements:lint -- --live
```

Results:

```text
improvements lint ok (70 findings)
improvements lint ok (70 findings, live intake checked)
```

The filing dry-run also rendered a complete body.

```sh
npm run improvements:file -- \
  --file improvements/stellar-docs/sd-048-cap-0075-poseidon2-sbox-degree-contradiction.md \
  --dry-run
```

Result: exit code `0`.
The body contains all five required sections.

However, neither rendered source link is public.
The active `main` source record returns HTTP `404`.
The dry-run used local commit `d9d03b2de67ada625f42193bdca50ffcb0dcaa0b`.

Exact public check:

```sh
gh api repos/stellar-experimental/stellar-raven/commits/d9d03b2de67ada625f42193bdca50ffcb0dcaa0b \
  --jq '{sha:.sha,url:.html_url}'
```

Result: HTTP `422`, with `No commit found for SHA`.

Exact active-source check:

```sh
gh api repos/stellar-experimental/stellar-raven/contents/improvements/stellar-docs/sd-048-cap-0075-poseidon2-sbox-degree-contradiction.md \
  --jq '{sha:.sha,html_url}'
```

Result: HTTP `404`, with `Not Found`.

The branch has no configured upstream.
Do not file `sd-048` with these broken source links.
Land the exact finding publicly before filing.

Publishing needs separate authorization.
This gate grants no such authorization.

## Decision 5: `sls-080` fixed-upstream evidence bar

The public Scout service reports deployed API version `1.9.16`.

```sh
curl -sS https://stellarlight.xyz/api/status \
  | jq '{apiVersion,status,version,service}'
```

Result:

```json
{
  "apiVersion": "1.9.16",
  "status": null,
  "version": "scout-1.0.0",
  "service": "Stellar Scout"
}
```

The direct deployed trigger now returns the correct value.

```sh
curl -sS -G https://stellarlight.xyz/api/repos/explain \
  --data-urlencode 'q=Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?' \
  --data-urlencode 'repo=stellar/stellar-horizon' \
  | jq '{answer,answerSource,answerAsOf,repo,routedVia,codeVerified:{scannedRef:.codeVerified.scannedRef,scannedAt:.codeVerified.scannedAt},meta:{generatedAt:.meta.generatedAt,warnings:.meta.warnings}}'
```

Observed result:

- `answerSource`: `knowledge-note`
- `answerAsOf`: `2026-09-01T00:00:00Z`
- `repo`: `stellar/stellar-horizon`
- `routedVia`: `explicit`
- `generatedAt`: `2026-09-01T19:42:19.933Z`
- `scannedRef`: `82660510ecda7fd365a14d08badb9d85fa22bc32`
- Answer value: `MaxSupportedProtocolVersion = 28`

The source at the returned `scannedRef` also equals `28`.

```sh
gh api 'repos/stellar/stellar-horizon/contents/internal/ingest/main.go?ref=82660510ecda7fd365a14d08badb9d85fa22bc32' \
  -H 'Accept: application/vnd.github.raw+json' \
  | nl -ba | sed -n '35,39p'
```

Result:

```text
35 const (
36     // MaxSupportedProtocolVersion defines the maximum supported version of
37     // the Stellar protocol.
38     MaxSupportedProtocolVersion uint32 = 28
```

The upstream state also supports the fix:

- Issue `Stellar-Light/stellarlight#1134` is closed as completed.
- It closed at `2026-08-31T04:11:41Z`.
- PR `#1174` merged at `2026-09-01T03:02:37Z`.
- Its merge commit is `76cb312d6bcee5260d98720402204feb774a3be6`.
- All three issue comments came from `theboycoder`.
- No Raven resolution comment exists.

The direct public response proves deployed behavior.
GitHub merge state alone was not used as deployment proof.

An attempted `https://stellarlight.xyz/openapi.json` read returned non-JSON.
That failed path is not evidence in this verdict.

The evidence bar passes.
The current finding record still fails the resolution bars.

Current blockers are:

- Status remains `reported-upstream`.
- The Evidence section still says issue `#1134` is open.
- No Raven resolution comment exists.
- `.agents/TODO.md` still writes recurrences into the active finding.
- `.agents/NEXT.md` still describes the old state.
- A committed and public fixed-state snapshot does not exist.

The false `isDeployableContract` behavior is a separate defect class.
It does not block `sls-080` resolution.
Use `sls-082` only after separate verification.

## Decision 6: preserve future actions in `TODO.md` and `NEXT.md`

The closeout can remove completed maintenance bookkeeping.
It must preserve the active recovery program.

Keep these recovery actions in `.agents/TODO.md`:

1. Keep the exact Horizon question and repository.
2. Compare the answer with source at the returned `scannedRef`.
3. Do not use a permanent literal-`28` rule.
4. Keep the one-free-reading maintenance cadence.
5. Record later checks in the active round ledger.
6. Cite the `sls-080` resolved receipt after retirement.
7. Keep the three successful-recovery recurrence threshold.
8. Keep the three positive operation-selection miss trigger.
9. Keep the Docs-first, inspect, then one-later-Scout sequence.
10. Keep the case ID, result stamp, transcript, and finding identity requirements.
11. Keep the ADR-0008, `10-of-12`, and `0-of-8` gates.
12. Keep the separate spend authorization requirement.
13. Keep `sls-082` as the next available Scout ID.

Do not record future checks in the deleted `sls-080` file.
The resolved receipt and round ledger must become the durable homes.

Delete the `Refresh the recorded upstream states` item only after ledger reconciliation.
The current round already records all three states.

Delete the deletion-candidate item only after every expected receipt exists.
The expected receipts are `sd-001`, `sd-036`, and `sk-020`.
Add `sls-080` only after its separate resolution completes.

Update `.agents/NEXT.md` only after the resolver results are known.
Use generated counts from the final active tree.
Do not predict counts before the resolver runs.

Remove the completed free-maintenance ranked block after round closeout.
Keep the conditional repository-recovery line.
Keep every unrelated ranked block and owner decision.

These conditions preserve every useful future action.

## Golden edit gates

The golden change is not a text-only cleanup.
It changes judge-facing gospel and provenance.

Before editing the case:

1. Keep the exact pinned source results in the round ledger.
2. Confirm `sd-048` stays outside this golden's grading contract.
3. Confirm the sibling sweep remains clean.
4. Fix the write sequence for the future `sd-036` receipt reference.

The case edit must do all of these actions together:

- Remove the obsolete answer sentence.
- Remove only the obsolete `U32Val` avoid clause.
- Remove the obsolete `sd-036` grading caution.
- Remove the stale contradiction corroboration row.
- Replace `truth.verified` with the current verification event.
- Point `rootCause` to the final `sd-036` resolved receipt.
- Keep the stable permutation, helper-name, and privacy rules.

Do not leave an active finding path after the resolver deletes that file.
The final case must cite `improvements/resolved.json` for `sd-036`.

After the case edit, run these gates:

```sh
npm run eval:qa:compile
npm run eval:qa:register
npm run eval:qa:lint -- --since d9d03b2de67ada625f42193bdca50ffcb0dcaa0b
```

`eval:qa:compile` must change only the intended parsed case.
Commit the regenerated `eval/qa/cases.json` and `eval/qa/sample.json` changes.

`eval:qa:register` will update affected member hashes.
Review every reopened consistency cluster before closeout.

The diff-aware lint must run with `--since`.
The current no-argument lint skipped the gospel lane.

Current baseline result:

```text
[lint-corpus] NOTE gospel lane skipped: no --since ref
[lint-corpus] 0 error(s), 61 warning(s)
```

If a saved verdict used the stale caution, rejudge that row.
Record the verdict direction in the round ledger.

Run the offline plan grade against the last valid result artifact.
No `eval/qa/results/` artifact exists in this worktree now.
Do not claim this gate until an exact artifact path exists.

## Later write gates and sequence

### 1. File `sd-048`

Required gates:

1. Keep the source reads and dedupe result above.
2. Re-run `npm run improvements:lint`.
3. Re-run the filing dry-run.
4. Make the active `main` record public.
5. Make the immutable snapshot public.
6. Confirm the public blob matches the finding bytes.
7. Obtain authorization for the external filing write.

After filing, read the issue back from GitHub.
Confirm its title, author, body, marker, and five sections.
Then confirm the finding becomes `reported-upstream`.

### 2. Reconcile the golden

Required gates:

1. File `sd-048` first.
2. Apply the complete golden edit above.
3. Run compile, register, sibling, and diff-aware lint gates.
4. Resolve every consistency-register reopen.
5. Record any required rejudge and plan-grade result.

### 3. Retire `sd-036`

Required gates:

1. `sd-048` has a durable upstream issue URL.
2. The golden and generated corpus pass every gate.
3. The final golden points to the planned resolved receipt.
4. A public commit contains the fixed-state `sd-036` source.
5. The resolver dry-run prints the expected receipt and comment.
6. Post the resolution comment on issue `#1980` only.
7. Include the `sd-048` successor link in that comment.
8. Read the comment back with `gh api`.
9. A distinct reviewer verifies the comment and public blob.
10. Re-run the resolver without `--dry-run`.

Use the resolver command recorded in `opus-deletion-review.md`.
Do not pass `--upstream-commented` before the comment exists.

### 4. Mark and retire `sls-080`

Required gates:

1. Repeat the direct deployed trigger immediately before editing.
2. Repeat the source read at the returned `scannedRef`.
3. Update status to `fixed-upstream`.
4. Replace the stale open-issue evidence.
5. Add the deployed `1.9.16` result and source-parity fields.
6. Move the recurrence home into `TODO.md` and round ledgers.
7. Commit and publish the exact fixed-state finding.
8. Post the Raven resolution comment on issue `#1134`.
9. Read the comment back with `gh api`.
10. A distinct reviewer verifies the public blob and comment.
11. Run the resolver dry-run.
12. Re-run the resolver without `--dry-run`.

Do not use `--upstream-comment-na`.
This finding has a filed upstream issue.

### 5. Retire `sd-001` and `sk-020`

This gate did not re-derive those two fixes.
Their existing independent reviews remain required.

For `sd-001`, confirm the canary and settled reindex again.
Use `--upstream-comment-na` because no issue was filed.

For `sk-020`, repeat the deployed `skill.read` check.
Post and read back the comment on issue `#113`.
Pass `--repo stellar/stellar-dev-skill` to its resolver.

### 6. Reconcile queue files

Edit `.agents/TODO.md` only after each lifecycle outcome is known.
Edit `.agents/NEXT.md` only after every planned resolver finishes.

Then regenerate `improvements/INDEX.md`.
Do not edit the generated file by hand.

### 7. Final validation

Run these checks after all resolver and queue writes:

```sh
npm run improvements:index
npm run improvements:lint
npm run improvements:lint -- --live
npm run improvements:probes
npm run eval:qa:lint -- --since d9d03b2de67ada625f42193bdca50ffcb0dcaa0b
npm run typecheck
npm test
npm run build
npm run secrets:scan -- --tree
git diff --check
```

Run `npm run test:smoke` only if closeout changes touch `src/executor` or `src/demo`.
The current plan does not touch those paths.

Run the requested final independent diff review.
Reconcile every finding before round closeout.

## Concrete file-by-file edit plan

| file | later action | required result |
|---|---|---|
| `eval/qa/corpus/battery/protocol-core/q-protocol-bn254-poseidon-xray.json` | Remove obsolete cautions and refresh current provenance. | No stale `U32Val`, Protocol 24, or active `sd-036` claim remains. |
| `eval/qa/cases.json` | Regenerate with `npm run eval:qa:compile`. | The compiled case matches the owned case. |
| `eval/qa/sample.json` | Regenerate with `npm run eval:qa:compile`. | Bytes match the compiler output. |
| `eval/qa/consistency-register.json` | Run `npm run eval:qa:register`. | Every affected cluster has a reviewed final state. |
| `improvements/stellar-docs/sd-048-cap-0075-poseidon2-sbox-degree-contradiction.md` | File through the standard script. | Status becomes `reported-upstream` with a durable URL. |
| `improvements/stellar-docs/sd-036-cap-0075-protocol-version-field-selector-errata.md` | Retire through the resolver. | The file leaves the active tree after all gates pass. |
| `improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md` | Update, publish, comment, then retire. | The resolved receipt contains deployed source-parity evidence. |
| `improvements/stellar-docs/sd-001-protocol-n-vs-sep-n-tokenization.md` | Retire through its approved resolver path. | The monitor canary remains after file deletion. |
| `improvements/skills/sk-020-standards-skill-stale-discord-vanity.md` | Retire through its approved resolver path. | The receipt records the deployed skill read. |
| `improvements/resolved.json` | Let each resolver append its receipt. | IDs remain unique and receipts contain public source commits. |
| `improvements/intake.json` | Let resolvers remove retired overrides. | Keep the active `sd-048` override. |
| `improvements/INDEX.md` | Regenerate after all lifecycle changes. | Generated bytes match the active tree. |
| `.agents/TODO.md` | Remove completed bookkeeping and preserve recovery rules. | Future monitoring no longer writes into a deleted finding. |
| `.agents/NEXT.md` | Recompute state and ranking after receipts exist. | No completed maintenance block remains active. |
| `.agents/rounds/2026-09-01-free-improvements-maintenance.md` | Record URLs, receipts, checks, and final review. | The ledger contains actual outcomes, not planned outcomes. |

## Source references

- `stellar/stellar-protocol` CAP-0075: `65e2b6262c0825494caf2a94116eb512c8335f22/core/cap-0075.md`
- `stellar/rs-soroban-env` ABI: `a7e15b439c4b49b17ba8f9e4527efee8d8119aba/soroban-env-common/env.json`
- `stellar/rs-soroban-env` host constant: `a7e15b439c4b49b17ba8f9e4527efee8d8119aba/soroban-env-host/src/crypto/poseidon/mod.rs`
- `stellar/rs-soroban-env` Poseidon2 validation: `a7e15b439c4b49b17ba8f9e4527efee8d8119aba/soroban-env-host/src/crypto/poseidon/poseidon2_params.rs`
- `stellar/stellar-horizon` source: `82660510ecda7fd365a14d08badb9d85fa22bc32/internal/ingest/main.go`
- CAP fix issue: `https://github.com/stellar/stellar-protocol/issues/1980`
- CAP fix PR: `https://github.com/stellar/stellar-protocol/pull/1996`
- Scout fix issue: `https://github.com/Stellar-Light/stellarlight/issues/1134`
- Scout plain-language fix PR: `https://github.com/Stellar-Light/stellarlight/pull/1174`
- Deployed Scout status: `https://stellarlight.xyz/api/status`
- Deployed Scout trigger: `https://stellarlight.xyz/api/repos/explain`

## Final gate result

All six requested decisions are evidence-supported.
No lifecycle write should start until the listed preconditions pass.
Both public `sd-048` source blockers must clear before filing.
