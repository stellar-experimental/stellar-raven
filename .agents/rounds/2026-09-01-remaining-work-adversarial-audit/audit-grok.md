# Remaining-work adversarial audit — Grok

Date: 2026-09-01
Auditor: Grok 4.6 through OpenCode
Scope: read-only audit of `.agents/NEXT.md` and `.agents/TODO.md`

## 1. Runtime

| Field | Value |
| --- | --- |
| Model | Grok 4.6 |
| Model ID | `xai/grok-4.6` |
| Provider / CLI | OpenCode |
| Requested effort or variant | max |
| Observed effort or variant | This session had no separate max-effort control. The runtime was the OpenCode `xai/grok-4.6` session. |

This audit did not run a paid evaluation. It did not fetch live services. It did not edit production.

## 2. Verdict

`PASS-WITH-FIXES`

The queue names the open blocks. It keeps spent routing attempts closed. It keeps monitor-only items from becoming fixes.

A new agent still cannot run the next ranked block from these two files alone. The Raven diagnostic block lacks design constraints. Protocol-history triggers T1 and T4 lose load-bearing rules. Five-track `T4` and protocol-history `T1`–`T4` share names. The paired same-tuple pair is mixed into an owner product question.

Repair those items before the next plan. Do not start a paid run, a fourth routing attempt, or a recovery collection from this queue.

## 3. Findings

### H1 — Raven diagnostic block lacks design constraints

Severity: High
Sources: `.agents/NEXT.md` ranked block 1; `.agents/TODO.md` “Design a new Raven capability-boundary diagnostic”; `.agents/rounds/2026-08-31-rejected-experiments-closeout.md`; `.agents/skills/run-evals/SKILL.md` prose-surface check and five-track T3.

Exact problem: The next ranked work is a new Raven capability-boundary diagnostic. The queue says the prompt change is rejected. It says Method 1 failed its product gate. It says the environment hash differed. It says Method 2 has no authorization. It asks for a stronger mechanism and a new pre-registered diagnostic. It requires independent review before a headline sample.

The queue does not name the failed trap id. It does not define five-track T3 here. It does not state the product gate. It does not forbid a second prompt-only change. It does not bind the `run-evals` rule that prefers a fail-loud mechanism over more words. It does not pin the environment-hash requirement. It does not separate Friendbot from this block as a forbidden evidence source.

Consequence: The next author can repeat the rejected prompt change. The author can treat Friendbot as support. The author can skip the focused diagnostic and request a headline sample.

Required repair: Add a constraint list to the TODO item and to NEXT block 1. Name forbidden actions, the product-gate class, and the evidence that must exist before any ship.

### H2 — Protocol-history triggers T1 and T4 are condensed until they authorize the wrong next step

Severity: High
Sources: `.agents/TODO.md` routing item; `.agents/NEXT.md` ranked block 3; `.agents/rounds/2026-09-01-protocol-history-attempt-three/brief-fable.md` section 16.

Exact problem: Brief section 16 is the trigger authority. The queue points at it, then restates T1–T4 in shorter form.

T1 in the brief needs two hashes to change together. Those hashes are `inventory/stellar-light.json` `1a261c4a…8671b0` and the `x-routing` object `468a9d98…ba716b`. The action is `npm run eval:protocol-history` on the rebuilt catalog. Cache-based readings then close.

The queue says only “an upstream card change” or “an upstream `x-routing` change”. That drops the dual-hash rule and the free remeasure.

T4 in the brief is two unrelated live misses with transcripts. Its action is a TODO note and a token audit. Then a T2 or T3 decision. T4 does not open a mechanism brief.

The queue says “A trigger authorizes a brief only” for T1–T4 as a set. That promotes T4 to the same class as T1–T3.

The TODO “Done when” line still asks for a routing-eval capture of `scout.searchResearch`. That is the long-term product goal. It is not the next permitted action.

Consequence: A drift event can skip the free protocol-history remeasure. Two live misses can start a fourth-attempt brief. An agent can treat “Done when” as permission to edit ranking now.

Required repair: Copy the section 16 action for each trigger into TODO and NEXT. Change “Done when” so a trigger, a reviewed brief, and a later measured general fix are all required. Keep “Do not start a fourth attempt.”

### H3 — Five-track T4 and protocol-history T1–T4 share names

