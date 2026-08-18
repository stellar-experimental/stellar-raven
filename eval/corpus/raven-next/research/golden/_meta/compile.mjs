#!/usr/bin/env node
// Compile the source-card corpus into the single golden artifact contract.
// Run: node eval/corpus/raven-next/research/golden/_meta/compile.mjs
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const GOLDEN_ROOT = resolve(dirname(SCRIPT_PATH), "..");
const OUT_PATH = join(GOLDEN_ROOT, "compiled/golden.json");

export const COMPILED_GOLDEN_FIELDS = [
  "id",
  "question",
  "category",
  "subcategory",
  "canonicalAnswer",
  "answerGuidance",
  "sources",
  "freshnessSensitive",
  "sourceFile",
  "routing",
];

export const ANSWER_GUIDANCE_FIELDS = [
  "mustInclude",
  "shouldInclude",
  "mustAvoid",
  "mustCite",
  "notes",
];

export const ROUTING_FIELDS = [
  "expectedService",
  "shouldFire",
  "expectedCards",
  "acceptableCards",
  "forbiddenCards",
  "mustNotUseTier",
];

function stripScalar(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  return trimmed.replace(/\s+#.*$/, "").trim();
}

function frontmatterOf(raw, sourceFile) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${sourceFile}: missing YAML frontmatter`);
  return match[1];
}

function scalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:[ \\t]*(.*)$`, "m"));
  return match ? stripScalar(match[1]) : "";
}

function boolean(frontmatter, key, sourceFile) {
  const value = scalar(frontmatter, key);
  if (value !== "true" && value !== "false") {
    throw new Error(`${sourceFile}: ${key} must be true or false`);
  }
  return value === "true";
}

function block(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:[ \\t]*(.*(?:\\n[ \\t].*)*)`, "m"));
  return match ? match[1] : "";
}

function inlineList(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:[ \\t]*\\[([^\\]]*)\\]`, "m"));
  if (!match) return null;
  return match[1]
    .split(",")
    .map((item) => stripScalar(item))
    .filter(Boolean);
}

function stringList(frontmatter, key) {
  const inline = inlineList(frontmatter, key);
  if (inline) return inline;
  const value = block(frontmatter, key);
  if (!value || /^\s*\[\s*\]/.test(value)) return [];
  return [...value.matchAll(/^\s*-\s*(.+)$/gm)]
    .map((match) => stripScalar(match[1]))
    .filter(Boolean);
}

function claimList(frontmatter, key, sourceFile) {
  const value = block(frontmatter, key);
  if (!value || /^\s*\[\s*\]/.test(value)) return [];
  const claims = [];
  const lines = value.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const flow = lines[index].match(/^\s*-\s*\{\s*claim:\s*(.+),\s*weight:\s*(\d+)\s*\}\s*$/);
    const expanded = lines[index].match(/^\s*-\s*claim:\s*(.+)\s*$/);
    if (!flow && !expanded) continue;
    const weightText = flow?.[2] ?? lines[index + 1]?.match(/^\s+weight:\s*(\d+)\s*$/)?.[1];
    if (!weightText) throw new Error(`${sourceFile}: ${key} claim is missing a weight`);
    const weight = Number(weightText);
    if (weight < 1 || weight > 5) throw new Error(`${sourceFile}: ${key} weight must be from 1 through 5`);
    claims.push(stripScalar(flow?.[1] ?? expanded[1]));
  }
  const itemCount = [...value.matchAll(/^\s*-\s*(?:\{\s*)?claim:/gm)].length;
  if (claims.length !== itemCount) {
    throw new Error(`${sourceFile}: could not parse every ${key} claim`);
  }
  return claims;
}

function markdownSection(raw, heading, sourceFile) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = raw.match(new RegExp(`^##\\s+${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=^##\\s+|(?![\\s\\S]))`, "m"));
  const content = match?.[1].trim() ?? "";
  if (!content) throw new Error(`${sourceFile}: missing ${heading} section content`);
  return content;
}

