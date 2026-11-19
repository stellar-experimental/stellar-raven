# Challenge of Codex Sol review — item 8.12 lane `todo`

- **Reviewer:** Codex CLI (`codex-cli 0.169.0`), resolved model `gpt-6.2-sol`, reasoning effort `high`, sandbox `read-only`
- **Reviewed commit:** `57323598` (PR #513)
- **Review file:** [SOL-REVIEW.md](SOL-REVIEW.md)
- **Verdict counts:** 5 valid, 0 invalid, 0 valid but not worth fixing

Every finding from `SOL-REVIEW.md` was independently verified against the cited source files before deciding whether to edit `.agents/TODO.md`.

## Finding-by-finding verification

### M1 — `/terms` phrasing ("up to 30 days" vs `"for 30 days, after which it is deleted"`)

- **Claim (`SOL-REVIEW.md`):** `.agents/TODO.md` (observability item, OpenAI submission item, and Owner decision 6) says `/terms` states "up to 30 days", whereas the published text says `"for 30 days, after which it is deleted"`. The "allowance" reading belongs to the owner (`DECISIONS.md`), not the literal `/terms` text.
- **Verification:** Read `src/site.ts:1145-1147` and `.agents/rounds/2026-11-16-next-phase/DECISIONS.md:148`.
  - `src/site.ts:1145-1147` literally reads: `stores observability data, which may include the queries submitted and the responses returned, for 30 days, after which it is deleted.`
  - `DECISIONS.md:148` records the owner's statement: `"30 is an allowance, today we have 7."`
  - Paraphrasing `/terms` itself as saying `"up to 30 days"` misquoted `src/site.ts:1146`.
- **Verdict:** **valid**
- **Action taken:** Updated `.agents/TODO.md` in all three places (the observability item, the OpenAI submission item, and Owner decision 6) to quote the literal `/terms` text (`"which may include the queries submitted and the responses returned"` / `"for 30 days, after which it is deleted"`) while accurately attributing the allowance framing to the owner and keeping the fact-not-judgment statement from `8.12-LANES.md` point 2.

### M2 — Self-contradictory `Done when` ("every observability store keeps 30 days") and omitted AI Gateway metadata policy

- **Claim (`SOL-REVIEW.md`):** The pre-existing `Done when` in "Keep 30 days of observability data, including queries and responses" required "every observability store keeps 30 days and deletes after it", which conflicts with the item's own statement that native Workers Logs cannot exceed 7 days. Also `docs/operations.md:119` documents a separate row-count policy for Cloudflare AI Gateway request metadata.
- **Verification:** Read `.agents/TODO.md:947-948`, `.agents/TODO.md:981`, and `docs/operations.md:98-120`.
  - `.agents/TODO.md:947` states: `Workers Logs, traces and request metadata: at most 7 days (Cloudflare's platform limit; it cannot be raised in Workers Logs itself).`
  - `docs/operations.md:118-119` lists both Cloudflare Workers Logs (`at most 7 days`) and Cloudflare AI Gateway request metadata (`The gateway's row-count policy`, with payload collection off per request in `src/demo/model-config.ts`).
  - As written, "every observability store keeps 30 days" was impossible to close because Cloudflare's native Workers Logs and AI Gateway metadata cannot be changed to 30 days.
- **Verdict:** **valid**
- **Action taken:** Scoped `Done when` to the Raven-controlled observability archive (noting native Workers Logs remain at Cloudflare's `<=7`-day platform limit and AI Gateway metadata remains on its row-count policy), added the AI Gateway metadata bullet to the item's current-state list, and noted it in Owner decision 6.

### M3 — Overstated `classify-misses.mjs` pre-run blocker and "enforce" wording on Markdown guides

- **Claim (`SOL-REVIEW.md`):** (1) Triggering before any run of `classify-misses.mjs` blocks an aggregate-only classifier run even though `classify-misses.mjs` prints only `{ outPath, counts }` to stdout; (2) saying the guides "enforce" counts-only reporting overstates what prose guides do.
- **Verification:** Inspected `eval/discovery/classify-misses.mjs:45-78`, `eval/discovery/run-agent-discovery.mjs:555-557`, `eval/discovery/README.md:7`, and `eval/agentic/README.md:10` via `rg --hidden -g '!.git'`.
  - Confirmed `eval/discovery/classify-misses.mjs:78` prints only `JSON.stringify({ outPath, counts })` to stdout (while lines 45-59 write untagged per-row `rows` to the JSON artifact at `outPath`).
  - Confirmed `eval/discovery/run-agent-discovery.mjs:555-557` prints per-row outcomes (`visible-family=hit/miss primary=hit/miss`) directly to stdout.
  - Confirmed `eval/discovery/README.md:7` and `eval/agentic/README.md:10` are prose guides that prescribe counts-only reporting rather than mechanically enforcing it.
- **Verdict:** **valid**
- **Action taken:** Replaced `enforce` with `prescribe`, noted what each script actually emits (`run-agent-discovery.mjs` prints per-row outcomes to stdout; `classify-misses.mjs` prints `{ outPath, counts }` while writing untagged `rows` to JSON), marked the item **Held** (no paid agent-discovery or agentic-routing run is scheduled), and narrowed the trigger to before the next paid run of `run-agent-discovery.mjs` or the agentic workflow, or before inspecting per-row `classify-misses.mjs` output (unless the owner accepts the guide rule and deletes the item).

### L1 — Attributing 0% cited-fact disputes to "the shipped design" instead of measured baseline arm A

- **Claim (`SOL-REVIEW.md`):** The hold in "Check what the judge saw before changing how it weighs cited text" attributed 0% disputes to "the shipped `search` + `execute` design", whereas `research/audits/2026-11-12-first-principles-round.md:140` measured 0% on baseline **arm A** and `:107` shipped **arm B-fixed-2**.
- **Verification:** Read `research/audits/2026-11-12-first-principles-round.md:107` (`Ship arm B-fixed-2.`) and `:140` (`called a correctly quoted fact "fabricated" in about 2% of answers from the new variants and in none of arm A's.`). The pre-existing line 84 ("none of the current design's") predated arm B-fixed-2 shipping, and my new `Held:` sentence carried that imprecision forward as "shipped `search` + `execute` design".
- **Verdict:** **valid**
- **Action taken:** Updated both the opening sentence and the `Held:` paragraph to attribute the 0% dispute rate accurately to arm A (the measured `search` + `execute` baseline; arm B-fixed-2 shipped).

### L2 — `"via eval/lib/protocol-history-report.mjs"` obscured direct import in `eval/run-protocol-history.mjs`

- **Claim (`SOL-REVIEW.md`):** Writing `eval/run-protocol-history.mjs (via eval/lib/protocol-history-report.mjs)` suggests `run-protocol-history.mjs` only uses `confirmation-only.mjs` indirectly, whereas `run-protocol-history.mjs:13` imports it directly.
- **Verification:** Checked via `rg --hidden -g '!.git' "confirmation-only" eval/run-protocol-history.mjs eval/lib/protocol-history-report.mjs`:
  - `eval/run-protocol-history.mjs:13`: `import { confirmationOnlyFor, tagRows } from "./lib/confirmation-only.mjs";`
  - `eval/lib/protocol-history-report.mjs:1`: `import { consoleValue } from "./confirmation-only.mjs";`
- **Verdict:** **valid**
- **Action taken:** Changed `(via eval/lib/protocol-history-report.mjs)` to `(and eval/lib/protocol-history-report.mjs)` so both direct imports are stated accurately.