Severity: High
Sources: `.agents/NEXT.md` state-at-handoff and ranked blocks 1 and 3; `eval/qa/README.md` paired section; `.agents/skills/run-evals/SKILL.md` five-track contract; brief-fable.md section 16.

Exact problem: NEXT reports a five-track `T4` exclusion that leaves 99 paired-eligible ids. The same file then says reopen protocol-history through triggers T1 to T4. TODO uses T3 for the Raven trap failure. Brief section 16 uses T3 for a new non-card box.

Consequence: A new agent can mix a judge-health exclusion, a safety fail, and a routing reopen trigger.

Required repair: Qualify every T-code on first use. Use `five-track T4`, `five-track T3`, and `protocol-history T1–T4`.

### M1 — `sls-080` status is stated as `verified`

Severity: Medium
Sources: `.agents/NEXT.md` lines 14 and 79; `.agents/TODO.md` line 30; `improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md`; `improvements/INDEX.md`.

Exact problem: The finding file and the index mark `sls-080` as `reported-upstream`. The upstream issue is Stellar-Light/stellarlight#1134. NEXT says “`sls-080` is verified.” TODO says “verified active Scout finding.”

Consequence: An improvements round can re-file the issue. A recovery lane can skip the maintainer-owned close.

Required repair: Write `sls-080` as `reported-upstream` and still active. Keep the free Horizon probe at `25` as the paid-collection gate.

### M2 — Same-tuple pinned pair is mixed into the owner margin question

Severity: Medium
Sources: `.agents/NEXT.md` owner decision 1; `eval/qa/README.md` paired section; `.agents/rounds/2026-08-29-paired-verdict.md`; `.agents/rounds/2026-08-29-five-track-same-100.md`; `.agents/rounds/2026-08-31-eval-routing-next/eval-analysis-terra.md`.

Exact problem: Promotion needs two distinct things. The owner must choose a product-loss margin from product impact. Recalibration needs one same-tuple pinned pair.

The current same-100 artifact is local at `2026-08-30T03-43-11-variantA.json`. It used rubric `v2.9`. Five-track T4 excluded `q-eco-stellar-wallets-list`. Eligible n is 99, so the 100-id method is `INDETERMINATE`. Current rubric is `v2.10`. Cross-rubric comparison needs a rejudge under the target tuple.

NEXT places the pair requirement inside the margin question. TODO has no paired-method item. The queue does not forbid a new same-100 collection before a product candidate exists. Terra already recorded that another same-100 spend is not justified now.

Consequence: An agent can request two paid same-100 collections to “unlock promotion”. That spend does not answer an approved product question.

Required repair: Split the owner margin decision from the pair evidence trigger. State that no same-100 collection is authorized until a merged product candidate needs a paired look.

### M3 — `sources.locate` lives only in NEXT

Severity: Medium
Sources: `.agents/NEXT.md` ranked block 2; `.agents/TODO.md`; `.agents/README.md`; `ideas/source-delivery-ranked-references.md` sections 8 and 9.

Exact problem: README says TODO holds the work queue. NEXT only ranks and sequences. `sources.locate` is deferred behind the section 8 trigger. That trigger is not a TODO item.

Consequence: An agent that reads only TODO can miss the deferral and reopen the spike.

Required repair: Add a TODO monitor item. Point at `ideas/source-delivery-ranked-references.md` §8. State that section 8 questions are not current owner questions.

### M4 — Vendor short-token monitor is missing from NEXT

Severity: Medium
Sources: `.agents/TODO.md` “Monitor vendor short-token prefix matching”; `.agents/NEXT.md` ranked blocks.

Exact problem: TODO records the single-source prefix observation. NEXT ranked blocks do not mention it.

Consequence: A ranking of “start block 1” can hide this monitor. An agent can edit the vendor scorer from one audit.

Required repair: Add one monitor line under NEXT block 1 or block 3. Keep the “do not edit the vendor file” rule.

### M5 — The first five-track same-100 checkpoint is absent from `eval/qa/README.md`

Severity: Medium
Sources: `.agents/NEXT.md` state-at-handoff; `.agents/rounds/2026-08-29-five-track-same-100.md`; `eval/qa/README.md` “2026-08-28 same-100 rerun” and “Current baseline of record”; `eval/EVALS.md` rule 7; `.agents/skills/run-evals/SKILL.md` step 7.

