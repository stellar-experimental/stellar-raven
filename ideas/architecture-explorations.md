# Architecture exploration backlog — from the 2026-07-07 first-principles review

This backlog retains open questions from the July 7 architecture review.
Completed experiments link to their evidence. They are not queued for another run.
New experiments need the evaluation and authorization gates in [the evaluation map](../eval/EVALS.md).

## Ranked candidates

1. **Per-op MCP tool server vs search+execute — MEASURED NULL / NO SHIP.**
   Keep the two-tool architecture. The July 10 experiment did not justify a rebaseline or release.
   The direct arm lacked skills and artifact reads; its advertised definition size was not consumed-context evidence.
   [The reviewed result](../eval/qa/reviewed/2026-07-10-per-operation-architecture-ab.md) preserves the identities, metrics, and row dispositions.

2. **Hybrid lexical+embedding retrieval — MEASURED NO-SHIP.**
   The pinned Qwen3-Embedding-0.6B experiment failed the composite release gate.
   No production Vectorize binding, index, or retrieval path shipped.
   [The Vectorize record](../eval/vectorize/README.md) retains the harness, failures, and reopen requirements.
   Any successor must preserve deterministic model/index pins and the Docs and Scout blocking controls.

3. **MCP 2026-07-28 transport readiness — COMPLETE.**
   The handler supports modern discovery and the 2025 initialization lifecycle.
   [The architecture](../ARCHITECTURE.md#1-a-search-call-end-to-end) and `test/smoke/mcp-modern-client.test.ts` own the current contract.
   Checking real client adoption remains an optional telemetry question, not a transport implementation task.

4. **Compact operation-card code-shaped search re-test** — ADR-0001's own named next
   experiment: hybrid ranked/code search over op cards with `codemode.search`/`describe`
   parity in the search sandbox; rerun the 60-case paired A/B. Win = variant-B answer quality
   without the max-turn exhaustion that killed it.

5. **Discovery instruments — COMPLETE.**
   The [discovery guide](../eval/discovery/README.md) covers one-shot, bounded-agent, and mined-query replay lanes.
   The retained mined sample does not recreate the unavailable July 9 artifact.
   Do not carry the original extension plan as unfinished implementation work.

6. **Pre-cap evidence sidecar for QA judging** (runner change). Closes the residual
   judge/agent evidence asymmetry at its root: agents read full payloads via
   `codemode.artifact.read`; judges see capped transcript text + claim-anchored packs, so
   live-computed aggregates ("N of M events…") remain unanchorable. `run-qa.mjs` captures
   uncapped execute payloads (or dev-R2 artifact bodies) into a gitignored per-stamp sidecar;
   the pack builder prefers sidecar over capped transcript. Predicted first break without it:
   count/aggregation claims on live digest cases.

7. **Telemetry-mined live cases** — mine real production intents (with the PII-scrub doctrine
   from the 2026-07-03 purge) into live-lane eval candidates; cases nobody authored are the
   best guard against golden-authoring bias.

8. **Adopt upstream's durable approval runtime** only when a side-effecting/paid op actually
   ships — `@cloudflare/codemode` v0.3/0.4 carries the DO-backed approve/reject/rollback
   control plane anticipated by [`AGENTS.md` “Hard rules”](../AGENTS.md#hard-rules). No action
   until then; mirror upstream rather than inventing.

9. **Docs machine corpus beyond Algolia titles** (2026-07-12 coverage review, Solo scratchpad
   607). developers.stellar.org publishes `llms.txt`, a 4.2MB `llms-full.txt`, per-page
   Markdown alternates, and a 934-URL sitemap; the inventory keeps only 635 deduped Algolia
   `type:lvl1` titles, and the authored spec already documents that generated RPC/Horizon
   reference pages are absent from the Algolia index (`specs/stellar-docs.json`). A
   change-detectable snapshot of the official machine corpus could close that hole and feed
   richer routing vocabulary — but it is a new retrieval-quality bet, so it takes the house
   gate: a read-only A/B win on golden Q→A accuracy before any runtime surface. Related
   smaller gaps recorded with it and deliberately not taken: Lumenloop's `/v1` + `/v1/docs` +
   llms.txt discovery conventions (the adapters already implement the envelope; inventorying
   prose conventions has no consumer) and Scout `/api/skills` detail bodies (the
   identity-projection drift check is the intended surface; skill content bodies come from
   the GitHub mirrors the repo already pins).

## Known deferred hardening leftovers (small, non-blocking)

- Judge-regression replay gate from real adjudicated rows — deferred: conflicts with the
  results-local-only convention; synthetic counter-pressure fixtures shipped instead
  (rubric v2.4, 2026-07-07).
- `extractLossDetail` regex in `src/policy/source-basis.ts` is coupled to the truncate.ts
  footer wording; a wording edit silently empties lossDetail with one indirect test on guard.
- The 10.4MB `assets/repo/Gemini_Generated_Image_*.png` is documented as intentionally retained
  (`assets/repo/README.md`) — revisit if page-weight or repo-size ever matters.
