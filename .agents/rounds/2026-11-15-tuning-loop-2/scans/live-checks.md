# Live checks at the map-removal commit `0a343e3f` (free, read-only)

One `npm run dev:eval -- --port 8791` server (a clean worktree, revision `0a343e3f0af10e291ef5c00d437c0bafd634b90f`), started by the implementer, stopped afterwards. No model call. Scout needs no key, so the two calls below used none.

`node eval/report-live-surface.mjs --port 8791` (full report in `live-surface-M.json`):
server instructions 1,899 characters, SHA-256 `67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00`; `search` description 1,930; `execute` description 2,029; descriptions 3,959; surface `dcc295de120c6a6cb920ccfb3cbe5b25800ee3a94c8d5c55bf4f4461b9b24f18`.

`execute` calls over MCP HTTP (host blocks of each result, in order):

| Script | Result | Blocks, in order | Guard sentence |
|---|---:|---|---|
| `scout.searchResearch({ q: "SEP-10 web authentication", limit: 2 })` | 2,750 chars | CANDIDATE EVIDENCE, EVIDENCE CHECKPOINT | once, inside the candidate block, at character 1,195 |
| `scout.listAudits({ limit: 2 })` (the audit directory: no candidate block) | 1,950 chars | EVIDENCE CHECKPOINT | once, as its own line before the checkpoint, at character 647 |
| `async () => ({ sum: 1 + 1 })` (no service call) | 9 chars | none | none |
