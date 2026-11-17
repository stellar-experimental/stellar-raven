# Item 3.1 EXEC: Sonnet execution (2026-11-17)

Executor: Claude Sonnet 5.5, in the lead's worktree `np-3.1` (branch `np/3.1-production-read`).
Lead: Claude Opus 5.5, agentpc `t1s6`. No production figure appears in this file. The figures are in
`/home/tyler/code/raven-wt/np-3.1/tmp/3.1/FIGURES.md` (ignored, mode 0600) for the owner's private
evidence folder; `tmp/3.1/summary.json` and `tmp/3.1/summarise.mjs` produced them.

## What I did

- **Part A (read-only).** D1 `SELECT`s over W30 (2026-10-18 to 2026-11-17 UTC), GraphQL
  `workersInvocationsAdaptive` over the same 30 days by status and by day and status, and
  `wrangler deployments list`. No account hash was exported (SQL aggregates only).
- **Part B.** Wrote `tmp/3.1/lib.mjs` (merge, coverage check) and `tmp/3.1/summarise.mjs`. The
  summariser drops the first slice, replaces each 401-failed slice with its re-run, refuses any query
  whose 26 slices are not contiguous, excludes API-key requests by request id where a join exists, and
  applies the plan's rules. No query was refused. Re-cut the D1 W7 reads to the 26-slice window.
- Edited `.agents/TODO.md` and the round ledger (row 3.1 after 1.4, PR "pending").

## Gates

- `npm run typecheck`: pass, after the placeholder `.dev.vars` (names only, ignored) and
  `npm run typegen` that `README.md` "Run locally" requires on a fresh worktree. The first run failed
  for the missing `Env` members, as `AGENTS.md` warns.
- `npm test`: pass (166 files passed, 5 skipped).
- `npm run build`: pass (dry run).
- `npm run secrets:scan -- --tree`: clean.
- `npm run test:smoke`: not run; no `src/executor` or `src/demo` change.
- Diff leak check: every added line with a digit was read; digits are design thresholds, window
  lengths and operation names. No production count, hash, request id or user-agent.

## Decisions (no figures)

| Item | Decision |
|---|---|
| Cap 1, public `MAX_SEARCH_LIMIT` | **Keep 50.** The first clause of the lowering rule fails: more than 5% of top-level searches after the seven-card deploy ask for more than 10, and the share over the whole window is also above 5%. The per-family clause was not needed (and cannot be read). The model-facing text "default 7, max 50" stays. |
| Cap 2, per-call timeouts | **Lumenloop 24 s and Scout 24 s.** No operation has more than 1% of ok calls above 24 s, so no question for 3.2. Three operations have no grid value that leaves a 1% margin (Scout `searchProjects`, Scout `explainRepo`, Lumenloop `find_similar_scf_submissions`) and take the largest. Ships in item 3.2. |
| Cap 3, artifact caps | **Keep 8 and 4.** No `info-cap` or `read-cap` refusal in the window; the largest per-run read count is far below both caps. |
| Cap 4, `EXECUTE_TIMEOUT_MS` | **Not decided: the platform half of T was not read.** The readable half (a failed `execute` over 59 s) is zero. Keep 60 s until read. |
| Single-account rule | Not triggered: no account holds a majority. |
| Client families | **Not read:** every user-agent and platform query returned no rows. |
| 6(b) Dashboard lumens API | Not measurable from telemetry. |
| 6(b) release source | Upper bound only: history queries use `scout.searchResearch` heavily; `scout.getChangelog` ranks first in few searches. No measured demand; silence is not absence. The committed evidence (item 1.3 classification, the HackMeridian probes) stays the deciding evidence; the read added nothing to Q5, R23, R33 or R35. |
| Application development and audits first | Application development is reached mostly through the shared Docs operations and `stellar-dev` skill reads, with very low error and soft-empty rates. Audits are low volume; `scout.getRepoTrust` returns soft-empty on most calls. |
| Next product item | **Recommend round item 3.2** (per-source status and the 24 s timeouts), folding in the `execute` `errorName` and `scout.matchPartners` bullets of the HackMeridian triage (same event and adapter surface). Reason: `scout.searchProjects` carries the largest error volume of any operation, most failed `execute` runs ran no operation, and `scout.matchPartners` still fails on nearly every call. Then 3.3 (`stellarOrg` is little used), the release source last on measured demand; the Dashboard source has no evidence. The orchestrator confirms. |

## Deviations and interpretations

1. **Window.** Per the lead's note, the first slice is dropped from every query (26 slices, 6.5
   days); the D1 API-key and concentration reads were re-cut to 2026-11-10T12:00Z to 2026-11-17T00:00Z.
   The Part A provisional cut started 12 hours earlier.
2. **Cap 1 regime.** "After the seven-card deploy" is the 2026-11-16 00:00Z slice onward: 1.0 day. The
   first 5 minutes of that slice precede the 00:05Z deploy. The 1.0-day sample is small; the whole-window
   share also exceeds the threshold, so the outcome does not depend on the split.
3. **Cap 2 gaps in the rule.** (a) Where no grid value leaves 1% above half of it, I took 24 s, the
   largest value; the plan gives no fallback. (b) "Its adapter's largest value" for an operation under 20
   ok calls: I read it as the largest value chosen among that adapter's operations with 20 or more ok
   calls (24 s for both adapters). (c) The tail queries have no request id, so API-key and Playground rows
   stay in the per-operation tails (the Playground share of `op` rows is small; API-key rows are removed
   from the per-op total only).
4. **API-key exclusion.** D1's API-key share of W7 tool responses exceeds 5%, so request-id exclusion
   applies to top-level search limits and sizes, `execute` counts and the op total. Tails by operation and
   `skill_read` keep API-key rows. `join-mcp-access` and `join-search` carry a few sampled rows, so the
   API-key set can miss a request.
5. **Empty queries.** `platform-*`, `client-*` and `join-platform-ua` returned no rows even after the
   re-runs. I did not re-query them (stop rule). Cause unknown; the key list may hide the working key.
6. **Key discovery.** Each family returned a capped key list (2,024 for a 2,000 limit), mostly
   `sourceBasis.calls.*` keys. "`recoveryHint` and `skipped` never seen" is therefore not proof of
   absence, which the lead's note treated as settled. TODO records the follow-up.
7. **Scope beyond plan step 9.** One new TODO item records two anomalies the read showed
   (`lumenloop.get_scf_submissions` soft-empty on most calls; a large share of `artifact_write` events with
   `ok = false`). The cap section was rewritten under a new heading, "Ship the cap decisions from the
   production read"; its two inbound mentions (the caps intro and item 3.2's text) were updated. The plan
   and brief files still use the old heading as a historical record.
8. **Top-1 only.** Search `top` resolved to `top.0`; question-area figures from search are top-1.
9. **Deploy mapping.** The ten deployments in the CLI's list carry no metadata; I matched them to merges
   by timestamp. Besides `986ffbaa`, three earlier deploys (the model-facing trim, the evidence-caveat
   cards, tuning loop 1) lie inside W7 and may change sizes; only cap 1 depends on the seven-card regime.

## Open for the lead

- Whether to run the free Mac follow-up named in the TODO ("Ship the cap decisions from the production
  read"): a keys search by name, `POST /mcp` wall time over 59 s with outcome, and user-agent families. It
  would decide cap 4 and let the client loops be attributed. It is outside this item's stop rule, so I did
  not run or request it.
- Whether the lead wants the new anomalies item kept in this PR or split out.

FIGURES.md: `/home/tyler/code/raven-wt/np-3.1/tmp/3.1/FIGURES.md`.
