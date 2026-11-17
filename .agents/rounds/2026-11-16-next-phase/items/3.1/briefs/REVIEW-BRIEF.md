# Brief: Fable review of the item 3.1 plan

You are the plan reviewer for round item 3.1, "read production once". Read-only except for the one
file you write. No subagents. Do not query Cloudflare, D1 or any production system; this is a
review of the plan against the repository.

Worktree: `/home/tyler/code/raven-wt/np-3.1` (branch `np/3.1-production-read`).

## Read

- `AGENTS.md`.
- `.agents/rounds/2026-11-16-next-phase/PLAN.md` item 3.1 and its neighbours 3.2 to 3.4, and
  `DECISIONS.md` (binds where it differs, notably 6(b)).
- The plan under review: `.agents/rounds/2026-11-16-next-phase/items/3.1/PLAN.md`, and
  `QUESTION.md` beside it.
- `.agents/TODO.md` sections "Read the free telemetry before changing four caps", "Add a release
  and package-version source", "Report per-source attempts and final status", "Triage the runtime
  and client gaps from the HackMeridian telemetry", and "Priorities".
- `.agents/skills/cloudflare-observability-review/SKILL.md`, `usage/README.md`,
  `docs/operations.md` ("Observability", "Data retention"), `ARCHITECTURE.md` §9.
- The emitters the plan relies on: `src/observability.ts`, `src/mcp/tools.ts` (`search` and
  `execute` events), `src/executor/providers.ts` (`op` and artifact events), `src/catalog/search.ts`
  (`searchEventFields`), `src/executor/run.ts`, `src/adapters/stellar-docs.ts`.

## Check

1. Every event name, field and value the plan queries exists as the code emits it (e.g. `source =
   "tool"` on search, `reason` values `info-cap`/`read-cap`, `requestedLimit`, `responseChars`,
   `ms` on `op`, `artifactReadCount`). Flag any that does not, and any field the plan should use
   but missed.
2. Whether each decision rule can actually decide its cap from the stated data, and whether a
   threshold is badly chosen. In particular: the `execute` timeout proxy (no error class is
   logged), the per-call timeout sizing rule, the API-key exclusion rule, and the client-family
   split by user-agent against the skill's privacy rules.
3. Whether the "question areas" and 6(b) proxies are honest given that no question text is logged,
   and whether the area map is right for application development and audits.
4. Whether the windows (W30 from D1 and GraphQL, W7 from Workers Logs) and the slicing follow the
   skill's measurement traps.
5. Whether anything would put a production figure, hash, Ray ID or request ID into the repository,
   and whether the repo edits match "Ends in TODO edits only".
6. Anything missing that the next items (3.2 sizing, 3.4, 4.1) need from this one read, given the
   stop rule "one window, one read".

## Write

`.agents/rounds/2026-11-16-next-phase/items/3.1/REVIEW.md`: numbered findings, each with severity
(blocking, should-fix, nit), the evidence (file and line), and the change you propose. End with a
one-line verdict. Keep it short.
