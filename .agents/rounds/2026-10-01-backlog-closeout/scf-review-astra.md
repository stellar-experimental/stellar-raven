# SCF source exposure review — scf-astra

Reviewed on 2026-10-01. This review changed no repository file.
Local HEAD: `bcfa617ffcb6e58e6a7498a1e42135a059535402`.
Upstream HEAD: `b9a1509fb4230a191ab0055c2beca29303c1a30c`.

## Verdict

### Case against pinning

**Do not pin all twelve. Do not pin the current source unchanged.**

1. **The source contains instructions that conflict with the current Scout contract.**
   `scf-live-context` identifies the current round from an open RFP row.
   Scout separates open briefs, round identity, and the submission window.
   The claim verifier requires this incorrect sibling workflow before scoring.
   A successful exposure scrub leaves these instructions unchanged. [E1, E2]

2. **The claim verifier overstates status evidence.**
   Its lines 83–85 say status comes from human verification.
   Scout supports `source-inherited`, `unverified`, `repo-activity`, and other distinct evidence classes.
   An inherited status label does not prove current operation or human review.
   This conflict directly affects the proposed skill's central task. [E3]

3. **Funding instructions do not match the current evidence model.**
   The verifier describes empty award-round arrays as attribution gaps.
   Scout also represents legitimate awards without round numbers through `scfRoundAwards`.
   The budget builder calculates sample medians from cumulative project totals, then calls the observations awards.
   Its sampling warning does not correct that unit error.
   The submission drafter and round reviewer repeat weaker versions of that method. [E4]

4. **The standard directory layout does not deliver every dependency.**
   Each candidate skill directory contains only `SKILL.md`.
   Four bodies reference root `docs/` files.
   The submission drafter requires a root template as its output structure.
   The round reviewer requires `CLAUDE.md`, which does not exist anywhere in the upstream tree.
   Raven exposes catalog addresses, so a relative link does not create a readable companion file. [E5]

5. **The new descriptions compete with useful existing results.**
   I tested the current search code with candidate entries held only in memory.
   The twelve-skill candidate puts incorrect `scf-live-context` first for `current SCF round deadline`.
   It removes the claim verifier from the first three results for `verify claims in an SCF submission`.
   The submission drafter takes that place.
   Even the two-skill selection changes broad application results, so it still needs the full routing comparison. [E6]

6. **Reference delivery still exposes the reader to external instructions.**
   I found no literal authentication secret or instruction that overrides host authority in the twelve bodies.
   However, the document fetcher suggests authenticated `gh api` calls.
   The round reviewer requires external packages and agent orchestration.
   Referral and tranche workflows describe sharing, submission, access changes, and an audit co-pay.
   The admission policy permits this reference content, but it requires recorded risks and preserves separate action authority. [E7]

7. **Maintenance requires more than checking hashes.**
   These July bodies now disagree with September Scout evidence semantics.
   Some application instructions also differ from the current handbook.
   For example, the interest-form body describes batch review, while the handbook describes rolling review.
   Twelve new searchable skills also require twelve active QA cases and review of future selected-body changes. [E8]

### Strongest case for pinning

The new source offers useful workflows beyond pitch positioning.
The claim verifier checks attribution, missing records, code evidence, and unsupported mainnet claims before reviewers lower scores.
The tranche reporter maps original promises to completion evidence and explains deviations.
Neither exposed SCF positioning skill supplies that complete reporting workflow.
The pinned Scout body explicitly sends submission-review requests to this external plugin. [E9]

These skills add no exclusive data or new service operation.
An agent can assemble similar answers today from existing operations, the handbook, and user evidence.
Their benefit is a reusable, discoverable method with explicit evidence checks.
That benefit supports a small selection after correction; it does not support automatic admission of the whole repository.

**Verdict: pin after named fixes, for these two upstream IDs only:**

- `scf-claim-verifier`
- `scf-tranche-reporter`

