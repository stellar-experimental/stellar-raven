# SCF skills exposure review (owner decision K): scf-fable

Reviewer: `scf-fable`, Claude Fable 5.1 (`claude-fable-5-1`), product, API, and taste tier.
Date: 2026-10-01. Worktree `scf`, branch `feat/scf-skills`, HEAD `bcfa617f`, clean before and after.
This review is read-only. It made no paid call. It did not read the other reviewers' reports.

## Verdict

**Pin none now.** No `scf-*` skill passes admission in its current upstream state.

The reasons, in order of weight:

1. **Routing cost is measured, and it is large.** A local simulation added the candidate skills
   to a scratch copy of `catalog/manifest.json`. Every multi-skill set breaches the legacy routing
   band. The eleven "fit" skills move legacy top-1/3/5 from 219/298/326 to 215/288/323. The new
   skills capture SCF *fact* questions that an operation must answer.
2. **The bodies carry content defects that Raven cannot repair.** Raven pins bytes and scrubs only
   exposure references. `scf-live-context` is wrong against the live `scout.getRfps` response
   today. Six bodies link to pages that return 404. Four bodies state a marketing rule that the
   current handbook contradicts for the Integration Track.
3. **The marginal answer is small for most skills.** Raven already exposes `scout.scfPitch`,
   `scout.vetIdea`, `scout.getRfps` with `meta.scfRound`, handbook search through
   `scout.searchResearch`, and two SCF skills. The Scout schemas already carry the honesty rules
   that `scf-claim-verifier` teaches.
4. **Upstream is dormant.** The last commit is 2026-07-23. Its dated facts decayed on the Q3
   round change, and nobody corrected them.

**Conditional path, not a pin.** Three applicant-side skills fill a real gap that no exposed
skill or operation covers: `scf-tranche-reporter`, `scf-prescreen-checker`, and
`scf-referral-preparer`. Reconsider only these three, and only after the named fixes in
"Preconditions". The exact IDs would be `skills.<new-source-id>.scf-tranche-reporter`,
`skills.<new-source-id>.scf-prescreen-checker`, and `skills.<new-source-id>.scf-referral-preparer`.
The other nine stay unpinned.

**What the coordinator does now:**

- Replace decision K in `.agents/TODO.md` with a one-line pointer to the recorded answer.
- Record "not pinned" as the decision, with the three-skill conditional path and its fixes.
- Send the upstream defects to `Stellar-Light/awesome-stellar-community-fund` when the owner
  approves that filing. The repository is not in `improvements/intake.json` today.
- Keep the directory snapshot rows in `ecosystem-skills/catalog.json` as they are.

### The case against pinning

**Overlap.** Radar covers positioning. Scout covers idea vetting, RFP matching, and pitch
drafting. `scout.scfPitch` returns live round state, funded peers, and pitch angles in one call.
`scf-competitor-analyst`, `scf-live-context`, and `scf-budget-builder` are recipes over the same
six Scout operations. The `scout.searchProjects` output schema already says that a null
`lastActivityAt` is an index gap, and that a null `onchain` is never "no on-chain activity".
Those are the main lessons in `scf-claim-verifier`.

**Routing competition.** The catalog has 20 searchable skills. Eleven more is a 55% increase,
and all eleven share the tokens "SCF" and "Build Award". The legacy routing set has about thirty
SCF fact questions. With the new skills, "What is the SCF Audit Bank" routes to
`scf-referral-preparer` first. "Which builders have a high SCF tier" returns five new skills and
no operation. "How does Soroban verify passkey signatures" routes to `scf-claim-verifier` first.
The skills hurt the same use case that they must help.

**Prompt injection and credentials.** I found no instruction override and no literal credential
in the twelve bodies. `scrubNonExposedRefs` returns each body unchanged. Three risks remain:

- The review bodies tell the reader to fetch every applicant link. `scf-reviewer` calls this
  "non-negotiable". No body says that fetched applicant text is data and not instructions. An
  applicant has a money reason to plant instructions in a linked document.
- `fetch-external-doc` mandates `curl -sL` through a shell, writes to `/tmp`, and suggests
  authenticated `gh api`.
- `scf-round-reviewer` requires the reader to install two external skill packages.

