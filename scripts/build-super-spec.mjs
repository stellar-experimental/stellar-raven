#!/usr/bin/env node
/**
 * Deterministic builder for `specs/super-spec.json` (`codemode.spec()` in the sandbox;
 * see ARCHITECTURE.md).
 *
 * Emits one OpenAPI 3.1 document over lumenloop, scout, stellarDocs, stellarOrg, and
 * the synthetic `skills` service. Paths are `/{service}/{operation}` with `operationId`
 * matching the catalog id; includes `x-service`, `x-execute`, `x-upstream`, `x-mintlify`,
 * `x-services`, and `x-generated`. Exposure matches `catalog/manifest.json` exactly
 * (ADR-0003). Determinism is asserted by `test/super-spec.test.ts`.
 */
import { readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LUMENLOOP_DESCRIPTION_NOTES,
  SCOUT_DESCRIPTION_NOTES,
  assertSkillDescriptionOverrideIdsResolve,
  scoutRefRewrites,
  rewriteScoutRefs,
  skillDescription,
  scrubScoutDescription,
  scrubNonExposedScoutSchemaRefs
} from "./description-notes.mjs";
import { writeFileAtomic } from "./lib/shared.mjs";
import { loadSkillTexts } from "./lib/skill-mirror.mjs";
import { compactResponseSchema } from "./lib/super-spec-compaction.ts";
import { RETIRED_ONBOARDING_SKILLS, scrubNonExposedRefs } from "./exposure.mjs";
import { assertNoNonExposedRefsInText } from "./emitted-text-guard.mjs";
import { applyModelContractCorrection } from "./catalog-data/model-contract-corrections.mjs";
// src/skills/README.md defines the shared runnable-skill registry contract.
// The catalog and specification emit the same registry schemas through native TypeScript type stripping.
import { RUNNERS } from "../src/skills/runners/index.ts";
import { lumenloopInputSchema, lumenloopOutputSchema } from "../src/adapters/lumenloop-shape.ts";
import { isOversizedOutputBlock } from "../src/catalog/output-compaction.ts";
import {
  jsonSchemaToType,
  sanitizeToolName,
  toPascalCase
} from "../src/catalog/vendor/json-schema-types.ts";
import { parseFrontmatter, plainText, slugify } from "./lib/skill-markdown.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_PATH = join(ROOT, "specs", "super-spec.json");

const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

/** Recursively sort object keys (arrays keep order) for stable output. */
function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = sortKeysDeep(value[key]);
    return out;
  }
  return value;
}

function firstSentence(text, max = 120) {
  const plain = plainText(text);
  const period = plain.indexOf(". ");
  const cut = period > 10 && period < max ? plain.slice(0, period + 1) : plain.slice(0, max);
  return cut.trim();
}

// ---------------------------------------------------------------------------
// Exposure lookup — the catalog manifest is the single source of truth: an
// id is in the spec iff it is in the manifest (ADR-0003 build-time filtering).
// ---------------------------------------------------------------------------

function exposedIds(manifest) {
  return new Set(manifest.entries.map((e) => e.id));
}

/**
 * Replace only oversized success-response schemas in codemode.spec().
 *
 * The decision uses the same rendered-output threshold as compact search
 * signatures. The compact schema keeps the exact top-level property names
 * and required list. The catalog remains the full-schema source used by
 * codemode.describe(id).
 */
function compactOversizedResponseSchemas(paths, manifest) {
  const entries = new Map(
    manifest.entries.filter((entry) => entry.kind === "operation").map((entry) => [entry.id, entry])
  );
  const compacted = [];

  for (const item of Object.values(paths)) {
    for (const op of Object.values(item)) {
      const entry = entries.get(op.operationId);
      if (!entry?.outputSchema) continue;

      const operationName = entry.id.slice(entry.id.lastIndexOf(".") + 1);
      const typeName = `${toPascalCase(sanitizeToolName(operationName))}Output`;
      const outputBlock = jsonSchemaToType(entry.outputSchema, typeName);
      if (!isOversizedOutputBlock(outputBlock)) continue;

      const media = op.responses?.["200"]?.content?.["application/json"];
      if (!media?.schema) {
        throw new Error(
          `super-spec: oversized output schema for ${entry.id} has no application/json 200 response`
        );
      }

      media.schema = compactResponseSchema(entry);
      compacted.push(entry.id);
    }
  }

  return compacted.sort();
}

