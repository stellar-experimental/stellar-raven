export type CallSite = { op: string; strings: string[]; unresolved: boolean };
export function callSitesOf(code: string, operationIds: ReadonlySet<string>): CallSite[] | null;
export function literalsOf(code: string): string[];
export function footerCallsOf(resultText: unknown): Array<{ op: string; outcome: "ok" | "error" | "soft-empty" }>;
