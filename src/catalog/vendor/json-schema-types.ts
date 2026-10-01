/**
 * VENDORED from @cloudflare/codemode@0.4.2
 *   upstream sources: src/utils.ts + src/json-schema-types.ts
 *   (shipped as dist/json-schema-types-D_m9tVnI.js in the published package)
 *
 * Why this module is vendored instead of imported:
 *   1. The package's main entry (`dist/index.js`) imports `cloudflare:workers`,
 *      so it cannot be loaded from plain Node — but src/catalog/search.ts must
 *      be importable from vitest and the eval CLI (frozen search contract).
 *   2. `generateTypesFromJsonSchema` IS exported upstream, but only through
 *      that Workers-only entry; the underlying chunk is not a public export.
 *
 * Changes from upstream: TypeScript annotations added; no behavior changes.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type JsonSchema = Record<string, any> | boolean;

const JS_RESERVED = new Set([
  "abstract", "arguments", "await", "boolean", "break", "byte", "case",
  "catch", "char", "class", "const", "continue", "debugger", "default",
  "delete", "do", "double", "else", "enum", "eval", "export", "extends",
  "false", "final", "finally", "float", "for", "function", "goto", "if",
  "implements", "import", "in", "instanceof", "int", "interface", "let",
  "long", "native", "new", "null", "package", "private", "protected",
  "public", "return", "short", "static", "super", "switch", "synchronized",
  "this", "throw", "throws", "transient", "true", "try", "typeof",
  "undefined", "var", "void", "volatile", "while", "with", "yield"
]);

/**
 * Sanitize a tool name into a valid JavaScript identifier.
 * Replaces hyphens, dots, and spaces with `_`, strips other invalid chars,
 * prefixes digit-leading names with `_`, and appends `_` to JS reserved words.
 */
export function sanitizeToolName(name: string): string {
  if (!name) return "_";
  let sanitized = name.replace(/[-.\s]/g, "_");
  sanitized = sanitized.replace(/[^a-zA-Z0-9_$]/g, "");
  if (!sanitized) return "_";
  if (/^[0-9]/.test(sanitized)) sanitized = "_" + sanitized;
  if (JS_RESERVED.has(sanitized)) sanitized = sanitized + "_";
  return sanitized;
}

export function toPascalCase(str: string): string {
  return str
    .replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())
    .replace(/^[a-z]/, (letter) => letter.toUpperCase());
}

/** Escape a character as a unicode escape sequence if it is a control character. */
function escapeControlChar(ch: string): string {
  const code = ch.charCodeAt(0);
  if (code <= 31 || code === 127) return "\\u" + code.toString(16).padStart(4, "0");
  return ch;
}

/** Quote a property name if needed. Escapes backslashes, quotes, and control characters. */
function quoteProp(name: string): string {
  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
    let escaped = "";
    for (const ch of name) {
      if (ch === "\\") escaped += "\\\\";
      else if (ch === '"') escaped += '\\"';
      else if (ch === "\n") escaped += "\\n";
      else if (ch === "\r") escaped += "\\r";
      else if (ch === "\t") escaped += "\\t";
      else if (ch === " ") escaped += "\\u2028";
      else if (ch === " ") escaped += "\\u2029";
      else escaped += escapeControlChar(ch);
    }
    return `"${escaped}"`;
  }
  return name;
}

/** Escape a string for use inside a double-quoted TypeScript string literal. */
function escapeStringLiteral(s: string): string {
  let out = "";
  for (const ch of s) {
    if (ch === "\\") out += "\\\\";
    else if (ch === '"') out += '\\"';
    else if (ch === "\n") out += "\\n";
    else if (ch === "\r") out += "\\r";
    else if (ch === "\t") out += "\\t";
    else if (ch === " ") out += "\\u2028";
    else if (ch === " ") out += "\\u2029";
    else out += escapeControlChar(ch);
  }
  return out;
}

/** Escape a string for use inside a JSDoc comment. */
export function escapeJsDoc(text: string): string {
  return text.replace(/\*\//g, "*\\/");
}

/**
 * Resolve an internal JSON Pointer $ref (e.g. #/definitions/Foo) against the
 * root schema. Returns null for external URLs or unresolvable paths.
 */
function resolveRef(ref: string, root: any): JsonSchema | null {
  if (ref === "#") return root;
  if (!ref.startsWith("#/")) return null;
  const segments = ref
    .slice(2)
    .split("/")
    .map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));
  let current: any = root;
  for (const seg of segments) {
    if (current === null || typeof current !== "object") return null;
    current = current[seg];
    if (current === undefined) return null;
  }
  if (typeof current === "boolean") return current;
  if (current === null || typeof current !== "object") return null;
  return current;
}

/** Apply OpenAPI 3.0 `nullable: true` to a type result. */
function applyNullable(result: string, schema: any): string {
  if (result !== "unknown" && result !== "never" && schema?.nullable === true) {
    return `${result} | null`;
  }
  return result;
}

type Ctx = { root: any; depth: number; seen: Set<object>; maxDepth: number };

/**
 * Convert a JSON Schema to a TypeScript type string.
 * This is a direct conversion without going through Zod.
 */