**Broken links to unpinned files.** Four bodies link to root `docs/` files, twelve distinct files
in total. `scf-submission-drafter` requires `docs/submission-template.md` as its structure. Four
bodies link to sibling `SKILL.md` files. Raven does not rewrite relative links, so each link is a
dead pointer in a served body. Six bodies link to `communityfund.stellar.org/build` or `/faq`,
which return 404.

**Schema conflict with Scout.** `scf-live-context` says that each RFP row has a round and a
deadline, and that the open row is the current round. The live rows have neither field. They
have `quarter` and `rowType`. The round and the deadline are in `meta.scfRound`. The body also
states "now #45", "deadline 2026-08-16", and five named RFPs as "still exactly the open set".
The live response on 2026-10-01 gives round #46, deadline 2026-11-08, and two different open
briefs. All five named RFPs are `closed`.

**Maintenance cost.** Each exposed skill needs one active QA case with an independent
`golden-truth` review, an exposure inventory row, a `groups.json` entry, a host description
override, and a routing comparison. A cherry-picked source also needs `unpinnedUpstream` rows.
The daily drift check gains one more repository. The body content dates quickly, because SCF
rules change each quarter.

**Product risk.** Raven is the SDF-hosted gateway, and SCF is an SDF program. `scf-reviewer` and
`scf-round-reviewer` output "Fund" or "Do not fund" from a rubric that a third party wrote. The
weights and the 75-point and 60-point thresholds are not handbook rules. A reader can take them
as official SCF criteria. The handbook also says that reviewers consider no external materials.
`fetch-external-doc` and `scf-round-reviewer` tell the reader to score from external documents.

**Does an SCF user gain an answer?** For nine skills, the gain is small or negative. For three
skills, the gain is real. See the next section.

### The strongest case for pinning

- SCF work is a main Raven use case. For four jobs, today's search returns nothing useful.
  "Help me write my SCF tranche 2 report" returns `scout.scfPitch` first. "How do I prepare a
  referral package for an SCF Pilot" returns `stellarDocs.search_anchor_sep_docs` first. "Check
  my SCF draft for prescreen problems" returns the Radar skill first. With the skills pinned,
  the correct skill is first for each job.
- The served Scout body already sends the model to these skills. It says that an SCF review "is
  a different job", it names `scf-claim-verifier`, and it gives an install command. A client
  without a shell cannot follow that pointer. A pin closes the loop.
- `scf-claim-verifier` is accurate against Raven. Its six `scout.*` tool names all exist in the
  manifest. All fifteen field names that I checked exist in the output schemas. Its honesty
  rules agree with Raven's evidence discipline.
- The source is MIT, public, and from an organization that Raven already pins. It uses the
  standard `skills/` layout. The pin needs no selector code.
- The core handbook rules in the bodies are correct. I confirmed the $150,000 cap, the
  10/20/30/40 tranches, the 6-month limit, the three-rejection timeout, the 40-hour integration
  guidance, and the 5% Audit Bank co-payment against the handbook.

This case is strong for the post-award and pre-submission stages. It does not overcome the
routing breach or the content defects. It is the reason for the three-skill conditional path.

## Per-skill table

"Solo" is the legacy routing result when only that skill is added, with its upstream
description. The baseline is 219/298/326. The gate floor is 216/295/323. "Captures" is the
number of legacy cases where the new skill enters the top five, then the number where it is
first.

