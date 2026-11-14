# Independent review: caps audit and its implementation

Date: 2026-11-14. Branch `research/caps-audit`: audit `1e8173a2` (Claude Opus, another session),
implementation `51221dbc` (Claude Sonnet). Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), high
effort, a fresh Claude Code v2.1.325 session. The Claude tier was taken on the orchestrator's
direct instruction. The reviewer differs from both authors as a session, not as a model family:
the audit author is also Claude Opus. No model was called for evaluation, and no QA case was opened.

## Verdict

**Not fit to merge yet. One blocking finding, with a five-line fix.** The headline external fact
holds, with high confidence. The diff changes no model-facing text and no runtime behaviour: the
served `initialize` instructions and the full `tools/list` are byte-identical to `origin/main`. The
new total guard fails at exactly 4,097 characters, a growth the old suite let through. Every gate
passes. The blocking finding is a guard the change dropped and did not replace.

**B1. The tool descriptions lost their only size bound below 4,096, while BASE keeps its old-limit
bound.** Before this branch, the 2,048-character test held both descriptions, and
`FAMILY_LINE_MAX_TOKENS` held the family line inside `search` to 600 characters. The branch raised
the description test to 4,096 and retired the family-line gate. The audit justified the retirement
with "it duplicates the description guard", which was true only at 2,048. Tried on HEAD: a 600-
character longer `FAMILY_LINE` (`search` becomes 2,530 characters) together with 100 characters
more `execute` text (2,129) passes `test/mcp-instructions.test.ts`, `test/micro-map.test.mjs`, and
`test/server.test.ts`, 103 of 103. The same edit fails 4 tests and the build script on
`origin/main`. Such a change would be clipped by any Claude Code before v2.1.296, the client the
branch keeps `BASE_BUDGET` for. It would also add tokens to every model call, which the audit itself
says needs "a measured reason". `execute` is at 2,029 characters, 19 under the old limit.

Fix. The branch must protect old-limit clients for all three fields or for none. The smaller change
protects all three:

1. In `test/helpers/mcp-tool-metadata.ts`, add
   `export const CLAUDE_CODE_PRE_V2_1_296_CAP_CHARS = 2_048;` with a one-line comment: the limit
   before v2.1.296, which the base contract and both descriptions still fit, to be retired with
   `BASE_BUDGET`.
2. In `test/mcp-instructions.test.ts`, in "tool descriptions — one contract inside the character
   cap", add:

   ```ts
   it(`keeps each description within ${CLAUDE_CODE_PRE_V2_1_296_CAP_CHARS} chars, the pre-v2.1.296 limit; growth past it needs a measured reason`, () => {
     expect(SEARCH_DESCRIPTION.length).toBeLessThanOrEqual(CLAUDE_CODE_PRE_V2_1_296_CAP_CHARS);
     expect(EXECUTE_DESCRIPTION.length).toBeLessThanOrEqual(CLAUDE_CODE_PRE_V2_1_296_CAP_CHARS);
   });
   ```

3. In `ARCHITECTURE.md`, change "Tests hold the whole instructions string and each description to
   4,096" to say that each description is also held to the pre-v2.1.296 limit of 2,048. In the
   audit's "Applied" section, item 2, change "The total guard and the description guard replace
   them" to name this guard as the one that bounds `FAMILY_LINE`.

The alternative is an owner decision to drop old-client protection everywhere, including
`BASE_BUDGET`. Either is consistent. The current middle state is not.

Non-blocking findings N1 to N6 are below. None needs to land on this branch.

## 1. The headline external fact

**Claim.** Since Claude Code v2.1.296, Claude Code cuts server instructions, and the description of
a tool that loads up front, at 4,096 characters. A tool loaded through tool search gets 16,384.

**Vendor documentation, read today.** `code.claude.com/docs/en/mcp`, under "Scale with MCP tool
search" › "Tool search for MCP server authors":

- "Claude Code cuts a tool description or server instructions that run past these default limits,
  and Claude sees only the text before the cut:"
- "**Server instructions, and the description of a tool that loads upfront**: 4,096 characters"
- "**The description of a tool that Claude loads through tool search**: 16,384 characters"
- "Before v2.1.296, the shorter limit was 2,048 characters, and before v2.1.295 it applied to every
  tool description, including one loaded through tool search."
- Under "Change the description length limits": `CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH` sets both
  limits to one number, and "Descriptions and instructions from some of the MCP servers that
  Anthropic hosts at `api.anthropic.com` reach Claude in full".

