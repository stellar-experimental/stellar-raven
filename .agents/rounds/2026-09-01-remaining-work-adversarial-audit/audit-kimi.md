# Remaining-work adversarial audit — Kimi K3 report — 2026-09-01

Scope: read-only independent audit of `.agents/NEXT.md` and `.agents/TODO.md` against the brief.
All required sources were read. No other auditor report was read. No other file was edited.
Question numbers (Q1–Q15) cite the brief's question list.

## 1. Runtime

- Model: Kimi K3 (`moonshotai/kimi-k3`).
- Provider / CLI: OpenRouter through OpenCode.
- Requested effort: variant `max`.
- Observed effort: not independently observable from inside the session. The requested variant
  `max` is recorded from the assignment text.

## 2. Verdict

`PASS-WITH-FIXES`.

The queue describes every remaining work block, decision, trigger, gate, and completion condition
well enough for a new agent or the owner to proceed. The three ranked blocks match the dated
ledgers. Completed work is correctly removed from the active queue (Q2). Seven repairs remove one
live retired-tracker route, one missing committed eval record, one unwired monitor, and four stale
or imprecise labels. None of the seven blocks a correctly authorized run today. F1 can misroute
future own-repo work if an agent follows the stale charter.

## 3. Findings

### F1 (Medium) — `improvements/README.md` routes own-repo work to retired Solo

- Source: `improvements/README.md` line 54 (`Solo todo/comment ref` in the record template) and
  lines 78–81 (own-repo fixes "go to Solo todos instead").
- Problem: these are live instructions, not dated records. `AGENTS.md` retired Solo on 2026-08-25
  and forbids a Solo todo as a live path. `.agents/README.md` routes own-repo fixes to `TODO.md`.
- Consequence: an agent that follows the charter files own-repo work into a retired tracker. The
  work becomes invisible to the queue, to CI, and to the next agent.
- Repair: replace the Solo route with `.agents/TODO.md`. Replace the template's
  `Solo todo/comment ref` with a queue or round-ledger ref. (Q13, Q15)

### F2 (Medium) — the first five-track same-100 paid artifact has no committed lane record

- Source: `eval/qa/README.md` (no entry for `2026-08-30T03-43-11-variantA.json`);
  `.agents/rounds/2026-08-29-five-track-same-100.md` (no README step anywhere in the ledger);
  `.agents/skills/run-evals/SKILL.md` Step 7.
- Problem: run-evals Step 7 requires the lane README to carry the stamped results and reading
  notes. The 2026-08-30 run spent `$40.9579502` and closed as `VALID WITH A T4 EXCEPTION`. The
  README cites only its cost figures in the judge-tier section. The exact stamp, the T1–T5 table,
  and the round decision are absent from every committed eval document.
- Consequence: the committed record of a paid round is incomplete. The full record exists only in
  a gitignored local JSON and in queue prose. A future auditor cannot reconstruct the round from
  committed files.
- Repair: add a stamped results section to `eval/qa/README.md`, or record an explicit dated
  decision that the judge-tier cost note is sufficient. Track the gap in `.agents/TODO.md` until
  closed. (Q1, Q14)

### F3 (Medium) — the sls-080 unblock probe has no cadence, owner, or wiring

- Source: `.agents/TODO.md` recovery item ("Done when: a free Horizon probe returns `28`");
  `improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md` (no `probe`
  frontmatter); `scripts/improvements-run-probes.mjs` (`AUTH_PROBE_HOSTS` allows only Lumenloop).
- Problem: no registered probe exists for the unblock condition. No cadence or owner is named.
  The last probe ran ad hoc on 2026-08-31 against a local server.
- Consequence: the unblock condition can go stale unnoticed. The paid recovery collection stays
  blocked past its evidence, or an agent re-probes on an unknown schedule and records nothing.
- Repair: name the cadence (each improvements round or each drift refresh) and record each probe
  result in the sls-080 `recurrences`. Alternatively wire a Scout-capable probe into
  `improvements:probes`. (Q11, Q15)

### F4 (Low) — stale sls-080 status label in the queue

- Source: `.agents/NEXT.md` line 14 ("`sls-080` is verified"); `.agents/TODO.md` line 30
  ("verified active Scout finding"); the finding file frontmatter (`status: reported-upstream`).
- Problem: the finding was filed as Stellar-Light/stellarlight#1134 on 2026-08-31. The queue
  still says `verified`.
- Consequence: minor. A new agent can misjudge the lifecycle stage or re-file the finding.
- Repair: state `reported-upstream` with the issue ref in both files. (Q13, Q15)

### F5 (Low) — "69 active findings" counts terminal states

- Source: `.agents/NEXT.md` line 12; `improvements/INDEX.md` ("Total findings: 69"); finding
  frontmatters; `improvements/resolved.json`.