// ---------------------------------------------------------------------------
// lumenloop — exactly the cataloged tools (exclusions never reach the spec)
// ---------------------------------------------------------------------------

function buildLumenloopPaths(inv, exposed) {
  const paths = {};
  const consumedNotes = new Set();

  // Cataloged tools: authoritative descriptions from the inventory tools union
  // (carries when_to_use / returns), NOT the embedded OpenAPI /tools/* paths.
  for (const tool of inv.tools) {
    const id = `lumenloop.${tool.name}`;
    if (!exposed.has(id)) continue;
    const contract = applyModelContractCorrection(id, {
      description: tool.description,
      returns: tool.returns,
      inputSchema: lumenloopInputSchema(id, tool.input_schema ?? null),
      outputSchema: lumenloopOutputSchema(id, tool.output_schema ?? null)
    });
    const descriptionParts = [contract.description];
    if (tool.when_to_use) descriptionParts.push(`When to use: ${tool.when_to_use}`);
    if (contract.returns) descriptionParts.push(`Returns: ${contract.returns}`);
    const note = LUMENLOOP_DESCRIPTION_NOTES[tool.name];
    if (note !== undefined) {
      descriptionParts.push(note);
      consumedNotes.add(tool.name);
    }
    const { inputSchema, outputSchema } = contract;
    const op = {
      operationId: id,
      summary: firstSentence(contract.description),
      description: descriptionParts.join("\n\n"),
      tags: ["lumenloop", ...(tool.category ? [tool.category] : [])],
      requestBody: inputSchema
        ? {
            required: true,
            content: { "application/json": { schema: inputSchema } }
          }
        : undefined,
      responses: {
        200: {
          description: contract.returns ? plainText(contract.returns) : "Tool result",
          ...(outputSchema
            ? { content: { "application/json": { schema: outputSchema } } }
            : {})
        }
      },
      "x-service": "lumenloop",
      "x-upstream": { method: "POST", path: `/v1/tools/${tool.name}` },
      "x-execute": `await lumenloop.${tool.name}(args)`
    };
    if (!op.requestBody) delete op.requestBody;
    paths[`/lumenloop/${tool.name}`] = { post: op };
  }

  // Fail loud on orphaned notes (mirrors scripts/build-catalog.mjs): an
  // upstream tool rename/removal must break the build, not silently drop
  // catalog guidance.
  for (const key of Object.keys(LUMENLOOP_DESCRIPTION_NOTES)) {
    if (!consumedNotes.has(key)) {
      throw new Error(
        `LUMENLOOP_DESCRIPTION_NOTES key "${key}" matched no lumenloop tool name — orphaned note ` +
          `(upstream renamed/removed the tool?); update scripts/description-notes.mjs`
      );
    }
  }

  // The non-tool lumenloop API surface (account, billing, discovery) is NOT
  // described here: no sandbox fn exists for it, and the spec describes only
  // what code can call (ADR-0003 — nothing uncallable is delivered).

  return paths;
}

// ---------------------------------------------------------------------------
// scout (Stellar Light) — embedded OpenAPI carried near-verbatim, re-keyed
// ---------------------------------------------------------------------------

/** Rewrite internal $refs to namespaced components ("#/components/<group>/<service>.<name>"). */
function namespaceRefs(node, service) {
  if (Array.isArray(node)) return node.map((n) => namespaceRefs(n, service));
  if (!node || typeof node !== "object") return node;
  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === "$ref" && typeof value === "string") {
      // Match every component group so no renamed definition dangles after pruning.
      out[key] = value.replace(/^#\/components\/([^/]+)\//, `#/components/$1/${service}.`);
    } else {
      out[key] = namespaceRefs(value, service);
    }
  }
  return out;
}

/**
 * Collect local `#/components/<group>/<name>` pointers from any string value (covers `$ref`,
 * `$dynamicRef`, and `discriminator.mapping`). Deep pointers normalize to their containing component.
 */
