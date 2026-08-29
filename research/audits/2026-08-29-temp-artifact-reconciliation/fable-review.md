# Temporary-artifact reconciliation — Fable review

Reviewer: Claude Fable 5, independent product, truth, and decision-placement lane. Date:
2026-08-29. Mode: read-only. Repository at `main` HEAD `6817e99` (`docs: close human review
grill`). I did not read `sol-review.md`. I edited only this file.

## 1. Scope and method

I inspected every artifact named below and compared each with the durable state at HEAD:
`.agents/NEXT.md`, `.agents/TODO.md`, the four 2026-08-28 round ledgers, the Connectors ledger
addendum, `research/decisions/0008-human-review-eval-and-playground-policy.md`,
`research/audits/2026-08-28-human-review/README.md` and `fable-review.md`, both skill diffs,
the three edited `ideas/` files, `eval/qa/README.md`, `improvements/INDEX.md`,
`improvements/resolved.json`, `eval/qa/consistency-register.json`, merged PRs #84–#90, and the
current code (`src/demo/budget.ts`, `scripts/improvements-resolve.mjs`, the touched case files).

Classification vocabulary, as requested:

- **captured** — every work item and question in the artifact has a durable home.
- **superseded** — a later durable record replaced the artifact with a recorded disposition.
- **queued** — the work is already an open `.agents/TODO.md` or `NEXT.md` item.
- **missing** — a categorical work item or implementation question has no durable destination.
- **external-only** — the action belongs to the owner or an outside system, not this repository.
- **transient** — generated output, a lane brief, a log, or a tool cache; no distinct question.

Three `/tmp/*.json` files exist (`eval-refusal-policy.json`, `playground-input-limit.json`,
`connectors-directory.json`). All three are web-search result dumps with no owner text. Only
`eval-refusal-policy.json` is in scope; the other two are noted for completeness.

## 2. Inventory

### 2.1 Top-level `/tmp` records

