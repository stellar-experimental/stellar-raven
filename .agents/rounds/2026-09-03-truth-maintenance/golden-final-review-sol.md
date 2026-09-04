# Golden-truth final review

Review date: 2026-09-03
Reviewer: Sol, independent from the Terra implementation lane
Verdict: **CHANGES-REQUIRED**

The intended world facts are correct.
The implementation has provenance, register, and new-lint defects.
These defects prevent a final pass.

I made no implementation edits.
I used only free, read-only public sources.
I made no paid calls and no deployment.

## Corroboration matrix

| Case | Independent evidence | Truth result | Implementation result |
|---|---|---|---|
| `q-scf-current-round` | A: SCF awards index. C: Scout RFP response. | #46 is in Submission through 2026-11-08. #45 is in Panel Review. #44 ended. | **Change required.** The answer is correct. One source note overstates its linked page. One avoid item adds a lint warning. |
| `q-edge-fresh-latest-scf-round` | A: SCF awards index. C: Scout RFP response. | The same #46, #45, and #44 state is confirmed. | **Change required.** The truth is correct. One avoid item adds a lint warning. |
| `q-scf-open-rfps` | A: SCF RFP track and awards index. C: Scout RFP response. | Two briefs remain open. Scout returns one synthetic #46 row. | Pass. |
| `q-scf-rfp-tooling` | A: SCF RFP track. C: Scout RFP response. | Two briefs remain open. The interest path remains invitation-gated. | **Change required.** One key fact adds two lint warnings. |
| `q-ti-stellar-lab-usage-and-new-ui` | A: Saved Keypairs docs. B: Laboratory source. F: rendered Lab UI. | The documentation conflicts with the source and UI. | The case passes. The related `sd-049` evidence needs one source link. |
| `q-soroban-sdk-cve` | B: GitHub advisory API. D: OSV records. | All three advisory mappings and patch versions remain current. None is withdrawn. | **Change required.** The refreshed corroboration cites NVD while the verification record claims OSV. |
| `q-edge-factcheck-soroswap-first-amm` | A/B: Protocol 18 and CAP-0038. D/F: DefiLlama Soroswap series. | Broad first-AMM wording remains false. TVL remains about $1.19M and below $10M historically. | **Change required.** The latest verification event remains dated 2026-08-27. |
| `q-ti-rpc-gettransactions-pagination-xdr` | A: RPC documentation. B: current RPC options source. | The documentation says hardcoded. The source exposes configurable 200 and 50 defaults. | **Change required.** Two evidence notes are attached to the wrong source records. |
| `q-tool-cli-skills-discovery` | C: Scout skills response. A/B: official skill sources. | Scout reports 43 rows and the stated source and kind enums. | Pass. |
| `q-tool-indexer-repos-discovery` | C: Scout repository search. B: direct repository records. | The current result preserves the stated repository roles. | Pass. |
| `q-tool-leaderboard-open-issues` | C: Scout leaderboard. D: GitHub count semantics. | Issue totals exclude pull requests and describe backlog size. | Pass. |
| `q-tool-sdk-repos-discovery` | C: Scout repository search. A/B: official SDK sources. | Current rows remain dynamic and source-scoped. | Pass. |
| `q-tool-skill-detail-install` | C: Scout skill detail. A/B: official skill source. | `soroban` returns 404. `smart-contracts` is the current topic match. | Pass. The live source also confirms the proposed `sk-021` defect. |
| `q-tool-smart-wallet-repos-discovery` | C: Scout repository search. B: direct repositories. | `stellar/passkey-kit` and `stellar/smart-account-kit` remain current. | Pass. |
| `q-pc-slp-0004-0006-status` | B: current SLP source files. | SLP-0004 remains Final. SLP-0006 remains Draft. | Pass. |

## Required findings

### F1 — The Soroswap verification record is stale

File: `eval/qa/corpus/battery/edge-behavior/q-edge-factcheck-soroswap-first-amm.json`

The answer and `truth.asOf` changed to 2026-09-03.
The current TVL example also changed.
However, `truth.verified.date` remains `2026-08-27` at line 113.
The `by` value also names the old review at line 114.

This violates the latest-verification rule.
It also violates the approved `golden-sol.md` metadata plan.

Apply these exact corrections:

- Set `truth.verified.date` to `2026-09-03`.
- Set `truth.verified.by` to the exact value from `golden-sol.md`.
- Set the changed-gospel root cause to `freshness-drift`.
- Refresh the dated DefiLlama corroboration for the 2026-09-03 value.

Do not use `freshness-recheck` for this value change.

### F2 — The RPC dispute evidence notes are reversed

