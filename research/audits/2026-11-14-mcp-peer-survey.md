# MCP peer survey: how production servers spend their model-facing text

Date: 2026-11-14. Branch `research/mcp-peer-survey`. No code changed and no model was called. The
work was an unauthenticated MCP handshake against public endpoints, reading open-source code, and
reading vendor docs. No account was created and no credential was used or printed. Raw material is
in [`2026-11-14-mcp-peer-survey/`](2026-11-14-mcp-peer-survey/): the probe script, per-tool
description lengths (`stats.json`), and each server's instructions text (`instructions/`).

**Headline.**

- **Raven carries more fixed text than any peer, and the instructions are the outlier.** Its
  `SERVER_INSTRUCTIONS` is 4,066 characters. The next largest of 12 peers with instructions is
  DeepWiki at 3,890, then Linear at 2,873 and Parallel at 2,824. The peer median is 972. Raven's two
  tool descriptions total 3,959 characters. That sits mid-pack among code-mode servers: Cloudflare
  6,145 for its four tools (5,426 for `search` and `execute`), Executor 3,281.
- **Three peers share Raven's code-mode or gateway shape, and only Cloudflare uses the same
  6,000-token result cap.** Cloudflare's code-mode server has no instructions at all and puts its API
  surface into two tool descriptions. Executor splits the surface across `search`, `describe`, `call`
  and `execute`. Stripe's hosted server (docs only) exposes `stripe_api_search`, `stripe_api_details`,
  `stripe_api_read` and `stripe_api_write`.
- **Every peer that ships instructions loses them on claude.ai and Desktop** (community evidence,
  from the caps audit). The peers that cope repeat the critical rule inside a tool description
  (Executor, Cloudflare, Context7). Raven's descriptions already carry the contract.
- **Most peers meet Codex's 512-character advice only because they are short.** Three servers are under
  512 characters in full (Exa, Tavily, Hugging Face). Parallel's first 512 are an error-reporting rule
  (235 characters) and a concurrency rule, with tool selection starting at 579. Linear's first 512 are
  formatting and reference rules. Raven, GitHub, Executor, Perplexity, Sentry and Notion open with purpose.

## How to read this

**Evidence classes.** Each row says how its numbers were obtained.

- **wire.** An anonymous `initialize` and `tools/list` against the public endpoint on 2026-11-14,
  using `probe.mjs`. Lengths are `String.length` (UTF-16 code units) over the JSON the server sent.
- **source.** Extracted by script from the open-source repository at the commit named. No
  description was typed by hand. Dynamic parts (a product list, a runtime-built string) are noted.
- **session.** Text that a claude.ai connector delivered into this session's Claude Code v2.1.325
  context. It is post-client text: Claude Code cuts at 4,096, and the session showed no cut marker on
  these. Counts from a transcription are within a few characters.
- **docs.** Vendor documentation, with no description text.

A server's tools can differ by authentication, flags, or skills. The row says which set was counted.
The `tools/list` size is compact JSON re-serialised from the parsed tools array, so it is a close
lower bound on the wire bytes, not the wire bytes. A dash means the source holds no schemas to size.

**Client limits compared against** come from [`2026-11-14-caps-audit.md`](2026-11-14-caps-audit.md)
and [`2026-11-14-caps-audit-review.md`](2026-11-14-caps-audit-review.md):

| Client | Limit on server instructions | Limit on a tool description |
|---|---|---|
| Claude Code v2.1.296 and later | cut at 4,096 | up-front tool cut at 4,096; tool-search tool at 16,384 |
| Claude Code before v2.1.296 | cut at 2,048 | 2,048 (before v2.1.295, also for tool-search tools) |
| Codex (CLI, IDE, ChatGPT desktop) | read as server-wide guidance; "keep the first 512 characters self-contained" (advice, no cut stated) | not stated |
| claude.ai web and Desktop | dropped entirely (community evidence, `anthropics/claude-ai-mcp#93`) | delivered verbatim |

## Table 1: sizes

"Desc" is tool description length in characters. Instructions are in characters. `list` is the
`tools/list` size.