The changelog entry for 2.1.325 (November 13, 2026) reads: "Fixed new cloud sessions cutting MCP tool
descriptions loaded through tool search at 4,096 characters; the limit is now 16,384, as in other
Claude Code sessions". The 2.1.295 and 2.1.296 entries were not read verbatim: the changelog page is
1.3 MB.

**This session's own context.** This session runs Claude Code 2.1.325 (`claude --version`). Raven is
connected through the claude.ai connector, and its server instructions arrived in this session's
context in full. They run from "Unified Stellar-ecosystem gateway" through "then use docs only to
corroborate standards mechanics.", the last authority rule, with no truncation marker. The counts
match the repository (18, 30, and 12 operations; 20 skills, 204 sections). The served string is
4,066 UTF-16 code units, the unit JavaScript counts. It has one non-ASCII character, an em dash, so
it is 4,068 UTF-8 bytes. Either count is under 4,096. In the same context, another claude.ai
connector's instructions (Todoist) end in "… [truncated]". So this connector path is subject to the
cut, and the `api.anthropic.com` exemption does not explain the full delivery.

**Certainty: high** for Claude Code v2.1.296 and later at default settings. Three independent
sources agree: the vendor page, this session's context, and an outside measurement on Claude Code
2.1.285 that found the old 2,048 cut (`dev.to/rulestack`, 2026-10-07, run 2026-09-30). That
article also observed that Claude Code places instructions in a system reminder in the first user
turn, not in the system prompt. That does not change the token accounting. Three limits on the
claim remain. The docs page carries no date or version of its own. A user's
`CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH` changes both limits. A client older than v2.1.296 still
cuts at 2,048.

**Other clients.** Vendor docs are cited where they exist. Otherwise the evidence is community
evidence and is labelled so.

| Client | Server instructions | Evidence |
|---|---|---|
| Codex (CLI, IDE, ChatGPT desktop) | Read. "Codex reads the MCP `instructions` field returned during initialization and uses it as server-wide guidance… Keep the first 512 characters self-contained so the most important guidance is available when Codex is deciding how to use the server." No cut is stated. | Vendor docs, `developers.openai.com/codex/mcp`, read today |
| ChatGPT | Read. "ChatGPT and Codex use these instructions alongside tool metadata… Keep the most important details in the first 512 characters." | Vendor docs, `developers.openai.com/plugins/build/mcp-server` |
| claude.ai web and Claude Desktop | **Dropped entirely**, not cut. Tool descriptions do arrive: a 1,770-character description came through verbatim. | Community evidence: open issue `anthropics/claude-ai-mcp#93`, with a wire-level canary probe posted 2026-07-29. Not vendor-confirmed. |
| Grok CLI | Unknown. Its 20,000-byte MCP result clip is the only Grok limit the audit verified. | Audit (embedded docs, v1.0.77) |

The 512-character advice for Codex and ChatGPT is a weaker rule than Claude Code's cut. Raven's
first 512 characters hold the purpose line and the start of the workflow, and they end mid-word in
`codemode.skill.read(id, { sectio`. That is acceptable for "deciding how to use the server". Claude
Code is the only client known to read the micro-map. claude.ai and Desktop see neither BASE nor the
map, so for them the tool descriptions are the whole contract. This matters for N1 and M3.

## 2. No model-facing text or runtime behaviour changed

Method: a detached worktree of `origin/main` (`2f5f47fa`, the merge base) beside one of HEAD
(`51221dbc`).

- **Module values.** The SHA-256 of `SERVER_INSTRUCTIONS` (4,066), `BASE_SERVER_INSTRUCTIONS`
  (1,899), `SEARCH_DESCRIPTION` (1,930), `EXECUTE_DESCRIPTION` (2,029), `MICRO_MAP` (2,165), and
  `FAMILY_LINE` (359) is identical in both trees. `micro-map.ts` lost only the two
  `*_TOKEN_ESTIMATE` exports, and a search over the repository finds no remaining reader of them.
- **Served surface.** In each tree, `new McpServer(info, { instructions: SERVER_INSTRUCTIONS })` was
  built as in `src/server.ts:99`, `registerTools` was run, and an MCP client was connected over
  `InMemoryTransport`. The client's `getInstructions()` and the full `tools/list` result (names,
  descriptions, input schemas, annotations) were serialized. The two outputs, 10,887 bytes each,
  are byte-identical (SHA-256 `c4bc3eb3…`).
