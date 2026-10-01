# SCF skills exposure review (scf-grok)

Read-only review on 2026-10-01. Worktree `feat/scf-skills` at `bcfa617ffcb6`. That commit matches `main`. No files changed. No paid calls.

## Verdict

Pin none.

Do not pin any of the twelve skills from `Stellar-Light/awesome-stellar-community-fund`. Do not open an admission pull request. Record owner decision K as pin none.

The upstream ids are the frontmatter `name` values. They are `fetch-external-doc`, `scf-budget-builder`, `scf-claim-verifier`, `scf-competitor-analyst`, `scf-interest-form-drafter`, `scf-live-context`, `scf-prescreen-checker`, `scf-referral-preparer`, `scf-reviewer`, `scf-round-reviewer`, `scf-submission-drafter`, and `scf-tranche-reporter`. The catalog label `scf-fetch-external-doc` is not an id.

### Case against a pin

Exposed skills already cover the SCF research and pitch jobs.

`skills.lumenloop.scf-submission-radar` positions an idea against prior submissions. `skills.stellar-light.stellar-scout` drafts an SCF pitch, compares RFPs, and vets an idea. Scout `SKILL.md` lines 37–45 and 102–120 own "help with my SCF application". Scout line 46 sends review, scoring, claim checks, and delivery checks to a local install. The install line is `npx skills add Stellar-Light/awesome-stellar-community-fund`.

A new skill entry competes in `search`. `admitsWholeSkill` admits a skill when the description contains `SCF`. The rule is the domain-code test in `src/catalog/skill-search-admission.ts`. All twelve frontmatter descriptions contain `SCF`. So does the radar description. So does the Scout description. Every query that contains `scf` would admit all twelve new skills plus the two exposed skills. Sections stay out of search. Whole skills do not.

Three graded skills cases share those words. `q-skill-scf-radar-positioning` asks to position an SCF application and names overlaps. `scf-competitor-analyst` says "overlap". `q-skill-project-dossier-blend` asks for SCF funding history. `scf-claim-verifier` says "funding history". The dossier description also says "SCF history". `q-skill-stellar-scout-hackathon` asks for a draft SCF pitch. `eval/gates.json` requires skills `minTop1` 17 of `n` 23. This review did not run the scorer. A pin still needs that comparison. The floor stays unchanged.

No body contains `ignore previous` or a literal API key. Two bodies still override tool choice. `fetch-external-doc` and `scf-round-reviewer` say the agent must use `curl -sL`. They say the agent must not use WebFetch. `fetch-external-doc` line 175 offers `gh api` with authentication. `scf-round-reviewer` lines 14–28 tell the user to install `stellar/stellar-dev-skill` and `OpenZeppelin/openzeppelin-skills`. The sandbox has no network. Those steps are not a Raven answer.

The `skills/` selector stores Markdown under each skill directory. `update.sh` lines 107–110 call that selector. Each skill directory contains only `SKILL.md`. Fourteen files live in root `docs/`. Drift will not ask for a pin-or-exclude decision on them. `check-skills-drift.mjs` watches skill directories of the source path. Root `docs/` is outside that path.

`scf-submission-drafter` lines 53 and 147 require `docs/submission-template.md` as the draft structure. That file exists upstream. The selector will not serve it. Interest, referral, and tranche bodies link more root guides. Those links would break inside `skill.read`.

`scf-live-context` line 22 says the RFP row with `status: "open"` is the current round. `scout.getRfps` says the opposite. Open means the sponsor brief still solicits. It does not mean the SCF window accepts a submission today. The operation tells the reader to check `meta.scfRound.submissionWindow` and `currentPhase`. Pinned Scout lines 95 and 141 say the same thing. `scf-reviewer` line 30 repeats the open-row shortcut. `scf-claim-verifier` line 97 defers the round to `scf-live-context`. A pin would teach the stale rule.

The same commit contradicts itself on award medians. `scf-budget-builder` lines 24–35 say a `projects/search` slice median is not a category rate. It cites the unstable pair $55,000 and $92,000 for tooling. `scf-submission-drafter` line 45 still prints 2026-07-23 slice medians. Those figures include about $86K for user-facing apps and $55K for tooling. `scf-round-reviewer` lines 184–187 still say to take that slice median.

`scf-prescreen-checker` lines 71 states a $150,000 accumulated cap and a $300,000 lifetime cap. The sentence does not fetch the handbook. This review did not re-check the live handbook. A pin would serve that sentence as a rule.

Maintenance cost is a new source, not a re-pin of `stellar-light`. That source id already pins `Stellar-Light/stellar-scout` at the repo root. The SCF repo needs its own `pin_github` line, intake row, license notice, group rows, and exposure rows. Upstream HEAD has not moved since 2026-07-23. CI would stay green while quarterly SCF rules move. The bodies also embed static caps, rates, and medians.