| Skill | Fit | Risks | Decision |
| --- | --- | --- | --- |
| `scf-tranche-reporter` | Good. Post-award reporting has no coverage in Raven. It maps report claims to `scout.searchProjects` fields that exist (`verifiedRepo`, `eventsDelta`, `assetHoldersDelta`). | Four dead `docs/` links and one 404 link, all in reference lists. It describes form submission and repository access changes by the reader. Solo 219/297/326, captures 8 and 0. | **Not now.** Candidate 1 after the named fixes. |
| `scf-prescreen-checker` | Good. It has no sibling link and no `docs/` link. The handbook confirms the prescreen and the cumulative cap rule. | Two 404 links. One red flag ("over $150K without prior SCF award") conflicts with its own cumulative rule. The "large marketing" flag ignores the Integration Track allowance. It takes first place on a fake-project negative case. Solo 218/296/326, captures 18 and 4. | **Not now.** Candidate 2 after the named fixes. |
| `scf-referral-preparer` | Good. The referral package is a separate job. | Four dead `docs/` links and one 404 link. It quotes reward terms (1%, 6 per cycle) that I did not confirm in handbook text. It takes first place on "What is the SCF Audit Bank". Solo 217/298/326, captures 13 and 4. | **Not now.** Candidate 3 after the named fixes. |
| `scf-interest-form-drafter` | Partial. It overlaps Scout "Draft SCF Pitch" and `scout.scfPitch`. | Its field list omits the track choice and the referrer code. The handbook names both for the interest form. Its budget ranges are not verifiable. Four dead `docs/` links, one 404 link. Captures 10 and 3. | **No.** Reconsider after upstream aligns the fields with the handbook. |
| `scf-claim-verifier` | Partial. It has the best content, but it duplicates six exposed operations and their schema notes. Its audience is reviewers. | It links to `scf-live-context` in a `##` section that the scrub cannot remove. Its coverage figures are frozen at 2026-07-23. It is the strongest routing magnet: solo 216/296/326 at the band edge, captures 22 and 6. | **No.** The served Scout body already points reviewers to the plugin. |
| `scf-reviewer` | Partial. Track-weighted review is distinct. | A third-party "Fund / Do not fund" rubric on an SDF host. It mandates fetching every applicant link with no untrusted-content warning. It states that marketing is always ineligible. It depends on `scf-claim-verifier`. | **No.** |
| `scf-budget-builder` | Partial. It overlaps the funded-peer totals in `scout.scfPitch`. | The directory calls it a budget builder, but the body is a validator. Its rate table is frozen and cannot be checked. "Exceeds $150K without strong justification" conflicts with the cap. Two 404 links. It takes first place on "How do I apply for an SCF Build Award". | **No.** |
| `scf-competitor-analyst` | Duplicate. Radar, Scout "Deep Dive Mode", and `scout.vetIdea` do this job. | It fails the "does not duplicate an exposed skill" bar. It takes first place on "SCF Verified Member". | **No.** |
| `scf-live-context` | Duplicate, and defective. | It conflicts with the live `scout.getRfps` shape. It carries stale dated facts in a body that forbids stale facts. It breaches the top-3 band alone (219/293/326). | **No.** This is the clearest exclusion. |
| `scf-submission-drafter` | Partial. It is broader than a pitch. | It requires the unpinned root template. Eight dead `docs/` links, two 404 links. It quotes the category medians that `scf-budget-builder` says not to quote. It displaces Radar on a competitor question. | **No.** |
| `scf-fetch-external-doc` | Poor. The content is generic URL handling, not Stellar content. | The real name is `fetch-external-doc`, so the ID would not match the directory name. It needs a client shell. It depends on the absent `read-gdoc` skill. It conflicts with the handbook rule on external materials. It has no untrusted-content warning. It has no routing effect. | **No.** |
| `scf-round-reviewer` | No fit. | Its required `CLAUDE.md` is in `lumenloop/scf-review-boilerplate`, which has no license. It needs local CSV files, agent teams, file writes, and two external skill installs. Its examples are from SCF #43. | **No.** |

## Preconditions

Admission must do all of this for any pinned skill. The list applies to the three candidates.

**Upstream fixes first.** Raven serves pinned bytes, so upstream must correct the content.

1. Replace the 404 reference links (`communityfund.stellar.org/build` and `/faq`).
2. Correct the marketing rule for the Integration Track. The handbook permits user-testing spend
   up to one third of the budget in tranches 2 and 3.
3. Make the cap wording agree in every body. Use the handbook text: $150,000 total, and more only
   case by case.
4. Remove the relative `docs/` links, or replace them with full URLs.

**Source and selection.**

5. Use a new source ID. `stellar-light` already names `Stellar-Light/stellar-scout`.
6. Add a pick list. Record every unpinned sibling in `groups.json` `unpinnedUpstream`, with a
   reason. Add the Sources row, the `improvements/intake.json` entry, and the MIT notice. The
   copyright line names LumenLoop.
7. Keep the selection closed. No pinned body links to an unpinned sibling or needs an unpinned
   file. The three candidates meet this rule. `scf-claim-verifier`, `scf-reviewer`, and
   `scf-submission-drafter` do not.

**Routing.**

8. Write a host description override for each skill in `scripts/description-notes.mjs`. The
   upstream descriptions are too broad.
9. Run the routing comparison. The legacy lane must stay in the band with no threshold change.
   My draft overrides were not sufficient: the three-skill set gave 218/294/326, one below the
   top-3 floor. Treat this as an open design task, not as a tuning detail.