Keep the other ten unpinned for this admission.
Use a new source ID because `stellar-light` already identifies the Scout repository.
With source ID `scf`, the proposed Raven IDs are `skills.scf.scf-claim-verifier` and `skills.scf.scf-tranche-reporter`.
These IDs do not exist in the current manifest.
If the fixes or acceptance gates fail, pin none.
This verdict approves neither the current bytes nor deployment.

## Per-skill table

Each link identifies the complete body reviewed at the upstream commit above.
“Keep unpinned” applies to this admission; it does not assert that the workflow has no value.

| Skill | Fit and added value | Risks | Decision |
| --- | --- | --- | --- |
| [scf-budget-builder][budget] | Distinct budget validation, beyond pitch benchmarks. | Project totals become award medians. Fixed rate bands and rule checks need current evidence. | Keep unpinned. Correct the statistical unit before a later admission. |
| [scf-claim-verifier][claim] | Strong fit. Adds claim checks and safeguards against unsupported negative findings. | Incorrect status provenance; incomplete award semantics; required incorrect round-context sibling. | Select only after fixes P1–P3 and all common gates. |
| [scf-competitor-analyst][competitor] | Limited additional coverage. Radar and Scout already support competitors and differentiation. | Strong routing overlap. `scfAwarded: false` cannot prove that a project launched without SCF. | Keep unpinned. Existing skills cover the main task. |
| [fetch-external-doc][fetch] | Useful external document retrieval, but mostly general client instructions. | Authenticated GitHub prompt; optional absent `read-gdoc`; tool-specific assumptions; untrusted applicant documents. | Keep unpinned. The directory alias `scf-fetch-external-doc` is not its upstream name. |
| [scf-interest-form-drafter][interest] | Distinct form output, with substantial pitch overlap. | Unpinned root guides; batch-review claim differs from the handbook; referral steps need current confirmation. | Keep unpinned. Fix rules and reference delivery before a later comparison. |
| [scf-live-context][live] | Focused freshness guidance, largely covered by Scout and `scout.scfPitch`. | Incorrect open-RFP rule can override the correct current schema. Broad description wins a deadline query. | Keep unpinned. Put correct round guidance inside selected workflows. |
| [scf-prescreen-checker][prescreen] | Distinct completeness checklist. | Treats cumulative project funding as a cap input without reconciling award types. Prescreen labels can overstate authority. | Keep unpinned. Verify the cap basis and distinguish simulated checks from official decisions. |
| [scf-referral-preparer][referral] | Distinct referral package and conflict disclosure. | Unpinned guides; sharing steps; mutable form rules and rewards. Current rules support codes and/or forms. | Keep unpinned. Confirm the required sequence before exposing it as universal. |
| [scf-reviewer][reviewer] | Distinct assessment framework. | Overlaps the selected claim checks. Broad scoring guidance carries rule and evidence risks beyond claim verification. | Keep unpinned. A later admission needs official-rule reconciliation and separate quality evidence. |
| [scf-round-reviewer][round] | Distinct batch review and calibration. | Missing required `CLAUDE.md`; five sibling dependencies; package installation; budget defects; large body; CSV output contradicts its description. | Keep unpinned. The supplied workflow is incomplete. CSV and network use alone are not exclusions. |
| [scf-submission-drafter][submission] | Full application drafting extends the existing pitch workflow. | Required unpinned template; cumulative-total benchmarks; outdated referral assumptions; broad routing competition. | Keep unpinned. Repair dependencies and evidence before a later admission. |
| [scf-tranche-reporter][tranche] | Strong fit. Adds post-award evidence reporting with an inline output template. | Root guides remain unpinned. Mandatory UX language needs reconciliation. Submission and access changes need separate authority. | Select only after fixes P2–P3 and all common gates. |

## Preconditions

**P1 — Correct the claim verifier upstream.**

