# Pre-spend review — paid QA diagnostic (Algolia vs Mintlify)

Reviewer: Claude Fable 5.1 (independent; not the brief's author). Date: 2026-11-02.
Reviewed: `qa-brief.md` (untracked draft), the round ledger, `run-evals` pre-spend rules,
`eval/qa/README.md`, `eval/qa/run-qa.mjs`, `scripts/run-eval-server.mjs`,
`eval/lib/bound-server-identity.mjs`, `eval/lib/mcp-surface.mjs`, `eval/qa/judge-stability.mjs`,
`retrieval-ab-results.json`, `eval/qa/cases.json`, and `git diff 03c863a3..HEAD`.
No paid command, server, commit, or edit outside this file.

## Findings

1. **Major — judge tiering is not identical across arms unless the stability register is pinned.**
   Evidence: `eval/qa/run-qa.mjs:515-552` (`prepareJudgeStabilityRegister`). Without
   `--stability-register`, the runner regenerates `eval/qa/judge-stability.json` from
   `eval/qa/results/` when that directory exists. The candidate worktree has no `eval/qa/results/`
   today, so arm A runs with register status `absent` and takes the boundary-panel path (README
   lines 378-393: up to `--max-panel-cases`, default 10 for 30 rows). Arm A then writes its
   artifact to `eval/qa/results/`. Arm B regenerates the register from that one artifact;
   `calculateCaseStability` (`eval/qa/judge-stability.mjs:62-83`) gives every arm-A row
   `sampleCount 1`, `comparisonCount 0`, `stabilityScore 1`. Arm B therefore has "usable history"
   for all 30 rows and escalates no panel. The brief's claim "judge, rubric, and pack are identical
   across arms" (qa-brief.md:22-24) is false for tiering. README line 395 already states the rule:
   freeze one register and pass the same `--stability-register <file>` in all arms.
   Fix: before arm A, produce one register file outside the worktree (from the main checkout's
   `eval/qa/results/`, 359 artifacts, or an explicitly empty policy), record its sha256 in the
   ledger, and pass the same `--stability-register <abs path>` to both arms. Add
   `--max-panel-cases` explicitly (same value both arms) so the panel cap is predeclared.

2. **Major — the runner worktree must be committed and frozen for the whole run, and other lanes
   must not touch it.** Evidence: `run-qa.mjs:668-676` (`assertCollectionSourceIdentity` requires
   `runnerDirty === false`) and `run-qa.mjs:698-712` (`git status --untracked-files=all`; only
   `eval/qa/judge-stability.json` is excused). `scripts/run-eval-server.mjs:18-21` refuses a dirty
   server worktree. The postflight `sourceIdentityGuard` compares the runner identity after
   collection, so any commit, edit, or new untracked file in `raven-mintlify-1102` during either arm
   invalidates that arm. Today the worktree holds the untracked `qa-brief.md`, and this review adds
   a second untracked file. Three other lanes (`lane-prose`, `lane-qa-identity`, `lane-scripts`)
   are active in this session; if any writes into this worktree during collection, the arm fails
   after spend. The brief does not state this freeze.
   Fix: commit the brief and this review first; record `git rev-parse HEAD` in the ledger as both
   the runner revision and the arm B server revision; state in the brief that no lane edits or
   commits in `raven-mintlify-1102` until arm B's postflight has passed. Results and the register
   are gitignored (`.gitignore:36,52`), so the runner's own outputs do not dirty the tree.

3. **Minor — one runner for two server revisions is valid; record the full SHA.**
   `assertPinnedServerRevision` (`run-qa.mjs:649-665`) only resolves the SHA as a commit in the
   runner's repo; `03c863a3` is an ancestor of HEAD, so it resolves. `boundServerIdentity`
   (`eval/lib/bound-server-identity.mjs:49-91`) checks the listener process cwd is a clean worktree
   at that revision; `/private/tmp/claude-501/raven-mintlify-base` is at `03c863a3`, clean, has
   `dev:eval`, `scripts/run-eval-server.mjs`, and a `.dev.vars` with the `ALGOLIA_*_DOCS` names.
   `assertExpectedSourceRevision` (`eval/lib/mcp-surface.mjs:144-158`) reads the revision the
   launcher compiles into `serverInfo.sourceRevision`, so arm A's Worker reports `03c863a3…`.
   Nothing requires runner revision == server revision. The flag needs the 40-character form:
   `03c863a3e30e20d0e8bb44b272f9e3c06235fdaf`. Fix: write the full SHA in the brief and the
   launch line.

4. **Minor — arm A's artifact will carry the candidate's manifest hash.** `sourceIdentity`
   (`run-qa.mjs:698-735`) records `manifestFileSha256` and the QA implementation hashes from the
   runner worktree, not from the server. Arm A's artifact therefore shows the Mintlify manifest hash
   while its server served the Algolia manifest. The live `surfacePin` and `serverInfo` are the true
   per-arm identity. Fix: note in the ledger that `meta.manifestFileSha256` is runner-side and
   identical in both artifacts; identify arms by `surfacePin.actual` and
   `serverInfo.sourceRevision`.

5. **Minor — port mismatch.** The runner default is 8788 (`run-qa.mjs:1740`); the brief uses 8787.
   Pass `--port 8787` on both runner invocations, or run `dev:eval` on 8788. No process listens on
   8787 or 8788 right now (lsof check), so the "one Wrangler process" rule holds at launch.

6. **Minor — budget evidence is incomplete and the cap sits under the stored p90.** Stored runs in
   the main checkout (`eval/qa/results/`, `meta.totalCostUsd`), sonnet answer + sonnet judge:
   all-run per-case median $0.63, p90 $0.88, max $1.07; the twelve ~30-row runs (2026-08-18)
   $0.49–$0.77; the three 100-row runs under `stability-boundary-v1` (2026-08-28/30) $0.32–$0.41.
   The brief quotes only the 100-row band and the all-run median. At p90, 30 rows cost $26.5,
   above the $25 cap, so the ledger could stop the judge phase at about row 28 and leave an
   incomplete arm with no re-run (brief rule 5). The cap itself is enforceable as written
   (`--max-budget-usd` is a total method cap, README lines 134-142).
   Fix: quote the 30-row band and p90 in the brief. Either raise each cap to $30 ($60 total) with
   the same "no re-run" rule, or state that an arm stopped by the cap is accepted as incomplete.
   Expected spend stays $12–$22 per arm.

7. **Minor — two selected goldens are past `reverifyBy`.** `q-zk-verification-resource-budget`
   (upside) and `q-mpp-discovery-and-modes` (control) expired 2026-11-01. `run-qa.mjs` does not
   exclude expired cases (only `eval:qa:lint -- --stale` checks them; `compile-qa.mjs:138-141`).
   Fix: keep them, but predeclare in the reading rules that any `wrong` or cross-arm difference on
   these two rows is checked against the live source first, and that a stale golden is a corpus
   finding, not a backend finding.

8. **Minor — selection reproduces exactly; note the tie slice.** Recomputed from
   `retrieval-ab-results.json` (generated 2026-11-02T14:50Z, 255 active rows, 3 changed-gospel
   cases excluded): downside = all 8 rows with A > B; upside = 25 rows tie at delta 1.0, and the
   12 named are the first 12 by sha256(id); control = first 10 of 172 ties by sha256(id). All 30
   are present and `status: confirmed` in the candidate `cases.json`; their bytes are identical at
   `03c863a3`. The upside slice is all A=0/B=1 rows, so arm A can still answer from skills, Scout,
   or Lumenloop; "B ≥ A" is a retrieval hypothesis, not a guaranteed answer gain. Two control rows
   (`q-stellar-recurring-payments`, `q-mpp-discovery-and-modes`) have A=B=0 docs recall and test
   non-docs stability only. Fix: state in the brief that the upside slice is a sha256 slice of 25
   equal-delta rows and that A=0 means "no golden page hit", not "no answer".

9. **Minor — attribution claim holds, with one wording fix.** Manifest entries at `03c863a3` vs
   HEAD differ only in the 13 `stellarDocs` entries (12 ops rewritten, `get_doc_page_sections`
   removed, `get_doc_page` added); `generatedAt` is the only other change. `src/mcp/micro-map.ts`
   changes only the archetype step name (two occurrences). `src/search`, `src/executor`
   (comment only), `ecosystem-skills/`, and all Scout/Lumenloop entries are byte-identical.
   `eval/qa/cases.json` differs only in the three excluded cases. `src/policy/redact.ts` swaps
   secret names (no effect on these rows). Fix: say "the stellarDocs backend, its 12 manifest
   entries, and the two micro-map archetype steps" rather than "only the backend and its surface".

10. **Minor — the remote identity guard does not cover arm A's docs backend.** The HEAD probe
    (`eval/qa/probe-remote-identities.mjs`, README lines 100-111) hashes Mintlify `llms.txt` and
    `llms-full.txt`; nothing observes the Algolia DocSearch index during arm A. The research note
    says the crawler stopped on 2026-10-22 and the index still serves; the retrieval A/B at 14:50Z
    today saw 0 Algolia errors. Fix: before spend, run one free `search_docs` call against arm A's
    server (no model) and record the hit count; state in the ledger that arm A's Algolia identity is
    unguarded. Note that a Mintlify docs deploy during arm A still stops arm A (same expected vector
    for both arms); this is correct for comparability and is already covered by brief rule 5.

11. **Minor — environment pin coverage.** `eval/lib/executable-identity.mjs:7` hashes names
    matching `ANTHROPIC_*`, `CLAUDE_*`, `RAVEN_CLAUDE_*`, and `QA_AGENT_PROMPT_APPEND`. Assert in
    the launch shell that `QA_AGENT_PROMPT_APPEND` and `QA_MAX_PANEL_CASES` are unset before
    hashing, and compute `AGENT_ENVIRONMENT_SHA256` after `DISABLE_AUTOUPDATER=1` and the PATH
    change, in the same shell that runs both arms. The brief lists the pins but not this order.

12. **Minor — stale evidence strings are harmless.** `q-soroban-deploy-cli` and
    `q-ti-compute-token-lp-market-data` mention `get_doc_page_sections` only in dated
    `truth.evidence` strings, not in golden text, key facts, or avoid clauses. No judge input
    names Algolia hit fields. No fix needed; recorded so the per-row review does not re-check it.

## Checks that passed

- The round's independent review is scheduled as mandatory (brief "Mandatory follow-ups").
- The diagnostic claim is explicit; no paired PASS/FAIL below the 100-ID minimum.
- Pin order is correct: stable probe (three captures, five minutes apart) before arm A, then
  surface and revision pins per arm from `node eval/report-live-surface.mjs`.
- `--ids` with 30 unique IDs passes `assertRunPlan`; one Claude version `2.1.316` exists under
  `~/.local/share/claude/versions/`.
- Single-sample judge noise is bounded as variance, never as a significance threshold.

## Verdict

APPROVE WITH CHANGES. Required before spend: findings 1 and 2. Recommended in the same edit:
findings 3, 5, 6, 7, 8, 9, 10, 11.
