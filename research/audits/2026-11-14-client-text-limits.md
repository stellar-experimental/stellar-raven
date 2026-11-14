# Client text limits: how much MCP server text each agent CLI delivers to its model

Date: 2026-11-14. Branch `research/client-text-limits`, from `origin/main` at 06757beb. No repository
code changed. Models were driven through their subscription CLIs as headless sessions, with `hc` running
the batches. Nothing was billed to an API. The evidence folder is
[`2026-11-14-client-text-limits/`](2026-11-14-client-text-limits/).

Clients as installed: **Claude Code 2.1.325**, **Codex 0.167.0**, **Grok CLI 1.0.77**, **OpenCode v2.2.7**.
Answering models: Claude Sonnet 5.5 (effort low), GPT-6.1 Terra (effort low, plus one GPT-6.1 Sol
session), Grok 4.7 (effort low), and OpenCode's free `opencode/big-pickle`. OpenCode was run on a free
model on purpose, because the roster's subscription models do not include an OpenCode path.

**Headline.** The four clients deliver server text in four different ways, and only one of them is a
plain character cut.

- **Claude Code** cuts at **4,096** characters and appends `… [truncated]` (13 characters). That applies to
  server instructions and to a tool description loaded up front. A description loaded through tool search
  is cut at **16,384**. This matches the vendor docs exactly. Raven's 4,066-character instructions, 1,930-character
  `search` description, and 2,029-character `execute` description arrive whole, both directly and through
  the claude.ai connector.
- **Grok CLI** cuts at **2,033 characters plus the 13-character marker** (2,046 total) for server instructions
  and for any tool description. It also turns the instructions' line breaks into spaces. The docs state no such cut. Raven's
  instructions lose their second half (the micro-map after its first source line). Both tool descriptions
  arrive whole.
- **Codex** does not put the instructions in context. Its tool catalogue shows **one line of at most about 230
  characters** per server. Raven's line is its 133-character first paragraph. The full instructions are
  appended to every tool description inside a JavaScript `ALL_TOOLS` list, which the model has to print
  itself, under a 10,000-token output budget. The vendor docs say to keep the first 512 characters
  self-contained and state no cut.
- **OpenCode** puts the instructions into the system prompt **whole** (tested to 20,000). It lists each tool
  up front with **only 120 characters** of its description. The full text is one sandbox `search` call away.

## Results

Characters are counted on the text the server sent. "Whole" means the last sentinel the server sent arrived.
Ground truth, where the client keeps a log of what it sent to the model, comes from that log, not from the
model's report (see Method). The model's quote agreed with the log everywhere both exist.