| Server | Evidence | Instructions | Tools | Desc min / median / max / total | `list` (chars) |
|---|---|---:|---:|---|---:|
| **Raven** (main) | repo, this audit's brief | 4,066 | 2 | 1,930 / 1,980 / 2,029 / 3,959 | not measured |
| Parallel (`mcp.parallel.ai/mcp`, anonymous) | wire | 2,824 | 7 | 216 / 572 / 1,263 / 4,533 | 37,113 |
| Parallel Search (`search.parallel.ai/mcp`) | wire | 1,824 | 3 | 567 / 572 / 1,263 / 2,402 | 19,863 |
| Perplexity (npm `@perplexity-ai/mcp-server` 1.4.0) | source `cd1d27c` | 660 | 4 | 413 / 447 / 487 / 1,794 | 8,227 |
| Cloudflare API (`mcp.cloudflare.com/mcp`, code mode) | source `7eb0b52` + session | none | 4 | 175 / 1,362 / 3,246 / 6,145 | — |
| Cloudflare docs (`docs.mcp.cloudflare.com/mcp`) | wire | none | 2 | 66 / 302 / 538 / 604 | 1,744 |
| GitHub (default toolsets, remote) | source `0663b83` + session | 1,802 | 46 (45 sized) | 36 / 82 / 1,115 / 6,339 | 104,335 |
| Context7 | wire | 703 | 2 | 547 / 1,277 / 2,006 / 2,553 | 5,227 |
| Linear (hosted, OAuth) | session | 2,873 | 78 | not measured | not measured |
| Notion (hosted, OAuth) | session | 1,202 | 77 | not measured | not measured |
| Sentry (hosted, OAuth; maximal set) | source `f48ec5d` | 741 | 73 | 63 / 795 / 2,029 / 67,142 | 317,895 |
| Stripe (hosted `mcp.stripe.com`) | docs | unknown | 15 | unknown | unknown |
| DeepWiki (anonymous) | wire | 3,890 | 3 | 45 / 59 / 108 / 212 | 1,719 |
| Exa | wire | 458 | 2 | 270 / 418 / 566 / 836 | 2,349 |
| Tavily (npm stdio `tavily-mcp` 0.2.23) | source `70d4d47` | 461 | 6 | 83 / 265 / 1,009 / 2,035 | 14,587 |
| Hugging Face (`huggingface.co/mcp`, anonymous) | wire | 304 | 4 | 191 / 374 / 3,674 / 4,613 | 19,876 |
| Executor (`mcp.executor.sh/mcp`) | source `dafa1a2` + session | 2,202 | 6 | 178 / 564 / 855 / 3,281 | — |
| Stainless-generated (template) | source `f376717` | fetched at runtime; fallback 464 | 2 | 76 / 574 / 1,072 / 1,148 | — |

Raven's median is the mean of its two descriptions, since n = 2. The 12 peers with instructions are
Parallel, Perplexity, GitHub, Context7, Linear, Notion, Sentry, DeepWiki, Exa, Tavily, Hugging Face
and Executor.

## Table 2: where the guidance lives and how big results are handled

