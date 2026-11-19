# Item 8.12 `sweep` — Challenge of Codex Sol Review

Reviewer: Codex `gpt-6.2-sol` (high effort, read-only, reviewed `origin/main...HEAD` at `142282cc`).
Review record: [`SOL-REVIEW.md`](SOL-REVIEW.md).

## Summary of Verdicts

| Class | Count | Findings |
|---|---:|---|
| **Valid** (fixed) | 4 | F2, F4, F9, F10 |
| **Invalid** (refuted) | 6 | F1, F3, F5, F6, F7, F8 |
| **Valid but not worth fixing** | 1 | F11 |
| **Total** | **11** | |

---

## Finding-by-Finding Challenge

### F1 (High) — Item 3.4 recount script and counting rules (`2026-10-12-call-pattern-triage`)
- **Claim:** `.agents/rounds/2026-11-16-next-phase/items/3.4/PLAN.md:131` instructs the reader to run `.agents/rounds/2026-10-12-call-pattern-triage/count-patterns.mjs` and apply exclusions from `.agents/rounds/2026-10-12-call-pattern-triage.md:105-108`; deleting both breaks the recount command.
- **Verdict:** **Invalid.**
- **Evidence:** `.agents/rounds/2026-11-16-next-phase.md:30` records item 3.4 ("`execute` boundary read (M2)") as already completed and merged in PR #464: the recount already ran (`data.sections` misreads 0/26 and 0/19, `.data` omissions 0, failed calls with an omitted reason 0/4 and 0/8), the M2 boundary question closed ("the boundary stays 6,000"), and `.agents/TODO.md` was reduced to the Grok-clip bound. Reference check (`rg --hidden -g '!.git' 2026-10-12-call-pattern-triage`) confirms zero citations from `.agents/TODO.md` or any current artifact. Under `.agents/README.md` Retention, a link from a finished item's historical plan does not keep a prior finished round alive.

### F2 (High) — SD-059 probe input list (`responsefield-files.txt`)
- **Claim:** Open finding `improvements/stellar-docs/sd-059-responsefield-text-unsearchable.md:9` cites `rf-rank.mjs`, whose line 7 reads `process.argv[2]`, and the sweep deleted `.agents/rounds/2026-11-02-mintlify-migration/responsefield-files.txt` (the saved 93-file input list).
- **Verdict:** **Valid.**
- **Evidence:** Confirmed by reading `improvements/stellar-docs/sd-059-responsefield-text-unsearchable.md:9` (status `reported-upstream`, cites `responsefield-rank.json (script rf-rank.mjs)` for the 93 `<ResponseField>` files) and `.agents/rounds/2026-11-02-mintlify-migration/rf-rank.mjs:3,7` (`node ... rf-rank.mjs <files.txt> <out.json>`). Without `responsefield-files.txt`, repeating the exact 93-file probe from the checkout fails.
- **Action taken:** Restored `.agents/rounds/2026-11-02-mintlify-migration/responsefield-files.txt` from `origin/main` and recorded it as `keep` (rule K5) in `CANDIDATES.md`.

### F3 (Medium) — Item 3.3 prior prefix-floor measurement (`2026-10-02-routing-adapter-repairs/lane-c-report.md`, `evidence/prefix-vendor.ts`)
- **Claim:** `.agents/rounds/2026-11-16-next-phase/items/3.3/PLAN.md:53` and `REVIEW.md:93` cite `lane-c-report.md`, its review, and `evidence/prefix-vendor.ts`.
- **Verdict:** **Invalid.**
- **Evidence:** `.agents/rounds/2026-11-16-next-phase.md:29` records item 3.3 ("ranker mechanisms") as already completed and merged in PR #463 ("Both mechanisms measured once each, alone, and dropped; nothing ships"). Reference check confirms zero current artifacts cite `lane-c-report.md` or `evidence/prefix-vendor.ts` (while `lane-a-report.md` and `review-lane-a-grok.md`, cited by `eval/gates.json:55`, are retained). Under `.agents/README.md` Retention, a completed item's historical plan/review is not a current consumer.