Exact problem: The committed QA record still treats 2026-08-28 as the latest same-100 checkpoint. That run used rubric `v2.8` and had no stability register. The first `qa-five-track-v1` same-100 result is local-only. NEXT records it. The README current-results path does not.

Consequence: A later round can treat the `v2.8` checkpoint as current. That mixes tuples.

Required repair: Add a README checkpoint section for stamp `2026-08-30T03-43-11-variantA.json`. Keep it as a checkpoint, not a re-baseline. Keep the JSON gitignored.

### M6 — NEXT block 1 mixes completed contracts with open design work

Severity: Medium
Sources: `.agents/NEXT.md` ranked block 1; `.agents/TODO.md` eval-instruments section.

Exact problem: Ranked block 1 is the Raven diagnostic. The same block then says five-track, paired verdict, judge `v2.10`, and golden lifecycle are implemented.

Consequence: A new agent can reopen those contracts as live work.

Required repair: Move the implemented-contract sentence into “State at handoff” or “Completed blocks”.

### M7 — Protocol-history T3 loses the pre-registration list

Severity: Medium
Sources: `.agents/TODO.md`; `.agents/NEXT.md` owner decision 2; brief-fable.md section 16.

Exact problem: NEXT and TODO say T3 is an owner decision for a new non-card box. They drop the required sample rule, endpoints, byte budget, flood metrics, leakage test, and 76-case inventory.

Consequence: An owner “yes” can launch a thin T3 brief that skips the fetch gate.

Required repair: In the owner-decision section, name the section 16 pre-registration list as mandatory after any T3 yes.

### M8 — The free Horizon probe has no cadence

Severity: Medium
Sources: `.agents/NEXT.md` ranked block 2; `.agents/TODO.md` repository-recovery item; `improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md`.

Exact problem: Paid recovery stays blocked until the free probe returns `28`. The last recorded probe is `2026-08-31T01:42:10.098Z` with scanned ref `82660510ecda7fd365a14d08badb9d85fa22bc32`. The queue does not say who reruns the free probe or when.

Consequence: The block can stall with no owner. Or an agent can run paid recovery after an unrecorded probe.

Required repair: State that the next improvements or drift round may rerun the free probe. Record the new timestamp. Keep paid collection forbidden until the recorded value is `28`.

### M9 — “Unrelated” and “three recurrences” are not measurable as written

Severity: Medium
Sources: `.agents/TODO.md` recovery and protocol-history T4; `.agents/NEXT.md` block 2; brief-fable.md T4.

Exact problem: Recovery uses “three recurring misses” and “three recurrences” for the docs-versus-repository conflict. Protocol-history T4 uses “two unrelated” cases and “the same” miss. The queue does not define unrelated, recurrence, or same.

Consequence: A later lane can move the goal after seeing new misses.

Required repair: Define unrelated as distinct case ids, distinct fact classes, and distinct transcripts. Define a recurrence as a dated live re-execution of the same finding id.

### L1 — Rejected-experiments closeout still says judge stability is open

Severity: Low
Sources: `.agents/rounds/2026-08-31-rejected-experiments-closeout.md` line 71; `.agents/NEXT.md` lines 28–29.

Exact problem: The 2026-08-31 closeout says judge stability remains open. NEXT and the 2026-08-31 routing closeout say that TODO is closed at 57.

Consequence: An agent that reads the older closeout can reopen a closed item.

Required repair: Do not copy that sentence into the queue. Optionally add one line in NEXT: the 2026-08-31 rejected-experiments closeout is stale on judge stability.

### L2 — EVALS still says the battery is 499 cases

Severity: Low
Sources: `eval/EVALS.md`; brief-fable.md section 2; `.agents/skills/run-evals/SKILL.md`.

Exact problem: EVALS and `run-evals` still say 499 cases as of 2026-08-19. The attempt-three brief counts 500 battery JSON files.

Consequence: Denominator talk can drift. This is not an `.agents/` defect.

Required repair: Out of scope for this queue edit. Note it when the next eval README pass runs.

## 4. Human decisions

### D1 — Choose a product-loss margin for paired QA

Exact question: What largest product loss is acceptable for `qa-paired-ordinal-ni-v1`?

Options:

| Option | Meaning |
| --- | --- |
| 0.05 | Tight. Two-look no-change `PASS` is 25.963%. False `PASS` at a 5-point loss is 0.051%. |
| 0.08 | Current no-change radius. Two-look no-change `PASS` is 80.925%. False `PASS` at a 5-point loss is 3.899%. |
| 0.10 | Loose. Two-look no-change `PASS` is 95.657%. False `PASS` at a 5-point loss is 18.357%. |
| Decline now | Keep `0.08` as `NO_CHANGE_CONFIDENCE_RADIUS`. Do not promote the method. |

Evidence needed: Product impact of a true 5-point, 8-point, and 12-point loss. One same-tuple pinned pair under `claude-sonnet-5` / `v2.10` / `p5` after a product candidate exists. Do not use the mixed-tuple 2026-08-27 and 2026-08-28 rates as operating noise.

Safe default: Decline now. Keep the experimental no-change label. Do not promote. Do not collect a pair only to fill this table.

### D2 — Keep or change the frozen protocol-history contract (protocol-history T2)

Exact question: Should the frozen control set or the 19/19 positive bar change?

Options: Keep both frozen. Change the control set. Lower or replace the 19/19 bar. Record the choice in `.agents/NEXT.md`.

Evidence needed: A written product reason. A new brief that states the changed acceptance table first. A ledger reference. Independent review before any run.

Safe default: Keep both frozen. Three measured `FAIL` results do not weaken the contract.

### D3 — Open a non-card evidence box (protocol-history T3)

Exact question: May a new box use corpus-derived route vocabulary from `scout.searchResearch`?

Options: No. Yes, after the section 16 pre-registration list and a passing independent review. Yes for a named other non-card source only.

Evidence needed: Owner yes in NEXT. Sample rule, endpoints, request count, byte budget, flood metrics, leakage test, and the same acceptance table. Review must pass before any fetch.

Safe default: No. T3 is not a fourth attempt in the spent card box. Do not start it from ranking pain alone.

### D4 — Authorize any paid QA, rejudge, or recovery collection

Exact question: May the next lane spend?

Options: No spend. One non-identical `v2.10` rejudge of `q-eco-stellar-wallets-list` as judge-contract evidence only. A reviewed Raven diagnostic after the plan passes. A same-100 pair after a product candidate exists. A recovery collection after the free probe returns `28`.

Evidence needed: A pre-spend brief, independent review, pins, and a one-method budget cap. Prior method authorizations are spent.

Safe default: No spend. The cheapest next step is a free Raven diagnostic plan.

## 5. Evaluation ladder

Use this order. Do not skip a gate. Do not spend from a lower stage.

| Stage | Entry gate | Instrument | Exit gate | Authorization boundary |
| --- | --- | --- | --- | --- |
| 0. Queue repair | This audit’s High and Medium repairs land | Documentation only | NEXT and TODO state constraints, triggers, and forbids | No eval. No production edit. |
| 1. Raven diagnostic plan | Stage 0 done | Free design under `run-evals` | Independently reviewed plan names mechanism, diagnostic ids, product gate, and forbids | No fetch. No paid call. No prompt ship. |
| 2. Focused Raven diagnostic | Stage 1 `PASS` | Pre-registered small instrument, not sample-30, not same-100 | Product gate on five-track T3 safety and the named control. Environment hash matches the registered value | Separate one-method spend cap. Method 2 from PR #103 stays unauthorized. Friendbot stays out. |
| 3. Headline sample | Stage 2 product gate pass | QA headline under the one-headline two-gate contract | Reviewed verdict. Findings filed or an explicit none-new note | New pre-spend review and a new cap. Never reuse stage 2 authorization. |
| 4. Protocol-history T1 only | Dual hash change on inventory and `x-routing` | `npm run eval:protocol-history` | Both frozen contract counts recorded. Cache readings closed if the clause artifact mismatches | Free. No new mechanism. No production ranking edit. |
| 5. Protocol-history T2 or T3 brief | Owner decision in NEXT | New brief with the section 16 list | Independent review `PASS` | Brief only. No fetch, run, or paid lane until a later authorization. |
| 6. Recovery probe | Next improvements or drift round | Free Horizon `explainRepo` probe | Recorded value `28` or still `25` | Paid recovery stays forbidden while the recorded value is `25`. |
| 7. Paired promotion | Owner margin from D1 and a product candidate | Two complete same-100 arms under one `v2.10` tuple and one pinned register | Eligible n is 100 after five-track T4/T5 union exclusion. Recalibration runs. Owner margin is set | Not a ship gate until those exist. Do not use mixed-tuple tables as operating noise. |
| 8. `sources.locate` phase zero | Section 8 incident rule fires | Phase-zero study in the idea note | Owner answers the twelve questions after the trigger | No implementation from evaluation-only evidence. |