Catalog taglines are already stale. `ecosystem-skills/catalog.json` still says `scf-budget-builder` builds a bottom-up budget. The body heading is "SCF Budget Validator". Discovery text and served text would disagree until a person re-pins.

An SCF user can already get the live answers. `scout.getRfps`, `scout.searchProjects`, `scout.searchRepos`, `scout.explainRepo`, and `scout.analyzeEcosystem` are exposed. `scf-claim-verifier` lines 103–110 name those ids. Handbook text is `scout` research with `source=scf-handbook`. Pitch shape is the Scout "Draft SCF Pitch" section. Radar covers prior-submission positioning. The directory snapshot already lists all twelve install targets. Scout line 46 already gives the install command. Raven does not need to serve the bodies to make the plugin findable.

`scf-round-reviewer` is an operator workflow. It reads an Airtable CSV of a whole round. It writes `reviews/results.csv`. It asks for parallel agents through TeamCreate. A public catalog entry would invite other applicants' files into the model. That is the wrong product surface.

### Strongest case for a pin

Five outputs are absent from radar and from Draft SCF Pitch. They are a prescreen PASS/FLAG/FAIL list and a claim-check rubric with coverage rates. They also include a referral package, a tranche completion report, and a single-application review with track weights. Scout line 46 names that gap. It names `scf-claim-verifier`. `scf-budget-builder` also warns against a fake category median. Scout pitch step 116 still says to cite a median. The repository is public. `LICENSE` is MIT. The copyright line names LumenLoop. The layout is `skills/`. HEAD is one commit.

That case does not clear the bar. The current bytes carry the false open-row rule and the contradicted medians. They also require files the selector drops. They tell the agent to run curl or install steps. The sandbox cannot run those steps. Scout already sends that job to a local install. A pin now would add twelve SCF matches to every SCF query. It would do that before a routing comparison. Some served SCF answers would get worse.

## Per-skill table

Upstream HEAD `b9a1509fb4230a191ab0055c2beca29303c1a30c`. Blob sha is the git blob of `SKILL.md`.

| Skill | Fit | Risks | Decision |
| --- | --- | --- | --- |
| `fetch-external-doc` (`033764c393b2`, 177 lines) | Weak. The job is generic document fetch. | Must-use-curl override. Optional `gh api` auth. `read-gdoc` is not in this repo. Catalog name `scf-fetch-external-doc` is wrong. | Do not pin. |
| `scf-budget-builder` (`ede4282b6d58`, 88 lines) | Partial. The slice-median warning is useful. | Frozen role rates from 2026-06. `SCF` admits it on every SCF query. Catalog tagline is stale. | Do not pin. |
| `scf-claim-verifier` (`042b370d1d4e`, 139 lines) | Distinct rubric. Raven tool ids match the manifest. | Line 97 depends on `scf-live-context`. "funding history" collides with the dossier case. | Do not pin. |
| `scf-competitor-analyst` (`e2f656a20d79`, 108 lines) | Overlap. Prior art and differentiation already sit in radar and Scout. | Description token "overlap" hits `q-skill-scf-radar-positioning`. | Do not pin. |
| `scf-interest-form-drafter` (`87f597059296`, 182 lines) | Partial. Interest Form fields are a separate stage. | Four `../../docs/` links. Pitch overlap with Scout. | Do not pin. |
| `scf-live-context` (`9caa8cf92400`, 73 lines) | Overlap with `scout.getRfps` and Compare RFPs. | Line 22 treats `status: "open"` as the current round. That contradicts `scout.getRfps`. | Do not pin. |
| `scf-prescreen-checker` (`6137e4ef8fba`, 144 lines) | Distinct checklist. | Lines 71 state $150,000 and $300,000 caps without a live handbook fetch. | Do not pin. |
| `scf-referral-preparer` (`9a6d6a4918f7`, 235 lines) | Distinct referral package. | Reader must share the package and submit a form. Four `../../docs/` links. | Do not pin. |
| `scf-reviewer` (`13e9bb286030`, 184 lines) | Distinct single-application review. | Line 30 uses `status=open` as the current round. It defers claims to a sibling skill. | Do not pin. |
| `scf-round-reviewer` (`31ae296d8299`, 574 lines) | No fit as a served workflow. | `CLAUDE.md` is absent. Needs a local CSV, sibling skills, two installs, TeamCreate, and `reviews/results.csv`. | Do not pin. |
| `scf-submission-drafter` (`2ad5b4c6dec8`, 176 lines) | Overlap with Draft SCF Pitch. The full form is broader. | Requires unpinned `docs/submission-template.md`. Line 45 prints contradicted medians. | Do not pin. |
| `scf-tranche-reporter` (`a6f51ae3b703`, 220 lines) | Distinct post-award report. | Four `../../docs/` links. Line 119 is a reader submission. Line 131 states an audit co-pay. | Do not pin. |

## Preconditions

