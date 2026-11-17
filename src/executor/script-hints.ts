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

/** The bounded class of a failed `execute`, for telemetry only; it never reaches the model. */
export type ExecuteErrorName = "SyntaxError" | "TypeError" | "ReferenceError" | "timeout" | "other";

/** The runtime's exact message when a script exceeds `EXECUTE_TIMEOUT_MS`. */
const TIMEOUT_MESSAGE = "Execution timed out";
const SYNTAX_ERROR_MESSAGE =
  /SyntaxError|Failed to start Worker|Unexpected (?:token|identifier|end of input)|Invalid or unexpected token|missing \) after|is not valid JSON|Unexpected end of JSON input/;
const REFERENCE_ERROR_MESSAGE = /\bis not defined\b|Cannot access '[^']*' before initialization/;
const TYPE_ERROR_MESSAGE =
  /Cannot read properties of (?:undefined|null)|Cannot set properties of|is not a function|is not iterable|is not a constructor|Cannot convert undefined or null|Assignment to constant variable|Cannot destructure/;

/**
 * Classify a failed `execute` from the sandbox's raw message (before hinting and redaction).
 * `@cloudflare/codemode` drops `err.name` and returns only `err.message`, so the class comes from
 * the runtime's own message forms and outcome path, not from a structural field: a model-thrown
 * `Error` whose text matches one of these forms is misclassed. This is telemetry only. When the
 * script failed to load (`loadRejected`), the rejection also carries RPC, isolate, and loader
 * faults, so only a message in the syntax forms is a `SyntaxError`; the rest is `other`.
 */
export function classifyExecuteError(message: string, loadRejected: boolean): ExecuteErrorName {
  if (message === TIMEOUT_MESSAGE) return "timeout";
  if (SYNTAX_ERROR_MESSAGE.test(message)) return "SyntaxError";
  if (loadRejected) return "other";
  if (REFERENCE_ERROR_MESSAGE.test(message)) return "ReferenceError";
  if (TYPE_ERROR_MESSAGE.test(message)) return "TypeError";
  return "other";
}

/** Append the first matching hint; a message with no rule passes through unchanged. */
export function withScriptHint(message: string, globalNames: readonly string[]): string {
  const rule = SCRIPT_HINTS.find(({ when }) => when.test(message));
  return rule ? `${message} (${rule.hint(globalNames.join(", "))})` : message;
}
