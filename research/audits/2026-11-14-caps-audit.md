# Caps audit: every number on Raven's model-facing surface

Date: 2026-11-14. Branch `research/caps-audit`. No code changed. All checks here were free: git
history, repository records, vendor docs and binaries, and the lexical scorer and in-memory MCP
server run locally. No model was called and no QA case under `eval/qa/corpus/` was opened.

**Headline.** The 2,048-character Claude Code limit that shaped the instructions, both tool
descriptions, and the micro-map is out of date. Since Claude Code v2.1.296 the limit is 4,096
characters for server instructions and for tools loaded up front, and 16,384 for tools loaded
through tool search. This session ran Claude Code v2.1.325, and its system context held all 4,066
characters of Raven's production instructions, micro-map included. The known lead is therefore
wrong for current Claude Code: that client reads the whole micro-map. The live risk is the opposite
one. The instructions sit 30 characters under the new limit, and no test guards the total.

Three caps have the most effect on cost and accuracy, and none of them rests on a measurement of
its own:

- the `execute` boundary of 6,000 tokens, a default inherited from `@cloudflare/codemode`;
- the default of 5 search cards, copied from the playground;
- the search `limit` maximum of 50. At that limit a page averages 41.8 KB, and the Grok CLI clips
  459 of 460 such pages.

## How to read the classes

- **External fact.** Someone else's limit. The row says how to re-verify it and whether it was
  re-verified today.
- **Measured.** A measurement chose this number. *Bundle* means the measurement covered a change
  that included this cap among others, so it says nothing about this number by itself.
- **Derived.** Arithmetic from another cap. It moves when its parent moves.
- **Ratchet or guess.** Nothing in the repository supports the number itself.

Token figures use the repo convention of characters ÷ 4. A real tokenizer counts JSON at somewhat
more tokens per character, so these figures are lower bounds. The per-question reference is the
first-principles round
([`2026-11-12-first-principles-round.md`](2026-11-12-first-principles-round.md)). There, the shipped
trimmed surface (arm B) cost 66,876 client tokens per question on held-out cases, against 113,829
for arm A and 24,030 for the cheapest live variant. The tuning baseline was 117,751. Client tokens
add up every model call's input, so a tool result costs its size once for each later model call
that rereads it. The round's data is archived outside the repo. That archive is where the number
of searches and executes per question would come from, and this audit did not have it, so per-question
costs below are stated as a formula plus one worked example.

## Summary