- Problem: the 69 includes 3 `fixed-upstream` (sd-001, sd-036, sk-020) and 3 `declined-upstream`
  (sd-004, sd-009, sls-039). The three fixed findings are not in `resolved.json`. Per
  `improvements/README.md` they are short-lived deletion candidates that need an independent
  re-check and a receipt.
- Consequence: the count overstates the active queue. The retirement debt is invisible to the
  queue.
- Repair: state "69 indexed; 63 active; 3 fixed-upstream awaiting retirement". Add the retirement
  to the improvements backlog or to the pipeline cadence. (Q1, Q13)

### F6 (Low) — the paired-TODO deletion superseded a recorded disposition without a note

- Source: `.agents/rounds/2026-08-29-paired-verdict.md` finding M5 ("The paired TODO remains open
  until a pinned pair and owner decision exist"); PR #98 (`b53f62d`) deleted the item.
- Problem: no ledger records why the item left the queue. The substance survives in `NEXT.md`
  (the owner margin decision and "Promotion also needs one same-tuple pinned pair").
- Consequence: an auditor reading M5 cannot find its disposition.
- Repair: one sentence in the `NEXT.md` owner-decision section. State that the paired TODO folded
  into the margin decision and the pinned-pair prerequisite. (Q8, Q15)

### F7 (Low) — the "301 files" `solo://` count is battery-scoped but reads repo-wide

- Source: `.agents/NEXT.md` line 42; `.agents/rounds/2026-08-31-golden-metadata-remainder.md`
  line 35 (scope: `eval/qa/corpus/battery`).
- Problem: the battery count is 301 at HEAD (`git grep -l "solo://" HEAD --
  eval/qa/corpus/battery`). The repo-wide tracked count is 339.
- Consequence: a reader who verifies repo-wide gets a different number and may file a false drift
  report.
- Repair: write "301 battery files". (Q13, Q15)

### Verified adequate — no repair

- Q2 (completed work kept active): none found. Git history confirms the deletions: five-track
  implementation, judge-contradiction engine, and paired method (PR #98); five golden candidates
  (PR #106); judge-stability TODO (PR #108, done-when met by the stable 57 count); playground
  limit (PR #99). The "Completed blocks" section in `NEXT.md` matches PRs #100 and #106.
- Q3 (block structure): each active block states its prerequisites, permitted actions, forbidden
  actions, and completion gate. Block 1 forbids shipping the rejected prompt change and running
  Method 2. Block 2 forbids a paid collection until the probe returns `28`. Block 3 forbids a
  fourth attempt. Monitors forbid acting on single-case evidence. The only structural gap is the
  F3 cadence.
- Q4 (capability-boundary design constraints): process constraints are complete — stronger
  mechanism, new pre-registered diagnostic, independent review, product gate, separate headline
  authorization. One substantive constraint is indirect: the boundary behavior itself (no
  account-scoped lookup; redirect to a wallet, exchange, anchor, or explorer) lives only in git
  history (`b53f62d`) and the PR #103 packet. Suggested edit 6 restates it in the TODO item.
- Q5 (diagnostic versus paid headline): correctly separated. The done-when orders the reviewed
  plan, then the product gate, then a separately authorized headline sample. This matches the
  run-evals pre-spend plan review and the one-headline contract.
- Q9 (trigger-only posture): correct. Three reviewed mechanisms produced three verified `FAIL`
  results. Attempt three raised blind top-five from 3/11 to 10/11 and also raised control
  captures to 2/4 and 7/9. The mechanism class trades positive capture for control flooding. The
  pre-registered box rule spends the box. Reopening only through measured or owner triggers is
  the recorded, least-expensive posture.
- Q10 (T1–T4 quality): sufficient and measurable. T1 pins two exact hashes. T2 and T3 require a
  recorded owner decision. T4 requires two unrelated live misses with transcripts. The frozen
  acceptance table resists post-hoc goal changes, and a trigger authorizes a brief only. One
  tightening is available: T4 does not define "unrelated" or "the same miss". A future brief can
  define them as "not `q-protocol-24-whisk-incident`, not each other, same absent-lane pattern".
- Q12 (task classification): section 5 classifies every task. Human product judgment: D1–D3.
  Human spend authorization: D4–D5 and any recovery v3 collection. Independent model review: the
  capability-boundary plan, any T1–T4 brief, any recovery v3 plan. Mechanical checks: routing
  gate, corpus lint, drift refresh, register refresh, `improvements:probes`, validator gates, and
  the F3 probe once scheduled.
- Q13 (weak evidence): the margin table's mixed-tuple calibration is labeled in `NEXT.md`, the
  paired ledger, and `eval/qa/README.md`. The 57-of-100 judge-stability figure is local-only
  register evidence; `NEXT.md` itself flags that the register combines collection and rejudge
  movement. The production version claim is operator evidence (section 8). The stale labels are
  F4, F5, and F7. The protocol-history live measurement is dated 2026-08-25; the three attempts
  measured offline proxies over frozen contracts, and the done-when correctly requires
  measurement on the routing eval.

## 4. Human decisions

### D1 (product judgment) — paired-QA product-loss margin

- Exact question: what is the largest acceptable product loss for `qa-paired-ordinal-ni-v1`
  promotion?
- Options: `0.05`, `0.08`, `0.10` (operating table in `NEXT.md`), or another value with a
  recorded rationale.
- Evidence needed: the product impact of a missed 5–8 point QA loss; the mixed-tuple table
  (present); the second-collection rates (91.812% / 62.454% / 32.596%). The decision must come
  from product impact, not from power alone. (Q7)
- Safe default: keep `0.08` as the no-change radius. The method stays experimental. No promotion.

### D2 (product judgment) — trigger T2, the frozen protocol-history contract

- Exact question: may a brief re-examine the frozen control set or the 19/19 positive bar?
- Options: keep the contract frozen; open a contract-change brief.
- Evidence needed: a recorded rationale in `NEXT.md`. Any change needs a new pre-registered
  acceptance table before any measurement.
- Safe default: keep frozen. (Q9, Q10)

### D3 (product judgment) — trigger T3, a new non-card evidence box

- Exact question: may a brief open a new attempt box for corpus-derived route vocabulary from the
  `scout.searchResearch` corpus?
- Options: open the box; keep it closed.
- Evidence needed: the full T3 pre-registration from brief section 16 — sample rule, network
  endpoints and byte budget, artifact schema and hashes, drift rule, flood metrics (holdout
  forbidden captures, new target captures over the 495 rows, the 76-case QA regression inventory),
  leakage test, and the same acceptance table. Independent review must pass before any fetch.
- Safe default: keep closed. (Q9, Q10)

### D4 (spend authorization) — capability-boundary headline sample

- Exact question: authorize a paid headline QA sample for the new boundary mechanism?
- Options: authorize with exactly one `--max-budget-usd`; decline.
- Evidence needed: an independently reviewed plan; a new pre-registered diagnostic; a recorded
  product-gate pass; the run-evals Step 2 pin assertions (revision, surface, agent binary,
  environment hash).
- Safe default: no spend. Method 2 of the rejected experiment remains unauthorized, and prior
  method-specific authorizations are spent. (Q5, Q6, Q12)

### D5 (spend authorization) — paired same-tuple pinned pair

- Exact question: authorize two same-100 collections under one current judge tuple with a shared
  pinned stability register?
- Options: authorize (order `$80–100`, from the observed `$40.9579502` Method 2 cost); decline.
- Evidence needed: D1 resolved first; a pre-spend reviewed brief; the recalibration command
  recorded. The 2026-08-30 artifact cannot serve: it used rubric `v2.9`, pre-dates `v2.10`, and
  has 99 eligible IDs.
- Safe default: no spend. (Q8, Q12)

## 5. Evaluation ladder

- Stage 0 — free preflight. Entry: any change. Instruments: `eval:selftest`, `eval:compile`,
  `eval:qa:compile`, `eval:qa:lint -- --stale`, `eval:routing -- --gate`. Exit: all pass.
  Authorization: none; mechanical. (Q12)
- Stage 1 — focused capability-boundary diagnostic. Entry: an independently reviewed,
  pre-registered plan; the reviewer differs from the author and the orchestrator. Instrument: the
  new diagnostic over the trap lane and its controls. Exit: the plan's stated product gate.
  Boundary: no headline spend and no production prompt change. (Q4, Q5)
- Stage 2 — paid headline measurement. Entry: a Stage 1 pass plus D4. Instrument: `run-qa.mjs`
  under the current tuple. Exit: reviewed verdicts, filed findings, and an updated lane README
  (the F2 gap shows this exit gate needs enforcement). Boundary: one `--max-budget-usd`; one
  method run per authorization; any re-run needs its own authorization. (Q5, Q6)
- Stage 3 — paired-method promotion. Entry: D1 plus D5 plus one same-tuple pinned pair.
  Instrument: `eval:qa:paired` and `eval:qa:paired:validate -- --recalibrate`. Exit: validator
  gates pass and a promotion decision is recorded in the round ledger (EVALS rule 1). Boundary:
  the method stays experimental and is never a ship gate before this stage. (Q8)

Evidence required before a stronger capability-boundary mechanism can ship (Q6): the reviewed
plan; the pre-registered diagnostic; a recorded product-gate pass; a measured before/after on the
same instrument for any prose change; a trap-lane pass without weakened T3 rules; and a separate
paid authorization for the headline sample.

Parallel evidence triggers (monitors; none authorizes spend): the sls-080 probe returning `28`
opens a separately reviewed v3 recovery plan (G1 is the pre-registered candidate). T1–T4 open a
brief only. A second Friendbot case, a contract mismatch, or trace evidence opens a prompt-repair
candidate. A second token-prefix case or a re-vendor opens a vendor-rule candidate. The
`sources.locate` §8 trigger opens a phase-zero study only. (Q11)

## 6. Block map

- Actionable now (no new authorization): the Block 1 plan stage (design plus independent review);
  the F1–F7 queue repairs. (Q14)
- Owner-blocked: D1 (margin); D2 and D3 (protocol-history reopen). (Q7, Q9)
- Evidence-triggered: recovery v3 (probe `28` or three recurring misses); `sources.locate`
  phase-zero (§8 measured trigger); Friendbot and token-prefix monitors; protocol-history T1–T4;
  paired promotion (D1 plus a pinned pair). (Q8, Q11)
- Upstream-blocked: sls-080 (Stellar-Light/stellarlight#1134); sd-047
  (stellar/stellar-docs#2805); Stellar-Light/stellarlight#1031 (maintainer owns the close; watch
  TODO stands); the T1 upstream `x-routing` card change (the drift lane watches both hashes).
- Complete (verified against git history; Q2): golden metadata remainder (PRs #100, #106, with
  `affected-case-ids.md`); five-track same-100 round (PR #98, except the F2 record gap); paired
  method and judge `v2.10` (PRs #95, #98); three routing attempts (PRs #108, #110, #111; box
  spent); rejected-experiments closeout (PR #104); judge-stability TODO (PR #108); five golden
  candidates (PR #106); playground limit (PR #99, `3c7f0e5`). No completed block remains active.

Measurable progress without reopening spent work (Q14): run the Block 1 plan gate; record D1–D3
when the owner decides; keep every monitor on its recorded threshold; repair F1–F7 in one queue
hygiene pass. Each step has a committed artifact as its checkpoint.

## 7. Suggested `.agents/` edits

1. `.agents/NEXT.md`, state at handoff: change "`sls-080` is verified" to "`sls-080` is
   `reported-upstream` (Stellar-Light/stellarlight#1134)". Change "69 active findings" to "69
   indexed findings; 63 active; 3 fixed-upstream awaiting retirement". Change "301 files carry a
   `solo://` reference" to "301 battery files carry a `solo://` reference".
2. `.agents/TODO.md`, recovery item: apply the same sls-080 status repair. Add: "Re-run the free
   Horizon probe at each improvements round or drift refresh. Record each result in the sls-080
   `recurrences`."
3. `.agents/TODO.md`, improvements backlog: add the retirement of sd-001, sd-036, and sk-020.
   Done when: a distinct reviewer re-runs each trigger, the files are deleted, and
   `resolved.json` carries the receipts.
4. `.agents/TODO.md`, eval instruments: add "Record the 2026-08-30 five-track same-100 result in
   `eval/qa/README.md`". Done when: the stamped table and the `VALID WITH A T4 EXCEPTION`
   decision are committed, or a dated decision waives the entry.
5. `.agents/NEXT.md`, owner decisions: add one sentence stating that the deleted paired TODO
   folded into the margin decision and the pinned-pair prerequisite (F6).
6. `.agents/TODO.md`, capability-boundary item: add one line restating the boundary behavior —
   Raven has no account-scoped lookup; the answer redirects to a wallet, exchange, anchor, or
   explorer without offering a follow-up lookup. This removes the dependence on PR #103
   archaeology. (Q4)
7. `improvements/README.md` (outside `.agents/`, required by F1): replace the Solo route with
   `.agents/TODO.md`; replace the template's `Solo todo/comment ref` with a queue or ledger ref.

## 8. Residual uncertainty

- The production Worker Version ID `6282fe2a-54d8-471e-9f0a-0a2565110af1` and the 2026-08-28
  deployment claim are operator evidence. This audit cannot verify them from the repository, and
  the brief authorizes no live fetch.
- Whether the F2 README gap was a deliberate reviewer choice. No record exists either way.
- Whether DeepWiki now returns `28`. The last probe is dated 2026-08-31T01:42:10.098Z. This audit
  ran no probe.
- Whether the live `search` tool still fails to surface `scout.searchResearch`. The last live
  measurement is 2026-08-25. The three attempts measured offline proxies over frozen contracts.
- Whether sd-001, sd-036, and sk-020 still hold as fixed. Their independent retirement re-checks
  are pending by design.
- The observed effort of this runtime. Self-report only.
