# Remaining-work adversarial audit — GLM 5.3

Date: 2026-09-01
Auditor runtime: GLM 5.3 through OpenCode, requested variant max
Brief: `brief.md` in this directory
Evidence read: every file in the brief's required list, plus targeted repository inspection.

## 1. Runtime

- Model: GLM 5.3 (`z-ai/glm-5.3`).
- Provider and CLI: OpenRouter through OpenCode.
- Requested effort or variant: max.
- Observed effort or variant: not observable from inside the session. The session carried the requested variant. No runtime receipt proves the served variant.

## 2. Verdict

`PASS-WITH-FIXES`

The queue ranks the remaining work correctly. It keeps spent work closed. It separates owner decisions from evidence triggers. It states most completion gates and authorization boundaries. Two medium defects need repair before the next block starts. Both repairs are documentation edits. No finding in this report authorizes code work, a paid run, a fetch, a production change, or a contract change.

## 3. Findings

Severity ladder used here: Medium, Low, Info. No High finding exists.

### F1 — Medium — the capability-boundary block under-specifies the next plan

Paths: `.agents/TODO.md` item "Design a new Raven capability-boundary diagnostic"; `.agents/NEXT.md` ranked block 1; `.agents/rounds/2026-08-31-eval-routing-next/plan-fable.md` section 3.3; git history of `.agents/TODO.md` at commit `b53f62d`.

Problem: the queue keeps the meta-work but drops four inputs the next plan needs.

1. The two concrete defects are gone. A deleted TODO item, "Harden the QA answering prompt for two `cant-do` boundaries", defined them. Case `q-n3-missing-funds-account-support`: the agent offered a Raven lookup for a G-address or a transaction hash. Raven has no account-scoped lookup. The answer must redirect to a wallet, exchange, anchor, or explorer. Case `q-edge-send-me-free-xlm`: the prompt called Friendbot Testnet-only. The correct scope is Testnet, Futurenet, and local Quickstart. Mainnet has no Friendbot. The rejected PR #103 was the fix attempt for both defects. The queue records the rejection but not the defects.
2. The recorded mechanism constraint is gone. The 2026-08-31 plan states the trigger as "a mechanism proposal that is not prose, plus a free offline diagnostic".
3. "Stronger mechanism" has no definition. The queue does not say which surfaces are eligible. A prose-only retry is not excluded by the queue text.
4. The completion gate is self-referential. The item requires the plan to pass "its stated product gate". No gate exists yet. The queue does not list what the gate must cover.

Consequence: the next planner must reconstruct the problem statement from dated ledgers and git history. The brief exists to prevent that reconstruction. The main risk is a second rejected prose attempt. That would spend a paid diagnostic on a known-failed class.

Repair: edits E1 and E2 in section 7.

### F2 — Medium — "Method 2" is undefined and collides with a completed method of the same name

Paths: `.agents/TODO.md` lines 116-118; `.agents/NEXT.md` line 63; `.agents/rounds/2026-08-29-five-track-same-100.md` sections "Final outcome" and "Method 2".

Problem: the queue says "Method 2 did not run. This result does not authorize Method 2." No committed file defines the capability-boundary "Method 2". The only defined "Method 2" is the five-track same-100 collection. That method ran on 2026-08-30 under a `$50` authorization and spent `$40.9579502`.

Consequence: the queue states the opposite of the five-track record. A new agent that greps "Method 2" finds a method that ran with authorization. The agent cannot tell which authorization is spent. A wrong authorization inference may follow.

Repair: edit E1 item d. Qualify every use as "the capability-boundary Method 2". State that the five-track "Method 2" is a different, completed method.

### F3 — Medium — `sls-080` status is stale in both queue files, and the watch omits its upstream issue

Paths: `.agents/NEXT.md` lines 12-16 and 79-81; `.agents/TODO.md` lines 30-33; `improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md`; `.agents/rounds/2026-08-31-rejected-experiments-closeout.md`.

Problem: `NEXT.md` says "`sls-080` is verified." `TODO.md` says "`sls-080` is a verified active Scout finding." The finding file records `status: reported-upstream`. The finding was filed at Stellar-Light/stellarlight#1134. GitHub read the issue back OPEN on 2026-08-31, `createdAt: 2026-08-31T02:49:22Z`. The 2026-08-31 closeout already recorded the filing. The 2026-09-01 queue update wrote the older status back. The queue watch list covers stellarlight#1031 and stellar-docs#2805 but not #1134.