| Cap | Value | Class | Evidence | Cost (what it costs / buys) | Recommendation |
|---|---|---|---|---|---|
| Claude Code instructions limit (`CLAUDE_CODE_INSTRUCTIONS_CAP`, `test/mcp-instructions.test.ts`) | 2,048 chars | External fact, **stale** | Claude Code docs: 4,096 since v2.1.296. This session (v2.1.325) received all 4,066 chars. | Took content out of BASE and kept the micro-map from Claude Code until v2.1.296 | **Recalibrate** to 4,096 and test the whole `SERVER_INSTRUCTIONS` against it. Headroom today is 30 chars. |
| BASE budget (`BUDGET`, same test) | 2,000 chars (BASE is 1,899) | Ratchet (headroom under the stale fact) | c37cc847, 2026-07-13 | Nothing now. BASE fits. | **Keep** the order (BASE first). **Retire** the 2,000 number once Codex and Grok instruction handling is checked. |
| Tool description limit (`CLAUDE_CODE_TOOL_DESCRIPTION_CAP_CHARS`, test helper) | 2,048 chars | External fact, **stale** | Docs: 4,096 up front, 16,384 through tool search | `search` is 1,930 chars and `execute` is 2,029. e3d0cd55 moved a line off `execute` to fit. | **Recalibrate** the test to 4,096. Grow a description only with a measured reason, because every model call rereads it. |
| `MICRO_MAP_MAX_TOKENS` (`scripts/build-micro-map.mjs`) | 700 tokens (was 1,500) | Ratchet | 1,500 came from the P1 spec's budget (ed43c6df). 700 came with e3d0cd55, which measured only the arm B bundle. | The map is 542 tokens, reread on every model call in clients that inject instructions. It protects nothing: a 700-token map would push the instructions to about 4,700 chars, over Claude Code's limit. | **Retire.** Replace it with the 4,096 total guard, which leaves the map about 2,195 chars. **Measure** its value (paid test M3). |
| `FAMILY_LINE_MAX_TOKENS` | 150 tokens (line is 90) | Guess | P1 spec, "≤ ~120" | The line is part of the `search` description, and the description limit already bounds it | **Retire.** It duplicates the description guard. |
| `SEARCH_DEFAULT_LIMIT` (`src/mcp/tools.ts`) | 5 cards | Guess, bundle-measured | Playground value from f80ea10f (2026-07-06), copied in e3d0cd55. Arm B measured it only as part of the bundle. | Free check: 7 cards adds 11 operation-card hits on 182 legacy rows (113→124) and loses none. It costs +1,899 bytes (about 475 tokens) per page. | **Measure** (M1). Avoid 6: it ranks worse than 5. |
| `MAX_SEARCH_LIMIT` (`src/catalog/search.ts`) | 50 | Guess | Initial snapshot 7e83d1c5 | At 50, a page averages 41.8 KB (about 10.5k tokens). 459 of 460 pages exceed the Grok clip. The largest, 54.7 KB, exceeds Claude Code's 50,000-char spill-to-file rule. | **Measure** (free telemetry: the `requestedLimit` distribution), then recalibrate the public tool to 10. Long candidate lists belong in `codemode.search` inside `execute`. The change edits model-facing schema text ("default 5, max 50"), so it needs its own review. |
| `DEFAULT_SEARCH_LIMIT` (`codemode.search`, catalog) | 10 | Guess | Initial snapshot | Read by the script, not the model, unless the script returns it | **Keep.** |
| `SEARCH_CARD_DESCRIPTION_CHARS` | 220 chars | Guess, bundle-measured | Playground value (f80ea10f), copied in e3d0cd55 | Ranking never reads it, so card hits do not change. 79 of 80 entries are clipped, and 76% of served hits lose a query word that the full text has (51% at 400). Raising it to 400 adds up to 180 chars per card. | **Keep.** Measure only if M1's stored-answer step points at card content. |
| `CARD_CAVEAT_MAX_CHARS` | 135 chars | Derived | d7e13d98. Leaves 85 chars of description inside 220. | Keeps eight evidence caveats on cards | **Keep.** It moves with 220. |
| `CARD_FIELD_DOC_CHARS` | 100 chars | Bundle | e3d0cd55 | Field prose on cards; `describe` has the rest | **Keep.** |
| `SEARCH_NEXT_STEPS_MAX_CHARS` | 400 chars | Ratchet (test bound) | e3d0cd55 | None. The longest branch observed over 460 queries is 325 chars. | **Keep** as a guard on authored text. |
| `COMPACT_OUTPUT_THRESHOLD` | 2,000 chars | Measured | Manifest distribution, 2026-07-06 (comment in `src/catalog/output-compaction.ts`) | Stubs oversized output types on cards | **Keep.** A free re-check is available. |
| `TIER_INTERLEAVE_MARGIN` | 1.6× | Measured | bb25276b sweep of 1.5–2.0. The sweep table lived in a retired Solo scratchpad and is not in the repo. | Ranking only | **Keep.** Re-run the free sweep if anyone touches it. |
| Execute model boundary (`DEFAULT_MAX_TOKENS`, `EXECUTE_MODEL_BOUNDARY_MAX_TOKENS`) | 6,000 tokens (24,000 chars) | Guess (inherited) | `@cloudflare/codemode` `MAX_TOKENS = 6e3`, still in 0.5.1. No Raven measurement. | It binds often: 275 of 565 arm B held-out results exceeded 20,000 bytes. A capped result is about 6.4k tokens, reread on each later call. | **Measure** (M2): set the variable to 4,000. It is an environment variable, so the test needs no code change. |
| Boundary override range | 1,000–32,000 tokens | Guess | def2f963 | Operations only | **Keep.** |
| Source-basis manifest (`src/policy/source-basis.ts`) | 1,600 chars; 14 calls, 12 metadata entries, 5 URLs, 64-char reason, 96-char atom | Guess | 6c5dd6ee (2026-07-07) | About 400 tokens on every truncated result | **Keep.** Revisit with M2. |
| Log shaping (`src/executor/shape-logs.ts`) | 100 lines × 2,000 chars | Guess | Initial snapshot | Below the 6k cap, so only the cap binds | **Keep.** |
| Skill size notice (`src/skills/store.ts`) | 5,000 tokens | Derived | 6k less JSON escaping inflation | Advice text only | **Keep.** It follows the boundary. |
| Artifact size / retention | 2 MiB; 7 days | Guess; owner policy | 59940f0b; retention table | 2 MiB bounds the size of an artifact, not model tokens. The 7-day TTL is disclosed retention. | **Keep.** |
| R2 custom metadata | 8,192 bytes (target 7,600) | External fact | R2 limits page, re-verified today | Prevents `MetadataTooLarge` | **Keep.** |
| `ARTIFACT_INFO_CAP` / `ARTIFACT_READ_CAP` | 8 / 4 per execute | Guess | c824ed61, 3710d116 | Host load. Results still pass the 6k cap. | **Keep.** A free telemetry check shows whether any run hits them. |
| `EXECUTE_TIMEOUT_MS` | 60 s | Guess | Initial snapshot. The upstream default is 30 s. | Bounds the tail. Arm B's p95 was 55.6 s per question. Codex's default `tool_timeout_sec` is 60 (vendor docs: "Timeout (seconds) for the server to run a tool. Default: `60`"), so a script that runs to Raven's limit races the Codex client timeout, and Codex can give up first and lose Raven's structured timeout result. | **Keep**, after a free telemetry read of the timeout rate and of `execute` wall time above about 50 s. |
| Lumenloop and Scout per-call timeout | **none** | Missing cap | `src/adapters/lumenloop.ts`, `scout.ts` | One hung call holds the whole script until the 60 s limit and loses every other result | **Measure** tail latency in telemetry (free). Then add a per-operation budget like the Stellar Docs one. |
| Stellar Docs attempts / budget | 8 s + 12 s; 24 s | Measured | A/B p99 3,717 ms, with 4 of 1,498 requests over 8 s; an 88 s incident (Mintlify round, item 2) | Fits inside 60 s | **Keep.** |
| Skill fetch / read / runner | 8 s; 20 s; 30 s | Derived; guess | 4a00ff27 (two attempts × 8 s × 4 files exceeded 60 s); runner f99be10c | Fits inside 60 s | **Keep.** |
| Stellar Docs snippet / error body | 300 / 1,024 chars | Guess | 5d7a4f88 | Data in the sandbox | **Keep.** |
| Playground caps (`src/demo/budget.ts`, `tools.ts`, `chat.ts`) | 7 steps, 4,096 output tokens, 3+3 calls, search 5 (max 6), 220/400 chars, 20 msgs/24k chars, 8k-char message, 120 s, 30 chats/hour | Owner cost guards | ARCHITECTURE.md playground table; playground decision records | Bound playground spend | **Keep.** Not re-audited; they are spend guards, not answer-quality choices. |
| Client output limits (context, not ours) | Claude Code: 25,000-token MCP output cap, warning at 10,000, spill to file above 50,000 chars. Grok CLI: 20,000 bytes, keeps the head. | External facts | Claude Code env-vars docs; Grok 1.0.77 embedded docs, re-verified today | Default search (≤14.8 KB) fits all of them. Execute fits Claude Code's limits and exceeds Grok's. A limit-50 search page exceeds Claude Code's warning. | Covered by the rows above |