A later admission must do all of the following. This review does not authorize that admission.

1. Use a new source id. Do not reuse `stellar-light`.
2. Add one `pin_github` line for `skills/` on `Stellar-Light/awesome-stellar-community-fund`. Add the intake repo, the MIT notice, `groups.json` rows, and `research/skill-exposure-inventory.json` rows in the same change.
3. Pin only skills whose required files are in the selection. Root `docs/` need an explicit selector change or absolute pinned URLs. A missing `unpinnedUpstream` row will not catch root `docs/`.
4. Reject any body that treats an open RFP row as proof that the submission window is open.
5. Reject any body that states a `projects/search` slice median as a category rate.
6. Record retained prompts in `PIN-REVIEW.md`. The set is `gh api` authentication, external skill installs, form submission, document sharing, and the audit co-pay.
7. A reviewer reads every selected body. The body has no host-authority override that `src/skills/scrub.ts` does not remove. A must-use-curl rule is such an override.
8. Use the frontmatter `name` as the exact id. `fetch-external-doc` stays `fetch-external-doc`.
9. Commit one `proposed` QA case per new skill before activation. Run `golden-truth` review. Then run `npm run eval:qa:compile` and `npm run eval:qa:register`.
10. Run the routing comparison from `live-drift-resolution`. Keep skills `minTop1` at 17 unless a separate decision changes `eval/gates.json`. Watch `q-skill-scf-radar-positioning`, `q-skill-project-dossier-blend`, and `q-skill-stellar-scout-hackathon`.
11. Get an independent review from a reviewer who is not the author and not the orchestrator.

`scf-round-reviewer` stays out even after those steps. It needs an absent `CLAUDE.md`, a local applicant CSV, and batch agents. `fetch-external-doc` stays out unless the tool override and the auth prompt are removed upstream. The skill is not Stellar-specific enough for this gateway.

## Evidence

Reviewed tree: `https://github.com/Stellar-Light/awesome-stellar-community-fund` commit `b9a1509fb4230a191ab0055c2beca29303c1a30c`. Author date and committer date are `2026-07-23T23:32:01Z`. `list_commits` page 1 returns that sha first. The recursive git tree has 52 entries and `truncated: false`. `CLAUDE.md` returns HTTP 404. `LICENSE` blob `e16874e562b2` is MIT. The copyright line is "Copyright (c) 2026 LumenLoop".

Each skill directory has one blob, `SKILL.md`. Root `docs/` has 14 blobs, including `docs/submission-template.md` blob `23a89f65f6a9`. This review downloaded all twelve bodies and read them. It also read `LICENSE`.

Local pin set at `bcfa617ffcb6`:

- `MANIFEST.json` `skill_count` is 21 across five sources. No SCF-repo source exists.
- `stellar-light` pins `Stellar-Light/stellar-scout` commit `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6`. The skill file sha is `de459e784e9e927f42662aa53ab22c8dedab04b7`.
- `lumenloop` pins `d92c56bda17ab702d3202335cfe814d64e70e191`. `scf-submission-radar` file sha is `d2d2cbfdb39bd05cff541a48f838ccde8febb704`.
- `groups.json` has no SCF-repo `unpinnedUpstream` entry. The twelve names appear only in the directory snapshot.
- `INDEX.md` says 21 pinned skills. The twelve rows sit under "Ecosystem directory" and are not served.
- `catalog.json` tagline for `scf-budget-builder` still says "Build bottom-up SCF budgets". The served heading does not.
- `research/skill-exposure-inventory.json` has no row for these twelve skills.

Exposed operation text: `catalog/manifest.json` entry `scout.getRfps` says open is not the submission window. The same manifest contains `scout.searchProjects`, `scout.searchRepos`, `scout.explainRepo`, and `scout.analyzeEcosystem`. Those are the ids in `scf-claim-verifier` lines 105–110.

Admission code: `src/catalog/skill-search-admission.ts` lines 48–57 and 108–109. A 2–5 character token with two uppercase letters is a domain code. `SCF` matches. Query token `scf` admits the skill.

Graded questions: `eval/skills-cases.json` ids `q-skill-scf-radar-positioning`, `q-skill-project-dossier-blend`, and `q-skill-stellar-scout-hackathon`. Floors: `eval/gates.json` skills `n` 23 and `minTop1` 17.

Prior read: `.agents/rounds/2026-09-30-raven-next/scf-skill-bodies-astra.md` reviewed the same commit. This review agrees that `scf-round-reviewer` does not fit. It agrees that eleven bodies are reference-shaped. It does not treat "fit" as a pin. The new blocking facts are the search admission flood and the Scout install handoff. They also include the same-commit median contradiction and the silent omission of root `docs/`.

Limits: this review did not run the workflows. It did not install dependencies. It did not call Scout. It did not compare the prescreen caps or the role rates to the current SCF handbook. It did not run `npm run eval:routing`.