| Server | Cross-tool guidance | Large results |
|---|---|---|
| **Raven** | Instructions (BASE then micro-map); both descriptions; annotations; no prompts or resources | Default search page about 4 to 10 KB, max limit 50 (about 41.8 KB average); execute capped at 6,000 tokens with a source-basis manifest; `structuredContent` |
| Parallel | Instructions (rules per tool); every description; `_meta` `anthropic/alwaysLoad` on `find_verticals` and `search_vertical`; annotations on all | Excerpts per call capped at about 25,000 chars (docs); `web_fetch` returns excerpts by default, `full_content` is opt-in and the schema warns it can exceed the client's limit; `outputSchema` |
| Perplexity | Instructions name each tool; every description ends with "use X instead"; annotations | `max_results` 1 to 20 (default 10); per-page tokens default 1,024 (256 to 2,048); `max_tokens` up to 120,000; `structuredContent` and `outputSchema` |
| Cloudflare API | None in instructions. `execute` says "First use the 'search' tool"; `search` carries spec types and examples; `execute` carries request types and an example; a `skills` extension serves `skill://` resources | Every `search` and `execute` result capped at about 6,000 tokens with a `truncate` argument to lift it; marker `--- TRUNCATED ---` plus the token count and "Use more specific queries" |
| Cloudflare docs | MCP prompt `workers-prompt-full`; tool descriptions; `migrate_pages_to_workers_guide` says "ALWAYS read this guide before migrating" | Semantic chunks; `outputSchema` on the search tool |
| GitHub | Instructions (tool selection, context management, per-toolset workflows); a PR review workflow also sits in `pull_request_review_write` (1,115 chars); `_meta.ui` resource URIs on 4 tools | `perPage` max 100; cursor `after`; `minimal_output` (default true on search); instructions say "batches of 5-10"; `outputSchema` on most |
| Context7 | Description of `resolve-library-id` ("You MUST call this ... before"); instructions say when to use it | Not measured (no tool call made) |
| Linear | Instructions (people-readable references, pagination, label replace, upload flow); parameter schemas | Cursor pagination named in instructions ("pass the returned cursor ... rather than assuming the first page is complete") |
| Notion | Instructions point to `notion://docs/...` resources and a `fetch id: "memory"` convention | Not measured |
| Sentry | Instructions (routing between tools); 49 of 73 descriptions name another tool; `<examples>` in 59 and `<hints>` in 39 descriptions; annotations; no prompts or resources | Per-tool caps, no global cap: `RESULT_LIMIT` 25 on find tools; `limit` 1 to 100 (default 10) on searches; time series 48 rows with "(most recent N of M)"; cursor on 9 tools; each description capped at 2,048 in code (`tools/types.ts:90`) |
| Stripe | Docs show a four-tool API gateway: `stripe_api_search`, `stripe_api_details`, `stripe_api_read`, `stripe_api_write`, plus 11 product tools | Not determinable (hosted code is not open source) |
| DeepWiki | Instructions restate the tool list; tool descriptions are one line | Not measured; `outputSchema` wraps text in `{result: string}` |
| Exa | Instructions repeat the descriptions; MCP prompt `web_search_help`; resource `exa://tools/list` | `numResults` default 10; `web_fetch_exa` `maxCharacters` default 3,000; "highlights" in search, full text via fetch |
| Tavily | Instructions are a research workflow; `tavily_search` says to confirm with `tavily_extract` | `max_results` default 5, max 20; raw content off by default; crawl output cut to 200 chars per page; no `structuredContent` |
| Hugging Face | One entry tool `hf_fs` carries the whole grammar and examples; instructions only say "start with hf_fs" and add an anonymous-rate-limit notice; a `skill://hf-cli/SKILL.md` resource list (33,873 chars) via the skills extension | `cat --max-bytes`, `--offset`, `--limit`; limits documented in-band at `hf://README.md`; `outputSchema` |
| Executor | Instructions are the entry skill; `execute` says "First read the Executor app's entry skill"; `skills` tool serves more | `search` page capped at 25,000 bytes with `next` cursor, default 10 items, first line of description only, input type cut and marked; `execute` and `call` have no result cap but set `_meta` `anthropic/maxResultSizeChars` 500,000 |
| Stainless template | Instructions fetched at runtime; the `execute` description holds the calling convention and an example | Not measured; code runs in a sandbox with no network |

## Table 3: fit against the client limits

"Cut" means the client would cut the text. Descriptions are checked individually.

| Server | Claude Code 4,096 | Older Claude Code 2,048 | Codex first 512 | Tool descriptions alone (claude.ai, Desktop) |
|---|---|---|---|---|
| **Raven** | Instructions 4,066 fit with 30 spare; both descriptions fit | Instructions cut: loses 2,018 chars, most of the micro-map (BASE is 1,899); descriptions fit (1,930; 2,029) | Purpose and workflow start, ends mid-word | Contract lives in the descriptions; BASE and micro-map absent |
| Parallel | Fits (2,824) | Cut at 2,048 loses 776: `find_verticals`, `image_search` guidance and the terms line (they start at 2,130 and 2,475) | Not self-contained: failure-reporting rule then concurrency rule; "Use web_search first" starts at 579 | Loses reporting, concurrency and fetch rules; `web_search` description is generic |
| Perplexity | Fits | Fits | Whole text is 660; first 512 name search, ask, research | Loses nothing important: every description ends "use X instead" |
| Cloudflare API | n/a (no instructions); `execute` 3,246 fits | `execute` 3,246 and `search` 2,180 are cut: `execute` loses everything from "Your code must be an async arrow function" (char 2,074), including the error contract and the example; `search` loses its last 132 chars (the final example) | n/a | Relies on descriptions alone by construction |
| Cloudflare docs | n/a; fits | Fits | n/a | Same |
| GitHub | Fits (1,802) | Fits | Purpose, tool selection, start of context management | Loses selection guidance and the PR review workflow (partly repeated in the 1,115-char `pull_request_review_write`) |
| Context7 | Fits | `resolve-library-id` is 2,006 and fits; instructions fit | The first 512 are when-to-use (the whole text is 703) | Loses little: `resolve-library-id` repeats the call-order rule |
| Linear | Fits (2,873) | Cut at 2,048 lands mid-word in `addLabe...`: the `labels` replace-all rule starts at 2,005 and loses its second sentence (use `addLabels` and `removeLabels`); mentions, uploads and "Agent notes" are lost (825 chars) | Formatting rule and reference rule, not a when-to-use | Loses all of it. The label rule matters: `save_issue` `labels` replaces the set |
| Notion | Fits (1,202) | Fits | Purpose, when to create pages, drafts | Loses `notion://docs/...` pointers and memory protocol |
| Sentry | Fits (741) | Fits | Purpose and first two routing rules | Loses routing; 49 of 73 descriptions name another tool |
| Stripe | Unknown | Unknown | Unknown | Unknown |
| DeepWiki | Fits with 206 spare (3,890) | Cut at 2,048 loses only more private-mode tool lines | Purpose, an org-header note, 3 real tools and the first private tools | Loses nothing: descriptions are one line and the instructions mostly list tools |
| Exa | Fits | Fits | Whole text (458) | Loses nothing important |
| Tavily | Fits | Fits | Whole text (461) | Loses the research workflow (it is not in any description) |
| Hugging Face | Instructions fit; `hf_fs` 3,674 fits | `hf_fs` 3,674 is cut: grammar and later rules lost | Whole text (304) | Complete: grammar and examples sit in `hf_fs` |
| Executor | Fits (2,202) | Cut at 2,048 loses 154 chars: the end of the feedback paragraph | Purpose, tool list, credentials, approvals | `execute` repeats the entry-skill pointer, so a client without instructions still bootstraps |
| Stainless | Fallback fits; fetched text unknown | Fits | Unknown | `execute` holds the convention and an example |