Consequence: a future improvements round may misreport the state. An agent may file a duplicate upstream issue. The maintainer close on #1134 goes unwatched.

Repair: edit E3.

### F4 — Low — the paired owner decision omits four decision inputs

Paths: `.agents/NEXT.md` "Owner decisions" → "Choose a product-loss margin for the paired QA method"; `.agents/rounds/2026-08-29-paired-verdict.md`; `.agents/rounds/2026-08-31-eval-routing-next/plan-fable.md` section 3.4; `eval/qa/README.md` "Paired `PASS` / `FAIL` / `INDETERMINATE` verdict".

Problem: the decision object and the trade-off table are correct. The table carries the mixed-tuple label. The guidance "choose from product impact, not power" is correct. Four inputs are missing.

1. The margin binds each component separately. Both lower bounds must clear it.
2. The point scale is undefined for the owner. One point is one percentage point of `P(correct)` or `P(correct or partial)` over the 100 eligible same-100 IDs.
3. The cost is absent. A same-tuple pinned pair costs about `$82`. The stored range is `$64` to `$92`. One `$50`-capped collection per arm is the right cap shape.
4. The recorded collection trigger is absent. The 2026-08-31 plan says: collect the pair only when a merged product candidate needs a paired look and the margin is recorded. Do not spend on calibration alone.

Consequence: the owner may choose from the table alone, without the cost or the scale. An agent may propose a calibration pair with no product candidate. That spend would have no decision use.

Repair: edit E4. Safe default: no decision means no promotion. The method stays experimental and `INDETERMINATE`-first.

### F5 — Low — a deferred optional rejudge is unqueued

Paths: `.agents/rounds/2026-08-31-eval-routing-next/plan-fable.md` section 3.3; `eval/qa/README.md` "Judge-tier contract".

Problem: the 2026-08-31 plan deferred the optional one-row rejudge of `q-eco-stellar-wallets-list` under rubric `v2.10`. That row produced the T4 `partial-without-issue` contradiction. The plan wrote "stays out of this round". No queue item carries it. No trigger or explicit drop exists.

Consequence: the `v2.10` contract fix has no planned check on the exact row that failed. Small evaluation debt may be lost silently.

Repair: edit E5. Record the rejudge with a trigger and a small cap, or record its explicit drop.

### F6 — Low — the trigger text has two wording defects

Paths: `.agents/rounds/2026-09-01-protocol-history-attempt-three/brief-fable.md` section 16; `.agents/TODO.md` lines 83-88; `.agents/NEXT.md` lines 102-105.

Problem: two defects.

1. T1's action says "the drift lane runs `npm run eval:protocol-history`". The closing rule says a trigger "does not authorize a fetch, a run, a production edit, or a paid lane". The intended reading is that the standing drift lane records the counts under its own authorization. The text does not separate the two authorizations.
2. T4 requires "two or more unrelated" live misses. "Unrelated" has no definition. A reader can stretch it after the fact.

Consequence: an agent may claim a trigger authorizes a measurement run. The "unrelated" test can be argued post hoc.

Repair: edit E6. State that the standing drift lane records T1 counts under its own authorization. Define "unrelated" as cases from different question families with no shared question text.

### F7 — Info — two presentation defects

Paths: `.agents/NEXT.md` line 12; `improvements/INDEX.md`; `.agents/NEXT.md` "Completed blocks".

Problem: two items.

1. "`69 active findings`" counts every file in `improvements/`. Three are `fixed-upstream` deletion candidates. Three are `declined-upstream`. The generated index total is 69, so the number is right. The word "active" reads loosely.
2. The completed golden block carries a standing rule: "Record the affected case-id list in the round ledger". A completed block is the wrong home for standing guidance. The `golden-truth` skill is the right home.

Consequence: minor. A reader may count fixed findings as open work. A future golden round may miss the rule.

Repair: edit E7.

## 4. Human decisions

### D1 — the paired product-loss margin (open)

