/**
 * Evidence-backed corrections for the model-facing service contracts.
 *
 * Inventory snapshots retain the upstream source data. Both generators apply
 * this one exact-id overlay before they emit a contract for the model.
 */
const CORRECTIONS = {
  "lumenloop.find_content_by_entity": {
    returns:
      "Content grouped by type in articles, av, events, proposals, and scf_submissions, with matched-entity confidence and content metadata."
  },
  "lumenloop.get_related_projects": {
    returns:
      "An object with content, which contains mentioned projects with public info (slug, title, description, category)."
  },
  "scout.searchHackathonBuilds": {
    omitInputNames: ["capability", "domain", "dependsOn"]
  }
};

function omitInputNames(inputSchema, names) {
  if (!inputSchema || typeof inputSchema !== "object") return inputSchema;
  const properties = inputSchema.properties;
  if (!properties || typeof properties !== "object" || Array.isArray(properties)) return inputSchema;

  const omitted = new Set(names);
  const correctedProperties = Object.fromEntries(
    Object.entries(properties).filter(([name]) => !omitted.has(name))
  );
  const corrected = { ...inputSchema, properties: correctedProperties };
  if (Array.isArray(inputSchema.required)) {
    corrected.required = inputSchema.required.filter((name) => !omitted.has(name));
  }
  return corrected;
}

/**
 * Apply the exact upstream corrections that affect a model-facing contract.
 * The caller can supply either a collapsed inputSchema or OpenAPI parameters.
 */
export function applyModelContractCorrection(id, contract) {
  const correction = CORRECTIONS[id];
  if (!correction) return contract;

  const corrected = { ...contract };
  if (correction.returns) corrected.returns = correction.returns;
  if (correction.omitInputNames) {
    corrected.inputSchema = omitInputNames(contract.inputSchema, correction.omitInputNames);
    if (Array.isArray(contract.parameters)) {
      const omitted = new Set(correction.omitInputNames);
      corrected.parameters = contract.parameters.filter(
        (parameter) => !omitted.has(parameter?.name)
      );
    }
  }
  return corrected;
}
