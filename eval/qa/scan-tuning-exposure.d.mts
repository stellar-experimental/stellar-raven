export type TuningExposureRow = {
  id: string;
  category: string | null;
  trap: string | null;
  baseline: string | null;
  docsSearchOps: string[];
  pageRead: boolean;
  arm1Exposed: boolean;
  researchCalls: number;
  researchQueries: string[];
  dynamicResearchQueries: number;
  identifierTokens: string[];
  inferredIdentifierTokens: string[];
  arm2Direct: boolean;
  arm2Exposed: boolean;
  role: string | null;
};

export const ARM1_TARGETS: string[];
export const ARM2_TARGETS: string[];
export const PRIORITY_CATEGORIES: string[];
export const OPEN_DEFECT_ROWS: string[];
export function scriptOf(entry: unknown): string;
export function scanTranscript(transcript: unknown): Omit<TuningExposureRow, "id" | "category" | "trap" | "baseline" | "role">;
export function panelRole(row: unknown, scan: unknown): string | null;
export function selectTuningRows(input: { split: unknown; results: unknown }): Array<{ id: string; transcript?: unknown[] }>;
export function scanTuningRows(input: { split: unknown; results: unknown }): TuningExposureRow[];
export function renderMarkdown(rows: TuningExposureRow[]): string;
