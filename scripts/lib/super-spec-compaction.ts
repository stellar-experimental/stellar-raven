type OutputSchema = Record<string, unknown> & {
  properties?: Record<string, unknown>;
  required?: unknown;
  type?: unknown;
};

type OutputEntry = {
  id: string;
  outputSchema: OutputSchema | null;
};

const hasOwn = (value: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

/** Build the compact schema after the shared size rule selects an operation. */
export function compactResponseSchema(entry: OutputEntry) {
  if (!entry.outputSchema) {
    throw new Error("compactResponseSchema needs an entry with an output schema");
  }

  const propertyNames = Object.keys(entry.outputSchema.properties ?? {}).sort();
  const describeCall = `codemode.describe(${JSON.stringify(entry.id)})`;
  return {
    ...(hasOwn(entry.outputSchema, "type") ? { type: entry.outputSchema.type } : {}),
    description:
      `Compact output schema with exact top-level fields. ` +
      `Call ${describeCall} for the full output schema.`,
    ...(propertyNames.length > 0
      ? { properties: Object.fromEntries(propertyNames.map((name) => [name, {}])) }
      : {}),
    ...(hasOwn(entry.outputSchema, "required")
      ? { required: entry.outputSchema.required }
      : {}),
    "x-codemode-describe": describeCall
  };
}