Exact question: "What is the largest true loss you accept and still call a release unchanged? One point is one percentage point of `P(correct)` or `P(correct or partial)` over the 100 eligible same-100 IDs. The margin binds each component separately."

Options: `0.05`, `0.08`, `0.10`, or another value. The `0.08` default is the no-change confidence radius only. It is not a product tolerance.

Evidence needed: the product impact of a 5-point and an 8-point loss; the mixed-tuple operating table in `NEXT.md`; the false-`PASS` column (0.051%, 3.899%, 18.357% at a true 5-point loss); the pair cost (about `$82`; stored range `$64`–`$92`).

Safe default: make no decision. The method stays experimental and `INDETERMINATE`-first. Promotion stays blocked. No spend follows from the default.

### D2 — protocol-history T2 (open)

Exact question: "Should the frozen control set or the 19/19 positive bar change?"

Options: keep the frozen contract; relax the control set; relax the 19/19 positive bar; relax both.

Evidence needed: the three verified `FAIL` readings; the attempt-three control-capture growth (`2/4` original, `7/9` blind); the holdout at 19 forbidden captures; the identity reading's zero changed rankings.

Safe default: keep the contract frozen. The box stays closed. A trigger still authorizes a brief only.

### D3 — protocol-history T3 (open)

Exact question: "Should a new box open for a non-card evidence source for `scout.searchResearch` routing?"

Options: open the box with a named source; keep the box closed.

Evidence needed: the named source; its coverage of the catalog-absent tokens (`rushed`, `whisk`, `eviction`, `matter`, `emergency`, `cut`, `cleaned`, `stroop`, `repair`); the T3 pre-registration list in brief section 16.

Safe default: keep the box closed. The strict audit shows the target lacks lexical overlap with the miss tokens. No reachable general fix is evidenced.

### D4 — spend gates (standing; not a decision today)

Any paid diagnostic, headline sample, or paired collection needs an owner cap. Prior method authorizations are spent. The `$3` and `$50` five-track caps, the `$0.4597096` Method 1 spend, and the `$4.5646914` recovery spend do not transfer. Each new method needs its own bounded authorization before launch.

## 5. Evaluation ladder

Ordered stages for the next work block. Every stage carries its authorization boundary.

| Stage | Work | Entry gate | Instrument | Exit gate | Authorization |
| --- | --- | --- | --- | --- | --- |
| 0 | Queue repair | none | file edits under `.agents/` | queue statements match the finding files and ledgers | none |
| 1 | Capability-boundary diagnostic plan | stage 0 done | plan in a round ledger | independent review `PASS`; every finding reconciled | none; no paid call, no fetch |
| 2 | Focused diagnostic | stage 1 `PASS` | QA smoke with traps and an external lookup control, per `run-evals` | the pre-stated product gate passes; identity checks pass; T3 trap behavior passes | owner cap for this method only; one run; a re-run needs a new bounded authorization |
| 3 | Headline sample | stage 2 product-gate pass | QA sample per `run-evals` | stamped artifact; every row reviewed; findings filed | separate owner cap; pre-spend plan review first |
| 4 | Ship decision | stage 3 read | prose-surface check; routing gates on any catalog or manifest text change | measured before/after delta recorded; ship or revert | none paid |

Stage-1 plan requirements, from the recorded evidence: restate the two boundary defects (F1 item 1); select a mechanism that is not prose alone; define a free offline diagnostic; pre-state the product gate; pin the agent-environment identity with the free check recorded in the five-track ledger.

Standing free monitors, outside the ladder:

- Free Horizon probe. Date-stamp every result. Do not run a paid recovery collection while it returns below `28`.
- Improvements and drift rounds record the states of stellarlight#1031, stellar-docs#2805, and stellarlight#1134.
- Register refresh after each collection. Read it with the recorded caveat: it combines collection and rejudge movement.
- Token reachability audit on each new routing miss.

Paired promotion, owner-gated: record the margin (D1); collect one same-tuple pinned pair only when a merged product candidate needs a paired look; run `npm run eval:qa:paired:validate -- --recalibrate <baseline.json> <candidate.json>`; promote by a decision recorded in the round ledger. The paired verdict stays off the gate list until then.

Protocol-history routing, trigger-only: T1 through T4 in brief section 16. A trigger authorizes a brief only.

