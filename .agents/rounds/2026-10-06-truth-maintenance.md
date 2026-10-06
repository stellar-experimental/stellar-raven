# Truth maintenance 2026-10-06

## Scope

The owner asked for a review of service drift, open PRs, worktrees, branches, stashes, open issues,
and open improvements, with action only where it is needed.

State at the start (`origin/main` `c06dadbd`): no open PRs, no extra worktrees or branches, no
stashes. Two open issues: #223 (live drift, three daily reports) and #167 (RWA routing).

Coordinator: Claude Opus 5.5 (`claude-opus-5-5`), pane `w3W:p1P`.

## Lane plan

| Lane | Agent | Tier, model, effort | Pane | Worktree / write set | Output |
| --- | --- | --- | --- | --- | --- |
| Drift absorb (author) | coordinator | Claude Opus 5.5, high | `w3W:p1P` | main checkout | candidate `c76b517c`; shipped branch `drift/2026-10-06-skills-pin` |
| Improvements and upstream follow-up | `impr-followup` | Claude Opus 5.5, high | `w3W:p1Q` | read-only, then `../srcm-impr-followup` | `improvements-lane.md`; PR #229 |
| Independent drift review | `rev-grok-drift` | Grok 4.7, high | `w3W:p1R` | read-only | `review-drift-grok.md` |
| Residual routing repair | `astra-repair` | Codex frontier `gpt-6-astra`, high | `w3W:p1S` | `../srcm-drift-repair` | `routing-repair-astra.md` |
| Repair review (spawned by `astra-repair`) | `routing-contract-review` | Claude Fable 5.1, high | `w3W:p1V` | read-only | `routing-repair-review-fable.md` |
| Golden coverage for new operations | `fable-goldens` | Claude Fable 5.1, high | `w3W:p1T` | `../srcm-drift-goldens` | parked (see "Golden verdict") |
| PR #229 review | `rev-sol-pr229` | Codex workhorse `gpt-6.1-sol`, high | `w3W:p1Q` | read-only | `pr229-review-sol.md` |
| Near-due golden re-verification | `opus-reverify` | Claude Opus 5.5, high | `w3W:p1X` | `../srcm-goldens-reverify` | see "Golden verdict" |

Routing notes. The improvements lane uses Claude Opus instead of Codex workhorse, because it needs
authenticated `gh` reads across many upstream repositories, and the Codex sandbox cannot reliably
reach the keychain. The drift review gate uses Grok for a vendor-diverse attack: the coordinator
(Opus) authored the drift and Codex frontier authored the repair search, so both were ineligible.
The PR #229 adapter change was authored by the coordinator, so Codex workhorse reviewed it.

A detached `origin/main` worktree at `../srcm-main-baseline` holds the routing baseline run
(`routing-2026-10-06T14-11-02-076Z.json`, manifest `efea602c…afe6`) and served as the clean deploy
tree.

## Drift verdict

**Scout 1.9.71 held; the stellar-dev skill pin shipped.** Issue #223 stays open as the hold record.

Regenerated at 14:09Z with the Step 1 chain. Lumenloop, Stellar Docs, and the Docs title snapshot
are unchanged. Scout spec `1.9.61` → `1.9.71` (41 operations upstream).

`node scripts/diff-inventory.mjs <mode> HEAD:inventory/stellar-light.json inventory/stellar-light.json`:

| mode | result |
| --- | --- |
| `surface` | exit 1: `+ GET /api/hackathons/analyze`, `+ GET /api/hackathons/builds/{id}`, `+ GET /api/hackathons/review` |
| `text` | exit 1: routing text changed on 12 existing operations (getClusters, listContracts, hackathonBrief, getHackathons, searchHackathonBuilds, compareHackathons, getHackathon, getRepoTrust, getRfps, scfPitch, listSkills, vetIdea) |
| `deep` | exit 1: also `searchResearch` `sources` description, `Meta` gains `partial` and `failedReads`, `HackathonDetailResponse` changes (Grok) |

Class: operation surface plus routing-relevant text. Not runner-affecting: the only runner
(`skills.lumenloop.stellar-ecosystem-digest`) declares three Lumenloop operations.

Exposure analysis on the candidate (`c76b517c`). All three new operations are read-only GETs with
no side-effect markers. `scout.reviewSubmission` ranked first on
`q-pc-sequence-numbers-ordering-replace` (a sequence-number question; the collision is the word
"submissions") and removed the payroll top-five hit. Exclusion ablations: excluding it alone
removes both of its graded flips; excluding the other two changes no graded row. Grok agreed that
exclusion is justified and that exposing the two read operations matches ADR-0003.

