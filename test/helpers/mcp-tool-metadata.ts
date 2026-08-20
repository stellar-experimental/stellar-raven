export const EXPECTED_TOOL_METADATA = {
  search: {
    title: "Discover Stellar tools and skills",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  execute: {
    title: "Run Stellar research code",
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true
    }
  }
} as const;

// Claude Code documents this limit as 2KB. The local tests measure JavaScript characters.
export const CLAUDE_CODE_TOOL_DESCRIPTION_CAP_CHARS = 2_048;