| Client | Version | Surface | Documented limit and source | Measured delivered characters | Truncate or drop | Per server or shared | Runs |
|---|---|---|---|---|---|---|---|
| Claude Code | 2.1.325 | Server instructions | 4,096. `code.claude.com/docs/en/mcp`, "Tool search for MCP server authors". Before v2.1.296 it was 2,048. | 20,000 sent: **4,096 kept** + `… [truncated]` (4,109 total). 4,090 sent: whole. | Truncate, marker appended | Per server: two copies each got their own 4,096 (20,000 sent) or 4,090 (4,090 sent) | 3 (20,000 sent), 3 (4,090 sent), 3 + 2 with two servers; transcripts of 5 more |
| Claude Code | 2.1.325 | Tool description loaded up front (`desc_a`, 20,000) | 4,096, same page and version | **4,096 kept** + marker. 3,000 and 500 sent: whole. | Truncate | Per tool; two copies each cut | same sessions |
| Claude Code | 2.1.325 | Tool description loaded through tool search | 16,384, same page (before v2.1.295 the 2,048 limit applied here too) | **16,384 kept** + marker | Truncate | Per tool | 3 + 1 transcript check |
| Claude Code | 2.1.325 | Tool input-schema property description | None stated | 20,000 sent: whole | none | n/a | all sessions |
| Claude Code | 2.1.325 | Tool result | Warns above 10,000 tokens, caps at 25,000 tokens (`MAX_MCP_OUTPUT_TOKENS`), saves to a file above 50,000 characters. "MCP output limits and warnings". | 40,000 sent: whole. 120,000 sent: **nothing inline**, only a message that names a saved file. | Drop to a file | n/a | every session; 2 with 120,000 |
| Claude Code via claude.ai connector (Stellar Raven) | 2.1.325 | Server instructions and tool descriptions | Same 4,096 and 16,384 | Raven: 4,066, 1,930, and 2,029 whole. The Todoist connector in the same session was cut at 4,096 + marker. | none for Raven | Per server | 1 transcript check, 2 model quotes |
| Codex | 0.167.0 | Server instructions in context | "Keep the first 512 characters self-contained"; no cut stated. `developers.openai.com/codex/mcp` (quoted in the caps-audit review). | One catalogue line per server: **233 characters** for one server (230 + `...`), **201** each for two. When the text has newlines, **only its first line** (127 sent as the first line; Raven: 133). | Truncate to a line, at a word boundary | Per server; the cut point moves when a second server is added | 4 (20,000), 3 (4,090), 6 (two servers), 1 with newlines |
| Codex | 0.167.0 | Server instructions, full text | Not documented | Appended **whole** to every tool description in `ALL_TOOLS`: 20,000 each, repeated per tool. Raven: 4,066 inside each of its two tools. | none | Per server, repeated per tool | same 14 sessions |
| Codex | 0.167.0 | Tool description | Not documented | `ALL_TOOLS` holds it whole: 20,000, 3,000, 500, plus a 139 to 142-character TypeScript wrapper. The model sees only what it prints, up to **10,000 tokens** of exec output, cut in the middle (`…N tokens truncated…`). | Model-side budget, middle cut | Per call | 14 sessions |
| Codex | 0.167.0 | Tool input-schema property description | Not documented | Kept as a `//` comment up to **4,800** characters, **dropped whole at 5,000 and above** (tested 300, 1,000, 3,000, 4,000, 4,100, 4,800, 5,000, 5,500, 8,000, 20,000) | Drop | Per property | 9 sessions, plus the 20,000 default in 14 more (always dropped) |
| Codex | 0.167.0 | Tool result | `tool_output_token_limit`, default 10,000 tokens (a third-party guide; the key is in the binary) | The script gets the whole result: 40,000 and 120,000. The model sees what it prints, in a 10,000-token budget. | Model-side budget | Per call | 14 sessions, 1 with 120,000 |
| Grok CLI | 1.0.77 | Server instructions | None stated | 20,000 or 4,090 sent: **2,033 kept** + `… [truncated]` (2,046 total), newlines turned into spaces | Truncate, marker appended | Per server: two copies each got 2,033 | 3 + 3 + 6 |
| Grok CLI | 1.0.77 | Tool description | None stated. Tools sit behind `search_tool` and `use_tool`. | 20,000 and 3,000 sent: **2,033 kept** + marker. 500 sent: whole. | Truncate | Per tool | 13 |
| Grok CLI | 1.0.77 | Tool input-schema property description | None stated | 20,000 sent: whole | none | n/a | 13 |
| Grok CLI | 1.0.77 | Tool result | MCP results are clipped at 20,000 bytes (`07-mcp-servers.md`, bundled with 1.0.77) | 40,000 and 120,000 sent: the first **20,000** characters, then a notice ("showing first 19.5 KB of 39.1 KB") and the path of a file that holds the rest | Truncate, tail goes to a file | Per call | 13 |
| OpenCode | v2.2.7 | Server instructions | "Added to the system prompt" in `<mcp_instructions>`; no limit. `opencode.ai/docs/mcp-servers` (page dated 2026-11-13). | 20,000, 4,090 and 4,066 sent: **whole** | none | Per server: two copies each whole | 3 + 3 + 6 |
| OpenCode | v2.2.7 | Tool description, up-front listing | Not documented. Code Mode is the default and `codemode = false` lists tools directly. | **120 characters** (117 + `...`) per tool | Truncate | Per tool | all 12 single-server and copy sessions; database check on 2 |
| OpenCode | v2.2.7 | Tool description, read through the sandbox `search` | Not documented | 20,000, 3,000 and 500: whole. Not every session ran the search. | none | Per tool | 6 of the 12 sessions ran the search |
| OpenCode | v2.2.7 | Tool input-schema property description | Not documented | 20,000 sent: whole | none | n/a | 10 of 12 sessions reported it |
| OpenCode | v2.2.7 | Tool result | Not documented | 40,000 sent: whole. 120,000 sent: the **first 400 lines (51,200 characters)** plus `[showing lines 1-400 of 938; full output saved to <path>]` | Truncate, rest goes to a file; reading that file clips each line at 2,000 characters | n/a | 12 sessions at 40,000, 1 clean session at 120,000 |