## Detail

### 1. The 2,048-character Claude Code limit (instructions and tool descriptions)

**Where.** `test/mcp-instructions.test.ts` sets `CLAUDE_CODE_INSTRUCTIONS_CAP = 2048` and
`BUDGET = 2000`. `test/helpers/mcp-tool-metadata.ts` sets `CLAUDE_CODE_TOOL_DESCRIPTION_CAP_CHARS =
2_048`. The tests check that BASE is at most 2,000, that BASE ends on a sentence, that the first
2,048 characters carry every load-bearing phrase, and that each tool description is at most 2,048.

**Who and when.** c37cc847 (2026-07-13), "measured in production". A BASE of 2,160 characters was
cut mid-sentence. e3d0cd55 (2026-11-13) then fitted both tool descriptions under the same figure.

**Re-verified today.** The Claude Code MCP docs (code.claude.com/docs/en/mcp, "For MCP server
authors") say: "Server instructions, and the description of a tool that loads upfront: 4,096
characters." They also say: "Before v2.1.296, the shorter limit was 2,048 characters, and before
v2.1.295 it applied to every tool description, including one loaded through tool search." Tools
loaded through tool search get 16,384, and `CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH` overrides both.
The v2.1.325 changelog (2026-11-13) aligned cloud sessions on 16,384 for tool-search descriptions.

A direct check in this session agrees with the docs. Claude Code v2.1.325 put Raven's production
instructions into this session's system context in full: every line from "Unified
Stellar-ecosystem gateway" through the last authority rule, with the same counts as the repo
(18/30/12 operations, 20 skills, 204 sections). That is 4,066 characters (1,899 for BASE, 2 for the
separator, 2,165 for the micro-map). Another server's instructions in the same context ended in
"… [truncated]", so the client still cuts. It cuts at a larger number.

**What this changes.**

- The known lead is wrong for Claude Code v2.1.296 and later. The micro-map arrives in full.
- The c37cc847 follow-up said the micro-map "effectively reaches only full-injection clients".
  Claude Code is now one of those clients, so the micro-map's cost, 542 tokens on every model call,
  is real in Claude Code sessions. Its value has been checked on two routing cases only
  (52cdb234). See M3.
- The binding limit is now the whole instructions string against 4,096, and nothing tests it. At
  4,066 characters, one new micro-map line or a longer purpose sentence would put the tail past the
  cut. The old test cannot catch that, because it only checks the first 2,048 characters.
- The descriptions have room to grow (1,930 and 2,029 of 4,096). Growth is not free, because every
  model call rereads the system prompt. Prompt caching lowers the dollar cost, but the tokens still
  count. The `execute` line that e3d0cd55 removed (upstream-docs links) is a candidate to restore
  only if a run shows it was missed.

**Other clients.** Each row names its source and its evidence class. Vendor documentation was read on
2026-11-14 (by the review of this audit); community evidence is labelled and is not vendor-confirmed.

| Client | Server instructions | Source | Evidence class |
|---|---|---|---|
| Claude Code v2.1.296 and later | Read and cut at 4,096 characters; a tool loaded up front is cut at 4,096, through tool search at 16,384. | `code.claude.com/docs/en/mcp`; this session's context (v2.1.325) | Vendor docs, plus a direct observation |
| Claude Code before v2.1.296 | Cut at 2,048 characters. Before v2.1.295 the cut applied to every tool description. | `code.claude.com/docs/en/mcp` ("Before v2.1.296, the shorter limit was 2,048 characters"); outside measurement on 2.1.285, `dev.to/rulestack`, 2026-10-07 | Vendor docs, plus an independent measurement |
| Codex (CLI, IDE, ChatGPT desktop) | Read as server-wide guidance. Vendor advice: "Keep the first 512 characters self-contained so the most important guidance is available when Codex is deciding how to use the server." No cut is stated. | `developers.openai.com/codex/mcp` | Vendor docs |
| ChatGPT | Read alongside tool metadata. Vendor advice: "Keep the most important details in the first 512 characters." | `developers.openai.com/plugins/build/mcp-server` | Vendor docs |
| claude.ai web and Claude Desktop | **Dropped entirely**, not cut. Tool descriptions do arrive: a 1,770-character description came through verbatim, so the tool descriptions are the whole contract there. | Open issue `anthropics/claude-ai-mcp#93`, wire-level canary probe posted 2026-07-29 | Community evidence; not vendor-confirmed |
| Grok CLI | Unknown. The only Grok limit verified is the 20,000-byte MCP result clip. | Embedded docs, v1.0.77 | Audit verification (result clip only) |

The 512-character advice is a weaker rule than Claude Code's cut. Raven's first 512 characters hold
the purpose line and the start of the workflow and end mid-word in
`codemode.skill.read(id, { sectio`, which is acceptable for "deciding how to use the server". Claude
Code is the only client known to read the micro-map. claude.ai and Desktop see neither BASE nor the
map. This narrows M3's population.

A four-client measured probe is in progress. Its result will be added as
`research/audits/2026-11-14-client-text-limits.md`, and its measured limits replace the community
and vendor-advice rows above where they differ.

**Recommendation.** Recalibrate both test constants to 4,096 and cite the docs page and the
version. Add one assertion that `SERVER_INSTRUCTIONS.length <= 4096`. Keep BASE first: that costs
nothing and protects any client still on the old limit. Retire the separate 2,000-character BASE
budget once Codex's and the Grok CLI's handling of server instructions is known. This audit could
not establish either one: neither binary exposes an obvious limit, and checking at runtime would
take a model call.

### 2. Micro-map 700 tokens and FAMILY_LINE 150 tokens

**Where.** `scripts/build-micro-map.mjs` fails the build above either limit. `test/micro-map.test.mjs`
repeats both checks. Generated values: micro-map 542 tokens (2,165 chars), FAMILY_LINE 90 tokens
(359 chars).

**Who and when.** Both numbers start with the P1 guidance spec (ed43c6df, 2026-07-09;
`research/p1-guidance-spec.md`, since removed). That spec said "800–1,500 tokens" and
"FAMILY_LINE ≤ ~120 tokens", with fail gates at about 1,500 and 150. e3d0cd55 cut the map's
archetypes and lowered the gate to 700. Neither commit measured the number itself. Arm B measured
the trimmed surface as a whole.

**Class.** Ratchet. 700 is roughly the new map plus headroom.

**What it costs and buys.** The map is about 542 tokens on every model call in a client that
injects instructions. Over n model calls per question that is 542 × n, so 3.3k tokens at six calls,
or 4.9% of arm B's 66,876. What it buys has not been measured. The 700 gate does not protect the
limit that matters: a 700-token map (2,800 chars) plus BASE is about 4,700 chars, which Claude Code
would cut. FAMILY_LINE sits inside the `search` description, which the description test already
bounds.

**Recommendation.** Retire both token gates. Replace them with the derived character budget from
section 1: the whole instructions string at most 4,096, which today leaves the map 2,195 characters.
Measure the map's value with M3 only if the owner wants to spend on it. Dropping the map would save
about 542 tokens per model call. Keeping it is a bet that it improves which source families the
agent picks.

### 3. Search default 5, maximum 50, and the 6-card trap

**Where.** `SEARCH_DEFAULT_LIMIT = 5` in `src/mcp/tools.ts`. `MAX_SEARCH_LIMIT = 50` and
`DEFAULT_SEARCH_LIMIT = 10` (`codemode.search`) in `src/catalog/search.ts`. The tool schema text says
"default 5, max 50". `test/server.test.ts` checks that a page holds at most the default.

**Who and when.** The value 5 first appeared as the playground's search default (f80ea10f,
2026-07-06), with no recorded measurement. e3d0cd55 carried it to the public tool. Arm B measured it
as part of the bundle only. The maximum of 50 and the sandbox default of 10 date from the initial
snapshot.

