# Execute MCP output contract

Verified 2026-08-20 against MCP 2026-07-28, current OpenAI and Anthropic documentation,
the installed MCP packages, and Claude Code 2.1.238. This note records why `execute` stays
text-only. Recheck the version-specific observations before changing this contract.

## Decision

`execute` returns one text `content` block. It omits `outputSchema` and `structuredContent`.
Errors use the same text shape and set `isError: true`.

`search` remains different. Its bounded catalog response has a stable object shape, so it returns
matching text and structured forms under its declared output schema.

## Standards and client evidence

- [MCP 2026-07-28 tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
  makes `outputSchema` optional. Successful `structuredContent` must conform when a schema exists.
  The specification says servers should also provide serialized JSON in a text block.
- The [OpenAI Apps SDK reference](https://developers.openai.com/plugins/reference) says tools that
  return `structuredContent` should declare an output schema. It exposes both `content` and
  `structuredContent` in the conversation transcript.
- The [OpenAI Agents SDK MCP guide](https://openai.github.io/openai-agents-python/mcp/) defaults to
  text-first results. Its structured-content option can replace text with the structured value.
- The [Anthropic MCP connector](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector)
  documents `mcp_tool_result` with `content` and `is_error`. It does not document
  `structuredContent` in that result shape.
- The [Claude Agent SDK custom-tools guide](https://code.claude.com/docs/en/agent-sdk/custom-tools)
  documents the mapping for in-process tools. When `structuredContent` exists, Claude receives
  its JSON and any non-text content blocks. The mapper does not forward text blocks because it
  treats them as duplicate data.
- [Claude Code MCP documentation](https://code.claude.com/docs/en/mcp) states that Claude Code
  truncates tool descriptions and server instructions at 2KB. Critical `execute` facts therefore
  stay near the start of its description.

## Installed-runtime observations

The repository installs `@modelcontextprotocol/server@2.0.0` and
`@modelcontextprotocol/client@2.0.0`. The server validates successful structured results against
an output schema. It also adds a serialized text block when a handler returns only structured
content.

The installed `claude` executable reports Claude Code 2.1.238. Its MCP result mapper uses
`structuredContent` when present. It drops text blocks and serializes the structured value, while
it retains non-text blocks. Anthropic documents this behavior for Agent SDK in-process tools. The
installed binary shows that the same mapper handles remote MCP results.

## Constraint analysis

The sandbox can return arbitrary JavaScript values. It can also return truncated JSON text,
console output, source-basis guidance, and errors. These outputs do not share one stable JSON
shape.

A metadata-only structured object would hide the actual result in Claude Code 2.1.238. A complete
structured copy would require a complete text fallback for Anthropic's connector and older MCP
clients. ChatGPT Apps SDK clients would then receive both copies.

The duplicate would cross the model boundary twice. It would also defeat the purpose of the
separate result, log, and error budgets. A pre-truncation structured value would bypass those
budgets entirely.

The orange output-schema recommendation in ChatGPT is therefore advisory for `execute`. Adding a
schema would reduce cross-client correctness and weaken the output boundary.