The number of runs per cell is filled in under "Runs and failures" below. A "session" is one fresh headless
run that asked the model to report all six surfaces.

### Where measurement and documentation disagree

1. **Codex: 512 characters versus about 230.** The docs tell authors to keep the first 512 characters
   self-contained and state no cut. In context, Codex shows one catalogue line of about 230 characters,
   and only the first line when the text has line breaks. The text is not lost, though: it is appended whole to every
   tool description in the JavaScript runtime. For Raven, the 512-character advice is moot, because the
   line the model sees is the 133-character first paragraph.
2. **Grok: no documented cut, measured 2,033 plus marker.** The bundled docs mention a cut only for tool
   results (20,000 bytes), and that figure matches the measurement. The 2,046-character figure, the newline
   flattening, and the per-description cut are undocumented.
3. **OpenCode: the docs say instructions go into the system prompt, and they do, whole.** The 120-character
   up-front tool line is undocumented.
4. **Claude Code: agrees.** One detail the docs leave out: the limit counts the characters kept. The marker
   comes after them (4,096 + 13 = 4,109), so a client-side length check against 4,096 sees a longer string.
5. **Codex schema comments:** nothing in the docs says a property description is dropped above about
   4,800 characters. Raven's longest property description is 217 characters, so it is not affected.

### What the four clients show for the real Raven (main at 51221dbc)

Raven's `SERVER_INSTRUCTIONS` is 4,066 characters, `search` is 1,930, and `execute` is 2,029. These came from the
dev server started with `npm run dev:eval` from this worktree (build at 51221dbc, same lengths and same last characters as
production as seen through the claude.ai connector). The server was stopped afterwards. The last
characters each model can quote:

| Client | Instructions: last characters the model can quote | `search` description | `execute` description |
|---|---|---|---|
| Claude Code 2.1.325 (up front and tool search) | **Whole (4,066).** `…start Scout/Lumenloop even when docs mention the topic, then use docs only to corroborate standards mechanics.` | Whole (1,930). `…Stellar Docs https://developers.stellar.org/docs.` | Whole (2,029). `…playbook sections; `r.data.sections` is an ARRAY of { section, content, url }.` |
| Claude Code via the claude.ai connector | Whole (4,066), same last characters | Whole | Whole |
| Grok CLI 1.0.77 | **Cut at 2,033.** `…Lumenloop (lumenloop; 18 ops): Community and editorial ecosystem intelligence: project directory/detail… [truncated]`. Scout, Stellar Docs, Skills, and the Authority Rules are lost. | Whole | Whole |
| Codex 0.167.0 | In context: only `Unified Stellar-ecosystem gateway: `search` discovers service operations and skills. `execute` composes them in sandboxed JavaScript.` (133). All 4,066 are appended to each tool's `ALL_TOOLS` description, which the model must print. | Entry is 7,153 characters: its 1,930 + the 4,066 instructions + a 1,157-character TypeScript wrapper that carries the property comments. Ends with its own tail. | Entry is 6,334 characters: 2,029 + 4,066 + 239 |
| OpenCode v2.2.7 | **Whole (4,066)** in the system prompt, same last characters | Up front, 120: `Ranked search over every exposed service operation (lumenloop.*, scout.*, stellarDocs.*) and whole skill. Hits are ca...` The full text needs a sandbox `search` call. | Up front, 120: `Run one JavaScript async arrow function in a sandbox with no network. It can call only the operations found with `sea...` |

What this means for Raven, as observations only: BASE (1,899 characters) fits inside Grok's cut and
Claude Code's cut. The micro-map is cut by Grok and shown only by Claude Code and OpenCode. Codex shows only the first line. OpenCode shows
only the first 117 characters of each tool description until the model asks. The 4,096 Claude Code guard
added in 51221dbc is the right figure. Grok's 2,046 is a second boundary that nothing in the repository tests today.

## Method

**Probe server.** A dependency-free stdio MCP server (`probe/server.mjs` in the evidence folder), written
outside the repository tree and run once per session. Its `initialize` result carries `instructions` of N
characters. Each text is a run of 128-character segments. A segment starts with a sentinel such as
`TA1-017-bakoru`: a two-letter surface code, the server copy number, a three-digit index, and a six-letter
word drawn from a per-session random seed. Every word is unique, so a model cannot guess the next one or the
last one. The server writes a manifest of every token. Surface codes: `IN` instructions, `TA`/`TB`/`TC` the
three tool descriptions (20,000, 3,000, and 500 characters), `SC` an input-schema property description
(20,000), `RS` a tool result (40,000, and 120,000 once per client). Instructions were measured at two sizes,
20,000 and 4,090, to separate "cut at N" from "dropped above N". Two copies of the server were registered
for the per-server versus shared question. Filler text is a fixed sentence, so a quoted tail is not unique
without its sentinel.

**Sessions.** Each session registered only the probe server (Claude Code `--strict-mcp-config`, Codex
`--ignore-user-config`, Grok and OpenCode with a private `GROK_HOME` or `XDG_*` directory and an empty
`HOME`), started fresh, and asked the model to call `result_probe` once and reply with one JSON object:
for each of six surfaces, the first sentinel, the last sentinel, and the last 80 characters it could see.
The prompt told the model to copy only what is in its context. A quoted last sentinel must be in the
manifest, which rules out invention. Delivered characters come from the last sentinel's index and from
matching the quoted tail inside the last segment (exact to the character). Where the tail did not match, the
result is given as bounds of one segment (3,982 to 4,109 in the Claude runs). The answering models
were the cheapest the roster allows for each client, at the lowest effort.

**Ground truth beyond the model's word.** Where the client keeps what it sent, I read that instead.
- Claude Code: with session persistence on, the transcript holds the exact `api-request-shape` (tool
  definitions after the cut) and the instruction attachment. Sentinel sessions P1 to P5, Raven sessions
  PR1 and PR2, and connector session c7.
- Codex: the rollout file lists each item the model received (`developer` messages, tool outputs) and the
  `exec` calls it made. The `ALL_TOOLS` lengths come from the JSON the model's own script printed, so they
  are the runtime's numbers, not the model's recollection.
- Grok: `chat_history.jsonl` holds the synthetic "MCP servers connected" message, the `search_tool` result,
  and the clipped result.
- OpenCode: the session database holds the instruction blob and the up-front tool namespace listing.

**Two loading paths.** Claude Code: `ENABLE_TOOL_SEARCH=false` (everything up front) and `=true` (tool
search). Codex: it has one path in this build: every MCP tool is deferred and reached through a JavaScript
`exec` tool (`tool_search_always_defer_mcp_tools` is a removed feature flag whose value is true). A
session with `--disable code_mode_host` failed closed, and GPT-6.1 Sol used the same path. Grok: only the
deferred path exists (`search_tool` and `use_tool`); the probe tools never appear in its tool definitions. OpenCode:
Code Mode is the default. `codemode = false` would list tools directly, but I did not run it.

**Documentation sources.** Claude Code: the docs page fetched today and the 2.1.325 binary (the description
cut function keeps N characters and appends `… [truncated]`; the constants 4,096 and 2,048 are present).
Codex: the caps-audit review's quote of the vendor docs, the `exec` tool description inside the rollout
(`max_output_tokens`, default 10,000), the binary's `tokens truncated` string, and a third-party guide for
`tool_output_token_limit`. Grok: the user guide bundled with 1.0.77. OpenCode: the MCP page of the docs,
dated 2026-11-13.

## Runs and failures

Every run is a separate fresh session. Counts below are what completed with a usable answer or ground truth.

| Client | Single server, 20,000 sent | Single server, 4,090 sent | Two copies, 20,000 sent | Two copies, 4,090 sent | Tool search or other path | 120,000 result | Other |
|---|---|---|---|---|---|---|---|
| Claude Code | 3 (+ P1, P2 transcripts) | 3 (+ P5) | 3 | 2 (+ P4) | 3 + P2 | 2 (E, P5) | Raven: PR1, PR2, r1 to r3; connector: c3 to c7 |
| Codex (Terra) | 4 | 3 | 3 | 3 | n/a (one path) | 1 | newline text 1, schema series 9, Raven 2 (+2 mis-scored), Sol 1 + Raven 1 |
| Grok | 3 + t2 | 3 | 3 | 3 | n/a (one path) | 1 | Raven 1 |
| OpenCode | 3 | 3 | 3 | 3 | n/a (one path) | 2 (one muddled by a combined call, one clean) | Raven 1 |

Failed or discarded attempts, so nothing is hidden:

- Claude Code: Sonnet 5.5's safety classifier stopped the answer in three of the first six two-server
  sessions (it reports `[reasoning_extraction]` or "a safety classifier stopped it"). Two were re-run and passed. The
  third, a 4,090-character two-server session (`C4090x2-2`), was stopped twice and is not counted. Its
  server-side facts are covered by `C4090x2-1` and `-3` and by the persisted P4 transcript. The persisted
  20,000-character two-server session P3 also had its answer stopped, but its transcript still shows
  what Claude Code sent (4,096 for each server).
- Claude Code connector: sessions c1 and c2 saw no connectors, because they ran with `--setting-sources project`.
  c3 mis-quoted the instructions (it quoted the end of the first section and reported 1,899), and c4 mis-quoted
  the `execute` tail. The persisted transcript c7 settles it: 4,066, 1,930, and 2,029 whole.
- Claude Code, Raven sessions: r1 and r3 low-effort quotes picked the wrong text near the end; PR1 and PR2 ground
  truth from the transcript is the reference.
- Codex: the first sentinel session timed out waiting on stdin (fixed by closing stdin). The Terra and Sol
  answers' own JSON was unreliable for the instruction surface, since it
  is not in context. The Codex columns come from the rollout and from the lengths the model's script printed.
- Grok and OpenCode: one OpenCode batch was killed and re-run after two batches wrote the same labels.
  OpenCode sessions often read only the 120-character up-front line and did not call `search`; those sessions
  report 117 or 122 for the descriptions, which is the up-front figure and not a cut of the full text.

## Raw sentinel evidence

Representative sessions (more in `results.json` in the evidence folder). The `tail` is what the model
quoted, in its last 60 characters.

**Claude Code, 20,000-char instructions, tools loaded up front** (`claude/A20k-2`, model-reported, checked against the server's token list)

| Surface | Length sent | First sentinel | Last sentinel | Last 60 chars quoted | Delivered |
|---|---|---|---|---|---|
| probe:instructions | 20,000 | IN1-000-kamabe | IN1-031-kotaza (valid) | ` through the field of pale grass until dusk fa\n… [truncated]` | 4096 |
| probe:desc_a | 20,000 | TA1-000-nudiza | TA1-031-mopumo (valid) | ` through the field of pale grass until dusk fa\n… [truncated]` | 4096 |
| probe:desc_b | 3,000 | TB1-000-tekaze | TB1-023-bedovo (valid) | ` fa\nTB1-023-bedovo - the quick brown fox jumps over the lazy` | 3000 |
| probe:desc_c | 500 | TC1-000-vulura | TC1-003-kifiba (valid) | ` dog and keeps on running through the field of pale grass un` | 500 |
| probe:schema | 20,000 | SC1-000-magevu | SC1-156-zaviro (valid) | `of pale grass until dusk fa\nSC1-156-zaviro - the quick brown` | 20000 |
| probe:result | 40,000 | RS1-000-sereme | RS1-312-tikopu (valid) | `312-tikopu - the quick brown fox jumps over the lazy dog and` | 40000 |

**Claude Code, tool search on** (`claude/D20k-1`, model-reported, checked against the server's token list)

| Surface | Length sent | First sentinel | Last sentinel | Last 60 chars quoted | Delivered |
|---|---|---|---|---|---|
| probe:instructions | 20,000 | IN1-000-zamone | IN1-031-somoti (valid) | ` through the field of pale grass until dusk fa\n… [truncated]` | 4096 |
| probe:desc_a | 20,000 | TA1-000-zudifi | TA1-127-pobuda (valid) | ` through the field of pale grass until dusk fa\n… [truncated]` | 16384 |
| probe:desc_b | 3,000 | TB1-000-pegapa | TB1-023-sasoda (valid) | `TB1-023-sasoda - the quick brown fox jumps over the lazy` | 3000 |
| probe:desc_c | 500 | TC1-000-pupedi | TC1-003-luniso (valid) | ` dog and keeps on running through the field of pale grass un` | 500 |
| probe:schema | 20,000 | SC1-000-rukifa | SC1-156-fikizo (valid) | `SC1-156-fikizo - the quick brown` | 20000 |
| probe:result | 40,000 | RS1-000-nupuvo | RS1-312-butabe (valid) | `312-butabe - the quick brown fox jumps over the lazy dog and` | 40000 |

**OpenCode, 20,000-char instructions** (`opencode/A20k-1`, model-reported, checked against the server's token list)

| Surface | Length sent | First sentinel | Last sentinel | Last 60 chars quoted | Delivered |
|---|---|---|---|---|---|
| probe:instructions | 20,000 | IN1-000-medala | IN1-156-fumude (valid) | `of pale grass until dusk fa\nIN1-156-fumude - the quick brown` | 20000 |
| probe:desc_a | 20,000 | TA1-000-dikoke | TA1-156-zezuze (valid) | `of pale grass until dusk fa\nTA1-156-zezuze - the quick brown` | 20000 |
| probe:desc_b | 3,000 | TB1-000-nenene | TB1-023-valogi (valid) | ` fa\nTB1-023-valogi - the quick brown fox jumps over the lazy` | 3000 |
| probe:desc_c | 500 | TC1-000-tevuva | TC1-003-satofi (valid) | ` dog and keeps on running through the field of pale grass un` | 500 |
| probe:schema | 20,000 | SC1-000-beresi | SC1-156-dizana (valid) | `of pale grass until dusk fa\nSC1-156-dizana - the quick brown` | 20000 |
| probe:result | 40,000 | RS1-000-robiba | RS1-312-kuzetu (valid) | `312-kuzetu - the quick brown fox jumps over the lazy dog and` | 40000 |



### Codex: what the rollout holds for one session (`codex/A20k-1`, Terra)

- Catalogue line for the server (a `developer` message): `- mcp__probe: IN1-000-… fa IN1-001-… - the quick brown fox jumps over the lazy dog and keeps on running through the field of...`
  (233 characters; the first sentinel is `IN1-000`, the last is `IN1-001`).
- `ALL_TOOLS` lengths the model's script printed: `desc_a` 40,142 (20,000 + 20,000 instructions + 142), `desc_b` 23,142, `desc_c` 20,642, `schema_probe` 20,221
  (82 + 20,000 + 139, so the 20,000-character property description is not in it), result 40,000.
- Second exec call, printing `desc_a`: `Warning: truncated output (original token count: 10036)`. The output holds the head of the text and a cut of 36 tokens in the middle.

### Grok: what `chat_history.jsonl` holds (`grok/A20k-1`)

- Synthetic user message: `- probe (5 tools): IN1-000-… ` 2,033 characters, then `… [truncated]`. The last sentinel in it is `IN1-015`.
- `search_tool` result: `probe__desc_a` 2,046 characters (2,033 + marker), `desc_b` 2,046, `desc_c` 500, `schema_probe` 82 with a 20,000-character `note` description.
- `use_tool` result: 20,000 characters (last sentinel `RS1-156`), then `[MCP output truncated: showing first 19.5 KB of 39.1 KB. Full output written to: …]`.

### OpenCode: what the session database holds (`raven-opencode/r1`)

- `instruction_blob`: `[{"server":"raven","instructions":"Unified Stellar-ecosystem gateway: …corroborate standards mechanics."}]`, 4,066 characters.
- Tool namespace listing: `raven.search` and `raven.execute` each carry `// <first 117 characters>...` (120 characters).