- **Runtime.** The `src/` diff touches only comments in `src/mcp/tools.ts` and the two dropped
  exports. `wrangler.jsonc`, `catalog/`, adapters, and executor are untouched. The playground prompt
  (`src/demo/prompt.ts`) builds on `SERVER_INSTRUCTIONS`, which is unchanged.

## 3. Growth paths after retiring the two token caps

**Micro-map: guarded, and more tightly than before.** The map changes when `catalog/manifest.json`
counts or `scripts/catalog-data/source-families.mjs` change, and the committed text is what deploys.
`prebuild` regenerates it, but `npm run deploy` does not. The new assertion holds the whole string.
Tried in a HEAD worktree by padding the Lumenloop authority sentence and regenerating:

| Tree | Padding | Instructions | `micro-map:build` | Tests |
|---|---:|---:|---|---|
| HEAD | +30 | 4,096 | exit 0 | 24 of 24 pass |
| HEAD | +31 | 4,097 | exit 0 | **fails**: "expected 4097 to be less than or equal to 4096" |
| origin/main | +31 | 4,097 | exit 0 | 23 of 23 pass: the old suite misses the cut |
| origin/main | +636 | 4,702 | exit 1 (701 > 700 tokens) | 2 fail |

The old 700-token gate fired only about 600 characters past Claude Code's cut. The audit's "it
protects nothing" is correct.

**FAMILY_LINE and both descriptions: bound loosened.** See B1. They are still bounded at 4,096, so
nothing is clipped in current Claude Code. But growth now costs tokens on every call and clips old
clients, and no test notices.

**Detection moved later. Accepted, with one note (N6).** `refresh.yml` runs `micro-map:build` and
used to file a refresh failure when the map passed 700 tokens. That build no longer fails, so a
total over 4,096 shows up first in `npm test`, on the drift-resolution branch or in CI. That
coverage is enough. Deploy preflight requires HEAD to equal `origin/main` but does not wait for CI
to pass, which was already true of every test-only guard.

## 4. Five audit rows checked against history and code

| Row | Audit says | Checked | Result |
|---|---|---|---|
| `COMPACT_OUTPUT_THRESHOLD` 2,000 | Measured | Comment at `src/catalog/output-compaction.ts:4-8`: a manifest measurement on 2026-07-06 put every output block at or below 1,350 characters except three Scout outliers. Introduced by `43297d7b` (2026-07-06). | **Confirmed** |
| `TIER_INTERLEAVE_MARGIN` 1.6 | Measured; the sweep table is not in the repo | The `bb25276b` body has the measured lane deltas and "margin sweep 1.5/1.6/1.7/1.8/2.0 recorded in solo://…" | **Confirmed**, including that the table lives only in the retired Solo scratchpad |
| `SEARCH_DEFAULT_LIMIT` 5 | Guess, bundle-measured; playground value from f80ea10f | `git log -S` points to `f80ea10f` (2026-07-06), which adds `DEMO_SEARCH_DEFAULT_LIMIT = 5` with no measurement. `e3d0cd55` carries it to `src/mcp/tools.ts:55`. `eval/gates.json` legacy `cardHit5` is 113. | **Confirmed** |
| `MAX_SEARCH_LIMIT` 50 | Guess, initial snapshot | `git log -S"MAX_SEARCH_LIMIT = 50"` finds only `7e83d1c5` (2026-07-03, initial snapshot), at `src/catalog/search.ts:191`. | **Confirmed** |
| Execute boundary 6,000 | Guess (inherited) | `src/executor/spec-sandbox.ts:34` reads "verbatim from @cloudflare/codemode/dist/mcp.js". Installed 0.5.1 has `MAX_TOKENS = 6e3` (`dist/mcp.js:9`) and `DEFAULT_MAX_TOKENS = 6e3` (`dist/index.js:377`). `src/policy/truncate.ts:18` is from `7e83d1c5`. | **Confirmed** |
| Lumenloop and Scout per-call timeout | None | No `signal` or `AbortSignal` in `src/adapters/lumenloop.ts` or `scout.ts`. Only `stellar-docs.ts`, `skills/source.ts`, and `demo/chat.ts` set timeouts. | **Confirmed** |

There is one small error. `FAMILY_LINE` is 359 characters, not 360. The token estimate of 90 is
unaffected.

## 5. The paid tests M1 to M3 and the recommendation table

Each test has a free step first, which is right. Each test is larger than the smallest test that
decides, and two have stop rules that do not close.