## 6. Block map

Actionable (agent, free):

- Apply the section-7 edits.
- Author the capability-boundary diagnostic plan (ladder stage 1).
- Run free Horizon probes and date-stamp the results.
- Record issue states in the next improvements round.

Owner-blocked:

- The paired product-loss margin (D1).
- Protocol-history T2 and T3 (D2, D3).
- Caps for ladder stages 2 and 3 (D4).

Evidence-triggered:

- Recovery paid collection: the free Horizon probe returns `28`.
- Recovery ranking selection: three recurring misses.
- Docs-versus-repository conflict: three recurrences.
- Friendbot fix: a second unrelated case, a contract mismatch, or trace evidence that the prompt requests the wrong behavior.
- Token prefix fix: a second unrelated case, or a re-vendor that changes the rule.
- Protocol-history T1: both pinned hashes change (`inventory/stellar-light.json`; the `x-routing` object for `GET /api/research`).
- Protocol-history T4: two unrelated live misses with transcripts.
- `sources.locate` phase-zero study: the section-8 verified-incident trigger in `ideas/source-delivery-ranked-references.md`.
- Same-tuple pinned pair: a merged product candidate that needs a paired look, plus the recorded margin.

Upstream-blocked:

- `sls-080` resolution: Stellar-Light/stellarlight#1134.
- `sd-047` resolution: stellar/stellar-docs#2805.
- `sls-074` close: Stellar-Light/stellarlight#1031.

Complete (do not reopen):

