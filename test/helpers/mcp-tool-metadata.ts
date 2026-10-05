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
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true
    }
  }
} as const;

// Claude Code documents this limit as 2KB. The local tests measure JavaScript characters.
export const CLAUDE_CODE_TOOL_DESCRIPTION_CAP_CHARS = 2_048;