10. No new skill takes first place on an SCF fact case. Check `q-scf-audit-bank`,
    `q-scf-verified-members`, `q-builder-by-scf-tier`, `q-scf-v7-changes`, and
    `q-edge-noinfo-fake-project-quasarswap`. If overrides cannot do this, decide a
    search-admission rule as a separate routing decision.

**Evidence and review.**

11. Add one QA case for each skill as `proposed` in an earlier commit. Activate it after an
    independent `golden-truth` review.
12. Add an `exposed` row for each skill to `research/skill-exposure-inventory.json`. State that
    a report draft or a referral package is text, not a submission capability. The Radar row
    rejects any SCF submission capability.
13. Record the accepted risks in `PIN-REVIEW.md`: reader-side form submission, sharing,
    repository access changes, the Audit Bank co-payment text, and each dated figure.
14. Read the body diff on every re-pin against the handbook. SCF rules change each quarter.
15. Get an independent review, then the owner's approval to deploy.

## Evidence

### Sources read

- Upstream HEAD is still `b9a1509fb4230a191ab0055c2beca29303c1a30c`, dated 2026-07-23. The
  repository is public, MIT, and has 38 commits. The last push was 2026-07-23.
- I read all twelve `SKILL.md` bodies in full at that commit, plus `skills/README.md`. The blob
  sizes match the tree.
- I read the pinned Scout body (`3b587aa9`, blob `de459e78`) and fetched the pinned Radar body
  (`d92c56bd`, blob `d2d2cbfd`). Both blob hashes match `ecosystem-skills/MANIFEST.json`.
- Local files: decision K in `.agents/TODO.md`, the prior body read, `ecosystem-skills/README.md`,
  `update.sh`, `PIN-REVIEW.md`, `catalog/manifest.json`, `src/skills/scrub.ts`,
  `scripts/emitted-text-guard.mjs`, `scripts/description-notes.mjs`,
  `src/catalog/skill-search-admission.ts`, `eval/gates.json`, `eval/run-routing.mjs`,
  `eval/qa/lint-corpus.mjs`, and `research/skill-exposure-inventory.json`.

### Live checks (free, public, 2026-10-01)

- `GET https://stellarlight.xyz/api/rfps?status=open` returns `meta.scfRound.currentRound` 46,
  `currentPhase` "Submission", and `submissionWindow.closes` 2026-11-08. It returns three rows:
  one synthetic `scf-round` row and two `rfp` rows ("Stellar-compatible LayerZero DVN" and
  "x402 Facilitator with Bazaar Discovery"). No row has a `round` field or a deadline field.
- `GET /api/rfps?limit=20` shows the five RFPs that `scf-live-context` names (Trustline
  Onboarder, Passkey UI Kit, Account Demolisher, Contract Source Verification Service, OZ
  Accounts Policy Builder) as `closed`, quarter `q2-2026`.
- Link status: `communityfund.stellar.org/build` 404, `/faq` 404, `/rfps` 404, `/awards` 200,
  `/handbook` 307 to `stellarcommunityfund.gitbook.io/scf-handbook/`.
- Handbook, Submission Criteria: "Reviewers assess each application based solely on the
  information provided in the submission. No external materials are considered."
- Handbook, Integration Track, "User-Testing Budget Allowance": a part of tranches 2 and 3,
  capped at one third of the total budget, can pay for user testing. The page lists acceptable
  uses that include explainer video, technical blog content, and landing page design.
- Handbook, Build Award, "How to Apply": the interest form records the track and the referrer.
  The page tells the applicant to include the referrer code in the interest form.
- Handbook confirmations: $150,000 cap, 6-month timeline, tranches 10/20/30/40, the
  three-rejection timeout, "less than a week (40 hours)" for most integrations, and the 5%
  Audit Bank co-payment.
- `lumenloop/scf-review-boilerplate` is public and holds `CLAUDE.md`. GitHub reports no license.

### Local checks

- The catalog has 60 operations and 222 skill entries. Twenty skill entries are searchable.
- `update.sh` names a skill by its directory. The fetch skill would be `fetch-external-doc`.
- `scrubNonExposedRefs` returns all twelve bodies unchanged. The same scrub keeps the Scout line
  that names `scf-claim-verifier` and gives the install command.