| Artifact | Class | Durable destination at HEAD | Missing change |
| --- | --- | --- | --- |
| `/tmp/raven-owner-decisions-fable.md` (Q1–Q13 audit, 2026-08-28 21:33) | superseded | Grill items 1–15 and 21 in `.agents/rounds/2026-08-28-human-review-grill.md`; ADR-0008; `.agents/TODO.md` items "Audit sourcing-guard and corroboration warning classes", "Repair the reviewed canonical-page conflict cases", "Raise the user-message ceiling", "Add `qa-five-track-v1`"; `ideas/*` status lines; Connectors addendum. §12 tracking list landed except item 15. | Item 15 (a public reply on GitHub issue #40 stating the 8,000-char decision and the deferred history) is outward-facing owner work. The last comment on #40 (2026-08-27) predates the decision. Record it as external-only in the Playground TODO item or leave to the owner. Not a repo change. |
| `/tmp/raven-owner-decisions-fable-addendum.md` (G1 statistics + O3 challenge) | partly superseded, partly **missing** | Part 2 (O3): ADR-0008 "Eval outcome accounting" chose a different mechanism — a trap row carrying `successful-trap-refusal-not-correct` stays an `error` and counts as a T3 pass; T3 never derives from `judgeScore`. That is a confirmed owner decision and is not reopened here. Part 1 (G1): no durable record. `run-evals` keeps "the noise floor … is never a significance threshold" and per-id comparison only. | See §3 for the two owner questions and §4 items M1 and M2. |
| `/tmp/raven-decisions-fable-xhigh.md`, `-reconciliation.md`, `-final.md`, `-close.md`, `-sampling.md` (Q16–Q20 decision-shape reviews) | superseded | `research/audits/2026-08-28-human-review/fable-review.md` (appendix preserves the verdicts; final `PASS`); grill ledger "Q16–Q20 reconciliation reached acceptance from both xhigh decision-shape reviewers"; the two unadopted recommendations (symmetric-caution error, snapshot-date error) carry recorded dispositions. The `-close.md` "not blockers" (registry reads `proposed/`/`retired/`; day-30 review has its own ledger row and reviewer-differs record) are in the TODO lifecycle item. The `-final.md` implementation notes (count retry attempts in cost accounting; lint-canonical caution tokens; closed-enum lifecycle validation) are in the TODO five-track and lifecycle items. | One `-final.md` non-blocker is only partly captured: the frozen tooling suite file needs `author`, `authoredAt`, and a no-tuning `_comment` like `eval/holdout-cases.json`. The TODO item says "freeze it before the author can see the implementation" but does not name the metadata. Fold into the Routing TODO item (M6). |
| `/tmp/raven-decisions-sol-xhigh.md`, `-reconciliation.md`, `-final.md`, `-close.md`, `-sampling.md` | superseded | `research/audits/2026-08-28-human-review/sol-review.md` per that directory's README (not read by this lane); grill ledger records acceptance. Every Sol-specific ask I could check is in ADR-0008 (fixed denominators, `qa-five-track-v1` field list, one judge retry, lifecycle registry, review states). | None found from the Sol `/tmp` files themselves. |
| `/tmp/hyg-comment-sd-008.md`, `-sd-025.md`, `-sk-006.md`, `-sk-009.md`, `-sls-074.md`, `-sls-075.md`, `-sls-076.md` | captured | Posted 2026-08-28 (seven `issuecomment-54550…` URLs in `.agents/rounds/2026-08-28-improvements-hygiene.md`); `improvements/resolved.json` holds all seven read-back URLs (`grep -c issuecomment-54550` = 7); findings retired in PR #88. | None. |
| `/tmp/eval-refusal-policy.json` (web search: DeepEval, SORRY-Bench, RefusalBench, Anthropic streaming-refusal docs) | transient | Background reading for grill items 6, 11, 12. ADR-0008 rests on repository evidence (the 2026-08-27 safeguard row and the 2026-08-28 refusal row on `q-n3-ssrf-metadata-endpoint`), not on these sources. No repository record cites the file, and it carries no distinct question. | None. Optional: cite the streaming-refusal doc URL in the five-track README section when it lands. |
| `/tmp/playground-input-limit.json`, `/tmp/connectors-directory.json` (out of scope, noted) | transient / external-only | `research/audits/2026-08-28-human-review/README.md` records "no universal Playground character limit" as the evidence lane. Connectors search is external background. | None. |

### 2.2 Main-tree session scratchpad `d2c13b65-…/scratchpad/` (hygiene sweep and eval block 2)

| Artifact | Class | Durable destination at HEAD | Missing change |
| --- | --- | --- | --- |
| `hyg-common.md`, `hyg-lint-brief.md`, `hyg-recheck-brief.md`, `hyg-recheck-repairs.md`, `hyg-retire-brief.md`, `hyg-resolve-brief.md`, `hyg-review-brief.md` | transient (lane briefs) | Lanes table and ledger in `.agents/rounds/2026-08-28-improvements-hygiene.md`. | None. |
| `hyg-lint-report.md` | captured | PR #87 (`scripts/improvements-lib.mjs` constants, `test/improvements-lint.test.ts`); ledger Outcome records the never-filed `fixed-upstream` residual. | None. |
| `hyg-recheck-report.md` (+ Repairs section) | captured | PR #87/#88: `sd-036` fixed-upstream, four dated recurrences, `sd-001` primary-vs-replica sentence, `sls-077`/`sls-078` filed as stellarlight#1086/#1087. | None. |
| `hyg-retire-report.md` | captured, one small gap | PR #88 retirements; receipts; golden repoints through `golden-truth`; `#1031` watch item in TODO. | The optional successor candidate for `sk-006` (verbatim error-keyed rows for the GT-41 failure classes: `Bad union switch`, event/ledger testutils, non-root auth) is not in the `sk-006` receipt (`resolved.json` entry has no "GT-41" text) and the finding file is deleted. The evidence now lives only in git history and this scratchpad. See M4. |
| `hyg-resolve-report.md` | captured | PR #88; seven receipts with read-back URLs; ledger. | None. |
| `hyg-review-report.md` (Grok, three passes) | captured, two tiny leftovers | All numbered findings applied and recorded in the ledger Outcome. | (a) `scripts/improvements-resolve.mjs:19` still carries a private `githubRefRe` copy after `GITHUB_EVIDENCE_REF_RE` moved to `improvements-lib.mjs`; the reviewer called it "leftover". (b) `oneLineTitle` does not strip the blockquote marker, so `improvements/INDEX.md:48` titles `sd-036` as `> Fixed 2026-08-28…`. Both are own-repo cleanups with no home. See M5. |
| `b2-common.md`, `b2-evalrun-brief.md`, `b2-findings-brief.md`, `b2-grokpin-brief.md`, `b2-resolver-case-brief.md`, `b2-review-brief.md` | transient | `.agents/rounds/2026-08-28-eval-block2.md` lanes table. | None. |
| `b2-evalrun-report.md` (Phases 1–3) | captured, three gaps | `eval/qa/README.md` "Judge-tier contract" and "2026-08-28 same-100 rerun" sections; register re-sweeps; four TODO "Eval instruments" items; `.gitignore` fix in `644f364`. | (a) The per-id comparability lists — 41 comparable ids and 59 changed ids — appear only in the scratchpad and this report. Neither the README record nor the block-2 ledger lists them (`grep q-aas-sep30-recoverable-wallets` = 0 in both). The open TODO item "Golden-edit rounds must record the affected id list" exists precisely so a rerun does not reconstruct this with `git show`; the one list that was reconstructed is not saved. See M3. (b) The operator's caveat that `q-protocol-ledger-close-time` may be a Docs content gap (docs say "~5 second target"; golden requires the dated 5–7 s sample) was dropped from the README triage and has no TODO or monitor note. See M7. (c) The suggestion to move the `prepareJudgeStabilityRegister` write after the clean-tree assertion was not carried; the `.gitignore` fix closes the failure, so this is optional. |
| `b2-findings-report.md` | captured / queued | `sls-079`, `ll-030` at `proposed` in `improvements/INDEX.md`; TODO "Eval instruments" items; block-2 ledger Outcome ("await a verifying re-execution before filing"). `proposed` is itself the pipeline queue per `improvements-pipeline`. | None. |
| `b2-grokpin-report.md` | captured | PR #89 (`xai/grok-4.6` pin, gauntlet default list). | None. |
| `b2-resolver-case-report.md` | captured | `q-scf-resolve-passport-superseded-slug` landed; README denominator 499→500 and sample churn recorded. | None. |
| `b2-review-report.md` (Grok, PASS after repairs) | captured, one nit unhomed | Three findings applied (`sls-079` rewrite, NEXT exposure rule, TODO checkboxes). `sls-079` leftover "not re-fetched" sentences are gone at HEAD. | Nit: Passport key facts 2–4 pack a second idea after a comma; "split if a later burn-down touches the file". The case has no long-fact warning, so block 1 will not touch it. See M6. |
| `bootstrap.log`, `bootstrap2.log`, `tasks/*.output` | transient | — | None. |

### 2.3 Main-tree scratchpad `518ac614-…/scratchpad/` (live-drift issue #86 Fable audit)

| Artifact | Class | Durable destination at HEAD | Missing change |
| --- | --- | --- | --- |
| `section.md` | captured | Verbatim as the "Runtime, exposure, and eval audit" reviewer section in `.agents/rounds/2026-08-28-live-drift-86.md`; the `eval/gates.json` sha-pin step it left open is closed in that ledger (gate passes at `4945c31…`). | None. |
| `apiref.old.md`, `apiref.new.md`, `apiref.diff`, `q.old.json`, `q.new.json`, `live-openapi.json`, `routing-cases.before.json`, `mm.bak`, `oc.bak` | transient evidence family | Skill pin `2e4e412f0ae7 → d25b9f6bd842` in `ecosystem-skills/PIN-REVIEW.md`; scrub proof in the ledger section. | None. |
| `build.log`, `evalcompile.log`, `evalrouting.log`, `mirrors.log`, `mm.log`, `oc.log`, `pinreview.log`, `secrets.log`, `test.log`, `test2.log`, `typecheck.log` | transient gate logs | Ledger gate lines. | None. |

### 2.4 Main-tree scratchpads `0867aca6-…/tasks/`, `9a5c679b-…/tasks/`

| Artifact | Class | Note |
| --- | --- | --- |
| `*.output` (11 files) | transient | Tool-result caches of repository files (`eval/qa/README.md`, `run-evals/SKILL.md`, `fable-max.md`, the idea note, `eval/EVALS.md`, `lib.mjs`). No distinct content. |

### 2.5 Eval-block-2 worktree scratchpads (`…lane-eval-block2-20260828/`)

| Artifact | Class | Durable destination at HEAD | Missing change |
| --- | --- | --- | --- |
| `4850fd67…/scratchpad/comparable-ids.txt`, `comparable-ids-644f364.txt`, `baseline-ids.txt`, `baseline-ids-csv.txt`, `changed-ids.json`, `case-change-report.json`, `comparison.json` | **missing** (id lists) | README states "41 ids byte-identical" and the counts; no list. | M3. |
| `wrong-rows.txt` | captured | README "Triage of the 20 non-passing rows" table. | None. |
| `keyfact-diffs.txt`, `reopen-members.txt`, `open-reopens.json`, `reopen-field-summary.json`, `reopen-commits.json`, `reconcile-reopens.mjs` | captured | The 18 `reSwept` reasons are in `eval/qa/consistency-register.json` (124 consistent / 11 tension / 0 reopen); `reconcile-reopens.mjs` is a scratch tool whose `DECISIONS` text is the register text. | None. |
| `judge-stability-preview.json` | superseded | Regenerated gitignored `eval/qa/judge-stability.json` (195 artifacts); the 47→57 movement is in README and TODO. | None. |
| `gate-*.txt`, `p3-*.txt`, `phase2-run.log`, `raven-eval-surface-b2.json`, `cases-baseline.json`, `tasks/*.output` | transient evidence family | Ledger gate lines; README pins. | None. |
| `d85946a3…/scratchpad/gates-eval.txt`, `gates-base.txt`, `cases-main.json`, `sample-main.json`, `openapi.json`, `projects.json`, `resolve-passport.json` | transient evidence family | Lane F report values (`generatedAt 2026-08-28T17:11:33.764Z`) are in the ledger and the case file. | None. |

Worktree state: `git worktree list` shows only the main checkout; the lane branches merged as
PRs #87–#90. No unmerged implementation exists in any scratchpad.

## 3. The two addendum owner questions

`/tmp/raven-owner-decisions-fable-addendum.md` §2.4 asked two questions. Neither appears in
the grill's 21 items, in ADR-0008, or in `research/audits/2026-08-28-human-review/fable-review.md`.
`.agents/NEXT.md` states "No owner question from that grill remains open", which is true of the
grill. These two were not grill items.

**Q1 — "Approve the convention that key fact 1 on a trap case is the behavior fact, with three
reorders and a lint rule."** Status: **superseded in mechanism, not in substance; needs a
future-work record, not an owner decision.** ADR-0008 fixes T3 as: pass a graded `correct` trap
or an `error` row carrying `successful-trap-refusal-not-correct`; that violation fires only when
`coreAnswer` is `correct`, `wrongClaims` and `avoidMatches` are empty, and the rationale confirms
a refusal (`verdict-consistency.mjs`). The owner therefore relies on the judge's `coreAnswer`
decision, not on a key-fact convention, to stop a generic refusal from scoring. The residual risk
from the addendum stands: on the 41 trap cases, a bare refusal is the wrong behavior on about
30 (scam-check, fabrication-bait, paid-bait, ambiguous, out-of-scope, and some injection cases
require answering the legitimate part or asking a question), and the judge prompt's trap block
does not state that per kind. The open TODO item "The verdict-consistency engine converts two
judge-prompt contradictions into 4% errors" must choose between a prompt fix and a trap-path
fix, and a rubric bump is required either way. The behavior-fact proof belongs there as a
constraint on whichever fix lands. Record it (M2). No new owner decision is required, because
ADR-0008 already defines the T3 pass rule and this only constrains the queued rubric fix.

**Q2 — "Accept 'no regression larger than one confirmed row on |S| comparable ids' as the
strongest claim, with a second collection replicate before a ship claim."** Status: **not
superseded; missing durable work; the decision is an instrument design, not an owner policy.**
ADR-0008 and `run-evals` keep three true statements: the noise floor bounds variance and is
never a significance threshold; comparisons use unchanged ids; corpus changes are never system
gains. None of them defines a pass/fail/indeterminate procedure. The 2026-08-28 record says the
41-id movement "sits at the noise floor" and "supplies no evidence of a real quality change",
which is exactly the INDETERMINATE reading the addendum asks the repository to make explicit.
The exact paired method (one-sided exact binomial on discordant pairs after identical-input
re-judge confirmation; PASS only under a stated power condition; INDETERMINATE otherwise) has no
home. It should become an "Eval instruments" item (M1). Whether the owner wants to spend on a
second replicate is a per-round pre-spend decision that `run-evals` already routes through the
pre-spend review, so it does not need a standing owner answer.

Owner-decision fidelity check: nothing in either question conflicts with a confirmed decision.
Q1 must not reintroduce the score rewrite that ADR-0008 declined. Q2 must not reintroduce the
stability ≥ 0.75 filter as the gate denominator; the register stays a tiering input.

## 4. Missing durable work (exact changes)

None of these reopens a confirmed decision. All are additions to existing queues or one-line
notes. Ordered by product-reality weight.

- **M1 — Paired non-regression decision procedure.** Add to `.agents/TODO.md` "Eval
  instruments": define the same-100 comparison as a decision procedure with three outcomes.
  Preconditions: same judge tuple and tiering policy, |S| ≥ 30 byte-identical ids, register hash
  frozen before collection, threshold pre-registered in the round ledger. Steps: partition S into
  up/down/same; exclude T4/T5 rows with the count printed; re-judge every discordant row on both
  arms on identical input; confirmed d = pairs that reproduce; one-sided exact binomial
  P(X ≥ k_down | d, 0.5) with p ≤ 0.05 as FAIL; PASS only when |S| ≥ 30, confirmed k_down ≤ 1,
  k_up ≥ k_down, and no confirmed down pair has a named mechanism, printed as "no regression
  larger than one confirmed row detected on |S| ids"; INDETERMINATE otherwise, which blocks a ship
  claim. Do not use the stability register as the gate denominator. Done when `eval/qa/README.md`
  and `run-evals` name the procedure and the next same-100 record prints the three-way verdict.
  Source: addendum Part 1; this round's README record already reads the result this way in prose.
- **M2 — Behavior-fact proof for trap rows.** Append to the existing TODO item "The
  verdict-consistency engine converts two judge-prompt contradictions into 4% errors": whichever
  fix lands (prompt or trap path) must not let a generic refusal pass T3. Constraint: 39 of 41
  trap cases already state the behavior with the case's specific object in key fact 1; the two
  boilerplate-first cases (`q-edge-noinfo-exact-tvl-figure`,
  `q-edge-noinfo-stellar-native-privacy-default`) and the fact-first scam-check
  (`q-edge-1xlm-activation-fee`) need a `golden-truth` reorder before a key-fact rule can be
  relied on; the judge trap block must say per trap kind that a refusal which skips the legitimate
  part, the clarifying question, or the named alternative is `coreAnswer: incorrect`. T3 pass
  stays as ADR-0008 defines it. Source: addendum Part 2.
- **M3 — Record the 2026-08-28 comparability id lists.** Append to
  `.agents/rounds/2026-08-28-eval-block2.md` (or the README record) the 41 byte-identical ids and
  the 59 changed ids from `b2-evalrun-report.md` §3, with the two revisions compared
  (`9bb465d` vs `644f364`). This is the first concrete instance of the open TODO rule "record the
  affected id list"; the next rerun after golden session 3 needs both this list and the session-3
  list.
- **M4 — `sk-006` successor candidate.** Add a monitor-only line to `improvements/README.md`'s
  monitor list or a note on the `sk-006` receipt's `reviewEvidence`: verbatim error-keyed rows
  for the GT-41 failure classes (`Bad union switch`, event and ledger testutils, non-root auth,
  no-contract-context) are still absent from `development.md` at pin `b78983c` (re-checked
  2026-08-28T13:18Z). Below the two-unrelated-cases acting bar; do not file. The evidence
  otherwise survives only in git history of the deleted file.
- **M5 — Two own-repo cleanups from the hygiene review.** Add one TODO item under a small-fixes
  heading: (a) replace the private `githubRefRe` in `scripts/improvements-resolve.mjs:19` with
  the shared `GITHUB_EVIDENCE_REF_RE`; (b) make `oneLineTitle` strip a leading blockquote
  marker so `improvements/INDEX.md` does not title `sd-036` with `>`. Both are generator
  hygiene; neither changes a finding.
- **M6 — Fold three small case and suite notes into existing items.** Routing TODO item: the
  frozen suite file carries `author`, `authoredAt`, and a no-tuning `_comment` like
  `eval/holdout-cases.json`. Golden session 3 (NEXT block 1): split the comma-joined second
  ideas in `q-scf-resolve-passport-superseded-slug` key facts 2–4 when touched, and align
  `q-tool-soroban-auth-audit-live` `truth.asOf` (2026-08-25) with its 2026-08-28 verification.
- **M7 — `q-protocol-ledger-close-time` Docs check.** Add a one-line monitor note (TODO
  "Staleness" or the improvements monitor list): verify live whether the official docs still
  publish "~5 second" while the golden's GT-32 correction requires the dated 5–7 s observed
  range; if so, it is a Docs content gap candidate, not an agent failure. Free check.
- **M8 — Model-roster evidence.** `research/agent-model-roster.md` has no entry for
  `@cf/zai-org/glm-5.3-flash`, which ran three lanes on 2026-08-28 as an owner-requested trial
  (lint contract: clean; retirement review: clean; findings filing: one high-severity
  misstatement in `sls-079` caught by review). Record the trial outcome there so
  `routing-agent-work` has evidence.

Not missing, for the record: the ARCHITECTURE.md Playground table still says 4,000 chars and
truncation; that is correct until the queued TODO item ships, and the TODO item's done-when
requires the docs update. The issue #40 public reply is external-only owner work.

## 5. Product reality, truth policy, and decision fidelity

- **Product reality.** No temporary artifact contains unmerged product code. The only product
  change from these rounds is the `grok-4.6` control pin (PR #89) and the Playground limit is
  queued, not shipped. ADR-0008 says so ("implementation remains queued"). The eval record does
  not claim a product change; the 41-id reading is correctly labeled diagnostic.
- **Truth policy.** Every golden edit in these artifacts went through `golden-truth` with
  provenance (`sls-074` cases, `sk-006`/`sd-008` repoints, the Passport case). The three
  canonical-page cautions are queued, not applied, and ADR-0008 fixed the boundary at three
  cases. No artifact proposes a score-driven golden change. The register reconciliation recorded
  seven genuine fact updates with cross-corpus checks; none moved a truth toward a score.
- **Owner-decision fidelity.** The 21 grill decisions map to durable destinations exactly once
  (grill ledger). The two unadopted reviewer recommendations carry dispositions. My earlier O3
  score-rewrite proposal was declined in favor of the error-row marker; I record that as final.
  The addendum's two questions were never put to the owner and do not need to be: one is a
  constraint on a queued fix, the other is an instrument design.
- **External-only.** Connectors Directory work is blocked externally and recorded as such.
  The seven upstream comments were owner-authorized and posted; nothing outward remains pending
  except the optional issue #40 reply.

## 6. Verdict

**CHANGES-REQUESTED** — eight small durable additions (M1–M8), none of which reopens a decision.
M1, M2, and M3 are the ones with product or measurement consequence: without M1 the next
same-100 rerun will again argue about "inside the noise band" in prose; without M2 the queued
rubric fix can make trap scores gameable by a generic refusal; without M3 the next comparison
must rebuild the id list from `git show` a second time, which the open TODO item was written to
prevent. M4–M8 are one-line notes.

After M1–M8 land, every artifact in §2 is captured, superseded, queued, external-only, or
transient, and this review's verdict becomes PASS.

## 7. Focused reconciliation — 2026-08-29 (after reading `sol-review.md`)

Sol's report is `PASS`: no accepted implementation category lacks a destination. I agree with
that sentence. My M1–M8 were never accepted categories; they are residuals from review prose.
The question here is which of them preserve future work without adding cruft. Reduced below.

Two of Sol's rows need a correction on the record, not a verdict change:

- Sol classes `comparable-ids.txt` and `changed-ids.json` as transient with the ledger and README
  as owners. Neither durable file lists the ids (`grep q-aas-sep30-recoverable-wallets` returns 0
  in both). The counts are durable; the lists are not. Disposition below (M3).
- Sol classes the addendum as fully superseded. Part 2 (O3) is superseded by ADR-0008's T3 rule.
  Part 1 (the paired decision procedure) is not addressed by any durable record. Disposition
  below (M1).

### Per-item disposition

| Item | Disposition | Reason |
| --- | --- | --- |
| M1 paired three-outcome comparison verdict | **TODO-required** (one short item) | Not an owner decision and not superseded. Without it every same-100 record argues "inside the noise band" in prose. The next rerun follows golden session 3 and will need the rule. |
| M2 behavior-fact constraint on the trap fix | **TODO-required** (two-sentence append to the existing contradiction item) | ADR-0008 fixes the T3 pass rule; the queued rubric or trap-path fix is still open. The constraint keeps a generic refusal from passing T3 once the `error` rows stop. No new item. |
| M3 record the 41/59 id lists | **dated-audit-only** | The open TODO rule already prevents recurrence. Session 3 will change more ids, so the next rerun must rebuild its own list anyway. A 100-id list in a ledger is cruft. The 41 comparable ids are preserved in this dated audit (below). |
| M4 `sk-006` GT-41 successor candidate | **dated-audit-only** | Below the two-unrelated-cases acting bar. Recorded here with the 2026-08-28 recheck so it can be found if a second case appears. |
| M5 `improvements-resolve.mjs` regex copy; `oneLineTitle` blockquote | **dated-audit-only** | Two one-line generator cleanups. A TODO item would outweigh the fix. Whoever next edits `scripts/improvements-*.mjs` takes them from here. |
| M6 suite metadata; Passport comma nit; `asOf` alignment | **existing-destination** / reject | Suite `author`/`authoredAt`/`_comment`: the Routing TODO item already requires freezing before authorship and a suite-specific validator; `golden-truth` names the holdout precedent. Passport comma nit: reject (lint passes; no reader confusion). `q-tool-soroban-auth-audit-live` `asOf`: fold into the next `golden-truth` touch of that case; noted here. |
| M7 `q-protocol-ledger-close-time` Docs check | **dated-audit-only** | A free live check that belongs to the next `run-evals` triage, which reads dated audits. Recorded here with the exact question. |
| M8 GLM 5.3 flash roster evidence | **existing-destination** (`research/agent-model-roster.md`) | The roster exists for this evidence. One row, no new file. Optional for this round. |

### Dated records preserved here (M3, M4, M5, M6, M7)

- **M3.** Baseline `2026-08-27T00-02-11-variantA.json` (corpus `9bb465d`) versus
  `2026-08-28T19-27-08-variantA.json` (corpus `644f364`): 59 of 100 ids changed judge-facing
  gospel; 41 byte-identical: `q-aas-sep30-recoverable-wallets`, `q-anchor-sdp-vs-anchor-platform`,
  `q-asset-rwa-tokenized-freshness`, `q-asset-two-account-issuer`, `q-comp-auth-flags-overview`,
  `q-comp-cross-moneygram-partnership-sep24`, `q-comp-sep8-number-lookup-no-deepresearch`,
  `q-defi-bridge-evm-to-stellar-axelar`, `q-defi-comet-what-is`, `q-defi-skill-ecosystem-scout`,
  `q-eco-pyusd-stellar-freshness`, `q-edge-noinfo-stellar-native-privacy-default`,
  `q-gap-av-offset-not-timestamp`, `q-gap-match-partners-degrade`, `q-gap-related-projects-empty`,
  `q-gap-upcoming-hackathon-fallback`, `q-history-ecosystem-index-freshness-live`,
  `q-jutsu-what-is-a-memo`, `q-n3-missing-funds-account-support`, `q-n3-ssrf-metadata-endpoint`,
  `q-protocol-ledger-close-time`, `q-protocol-operation-types-list`, `q-raph-offramp-xlm-usdc`,
  `q-raph-scam-spam-tokens`, `q-scf-history-soroswap`, `q-scf-rfps-hackathons-live`,
  `q-sep-31-cross-border`, `q-sep-53-sign-verify-message`, `q-sep-catalog-list`,
  `q-sor-doc-page-sections-followup`, `q-sor-sep41-transfer-vs-transferfrom`,
  `q-soroban-contract-id-derivation`, `q-soroban-oz-token`, `q-soroban-sdk-cve`,
  `q-soroban-sdk-macros`, `q-stellar-recurring-payments`, `q-ti-vocab-content-tags-live`,
  `q-token-circle-usdc-on-stellar`, `q-tool-indexer-repos-discovery`, `q-tool-sep41-status-live`,
  `q-zk-circuit-setup`. Nine flipped; 16 of the 41 are judge-unstable; 25 are stable on both axes.
- **M4.** `stellar/stellar-dev-skill` `development.md` at pin `b78983c` (checked
  2026-08-28T13:18Z) has 0 occurrences of `Bad union switch`, `Event TestUtils`, `Ledger
  TestUtils`; no error-keyed row for non-root auth or no-contract-context. One case only
  (`q-ti-cli-rust-windows-troubleshooting` family, GT-41). File a successor to retired `sk-006`
  only when a second unrelated case reproduces.
- **M5.** `scripts/improvements-resolve.mjs:19` keeps a private `githubRefRe` after PR #87 moved
  `GITHUB_EVIDENCE_REF_RE` into `scripts/improvements-lib.mjs`. `oneLineTitle` leaves a leading
  `>` in `improvements/INDEX.md:48` for `sd-036`.
- **M6.** `q-tool-soroban-auth-audit-live`: `truth.asOf` `2026-08-25`, `truth.verified.date`
  `2026-08-28`; align on the next `golden-truth` touch.
- **M7.** `q-protocol-ledger-close-time`: the 2026-08-28 answer quoted an official page saying
  "~5 second target"; the golden (GT-32) requires the dated 5–7 s observed range. Check live
  whether the docs still publish the ~5 s figure. If yes, it is a Docs content-gap candidate for
  `improvements/`, and the row's triage class is not "agent failure". Free check.

### Stale ledger rows

`.agents/rounds/README.md` says an unfinished ledger is an unfinished round. Both 2026-08-28 lane
ledgers have a finished Outcome and merged PRs, but their orchestration rows still read
`in progress`:

- `.agents/rounds/2026-08-28-improvements-hygiene.md:21` — `| Orchestration | … | in progress |`.
  PRs #87 and #88 merged. The Outcome's "Lane C: RETIRE recommended … Sequencing: …" bullet reads
  as pending; the last bullet already states the retirements completed, so only the status cell
  needs the change.
- `.agents/rounds/2026-08-28-eval-block2.md:19` — `| Orchestration | … | in progress |`. PR #89
  merged. Outcome wording is accurate ("Open follow-ups" are TODO items).

The live-drift and grill ledgers have no stale rows.

### Final verdict

**CHANGES-REQUESTED** — three small patches. Everything else is preserved in this dated audit.

Exact minimum patch list:

1. `.agents/rounds/2026-08-28-improvements-hygiene.md:21` and
   `.agents/rounds/2026-08-28-eval-block2.md:19`: change the Orchestration status cell from
   `in progress` to `completed`. No other ledger text changes.
2. `.agents/TODO.md`, item "The verdict-consistency engine converts two judge-prompt
   contradictions into 4% errors": append two sentences — "Whichever fix lands must keep a
   generic refusal from passing T3: the judge trap block states per trap kind that a refusal
   which skips the legitimate part, the clarifying question, or the named alternative is
   `coreAnswer: incorrect`. Three trap cases (`q-edge-noinfo-exact-tvl-figure`,
   `q-edge-noinfo-stellar-native-privacy-default`, `q-edge-1xlm-activation-fee`) do not state
   the behavior in key fact 1 and need a `golden-truth` reorder before any key-fact rule."
3. `.agents/TODO.md`, new item under "Eval instruments", "Define a three-outcome paired
   comparison verdict": same judge tuple and tiering; |S| ≥ 30 byte-identical ids; exclude T4/T5
   rows with the count printed; re-judge every discordant row on both arms on identical input
   and keep only pairs that reproduce; one-sided exact binomial on confirmed discordant pairs,
   p ≤ 0.05 = FAIL; PASS only when |S| ≥ 30, confirmed down ≤ 1, up ≥ down, and no confirmed
   down pair has a named mechanism, printed as "no regression larger than one confirmed row on
   |S| ids"; INDETERMINATE otherwise and blocks a ship claim; the stability register is never the
   denominator. Done when `eval/qa/README.md` and `run-evals` name the procedure and the next
   same-100 record prints the verdict. Source: this audit §3 and §7.

Optional, not required for PASS: one row in `research/agent-model-roster.md` for
`@cf/zai-org/glm-5.3-flash` (2026-08-28 lanes: lint contract clean, retirement review clean,
findings filing one high-severity misstatement caught in review).

After patches 1–3, this review is **PASS**.

## 8. Final patch review — 2026-08-29

Reviewed the uncommitted diff against §7 (`git diff` on `.agents/NEXT.md`, `.agents/TODO.md`, the
two 2026-08-28 lane ledgers, `research/audits/2026-08-28-human-review/README.md`, and the
untracked reconciliation directory). Live checks were read-only GETs.

### Owner decisions

Unchanged. `git diff --stat` on `research/decisions/`, the grill ledger, `ideas/`, and
`.agents/skills/` is empty. The NEXT "Owner decisions" section is untouched. The patch adds
future-work destinations only; ADR-0008's T3 rule, the three-case caution boundary, the
`sources.locate` deferral, the stateless Playground, and the external Connectors block all stand.

### Required destinations (§7 patches 1–3)

| §7 patch | Applied as | Verdict |
| --- | --- | --- |
| 1 — two ledger status cells | `2026-08-28-eval-block2.md:19` and `2026-08-28-improvements-hygiene.md:21` now read `completed`. The hygiene Outcome's stale "Lane C: RETIRE recommended … Sequencing …" bullet was rewritten to the completed state, and "filing-ready" became "filed as issues #1086 and #1087". The eval-block2 Outcome now says `sls-079`/`ll-030` were "created as `proposed`" and await re-execution "before upstream filing". Both are truthful against `improvements/INDEX.md` and the merged PRs. | Holds. |
| 2 — behavior-fact constraint on the trap-contradiction item | Appended to the existing TODO item with behavior-class fixtures (legitimate answer, clarifying question, boundary, named alternative, scam warning) and "test the required behavior directly instead of relying on key-fact position". This is stricter than my key-fact-1 convention and avoids the three `golden-truth` reorders. Keeps ADR-0008's T3 and T4 unchanged. NEXT block 3 mirrors it. | Holds; better than the §7 text. |
| 3 — paired comparison verdict item | New TODO item "Design and validate a paired comparison verdict" requires estimand, margin, power, fixed T4/T5 exclusions, a repeat rule, and simulation or repeated-judge backtests before adopting any threshold. It deliberately does not adopt the addendum's exact numbers. NEXT block 3 lists it. | Holds. Validation-first is the right shape; my §7 thresholds stay in this dated audit as the starting proposal. |

### Dated-audit-only items (M3–M7) and the two extra TODO items

- M3, M4, M5 (regex), M6, M8: preserved in §7 and in the reconciliation README's residual list.
  The README's statement that the Fable report holds the 41-id list is true (§7 M3).
- M5 (blockquote title): the patch queues a generator repair under "Improvements backlog" with a
  regression test, and it correctly rejects a direct swap of the resolver's global matcher for
  the non-global `GITHUB_EVIDENCE_REF_RE` (`improvements-lib.mjs:33` has flag `i`;
  `improvements-resolve.mjs:19` uses `gi` with `match`). A queued generator repair is acceptable
  under this task's terms. Not cruft: the defect is visible in a generated, committed file.
- M6/M7: the patch queues "Recheck two dated source-metadata conflicts" under the canonical-page
  block. The `q-tool-soroban-auth-audit-live` `asOf` bullet is exact. The
  `q-protocol-ledger-close-time` bullet has one factual problem — see finding F1.

### Remaining findings

**F1 — severity: low.** `.agents/TODO.md`, item "Recheck two dated source-metadata conflicts",
second bullet: "The official History Ledgers page still says approximately five seconds." I could
not reproduce that sentence. Live on 2026-08-29: `/docs/learn/fundamentals/stellar-data-structures/ledgers`
has no "five seconds" or "5 seconds" wording; the golden's cited page
`/docs/learn/fundamentals/stellar-stack` says "every 5-7 seconds", which matches the golden; and
`/docs/validators` says "every 3-5 seconds". So a Docs conflict exists, but between the stack
page (5–7 s) and the validators page (3–5 s), not on the Ledgers page. The golden's corroboration
row already reads "Current official wording is about 5–7 seconds", which is right for its cited
page. Smallest repair: replace the sentence with "Official pages disagree on 2026-08-29: the
stack page says 5–7 seconds; the validators page says 3–5 seconds. Confirm both live, then decide
whether the case needs a symmetric caution or a Stellar Docs finding." Keep the rest of the bullet.
This is a wording correction in a queued item; it does not change a decision.

No other finding. Scope was not expanded: the patch touches five tracked files plus the new audit
directory, and every added item traces to §7.

### Verdict

**CHANGES-REQUESTED** on F1 only — one sentence in one TODO bullet. After F1, **PASS**.

## 9. F1 disposition — 2026-08-29

Re-read `.agents/TODO.md` "Recheck two dated source-metadata conflicts". The second bullet now
reads: "`q-protocol-ledger-close-time` cites official wording for a 5–7-second range. Verify the
current wording across every cited official page. Preserve the dated 199-ledger observation, but
verify its attribution separately. Add a symmetric caution or file a Stellar Docs finding only if
a live conflict remains after direct confirmation."

The unverifiable "History Ledgers page … approximately five seconds" sentence is gone. The bullet
asserts no current source state and requires direct verification before any caution or finding.
That matches the truth policy and this audit's F1 repair. The 2026-08-29 live observation
(stack page 5–7 s; validators page 3–5 s) stays recorded in §8 as dated evidence for that check.

F1: **resolved**. No remaining finding.

**Final verdict: PASS.**