**Free sensitivity check.** The lexical scorer ran on every routing lane at each limit. Each limit
was a separate call: `diversifyByService` sets a per-service quota from `limit`, so a page at limit
*k* is not the first *k* hits of a larger page. In 863 of 3,192 lane-limit checks the two differ.
Each cell shows hits out of n rows.

| Lane (rows) | Measure | 3 | 4 | 5 | 6 | 7 | 8 | 10 |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Legacy (338) | service in page | 292 | 309 | 327 | **323** | 330 | 331 | 333 |
| Legacy (182 card rows) | operation card, tolerant match | 78 | 100 | 113 | 115 | 124 | 127 | 130 |
| Legacy (182 card rows) | operation card, exact match | 21 | 25 | 30 | 31 | 35 | 37 | 38 |
| Extended (28 card rows) | operation card | 14 | 15 | 16 | 16 | 16 | 17 | 17 |
| Holdout (49) | expected card | 27 | 29 | 30 | 31 | 31 | 34 | 38 |
| Holdout (49) | forbidden card captured (lower is better) | 9 | 9 | 10 | 12 | 12 | 12 | 17 |
| Skills (23) | card | 23 | 23 | 23 | 23 | 23 | 23 | 23 |

The 5-card row matches the committed gate (`eval/gates.json`: legacy `cardHit5` 113). The known
lead holds exactly. Seven cards gain 11 legacy card hits and lose none, which is +6.0 points on 182
rows. The gains are `q-defi-aquarius-scf`, `q-eco-stablecoins-on-stellar`, `q-eco-wallets-overview`,
`q-edge-deep-explicit-request-research-tool`, `q-edge-deep-no-budget-limit`, `q-protocol-cap-process`,
`q-protocol-current-mainnet-version`, `q-scf-audit-bank`, `q-scf-build-award-cap`,
`q-scf-hummingbot-kelp-closed-rfp`, and `q-soroban-current-sdk-cli-version`. Several are live or
fresh-data questions, the stratum where arm B lost (0.646 against 0.707). That fits the round's
open question but does not prove it. On holdout, 7 cards gain one expected card and two forbidden
captures. **Six is a trap**: it loses 4 legacy service hits and 3 card hits that 5 gets.

