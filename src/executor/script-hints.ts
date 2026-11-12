/**
 * Host hints for script mistakes. The execute description states the contract
 * a script needs before it runs; what a script gets wrong is taught here, on
 * the error that follows the mistake, where only the scripts that need the
 * lesson pay for it. Each rule matches the sandbox's own message for one
 * mechanical failure and appends how to fix the script. Wrong-level payload
 * reads, bad arguments, and unknown skill ids carry their own host messages
 * (providers.ts, policy/guard.ts, skills/store.ts).
 */
const SCRIPT_HINTS: ReadonlyArray<{ when: RegExp; hint: (globals: string) => string }> = [
  {
    // Mirrors @cloudflare/codemode's withGlobalsHint, plus "standard
    // JavaScript" so the hint does not deny builtins (console, Promise, Math).
    when: /\bis not defined\b/,
    hint: (globals) => `the only globals available in the sandbox are: ${globals}, and standard JavaScript`
  },
  {
    when: /^Tool "[^"]*" not found/,
    hint: () =>
      "operation ids are exact-match with no fuzzy resolution: copy the call line from a `search` hit, or find it mid-script with `codemode.search(query)`"
  },
  {
    when: /not permitted to access the internet/,
    hint: (globals) => `the sandbox has no network: all I/O goes through the service globals (${globals})`
  },
  {
    when: /SyntaxError|Failed to start Worker/,
    hint: () =>
      "write plain JavaScript, one `async () => { ... }` arrow function: no TypeScript annotations, interfaces, or generics"
  },
  {
    when: /\bis not iterable\b/,
    hint: () => "`Promise.all` takes an array: `const [a, b] = await Promise.all([callA, callB])`"
  }
];

/** Append the first matching hint; a message with no rule passes through unchanged. */
export function withScriptHint(message: string, globalNames: readonly string[]): string {
  const rule = SCRIPT_HINTS.find(({ when }) => when.test(message));
  return rule ? `${message} (${rule.hint(globalNames.join(", "))})` : message;
}