- **M1 (default 7 against 5).** The token side needs no paid run. Pages are deterministic, so the
  +1,899 bytes per page times the rereads in stored arm B transcripts gives the client-token change
  exactly. Only the score side needs models. It should run only on the cases the free replay flags,
  where the needed operation sits at rank 6 or 7 and the answer was wrong, plus a few controls. It
  should not run on all live-data cases of the tuning split. The stop rule covers only "tokens up
  more than 5% with no score gain". It never says when 7 wins. A rule that closes: move to 7 if the
  flagged cases gain and the computed token rise is at most 5%; otherwise keep 5.
- **M2 (boundary 4,000 against 6,000).** The decide-by column uses the round's 0.05 margin, but the
  stop rule keeps 6,000 on a fall of more than 0.03, which is below that noise floor on 61 cases.
  Pick one threshold. A stronger free step exists. Re-truncate the stored arm B `execute` results at
  16,000 characters and check whether facts cited in the stored answers appear only between 16,000
  and 24,000 characters of the raw result. If none do, the paid run is only a confirmation. If many
  do, 4,000 is unlikely to hold and the run can be skipped. Also consider 4,500 tokens: 18,000
  characters plus the 1,600-character source-basis manifest is under the Grok clip of 20,000 bytes,
  which is the target of the existing TODO item.
- **M3 (micro-map with and without).** "Drop the map if the score is within noise" on a 61-case run
  that can only resolve 0.05 is a decision by default. Most outcomes land within noise. That may be
  the right owner call under "cost counts", but the record should say so plainly: the burden of
  proof is on the map. Section 1 also narrows M3's population. Only Claude Code is known to read the
  map. Codex and ChatGPT emphasize the first 512 characters, and claude.ai and Desktop drop the
  instructions entirely.

**Recommendation table.**

- **N5. `MAX_SEARCH_LIMIT`: overreach.** The table says "**Recalibrate** the public tool to 10"
  without a condition. The detail section and `.agents/TODO.md` both make it conditional on the
  `requestedLimit` telemetry read. The table should say "Measure (free telemetry), then
  recalibrate". The change also edits model-facing schema text ("default 5, max 50"), so it needs
  its own review.
- **N2. `EXECUTE_TIMEOUT_MS` 60 s "Keep": missing fact.** Codex's default `tool_timeout_sec` is 60
  (vendor docs: "Timeout (seconds) for the server to run a tool. Default: `60`"). A script that runs
  to Raven's 60-second limit races the Codex client timeout. With network and host overhead, Codex
  can give up first and lose Raven's structured timeout result. Add a free telemetry read of
  `execute` wall time above about 50 s to the existing TODO bullet before keeping 60.
- The other rows are supported by their evidence. "Retire" for the two token gates is correct
  except for the B1 consequence.

**N1. Re-verification table: one stale row.** "Codex CLI handling of server instructions: Not
verified" can now be partly answered from the vendor docs quoted in section 1. The row should
record that, along with the claude.ai and Desktop finding as community evidence. The TODO item
"Re-verify each external client limit" says Codex was "never verified", which should change to
match.

**N6. Error message for the total guard.** The retired build error named the file to edit
(`scripts/catalog-data/source-families.mjs`). The new test failure shows only the two numbers. One
line in the test name or a comment pointing at that file and at `src/mcp/tools.ts` would help the
drift-resolution agent that hits it. With 30 characters of headroom, it will be hit.

**N3. FAMILY_LINE length.** It is 359 characters, not 360 (section 4).

## 6. Gates

Each gate ran bare in this worktree at `51221dbc`, output redirected to a file, after `npm ci` and
`npm run typegen` had already run.

| Command | Exit | Result |
|---|---:|---|
| `npm run typecheck` | 0 | clean |
| `npm test` | 0 | 150 files passed, 1 skipped; 3,399 tests passed, 3 expected fail, 1 skipped |
| `npm run build` | 0 | dry run completed; `prebuild` regenerated `src/mcp/micro-map.ts` with no diff |
| `npm run test:smoke` | 0 | 9 files, 141 tests passed |
| `npm run eval:routing -- --gate` | 0 | GATE PASS, committed evidence verified (lexical scorer; no model call) |
| `npm run secrets:scan -- --tree` | 0 | clean, all tracked files; re-run after this file was committed |

## Reviewer method notes

The scratch worktrees and probe scripts lived in the session scratchpad and were removed. No file
outside this review was edited.