**Size of a public page** (`search` tool over an in-memory MCP client, all 460 legacy and extended
questions):

| Limit | Mean bytes | p50 | p90 | Max | Pages over 20,000 bytes |
|---:|---:|---:|---:|---:|---:|
| 5 | 6,999 | 6,697 | 9,843 | 14,816 | 0 |
| 7 | 8,898 | 8,569 | 11,645 | 16,839 | 0 |
| 10 | 11,580 | 11,434 | 14,608 | 20,593 | 1 |
| 50 | 41,832 | 42,570 | 47,535 | 54,739 | 459 |

**Cost of 7 over 5.** A page grows by 1,899 bytes, about 475 tokens. Per question, the added cost is
475 × (the sum, over search pages, of how many later model calls reread each page). With two searches,
each reread three times, that is about 2.9k tokens, or 4.3% of arm B's 66,876. That stays well
inside the 41% arm B saved. Latency barely moves; this is a few kilobytes of JSON.

**Maximum 50.** No one has stated what a 50-card page is for. At that limit a page holds about 47
cards and 10.5k tokens, which crosses Claude Code's 10,000-token warning. The largest page in the
run would be spilled to a file. In the Grok CLI it loses everything past 20 KB. A search for many
candidates belongs inside `execute`, through `codemode.search`, where the script filters before
anything reaches the model.

**Recommendation.**

- Default: **measure** with M1. Do not move it to 6.
- Maximum for the public tool: **measure, then recalibrate to 10**. Every page in the run fits Claude Code, and all
  but one fit the Grok clip. Keep 50 for `codemode.search`. Before changing it, read the logged
  `requestedLimit` distribution in Workers observability. That check is free, and its counts stay
  out of the repo.

### 4. Card text: 220-character description, 135-character caveat, 100-character field prose, 400-character nextSteps

**Who and when.** 220 is the playground's `DEMO_HIT_DESCRIPTION_CHARS` (f80ea10f), copied by
e3d0cd55. 135 is derived (d7e13d98): it leaves 85 characters of description. 100 and 400 came with
e3d0cd55. Arm B measured all four only as part of the bundle.

**Free check.** Ranking reads the full manifest entry, never the card, so card hits do not depend
on these caps. They change only what the agent sees when it chooses among hits. Catalog
descriptions are long (median 613 chars, p90 952; 79 of 80 non-section entries exceed 220), so
every served card is clipped. A rough proxy for lost choosing signal: a query word of four or more
letters that the full description contains and the card does not. On the 338 legacy questions, that
happens on 76% of served hits at 220, 62% at 300, and 51% at 400. Moving to 400 costs up to 180
characters per card, about 225 tokens per five-card page. The longest `nextSteps` over 460 queries
is 325 characters, so the 400 bound never binds.

**Recommendation.** Keep all four. The term-loss proxy is weak, and it is cheaper to learn from M1's
stored-answer step whether wrong picks came from text cut off the cards. The 400 is a guard on text
we write, and it costs nothing.

### 5. The execute boundary: 6,000 tokens

**Where.** `DEFAULT_MAX_TOKENS = 6000` and `CHARS_PER_TOKEN = 4` in `src/policy/truncate.ts`, and the
`EXECUTE_MODEL_BOUNDARY_MAX_TOKENS: "6000"` variable in `wrangler.jsonc` (range 1,000–32,000). The
same budget cuts errors and logs. The `execute` description says "capped near 6k tokens". The
source-basis manifest (up to 1,600 characters) rides on every truncated result.

**Who and when.** It is in the initial snapshot (7e83d1c5). `src/executor/spec-sandbox.ts` says the
constants are "verbatim from @cloudflare/codemode/dist/mcp.js". Installed `@cloudflare/codemode`
0.5.1 still has `MAX_TOKENS = 6e3`. No Raven record measures it. The 2026-07-07 tuning commit
(def2f963) added the override, not the number.

**Class.** An inherited guess: someone else's default, never measured for this workload.