## What could not be measured, and why

- **Claude.ai web, Claude Desktop, ChatGPT, and the Codex IDE extension.** They are not CLIs on this machine.
  The caps-audit review records community evidence that claude.ai web and Desktop drop server instructions.
  This probe does not test them.
- **Other models per client.** Each client used one answering model (Codex also Sol once). Delivery is a client behavior in Claude Code,
  Grok, and OpenCode, and in Codex it did not differ between Terra and Sol. I did not test Opus, Fable, or other
  Codex or Grok models, or the Grok `*-build-fast` variant.
- **Codex without code mode.** Disabling `code_mode_host` made code mode fail closed and left the model with no
  way to reach MCP tools, so the non-code-mode catalogue could not be read. The Codex numbers are the code-mode ones.
  A different model catalogue could behave differently.
- **OpenCode with `codemode = false`.** Not run; it would list tool descriptions directly and might not
  apply the 120-character line.
- **Result limits between 40,000 and 120,000.** I tested two sizes. Claude Code's 50,000-character spill and
  Grok's 20,000-byte clip match the documented figures, but I did not bisect them.
- **Instruction sizes above 20,000 or below 4,066 for Codex.** The 233-character catalogue line was the same
  for 20,000 and 4,090. Whether an instruction under about 230 characters is shown whole is implied
  but not tested. Raven's first paragraph of 133 characters is such a case.
- **Interactive sessions.** Everything ran headless (`claude -p`, `codex exec`, `grok -p`, `opencode run`). The TUIs build the same system
  prompt in the cases I could compare, but I did not capture an interactive session.
- **The version drift.** These are exact for the versions listed. Re-check when a client updates, as
  `.agents/TODO.md` already says.
