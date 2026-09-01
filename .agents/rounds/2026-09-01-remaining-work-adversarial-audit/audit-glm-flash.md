# Remaining-work adversarial audit — GLM 5.3 Flash

Date: 2026-09-01
Scope: read-only audit of `.agents/NEXT.md` and `.agents/TODO.md` against the brief's required evidence.
This audit authorized no implementation, paid run, live fetch, production change, golden change, routing attempt, or upstream message.

## 1. Runtime

- Model: GLM 5.3 Flash (`z-ai/glm-5.3-flash`).
- Provider: OpenRouter, served through the OpenCode CLI.
- Requested variant: max, as stated in the assignment.
- Observed variant: the session cannot introspect the served effort level beyond the request. The audit ran in one session on the assigned model with no model switch.
- Evidence handling: all 15 required sources were read in full or at the sections the brief names. I read no other auditor report. Verification used repository files, git history, and two free offline commands (`npm run eval:qa:lint -- --stale` and file counts). No other file was edited.

## 2. Verdict

`PASS-WITH-FIXES`.

The queue describes the remaining work, decisions, evidence triggers, and completion gates well. A new agent can proceed from it without reconstructing prior rounds, except for the gaps below. Two findings need repair before the next queued action (F1, F2). The rest are precision repairs. No finding blocks this audit's reconciliation or read-only planning. No finding weakens a frozen contract, and no finding recommends per-question tuning.

## 3. Findings

### Confirmed checks (brief questions 1, 2, 3, 5, 7, 9, 10, 11, 13)

These checks found no defect. They answer the brief's questions and ground the verdict.

- **No omitted active work, except F2 and F7.** Every `TODO.md` item maps to an open decision, an open upstream state, or a recorded trigger. The five-track ledger's "answering-prompt task" disposition is traceable: commit `b59517d` (PR #104) deliberately removed it and folded the defect into the diagnostic item plus the monitor-only Friendbot rule. The judge-stability question is closed and absent from the queue, as `NEXT.md` records. The five golden candidates landed in PR #100 and no longer need a queue item.
- **No completed work kept active.** The three routing attempts are spent and correctly trigger-only. The rejected prompt and recovery implementations are correctly absent from production. `sd-047` and `sls-080` are maintained in `improvements/`, not as queue work.
- **Each queue item states prerequisites, permitted actions, forbidden actions, and a completion gate.** The recovery item, routing item, token-prefix item, Friendbot item, diagnostic item, and `#1031` watch all carry a "Done when" clause. One gate is ambiguous (F1).
- **The diagnostic and the paid headline are correctly separated.** `TODO.md` requires an independently reviewed plan, then a passed product gate, then separate authorization for any headline sample. This preserves the one-headline and two-gate contract.
- **The paired owner decision presents the correct object and trade-offs.** It asks for a product-loss margin chosen from product impact, not power. The table is labeled as a mixed-tuple upper bound, matching `eval/qa/README.md` and the paired ledger. It states the recalibration-pair requirement.
- **Trigger-only is correct for protocol-history routing.** Three mechanisms produced three verified `FAIL` results (stamps `2026-08-31T16-58-42-389Z-clause-fit-hysteresis-v1`, `2026-08-31T23-36-38-660Z-cross-encoder-fit-v1`, `2026-09-01T14-22-28-993Z-clause-support-fit-v1`). The data is reachable upstream, so no `improvements/` finding applies. The box is spent, and triggers T1 to T4 are checkable.
- **T1 through T4 are sufficient and measurable.** T1 pins two SHA-256 values. T2 and T3 are recorded owner decisions with pre-registration duties. T4 requires two transcripts. The trigger list resists post-hoc goal change because the brief and the queue restate the same values. One definition gap remains (F9).
- **Sequencing is correct.** Block 1 is free-first with review. Block 2 is monitor-only behind the free Horizon probe. Block 3 is trigger-only. Owner decisions carry no deadline by design. Upstream watches stay quiet.
- **Weak-evidence items are mostly labeled.** The margin table carries its mixed-tuple label. The first same-100 result and the 57/100 stability count are marked local. The lint counts are current: this audit re-ran the free lint and measured 0 errors and 61 warnings (44 sourcing-guard, 16 corroboration, 1 symmetric-caution), matching `NEXT.md`.