**What it costs and buys.** It binds often. On the held-out first look, 275 of 565 `execute`
results from the three decisive clients exceeded 20,000 bytes, which means they were close to the
cap. A capped result runs about 24,000 + 1,600 characters, about 6.4k tokens, reread on every later
call. That makes the cap the largest single per-result term on the surface. It interacts with an
external fact, re-verified today. The Grok CLI's embedded docs (v1.0.77) read: "MCP tool-result
size cap: large MCP / `use_tool` results are truncated inline (full payload spilled under the
session `mcp/` folder). Default is **20_000 bytes**." So in Grok, about half of capped results lose
their tail, which holds the source-basis manifest and the artifact pointer.

The other side of the trade is in the round as well. Squeezing evidence into a 4k-token pack lost 6
points of fact support. That was a scored pack, not a plain cut, so it does not settle the question.

**Recommendation.** Measure with M2. It needs no code change, because the boundary is an
environment variable. `.agents/TODO.md` already holds "Keep a default `execute` result under the
Grok CLI clip" (about 18 KB); M2 is the measurement that item needs.

### 6. Timeouts and call limits

- **`EXECUTE_TIMEOUT_MS = 60_000`.** From the initial snapshot. The `DynamicWorkerExecutor` default
  is 30 s. It is the only wall clock around Lumenloop and Scout calls. Keep it, after a free telemetry read: the timeout rate per
  execute and the share of runs above about 50 s. Codex's default `tool_timeout_sec` is 60, so a run near
  Raven's limit can lose its structured timeout result to the client.
- **Lumenloop and Scout have no per-call timeout.** `fetch` in both adapters has no `signal`. One
  hung upstream holds a `Promise.all` script until the 60 s limit, and the agent gets a timeout
  instead of the other calls' results. Stellar Docs closed the same gap with a measured 24 s
  budget. This is a missing cap, not a bad one. Read p99 latency per operation from telemetry
  first, then size a budget the same way.
- **Stellar Docs: 8 s and 12 s attempts, 24 s per operation.** Measured. In the A/B, p99 was
  3,717 ms and 4 of 1,498 first attempts ran past 8 s. One `get_doc_page` once ran 88 s (Mintlify
  round, item 2). Keep.
- **Skill fetch 8 s and read 20 s.** Derived. 4a00ff27 found that two attempts × 8 s × 4 files was
  64 s, more than the executor's 60 s. **Runner 30 s** is a guess that fits inside 60 s. Keep both.
- **Artifact info 8 and read 4 per execute.** Guesses. They bound host work. Model tokens stay under
  the 6k cap. Keep them; telemetry shows whether any run hits them.
- **No call-count cap in `execute`**, and no length cap on its code, apart from the playground's
  8,000 characters. ARCHITECTURE.md states this deliberately. The 60 s limit and the 6k cap bound
  what a model can spend. Keep.

### 7. Smaller caps, kept as they are

`COMPACT_OUTPUT_THRESHOLD` 2,000 (measured over the manifest), `TIER_INTERLEAVE_MARGIN` 1.6 (measured
by a sweep; the table is not in the repo), the source-basis inner caps, log shaping, the skill
notice at 5,000, artifact 2 MiB and 7 days, the R2 metadata limit of 8,192 bytes (external; R2
limits page re-checked today: "Object metadata size 8,192 bytes"), the Stellar Docs snippet and
error clips, the boundary override range, and the playground caps. Each is in the summary table.
None showed a cost worth a change. The playground caps are spend guards the owner set for a public
demo, not answer-quality choices.

## Paid tests, smallest first

Each needs its own authorization under the `run-evals` skill. Run them on `hc` with the
subscription CLIs against the local `npm run dev:eval` server.

| Id | Question | Free step first | Smallest paid run | Decide by | Stop rule |
|---|---|---|---|---|---|
| M1 | Does a default of 7 recover arm B's live-data loss? | Replay each stored arm B search query from the round archive through the scorer at limits 5 and 7. Count live-data wrong answers where the needed operation appears only at rank 6 or 7. If none, stop: keep 5. | Arm B with default 7 against default 5, interleaved, only on the cases the free replay flags (the needed operation at rank 6 or 7, answer wrong) plus a few controls, with Sonnet 5.5 and GPT-6.1 Terra | Score difference and client tokens per question | Move to 7 if the flagged cases gain and the computed token rise is at most 5%; otherwise keep 5 |
| M2 | Can the execute boundary drop to 4,000 tokens? | Re-truncate the stored arm B `execute` results at 16,000 characters and check whether facts cited in the stored answers appear only between 16,000 and 24,000 characters of the raw result. If none do, the paid run only confirms. If many do, 4,000 is unlikely to hold: skip the run. Also count how often a returned value exceeds 16,000 characters. | `EXECUTE_MODEL_BOUNDARY_MAX_TOKENS=4000` against 6,000 on the 61-case tuning subset, with Sonnet 5.5, GPT-6.1 Terra, and Grok 4.7. Run Grok in the Grok CLI so the 20 KB clip applies. | Score within the round's 0.05 margin; tokens per question; artifact reads per question | Keep 6,000 if score falls by more than 0.05 (the margin the 61 cases can resolve) or artifact reads rise enough to cancel the saving. Consider 4,500 tokens too: 18,000 characters plus the 1,600-character source-basis manifest is under the Grok clip of 20,000 bytes. |
| M3 | Is the micro-map worth 542 tokens per call? | None. Its value only shows in agent behavior. | Claude Code v2.1.296 or later (Sonnet 5.5), instructions with and without the micro-map, on the 61-case tuning subset | Score and source-family misses | Drop the map if the score is within noise. On 61 cases that resolve only 0.05, most outcomes land within noise, so this is a decision by default: the burden of proof is on the map, which the owner may accept under "cost counts". Only Claude Code is known to read the map |