function componentPointersIn(node, acc = new Set()) {
  if (!node || typeof node !== "object") return acc;
  if (Array.isArray(node)) {
    for (const item of node) componentPointersIn(item, acc);
    return acc;
  }
  for (const value of Object.values(node)) {
    if (typeof value === "string") {
      const match = value.match(/^#\/components\/([^/]+)\/([^/]+)/);
      // JSON Pointer escapes, decoded in the required order (~1 then ~0).
      if (match) acc.add(`${match[1]}/${match[2].replace(/~1/g, "/").replace(/~0/g, "~")}`);
    } else {
      componentPointersIn(value, acc);
    }
  }
  return acc;
}

/** Fail closed if any component pointer dangles after pruning. */
function assertEveryComponentRefResolves(doc) {
  for (const pointer of componentPointersIn(doc)) {
    const [group, name] = pointer.split("/");
    if (!doc.components?.[group]?.[name]) {
      throw new Error(
        `super-spec: dangling component reference "#/components/${pointer}" after pruning — ` +
          `pruneUnreachableComponents did not see the edge that reaches it. Widen ` +
          `componentPointersIn (scripts/build-super-spec.mjs) rather than skipping this check.`
      );
    }
  }
}

/** Drop component definitions unreachable (transitively) from exposed paths (ADR-0003). */
function pruneUnreachableComponents(paths, components) {
  const reachable = componentPointersIn(paths);
  for (let grew = true; grew; ) {
    grew = false;
    for (const key of [...reachable]) {
      const [group, name] = key.split("/");
      const def = components[group]?.[name];
      if (!def) continue;
      for (const ref of componentPointersIn(def)) {
        if (!reachable.has(ref)) {
          reachable.add(ref);
          grew = true;
        }
      }
    }
  }

  const pruned = {};
  const dropped = [];
  for (const [group, defs] of Object.entries(components)) {
    pruned[group] = {};
    for (const [name, def] of Object.entries(defs)) {
      if (reachable.has(`${group}/${name}`)) pruned[group][name] = def;
      else dropped.push(`${group}/${name}`);
    }
  }
  return { components: pruned, dropped };
}

function buildScout(inv, exposed, manifest) {
  const openapi = inv.openapi;
  const paths = {};
  const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];
  const consumedNotes = new Set();
  // MUST match scripts/build-catalog.mjs buildScout: rewrite raw-REST
  // cross-references to callable scout.<op> names and strip markdown so the
  // in-sandbox spec and the manifest present identical model-facing prose.
  const refPairs = scoutRefRewrites(openapi);

  for (const [path, pathItem] of Object.entries(openapi.paths)) {
    for (const method of HTTP_METHODS) {
      const upstream = pathItem[method];
      if (!upstream) continue;
      const opName = upstream.operationId ?? `${method}_${slugify(path)}`;
      const id = `scout.${opName}`;
      if (!exposed.has(id)) continue;
      // pathItem-level parameters are merged into the op so nothing is lost
      // when re-keying the path to the callable name.
      const correctedContract = applyModelContractCorrection(id, {
        parameters: [...(pathItem.parameters ?? []), ...(upstream.parameters ?? [])]
      });
      const parameters = correctedContract.parameters;
      // Same boundary guidance the catalog manifest carries (shared data map
      // in description-notes.mjs) so codemode.spec() readers see it too.
      const note = SCOUT_DESCRIPTION_NOTES[opName];
      if (note !== undefined) consumedNotes.add(opName);
      const cleanFields = scrubScoutDescription(opName, upstream);
      const summary = cleanFields.summary
        ? plainText(rewriteScoutRefs(cleanFields.summary, refPairs))
        : undefined;
      // Scrub excluded-endpoint clauses before the rewrite — MUST match
      // build-catalog.mjs so both model-facing surfaces stay identical.
      const cleanDescription = cleanFields.description
        ? plainText(rewriteScoutRefs(cleanFields.description, refPairs))
        : undefined;
      const description = [cleanDescription, note ? plainText(note) : undefined]
        .filter(Boolean)
        .join("\n\n");
      let responses = upstream.responses
        ? scrubNonExposedScoutSchemaRefs(namespaceRefs(upstream.responses, "scout"))
        : undefined;
      const op = {
        operationId: id,
        ...(summary ? { summary } : {}),
        ...(description ? { description } : {}),
        tags: ["scout", ...(upstream.tags ?? [])],
        ...(parameters.length > 0
          ? { parameters: scrubNonExposedScoutSchemaRefs(namespaceRefs(parameters, "scout")) }
          : {}),
        ...(upstream.requestBody
          ? { requestBody: scrubNonExposedScoutSchemaRefs(namespaceRefs(upstream.requestBody, "scout")) }
          : {}),
        ...(responses ? { responses } : {}),
        "x-service": "scout",
        "x-upstream": { method: method.toUpperCase(), path },
        "x-execute": `await scout.${opName}(args)`
      };
      (paths[`/scout/${opName}`] ??= {})[method] = op;
    }
  }

  // Fail loud on orphaned notes (mirrors scripts/build-catalog.mjs): an
  // upstream rename/removal must break the build, not silently drop the
  // boundary guidance from codemode.spec().
  for (const key of Object.keys(SCOUT_DESCRIPTION_NOTES)) {
    if (!consumedNotes.has(key)) {
      throw new Error(
        `SCOUT_DESCRIPTION_NOTES key "${key}" matched no scout operationId — orphaned note ` +
          `(upstream renamed/removed the operation?); update scripts/description-notes.mjs`
      );
    }
  }

  // Namespaced components so scout $refs stay resolvable in the merged doc.
  const components = {};
  for (const [group, defs] of Object.entries(openapi.components ?? {})) {
    components[group] = {};
    for (const [name, def] of Object.entries(defs)) {
      components[group][`scout.${name}`] = scrubNonExposedScoutSchemaRefs(
        namespaceRefs(def, "scout")
      );
    }
  }

  return { paths, components, tags: scrubNonExposedScoutSchemaRefs(openapi.tags ?? []) };
}