### Defect findings

**F1 — Severity: Medium.** The recovery block conflates the freshness gate with work authorization.
- Sources: `.agents/TODO.md` ("Monitor the rejected repository-tooling recovery experiment", "Done when"), `.agents/NEXT.md` block 2.
- Problem: The "Done when" clause reads "a free Horizon probe returns `28`, or a new evidenced trigger authorizes a separately reviewed recovery plan." `NEXT.md` block 2 says "Do not run a paid recovery collection until this probe returns `28`." A literal reading makes probe `28` both the item's completion and the paid run's unlock. The selection trigger (three recurring misses) and the reviewed-plan requirement sit outside that sentence.
- Consequence: An agent could treat probe `28` as authorization for a paid recovery collection, or close the monitor item and lose the selection-trigger and `sls-082` rules. The run-evals pre-spend gate would likely catch the spend, but the queue itself invites the misread.
- Required repair: Rewrite the clause to separate the sls-080 lifecycle close (probe `28` plus an improvements-round re-check) from the selection trigger and from any paid work, which always needs a separately reviewed plan and its own authorization. See section 7.

**F2 — Severity: Medium.** Paired-method promotion has no actionable queue block.
- Sources: `.agents/NEXT.md` ("Choose a product-loss margin for the paired QA method"), `.agents/rounds/2026-08-29-paired-verdict.md` (finding M5, Outcome), `eval/qa/README.md` ("Paired `PASS` / `FAIL` / `INDETERMINATE` verdict"), `.agents/skills/run-evals/SKILL.md` (paired section).
- Problem: The promotion prerequisites live in three places, but no `TODO.md` item or `NEXT.md` block owns the work. Promotion needs one same-tuple pinned pair. The 2026-08-30 artifact used rubric `v2.9`; the rubric is now `v2.10`; `NEXT.md` itself says cross-rubric comparison requires a rejudge under the target tuple. So at least one new paid collection, and probably two, is required, plus the recalibration run.
- Consequence: After the owner picks a margin, no queue entry tells the next agent what to collect, under which contracts, or that each collection needs a new pre-spend review and budget. Prior method-specific authorizations are spent, so the pair cannot ride an old authorization.
- Required repair: Add a queue item "Recalibrate the paired verdict" (see section 7). It lists the blocking artifacts and reviews; it authorizes nothing by itself.

**F3 — Severity: Medium.** The capability-boundary block states too few design constraints for the next plan author.
- Sources: `.agents/NEXT.md` block 1, `.agents/TODO.md` ("Design a new Raven capability-boundary diagnostic"), `.agents/rounds/2026-08-31-rejected-experiments-closeout.md`, `.agents/rounds/2026-08-29-five-track-same-100.md`.
- Problem: The block records what failed (the Raven trap failed T3; the external lookup control was partial; the inherited environment hash differed) and what must come next (a stronger mechanism, a new pre-registered diagnostic, independent review before a headline sample). It does not state the binding constraints in the queue. The environment identity pin (the five-name contract from the five-track ledger), the T3 trap-grading contract, the external-lookup control requirement, and the pre-registered product gate live only in the ledger chain.
- Consequence: The next plan author must reconstruct constraints from three ledgers. A constraint can be missed, and the same environment-hash defect can recur.
- Required repair: Add an explicit constraint list to the `TODO.md` item (see section 7).

**F4 — Severity: Low.** The `sls-080` status wording conflicts with the improvements lifecycle.
- Sources: `.agents/NEXT.md` line 15 ("`sls-080` is verified"), `.agents/TODO.md` ("a verified active Scout finding"), `improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md` (frontmatter `status: reported-upstream`; issue `Stellar-Light/stellarlight#1134` open).
- Problem: `verified` is a lifecycle state the finding has passed. Its current state is `reported-upstream`.
- Consequence: A new agent may read the status as `verified` and expect a filing action that already happened.
- Required repair: Say `reported-upstream` with the issue reference in both files.