M1 and M2 are independent, and M2 needs no code. M3 is the lowest priority. The token side of M1
needs no paid run: pages are deterministic, so the +1,899 bytes per page times the rereads in the stored
arm B transcripts gives the client-token change exactly. Only the score side needs models.

## Re-verifying the external facts

| Fact | Today | How to re-check |
|---|---|---|
| Claude Code: 4,096 chars for instructions and tools loaded up front; 16,384 through tool search | Verified (docs; v2.1.325 session context) | code.claude.com/docs/en/mcp, "For MCP server authors". In a Claude Code session connected to Raven, check that the micro-map's last authority rule appears in context. |
| Claude Code MCP output: 25,000 tokens, warning at 10,000, file above 50,000 chars | Verified (docs) | code.claude.com/docs/en/env-vars, `MAX_MCP_OUTPUT_TOKENS` |
| Grok CLI MCP result clip: 20,000 bytes, head kept | Verified (v1.0.77 embedded docs) | `strings "$(readlink -f "$(which grok)")" \| grep -A3 "MCP tool-result size cap"` |
| R2 custom metadata: 8,192 bytes | Verified | developers.cloudflare.com/r2/platform/limits |
| `@cloudflare/codemode` default boundary: 6,000 tokens | Verified (0.5.1) | `grep MAX_TOKENS node_modules/@cloudflare/codemode/dist/mcp.js` |
| Codex and ChatGPT handling of server instructions | Partly verified (vendor docs: read, keep the first 512 characters self-contained; no cut stated) | `developers.openai.com/codex/mcp`, `developers.openai.com/plugins/build/mcp-server`; the measured probe, `2026-11-14-client-text-limits.md`, when it lands |
| Codex long-result handling (`tool_output_token_limit`) | **Not verified** | Codex config reference; not exposed in the 0.167.0 binary strings |
| claude.ai web and Claude Desktop: server instructions dropped; tool descriptions arrive | Community evidence only | `anthropics/claude-ai-mcp#93`; the measured probe, when it lands |
| Claude Code before v2.1.296 cuts instructions at 2,048 | Verified (docs; outside measurement on 2.1.285) | `code.claude.com/docs/en/mcp` |

## Method

- Provenance: `git log -S"<constant> = <value>"` for every constant, then the commit bodies, the
  ADRs, `research/audits/`, and `.agents/rounds/`.
- Routing sensitivity: a temporary Vitest file (deleted, not committed) imported `getCatalog` and
  `searchCatalog` and graded each lane with `eval/lib/grade.mjs` (`cardMatches` for legacy and
  extended, `cardMatchesExact` for holdout, as `eval/run-routing.mjs` grades them). Each limit was
  a separate call.
- Page size: the same file registered `registerTools` on an in-memory MCP pair and called `search`
  for all 460 legacy and extended questions at limits 5, 7, 10, and 50, measuring the text block in
  UTF-8 bytes.
- Card clipping: `clipProse` applied with the `cardCaveat` rule at 160, 220, 300, and 400 to every
  hit served for the 338 legacy questions at limit 5.
- Lengths: `BASE_SERVER_INSTRUCTIONS` 1,899, `SERVER_INSTRUCTIONS` 4,066, `MICRO_MAP` 2,165,
  `SEARCH_DESCRIPTION` 1,930, and `EXECUTE_DESCRIPTION` 2,029 characters, read from the modules at
  this commit.

## Applied

Date: 2026-11-14. The two recommendations that change no model-facing text and no runtime
behaviour. The audit above was written before items 1 and 2; item 4 folds the review's non-blocking
findings into it. No description,
instruction, micro-map, card, limit, or timeout changed. `src/mcp/micro-map.ts` lost two unused
exports and its text is byte-identical.

**1. Claude Code limit recalibrated to 4,096.**