Keep routing `--gate` on every scoring or catalog change. Keep sample-30 as the headline. Do not promote paired QA, protocol-history, or five-track views into gates without a recorded decision.

## 6. Block map

### Actionable now

- Repair the queue text in H1–H3 and M1–M9.
- Author the Raven diagnostic plan after those repairs. Skill: `run-evals`.
- Independent review of that plan. Reviewer must differ from the author and the orchestrator.

### Owner-blocked

- D1 product-loss margin.
- D2 protocol-history contract.
- D3 new non-card box.
- D4 any paid method.

### Evidence-triggered

- Protocol-history T1: dual hash change, then free `eval:protocol-history`.
- Protocol-history T4: two unrelated live misses with transcripts, then a TODO note and a token audit, then D2 or D3.
- Friendbot: two unrelated cases, a contract mismatch, or trace evidence that the prompt asked the wrong behavior.
- Vendor short-token: a second unrelated coverage-inflation case, or a re-vendor.
- Repository recovery paid collection: free probe returns `28`, or a new evidenced trigger plus a reviewed plan.
- Recovery ranking selection: three recurring misses, as defined after M9.
- Docs-versus-repository conflict: three recurrences.
- `sources.locate`: section 8 incident rule.
- G1: pre-registered v3 candidate only.

### Upstream-blocked

- `sls-080` / Stellar-Light/stellarlight#1134. Maintainer owns the close. Paid recovery waits on probe `28`.
- Stellar-Light/stellarlight#1031. Quiet watch. Next improvements round records state. No reminder post.
- `sd-047` at stellar/stellar-docs#2805. Reported-upstream. Not own-repo work.

### Complete

- Golden metadata remainder. PR #106 as `0916e09`.
- Playground 8,000-character limit. PR #99 as `3c7f0e5`.
- Judge-stability TODO. Closed as stable at 57. The register still mixes collection and rejudge movement.
- `qa-five-track-v1`, paired method, judge `v2.10`, and golden lifecycle contracts. Implemented. Not ship gates.
- Protocol-history attempts one, two, and three. Three verified `FAIL` results. Box spent. Defect remains trigger-only.
- Repository-tooling recovery v2 and the Raven prompt change. Closed without merge. Implementations do not ship.
- 2026-08-28 human-review grill. Twenty-one questions resolved.

## 7. Suggested `.agents/` edits

### `.agents/TODO.md` — Eval instruments, Raven diagnostic

Replace the current item body with this substance:

The rejected QA prompt change does not ship. Record: `.agents/rounds/2026-08-31-rejected-experiments-closeout.md`. Method 1 failed five-track T3 on the Raven trap. The external lookup control was partial. The inherited environment hash differed. Method 2 did not run and stays unauthorized.

The next plan must define a stronger mechanism than prompt text. Follow the `run-evals` prose-surface rule. Prefer a fail-loud guard, an exact-match error, or a schema change. Do not add wording in a second surface.

The plan must name the diagnostic ids, the five-track T3 product gate, the control case, and the environment-hash pin. Independent review must pass before any diagnostic spend. The diagnostic is not a headline sample. A headline sample needs a later authorization.

Forbidden: ship the rejected prompt. Run Method 2. Infer a repair from Friendbot. Start a sample-30 or same-100 from this item.

Done when: the reviewed plan exists. Measurement is a later item.

### `.agents/TODO.md` — Protocol-history routing

Keep the three spent stamps. Replace the trigger paragraph and the Done-when line with this substance:

Reopen only through brief-fable.md section 16.

Protocol-history T1: both pinned hashes change together. Then run `npm run eval:protocol-history`. Do not start a new mechanism.

Protocol-history T2: owner decision in NEXT about the control set or the 19/19 bar. Then a brief that states the new acceptance table first.

Protocol-history T3: owner decision to open a new non-card box. The brief must carry the section 16 pre-registration list. Review must pass before any fetch.

Protocol-history T4: two unrelated live misses with transcripts. Action is a TODO note and a token audit. Then T2 or T3. T4 does not authorize a mechanism brief.