**F5 — Severity: Low.** "`improvements/`: 69 active findings" is imprecise.
- Sources: `.agents/NEXT.md` line 13.
- Problem: This audit counted 69 finding files across five collections. Statuses are 60 `reported-upstream`, 3 `proposed`, 3 `declined-upstream`, and 3 `fixed-upstream`. Strictly, 63 are active; 6 are terminal. The index counts 69 total.
- Consequence: The queue mixes the index total with "active". A reader cannot derive the true active count.
- Required repair: State "69 findings (63 active; 3 declined-upstream, 3 fixed-upstream)" or re-run `npm run improvements:index` and quote its output with a date.

**F6 — Severity: Low.** The run-evals filing charter omits the fifth collection.
- Sources: `.agents/skills/run-evals/SKILL.md` Step 6 ("one file per finding in the matching collection (`lumenloop/`, `stellar-light-scout/`, `stellar-docs/`, `skills/`)"), `improvements/README.md` (documents `workers-ai-provider/`).
- Problem: `improvements/workers-ai-provider/` exists and holds active finding `wai-001`, but the skill's collection list has four names. `eval/EVALS.md` similarly names four upstream surfaces.
- Consequence: A round filing a workers-ai-provider finding follows the charter but contradicts the skill text.
- Required repair: Add `workers-ai-provider/` to the Step 6 collection list. This is a documentation repair only.

**F7 — Severity: Low.** No cadence exists for the free Horizon probe re-check.
- Sources: `.agents/NEXT.md` block 2, `.agents/TODO.md` recovery item.
- Problem: The probe gate (`28`) is checked only when an agent chooses. The daily drift refresh and the improvements rounds do not name this probe.
- Consequence: The freshness blocker can clear without anyone noticing, and the monitor drifts.
- Required repair: Attach the free probe re-check to the improvements round cadence in the queue item.

**F8 — Severity: Low.** A state line has no traceable reference.
- Sources: `.agents/NEXT.md` line 50 ("Focused verification passed 31 tests across four files on 2026-08-31").
- Problem: The line names no files, stamp, or commit.
- Consequence: A reader cannot verify the claim.
- Required repair: Cite the files and commit, or delete the line.

**F9 — Severity: Low.** T4's "unrelated" is undefined.
- Sources: `.agents/rounds/2026-09-01-protocol-history-attempt-three/brief-fable.md` section 16, `TODO.md` routing item.
- Problem: T4 requires "two unrelated live routing misses", and the monitor-only bars use "2+ unrelated cases". No rule defines unrelated.
- Consequence: Two cases sharing one cause could count as unrelated under a loose reading.
- Required repair: Add one sentence: cases are unrelated when their question families and primary services differ.

## 4. Human decisions

The queue lists two open product decisions. This audit adds one downstream spend decision for visibility.

**D1 — Choose the product-loss margin for the paired QA method.**
- Exact question: Which largest acceptable product loss does the owner accept for a paired non-inferiority `PASS`?
- Options: `0.05`, `0.08`, `0.10`, or another value with revalidation. The recorded trade-offs: at `0.05`, two-look no-change `PASS` is 25.963% and false `PASS` at a true 5-point loss is 0.051%; at `0.08`, 80.925% and 3.899%; at `0.10`, 95.657% and 18.357%.
- Evidence needed: product impact of a 5-point true loss; the mixed-tuple calibration label; the cost of a second collection (91.812%, 62.454%, 32.596% under no change). The margin must not be chosen from power alone.
- Safe default: no promotion. The method stays experimental `INDETERMINATE`-first, and the `0.08` default keeps its no-change-radius label.

**D2 — Decide whether protocol-history routing can reopen.**
- Exact question: Re-examine the frozen control set or the 19/19 positive bar (T2), or open a new box for a non-card evidence source (T3)?
- Options: T2 re-examines a frozen contract; T3 opens a new box and must pre-register the items in brief section 16.
- Evidence needed: the three verified `FAIL` records, the cost of the lane, and the value of `scout.searchResearch` reachability.
- Safe default: keep the block trigger-only. No agent may start either path alone.