- Re-verified first. The Claude Code MCP docs page (`code.claude.com/docs/en/mcp`, "Connect Claude
  Code to tools via MCP", the section on tool search for MCP server authors) reads: "Server
  instructions, and the description of a tool that loads upfront: 4,096 characters", and "Before
  v2.1.296, the shorter limit was 2,048 characters". The page shows no date or version of its own.
  The check ran while v2.1.325 was current, and the audit's session check agrees.
- `test/helpers/mcp-tool-metadata.ts` now holds `CLAUDE_CODE_INSTRUCTIONS_CAP_CHARS` and
  `CLAUDE_CODE_TOOL_DESCRIPTION_CAP_CHARS`, both 4,096. Its comment cites the page, the section,
  the v2.1.296 change, and the date read.
- `test/mcp-instructions.test.ts` imports both. A new assertion holds the whole `SERVER_INSTRUCTIONS`
  (4,066 characters, 30 under) to 4,096. The tool description test uses the description constant.
  The load-bearing-phrase test slices at the new limit.
- Kept: the BASE-first order test, and BASE at most 2,000 characters (BASE is 1,899), which
  protects a client still on the old limit. Retiring the 2,000 stays open until Codex and Grok
  instruction handling is known. The old assertion that the whole string exceeds the limit became
  "longer than BASE", because it is no longer true.
- Comments and `ARCHITECTURE.md` now state 4,096, with 2,048 as the pre-v2.1.296 limit.

**2. `MICRO_MAP_MAX_TOKENS` and `FAMILY_LINE_MAX_TOKENS` retired.**

- Removed both constants, their two build failures, `estimateTokens`, and the two
  `*_TOKEN_ESTIMATE` exports in the generated file. Nothing outside the build script and
  `test/micro-map.test.mjs` read them. The build log now prints character counts.
- The total guard replaces the micro-map gate. The pre-v2.1.296 description guard (Applied 3) bounds
  `FAMILY_LINE`, which sits inside the `search` description. `test/micro-map.test.mjs` keeps the
  staleness check and compares the committed text to a fresh render.
- Left alone, as the task required: `SEARCH_DEFAULT_LIMIT`, `MAX_SEARCH_LIMIT`, the `execute`
  boundary, card lengths, timeouts.

**3. Review blocking finding B1 applied** ([review](2026-11-14-caps-audit-review.md)). The branch had
raised the description test to 4,096 and retired the family-line gate, which left the descriptions with
no bound below 4,096 while BASE kept its old-limit bound. It now protects old-limit clients for all
three fields:

- `test/helpers/mcp-tool-metadata.ts` exports `CLAUDE_CODE_PRE_V2_1_296_CAP_CHARS = 2_048`, with a
  comment that it is retired together with `BASE_BUDGET`.
- `test/mcp-instructions.test.ts` holds `SEARCH_DESCRIPTION` and `EXECUTE_DESCRIPTION` to it, in
  "tool descriptions — one contract inside the character cap". Growth past it needs a measured reason.
- `ARCHITECTURE.md` states that each description is also held to the pre-v2.1.296 limit of 2,048.
- The other route the review named, an owner decision to drop old-client protection everywhere
  including `BASE_BUDGET`, is not taken.

**4. Review non-blocking findings N1 to N6 folded in**, documentation only, no code:

- N1: the client table in section 1 records Codex and ChatGPT (vendor docs), claude.ai web and Claude
  Desktop (community evidence), and Claude Code before v2.1.296, each with source and evidence class.
  The "Re-verifying" table and the TODO item no longer say Codex was never verified. A four-client
  measured probe is in progress and will be added as `2026-11-14-client-text-limits.md`.
- N2: Codex's 60-second `tool_timeout_sec` is recorded on the `EXECUTE_TIMEOUT_MS` row and in section 6,
  with a free read of `execute` wall time above about 50 s ahead of "Keep".
- N3: `FAMILY_LINE` is 359 characters, not 360.
- N4: the review's critique of M1 to M3 (it carries no number of its own) is applied to the paid tests
  table and to the TODO entries: M1 closes with a win rule and runs only on flagged cases; M2 gets a
  free re-truncation step, one threshold of 0.05, and a 4,500-token option; M3 says plainly that the
  burden of proof is on the map.
- N5: the `MAX_SEARCH_LIMIT` recommendation reads "Measure, then recalibrate" and notes that it needs
  its own review.
- N6: the total guard's failure shows only two numbers. Pointing its message at
  `scripts/catalog-data/source-families.mjs` and `src/mcp/tools.ts` changes a test, so it is an open
  item in `.agents/TODO.md`.

**Open items.** `.agents/TODO.md`, section "Caps audit follow-ups": M1, M2, M3, the free telemetry
reads (`requestedLimit`, Lumenloop and Scout tail latency, artifact cap hits, `execute` timeout
rate), the external client limit re-check, and the total-guard message. Each has a done-when rule. None is authorized to
spend.

**Gates** for the first change, each run bare in this worktree after `npm run typegen` (the first `typecheck` failed
only because the ignored `env.d.ts` was missing, as `AGENTS.md` warns for a fresh clone):

| Command | Exit | Result |
|---|---:|---|
| `npm run typecheck` | 0 | clean |
| `npm test` | 0 | 150 files passed, 1 skipped; 3,399 tests passed, 3 expected fail, 1 skipped |
| `npm run build` | 0 | dry run completed |
| `npm run test:smoke` | 0 | 9 files, 141 tests passed |
| `npm run eval:routing -- --gate` | 0 | GATE PASS, committed evidence verified |
| CI "generated artifacts in sync" steps, then `git diff --exit-code` over its paths | 0, 0 | no drift |
| `npm run secrets:scan -- --tree` | 0 | clean |

**Gates after B1 and the review fold-in**, each run bare in this worktree:

| Command | Exit | Result |
|---|---:|---|
| `npm run typecheck` | 0 | clean |
| `npm test` | 0 | 150 files passed, 1 skipped; 3,400 tests passed, 3 expected fail, 1 skipped (one new: the pre-v2.1.296 description guard) |
| `npm run build` | 0 | dry run completed |
| `npm run test:smoke` | 0 | 9 files, 141 tests passed |
| `npm run eval:routing -- --gate` | 0 | GATE PASS, committed evidence verified |
| `npm run secrets:scan -- --tree` | 0 | clean |