### F4 (Medium) — Dangling `evidenceRefs` in `research/skill-exposure-inventory.json` (`research/retired-skill-guidance.md`)
- **Claim:** `research/skill-exposure-inventory.json:174` and `:224` reference `research/retired-skill-guidance.md`, which was deleted; `test/skill-exposure-classification.test.ts:157` only checks ref portability so tests did not catch the missing path.
- **Verdict:** **Valid.**
- **Evidence:** Confirmed by reading `research/skill-exposure-inventory.json:172-178,221-226` (both `lumenloop-mcp-connect` and `lumenloop-api-connect` list `"research/retired-skill-guidance.md"` in `evidenceRefs`) and `test/skill-exposure-classification.test.ts:20,157` + `ecosystem-skills/README.md:146,164` (live test-enforced inventory). Verified every other file path in `research/skill-exposure-inventory.json`'s `evidenceRefs` exists on disk.
- **Action taken:** Restored `research/retired-skill-guidance.md` (1,548 B) from `origin/main` and updated `CANDIDATES.md` to `keep` (rule K1).

### F5 (Medium) — Playground worked example and `2026-11-03-playground-model-recheck.md`
- **Claim:** `eval/EVALS.md:136` points to `research/audits/2026-11-10-playground-gpt61-terra-recheck.md`, which at line 5 links `2026-11-03-playground-model-recheck.md` for the switch rule; `research/demo-playground-design.md:97` also links it.
- **Verdict:** **Invalid.**
- **Evidence:** Read `eval/EVALS.md:136` (cites `2026-11-10-playground-gpt61-terra-recheck.md` strictly as the cost-sizing worked example: "Two invocations: gauntlet 1, E1 on 30 cases 6; expected total USD 3.75") and `research/audits/2026-11-10-playground-gpt61-terra-recheck.md:4-7` (states the switch rule in full inline: "it passes the gauntlet on the installed SDK and is not worse than the primary on the paired 30-case semantic check (no new wrong answers, no tool-loop regressions)"). `research/demo-playground-design.md` is itself a historical research doc cited via commit-pinned GitHub blob URLs in two `ideas/` notes and summarizes the November 3 result inline. No current artifact cites `2026-11-03-playground-model-recheck.md` or needs it to interpret `2026-11-10-playground-gpt61-terra-recheck.md`; `.agents/README.md` Retention explicitly states that a link from another historical record is not a retention need.

### F6 (Medium) — Open p9 TODO and intermediate p9 measurement files
- **Claim:** `.agents/TODO.md:1057` cites `rounds/2026-10-12-pack-p9/result-p9.md`, whose lines 4–7 link the deleted `measurement-plan-p9.md`, `rejudge-artifacts-p9.json`, `rejudge-summary-p9.json`, and `analyze-rejudge-p9.mjs`.
- **Verdict:** **Invalid.**
- **Evidence:** Read `.agents/TODO.md:1055-1070`: the TODO item cites `result-p9.md` for the known p9 claim-support limits summarized directly in `result-p9.md` (and `eval/qa/README.md:549` cites `replay-p9.mjs`, whose runtime import `inputs.mjs` and JSON inputs are retained). `measurement-plan-p9.md`, `rejudge-artifacts-p9.json`, `rejudge-summary-p9.json`, and `analyze-rejudge-p9.mjs` are historical intermediate plans, raw run outputs, and one-off scripts linked only from `result-p9.md` — exactly the class `.agents/README.md` Retention directs to delete after reconciliation.

### F7 (Medium) — Other open TODO evidence and linked intermediate plans/reviews
- **Claim:** Retained files reachable from `.agents/TODO.md` (`2026-11-02-routing-repair.md:8,62`, `answer-style/result-v2.md:9`, `research/audits/2026-11-14-caps-audit.md:404`) link to deleted supporting plans, lane reports, and reviews (`2026-11-02-routing-repair/{contract,report-rt-c}.md`, `answer-style/{measurement-plan-v2,measurement-ledger}.md`, `2026-11-14-caps-audit-review.md`).
- **Verdict:** **Invalid.**
- **Evidence:** Read all three retained files at the cited lines:
  - `research/audits/2026-11-14-caps-audit.md:404-430` records B1 and N1–N6 inline, and B1 already landed in `test/helpers/mcp-tool-metadata.ts`, `test/mcp-instructions.test.ts`, and `ARCHITECTURE.md`; `2026-11-14-caps-audit-review.md` is an intermediate PR review.
  - `.agents/rounds/2026-10-10-weekend/answer-style/result-v2.md` embeds the full run table, stamps, SHAs, per-slice verdicts, and residual risk inline; `.agents/TODO.md:659` cites only `result-v2.md`.
  - `.agents/rounds/2026-11-02-routing-repair.md` embeds the complete Round 1 and Round 2 result tables and findings inline; `.agents/TODO.md:532` cites only `2026-11-02-routing-repair.md`.
  Retaining intermediate plans, lane reports, and PR reviews because a retained historical summary links them directly contradicts `.agents/README.md` Retention ("A link from another historical record is not such a need. Delete other briefs, intermediate reviews, raw outputs, and finished ledgers after reconciliation.").