// ---------------------------------------------------------------------------
// stellarDocs — 12 authored spec-as-data operations (specs/stellar-docs.json)
// ---------------------------------------------------------------------------

function buildStellarDocs(spec, exposed) {
  const paths = {};
  for (const op of spec.operations) {
    if (!exposed.has(op.id)) continue;
    paths[`/stellarDocs/${op.name}`] = {
      post: {
        operationId: op.id,
        summary: firstSentence(op.description),
        description: op.description,
        tags: ["stellarDocs"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: op.params } }
        },
        responses: {
          200: {
            description: op.returns ?? "Search result",
            ...(op.outputSchema
              ? { content: { "application/json": { schema: op.outputSchema } } }
              : {})
          }
        },
        "x-service": "stellarDocs",
        // The exact request mapping the host adapter applies — kept as a
        // vendor extension so spec-grepping code can see what each intent op
        // actually does (endpoint, path-prefix scope, page grouping).
        "x-mintlify": op.mintlify,
        "x-execute": `await stellarDocs.${op.name}(args)`
      }
    };
  }
  return paths;
}

// ---------------------------------------------------------------------------
// stellarOrg — 2 authored operations (specs/stellar-org.json)
// ---------------------------------------------------------------------------

function buildStellarOrg(spec, exposed) {
  const paths = {};
  for (const op of spec.operations) {
    if (!exposed.has(op.id)) continue;
    paths[`/stellarOrg/${op.name}`] = {
      post: {
        operationId: op.id,
        summary: firstSentence(op.description),
        description: op.description,
        tags: ["stellarOrg"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: op.params } }
        },
        responses: {
          200: {
            description: op.returns ?? "Result",
            ...(op.outputSchema ? { content: { "application/json": { schema: op.outputSchema } } } : {})
          }
        },
        "x-service": "stellarOrg",
        "x-endpoint": op.endpoint,
        "x-execute": `await stellarOrg.${op.name}(args)`
      }
    };
  }
  return paths;
}

// Synthetic `skills` service (4 operations; heading-list index embedded in /skills/list_skills).