File: `eval/qa/corpus/battery/tooling-infra/q-ti-rpc-gettransactions-pagination-xdr.json`

The class B record at lines 83–86 describes the class A page.
The class A record at lines 95–98 describes the class B source.
The dispute's class B record still has `observedAt: 2026-07-11` at line 103.

Apply these exact corrections:

- Put the configurable-options note on `corroboration[0].evidence[1]`.
- Put the hardcoded-page note on `corroboration[1].evidence[0]`.
- Set `corroboration[1].evidence[1].observedAt` to `2026-09-03`.

The disputed answer wording remains correct.

### F3 — One SCF source note overstates its linked page

File: `eval/qa/corpus/battery/scf-grants-builders/q-scf-current-round.json`

The source at lines 44–46 links only the SCF #45 detail page.
That page confirms only #45 in Panel Review.
It does not show the full #46, #45, and #44 sequence.

Replace its note with:

> Official SCF #45 detail page observed 2026-09-03; it showed #45 in Panel Review.

The awards-index source already supports the full sequence.

### F4 — `cluster-081` contains a live contradiction

File: `eval/qa/consistency-register.json`

`cluster-081` is stamped consistent on 2026-09-03.
Its `reSwept.reason` says both cases report one synthetic #46 row.
However, its note at line 2007 still says `syntheticRounds=0`.
It also says #45 is in Initial Review.

Replace the note with:

> As of 2026-09-03, the official Q3 page and live feed support two open briefs. The live response has syntheticRounds=1, #46 is in Submission, and #45 is in Panel Review.

Run the register helper again after the case corrections.

### F5 — The implementation adds four authoring-lint warnings

The stale lint reports 66 warnings.
The approved pre-edit report had 62 warnings.
The four new warnings belong to three changed cases.

Remove this avoid item from both SCF round cases:

> Do NOT present a live phase or deadline as permanent.

It appears in these files:

- `q-scf-current-round.json`, line 19.
- `q-edge-fresh-latest-scf-round.json`, line 21.

The item is a presentation rule, not a concrete false-content trap.
The other avoid items already protect the dated facts.

Replace the `q-scf-rfp-tooling` key facts with this five-item list:

```json
[
  "Makes the as-of date visible for each changeable roster or status.",
  "Reports two open infrastructure briefs.",
  "Reports one synthetic SCF #46 round row.",
  "Explains the rolling interest-form-to-invitation path.",
  "Does not treat an open brief as guaranteed eligibility."
]
```

This removes the compound and false-negative warnings.
It preserves the approved meaning.

### F6 — The advisory provenance names two different class D sources

File: `eval/qa/corpus/battery/soroban/q-soroban-sdk-cve.json`

The corroboration records at lines 83–96 cite NVD.
The latest verification record at line 106 says OSV supplied the independent check.
`golden-sol.md` required GitHub and OSV evidence.

Replace the three class D refs with these live OSV records:

- `https://api.osv.dev/v1/vulns/CVE-2026-24889`
- `https://api.osv.dev/v1/vulns/CVE-2026-26267`
- `https://api.osv.dev/v1/vulns/CVE-2026-32322`

The live OSV records confirm the current mappings and fixed versions.
Keeping NVD is also acceptable if the verification text names NVD instead.
The record must name the source that was checked.

### F7 — `sd-049` overstates one cited source file

File: `improvements/stellar-docs/sd-049-lab-saved-keypairs-obfuscation-conflict.md`

The evidence at line 9 says the storage helper shows `secretKey` in `SavedKeypair`.
The helper shows direct `JSON.stringify` serialization.
The separate type file defines `SavedKeypair.secretKey`.

Add this source to the finding evidence:

> https://github.com/stellar/laboratory/blob/master/src/types/types.ts#L322-L325

Then split the current evidence sentence into two source-specific statements.

## Consistency, invariants, and traps

The SCF Submission invariant matches the live #46 state.
Its A and C evidence classes are suitable.
Its member hashes are current.

`cluster-122` correctly preserves the fixed SCF #43 result.
The other reopened SCF clusters contain no factual conflict.
`cluster-137` correctly records the Saved Keypairs dispute.

Only `cluster-081` fails the semantic register review.
The register helper does not detect this stale note.

The SCF date-triggered trap correctly records the fired phase change.
Its expanded case list is correct.
The Protocol 28 trap did not fire.
Mainnet remains on Protocol 27 and supports Protocol 28.
The other reviewed traps do not need changes.

## Unresolved cases

`q-ti-rpc-gettransactions-pagination-xdr` must remain disputed.
The official page and the current source still disagree.

`q-ti-stellar-lab-usage-and-new-ui` must remain disputed.
The official page and the current source and UI still disagree.