Routing, all 544 rows against `main` with `reviewSubmission` excluded (`routing-diff-candidate.txt`):
7 graded flips, all from rewritten text on existing operations. Legacy top1 219 → 220, top3 298 →
295, top5 326 → 325, cardHit5 112 → 111. Skills, holdout, and protocol-history totals unchanged.
The gate failed only on the manifest fingerprint; the top3 drop of 3 sits inside the band of 3.

Per-flip causes (`routing-repair-astra.md`): new `x-routing` examples on existing operations add
admission phrases and exact tokens (`x402 builds` on searchHackathonBuilds; "How crowded is lending
on Stellar?" on getClusters; "Stellar Hacks: Real-World ZK" on getHackathon; lending and payroll
examples on vetIdea; "take" on scfPitch). Verdicts: four real regressions
(`q-defi-agentic-payment-standards-compare`, `q-defi-blend-alternatives`, `q-defi-rwa-overview`,
`q-scf-funded-similar-payroll`), one narrow card label (`q-defi-streaming-payments-prior-art`), one
useful gain (`q-defi-stellarx-what-is`), and one metric-only gain
(`q-edge-scf-v7-centralization-myths`). Ungraded captures also appeared: `getHackathonSubmission`
ranks first on `q-scf-ecosystem-listing-partner-jobs`, and `getHackathon` ranks first on
`q-hist-remittance-corridors`.

General repair search: four policies (`intent_examples_only`, `no_example_vocabulary`,
`bounded_prefix`, `content_query`) each caused more graded losses than they fixed. The narrower
admission-only example policy is untested. The Fable review agreed with the stopped search.

Reviewer split on the gate. Grok: approve with a fingerprint-only re-baseline and no floor change.
Astra and its Fable reviewer: do not re-baseline; defer the routing-text candidate until repair.

Skills mirror. `stellar-dev` pin `65375fd2b258` → `d9ca04bf07d1`; one file changed
(`standards/ecosystem.md`: Stellar Registry entry added; Aha Labs renamed The Aha Company). The
stellarlight catalog grew 62 → 63 entries. Grok read the diff: no injection, no gateway capability
claim, no non-exposed reference. `check-pin-review.mjs --base origin/main` passes;
`check-mirrors.mjs --fetch` verified 66 files.

Shipped candidate (`drift/2026-10-06-skills-pin`, from `origin/main` `528fa335`): the skill pin and
rebuilt catalog, spec, and op classes; Scout inventory unchanged. All 544 routing rows: 0 graded
flips and 0 top-five order changes; manifest `3372bc81…2f74`. `eval/gates.json` re-baselines only
the manifest fingerprint. Gates: typecheck, `npm test`, `test:smoke`, `build`, `eval:selftest`,
`eval:qa:lint -- --stale --enforce-floors`, `eval:qa:register -- --check`, `improvements:lint`,
`check-pin-review`, `secrets:scan -- --tree`, `eval:routing -- --gate`, and the CI generated-sync
step all exit 0.

Residual risk from Grok (medium, not triggered today): `scripts/description-notes.mjs:156-157`
rewrites a path that extends an exposed path, so `GET /api/hackathons/review` would become
`scout.getHackathons/review` and pass both leak guards. A bare `reviewSubmission` token and
`routingExclusions` are also outside the scanned text. Recorded in `.agents/TODO.md`.

## Eval verdict

No paid eval in scope. Routing gate evidence is under "Drift verdict".

## Golden verdict

**Near-due queue.** No case was past due. Eleven cases had `reverifyBy` on or before 2026-10-20
(three on 2026-10-08). `opus-reverify` re-verified all eleven with no truth change: only
`truth.asOf`, `truth.reverifyBy`, `truth.corroboration[].evidence`, and `truth.verified` moved
(`reverifyBy` now 2026-11-03 for Meridian's post-event check, then one per week from 2026-12-22 to
2027-03-02). The consistency register's eleven reopened entries were reviewed closed. Report:
`reverify-opus.md`. Independent review: Grok 4.7 high approved with no findings after its own live checks (`review-reverify-grok.md`). Ships as its own PR because the stale gate
would fail CI on 2026-10-08.

The lane found one candidate upstream finding (Scout repo search reports `matchMode: "strict"` for
`q=strupey` while no returned row contains the token). It is queued in `.agents/TODO.md`, not filed.

**New-operation coverage.** `fable-goldens` authored four proposals for
`scout.analyzeHackathonSubmissions` and `scout.getHackathonSubmission`
(`eval/qa/corpus/proposed/scf-grants-builders/`). Codex frontier (`gpt-6-astra`, high, pane
`w3W:p1W`) reviewed them in two passes: three are cleared for activation, one is blocked because
its winner totals have no witness independent of DoraHacks. Because Scout 1.9.71 is held, none
activates; the proposals land with this round and `.agents/TODO.md` owns activation. Report:
`goldens-fable.md`; full record: `rounds/2026-10-06-scout-hackathon-goldens.md`. The lane also
queued two items: hackathon winner goldens that will overlap the submission-detail path, and
Scout hackathon store gaps (the Blend first-place submission sits under another event with no
placement).