A trigger does not authorize a fetch, a run, a production edit, or a paid lane. Do not start a fourth attempt in the spent box.

Done when: a section 16 trigger fires, a reviewed brief passes, a later authorization runs, and the routing eval shows a general `scout.searchResearch` capture. A fix that only helps `q-protocol-24-whisk-incident` stays unshipped.

### `.agents/TODO.md` — Add deferred `sources.locate`

Add a monitor item under repository recovery or a new deferred section.

Substance: `sources.locate` stays deferred. Reopen only through `ideas/source-delivery-ranked-references.md` §8. The twelve §8 questions are not current owner questions. No phase-zero spike is approved. Done when: the §8 trigger fires and the owner reopens the study.

### `.agents/TODO.md` — Recovery probe cadence

Add: the next improvements or drift round may rerun the free Horizon probe. Record timestamp, scanned ref, and value. Paid collection stays forbidden until a recorded probe returns `28`.

### `.agents/TODO.md` — `sls-080` wording

Replace “verified active” with “`reported-upstream` and still active at Stellar-Light/stellarlight#1134”.

### `.agents/NEXT.md` — State at handoff

Keep the spent-box bullets. Change “`sls-080` is verified” to “`sls-080` is `reported-upstream` and still active”.

Add: the 2026-08-31 rejected-experiments closeout is stale on judge stability.

Add: `eval/qa/README.md` still lacks the 2026-08-30 five-track checkpoint. That is documentation debt, not a paid rerun.

Move the implemented five-track, paired, `v2.10`, and lifecycle sentence here.

Qualify the T4 exception as five-track T4.

### `.agents/NEXT.md` — Ranked block 1

Keep the Raven diagnostic as the only open work in this block.

Add the H1 constraint list. Name Friendbot as monitor-only and out of this design.

Add the vendor short-token monitor as monitor-only. Do not edit the vendor file.

Remove the implemented-contract sentence from this block.

### `.agents/NEXT.md` — Ranked block 2

Keep recovery monitor-only until a recorded probe returns `28`.

Keep `sources.locate` deferred behind §8.

Add the free-probe cadence sentence.

### `.agents/NEXT.md` — Ranked block 3

Replace the T1–T4 short list with the section 16 actions. Use the protocol-history T-prefix.

State that protocol-history T4 does not authorize a brief.

### `.agents/NEXT.md` — Owner decisions

Keep D1 as product impact only. Remove the same-tuple pair sentence from that table block.

Add a separate evidence-trigger note: a same-tuple pair is required before promotion. It is not authorized now. Do not collect it until a merged product candidate needs a paired look.

Keep D2 and D3. Add the T3 pre-registration list as mandatory after a yes.

### `.agents/NEXT.md` — Suggested sequence

Start with the queue repairs. Then the Raven diagnostic plan. Keep block 2 monitor-only. Keep protocol-history trigger-only. Resolve D1–D3 when ready. Do not spend.

## 8. Residual uncertainty

These facts cannot be settled from the required sources.

- Whether production Worker Version ID `6282fe2a-54d8-471e-9f0a-0a2565110af1` is still current on 2026-09-01. This audit did not query Cloudflare.
- Whether the free Horizon probe still returns `25` after 2026-08-31T01:42:10.098Z. This audit did not probe.
- Whether Stellar-Light/stellarlight#1134 or #1031 changed after the last recorded GitHub read.
- The true same-tuple discordance rate under `v2.10`. The 10% and 8% inputs are mixed-tuple upper bounds.
- Whether rubric `v2.10` clears the `partial-without-issue` vote on `q-eco-stellar-wallets-list`. That row is untested under `v2.10`.
- Whether the local five-track artifact still hashes to `211577ce0dcb7c994dcc1bbec0be7cc0fca534c6638be261420d21a761502387`. The file is gitignored. This audit did not read it.
- The owner’s actual product-loss tolerance. No owner answer exists.
- Whether a later non-card source other than `scout.searchResearch` corpus expansion should exist. T3 leaves that to a named brief.
- Whether 500 battery files versus the EVALS 499 figure is a real case addition or a counting rule difference.
- Whether any live protocol-history miss already exists outside the frozen contracts. T4 needs two transcripts that this audit did not search.

Judge verdicts in the required ledgers were treated as evidence, not truth.