Counts against each limit:

- **Instructions over 2,048, so cut by older Claude Code:** Parallel (2,824, loses 776), Linear (2,873,
  loses 825), Executor (2,202, loses 154), DeepWiki (3,890, loses 1,842, all of it private-mode tool
  lines) and Raven (4,066, loses 2,018, most of the micro-map). Executor and DeepWiki lose little of
  value. Parallel, Linear and Raven lose rules or source guidance.
- **Instructions over 4,096:** none. Raven has the least headroom (30 characters). DeepWiki has 206.
- **Tool descriptions over 2,048:** Cloudflare `execute` (3,246) and `search` (2,180), and Hugging
  Face `hf_fs` (3,674). Three more sit just under the old limit: Raven `execute` (2,029), Sentry's
  longest (2,029; its code caps every description at 2,048) and Context7 `resolve-library-id` (2,006).
- **Self-contained first 512 for Codex:** Exa, Tavily and Hugging Face qualify because the whole text is
  shorter. Perplexity (660), Context7 (703) and Sentry (741) open with purpose or when-to-use. GitHub,
  Notion, Executor and Raven open with purpose and orientation. Parallel and Linear do not.

## Detail

### What each first slice contains

This is the content of the first 512, the 2,048 and the 4,096 characters. A server shorter than a
slice shows the slice as the whole text.

| Server | First 512 | To 2,048 | To 4,096 |
|---|---|---|---|
| Raven | Purpose line; workflow (classify, plan families, `search`, one `execute`); the start of the `codemode.skill.read` rule | The rest of BASE (envelope shape, soft-empty rule, evidence discipline, artifacts) and the first lines of the micro-map header | The micro-map: source families and authority rules |
| Parallel | Failure-reporting rule (235 chars); concurrency rule; start of "Use web_search first" at 579 | Per-tool rules for `web_search` and `web_fetch` | `web_decisions`, `find_verticals`, `image_search` rules; terms line |
| Perplexity | Purpose plus one "use X for Y" line per tool | Whole text (660) | same |
| GitHub | Purpose; tool selection (`list_*` vs `search_*`); start of context management | Pagination in 5 to 10, `minimal_output`, sort syntax rule, "call get_me first", Issues section, PR review workflow, PR template rule | same |
| Context7 | When to use (library, API, SDK, CLI), "even if you think you know the answer" | Whole text (703): the "do not use for" list | same |
| Linear | Escape-sequence rule; reference-resolution rule | Pagination, statuses and labels, `get_issue` vs `list_comments`, images and attachments, `save_*` semantics, patch edits; cut mid-word | Label replace rule, mentions and uploads, writing style, "Agent notes" |
| Notion | Purpose; when to create a page; draft rule | Whole text (1,202): memory protocol and docs pointers | same |
| Sentry | Purpose; "get_sentry_resource first"; do not look up the organization | Whole text (741): issue vs event search routing | same |
| DeepWiki | Purpose; OAuth org note; "Available tools" with 3 real tools and the first private tools (from char 553) | Private-mode tool lines | More private-mode tool lines. 3,337 characters (86%) describe tools absent from the anonymous `tools/list` |
| Exa | Whole text (458): "Only use tools returned by tools/list", per-tool use | same | same |
| Tavily | Whole text (461): research workflow rule | same | same |
| Hugging Face | Whole text (304): "start with hf_fs", anonymous rate-limit notice | same | same |
| Executor | Purpose; tool names; credentials; approvals; entry skill pointer | Find and call tools; `execute` use; app-building; feedback begins | Whole text (2,202) |