## Improvements/issues/PR verdict

`improvements-lane.md`: 74 upstream refs read across 66 findings. No finding qualifies for
`fixed-upstream`. Eight findings gained dated evidence (`sls-089`, `sd-037`, `cs-002`, `sk-025`,
`sk-026`, `sd-048`, `sd-027`, `sd-034`). `sls-089` is a fixed-upstream candidate only: Scout 1.9.62
added `meta.partial` and `meta.failedReads`, and one burst replay found no `200` with
`counts.total: 0`; a distinct reviewer must repeat the burst before a status change.
`npm run improvements:probes`: 8 recurring, 0 fixed candidates. Lint and live lint pass.

PR #229 (merged `528fa335`, deployed version `d40a36df-b402-48c7-bfd6-a07c04ba6cea`) carries
that evidence and an own-repo repair: the Scout adapter maps `meta.partial: true` to kind
`"error"`, names `failedReads`, and keeps the warning prefix as a second signal. Codex workhorse
review: approve-with-changes; both low findings (architecture text, negative tests) fixed in
`3a074f87`. Production check after deploy: `/` and `/playground` return 200; unauthenticated
`POST /mcp` returns 401 with the Bearer challenge; the usage postdeploy check passes.

Issue #167 stays open: `@cloudflare/codemode` 0.5.3 has byte-identical `dist/*.js` to 0.5.2,
upstream `main` keeps the prefix rule, and cloudflare/agents#2296 has no reply. No comment posted;
nothing material changed.

Issue #223 stays open as the Scout 1.9.71 hold record (comment posted with this round).

Open PRs, branches, worktrees, and stashes at the start: none beyond `main`. Round worktrees and
branches are removed at closeout (see "Final checklist").

## Own-repo todos

- `.agents/TODO.md` "Preserve structured routing intent…": adds the Scout 1.9.71 hold and
  acceptance check 12.
- `.agents/TODO.md` "Close the excluded-path rewrite gap in the leak guards" (Grok finding 4).
- `.agents/TODO.md` "Activate the Scout hackathon golden proposals when the Scout 1.9.71 absorb
  lands", "Reconcile hackathon winner goldens with the submission-detail operation", and "Decide
  whether Scout's hackathon store gaps are upstream findings" (golden lane).
- `.agents/TODO.md` "Decide whether Scout's strict repo-search label is an upstream finding"
  (re-verification lane).
- PR #229 removed nothing from the queue: its new adapter item was implemented in the same PR.

## Decisions

1. **Hold Scout 1.9.71.** The runbook allows a routing re-baseline only for an intended
   improvement. Four real regressions and no passing general repair rule that out. This follows
   the 2026-10-02 hold of the Docs title snapshot. Cost: production keeps the 1.9.61 contracts,
   without the new `searchHackathonBuilds` filters, the stored-copy `getHackathon` description,
   and the two new read operations.
2. **Exclude `reviewSubmission` when 1.9.71 lands** unless the general repair removes its capture.
3. **Ship the stellar-dev pin separately.** It is routing-neutral by a full row diff.
4. **`sd-037` thread resolution waits for the owner.** Resolving the outdated Copilot thread on
   stellar-protocol#2021 triggers the armed squash auto-merge into an SDF repository; that is an
   outward action, so the coordinator asked instead of acting.
5. **No #167 comment.** Nothing material changed upstream.

## Final checklist

- [x] Lane verdicts, commands, pane IDs, and reviewer tiers are recorded above.
- [x] Every author lane had a reviewer that differed from its author and the coordinator; every
      finding was reconciled (Grok drift review: 3 required changes addressed by the hold and
      queue; PR #229: 2 low findings fixed; golden proposals: 19 rows reconciled; re-verification:
      no findings).
- [x] Generated artifacts came from scripts; the CI generated-sync step is clean.
- [x] `npm run secrets:scan -- --tree` passed before each commit.
- [x] Stale gate: no past-due case; eleven near-due cases re-verified with staggered dates (PR #230).
- [x] Improvements: index, lint, live lint, and probes ran; no status change.
- [x] PR #229 merged (`528fa335`) and deployed (version `d40a36df-b402-48c7-bfd6-a07c04ba6cea`);
      production checks passed.
- [x] Issue #223 comment records the hold; #167 unchanged and open.
- [ ] Owner decision: resolve the outdated Copilot thread on stellar-protocol#2021 (`sd-037`).
- [ ] Round PR and PR #230 merged; the round PR deploys the skill pin.
- [ ] Round worktrees, local branches, and spawned panes cleaned up after merge.