- Golden metadata remainder (PR #100, PR #106).
- Five-track same-100 round (`VALID WITH A T4 EXCEPTION`; 99 paired-eligible IDs).
- Paired-verdict implementation (experimental; not a ship gate).
- Judge-stability watch (closed stable at 57; ledger `.agents/rounds/2026-08-31-eval-routing-next.md`).
- Protocol-history attempts one, two, three. The three-attempt box is spent.
- Repository-tooling recovery v2 (rejected; PR #102).
- QA capability-boundary prompt (rejected; PR #103).
- Playground limit, the real `ai` tool-loop test, and title cleanup (PR #99, `3c7f0e5`).
- Hackathon cluster decision (`cluster-136`).

## 7. Suggested `.agents/` edits

E1 — `.agents/TODO.md`, item "Design a new Raven capability-boundary diagnostic". Add after the first paragraph:

a. The two measured defects. Case `q-n3-missing-funds-account-support`: the agent offered a Raven lookup for a G-address or a transaction hash. Raven has no account-scoped lookup. The answer must redirect to a wallet, exchange, anchor, or explorer. Case `q-edge-send-me-free-xlm`: the prompt called Friendbot Testnet-only. The correct scope is Testnet, Futurenet, and local Quickstart. Mainnet has no Friendbot.
b. The recorded mechanism constraint from `.agents/rounds/2026-08-31-eval-routing-next/plan-fable.md` section 3.3: the next mechanism must not be prose alone, and it needs a free offline diagnostic before any paid run.
c. The plan must pre-state the product gate. The gate must cover T3 trap behavior, the external lookup control, and agent-environment identity. Pin the environment hash with the free check recorded in `.agents/rounds/2026-08-29-five-track-same-100.md` before each paid method.
d. Replace "Method 2" with "the capability-boundary Method 2 (its definition is not in committed records)". State that the five-track "Method 2" is a different, completed method.

E2 — `.agents/NEXT.md`, ranked block 1. Add the same constraints in ranked form. Cite the plan-fable section 3.3 path.

E3 — `.agents/NEXT.md` and `.agents/TODO.md`. Replace "`sls-080` is verified" with "`sls-080` is `reported-upstream` at Stellar-Light/stellarlight#1134. GitHub read the issue OPEN on 2026-08-31." Add #1134 to the watch items.

E4 — `.agents/NEXT.md`, owner decision "Choose a product-loss margin for the paired QA method". Add: the per-component application; the point scale; the pair cost (about `$82`; stored range `$64`–`$92`; one `$50`-capped collection per arm); the collection trigger (a merged product candidate plus the recorded margin; no calibration-only spend); the safe default (no decision means no promotion).

E5 — `.agents/TODO.md`, "Eval instruments". Add an item: the optional one-row `v2.10` rejudge of `q-eco-stellar-wallets-list`. Trigger: before the next paired collection, with its own small cap. Otherwise drop it with a recorded reason.

E6 — `.agents/TODO.md` protocol-history item, trigger lines. Qualify T1: the standing drift lane records the contract counts under its own authorization; the trigger itself authorizes a brief only. Define T4's "unrelated": cases from different question families with no shared question text.

E7 — `.agents/NEXT.md`. Change "`69 active findings`" to "`69 findings (3 fixed-upstream deletion candidates, 3 declined-upstream)`". Move the standing case-id-list rule from the completed block into the `golden-truth` skill.

## 8. Residual uncertainty

- The production Worker Version ID `6282fe2a-54d8-471e-9f0a-0a2565110af1` and its deploy date are operator-recorded. The repository cannot confirm them.
- The capability-boundary "Method 2" definition is not in any committed file. It may exist only in closed PR #103 or in an uncommitted brief.
- The live states of stellarlight#1134, stellarlight#1031, and stellar-docs#2805 were last read on 2026-08-31. Any of them may have closed since.
- The DeepWiki probe value was `25` at `2026-08-31T01:42:10.098Z`. The current value is unknown.
- No instrument isolates judge-only variance. The register combines collection and rejudge movement. The "stable at 57" closure rests on that compound measure.
- The same-100 result files, the stability register, and the Method 1 artifact are local-only. This audit relied on the committed ledgers for their numbers.
- The served model variant is not observable from inside this session.

## Appendix — question index

1. Omissions exist: the two boundary defects and the non-prose constraint (F1), the #1134 watch (F3), the paired-pair collection trigger (F4), and the deferred rejudge (F5).
2. No completed work is kept active. The `sls-080` text is the inverse error: it understates progress (F3).
3. Most blocks state prerequisites, permitted actions, forbidden actions, and a completion gate. Block 1 does not state a definable product gate (F1 items 3-4).
4. No. F1 lists the missing design constraints.
5. Yes. Ladder stages 1-3 separate the focused diagnostic from the paid headline, with separate authorizations.
6. A reviewed plan that states the two defects, a non-prose mechanism, a free offline diagnostic, a pre-stated product gate, and identity pins. Then a product-gate pass before any headline sample.
7. Yes. The decision object and the trade-off table are correct and mixed-tuple labeled. Four inputs are missing (F4).
8. A recorded margin; one same-tuple pinned pair (two complete comparable same-100 artifacts under one answering model and one judge model/rubric/pack tuple, one pinned register, at least 100 eligible IDs after exclusions); the `--recalibrate` validator run with all six gates; pre-spend reviews and owner caps for the collections. The pair is collected only for a merged product candidate.
9. Yes. Three distinct general mechanisms failed the same frozen acceptance table. The third confirmed the predicted flood failure (controls 2/4 and 7/9; holdout 19 forbidden captures). A fourth attempt without new evidence would be tuning.
10. Mostly. T1 has a run-wording defect (F6 item 1). T4's "unrelated" is undefined (F6 item 2). The acceptance table stayed frozen across all three attempts, which resists post-hoc goal changes.
11. Yes. Every monitor sits behind its recorded bar. One upstream watch is missing (F3).
12. Human product judgment: D1, D2, D3. Human spend authorization: D4 and ladder stages 2-3. Independent model review: ladder stage 1, any triggered protocol-history brief, pre-spend reviews, golden changes. Mechanical checks: free probes, routing gate, corpus lint, improvements index, register refresh, reachability audits, paired validator.
13. The margin tables (mixed-tuple, labeled); the register trend (compound, labeled); local-only artifacts; the as-of probe value; the production version ID; the stale `sls-080` text (F3); the "69 active" count (F7); the `v2.9`-judged same-100 numbers, which need a `v2.10` rejudge before any comparison.
14. The ladder in section 5 plus the standing monitors. No spent work reopens: the three routing attempts, both rejected experiments, and all completed blocks stay closed.
15. Edits E1 through E7.

Corpus lint was re-run during this audit: 0 errors, 61 warnings (16 corroboration, 1 symmetric-caution on `q-protocol-ledger-close-time`), matching the `NEXT.md` state line.