- Use `statusBasis`, `statusAsOf`, and `statusSourceUrl` when discussing lifecycle evidence.
- Keep lifecycle status separate from deployment and verified activity.
- Use `scfRoundAwards`, `scfSourceUrl`, and `scfAsOf` when reporting awards.
- Explain legitimate unnumbered awards and undisclosed amounts. Do not label every empty array an attribution failure.
- Check project identity before accepting the first ranked search result as the applicant.
- Make round context self-contained through `scout.getRfps` and its `meta.scfRound` fields.
- Separate the current round, historical review round, open briefs, and the submission window.
- Remove the required dependency on the unselected `scf-live-context` body.
- Keep dated coverage measurements clearly historical. Do not present July examples as current observations.

**P2 — Correct the tranche reporter's policy and reference contract upstream.**

- Verify tranche conditions, audit terms, and UX wording against current official sources before selecting a new commit.
- Reconcile the mandatory UX wording with the root guide's statement that UX is not a separate payout gate.
- Preserve the original approved deliverables as the review basis, including appropriate equivalents for infrastructure and tooling.
- State that document preparation does not authorize submission, payment, publication, or access changes.
- Deliver required guidance inside the selected skill directory, or make the body complete without external files.
- Keep optional external guides clearly external, with immutable source links and recorded limits.
- Do not claim that `codemode.skill.read` can fetch an unselected root document.

The UX wording needs reconciliation; this review does not establish a new official UX requirement.
The handbook index and guessed tranche page failed to load during this review.
I did not substitute those failures for evidence about official policy.

**P3 — Complete a new source admission.**

1. Review the corrected commit and all selected companion files. Re-run hashes and the exposure scrub.
2. Add an explicit pick list for the two skills. Record all ten excluded directories in `unpinnedUpstream` with reasons.
3. Add the source, license notice, intake mappings, groups, and exposed inventory rows.
4. Record the new selection digest and accepted external-action risks in `PIN-REVIEW.md`.
5. Commit QA cases as `proposed` before the admission commit, as the admission instructions require.
6. Obtain independent `golden-truth` review, activate the cases, and regenerate the QA artifacts.
7. Include status-provenance, unnumbered-award, closed-window, missing-evidence, and tranche-deviation cases.
8. Rebuild generated artifacts through their scripts. Run the required source, code, and QA checks.
9. Compare complete routing results with the accepted baseline. Keep thresholds unchanged and explain every changed result.
10. Review broad application, pitch, budget, deadline, claim-review, and tranche queries for unwanted skill selection.
11. Obtain independent review of the completed admission. Treat deployment approval as a separate step.

A description override or search change requires its own routing evidence.
Do not edit the exposure scrub to hide factual defects in these bodies.
Do not use the directory snapshot as the source of skill descriptions.
For example, `scf-budget-builder` currently describes validation, despite its directory's construction-oriented description.

## Evidence

**E1 — Current source and reviewed files.**

