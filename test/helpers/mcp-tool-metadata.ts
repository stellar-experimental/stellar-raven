export const EXPECTED_TOOL_METADATA = {
  search: {
    title: "Discover Stellar tools and skills",
    annotations: {
      title: "Discover Stellar tools and skills",
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  execute: {
    title: "Run Stellar research code",
    annotations: {
      title: "Run Stellar research code",
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  }
} as const;

// Claude Code cuts server instructions, and the description of a tool that loads up front, at
// 4,096 characters. Source: Claude Code docs, "Connect Claude Code to tools via MCP"
// (https://code.claude.com/docs/en/mcp), section "Tool search for MCP server authors". Read on
// 2026-11-14, when v2.1.325 was current: "Server instructions, and the description of a tool that
// loads upfront: 4,096 characters". The same page says "Before v2.1.296, the shorter limit was
// 2,048 characters." A tool loaded through tool search gets 16,384 and is not the binding case.
// A user's CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH can change both limits. Re-verify this figure
// before a change to the server instructions or a tool description, and when Claude Code release
// notes name an MCP text limit; a version bump alone does not fire it (.agents/TODO.md, "Re-verify
// each external client limit before changing model-facing text"). The local tests count JavaScript
// characters.
export const CLAUDE_CODE_INSTRUCTIONS_CAP_CHARS = 4_096;
export const CLAUDE_CODE_TOOL_DESCRIPTION_CAP_CHARS = 4_096;

// Grok CLI 1.0.77 keeps 2,033 characters of server instructions and of each tool description and
// appends "... [truncated]" (research/audits/2026-11-14-client-text-limits.md, measured). It is
// the smallest cut among the measured clients, so a field inside it is delivered whole to all of
// them. It replaces the 2,048 limit of Claude Code before v2.1.296 and the 2,000 base budget.
export const GROK_CUT_CHARS = 2_033;

// OpenCode v2.2.7 lists 120 characters of each tool description until the model asks for more:
// 117 characters and "..." (same report).
export const OPENCODE_LISTING_CHARS = 117;

// Codex 0.167.0 shows one catalogue line per server: the first line of the instructions, cut at
// about 230 characters for one server and 201 for two (same report).
export const CODEX_CATALOGUE_LINE_CHARS = 200;