**D3 — Authorize the recalibration pair collection (after D1).**
- Exact question: May the owner spend on one or two same-tuple same-100 collections to form the pinned recalibration pair?
- Options: authorize under the run-evals pre-spend review with an explicit `--max-budget-usd`; or defer promotion indefinitely.
- Evidence needed: observed same-100 costs (`$31.9693122` to `$45.711693` stored span; the `$0.244` panel-row figure) and the target tuple (answering model, judge model, rubric `v2.10`, pack, pinned register).
- Safe default: defer. No collection without its own reviewed brief and budget.

## 5. Evaluation ladder

Ordered stages for the remaining work. Each stage names its entry gate, instrument, exit gate, and authorization boundary. Prior method-specific authorizations are spent; every paid stage needs a fresh one.

1. **Free preflight.** Entry: any change or round. Instrument: `eval:selftest`, `eval:compile`, `eval:qa:compile`, `eval:qa:lint -- --stale`, `eval:routing -- --gate`. Exit: green. Authorization: none.
2. **Capability-boundary diagnostic plan (block 1).** Entry: none beyond the queue block. Instrument: a written plan plus one independent adversarial review that differs from the author and orchestrator. Exit: reconciled `PASS` review of the mechanism, diagnostic, and product gate. Authorization: none; no fetch, no run, no spend.
3. **Diagnostic measurement (only if the reviewed plan requires one).** Entry: reviewed plan. Instrument: the plan's diagnostic run. Exit: product-gate verdict recorded in a ledger. Authorization: one bounded budget via `--max-budget-usd`, after pre-spend brief review.
4. **Headline sample.** Entry: product gate `PASS` plus a separate, explicit spend authorization. Instrument: QA sample under the five-track contract. Exit: five-track artifact plus independent review and filed findings. Authorization: owner spend authorization; the environment identity must match the five-name pin.
5. **Owner margin decision (D1).** Entry: the decision table in `NEXT.md`. Instrument: a recorded owner answer. Exit: margin recorded in `NEXT.md` or `eval/qa/README.md`, then the question is deleted. Authorization: owner only.
6. **Paired recalibration (F2 item).** Entry: D1 decided (or run independently when a pair exists). Instrument: one or two same-tuple same-100 collections with a shared pinned stability register, then `eval:qa:paired:validate -- --recalibrate <baseline> <candidate>`. Exit: recalibrated tables. Authorization: separate per-collection budget, each with pre-spend review.
7. **Promotion decision.** Entry: recalibrated tables plus the margin. Instrument: `eval:qa:paired --json` recorded in a round ledger. Exit: promotion decision recorded per the one-headline rule. Authorization: owner decision plus independent review of any contract change.
8. **Monitor-only conversions.** Entry: a recorded threshold fires (two unrelated cases; a contract mismatch; trace evidence; three recurrences; probe `28`; a T1 hash change; a T4 transcript pair). Instrument: free probes, drift refresh, register refresh. Exit: the queue item closes, or a new reviewed plan opens. Authorization: none until the next paid or production action, which then needs its own review.

## 6. Block map

