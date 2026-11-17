# Item 1.2 report: the vendor-diverse `stellarOrg` adapter review

Lead: Claude Opus 5.5, agentpc `t1r9`. Branch `np/1.2-stellarorg-review`.

## Pull request and result

[#457](https://github.com/stellar-experimental/stellar-raven/pull/457), not merged.

- **Review run.** Codex frontier `gpt-6-astra`, high, read-only, one pass, 8 keyless live
  requests ([CODEX-REVIEW.md](CODEX-REVIEW.md)). Verdict: 0 blocking, 0 should fix, 5 low, 2 info.
  No input, search row or header moved a request off `https://stellar.org`. Every earlier finding
  it re-ran (F1-F8, D1, G1-G3, S1, S2) still holds closed.
- **All five lows fixed; none needs a waiver.**
  - X1: titles capped at 300 characters, audit `project` and `firm` too, and at most 10 tags of
    200.
  - X2: a redirect target or content type quoted in an error shows at most 200 characters.
  - X3: a linear raw-text scanner. It fixes the `"<script>"` string that dropped page text and
    the leaking `<script/>` body.
  - X4: the document title is chosen outside comments and scripts.
  - X5: `/api` is refused in any case, so G4 is closed by a fix, not an owner call.
  - X6 (zero or filtered rows) and X7 (injection surface, the same as Docs) need no change.
- **Reviews.**
  - The Fable plan review had 9 findings, all adopted ([REVIEW.md](REVIEW.md)). R1, blocking: the
    obvious end-tag regex would have been quadratic.
  - The Codex fix review ([CODEX-FIX-REVIEW.md](CODEX-FIX-REVIEW.md)) had 1 should-fix and 2 lows,
    all fixed in commit `c35d55a6`: `svg` context inside a skipped `template` or `head`, an NBSP
    regression (the lead caught it independently), and docs wording.
- **Gates, bare, on the final tree.** typecheck, `npm test` (3,680 passed), build and the secrets
  scan all pass.
- **Live.** `get_page` on 5 pages and `search_site` on 2 queries return identical envelopes
  before and after.
- **Spend.** USD 0: subscription CLIs only, no eval, no paid or gateway call.

## Deploy

Needed after merge: Worker bytes change (`src/adapters/stellar-org.ts`). Then run a production
smoke through the deployed MCP: one `stellarOrg.search_site` (for example `roadmap`) and one
`stellarOrg.get_page` (`/foundation/roadmap`). Expect ok, with title
`Stellar | 2025 SDF Product Roadmap` and about 5,800 content characters.

## For the orchestrator on the Mac

- Merge #457. Its merge-order slot is "D's fixes".
- Deploy, then the production smoke above.

## Open questions for the owner

None. Every finding was fixed, so nothing needs a waiver.

## Not done

- No Worker-runtime (workerd) CPU measurement of the new scanner. The timings are Node: at most
  149 ms per full `get_page` on 1.9 MB hostile bodies.
- No model-behaviour test of injected page text (X7). It is out of scope and would be a paid
  run.
- The scratch probes and smoke scripts stay in the worktree's ignored `tmp/` and are not
  committed.