function assertExactFields(value, expected, context) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${context} must be an object`);
  }
  const actual = Object.keys(value);
  const missing = expected.filter((key) => !actual.includes(key));
  const extra = actual.filter((key) => !expected.includes(key));
  if (missing.length || extra.length) {
    const details = [
      missing.length ? `missing: ${missing.join(", ")}` : "",
      extra.length ? `unexpected: ${extra.join(", ")}` : "",
    ].filter(Boolean).join("; ");
    throw new Error(`${context} has invalid fields (${details})`);
  }
}

function assertString(value, context, { allowEmpty = false } = {}) {
  if (typeof value !== "string" || (!allowEmpty && value.length === 0)) {
    throw new Error(`${context} must be ${allowEmpty ? "a string" : "a non-empty string"}`);
  }
}

function assertStringArray(value, context) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.length === 0)) {
    throw new Error(`${context} must be a string array`);
  }
}

export function assertCompiledGoldenCase(compiledCase) {
  const context = compiledCase?.id ? `case ${compiledCase.id}` : "compiled golden case";
  assertExactFields(compiledCase, COMPILED_GOLDEN_FIELDS, context);
  for (const field of ["id", "question", "category", "subcategory", "canonicalAnswer", "sourceFile"]) {
    assertString(compiledCase[field], `${context}.${field}`);
  }
  assertStringArray(compiledCase.sources, `${context}.sources`);
  if (typeof compiledCase.freshnessSensitive !== "boolean") {
    throw new Error(`${context}.freshnessSensitive must be a boolean`);
  }

  assertExactFields(compiledCase.answerGuidance, ANSWER_GUIDANCE_FIELDS, `${context}.answerGuidance`);
  for (const field of ["mustInclude", "shouldInclude", "mustAvoid", "mustCite"]) {
    assertStringArray(compiledCase.answerGuidance[field], `${context}.answerGuidance.${field}`);
  }
  assertString(compiledCase.answerGuidance.notes, `${context}.answerGuidance.notes`, { allowEmpty: true });

  assertExactFields(compiledCase.routing, ROUTING_FIELDS, `${context}.routing`);
  assertString(compiledCase.routing.expectedService, `${context}.routing.expectedService`);
  if (typeof compiledCase.routing.shouldFire !== "boolean") {
    throw new Error(`${context}.routing.shouldFire must be a boolean`);
  }
  for (const field of ["expectedCards", "acceptableCards", "forbiddenCards", "mustNotUseTier"]) {
    assertStringArray(compiledCase.routing[field], `${context}.routing.${field}`);
  }
}

export function compileGoldenCard({ raw, category, sourceFile }) {
  const frontmatter = frontmatterOf(raw, sourceFile);
  const authoredCategory = scalar(frontmatter, "category");
  if (authoredCategory !== category) {
    throw new Error(`${sourceFile}: category ${JSON.stringify(authoredCategory)} does not match directory ${JSON.stringify(category)}`);
  }

  const compiledCase = {
    id: scalar(frontmatter, "id"),
    question: scalar(frontmatter, "q"),
    category: authoredCategory,
    subcategory: scalar(frontmatter, "subcategory"),
    canonicalAnswer: markdownSection(raw, "Reference answer (gospel)", sourceFile),
    answerGuidance: {
      mustInclude: claimList(frontmatter, "must_have", sourceFile),
      shouldInclude: claimList(frontmatter, "should_have", sourceFile),
      mustAvoid: claimList(frontmatter, "must_avoid", sourceFile),
      mustCite: stringList(frontmatter, "must_cite"),
      notes: scalar(frontmatter, "notes"),
    },
    sources: stringList(frontmatter, "sources"),
    freshnessSensitive: boolean(frontmatter, "freshness_sensitive", sourceFile),
    sourceFile,
    routing: {
      expectedService: scalar(frontmatter, "expected_service"),
      shouldFire: boolean(frontmatter, "should_fire", sourceFile),
      expectedCards: stringList(frontmatter, "expected_cards"),
      acceptableCards: stringList(frontmatter, "acceptable_cards"),
      forbiddenCards: stringList(frontmatter, "forbidden_cards"),
      mustNotUseTier: stringList(frontmatter, "must_not_use_tier"),
    },
  };
  assertCompiledGoldenCase(compiledCase);
  return compiledCase;
}

export function compileGoldenCorpus(goldenRoot = GOLDEN_ROOT) {
  const categories = readdirSync(goldenRoot)
    .filter((name) => !name.startsWith("_") && name !== "compiled" && statSync(join(goldenRoot, name)).isDirectory())
    .sort();
  const rows = [];
  for (const category of categories) {
    const files = readdirSync(join(goldenRoot, category)).filter((name) => name.endsWith(".md")).sort();
    for (const file of files) {
      const sourceFile = `research/golden/${category}/${file}`;
      rows.push(compileGoldenCard({
        raw: readFileSync(join(goldenRoot, category, file), "utf8"),
        category,
        sourceFile,
      }));
    }
  }
  rows.sort((a, b) => a.id.localeCompare(b.id));
  const duplicateIds = rows.filter((row, index) => index > 0 && row.id === rows[index - 1].id).map((row) => row.id);
  if (duplicateIds.length) throw new Error(`duplicate golden case ids: ${duplicateIds.join(", ")}`);
  return rows;
}

export function writeCompiledGolden(outPath = OUT_PATH) {
  const rows = compileGoldenCorpus();
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(rows, null, 2)}\n`);
  return rows;
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) {
  const rows = writeCompiledGolden();
  console.log(`Compiled ${rows.length} source cards -> ${OUT_PATH}`);
}
