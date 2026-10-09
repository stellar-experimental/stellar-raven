/** Reporting annotations only. Missing metadata does not prove panel agreement. */
export function panelConfidence(verdict) {
  const meta = verdict?.meta;
  if (meta?.panelEscalationSkipped === "max-panel-cases") {
    return "skipped-max-panel-cases";
  }
  if (meta?.judgeTierUsed === "panel") return "panel-result";
  return "no-panel-metadata";
}