### F8 (Medium) — SLS-097 retirement receipt and `docs-sls097/validation.json`
- **Claim:** `improvements/resolved.json:4061` cites `sls097-author.md`, whose line 50 mentions `validation.json` for negative-control evidence.
- **Verdict:** **Invalid.**
- **Evidence:** Read `.agents/rounds/2026-11-06-remaining-sweep/sls097-author.md:39-70`: the report already contains the complete 6-row fixture input/result table (lines 41–48) AND a complete standalone 16-line reproduction command from the repo root (lines 52–70). Line 50 does not even link `research/audits/2026-11-06-remaining-sweep/docs-sls097/validation.json` (it names raw output of `tmp/sweep-2026-11-06/docs/sls097/validate.mjs`), and `improvements/resolved.json:4061` cites only `sls097-author.md` and `cross-review.md` (both retained).

### F9 (Medium) — Unrelated run summaries retained under `research/gauntlets/`
- **Claim:** `CANDIDATES.md` kept all 12 files in `research/gauntlets/` via `scripts/run-demo-model-gauntlet.mjs:53` (`anthropic/claude-sonnet-5.5` and `xai/grok-4.7` routed in the 2026-11-03 sweep), retaining unrelated run summaries such as `2026-11-03-sweep-stage1b-astra2-summary.md` and `2026-11-03-sweep-stage1c-muse-summary.md`.
- **Verdict:** **Valid.**
- **Evidence:** Grepping all 12 files in `research/gauntlets/` confirmed only 4 files contain `claude-sonnet-5.5`, `grok-4.7`, `gpt-6.1-terra`, or `claude-haiku-5.5` (`2026-11-03-sweep-probe-summary.md`, `2026-11-03-sweep-stage1-summary.md`, `2026-11-03-sweep-stage1b-grok1-summary.md`, `2026-11-03-sweep-stage1b-grok2-summary.md`). The other 8 files (`probe-gemini-passthrough`, `stage1-low`, `stage1b-astra1`, `stage1b-astra2`, `stage1b-deepseek`, `stage1b-six`, `stage1c-astra`, `stage1c-muse`) are uncited partial-run summaries for other models (Astra, DeepSeek, Muse, Gemini, etc.).
- **Action taken:** Deleted those 8 uncited summaries with `git rm` while keeping the 4 relevant summaries and the `research/gauntlets/` directory, and updated `CANDIDATES.md`.

### F10 (Medium) — Retained ledgers omitting their consumers from `## Outcome`
- **Claim:** `.agents/rounds/2026-08-28-human-review-grill.md:144` (`## Outcome`) does not name `ADR-0008`, and retained ledgers `.agents/rounds/2026-11-02-mintlify-migration.md` and `.agents/rounds/2026-11-02-routing-repair.md` lack `## Outcome` naming their current consumers.
- **Verdict:** **Valid.**
- **Evidence:** Confirmed by reading `.agents/rounds/2026-08-28-human-review-grill.md:144-149` (names `.agents/TODO.md` and archived `NEXT.md`, omits `ADR-0008`), `.agents/rounds/2026-08-28-eval-block2.md:83-100` (omits `eval/qa/reviewed/`), `.agents/rounds/2026-11-02-mintlify-migration.md` (no `## Outcome`), and `.agents/rounds/2026-11-02-routing-repair.md` (no `## Outcome`).
- **Action taken:** Appended one-line `Retained for:` consumer notes (without rewriting historical prose) to `## Outcome` in all four ledgers.

### F11 (Low) — `eval/qa/case-text-baseline.json` scope exception
- **Claim:** `eval/qa/case-text-baseline.json` is outside `research/` and `.agents/rounds/`; the edit is needed by the stale-entry check after deleting `review-lct-fable.md` and triggers the conditional QA lint gate.
- **Verdict:** **Valid but not worth fixing.**
- **Evidence:** `test/case-text-scan.test.mjs:89` fails `npm test` if a deleted file remains in `eval/qa/case-text-baseline.json` ("listed in the baseline but absent or clean; remove the entry"), and the lane brief explicitly provides for the conditional gate ("`npm run eval:qa:lint -- --stale --enforce-floors` if anything under `eval/` is touched"). All three `eval/` gates (`eval:selftest`, `eval:qa:lint -- --stale --enforce-floors`, `eval:qa:register -- --check`) were run and passed with exit 0. No code change needed.