No other changed case remains unresolved.

## Proposed findings and filing gate

The live review confirms the `sd-049` trigger.
The live review also confirms the `sk-021` trigger.
The permanent-ID choice `sk-021` is correct because `sk-020` is reserved.

Both files correctly remain `proposed`.
`improvements:lint` accepts both files.
The generated index contains both findings.

The TODO item correctly blocks upstream filing before independent verification.
This review supplies that independent verification.
Do not file either finding until F7 is corrected.
Use `npm run improvements:file` after the normal intake checks.

## Verification results

| Check | Result |
|---|---|
| `npm run eval:qa:compile` | PASS. It produced 500 cases, 30 samples, and 500 reserved IDs. |
| Corpus SHA-256 | `2059e1e5c7103d4ded6e56b4fa68ddafedb896b40b463e7813704f51d992c4ae` |
| Changed source cases versus `eval/qa/cases.json` | PASS. All 15 entries match exactly. |
| `npm run eval:qa:lint -- --since 2ee801f80d626e68f010392a7d541aab7997349d --stale --today 2026-09-03` | PASS with 0 errors and 66 warnings. Four new warnings require F5. |
| `npm run eval:qa:register -- --check` | PASS. The generated hashes are current. F4 remains a semantic defect. |
| `npm run improvements:lint` | PASS with 68 findings. |
| `git diff --check` | PASS. |

The generated artifacts are current and byte-consistent with the source cases.
No lifecycle state changed.

## Final reconciliation re-review

Verdict: **PASS**

The F1 through F7 corrections match `golden-sol.md` and the cited evidence.

| Finding | Result | Verification |
|---|---|---|
| F1 | PASS | Soroswap uses the required date, reviewer text, root cause, and DefiLlama evidence. |
| F2 | PASS | The RPC case now separates the configuration source from the conflicting official page. |
| F3 | PASS | The SCF #45 note names Panel Review. The case has no permanent presentation requirements. |
| F4 | PASS | `cluster-081` now records two briefs, one synthetic round, #46 Submission, and #45 Panel Review. |
| F5 | PASS | The three SCF cases now avoid the four identified presentation-only warnings. |
| F6 | PASS | The CVE verification now cites the three live OSV records used for verification. |
| F7 | PASS | `sd-049` now separates serialization evidence from the `SavedKeypair.secretKey` type evidence. |

Both disputed cases retain the correct status.
`q-ti-rpc-gettransactions-pagination-xdr` remains `disputed` because the official sources conflict.
`q-ti-stellar-lab-usage-and-new-ui` remains `disputed` because the page, source, and interface conflict.

All reviewed consistency clusters have current hashes and `2026-09-03` sweep dates.
Their notes now describe the registered case semantics.
The SCF Submission invariant matches #46, #45, and #44.
The SCF date-triggered trap records the fired phase change and the complete six-case scope.
The other reviewed traps do not require changes.

The compiled corpus contains 500 cases.
Its SHA-256 is `623cd65816979285338865d7e62043bbe2247f083f5b1492d94b5c8805a1d915`.
All 15 changed source cases match their compiled entries.
All 15 cases use `truth.verified.date: 2026-09-03`.
The lifecycle registry contains 500 active cases and no other lifecycle states.

The stale lint baseline is 62 warnings and zero errors.
This count matches the expected baseline in `golden-sol.md`.

The `sd-049` and `sk-021` findings remain accurate and `proposed`.
The improvements index contains both findings and 68 total findings.
The TODO independent-verification gate is now satisfied.
The user did not authorize status changes or upstream filing.
Therefore, both findings correctly remain `proposed`.

| Check | Final result |
|---|---|
| `npm run eval:qa:compile` | PASS. 500 cases, 30 samples, and the expected corpus hash. |
| Focused stale lint | PASS. Zero errors and 62 warnings. |
| `npm run eval:qa:register -- --check` | PASS. The register is current. |
| `npm run improvements:lint` | PASS. It validates 68 findings. |
| `git diff --check` | PASS. |

No reconciliation finding remains open.
This review made no implementation edit.

## Final judge prompt fixture reconciliation

The Soroswap golden now uses the 2026-09-03 TVL observation and the refreshed answer text.
Its prompt fixture changed from `7ae0a8e4575fe3cdd7dd973c395beb5f7184a1039dd1b1f23bcbac5980bcd8f8`.
The new fixture is `9cbc76ff1bb5e6d46edc0df684a9cdd048d8d2469630fa94aceeeab9385a6254`.
No other entry changed in the 15-entry fixture map.
`node eval/qa/judge.mjs --self-test-static` passed all 15 fixtures and all static guards.
The review made no implementation edit and made no paid call.

PASS
