/**
 * Model family resolver for launch lines and eval runners.
 *
 * A family name chooses the newest model of that family. Claude Code takes its own aliases
 * (`sonnet`, `opus`, `fable`), so those pass through unchanged. Codex and Grok have no alias, so
 * this reads each CLI's offline catalog cache. It never touches the network.
 *
 * The caches also hold credential fields. This module reads only model keys or slugs, `info.id`,
 * and the visibility or hidden flag, and its errors never echo file content.
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const CLAUDE_FAMILIES = ["sonnet", "opus", "fable"];
export const CODEX_FAMILIES = ["sol", "astra", "terra"];
export const GROK_FAMILY = "grok";
export const FAMILIES = [...CLAUDE_FAMILIES, ...CODEX_FAMILIES, GROK_FAMILY];

export class ModelFamilyError extends Error {
  constructor(message) {
    super(message);
    this.name = "ModelFamilyError";
  }
}

/** Dotted numeric version to an array, so `6.10` sorts above `6.2`. */
function parseVersion(text) {
  return text.split(".").map((part) => Number(part));
}

function compareVersions(a, b) {
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function readCatalog(path, label) {
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    throw new ModelFamilyError(`${label} model catalog is missing or unreadable`);
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new ModelFamilyError(`${label} model catalog is not valid JSON`);
  }
}

function newest(candidates, family, label) {
  if (candidates.length === 0) {
    throw new ModelFamilyError(`no visible ${family} model in the ${label} catalog`);
  }
  candidates.sort((a, b) => compareVersions(b.version, a.version));
  return candidates[0];
}

/** The catalog's fetch time in normalized ISO form, or null unless it parses as a date. */
function fetchedAt(catalog) {
  if (typeof catalog?.fetched_at !== "string") return null;
  const ms = Date.parse(catalog.fetched_at);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}

function resolveCodex(family, home) {
  const catalog = readCatalog(join(home, "models_cache.json"), "Codex");
  if (!Array.isArray(catalog?.models)) throw new ModelFamilyError("Codex model catalog has no models list");
  const pattern = new RegExp(`^gpt-(\\d+(?:\\.\\d+)*)-${family}$`);
  const candidates = [];
  for (const entry of catalog.models) {
    const slug = entry?.slug;
    if (typeof slug !== "string" || entry.visibility !== "list") continue;
    const match = pattern.exec(slug);
    if (match) candidates.push({ id: slug, version: parseVersion(match[1]) });
  }
  return { id: newest(candidates, family, "Codex").id, fetchedAt: fetchedAt(catalog) };
}

function resolveGrok(home) {
  const catalog = readCatalog(join(home, "models_cache.json"), "Grok");
  const models = catalog?.models;
  if (models === null || typeof models !== "object" || Array.isArray(models)) {
    throw new ModelFamilyError("Grok model catalog has no models map");
  }
  const pattern = /^grok-(\d+(?:\.\d+)*)$/;
  const candidates = [];
  for (const entry of Object.values(models)) {
    // A malformed entry (null, a non-object, or no usable id) is not a selectable model.
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) continue;
    const id = entry.info?.id;
    if (typeof id !== "string" || id === "") continue;
    if (entry.info.hidden === true) continue;
    const match = pattern.exec(id);
    if (match) candidates.push({ id, version: parseVersion(match[1]) });
  }
  return { id: newest(candidates, GROK_FAMILY, "Grok").id, fetchedAt: fetchedAt(catalog) };
}

/**
 * Resolve a family to a model argument for its CLI, with the catalog's `fetched_at` when one was
 * read. Claude families return the alias unchanged.
 */
export function resolveFamilyDetail(family, { codexHome, grokHome } = {}) {
  const name = typeof family === "string" ? family.toLowerCase() : "";
  if (CLAUDE_FAMILIES.includes(name)) return { id: name, fetchedAt: null };
  if (CODEX_FAMILIES.includes(name)) {
    return resolveCodex(name, codexHome ?? process.env.CODEX_HOME ?? join(homedir(), ".codex"));
  }
  if (name === GROK_FAMILY) {
    return resolveGrok(grokHome ?? process.env.GROK_HOME ?? join(homedir(), ".grok"));
  }
  throw new ModelFamilyError(`unknown model family; expected one of ${FAMILIES.join(", ")}`);
}

export function resolveFamily(family, options) {
  return resolveFamilyDetail(family, options).id;
}
