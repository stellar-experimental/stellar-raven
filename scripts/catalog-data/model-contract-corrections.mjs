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
  },
  "scout.getRfps": {
    inputDescriptions: {
      status: {
        from: "Open RFPs are fundable for the current SCF quarter; closed are prior rounds",
        to: "The value open selects solicited briefs. It does not prove that an SCF proposal window is open."
      }
    },
    outputDescriptions: [
      {
        path: ["properties", "funding"],
        from: "Funding-context sentence for the whole list: winners of OPEN RFPs are eligible for SCF grant funding in the current round; closed RFPs are past rounds, surfaced for context but no longer fundable.",
        to: "Funding-context sentence returned by Scout. Treat it as brief context, not proof that an SCF proposal window is open."
      },
      {
        path: ["properties", "meta", "properties", "scfRound", "properties", "currentRound"],
        from: "Round currently open for submissions; null when no round is confirmed open as of asOf.",
        to: "Round identified as current by Scout; null when unconfirmed. This field does not prove that submissions are open."
      },
      {
        path: ["properties", "rfps", "items", "properties", "status"],
        from: "'open' = fundable in the current SCF quarter; 'closed' = a prior round, surfaced for context.",
        to: "'open' = a solicited brief; 'closed' = prior context. Neither value proves the current SCF proposal-window state."
      }
    ],
    addScfRoundProperties: {
      currentPhase: {
        description: "Scout phase label observed as of asOf. Verify at verifyAt because phase data can become stale.",
        nullable: true,
        type: "string"
      },
      roundsInProgress: {
        description: "Rounds that Scout reports in progress. A listed round or deadline does not prove that submissions remain open.",
        items: {
          additionalProperties: false,
          properties: {
            phase: { type: "string" },
            round: { type: "integer" },
            submissionDeadline: { format: "date", type: "string" }
          },
          required: ["round", "phase", "submissionDeadline"],
          type: "object"
        },
        type: "array"
      },
      source: {
        description: "Scout provenance label for the round-state observation.",
        type: "string"
      }
    },
    useOutputSchemaInSuperSpec: true
  }
};

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function schemaNodeAt(root, path, id) {
  let node = root;
  for (const segment of path) {
    if (!node || typeof node !== "object" || Array.isArray(node) || !(segment in node)) {
      throw new Error(
        `${id} model-contract correction path is missing: ${path.join(".")}`
      );
    }
    node = node[segment];
  }
  if (!node || typeof node !== "object" || Array.isArray(node)) {
    throw new Error(`${id} model-contract correction target is not an object: ${path.join(".")}`);
  }
  return node;
}

function replaceDescription(node, expected, replacement, id, label) {
  if (node.description !== expected) {
    throw new Error(
      `${id} model-contract correction expected ${label} description ${JSON.stringify(expected)}, ` +
        `received ${JSON.stringify(node.description)}`
    );
  }
  node.description = replacement;
}

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
  if (correction.inputDescriptions && contract.inputSchema) {
    corrected.inputSchema = clone(contract.inputSchema);
    for (const [name, replacement] of Object.entries(correction.inputDescriptions)) {
      const node = schemaNodeAt(
        corrected.inputSchema,
        ["properties", name],
        id
      );
      replaceDescription(node, replacement.from, replacement.to, id, `input ${name}`);
    }
  }
  if (correction.inputDescriptions && Array.isArray(contract.parameters)) {
    corrected.parameters = clone(contract.parameters);
    for (const [name, replacement] of Object.entries(correction.inputDescriptions)) {
      const parameter = corrected.parameters.find((item) => item?.name === name);
      if (!parameter) {
        throw new Error(`${id} model-contract correction found no ${name} parameter`);
      }
      replaceDescription(parameter, replacement.from, replacement.to, id, `parameter ${name}`);
    }
  }
  if (correction.outputDescriptions && contract.outputSchema) {
    corrected.outputSchema = clone(contract.outputSchema);
    for (const replacement of correction.outputDescriptions) {
      const node = schemaNodeAt(corrected.outputSchema, replacement.path, id);
      replaceDescription(
        node,
        replacement.from,
        replacement.to,
        id,
        `output ${replacement.path.join(".")}`
      );
    }
    if (correction.addScfRoundProperties) {
      const properties = schemaNodeAt(
        corrected.outputSchema,
        ["properties", "meta", "properties", "scfRound", "properties"],
        id
      );
      for (const [name, schema] of Object.entries(correction.addScfRoundProperties)) {
        if (name in properties) {
          throw new Error(
            `${id} model-contract correction cannot add existing scfRound property ${name}; ` +
              `reconcile the upstream schema and remove the local overlay`
          );
        }
        properties[name] = clone(schema);
      }
    }
  }
  return corrected;
}

export function usesCorrectedSuperSpecOutputSchema(id) {
  return CORRECTIONS[id]?.useOutputSchemaInSuperSpec === true;
}