function buildSkillIndex(manifest, exposed, texts) {
  // Emit only skills/sections exposed in the manifest (ADR-0003); slug disambiguation must match build-catalog.mjs.
  const index = [];
  for (const source of manifest.sources) {
    for (const skill of source.skills) {
      const skillId = `skills.${source.id}.${skill.name}`;
      if (!exposed.has(skillId)) continue;
      const key = `${source.id}/${skill.name}/SKILL.md`;
      const loaded = texts.get(key);
      if (loaded === undefined) throw new Error(`skill file ${key} was not loaded`);
      const raw = loaded.text;
      const { attrs, body } = parseFrontmatter(scrubNonExposedRefs(raw, key));
      const sections = [];
      const usedSlugs = new Set();
      for (const line of body.split("\n")) {
        if (!line.startsWith("## ")) continue;
        const heading = plainText(line.slice(3));
        let slug = slugify(heading);
        for (let n = 2; usedSlugs.has(slug); n++) slug = `${slugify(heading)}-${n}`;
        usedSlugs.add(slug);
        if (exposed.has(`${skillId}#${slug}`)) sections.push(heading);
      }
      for (const file of skill.files ?? []) {
        if (file.path === "SKILL.md" || !file.path.endsWith(".md")) continue;
        const key = `file:${file.path}`;
        if (exposed.has(`${skillId}#${key}`)) sections.push(key);
      }
      index.push({
        id: skillId,
        source: source.id,
        description: skillDescription(skillId, attrs.description || skill.name),
        sections
      });
    }
  }
  return index.sort((a, b) => (a.id < b.id ? -1 : 1));
}

/**
 * Build /skills/run_skill x-runnable-index from manifest descriptions and registered runner schemas.
 * src/skills/README.md defines the shared callable contract.
 * Registry drift fails the build before the specification can advertise an unsupported runner.
 */
function buildRunnableIndex(catalogManifest) {
  const runnableEntries = catalogManifest.entries.filter((e) => e.runnable === true);
  const entryIds = new Set(runnableEntries.map((e) => e.id));
  for (const id of Object.keys(RUNNERS)) {
    if (!entryIds.has(id)) {
      throw new Error(
        `RUNNERS registry key "${id}" has no runnable skill entry in catalog/manifest.json — ` +
          `stale manifest; run node scripts/build-catalog.mjs before the super spec.`
      );
    }
  }
  for (const entry of runnableEntries) {
    if (!RUNNERS[entry.id]) {
      throw new Error(
        `catalog/manifest.json marks "${entry.id}" runnable but no runner is bundled under that ` +
          `id — registry/manifest drift; reconcile src/skills/runners/index.ts and rebuild the catalog.`
      );
    }
  }
  // Manifest entries are id-sorted, so the index (and the name enum derived
  // from it) is deterministic without a second sort.
  return runnableEntries.map((entry) => ({
    id: entry.id,
    description: entry.description,
    inputSchema: RUNNERS[entry.id].inputSchema,
    outputSchema: RUNNERS[entry.id].outputSchema
  }));
}