- All six Raven tool names in `scf-claim-verifier` exist in the manifest. The fields
  `scfAwarded`, `scfAwardedRounds`, `scfTotalAwardedUSD`, `scfAmountStatus`, `lastActivityAt`,
  `onchain`, `verifiedRepo`, `eventsDelta`, `assetHoldersDelta`, `codeVerified`, `answerSource`,
  and `byRound` exist in the Scout output schemas.
- Link counts for each body: `docs/` links are 8 in the submission drafter and 4 each in the
  interest form, referral, and tranche bodies. Sibling links are in the claim verifier,
  reviewer, fetch, submission drafter, and round reviewer bodies.

### Routing simulation

The script imports `src/catalog/search.ts` and `eval/lib/grade.mjs` from the worktree. It adds
synthetic skill entries to an in-memory copy of the manifest and runs `searchCatalog` with
`limit: 5` on all routing lanes. It writes nothing to the worktree. The baseline reproduces the
gate totals exactly: legacy 219/298/326, skills top-1 17, holdout card top-1 12 and top-5 29.
The gate band is `round(338 × 1 / 100)` = 3 cases.

With upstream descriptions:

| Added set | Legacy top-1/3/5 | Gate | New skill in top 5 | New skill first |
| --- | --- | --- | --- | --- |
| Baseline | 219/298/326 | pass | 0 | 0 |
| All eleven "fit" skills | 215/288/323 | **breach** | 52 | 14 |
| Tranche, prescreen, referral, interest form, claim verifier | 215/293/323 | **breach** | 39 | 9 |
| Claim verifier, prescreen, tranche | 215/293/324 | **breach** | 33 | 7 |
| Tranche, prescreen, referral | 217/294/325 | **breach** | 27 | 6 |
| Tranche, prescreen | 218/294/325 | **breach** | 20 | 4 |
| `scf-live-context` only | 219/293/326 | **breach** | 12 | 2 |
| `scf-claim-verifier` only | 216/296/326 | pass, at the edge | 22 | 6 |
| Each other skill alone | 217 to 219 / 295 to 298 / 326 | pass | 0 to 18 | 0 to 4 |

With short host descriptions that I drafted:

| Added set | Legacy top-1/3/5 | Gate | New skill in top 5 | New skill first |
| --- | --- | --- | --- | --- |
| Each of the five alone | 218 to 219 / 295 to 298 / 326 | pass | 2 to 9 | 1 to 2 |
| Tranche, prescreen | 218/294/326 | **breach** | 11 | 2 |
| Tranche, prescreen, referral | 218/294/326 | **breach** | 11 | 2 |
| Tranche, prescreen, referral, interest form | 218/293/325 | **breach** | 13 | 3 |

The skills-lane top-1 and both holdout card floors hold in every variant. New skills still
enter the holdout top five in up to ten cases.

Examples of wrong captures with the eleven-skill set:

- `q-builder-by-scf-tier`: five new skills fill the top five. Scout leaves the list.
- `q-scf-audit-bank`: `scf-referral-preparer` is first.
- `q-scf-verified-members`: `scf-competitor-analyst` is first, and four of five hits are new.
- `q-scf-v7-changes`: three new skills are first to third.
- `q-infra-secp256r1-passkeys`: `scf-claim-verifier` is first on a protocol question.
- `q-defi-aquarius-tvl-freshness`: `scf-live-context` is first on a TVL question.

Limits of the simulation: it uses descriptions only. It adds no section entries and no aliases.
It uses a hypothetical source ID. It estimates the gate; it is not the gate.

### Evidence files

The simulation scripts and their outputs (`sim.mjs`, `sim2.mjs`, `sim-solo-summary.txt`,
`sim-all11-detail.json`, `sim2-out.json`) ran in the coordinator's scratch folder. They are not
retained. The tables above hold their results.

### Limits of this review

- I did not run any upstream workflow, install any dependency, or use applicant data.
- I did not confirm the referral reward terms (1%, six per cycle) or the interest form budget
  ranges in handbook text. They are unverified, not wrong.
- I did not audit the fifteen root `docs/` files.
- I ran no QA or agentic eval. The routing result is lexical search only.

### Side finding, outside decision K

The served Scout body tells the model to install a plugin with
`npx skills add Stellar-Light/awesome-stellar-community-fund`. The scrub keeps that line. I found
no accepted-risk note for this install prompt in `PIN-REVIEW.md`. The coordinator should record
it at the next Scout re-pin, or decide to remove it.
