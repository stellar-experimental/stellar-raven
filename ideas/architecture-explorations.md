# Architecture exploration backlog

This backlog lists open architecture questions.
New experiments need the evaluation and authorization gates in [the evaluation map](../eval/EVALS.md).

## Ranked candidates

1. **Compact operation-card code-shaped search re-test** — ADR-0001's own named next
   experiment: hybrid ranked/code search over op cards with `codemode.search`/`describe`
   parity in the search sandbox; rerun the 60-case paired A/B. Win = variant-B answer quality
   without the max-turn exhaustion that killed it.

2. **Pre-cap evidence sidecar for QA judging** (runner change). Closes the residual
   judge/agent evidence asymmetry at its root: agents read full payloads via
   `codemode.artifact.read`; judges see capped transcript text + claim-anchored packs, so
   live-computed aggregates ("N of M events…") remain unanchorable. `run-qa.mjs` captures
   uncapped execute payloads (or dev-R2 artifact bodies) into a gitignored per-stamp sidecar;
   the pack builder prefers sidecar over capped transcript. Predicted first break without it:
   count/aggregation claims on live digest cases.

3. **Telemetry-mined live cases** — mine real production intents (with the PII-scrub doctrine
   from the 2026-07-03 purge) into live-lane eval candidates; cases nobody authored are the
   best guard against golden-authoring bias.

4. **Adopt upstream's durable approval runtime** only when a side-effecting/paid op actually
   ships — `@cloudflare/codemode` v0.3/0.4 carries the DO-backed approve/reject/rollback
   control plane anticipated by [`AGENTS.md` “Hard rules”](../AGENTS.md#hard-rules). No action
   until then; mirror upstream rather than inventing.

## Known deferred hardening leftovers (small, non-blocking)

- Judge-regression replay gate from real adjudicated rows — deferred: conflicts with the
  results-local-only convention; synthetic counter-pressure fixtures shipped instead
  (rubric v2.4, 2026-07-07).
- `extractLossDetail` regex in `src/policy/source-basis.ts` is coupled to the truncate.ts
  footer wording; a wording edit silently empties lossDetail with one indirect test on guard.