The [GitHub HEAD lookup](https://api.github.com/repos/Stellar-Light/awesome-stellar-community-fund/commits/HEAD) returned `b9a1509fb4230a191ab0055c2beca29303c1a30c`.
The [commit tree](https://api.github.com/repos/Stellar-Light/awesome-stellar-community-fund/git/trees/b9a1509fb4230a191ab0055c2beca29303c1a30c?recursive=1) contains twelve `SKILL.md` files.
I downloaded and read all twelve, and verified every Git blob hash.
I also read the root license and two root guides.
The [MIT license](https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/b9a1509fb4230a191ab0055c2beca29303c1a30c/LICENSE) names LumenLoop as copyright holder.
The prior body review used this same upstream commit.

**E2 — Round-context conflict.**

- `scf-live-context/SKILL.md:16–32` gives the open-row rule.
- `scf-claim-verifier/SKILL.md:95–97` requires that sibling.
- Local `catalog/manifest.json:9351`, `:9379`, and `:9513` distinguish brief status from round identity and window state.
- Pinned [Scout body, lines 137–141][scout-round] gives the newer distinction.
- Local `ecosystem-skills/PIN-REVIEW.md` records that distinction in its 2026-09-16 pairing entry.

**E3 — Status evidence conflict.**

- `scf-claim-verifier/SKILL.md:81–85` asserts human verification.
- Local `catalog/manifest.json:16895–16927` defines lifecycle, dates, and evidence classes.
- The current schema expressly permits inherited and unverified labels.

**E4 — Award semantics and statistical units.**

- `scf-claim-verifier/SKILL.md:36–45` and `:114–124` describe the older fields and coverage explanation.
- Local `catalog/manifest.json:16795–16883` defines amount status, provenance, unnumbered awards, and cumulative totals.
- `scf-budget-builder/SKILL.md:16–35` computes medians from project totals.
- `scf-submission-drafter/SKILL.md:39–47` and `scf-round-reviewer/SKILL.md:174–187` repeat the benchmark method.

**E5 — Missing dependency delivery.**

- Local `ecosystem-skills/update.sh:81–110` selects Markdown beneath chosen skill directories.
- Local `src/skills/store.ts:1–12` defines exact catalog reads and rejects uncataloged companions.
- `scf-submission-drafter/SKILL.md:51–66` and `:145–169` require the root template and reference root guides.
- `scf-round-reviewer/SKILL.md:14–52` requires external skills and absent `CLAUDE.md` instructions.
- `scf-tranche-reporter/SKILL.md:135–140`, `:201–205`, and `:209–214` contain mandatory UX wording and root-guide references.
- The [root UX guide][ux] says UX is not a separate payout gate.
- The [root tranche guide][tranche-guide] also permits an equivalent mainnet milestone.

**E6 — Free local routing diagnostic.**

Command: `node /tmp/scf-astra-evidence/probe.mjs`.
Output: `/tmp/scf-astra-evidence/local-checks.txt`.
The probe uses the current `loadManifest`, `searchCatalog`, `skillDescription`, and `scrubNonExposedRefs` functions.
It compares the baseline, all twelve, claim-only, and the selected pair at `limit: 3`.
Candidate entries use upstream descriptions, verified transport hashes, and the provisional `scf` source ID.
The probe adds no sections and changes no repository file.
Sections do not compete in search under the current catalog contract.

| Query | Baseline | All twelve | Selected pair |
| --- | --- | --- | --- |
| `current SCF round deadline` | `scout.scfPitch` ranks first. | Incorrect `scf-live-context` ranks first. | The first three results remain unchanged. |
| `verify claims in an SCF submission` | Radar ranks first. | Submission drafter ranks second; claim verifier is absent from the first three. | Claim verifier ranks second. |
| `draft my SCF pitch` | `scout.scfPitch`, Scout, then `lumenloop.list_research`. | Two drafting skills replace the second and third results. | The first three results remain unchanged. |
| `SCF application` | `lumenloop.get_scf_submissions` ranks third. | Claim verifier enters second and displaces that result. | The same displacement occurs. |
| `SCF tranche report` | `scout.scfPitch` ranks first. | Tranche reporter ranks first. | Tranche reporter ranks first. |

These seven query probes are diagnostics, not the acceptance gate or proof of better answers.
The full routing comparison and QA measurement remain outstanding.
An initial probe failed schema validation because its temporary entries omitted transport and provenance.
I corrected the probe; the final run passed without changing repository code.
All twelve exposure-scrub checks returned unchanged text.

**E7 — Admission rules and retained prompts.**

- Local `ecosystem-skills/README.md:207–264` defines the admission bar and required gates.
- Local `ecosystem-skills/PIN-REVIEW.md:1–42` requires review of served prompt text and each selection change.
- `fetch-external-doc/SKILL.md:143–177` names `read-gdoc` and authenticated GitHub access.
- `scf-round-reviewer/SKILL.md:14–28` requires external packages.
- `scf-referral-preparer/SKILL.md:224–240` describes sharing the package.
- `scf-tranche-reporter/SKILL.md:119–133` and `:189–199` describe submission, audit terms, and access changes.

**E8 — Current official sources and freshness limits.**

The [current Build Award handbook](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award) describes rolling interest-form review and emailed invitations.
It also requires compliance and identity checks before funds issue.
The interest-form skill describes batches at line 27.
The [current referral terms](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/referral-program) permit referral codes and/or a referral form.
Thus, admission must verify workflow instructions against current rules, beyond checking public endpoints.
I did not audit every award rule, rate band, or historic funding example.

**E9 — Existing coverage and distinct outputs.**

I fetched both exposed skill bodies from their current manifest URLs and verified their SHA-256 hashes.
[Radar][radar] covers prior submissions, competitors, categories, and a positioning brief.
[Scout][scout] covers idea research, pitch preparation, and RFP comparison.
Scout's line 44 sends submission-review requests to the external SCF plugin.
The candidate claim verifier supplies five evidence checks and explicit missing-data safeguards.
The candidate tranche reporter supplies an inline completion-evidence report.
These outputs justify the conditional selection.

**Review boundaries and checks.**

- I read `COMMON.md` only for authority and rules, then followed `lane-scf-review.md`.
- I read decision K, the earlier body review, the source configuration, the pin ledger, and current catalog contracts.
- Free GitHub reads, body-hash checks, the local scrub, and the routing diagnostic completed.
- `git diff --check` passed. `git status --short` remained empty.
- I ran no full test suite, build, paid evaluation, service, deployment, or applicant workflow.
- Spend: none.
- Changed repository paths: none. The report and temporary evidence are the only written artifacts.

[budget]: https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/b9a1509fb4230a191ab0055c2beca29303c1a30c/skills/scf-budget-builder/SKILL.md
[claim]: https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/b9a1509fb4230a191ab0055c2beca29303c1a30c/skills/scf-claim-verifier/SKILL.md
[competitor]: https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/b9a1509fb4230a191ab0055c2beca29303c1a30c/skills/scf-competitor-analyst/SKILL.md
[fetch]: https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/b9a1509fb4230a191ab0055c2beca29303c1a30c/skills/fetch-external-doc/SKILL.md
[interest]: https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/b9a1509fb4230a191ab0055c2beca29303c1a30c/skills/scf-interest-form-drafter/SKILL.md
[live]: https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/b9a1509fb4230a191ab0055c2beca29303c1a30c/skills/scf-live-context/SKILL.md
[prescreen]: https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/b9a1509fb4230a191ab0055c2beca29303c1a30c/skills/scf-prescreen-checker/SKILL.md
[referral]: https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/b9a1509fb4230a191ab0055c2beca29303c1a30c/skills/scf-referral-preparer/SKILL.md
[reviewer]: https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/b9a1509fb4230a191ab0055c2beca29303c1a30c/skills/scf-reviewer/SKILL.md
[round]: https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/b9a1509fb4230a191ab0055c2beca29303c1a30c/skills/scf-round-reviewer/SKILL.md
[submission]: https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/b9a1509fb4230a191ab0055c2beca29303c1a30c/skills/scf-submission-drafter/SKILL.md
[tranche]: https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/b9a1509fb4230a191ab0055c2beca29303c1a30c/skills/scf-tranche-reporter/SKILL.md
[ux]: https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/b9a1509fb4230a191ab0055c2beca29303c1a30c/docs/ux-readiness.md#L1-L9
[tranche-guide]: https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/b9a1509fb4230a191ab0055c2beca29303c1a30c/docs/submitting-tranches.md
[radar]: https://github.com/lumenloop/lumenloop-skills/blob/d92c56bda17ab702d3202335cfe814d64e70e191/skills/scf-submission-radar/SKILL.md
[scout]: https://github.com/Stellar-Light/stellar-scout/blob/3b587aa9f23d21fc572f6e93cb6d11031dbc24e6/SKILL.md
[scout-round]: https://github.com/Stellar-Light/stellar-scout/blob/3b587aa9f23d21fc572f6e93cb6d11031dbc24e6/SKILL.md#L137-L141
