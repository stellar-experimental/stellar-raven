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
// whenever a Claude Code version changes (.agents/TODO.md). The local tests count JavaScript
// characters.
export const CLAUDE_CODE_INSTRUCTIONS_CAP_CHARS = 4_096;
export const CLAUDE_CODE_TOOL_DESCRIPTION_CAP_CHARS = 4_096;

// The limit before v2.1.296. The base contract and both descriptions still fit it. Retire this
// constant together with BASE_BUDGET.
export const CLAUDE_CODE_PRE_V2_1_296_CAP_CHARS = 2_048;
