# Brief: attack the "missing" and "nowhere" claims of item 1.3

You are a vendor-diverse attacker (Grok 4.7, high). Work in
`/home/tyler/code/raven-wt/np-1.3`. The claims below say a fact is missing from, or nowhere in, the
sources Raven reaches. Try to find each fact in a source Raven reaches. A knocked-down claim is the
most useful result.

## Scope

Read `.agents/rounds/2026-11-16-next-phase/items/1.3/CLASSIFICATION.md` and `LEAVES.md`, and these
finding files:

- `improvements/stellar-docs/sd-111-audit-register-unnamed-records.md`
- `improvements/stellar-docs/sd-112-docs-search-sep7-pay-uri-query.md`
- `improvements/stellar-docs/sd-113-pi-network-not-stellar-faq-request.md`
- `improvements/lumenloop/ll-039-nbu-pilot-statement-not-ingested.md`

Attack only rows 6, 8, 9, 14, 15, 16, 17 and 20 of CLASSIFICATION.md, and the four findings above.
Rows classed "reached" or "did not reproduce", and `sls-121` and `sls-122`, are out of scope.

For each claim, try to find the fact (or the correction the finding asks for) in a source Raven
reaches: Stellar Docs (`https://developers.stellar.org/...md` and `https://developers.stellar.org/llms.txt`),
the stellar.org site and its `/api/search`, the Scout REST API (`https://stellarlight.xyz/api/...`),
Lumenloop through the local server, public GitHub repos (`stellar/stellar-docs`, `stellar/stellar-protocol`),
and the primary sources the findings cite. Also check each factual statement inside a finding
(counts, quotes, dates, ranks) against the live source, and whether each finding is something a
maintainer could act on.

The local MCP server is at `http://localhost:8787/mcp` (no token; owned by another terminal; do not
send it input or stop it). `tmp/mcp.mjs` exports `init()` and `tool(name, args)`; `tmp/run.mjs` shows
how to call `execute`. Use `search` and `execute` through it for Lumenloop, Scout and Docs.

## Rules

- Keyless and free: no model call, no AI Gateway, no paid API. Never print or read `.dev.vars` or any key.
- Do not open any file under `eval/qa/corpus/` and do not read anything under `~/backups/`.
- Do not post, comment, or file anything upstream. Do not run `npm run improvements:file`.
- Edit nothing except your report file.

## Output

Write `/home/tyler/code/raven-wt/np-1.3/tmp/1.3-grok.md`. For each claim: the claim, what you tried
(exact queries or URLs), the result, and a verdict (`stands`, `knocked down`, or `unclear`), with
quotes and URLs a stranger can re-walk. List other defects in a finding's facts or wording at the end.
Then send the path to your parent: `hc send t1rq '/home/tyler/code/raven-wt/np-1.3/tmp/1.3-grok.md'`.