export function jsonSchemaToTypeString(schema: JsonSchema, indent: string, ctx: Ctx): string {
  if (typeof schema === "boolean") return schema ? "unknown" : "never";
  if (ctx.depth >= ctx.maxDepth) return "unknown";
  if (ctx.seen.has(schema)) return "unknown";
  ctx.seen.add(schema);
  const nextCtx: Ctx = { ...ctx, depth: ctx.depth + 1 };
  try {
    if (schema.$ref) {
      const resolved = resolveRef(schema.$ref, ctx.root);
      if (!resolved) return "unknown";
      return applyNullable(jsonSchemaToTypeString(resolved, indent, nextCtx), schema);
    }
    if (schema.anyOf) {
      return applyNullable(
        schema.anyOf.map((s: JsonSchema) => jsonSchemaToTypeString(s, indent, nextCtx)).join(" | "),
        schema
      );
    }
    if (schema.oneOf) {
      return applyNullable(
        schema.oneOf.map((s: JsonSchema) => jsonSchemaToTypeString(s, indent, nextCtx)).join(" | "),
        schema
      );
    }
    if (schema.allOf) {
      return applyNullable(
        schema.allOf.map((s: JsonSchema) => jsonSchemaToTypeString(s, indent, nextCtx)).join(" & "),
        schema
      );
    }
    if (schema.enum) {
      if (schema.enum.length === 0) return "never";
      return applyNullable(
        schema.enum
          .map((v: unknown) => {
            if (v === null) return "null";
            if (typeof v === "string") return '"' + escapeStringLiteral(v) + '"';
            if (typeof v === "object") return JSON.stringify(v) ?? "unknown";
            return String(v);
          })
          .join(" | "),
        schema
      );
    }
    if (schema.const !== undefined) {
      return applyNullable(
        schema.const === null
          ? "null"
          : typeof schema.const === "string"
            ? '"' + escapeStringLiteral(schema.const) + '"'
            : typeof schema.const === "object"
              ? (JSON.stringify(schema.const) ?? "unknown")
              : String(schema.const),
        schema
      );
    }
    const type = schema.type;
    if (type === "string") return applyNullable("string", schema);
    if (type === "number" || type === "integer") return applyNullable("number", schema);
    if (type === "boolean") return applyNullable("boolean", schema);
    if (type === "null") return "null";
    if (type === "array") {
      const prefixItems = schema.prefixItems;
      if (Array.isArray(prefixItems)) {
        return applyNullable(
          `[${prefixItems.map((s: JsonSchema) => jsonSchemaToTypeString(s, indent, nextCtx)).join(", ")}]`,
          schema
        );
      }
      if (Array.isArray(schema.items)) {
        return applyNullable(
          `[${schema.items.map((s: JsonSchema) => jsonSchemaToTypeString(s, indent, nextCtx)).join(", ")}]`,
          schema
        );
      }
      if (schema.items) {
        return applyNullable(`${jsonSchemaToTypeString(schema.items, indent, nextCtx)}[]`, schema);
      }
      return applyNullable("unknown[]", schema);
    }
    if (type === "object" || schema.properties) {
      const props: Record<string, any> = schema.properties || {};
      const required = new Set<string>(schema.required || []);
      const lines: string[] = [];
      for (const [propName, propSchema] of Object.entries(props)) {
        if (typeof propSchema === "boolean") {
          const boolType = propSchema ? "unknown" : "never";
          const optionalMark = required.has(propName) ? "" : "?";
          lines.push(`${indent}    ${quoteProp(propName)}${optionalMark}: ${boolType};`);
          continue;
        }
        const isRequired = required.has(propName);
        const propType = jsonSchemaToTypeString(propSchema, indent + "    ", nextCtx);
        const desc = propSchema.description;
        const format = propSchema.format;
        if (desc || format) {
          const descText = desc ? escapeJsDoc(desc.replace(/\r?\n/g, " ")) : undefined;
          const formatTag = format ? `@format ${escapeJsDoc(format)}` : undefined;
          if (descText && formatTag) {
            lines.push(`${indent}    /**`);
            lines.push(`${indent}     * ${descText}`);
            lines.push(`${indent}     * ${formatTag}`);
            lines.push(`${indent}     */`);
          } else {
            lines.push(`${indent}    /** ${descText ?? formatTag} */`);
          }
        }
        const quotedName = quoteProp(propName);
        const optionalMark = isRequired ? "" : "?";
        lines.push(`${indent}    ${quotedName}${optionalMark}: ${propType};`);
      }
      if (schema.additionalProperties) {
        const valueType =
          schema.additionalProperties === true
            ? "unknown"
            : jsonSchemaToTypeString(schema.additionalProperties, indent + "    ", nextCtx);
        lines.push(`${indent}    [key: string]: ${valueType};`);
      }
      if (lines.length === 0) {
        if (schema.additionalProperties === false) return applyNullable("{}", schema);
        return applyNullable("Record<string, unknown>", schema);
      }
      return applyNullable(`{\n${lines.join("\n")}\n${indent}}`, schema);
    }
    if (Array.isArray(type)) {
      return applyNullable(
        type
          .map((t: string) => {
            if (t === "string") return "string";
            if (t === "number" || t === "integer") return "number";
            if (t === "boolean") return "boolean";
            if (t === "null") return "null";
            if (t === "array") return "unknown[]";
            if (t === "object") return "Record<string, unknown>";
            return "unknown";
          })
          .join(" | "),
        schema
      );
    }
    return "unknown";
  } finally {
    ctx.seen.delete(schema);
  }
}

/** Convert a JSON Schema to a TypeScript type declaration. */
export function jsonSchemaToType(schema: JsonSchema, typeName: string): string {
  return `type ${typeName} = ${jsonSchemaToTypeString(schema, "", {
    root: schema,
    depth: 0,
    seen: new Set(),
    maxDepth: 20
  })}`;
}