### Per-server evidence

**Parallel.** Wire. `https://mcp.parallel.ai/mcp` answers anonymously: protocol 2025-06-18, 7 tools,
instructions 2,824 characters. The older `search-mcp.parallel.ai/mcp` returns HTTP 401 `Unauthorized`;
`search.parallel.ai/mcp` answers with 3 tools and 1,824 characters of instructions, the same rules minus
the `web_decisions`, `find_verticals` and `image_search` paragraphs. The 7 descriptions are 216 to
1,263; the longest is `send_feedback` (1,263), a tool a model uses rarely. `find_verticals` and
`search_vertical` set `_meta` `anthropic/alwaysLoad: true`. All tools set the four annotation hints.
`web_decisions` and `send_feedback` carry the biggest schemas (3,823 and 2,175 chars). Docs
(`docs.parallel.ai/integrations/mcp/search-mcp`) say total excerpts per call are capped near 25,000
characters "to stay within typical MCP client output limits". The same session's claude.ai connector
delivered the same instructions and a `web_search` description of the same shape.

**Perplexity.** Source `perplexityai/modelcontextprotocol@cd1d27c` (2026-10-21, version 1.4.0),
`src/server.ts:566-572` for instructions. Descriptions are at `:619`, `:670`, `:707` and `:776`. The
session's connector carried an earlier build whose `search_context_size` wording differs ("search
context size control" where the source says "search token budgets"), so lengths here are for the
source. A probe of a remote `mcp.perplexity.ai/mcp` failed to connect from this machine.

**Cloudflare API.** Source `cloudflare/mcp@7eb0b52` (2026-11-12): `new McpServer(SERVER_INFO)` with no
options, so no instructions (`src/server.ts:75`); none appeared in the session's context either. The
`mcp.cloudflare.com/mcp` endpoint returns 401 with OAuth metadata, so the numbers are source plus the
session's tool list. Lengths: `search` 2,180 (with the 30-name product line and the 172 total), `execute`
3,246, `docs` 544 and `whoami` 175. `SPEC_TYPES` is 856 characters and `CLOUDFLARE_TYPES` 1,443; the
rest is prose and a worked example in each. `src/truncate.ts:20` sets `MAX_TOKENS = 6000` with four
characters per token, and its comment says the algorithm started as a port of `truncateResult` in
`@cloudflare/codemode`. The `truncate` argument's description reads "Cap the result at ~6,000 tokens.
Set to false only when the result goes straight to a file or pipe, not into the conversation: without
the cap, a broad query can return megabytes." The truncation marker is `--- TRUNCATED ---` followed by
"Response was ~N tokens (limit: 6,000). Use more specific queries to reduce response size."
(`truncate.ts:91`). `?codemode=false` switches to about 3,000 generated tools. The README says code mode costs about 1,100
tokens against 1,170,523 for full schemas. The current `search` and `execute` descriptions are 5,426
characters, about 1,350 tokens at four characters per token, so the two figures differ by about a
fifth. A skills extension serves `skill://<name>/<path>` resources, cached for an hour.

**Cloudflare docs.** Wire at `docs.mcp.cloudflare.com/mcp`: server `docs-ai-search` 0.5.0, 2 tools, no
instructions, one MCP prompt (`workers-prompt-full`). The tools carry annotations and the search tool an
`outputSchema`.

**GitHub.** Source `github/github-mcp-server@0663b83` (2026-11-13). `pkg/inventory/instructions.go`
joins the base paragraph with each enabled toolset's instructions. For the default toolsets
(context, issues, pull requests, with the repos clause) it is 1,802 characters. The session's context
held the same text, so it matches the connected server. The tool set is the 46 names that this session's
GitHub server lists. `pkg/github/__toolsnaps__/` holds 45 of them; `run_secret_scanning` has no snapshot.
Descriptions are mostly one line (median 82) and one tool is long: `pull_request_review_write` (1,115).
Schemas are large: the sized `tools/list` is 104,335 characters, of which descriptions are 6,339, so the
other 98,000 are schemas, annotations and `outputSchema`. Four tools set `_meta.ui.resourceUri`.
`minimal_output` is a parameter on the search tools, and the code path I read defaults it to true
(`pkg/github/search_tool_types.go:151`).

