export const TUNING_ROW_COUNT: number;
export function tuningIdsOf(split: unknown): string[];
export function selectById<T extends { id: string }>(
  list: readonly T[] | undefined,
  ids: readonly string[],
  expected: number,
  label: string
): T[];