- **Actionable now.** Block 1's diagnostic design (free, ends at a reviewed plan). The documentation repairs in section 7. The reconciliation of this audit's findings into the round ledger.
- **Owner-blocked.** D1 margin. D2 T2/T3 routing reopen. The `sources.locate` phase-zero program, which reopens only through the measured trigger in `ideas/source-delivery-ranked-references.md` §8 and then needs its own owner answers.
- **Evidence-triggered.** Paid recovery work (probe `28`, then the selection trigger, then a separately reviewed plan). Routing T1 (two pinned hashes change) and T4 (two unrelated transcript-backed misses). Token-prefix action (a second unrelated case, or a re-vendor changes the rule). Friendbot action (two unrelated cases, a contract mismatch, or trace evidence). Stability-register refresh cadence.
- **Upstream-blocked.** `sls-080` (`Stellar-Light/stellarlight#1134`, open). `sd-047` (`stellar/stellar-docs#2805`, reported). The `sls-074` watch (`Stellar-Light/stellarlight#1031`, open; the maintainer owns the close; no reminders).
- **Complete.** Golden metadata remainder (PR #106, `0916e09`). Rejected-experiments closeout (PR #104). All three routing attempts. Paired-verdict implementation. The five-track same-100 collection and its review. The judge-stability question. The Playground limit and title cleanup (PR #99). The attempt-three closeout (PR #111).

## 7. Suggested `.agents/` edits

These edits remove ambiguity and prevent an invalid future run. They change planning records only.

1. `.agents/TODO.md`, "Monitor the rejected repository-tooling recovery experiment" — replace the "Done when" sentence with: "The freshness blocker clears when a free Horizon probe returns `28`; an improvements round then re-checks `sls-080` toward `fixed-upstream`. A paid recovery collection additionally needs the selection trigger (three recurring misses) and a separately reviewed plan with its own spend authorization. Done when: the sls-080 lifecycle close is recorded and no new evidenced trigger exists, or a new trigger opens a separately reviewed plan. A later Scout finding must use `sls-082`; `sls-081` is historical only."
2. `.agents/TODO.md`, new item under "Eval instruments" — "Recalibrate the paired verdict." Body: "Promotion of `qa-paired-ordinal-ni-v1` needs one same-tuple pinned pair and the owner margin decision. The pair is two complete comparable same-100 artifacts under one answering model, one judge model/rubric/pack tuple (target rubric `v2.10`), one shared pinned stability register, `qa-judge-case-v2` identity, 100 eligible IDs, and `meta.comparable: true`. Cross-rubric comparisons need a rejudge under the target tuple. Each collection needs its own pre-spend review and `--max-budget-usd`. Run `eval:qa:paired:validate -- --recalibrate` on the pair. Done when: the recalibrated tables and the promotion decision are recorded in a round ledger."
3. `.agents/TODO.md`, "Design a new Raven capability-boundary diagnostic" — append the constraint list: "The plan must pin the agent environment identity to the five-name contract from the 2026-08-29 five-track ledger. It must grade trap refusal through the T3 contract, not `judgeScore`. It must include the external-lookup control. It must pre-register its product gate. Its headline sample needs separate paid authorization."
4. `.agents/TODO.md`, recovery item — change "a verified active Scout finding" to "a `reported-upstream` active Scout finding (`Stellar-Light/stellarlight#1134`)".
5. `.agents/NEXT.md`, "State at handoff" — change "`sls-080` is verified." to "`sls-080` is `reported-upstream` (`Stellar-Light/stellarlight#1134`, open)."
6. `.agents/NEXT.md`, "State at handoff" — change "`improvements/`: 69 active findings." to "`improvements/`: 69 findings; 63 active; 3 `declined-upstream`; 3 `fixed-upstream`."
7. `.agents/NEXT.md`, line 50 — cite the four files and commit for the 31-test verification, or delete the line.
8. `.agents/TODO.md`, "Monitor vendor short-token prefix matching" — add one sentence to define unrelatedness for monitor bars: "Cases are unrelated when their question families and primary services differ."
9. `.agents/skills/run-evals/SKILL.md`, Step 6 — add `workers-ai-provider/` to the collection list. Documentation only.

## 8. Residual uncertainty

- The production Worker Version ID and deploy date in `NEXT.md` are Cloudflare state. The repository cannot verify them.
- The first same-100 result, the stability register, and the 57/100 figure are local-only (`eval/qa/results/` is gitignored). Only the dated ledgers ground them.
- The "31 tests across four files" claim has no reference in the queue (F8).
- Upstream issue states (`#1031`, `#1134`, `#2805`) rest on dated read-backs. Their current state is unknowable from committed evidence.
- Whether the owner will accept a margin outside `0.05`, `0.08`, or `0.10` is open; the queue shows only those three.
- The intent behind the "`sls-080` is verified" wording cannot be settled beyond the finding file's `reported-upstream` status.
- The vendor short-token prefix observation is single-source by design. This audit did not reproduce it; its monitor-only rule stands.
- This audit did not read other auditor reports, per the brief. The round ledger lists six reviews in progress; their reconciliation is outside this report.