**Context7.** Wire, server 4.7.0: 703 characters of instructions, 2 tools, both annotated read-only.
`resolve-library-id` is 2,006 characters and ends "IMPORTANT: Do not call this tool more than 3 times per
question." `query-docs` says the same. Instructions say "Use even when you think you know the answer",
"Prefer this over web search for library docs" and a "Do not use for" list.

**Linear.** Session only (OAuth). Instructions are 2,873 characters transcribed from the context. The
session lists 78 tools, which agrees with a third-party report of 78 tools after an OAuth sign-in on
2026-11-02 (`upsy.ai`). Tool descriptions were not measured: there is no credential-free path to the wire, and loading all 78
schemas into this context would not give a script-countable length.

**Notion.** Session only. Instructions are 1,202 characters transcribed. The session lists 77 tools,
counting calendar, sessions and memory groups. They depend on workspace features. The official tool list is
`developers.notion.com/docs/mcp-supported-tools`. Descriptions were not measured.

**Sentry.** Source `getsentry/sentry-mcp@f48ec5d` (2026-11-14). `server-instructions.ts` builds the string
from the tools actually registered and drops rules for absent tools; its cap constant is 1,500 and the built
text is 741 for every skill subset tried. 73 tools in the maximal set; with the default-enabled skills
(`inspect`, `seer`) 50. Descriptions total 67,142 characters and input schemas 122,562; with
`outputSchema` the sized list is 317,895. `docs/mcp/harnesses.md:94` records the 4,096 client cap. The
file `tools/exposure.ts:19` sets `EXPOSE_ALL_TOOLS = true`, so the two gateway tools
`search_sentry_tools` and `execute_sentry_tool` are not registered today. Result caps are per tool (see
Table 2), with a 1 MiB request limit and 10,000 input elements.

**Stripe.** Docs only. `docs.stripe.com/mcp` lists 15 tools: four API tools (`stripe_api_search`,
`stripe_api_details`, `stripe_api_read`, `stripe_api_write`), account, Atlas, analytics, four Treasury
tools, documentation search, an implementation planner and feedback. The page says exposing many APIs
through `stripe_api_read` and `stripe_api_write` makes "much of the API available through MCP without
increasing the context window unnecessarily". The hosted server's text is not in the open-source
repositories: `stripe/agent-toolkit` ships no tool source, and its `ai-packages-final` branch is a pure
forwarder to `https://mcp.stripe.com`. The legacy local toolkit's 22 tool prompts (median 234 characters)
are not the hosted server and are not counted in the tables.

**DeepWiki.** Wire. 3,890 characters of instructions. The anonymous `tools/list` has 3 tools. The text
lists 25 tools, 22 marked "(private mode only)". That is 86% of the instructions on tools the client cannot
call. In this session, the authenticated connector's instructions contained the same list.

**Exa.** Wire, server 3.5.1. The instructions are conditional ("If web_search_exa is listed, use it...")
and repeat the descriptions. The server also exposes a prompt and a resource that list the tools. Tool
parameters carry defaults in text (`numResults` default 10, `maxCharacters` default 3,000).

**Tavily.** Source `tavily-ai/tavily-mcp@70d4d47` (2026-11-13), the npm stdio server. The remote
`mcp.tavily.com/mcp` returns 401, and I could not tell whether its tool set differs. Six tools. The longest
is `tavily_feedback` (1,009 characters of description and a schema that, with it, makes about 9,000 of the
14,587 characters of the list). `max_results` has default 5 and minimum 5.

**Hugging Face.** Wire, server 0.4.34. A single filesystem-style tool, `hf_fs`, is 3,674 characters and
holds the grammar, the scopes, examples and routing advice. Instructions are 304 characters. The server
declares the `io.modelcontextprotocol/skills` extension and lists `skill://` resources.

**Executor.** Source `UsefulSoftwareCo/executor@dafa1a2` (2026-11-14). Instructions are the generated
`executorIntro` (2,202 characters), the body of its entry skill. Six tools. `search` is 418 characters in
source. The session's `search` text is longer, because it adds the paging sentence, so treat the 564
median as a floor. `defaultSearchLimits` gives 10 items per page, and `searchPageBytes` is 25,000 UTF-8
bytes. `execute` has a 65,536-character code limit, a 5-minute timeout and 100 tool calls. The
`execute` and `call` results set `_meta` `anthropic/maxResultSizeChars: 500,000`, with a source comment:
"Claude Code saves a text result over 50,000 characters to a file unless the tool raises that threshold."

