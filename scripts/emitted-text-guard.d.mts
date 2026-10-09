// Ambient declaration for emitted-text-guard.mjs (plain JS, no build step) so
// test/emitted-text-guard.test.ts can import it directly under `tsc --noEmit`.
// Keep in sync with the exported surface of emitted-text-guard.mjs.
export function assertNoNonExposedRefsInText(text: string, label: string): void;
