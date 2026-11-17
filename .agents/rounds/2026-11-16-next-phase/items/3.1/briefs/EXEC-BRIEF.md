# Brief: Sonnet execution of item 3.1

You execute round item 3.1, "read production once", in the worktree
`/home/tyler/code/raven-wt/np-3.1` (branch `np/3.1-production-read`). Your lead is the terminal
that started you; its ID is in the launch line.

## Read first

- `AGENTS.md`.
- The reconciled plan: `.agents/rounds/2026-11-16-next-phase/items/3.1/PLAN.md`. It binds you.
  `REVIEW.md` and `QUESTION.md` beside it explain why.
- `.agents/skills/cloudflare-observability-review/SKILL.md` ("Measurement traps") and
  `usage/README.md` ("Privacy rules", "Report").
- `.agents/TODO.md`: "Priorities", "Read the free telemetry before changing four caps", "Add a
  release and package-version source", the source-test item that cites decision 6(b), "Report
  per-source attempts and final status", "Triage the runtime and client gaps from the HackMeridian
  telemetry".
- `tmp/3.1/workers-logs.mjs`: the Workers Logs query script. You do not run it; the orchestrator
  runs it on the Mac. Read it to know each output file's shape.

## Hard rules

- **Production figures never enter the repository.** No count, percentage, latency, hash, Ray ID,
  request ID or user-agent string from production in any committed file, commit message or PR
  text. Committed text states decisions qualitatively ("rarely above 10", "no refusal in the
  window") and may quote the plan's thresholds, which are design constants. All figures go to
  `tmp/3.1/` (ignored). Account and client hashes are never written anywhere, including tmp; use
  SQL aggregates that return none.
- Read-only on production: D1 `SELECT` only, GraphQL queries only, `wrangler deployments list`
  only. No deploy, no D1 write, no secret change.
- Never print a token. To pass the Wrangler token to curl, use `T=$(npx wrangler auth token | tail -1)`
  inside one command and `unset T` after.
- No model-calling eval, no paid call, no AI Gateway or Workers AI call. No subagents.
- Do not run the Workers Logs script and do not query the telemetry API (agentpc's token gets 403).

## Steps

### Part A, now

Plan steps 1 to 3: D1 over W30 (the 30 days ending at the W7 end; until the script's manifest
arrives, use 2026-11-17T00:00Z as the provisional end and re-cut by day once the manifest gives
`window.toMs`), GraphQL over W30, and the deploy list. Save each raw result as JSON under
`tmp/3.1/` with a name that says what it is. GraphQL: `workersInvocationsAdaptive` for
`scriptName: "stellar-raven-codemode"` by status (and by day if useful), with `sum { requests
errors }` and `quantiles { wallTimeP50 wallTimeP99 wallTimeP999 }`; wall time is in microseconds.
The account id is in `usage/wrangler.jsonc`.

Then send your lead `hc send <lead ID> 'part A done: <abs path of tmp/3.1/PARTA.md>'`, where
PARTA.md lists the files and a few-line summary, and wait. The lead replies when the Workers Logs
output is in `tmp/3.1/workers-logs-out/`.

### Part B, after the lead's reply

Plan steps 5 to 9:

1. Write `tmp/3.1/summarise.mjs`. It reads `workers-logs-out/`, refuses any query whose
   `failedSlices` is non-empty (report those to the lead, who can ask for a one-slice re-run),
   sums counts across slices, and computes every figure the decision rules need. Respect the
   regimes in the plan's "Windows" section. Write its output to `tmp/3.1/summary.json`.
2. Write `tmp/3.1/FIGURES.md`: every number, the windows, `abr_level` per query, `sampleInterval`
   where above 1, the deploy regimes, the caveats (censoring, mixed Playground traffic where not
   split, the owner's own traffic, user-agent uncertainty). This file goes to the owner's private
   evidence folder.
3. Apply each decision rule exactly as the plan states it. Where a rule cannot be applied (a key was
   missing, a query skipped), record "not decided: <reason>".
4. Edit the repo (plan step 9): `.agents/TODO.md` and the round ledger
   `.agents/rounds/2026-11-16-next-phase.md` (add the item 3.1 row after 1.4, in the table's
   style, without figures; PR column "pending"). Follow the TODO's own rules: an item states what is
   wrong, its state, the next step and "done when"; delete what is done. Keep each edit scoped.
5. Write `EXEC.md` in the item folder: what you did, each gate's result in one line, deviations,
   and the decisions (no figures).
6. Gates, run bare: `npm run typecheck`, `npm test`, `npm run build`,
   `npm run secrets:scan -- --tree`. Then `git diff` and grep it for digits next to production
   words; fix any leak.
7. Commit on the branch with the normal hooks (never `--no-verify`). Commit the item folder
   (`PLAN.md`, `REVIEW.md`, `QUESTION.md`, `EXEC.md`, `briefs/`), the TODO and the ledger. Message
   ends with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push.
8. Send your lead `hc send <lead ID> '<abs path of EXEC.md>'`.

If a rule needs an owner judgement that the plan does not settle, write the question in EXEC.md,
send it, and stop.