**Stainless template.** Source `stainless-api/stainless-api-typescript@f376717` (2026-03-02), plus the
Stainless docs. Every Stainless-generated MCP server has two tools: `execute` (1,072 characters, with a
worked example) and a docs search tool (76). Instructions come from
`https://api.stainless.com/api/ai/instructions/stainless-v0`, cached for 15 minutes. That URL returned HTTP
522 during this survey, so only the 464-character in-code fallback is known. The code appends a line
"You are a nice, friendly bot who really likes to help customers!". The changelog of 2026-01-13 says the
template dropped every scheme except code mode.

## How Raven compares

| Dimension | Raven | Peer range |
|---|---|---|
| Instructions | 4,066 | 304 to 3,890; median 972; 6 of 12 under 1,000 |
| Descriptions, code-mode peers | 1,930 and 2,029 (total 3,959) | Cloudflare 2,180 and 3,246; Executor 178 to 855; Stainless 76 and 1,072 |
| Fixed text per call (instructions + descriptions) | 8,025 chars (about 2,000 tokens at 4 chars per token) | Cloudflare 6,145; Executor 5,483; Parallel 7,357; Perplexity 2,454; Exa 1,294; GitHub 8,141 (Sentry about 67,900) |
| Default result page | 4 to 10 KB | Executor 25,000 bytes per page; Parallel about 25,000 characters per call |
| Largest result page | limit 50: 41.8 KB average, 54.7 KB largest | Executor 25,000 bytes; Perplexity 20 results at up to 2,048 tokens per page; GitHub 100 per page |
| Execute boundary | 6,000 tokens | Cloudflare 6,000 tokens (same source); Executor no cap |
| Tools | 2 | 2 to 78 |
| Text guarded in tests | Whole-string guard at 4,096 plus per-field guards | Sentry caps each description at 2,048 in code |

- **Where Raven is not an outlier.** Two tools, descriptions near 2,000, annotations on both, and a
  `structuredContent` result. That matches Sentry (descriptions to 2,029), Context7 (2,006) and
  Perplexity (annotations and `structuredContent`).
- **Where it is.** The instructions length. The peers with instructions over 2,500 (DeepWiki, Linear,
  Parallel) carry a tool list or rules about other tools. Raven's micro-map is a source catalog the model
  reads before it searches. No peer carries a catalog of that kind in its instructions.
- **Fixed text is a different axis from tool count.** GitHub's 8,141 characters of instructions and
  descriptions come with 98,000 more of schema, and Sentry's list is 318 KB. Raven's schemas were not
  measured here, so its list size is the open number.

## Patterns worth copying

1. **Put the bootstrap pointer in the tool description too.** Executor's `execute` says "First read the
   Executor app's entry skill", and Cloudflare's `execute` says "First use the 'search' tool". A client that
   drops instructions still gets the first step. Raven's descriptions already carry the contract, so this
   is the path claude.ai and Desktop take.
2. **Cap pages by bytes with a continuation, not by count.** Executor's `searchPageBytes` is 25,000 and
   returns `next`, with the first line of each description and the input type cut and marked. Raven's
   limit-50 page (41.8 KB average) is the outlier against it.
3. **Mark every cut in the result text.** Cloudflare says how many tokens the result was, the limit, and
   what to do ("Use more specific queries"). Sentry writes "(most recent N of M)". Raven's source-basis
   manifest marks truncated `execute` results.
4. **Expose the limit as an argument with a reason.** Cloudflare's `truncate` argument tells the model when
   turning the cap off is safe. The one peer with Raven's 6,000-token cap ships it with an escape hatch,
   where the caps audit's M2 would change the number.
5. **Raise Claude Code's spill threshold deliberately, or stay under it.** Executor sets
   `anthropic/maxResultSizeChars` to 500,000 on execution results. Raven's largest search page (54.7 KB)
   crosses the 50,000-character spill rule. Cutting the page is cheaper than raising the cap, but this is
   the lever peers use.
6. **Build instructions from what is registered.** Sentry drops rules for tools that are absent, and GitHub
   builds the text from enabled toolsets. Raven's micro-map is generated from the catalog at build time;
   I did not check whether a disabled source family drops its line.
