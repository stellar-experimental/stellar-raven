# Remaining-work adversarial audit — Fable report

Date: 2026-09-01
Brief: `.agents/rounds/2026-09-01-remaining-work-adversarial-audit/brief.md`
Scope: read-only audit of `.agents/NEXT.md` and `.agents/TODO.md` against the required sources.

## 1. Runtime

| Field | Value |
| --- | --- |
| Model | Claude Fable 5 (`claude-fable-5`) |
| CLI | Claude Code, single interactive session |
| Requested effort | xhigh |
| Observed effort or variant | xhigh; one context window; no sub-agents; no Herdr pane; no network call; no paid call; no live fetch |
| Writes | This file only |
| Extra reads beyond the required list | Git object reads of the unmerged snapshot commits `fb9a35eb` (PR #103) and `6baec0a4` (PR #102); `eval/qa/run-qa.mjs` flag inventory; `eval/qa/paired-verdict.mjs`; `eval/qa/validate-paired-verdict.mjs`; `research/decisions/0008-*.md`; `improvements/INDEX.md`; both frozen protocol-history contract files; `eval/gates.json` keys; one offline node read of the local artifact `eval/qa/results/2026-08-30T03-43-11-variantA.json` |
| Other auditor reports | Not read. A grep for the deploy version id listed two file names in this directory. I did not open them and I do not use them. |

## 2. Verdict

`PASS-WITH-FIXES`.

The queue has the right shape. It separates spent boxes, monitor-only items, evidence triggers,
and owner decisions. It authorizes no invalid run by itself. It has five High defects. Each one
lets a new agent or the owner make a wrong step without noticing. All five are repairable with
`.agents/` edits plus one small harness item. Repair them before the next owner decision and
before the next paid step.

Answers to the fifteen brief questions are in section 9. The findings below carry the evidence.

## 3. Findings

Severity scale: High blocks safe progress on a ranked block; Medium misleads or loses evidence;
Low is precision or hygiene.

### F1 — High — The Raven capability-boundary block has no design constraints and no durable record

Sources: `.agents/TODO.md` "Design a new Raven capability-boundary diagnostic";
`.agents/NEXT.md` block 1; `.agents/rounds/2026-08-31-rejected-experiments-closeout.md`;
`.agents/rounds/2026-08-30-qa-prompt-boundaries.md` at commit `fb9a35eb` (unmerged);
`.agents/rounds/2026-08-31-eval-routing-next/plan-fable.md` section 3.3.

Problem:

- The block uses the terms "Method 1", "Method 2", "T3", "external lookup control", and
  "product gate". None is defined in `TODO.md` or `NEXT.md`.
- The definitions exist only in `.agents/rounds/2026-08-30-qa-prompt-boundaries.md` at commit
  `fb9a35eb`. PR #103 closed without merge. `git branch -r --contains fb9a35eb` returns nothing.
  The commit is on no local or remote branch.
- The trap id `q-n3-missing-funds-account-support` and the control id
  `q-jutsu-check-account-history` are absent from the queue.
- The surface owner is undecided. The rejected change edited `eval/qa/run-qa.mjs:agentPrompt`,
  a QA-only surface. The production surface `src/mcp/tools.ts:BASE_SERVER_INSTRUCTIONS` was
  classified as not owning the defect. The queue does not carry that decision or its reason.
- The plan lane recorded the reopen trigger as "a mechanism proposal that is not prose, plus a
  free offline diagnostic" (`plan-fable.md` section 3.3). The queue says only "a stronger
  mechanism".
- The leakage rule from the review (no case facts, identifiers, or redirect lists in a prompt)
  is not carried.
- The failing answer was a no-tool answer. Only the system prompt or server instructions reach
  the model before such an answer. The queue does not state this constraint. It shapes every
  mechanism choice.
- "T3" in this block means five-track T3 (safety). "T3" in block 3 means routing trigger T3.
  The same token names two different things in one file.

Consequence: a new agent must reconstruct the prior round from an unreachable commit, or it
will propose prose again and repeat the spent method.

Required repair: restate the block per section 7, edit E1. Rename the routing triggers or spell
out "five-track T3 (safety)".

### F2 — High — The paired QA owner decision presents an incomplete decision object

Sources: `.agents/NEXT.md` "Choose a product-loss margin for the paired QA method";
`.agents/rounds/2026-08-29-paired-verdict.md` "Deterministic validation";
`eval/qa/validate-paired-verdict.mjs` (`MISSINGNESS_ASSUMPTIONS`: `t4T5Rate 0.03`,
`candidateOnlyRate 0.01`, `contentRate 0.01`); `eval/qa/README.md` paired section;
`.agents/rounds/2026-08-29-five-track-same-100.md` "Paired experimental status".

Problem:

- The method requires 100 eligible IDs after exclusions. The pinned set selects exactly 100.
  One excluded ID makes the look `INDETERMINATE` and non-repeatable. The validator's own
  missingness diagnostic reports mean eligibility `95.959` of 100 and a terminal
  `INDETERMINATE` rate of `99.356%` at selected 100. The one real artifact landed at 99.
- The candidate-only rule forces `INDETERMINATE` on any single ID where the candidate is T4/T5
  and the baseline is T1. The validator reports `64.079%` of trials blocked at a `1%` rate.
  Judge consistency errors are T4. The 2026-08-28 run had four such rows in 100.
- The queue frames the margin as the blocking owner question. `plan-fable.md` section 3.3
  records that "No paired verdict is planned, so the decision is not blocking." Section 3.4
  records the spend trigger: "a merged product candidate that needs a paired look, plus the
  owner margin". It says "Do not spend on calibration alone." The queue carries none of this.
- The queue does not state the cost. A pair is about `$82`, stored range `$64` to `$92`.
- The queue does not state that the 2026-08-30 artifact used rubric `v2.9` and cannot be an arm
  under `v2.10`. A same-tuple pair means two new collections.

Consequence: the owner may choose a margin for a method that cannot reach a determinate look.
An agent may propose about `$82` of collection for a near-certain `INDETERMINATE`.

Required repair: rewrite the decision as three ordered design questions before spend
(section 4, HD2). Carry the section 3.4 trigger and the cost. State the safe default: no spend;
the decision is not blocking today. Any change to the denominator or candidate-only rule must be
pre-registered and validated before the first real look, never after one.

### F3 — High — The paired-method TODO closed with an unmet done-condition; the remaining debt has no block

Sources: `git show b53f62d -- .agents/TODO.md` (PR #98); `.agents/NEXT.md` owner decision;
`.agents/rounds/2026-08-29-paired-verdict.md` finding M5.

Problem: the deleted item "Design and validate a paired comparison verdict" had this done
condition: "the next same-tuple pinned pair prints one verdict with denominator, look, and
reasons". No same-tuple pinned pair exists. M5 said the TODO "remains open until a pinned pair
and owner decision exist." The item was deleted anyway. The remaining work now survives as one
sentence in an owner-decision paragraph. It has no prerequisites, permitted actions, forbidden
actions, cost, or gate.

Consequence: this is an omitted evaluation debt (brief question 1). The debt can be forgotten,
or spent ad hoc.

Required repair: add the TODO item in section 7, edit E3.

### F4 — High — The production state is stated, but the deploy decision is missing

Sources: `.agents/NEXT.md` "State at handoff" (Worker Version
`6282fe2a-54d8-471e-9f0a-0a2565110af1`, deployed 2026-08-28; "PR #99 shipped the Playground
limit"); `git diff --stat b933ddc..main -- src` (`src/demo/budget.ts`, `src/demo/chat.ts`,
`src/demo/page.ts`, all from `3c7f0e5`, 2026-08-30).

Problem: "shipped" means merged here, not deployed. By the queue's own statement, production
runs a build from 2026-08-28. `main` carries a user-facing Playground change since 2026-08-30.
No block says "deploy `main`" and no decision says "hold the deploy" with a reason. A deploy is
a production change and needs owner authorization.

Consequence: a merged product fix is not live, with no recorded reason. A new agent cannot
tell whether a deploy is wanted. This audit did not query production, so the live version is
unconfirmed (section 8).

Required repair: add owner decision HD1 (section 4). Change "shipped" to "merged; not deployed".

### F5 — High — The repository-recovery block conflates unblocking with completion, and its trigger literal is fragile

Sources: `.agents/TODO.md` "Monitor the rejected repository-tooling recovery experiment";
`.agents/NEXT.md` block 2; `research/decisions/0008-human-review-eval-and-playground-policy.md`
"Repository-level recovery";
`improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md`;
`fable-plan-v2-live-failure.md` at commit `6baec0a4` (unmerged).

Problem:

- "Done when: a free Horizon probe returns `28`". The value `28` is the source value at
  `scannedRef 82660510`. Horizon's `MaxSupportedProtocolVersion` will advance. DeepWiki may move
  from `25` to `29`. The literal can become unsatisfiable without anyone noticing. The correct
  condition is "the DeepWiki answer equals the source value at the response's own `scannedRef`".
- A matching probe does not complete the item. It removes one blocker. The next steps are a
  pre-registered v3 plan, an owner decision on G1 or the unchanged v2 rule, new blind digests, an
  ADR amendment if the rule changes, independent review, and a separately authorized paid
  collection. The v2 collection cost `$4.5646914` for 20 paid calls.
- "G1", "selection trigger", "Docs-versus-repository conflict", and "`stellar-cli` fallback"
  are undefined in the queue. ADR-0008 defines the gate (10 of 12 positives; zero premature
  detours) and the ranking trigger ("Consider ranking only after three qualifying positive misses
  remain"). The queue does not cite it. G1 is defined only at commit `6baec0a4`, which is on no
  branch.
- The probe has no owner, cadence, exact question, or server. The 2026-08-31 probe used a local
  dev server at port 8788 and the question recorded in `sls-080`.
- The only automatic unblock depends on a third party re-indexing DeepWiki. Issue #1134 asks for
  an `answerAsOf` field, not a re-index. The block can stay monitor-only indefinitely.
- The item sits under `## Routing` in `TODO.md`. ADR-0008 orders it as a recovery mechanism that
  precedes any ranking change.

Consequence: an agent may close the item on a literal `28`, may never see the trigger fire, or
cannot reconstruct G1 when it does.

Required repair: section 7, edit E4. Add owner decision HD5.

### F6 — Medium — Method 1 evidence is weaker than the queue states, and the harness cannot enforce the environment pin

Sources: `.agents/rounds/2026-08-31-rejected-experiments-closeout.md`; `eval/qa/run-qa.mjs`
(the only pins are `--expect-sha256` and `--expect-agent-binary-sha256`);
`.agents/rounds/2026-08-29-five-track-same-100.md` "Agent environment pin" (a manual `node -e`
check); the snapshot brief at `fb9a35eb`.

Problem: `NEXT.md` says "Method 1 failed its product gate" as a clean fail. The artifact's
inherited environment SHA-256 (`a4d6c0d9…`) differed from the pre-registered `051faaf0…`. The
snapshot brief says: "Treat this artifact as failed diagnostic evidence, not paired or headline
evidence" and "The CLI did not expose an environment-pin flag and did not stop on this
mismatch." The artifact `2026-08-30T17-41-18-variantA.json` is not present in the main checkout,
`~/.cache/stellar-raven`, `~/.herdr/worktrees` (empty), or `~/.local/share`. Only its SHA-256
survives.

Consequence: the next diagnostic can repeat the same invalidation. The rejection rests on one
pin-broken, non-reproducible observation. The T3 failure is still a real observation. It is
monitor-grade evidence, not a measured rejection.

Required repair: add a TODO item for a fail-closed `--expect-agent-environment-sha256` (name
set plus hash) on `run-qa.mjs` and `re-judge.mjs`, as a prerequisite of the Raven block.
Reword `NEXT.md`: "Method 1 is invalid as a measurement (environment pin mismatch). Its T3
failure is one observation. The prompt mechanism was withdrawn."

### F7 — Medium — The protocol-history owner decision lacks a decision object and a guard against post-hoc goal change

Sources: `.agents/NEXT.md` "Decide whether protocol-history routing can reopen"; brief-fable
section 16 (T2, T3) and section 8 (`PARTIAL` label); the three retained result files.

Problem: the decision is two sentences. It has no options, no evidence list, and no safe
default. T2 is the only path that can change the frozen acceptance table. The queue does not
state the evidence bar that separates a control-label review from a bar-lowering after three
`FAIL` results. No mechanism reached `PARTIAL` (zero control captures with gates intact), so no
evidence supports a positive-bar change today. T3 has no attempt budget for the new box and no
named authority for its network and byte budget. No product-impact evidence is offered.

A free instrument exists. An audit-time offline read of `2026-08-30T03-43-11-variantA.json`
found 18 same-100 rows whose battery `surface` lists `scout.searchResearch`. Twelve called it in
execute code (8 non-correct). Six did not (2 correct, 4 partial). This is illustrative only. It
is not a registered measurement. The six are not protocol-history questions. The real count
should use the 76-case inventory and the protocol-history QA family.

Consequence: an owner could relax the bar on mechanism-failure grounds, which the review rules
forbid. Or the owner could open T3 without knowing the product stake.

Required repair: section 7, edit E5; owner decision HD3.

### F8 — Medium — The `sources.locate` reopen trigger depends on a steering that does not exist

Sources: `ideas/source-delivery-ranked-references.md` section 8, condition 3; ADR-0008
"Repository-level recovery"; the closeout (recovery v2 rejected).

Problem: condition 3 requires "the repository-recovery steering from ADR-0008 was live when the
failure occurred." ADR-0008 prescribes measuring such steering before it ships. v2 failed its
gate. Nothing is live. No incident can satisfy condition 3. `sources.locate` is therefore gated
behind the monitor-only recovery block. The queue does not say so. No place is named to log an
incident that meets conditions 1, 2, and 4 but not 3.

Consequence: user-block evidence is discarded. The sequencing is implicit.

Required repair: section 7, edit E6. Owner decision HD7 on whether such incidents count.

### F9 — Medium — The Friendbot monitor has no failure signature

Sources: `.agents/TODO.md` "Monitor Friendbot network-context synthesis";
`.agents/rounds/2026-08-29-five-track-same-100.md` "Final review finding reconciliation";
the snapshot TODO at `fb9a35eb`.

Problem: the merged monitor dropped the case id `q-edge-send-me-free-xlm` and the signature.
The signature was: the answer called Friendbot Testnet-only; the transcript made no tool call;
Stellar Docs expose the Testnet, Futurenet, and local Quickstart distinctions. The trigger says
"the same failure appears in two unrelated cases". Without a signature, no one can recognize
"the same failure".

Consequence: the monitor cannot be matched, so it cannot fire.

Required repair: restore the case id and the three-line signature in the item.

### F10 — Medium — Two rejected-experiment ledgers and their artifacts are not durable

Sources: `.agents/README.md` ("one dated ledger per multi-lane round — durable record");
commits `fb9a35eb` and `6baec0a4` (no branch contains them; `~/.herdr/worktrees` is empty; the
result artifacts were not found on disk).

Problem: the queue's monitor-only blocks and its ranked block depend on definitions and numbers
whose only local records are unreachable commits. Git garbage collection prunes unreachable
objects. The GitHub closed-PR refs are the last durable copy. The closeout records hashes but
not a fetch recipe.

Consequence: the evidence can vanish silently. The closeout then becomes unverifiable prose.

Required repair: add to the closeout ledger: `git fetch origin pull/102/head pull/103/head`
and the two snapshot hashes as the retrieval path. Record that the local artifacts are gone and
only hashes remain. Owner decision HD6 on merging the two ledgers as documentation only.

### F11 — Low — Status and wording precision errors in the queue

- `sls-080` status is `reported-upstream` (file frontmatter; Stellar-Light/stellarlight#1134).
  `NEXT.md` says "verified" twice. `TODO.md` says "verified active". Use the file's status word.
- `NEXT.md` keeps a long "Completed blocks" section. Its own header says "Delete or rewrite this
  file when the block is done." Keep one line with the ledger path.
- `NEXT.md` block 1 spends three sentences on the closed judge-stability TODO.
- "Focused verification passed 31 tests across four files on 2026-08-31" names no files and no
  command. It is local-only noise.
- `NEXT.md` "State at handoff" repeats `sd-047` `reported-upstream` in two places.
- "69 active findings" is correct under `improvements/README.md` ("active queue" = files
  present). Statuses: 60 `reported-upstream`, 3 `proposed`, 3 `fixed-upstream`,
  3 `declined-upstream`.

### F12 — Low — `eval/qa/README.md` has no record of the first `qa-five-track-v1` same-100 run

Sources: `eval/qa/README.md` (grep for `2026-08-30T03-43-11` finds nothing; the only mention of
the run is a cost line in "Judge-tier contract"); "Current baseline of record" names the
2026-07-11 tier-interleave round as the most recent checkpoint; `run-evals` Step 7.

Problem: the committed record for the `$40.9579502`, 314-call run and its
`VALID WITH A T4 EXCEPTION` decision is the round ledger only. `run-evals` requires the lane
README to carry the stamp, numbers, and reading notes.

Consequence: the README's current-results section is stale relative to the queue's claims.

Required repair: add a "2026-08-30 same-100 five-track run (checkpoint, not a re-baseline)"
section with the stamp, SHA-256, tuple, T1 to T5 counts, eligibility 99, and the decision.
Update the "most recent checkpoint" sentence.

### F13 — Low — Trigger definitions in section 16 have three small gaps

- T1's action runs the free `npm run eval:protocol-history` lane. The closing sentence says a
  trigger authorizes a brief only. State that the free lane run is permitted and that a brief is
  authorized only when a frozen lane moved or the card's `useWhen`, `exampleQuestions`, or
  `keywords` changed.
- T4's "unrelated" is undefined. Define it: different question family and entity; not a
  paraphrase of a frozen-set question. Name `cloudflare-observability-review` as the source of
  production transcripts.
- T3 says "Attempt three is reserved or spent by this brief." It is spent. Update the phrase in
  the queue's summary, not in the dated brief.

## 4. Human decisions

Each row names the exact question, the options, the evidence the owner needs, and the safe
default. None of these is an agent decision.

### HD1 — Deploy `main` to production?

- Question: Deploy `main` at `9815785` (which includes `3c7f0e5`, the Playground input limit)
  to `raven.stellar.org`, or hold?
- Options: (a) deploy now through the documented preflight and post-deploy verification;
  (b) hold, and record the reason and the reopen condition in `NEXT.md`.
- Evidence needed: the live Worker Version id read from Cloudflare; the `git diff --stat
  <deployed-commit>..main -- src` list; the PR #99 test record.
- Safe default: hold and record the reason. A silent hold is the defect, not the hold itself.

### HD2 — Paired QA method: design before margin

- Question 1: What selected denominator gives at least 100 eligible IDs with high probability?
  Options: keep exactly 100 (accept near-certain `INDETERMINATE`); pre-register an extension rule
  that selects more than 100 from the compiled pool so at least 100 survive.
- Question 2: Does one candidate-only T4 judge error stay terminal? Options: keep terminal;
  bound it with a pre-registered rule. Decide before the first real look. A change after a look
  is forbidden.
- Question 3: Which product-loss margin? Options `0.05`, `0.08`, `0.10` from the table, labeled
  mixed-tuple calibration.
- Evidence needed: `npm run eval:qa:paired:validate` extended to the chosen selected `n` (free);
  the same-100 eligibility history (99 on 2026-08-30); the pair cost (`$82`; `$64` to `$92`).
- Safe default: no spend; the method stays experimental and is not a gate; the decision is not
  blocking until a merged product candidate needs a paired look (`plan-fable.md` 3.4).

### HD3 — Protocol-history routing: stay trigger-only, review labels, or open a new box?

- Options: (A) stay trigger-only; (B) T2 control-label review; (C) T3 new non-card box.
- Evidence needed before the question is posed: a per-control capture matrix across the three
  retained results; an independent label review of each captured control against the target
  card's `notFor` and `useWhen`; a product-impact count from stored transcripts over the 76-case
  inventory and the protocol-history QA family. All three are free.
- Constraint: (B) may change a control label only on label evidence, with a contract-version
  bump and provenance. It may not lower the 19/19 bar because mechanisms failed. (C) must set
  the new box's attempt budget and network and byte budget before its brief.
- Safe default: (A).

### HD4 — Raven capability boundary: which surface, and is it worth a paid step?

- Question: Is the defect a QA-harness fidelity issue (`eval/qa/run-qa.mjs:agentPrompt`) or a
  production behavior (`BASE_SERVER_INSTRUCTIONS`, tool descriptions)?
- Options: (a) monitor only; (b) production-surface rule measured by the prompt-surface
  instrument (sample-30 forced panel plus plan regrade); (c) QA-only rule with a focused
  diagnostic only.
- Evidence needed: a free scan of stored answers (`rows[].answer` in the same-100 and 2026-08-28
  artifacts) for unsupported-capability offers, adjudicated by a reviewer; the prose-surface
  inventory for the chosen surface; the no-tool-answer constraint stated in the plan.
- Safe default: (a) plus the free scan. No paid diagnostic until a plan names a mechanism that
  reaches a no-tool answer and passes independent review.

### HD5 — Repository recovery: accept an indefinite monitor, ask upstream, or pre-register v3 now?

- Options: (a) accept the monitor with the corrected probe rule; (b) ask Stellar Light to
  refresh the DeepWiki index for `stellar/stellar-horizon` (an upstream message); (c) author the
  v3 pre-registration now (G1 decision, new digests, ADR amendment) so the plan is ready.
- Evidence needed: the probe history; the G1 record from commit `6baec0a4`; ADR-0008's gate.
- Safe default: (a). (c) is free authoring but costs review time. (b) is an outward message.

### HD6 — Merge the two unmerged round ledgers as documentation only?

- Options: merge `2026-08-30-qa-prompt-boundaries.md` and
  `2026-08-30-repository-tooling-recovery.md` (ledgers only, no code); or keep the fetch recipe.
- Safe default: record the fetch recipe now; merge later if the blocks reopen.

### HD7 — Do `sources.locate` incidents count while no recovery steering is live?

- Options: count them; log them without counting; waive condition 3 until steering ships.
- Safe default: log without counting, in the recovery TODO's monitor list.

## 5. Evaluation ladder

The ladder applies to any block that ends in a paid measurement. Each stage has an entry gate,
an instrument, an exit gate, and an authorization boundary. No stage may skip the one before it.

| Stage | Entry gate | Instrument | Exit gate | Authorization boundary |
| --- | --- | --- | --- | --- |
| 0. Free offline evidence | None | Node reads of local artifacts; `npm run eval:routing -- --gate`; `npm run eval:qa:paired:validate`; plan regrade | Numbers written into a draft brief with stamps | None. No paid call, no fetch, no production edit |
| 1. Pre-registered brief plus independent review | Stage 0 numbers | Round ledger brief; reviewer from a different lane than author and orchestrator | Reviewer `PASS`; every finding reconciled; bounded delta re-review on major revision | None. A `PASS` authorizes implementation of the harness only |
| 2. Focused paid diagnostic | Stage 1 `PASS`; owner call-count and cost cap; env, binary, surface, revision pins asserted and harness-enforced | `run-qa.mjs --ids <trap,control> --judge-panel 3 --max-budget-usd <cap>` | The brief's product gate; env hash equals the pre-registered value; all costs reported | Owner, method-specific, non-transferable, one run |
| 3. Headline sample | Stage 2 gate passed; separate owner authorization | Sample-30 forced panel plus offline plan regrade; routing gate if catalog text changed | No regression beyond noise on the same IDs; reviewed | Owner, separate cap; denominators never merge |
| 4. Result review and closeout | Complete, comparable artifacts | Independent review; live-verify every `wrong`; file findings; README record | Every row reviewed; ledger Outcome written | None |
| 5. Ship | Stage 4 complete | Merge, deploy preflight, post-deploy verify | Production verified | Owner deploy authorization |

Block-specific ladders:

- Paired method: P0 validator at the chosen selected `n` (free) → P1 owner design decision
  (HD2) → P2 trigger: a merged candidate needs a paired look → P3 two collections under one
  `claude-sonnet-5` / `v2.10` / `p5` tuple, one pinned register, one env hash, one binary, one
  implementation hash, about `$82` → P4 `npm run eval:qa:paired -- a b --json`, then
  `paired:validate -- --recalibrate a b` → P5 promotion decision recorded in a round ledger under
  the one-headline, two-gate rule. P4 is not a gate result. P5 is the only step that can make it
  one.
- Protocol-history: R0 free capture matrix and product-impact count → R1 owner decision (HD3)
  → R2 brief under T2 or T3 with the section 8 acceptance table unchanged, plus independent
  review → R3 (T3 only) separate fetch authorization → R4 one offline referee → R5 independent
  result verification. The new box's attempt budget is fixed in R2.
- Repository recovery: V0 free probe at each drift refresh with the match-source rule → V1 on
  match: v3 pre-registration (G1 or unchanged v2 rule; new blind digests; ADR amendment if the
  rule changes) plus review → V2 separately authorized 20-case collection (v2 cost `$4.56`) →
  V3 ADR-0008 gate 10 of 12 and 0 of 8 → V4 ship decision.
- Raven boundary: B0 free prevalence scan and prose-surface inventory → B1 owner surface
  decision (HD4) → B2 brief and review → B3 focused diagnostic (`$2` cap and 16 calls was the
  prior shape) → B4 headline only if the surface is production and B3 passed → B5 review.

## 6. Block map

| Class | Item | Note |
| --- | --- | --- |
| Actionable now (no owner, no spend) | `.agents/` edits E1 to E8 | Section 7 |
| Actionable now | Harness env-pin flag on `run-qa.mjs` and `re-judge.mjs` | Own-repo eval instrument; prerequisite of the Raven block (F6) |
| Actionable now | `eval/qa/README.md` record of the 2026-08-30 same-100 run | F12 |
| Actionable now | Free capture matrix and product-impact count for protocol-history | Feeds HD3 |
| Actionable now | Free prevalence scan of stored answers for capability offers | Feeds HD4 |
| Actionable now | Validator extension design for selected `n` above 100 | Method change; needs review before any look; feeds HD2 |
| Actionable now | Closeout ledger: fetch recipe for `pull/102/head` and `pull/103/head` | F10 |
| Owner-blocked | Deploy decision | HD1 |
| Owner-blocked | Paired design and margin | HD2 |
| Owner-blocked | Protocol-history T2 or T3 | HD3 |
| Owner-blocked | Raven boundary surface and worth | HD4 |
| Owner-blocked | Recovery v3 pre-registration and upstream re-index ask | HD5 |
| Owner-blocked | Ledger merge; `sources.locate` condition 3 policy | HD6, HD7 |
| Evidence-triggered | Friendbot monitor | Needs its signature restored (F9) |
| Evidence-triggered | Vendor short-token prefix monitor | Second unrelated case or re-vendor |
| Evidence-triggered | T1 card change; T4 two unrelated live misses | Free lane run permitted under T1 |
| Evidence-triggered | Recovery probe match | Use the match-source rule, not the literal `28` |
| Evidence-triggered | `sources.locate` incidents | Currently cannot qualify (F8) |
| Upstream-blocked | `sls-080` dating (#1134); `sd-047` (#2805); #1031 close | Carried by the improvements pipeline at drift refresh; no TODO needed except the #1031 watch |
| Upstream-blocked | DeepWiki re-index freshness | No filed request exists; see HD5 |
| Complete | Golden metadata remainder; judge-stability TODO; five-track, paired, lifecycle, and `v2.10` implementations; three routing attempts (box spent); PR #99 merge | Deploy of PR #99 is owner-blocked, not complete |

## 7. Suggested `.agents/` edits

### E1 — `.agents/TODO.md`, "Design a new Raven capability-boundary diagnostic"

Replace the body with this substance:

- Defect: on 2026-08-30 the same-100 review found an unsupported capability claim. Case
  `q-n3-missing-funds-account-support` offered a later lookup by G-address or transaction hash.
  Raven exposes no account-scoped lookup. The claim is a manifest contract mismatch. That meets
  the `run-evals` acting bar once. The answer was a no-tool answer.
- Control: `q-jutsu-check-account-history`. It asks for lookup guidance another service can
  perform. Any mechanism must not suppress that guidance.
- Spent: a prose rule in `eval/qa/run-qa.mjs:agentPrompt`, measured by Method 1
  (2 answering calls, 6 judge calls, `$0.4597096`, artifact `2026-08-30T17-41-18-variantA.json`,
  SHA-256 `b6a596fb…`). The environment hash differed from the pre-registered value, so the
  artifact is failed diagnostic evidence, not a measurement. The trap failed five-track T3 on
  all three votes. Method 2 never ran. Both authorizations are spent. The design record is
  `.agents/rounds/2026-08-30-qa-prompt-boundaries.md` at `fb9a35eb`; fetch with
  `git fetch origin pull/103/head`.
- Constraints for the next plan: decide the surface owner first (QA harness prompt or
  production instructions); the mechanism must reach a no-tool answer; a prose rule on the QA
  surface is spent; no case facts, identifiers, or redirect lists in any prompt; fixtures must
  prove it; the harness must enforce the environment pin before spend.
- Prerequisite: the free prevalence scan of stored answers and the prose-surface inventory.
- Done when: an independently reviewed plan names the surface owner and a mechanism that
  satisfies the constraints. A focused diagnostic then needs its own bounded authorization. A
  headline sample needs a separate authorization after the diagnostic passes its product gate.
  Denominators never merge.

### E2 — `.agents/NEXT.md`, block 1 and "Owner decisions"

- Replace "Method 1 failed its product gate. Its inherited environment hash also differed." with
  "Method 1 is invalid as a measurement because its environment hash differed from the
  pre-registered value. Its T3 failure is one observation. The prompt mechanism was withdrawn."
- Delete the three judge-stability sentences. Keep "The judge-stability TODO is closed."
- Rename routing triggers to `R1` to `R4` in the queue, or write "five-track T3 (safety)" in
  block 1. Keep the dated brief's text unchanged.
- Add HD1 and HD4 under "Owner decisions".

### E3 — `.agents/TODO.md`, new item under "Eval instruments": "Paired QA method: same-tuple pinned pair and recalibration"

Substance:

- State: `qa-paired-ordinal-ni-v1` is implemented and experimental. It is not a gate. No
  same-tuple pinned pair exists. The 2026-08-30 artifact used rubric `v2.9` and cannot be an
  arm under `v2.10`.
- Design debt before any look: selected 100 with required eligible 100 gives near-certain
  `INDETERMINATE` (validator: `99.356%` terminal at selected 100; real run: 99 eligible). One
  candidate-only T4 forces `INDETERMINATE` (validator: `64.079%` blocked at `1%`). Both are
  owner design questions (HD2). Decide and re-validate before the first look, never after.
- Spend trigger (from `2026-08-31-eval-routing-next/plan-fable.md` 3.4): a merged product
  candidate that needs a paired look, plus the recorded owner margin. Do not spend on
  calibration alone. Cost about `$82` (`$64` to `$92`) for two collections.
- Permitted now: validator extension for a selected `n` above 100; free reads of stored
  artifacts. Forbidden: any collection, re-judge, or margin override without the trigger.
- Done when: one same-tuple pinned pair exists, `paired:validate -- --recalibrate` passes, and a
  round ledger records the promotion decision under the one-headline, two-gate rule.

### E4 — `.agents/TODO.md`, "Monitor the rejected repository-tooling recovery experiment"

- Move the item out of `## Routing` into a `## Recovery` section or `## Eval instruments`.
- Cite ADR-0008 "Repository-level recovery" for the gate (10 of 12; 0 of 8) and the ranking
  trigger (three qualifying positive misses). Replace "selection trigger" with ADR-0008's words.
- Replace the probe rule: "Done when the DeepWiki answer for the `sls-080` question equals the
  source value at the response's own `scannedRef`." Record the exact question from `sls-080`,
  the server used, and the cadence (each drift refresh).
- Replace "Done when" with: "When the probe matches, the item is not done. The next steps are a
  pre-registered v3 plan (owner decision on G1 or the unchanged v2 rule; new blind digests; ADR
  amendment if the rule changes), independent review, then a separately authorized paid
  collection. G1 is defined in `fable-plan-v2-live-failure.md` at `6baec0a4`; fetch with
  `git fetch origin pull/102/head`."
- Add a monitor list for `sources.locate` incidents that fail only condition 3 (F8).
- Change "`sls-080` is a verified active Scout finding" to "`sls-080` is `reported-upstream`
  (Stellar-Light/stellarlight#1134)".

### E5 — `.agents/NEXT.md`, "Decide whether protocol-history routing can reopen"

Replace with the HD3 decision object: options A, B, C; the three free evidence items; the
constraint that T2 changes labels on label evidence only and never lowers the bar because
mechanisms failed; the T3 requirements for attempt budget and network budget; safe default A.

### E6 — `.agents/NEXT.md`, block 2, `sources.locate` sentence

Append: "Condition 3 of the ideas section 8 trigger requires live repository-recovery steering.
None is live, because v2 was rejected. `sources.locate` cannot trigger until a recovery
mechanism ships. Log qualifying incidents in the recovery TODO's monitor list meanwhile."

### E7 — `.agents/TODO.md`, "Monitor Friendbot network-context synthesis"

Restore: case `q-edge-send-me-free-xlm`; the answer called Friendbot Testnet-only; the transcript
made no tool call; Stellar Docs expose Testnet, Futurenet, and local Quickstart distinctions.
Keep the trigger text.

### E8 — `.agents/NEXT.md`, hygiene

- Change "PR #99 shipped the Playground limit" to "PR #99 merged the Playground limit at
  `3c7f0e5`; it is not deployed."
- Reduce "Completed blocks" to one line per block with its ledger path.
- Delete "Focused verification passed 31 tests across four files on 2026-08-31" or name the
  command and files.
- Change "`sls-080` is verified" to "`sls-080` is `reported-upstream`".
- Add the closeout fetch recipe (F10) to
  `.agents/rounds/2026-08-31-rejected-experiments-closeout.md`, and record that the local
  Method 1 and recovery artifacts were not found on 2026-09-01.

## 8. Residual uncertainty

- The live production Worker Version id. This audit made no live fetch. The queue's
  `6282fe2a…` claim and the `main` divergence are both from the repository only.
- The open or closed state of Stellar-Light/stellarlight#1031 and #1134, and of
  stellar/stellar-docs#2805.
- Whether GitHub still holds `refs/pull/102/head` and `refs/pull/103/head` for the snapshot
  commits `6baec0a4` and `fb9a35eb`.
- Whether the Method 1 artifact or the recovery v2 artifacts exist on another machine or path.
  They were not found in the main checkout, `~/.cache/stellar-raven`, `~/.herdr/worktrees`, or
  `~/.local/share`.
- Whether the attempt-one retained cache still exists. `~/.cache/stellar-raven/eval-results/`
  holds attempt two and attempt three only.
- Whether the judge-facing content of the same-100 cases changed after 2026-08-30 through
  PR #100. If it did, the 2026-08-30 artifact is also not content-identical to the current
  battery, which further limits its reuse.
- Whether the "small fixes" listed as open in the 2026-08-31 routing-next closeout were later
  closed. The current queue does not name them.
- The true per-ID candidate-only T4 rate under rubric `v2.10`. The `64.079%` figure uses the
  validator's assumed `1%`, not a measured rate.

## 9. Answers to the brief's questions

1. Omissions: the deploy decision (F4); the paired-pair and recalibration debt (F3); the harness
   environment-pin gap (F6); the Friendbot signature (F9); the `sources.locate` double gate
   (F8); the durable record of two rejected rounds (F10).
2. Completed work kept active: none incorrectly. The reverse happened once: the paired TODO was
   deleted before its done condition was met (F3). The "Completed blocks" section is hygiene
   (F11).
3. Prerequisites, permitted, forbidden, gate: block 3 states all four. Block 1 states none of
   the first three and a partial gate (F1). Block 2 states the forbidden action and a wrong
   completion condition (F5). The owner decisions state no evidence lists (F2, F7).
4. Raven design constraints: not enough (F1). The surface owner, the no-tool-answer constraint,
   the "not prose" trigger, the trap and control ids, and the leakage rule are missing.
5. Focused diagnostic versus headline: the order is right. The block omits that the diagnostic
   is itself paid and needs its own bounded authorization, and that a free offline step comes
   first.
6. Evidence before a stronger mechanism ships: a free prevalence result across stored answers
   or a second contract mismatch; a prose-surface inventory for the chosen surface; a reviewed
   pre-registration with the product gate; a focused diagnostic whose environment hash matches
   the pre-registered value and whose trap passes five-track T3 on every vote while the control
   stays supported; if the surface is production, a separately authorized sample-30 forced-panel
   headline with plan regrade and no per-ID regression beyond noise, and the routing gate if any
   catalog text changed; independent review of plan and result; no golden edit.
7. Paired decision object: incorrect as posed (F2). The binding constraints are the denominator
   design and the candidate-only rule, not the margin.
8. Artifacts still blocking promotion: the owner design decisions (HD2); two complete,
   comparable `qa-agent-result-v4` and `qa-five-track-v1` same-100 artifacts under one
   `claude-sonnet-5` / `v2.10` / `p5` tuple with one pinned register, one environment hash, one
   agent binary, one implementation hash, and at least 100 eligible IDs after union exclusions;
   a passing `paired:validate -- --recalibrate`; a round-ledger promotion decision; independent
   review of that decision.
9. Trigger-only after three attempts: yes. Three distinct classes failed. The reachability audit
   shows 17 of 19 positives carry catalog-absent tokens and seven controls carry rare target
   tokens. Every recall gain flooded controls (10 of 11 with 7 of 9). A fourth catalog-text
   mechanism is predicted to fail for the same structural reason. The remaining paths are
   upstream (T1), non-card evidence (T3), or product impact (T4), and all need an owner.
10. T1 to T4: T1 and T4 are measurable with small definition gaps (F13). T3 is well
    pre-registered but lacks an attempt budget and a budget authority. T2 is the one path that
    can change the frozen table and lacks its evidence bar (F7). The section 8 acceptance table
    is unchanged across attempts and T3 reuses it, which resists post-hoc change.
11. Sequencing: recovery precedes ranking (ADR-0008) and precedes `sources.locate` (ideas
    section 8 condition 3); the queue does not say the second (F8). The recovery unblock is
    fragile (F5). Friendbot and token-prefix monitors are sequenced correctly; Friendbot lacks
    a signature (F9). Upstream watches are consistent: retired findings get a TODO watch; active
    findings carry their own follow-up.
12. Human product judgment: HD1, HD3, HD4, HD5(b), HD6, HD7. Human spend authorization: HD2
    (P3), B3, B4, V2, R3. Independent model review: every brief and every result at stages 1
    and 4. Mechanical checks: routing gate, validator, env and binary and surface pins, lint,
    register check, probe match.
13. Weak evidence: the Method 1 result (pin mismatch; artifact not found); the margin table
    (mixed-tuple; labeled); "57 of 100 unstable" (combines collection and re-judge movement;
    labeled); the recovery v2 numbers (local artifacts not found; hashes only); the production
    version claim (undated relative to `main`); "`sls-080` is verified" (wrong status word); the
    2026-08-25 ten-hit measurement (superseded by the frozen lanes); the audit-time same-100
    count in F7 (illustrative only).
14. Block-by-block plan: section 5 ladders plus section 6 map. Order: E1 to E8 edits; harness
    env-pin flag; README record; the three free evidence items; then HD1 to HD7 in that order.
    Every paid step needs a fresh, method-specific authorization.
15. Exact edits: section 7.