function buildSkillsPaths(skillIndex, runnableIndex) {
  const skillIds = skillIndex.map((s) => s.id);
  const sectionCount = skillIndex.reduce((n, s) => n + s.sections.length, 0);
  const runnableIds = runnableIndex.map((s) => s.id);

  return {
    "/skills/list_skills": {
      get: {
        operationId: "skills.list_skills",
        summary: `List all ${skillIds.length} pinned skills (agent playbooks) with descriptions and section headings.`,
        description:
          `The full skill index is embedded RIGHT HERE in this operation's x-skill-index: ` +
          `${skillIds.length} skills across ${new Set(skillIndex.map((s) => s.source)).size} pinned upstream sources ` +
          `(${[...new Set(skillIndex.map((s) => s.source))].join(", ")}), ${sectionCount} addressable sections total. ` +
          `Each index entry: { id, source, description, sections } where sections lists '##' headings of SKILL.md ` +
          `plus 'file:<relpath>' keys for extra reference files. No separate call is needed — read x-skill-index from this spec.`,
        tags: ["skills"],
        responses: { 200: { description: "The x-skill-index array on this operation." } },
        "x-service": "skills",
        "x-execute": `(await codemode.spec()).paths["/skills/list_skills"].get["x-skill-index"]`,
        "x-skill-index": skillIndex
      }
    },
    "/skills/read_skill": {
      post: {
        operationId: "skills.read_skill",
        summary: "Read one pinned skill's full SKILL.md, or only the requested sections.",
        description:
          "Delivers skill context when and as relevant: pass the exact skill id (see the enum / x-skill-index on " +
          "/skills/list_skills) and optionally a `sections` array of section headings (or their slugs) and/or " +
          "'file:<relpath>' keys to fetch only the parts you need instead of a 40 KB document. " +
          "Unknown sections fail the whole read and list what exists — names are exact-match, never fuzzy.",
        tags: ["skills"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["name"],
                properties: {
                  name: {
                    type: "string",
                    description: "Exact skill id.",
                    enum: skillIds
                  },
                  sections: {
                    type: "array",
                    items: { type: "string" },
                    description:
                      "Section headings (or slugs) and/or 'file:<relpath>' keys from the skill's `sections` list in x-skill-index. Omit for the whole SKILL.md."
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description:
              "{ ok: true, data: { id, url (main SKILL.md pinned address), content? (whole skill) | sections?: [{section, content, url (exact pinned address for that section)}], availableSections, notice? } } or { ok: false, error: { kind, message, hint? } }."
          }
        },
        "x-service": "skills",
        "x-execute": `await codemode.skill.read(name, { sections })`
      }
    },
    "/skills/run_skill": {
      post: {
        operationId: "skills.run_skill",
        summary:
          "Execute a runnable skill's data-gathering pipeline host-side and get one compact composed result.",
        description:
          `${runnableIds.length} of the pinned skills are RUNNABLE: their mechanical fetch-and-project ` +
          `core also executes as vetted host-side code, composing several service calls into one compact, ` +
          `typed result. Pass the exact skill id (enum below — ids are exact-match, never fuzzy) and an ` +
          `input object; input is validated host-side against the skill's inputSchema in x-runnable-index ` +
          `on this operation, which also carries each skill's outputSchema (the \`data\` payload contract). ` +
          `The result rides the standard service-call envelope, and \`data.calls\` is a host-recorded audit ` +
          `trail of every constituent call ({ op, ok, errorKind?, ms }). Judgment steps (quote selection, ` +
          `synthesis) stay with you — the same skills remain readable via codemode.skill.read(id, { sections }).`,
        tags: ["skills"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["name", "input"],
                properties: {
                  name: {
                    type: "string",
                    description: "Exact runnable skill id.",
                    enum: runnableIds
                  },
                  input: {
                    type: "object",
                    description:
                      "Arguments for the skill, validated against its inputSchema in x-runnable-index (unknown keys are refused, never ignored)."
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description:
              "{ ok: true, data } | { ok: false, error: { kind: \"error\" | \"soft-empty\", message, hint? } } — " +
              "the service-call envelope; data matches the skill's outputSchema in x-runnable-index and always " +
              "includes the host-recorded `calls` audit trail."
          }
        },
        "x-service": "skills",
        "x-execute": `await codemode.skill.run(name, input)`,
        "x-runnable-index": runnableIndex
      }
    },
    "/skills/search_skills": {
      post: {
        operationId: "skills.search_skills",
        summary: "Ranked lexical search over whole skills.",
        description:
          "Scores whole skills against a targeted query and returns ranked skill ids. Each hit's availableSections " +
          "lists exact section keys accepted by codemode.skill.read; sections remain readable but are not independent ranked hits.",
        tags: ["skills"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["query"],
                properties: {
                  query: { type: "string", description: "Targeted query, e.g. \"soroban storage patterns\"." },
                  limit: { type: "integer", minimum: 1, maximum: 50, default: 10 }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description:
              "{ ok: true, hits: [{ id, service, kind, score, tier, description }], total, truncated, confidence, recoveryMetadata } or " +
              "{ ok: false, error } (an unknown kind/service filter value is rejected with the valid names — " +
              "filters are exact-match). Each hit's tier is \"gated\" (strict primary scorer) or \"backfill\" " +
              "(gate-relaxed page fill). Scores share one scale; gated hits lead except a backfill hit may be " +
              "promoted when it decisively dominates (>=1.6x), so hit order is authoritative. confidence reports hit count, the absolute top-two score gap, and both tiers. recoveryMetadata reports relevant skills excluded only by a service filter. " +
              "truncated: true means more entries matched (total) than returned — raise limit, try a different family, or vary vocabulary."
          }
        },
        "x-service": "skills",
        "x-execute": `await codemode.search({ query, kind: "skill", service: "skills" })`
      }
    }
  };
}

// ---------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------

async function main() {
  const lumenloop = readJson("inventory/lumenloop.json");
  const stellarLight = readJson("inventory/stellar-light.json");
  const stellarDocsSpec = readJson("specs/stellar-docs.json");
  const stellarOrgSpec = readJson("specs/stellar-org.json");
  const skillsManifest = readJson("ecosystem-skills/MANIFEST.json");
  const catalogManifest = readJson("catalog/manifest.json");
  const exposed = exposedIds(catalogManifest);
  assertSkillDescriptionOverrideIdsResolve(
    catalogManifest.entries.filter((entry) => entry.kind === "skill").map((entry) => entry.id),
    "build-super-spec"
  );

  const scout = buildScout(stellarLight, exposed, catalogManifest);
  const skillTexts = await loadSkillTexts(skillsManifest, {
    skip: (name) => RETIRED_ONBOARDING_SKILLS.has(name)
  });
  const skillIndex = buildSkillIndex(skillsManifest, exposed, skillTexts);
  const runnableIndex = buildRunnableIndex(catalogManifest);

  const paths = {
    ...buildLumenloopPaths(lumenloop, exposed),
    ...scout.paths,
    ...buildStellarDocs(stellarDocsSpec, exposed),
    ...buildStellarOrg(stellarOrgSpec, exposed),
    ...buildSkillsPaths(skillIndex, runnableIndex)
  };

  // operationId uniqueness — the ids double as sandbox callable names.
  const seen = new Set();
  for (const item of Object.values(paths)) {
    for (const op of Object.values(item)) {
      if (seen.has(op.operationId)) throw new Error(`duplicate operationId: ${op.operationId}`);
      seen.add(op.operationId);
    }
  }

  // Exposure completeness (the reverse direction of "spec ⊆ manifest"): every
  // manifest OPERATION must appear in the spec — a cataloged op the builders
  // above failed to cover would silently vanish from codemode.spec().
  for (const entry of catalogManifest.entries) {
    if (entry.kind === "operation" && !seen.has(entry.id)) {
      throw new Error(`cataloged operation ${entry.id} missing from the super spec`);
    }
  }

  const compactedResponseSchemas = compactOversizedResponseSchemas(paths, catalogManifest);

  const serviceTags = [
    {
      name: "lumenloop",
      description:
        "Lumenloop Stellar ecosystem intelligence API: curated project directory, documents/content corpus, SCF submissions, semantic search, partner research (partner key held host-side)."
    },
    {
      name: "scout",
      description:
        "Stellar Light / Scout read-only public API: projects, repos, hackathons, builders, partners, funding/RFPs, research corpus, skills marketplace, analytics (keyless)."
    },
    {
      name: "stellarDocs",
      description:
        "Official Stellar developer docs at developers.stellar.org, searched via the Mintlify search and page-content API (12 intent-named operations)."
    },
    {
      name: "stellarOrg",
      description:
        "The Stellar Development Foundation's website, stellar.org: keyless site search (blog, press and events rows removed) and main-text page reads (2 operations)."
    },
    {
      name: "skills",
      description:
        "Ecosystem agent-skill playbooks, served from their pinned upstream commit and hash-verified at read time: list, targeted section reads, and ranked search. The skill index is embedded in /skills/list_skills x-skill-index. Skills marked runnable also execute host-side via /skills/run_skill (codemode.skill.run)."
    }
  ];

  const { components: prunedComponents, dropped: droppedComponents } = pruneUnreachableComponents(
    paths,
    scout.components
  );

  const spec = {
    openapi: "3.1.0",
    info: {
      title: "stellar-raven-codemode — unified super spec",
      version: "1.0.0",
      description:
        "One spec covering every operation this MCP server can execute, across five services: lumenloop, scout " +
        "(Stellar Light), stellarDocs (Mintlify-backed docs search), stellarOrg (the stellar.org website), and skills (pinned agent playbooks). " +
        "Paths are keyed '/{service}/{operation}' and each operationId is the exact callable name: an operation " +
        "with operationId 'lumenloop.search_directory' is invoked inside the execute tool's sandbox as " +
        "`await lumenloop.search_directory(args)` — args is ONE object matching the operation's requestBody schema " +
        "(POST ops) or its parameter names (GET ops). The exact call line is on each operation as x-execute. " +
        "Every call resolves (never throws) to { ok: true, data, asOf, asOfBasis, caveat? } or " +
        "{ ok: false, error: { service, kind, message } }; the 200 response schema documents `data`. " +
        "`asOf` is the upstream data date (dataAsOf or asOf) when the payload states one, else the host " +
        "observation time, and `asOfBasis` names which; " +
        "`caveat` is \"no-rows\" or \"unverified-match\" when the host can show it. Every path in this spec is callable — exposure " +
        "is filtered at build time, so nothing uncallable is described. Auth is handled host-side — code never " +
        "sees keys.",
      "x-generatedAt": catalogManifest.generatedAt
    },
    tags: [...serviceTags, ...scout.tags],
    paths,
    components: prunedComponents,
    "x-services": {
      lumenloop: {
        base: lumenloop.source.base,
        authEnv: lumenloop.source.authEnv,
        fetchedAt: lumenloop.fetchedAt,
        source: lumenloop.source.tools,
        note: "Exactly the cataloged tools — the account/billing/discovery API surface is host-side only and not described here (ADR-0003: the spec contains only what code can call)."
      },
      scout: {
        base: stellarLight.openapi.servers?.[0]?.url ?? "https://stellarlight.xyz",
        fetchedAt: stellarLight.fetchedAt,
        source: `${stellarLight.openapi.servers?.[0]?.url ?? "https://stellarlight.xyz"}/api/openapi.json`,
        note: "Read-only keyless API, carried near-verbatim from the upstream OpenAPI (components namespaced 'scout.*')."
      },
      stellarDocs: {
        backend: stellarDocsSpec.backend,
        authoredAt: stellarDocsSpec.authoredAt,
        source: "specs/stellar-docs.json",
        note: "Authored spec-as-data operations over the Mintlify discovery API; x-mintlify on each op records the exact request mapping."
      },
      stellarOrg: {
        backend: stellarOrgSpec.backend,
        authoredAt: stellarOrgSpec.authoredAt,
        source: "specs/stellar-org.json",
        note: "Authored spec-as-data operations over stellar.org; x-endpoint on each op names the request the host adapter makes."
      },
      skills: {
        mirror: "ecosystem-skills/",
        syncedAt: skillsManifest.synced_at,
        skillCount: skillIndex.length,
        runnableSkillCount: runnableIndex.length,
        sources: skillsManifest.sources.map((s) => ({ id: s.id, skills: s.skills.length })),
        note: "Deliberately 4 operations, not one path per skill/section — the index lives in /skills/list_skills x-skill-index (design doc §3); runnable-skill contracts live in /skills/run_skill x-runnable-index (research/skill-run-design.md §5)."
      }
    },
    "x-generated": {
      builder: "scripts/build-super-spec.mjs",
      generatedAt: catalogManifest.generatedAt,
      catalogEntries: catalogManifest.entries.length
    }
  };

  const sorted = sortKeysDeep(spec);
  assertEveryComponentRefResolves(sorted);
  // ADR-0003 leak guard over the full serialized spec (paths + components) returned by codemode.spec().
  assertNoNonExposedRefsInText(JSON.stringify(sorted), "specs/super-spec.json");

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  const pretty = `${JSON.stringify(sorted, null, 2)}\n`;
  writeFileAtomic(OUT_PATH, pretty);

  // Size report (design doc §4): the compact form is what ships into the
  // sandbox, so that is the number that matters.
  const compactBytes = Buffer.byteLength(JSON.stringify(sorted), "utf8");
  const prettyBytes = Buffer.byteLength(pretty, "utf8");
  const counts = {};
  for (const item of Object.values(sorted.paths)) {
    for (const op of Object.values(item)) {
      const svc = op["x-service"];
      counts[svc] = (counts[svc] ?? 0) + 1;
    }
  }
  console.log(`specs/super-spec.json — ${Object.keys(sorted.paths).length} paths (all callable)`);
  if (droppedComponents.length) {
    console.log(`  pruned ${droppedComponents.length} unreachable component(s): ${droppedComponents.join(", ")}`);
  }
  if (compactedResponseSchemas.length) {
    console.log(
      `  compacted ${compactedResponseSchemas.length} oversized response schema(s): ${compactedResponseSchemas.join(", ")}`
    );
  }
  for (const [svc, c] of Object.entries(counts).sort()) {
    console.log(`  ${svc}: ${c} operations`);
  }
  console.log(`  pretty: ${prettyBytes} bytes; compact (ships into sandbox): ${compactBytes} bytes ≈ ${Math.ceil(compactBytes / 4).toLocaleString()} tokens`);
}

await main();