7. **Keep a rarely used tool's description small.** Feedback tools are among the heaviest per-tool costs in
   small servers: Parallel `send_feedback` (1,263 characters and a 2,175-character schema) and Tavily
   `tavily_feedback` (about 9,000 of the 14,587 characters of its list). Executor instead puts its feedback
   pointer as the last sentence of `execute`'s description.
8. **State the dependent-call rule where the dependency is.** Context7's `resolve-library-id` has a MUST
   and a call-count cap in the description itself, so it survives a dropped instruction.
9. **Annotate.** Parallel, Context7, Exa, Perplexity, GitHub and Sentry all set tool annotations. Raven does
   already.

## Patterns to avoid

1. **Listing tools in the instructions.** DeepWiki's 3,890 characters are 86% a list of tools that are not
   served to anonymous clients. Exa and Perplexity restate their descriptions. The text counts against the
   same budget as real guidance.
2. **Putting a data-loss rule near the cut.** Linear's rule that `save_issue` `labels` replaces the whole set
   starts at character 2,005 of 2,873, so the older 2,048 cut splits it before the `addLabels` remedy.
   Raven's micro-map, which holds its source authority rules, begins at character 1,901.
3. **Runtime-fetched instructions.** Stainless fetches them from a URL at startup, with a fallback of 464
   characters. When the origin is down (522 here), a Stainless-generated server ships the fallback and logs only a console warning.
4. **A very long single-entry description with the grammar inside.** Hugging Face's `hf_fs` (3,674) is
   complete for claude.ai but is cut at 2,048 by older Claude Code and needs a README resource for the
   rest. It works because the tool is one verb with a small grammar. Raven's two-tool shape is the opposite
   case, with more surface to describe per tool.
5. **Instructions with no headroom.** Raven is at 4,066 of 4,096. No peer sits that close: the next closest is
   DeepWiki at 3,890 (206 spare). Parallel and Linear are the nearest to Raven's rule-heavy style, and both
   are around 2,800.
6. **Generated schemas that dwarf the prose.** GitHub's list is 104 KB for 6.3 KB of descriptions, and
   Sentry's is 318 KB for 67 KB. That cost is paid on every call unless the client defers tools.
7. **Branding in the instructions.** Stainless appends a persona line ("a nice, friendly bot") to
   code-mode instructions.

## What none of them solve

1. **No server can learn what its client delivered.** Claude Code cuts silently, claude.ai drops instructions,
   and Codex reads them without a stated limit. No peer reports truncation to the model or the operator.
   The only evidence is a client-side canary, as in `anthropics/claude-ai-mcp#93`.
2. **No peer publishes the value of its model-facing text.** I found no A/B of instructions, descriptions, or
   result caps in any source or doc read. If that holds beyond what I read, the caps audit's M1 to M3 would be
   the first measurements of their kind among these servers.
3. **No negotiated result limit.** Parallel caps near 25,000 characters, Executor 25,000 bytes, Cloudflare
   6,000 tokens, Sentry per tool. Each server guesses a typical client limit. Executor's `anthropic/...`
   `_meta` and Cloudflare's `truncate` argument are one-client and one-call workarounds.
4. **Code-mode API surface has no measured size optimum.** Cloudflare puts types into `execute` (3,246
   characters) and `search` (2,180); Executor keeps `execute` at 855 and moves signatures into `describe`;
   Stainless uses 1,072 plus a docs search; Stripe's docs show four gateway tools. None records which size
   answers best.
5. **The reread tax.** Every call rereads instructions and descriptions. Prompt caching lowers dollars, not
   tokens, and no peer budgets the fixed text against the answer's total.
6. **Instructions that cannot rely on delivery.** A server cannot tell, at write time, whether a rule can live
   only in instructions. Only the tool description is certain to arrive. The peers that act on this (Executor,
   Cloudflare, Context7) duplicate the critical rule into a description.

## Gaps in this survey

- Linear and Notion descriptions, schemas and list size were not measured. Their counts and instructions come
  from this session.
- Stripe's hosted text is unknown. Parallel's older endpoint, Tavily's remote server and Perplexity's remote
  were not reachable without credentials.
- Raven's own `tools/list` size was not computed, because no dependencies are installed in this worktree and
  no code was run.
- The Stainless template is eight months old, and its live instructions were unreachable.
- Client behaviour is from the caps audit and its review. I did not re-test claude.ai or Codex.
- `anthropic/alwaysLoad` and `anthropic/maxResultSizeChars` are quoted from peers' code and wire text. Their
  effect in Claude Code was not tested here.
