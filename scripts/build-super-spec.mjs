#!/usr/bin/env node
/**
 * build-super-spec.mjs — deterministic unified "super spec" builder.
 * Design rationale: research/super-spec-design.md.
 *
 * Emits specs/super-spec.json: ONE OpenAPI-3.1-STYLE document covering every
 * service this MCP fronts — lumenloop, scout, stellarDocs — plus a synthetic
 * `skills` core service. This is the document the code-shaped `search` tool
 * injects into its Dynamic Worker sandbox as `codemode.spec()` (mirroring
 * @cloudflare/codemode's openApiMcpServer), and that `execute` exposes via
 * the same `codemode.spec()` call.
 *
 * Dialect (see design doc §1):
 *  - paths keyed by namespaced callable name: `/{service}/{operation}`
 *    (e.g. "/lumenloop/search_directory", "/scout/searchProjects");
 *  - operationId = the exact catalog id ("lumenloop.search_directory") —
 *    identical to the sandbox call `lumenloop.search_directory(args)`;
 *  - standard OpenAPI shapes (summary/description/tags/parameters/
 *    requestBody/responses/components) so generic spec-grepping code works;
 *  - per-operation vendor extensions: x-service, x-execute (exact sandbox
 *    call line), x-upstream (real HTTP method+path), x-algolia (stellarDocs
 *    query mapping);
 *  - spec-level x-services (per-service metadata incl. the stellarDocs
 *    backend block + measured corpus taxonomy) and x-generated (provenance,
 *    counts, size).
 *
 * Exposure consistency (ADR-0003): the spec contains EXACTLY the operations
 * in catalog/manifest.json — the manifest is the exposed surface, filtered at
 * build time by scripts/build-catalog.mjs. Recovery-only paths declare their
 * manifest role and require a host receipt. No generic denied paths exist.
 *
 * Determinism: object keys sorted recursively, entries sorted by path,
 * generatedAt taken from the catalog manifest (itself derived from input
 * snapshots — never wall clock). Running twice yields byte-identical output
 * (asserted by test/super-spec.test.ts).
 */
import { readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LUMENLOOP_DESCRIPTION_NOTES,
  SCOUT_DESCRIPTION_NOTES,
  scoutRefRewrites,
  rewriteScoutRefs,
  scrubScoutDescription,
  scrubNonExposedScoutSchemaRefs
} from "./description-notes.mjs";
import { writeFileAtomic } from "./lib/shared.mjs";
import { loadSkillTexts } from "./lib/skill-mirror.mjs";
import { RETIRED_ONBOARDING_SKILLS, scrubNonExposedRefs } from "./exposure.mjs";
import { assertNoNonExposedRefsInText } from "./emitted-text-guard.mjs";
import { applyModelContractCorrection } from "./catalog-data/model-contract-corrections.mjs";
// The runnable-skill allowlist-as-data (research/skill-run-design.md §5):
// the SAME registry scripts/build-catalog.mjs attaches to the manifest, so
// the two model-facing surfaces cannot drift (native type stripping, as for
// build-catalog.mjs's src/ imports).
import { RUNNERS } from "../src/skills/runners/index.ts";
import { lumenloopInputSchema, lumenloopOutputSchema } from "../src/adapters/lumenloop-shape.ts";
import { parseFrontmatter, plainText, slugify } from "./lib/skill-markdown.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_PATH = join(ROOT, "specs", "super-spec.json");

const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

// ---------------------------------------------------------------------------
// Local helpers. The three that MUST agree with build-catalog.mjs now come
// from ./lib/skill-markdown.mjs instead of being copied here.
// ---------------------------------------------------------------------------

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
      returns: tool.returns,
      inputSchema: lumenloopInputSchema(id, tool.input_schema ?? null),
      outputSchema: lumenloopOutputSchema(id, tool.output_schema ?? null)
    });
    const descriptionParts = [tool.description];
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
      summary: firstSentence(tool.description),
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

/** Rewrite internal $refs to the namespaced components ("#/components/schemas/scout.X"). */
function namespaceRefs(node, service) {
  if (Array.isArray(node)) return node.map((n) => namespaceRefs(n, service));
  if (!node || typeof node !== "object") return node;
  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === "$ref" && typeof value === "string") {
      // Every component group, not an allowlist of four: definitions in ANY
      // group get renamed to "<service>.<name>" below, so a ref into a group
      // missing from an allowlist would keep pointing at the pre-rename name
      // and dangle (and, since the prune, be dropped as unreachable).
      out[key] = value.replace(/^#\/components\/([^/]+)\//, `#/components/$1/${service}.`);
    } else {
      out[key] = namespaceRefs(value, service);
    }
  }
  return out;
}

/**
 * Every local component pointer reachable from `node`, normalized to
 * "<group>/<name>".
 *
 * Deliberately matches any STRING VALUE shaped like a local component pointer,
 * not just values under a `$ref` key: OpenAPI puts real component pointers in
 * `discriminator.mapping` values, and JSON Schema adds `$dynamicRef`. A
 * `$ref`-key-only walk misses both and would prune a live schema. Deep pointers
 * (`#/components/schemas/B/$defs/X`) normalize to their CONTAINING component
 * (`schemas/B`), which is the unit pruning operates on.
 *
 * Over-collecting is safe here (it only keeps a component); under-collecting
 * deletes live schema, so this errs toward keeping. `assertEveryComponentRefResolves`
 * is the fail-closed backstop for anything this still misses.
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

/**
 * Fail closed: after pruning, every local component pointer in the emitted
 * document must resolve to a definition that still exists.
 *
 * This is the invariant that makes the reachability walk above safe to be
 * imperfect. Without it, an unhandled reference shape silently deletes a live
 * schema and the sandbox receives a spec whose $ref resolves to `undefined` —
 * which JSON serialization then drops entirely, so the model sees a
 * silently-degraded contract instead of an error. A dangling ref must break the
 * build, not ship.
 */
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

/**
 * Drop component definitions no exposed path can reach (ADR-0003).
 *
 * Upstream components are copied wholesale, so a component that exists only to
 * describe an EXCLUDED operation rides along into the sandbox spec — dead
 * weight that also carries the excluded endpoint's prose. `scout.FeedbackRequest`
 * did exactly that: the request body of the excluded `POST /api/feedback`, whose
 * description named the raw path, which is the leak the emitted-text guard below
 * now catches. Pruning is the general fix (a scrub-list entry would only silence
 * that one sentence and keep shipping the dead schema); it also makes the spec's
 * own "nothing uncallable is described" claim true of components, not just paths.
 *
 * Reachability is transitive: a kept component's own $refs are kept too.
 */
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
      const catalogEntry = manifest.entries.find((entry) => entry.id === id);
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
      const summary = upstream.summary
        ? plainText(rewriteScoutRefs(upstream.summary, refPairs))
        : undefined;
      // Scrub excluded-endpoint clauses before the rewrite — MUST match
      // build-catalog.mjs so both model-facing surfaces stay identical.
      const cleanDescription = upstream.description
        ? plainText(rewriteScoutRefs(scrubScoutDescription(opName, upstream.description), refPairs))
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
        ...(catalogEntry?.discoveryMode
          ? { "x-discovery-mode": catalogEntry.discoveryMode }
          : {}),
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

  return { paths, components, tags: openapi.tags ?? [] };
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
        // The exact Algolia query mapping the host adapter applies — kept as a
        // vendor extension so spec-grepping code can see what each intent op
        // actually does (facet filters, client-side URL-prefix filters, …).
        "x-algolia": op.algolia,
        "x-execute": `await stellarDocs.${op.name}(args)`
      }
    };
  }
  return paths;
}

// ---------------------------------------------------------------------------
// skills — a synthetic core service: 3 operations, index embedded as data
// (design doc §3: judicious representation, NOT 278 paths; section-level
// discovery via a heading-list index per skill)
// ---------------------------------------------------------------------------

function buildSkillIndex(manifest, exposed, texts) {
  // Exposure-aware: advertise ONLY skills/sections the catalog contains.
  // Retired skills are never emitted by build-catalog.mjs (ADR-0003), so they
  // drop out here too — codemode.spec()'s index stays consistent with what
  // read_skill will actually serve. Slug disambiguation MUST match
  // build-catalog.mjs so the candidate ids line up.
  const index = [];
  for (const source of manifest.sources) {
    for (const skill of source.skills) {
      const skillId = `skills.${source.id}.${skill.name}`;
      if (!exposed.has(skillId)) continue; // retired skill — not advertised
      // Bodies are fetched from the pinned upstream commit and hash-verified
      // (scripts/lib/skill-mirror.mjs) — never vendored here. Only the
      // frontmatter description and the `##` headings reach the spec.
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
        description: attrs.description || skill.name,
        sections
      });
    }
  }
  return index.sort((a, b) => (a.id < b.id ? -1 : 1));
}

/**
 * The runnable-skill index for /skills/run_skill x-runnable-index — the same
 * self-contained-index pattern as /skills/list_skills' x-skill-index (design
 * §5). Descriptions come from the manifest entries (the exposed prose);
 * schemas from the RUNNERS registry (the source build-catalog.mjs attached —
 * one origin, so spec and manifest cannot disagree). Both-direction drift
 * guards mirror runSkill's assertRunnersWired: a stale manifest (or a runner
 * added without a rebuild) breaks THIS build, never ships a spec advertising
 * a contract the deployed dispatch would refuse.
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
              "{ ok: true, id, url (main SKILL.md pinned address), content? (whole skill) | sections?: [{section, content, url (exact pinned address for that section)}], availableSections } or { ok: false, error }."
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
  const skillsManifest = readJson("ecosystem-skills/MANIFEST.json");
  const catalogManifest = readJson("catalog/manifest.json");
  const exposed = exposedIds(catalogManifest);

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
        "Official Stellar developer docs at developers.stellar.org, searched via the Algolia DocSearch index (12 intent-named operations)."
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
        "One spec covering every operation this MCP server can execute, across four services: lumenloop, scout " +
        "(Stellar Light), stellarDocs (Algolia-backed docs search), and skills (pinned agent playbooks). " +
        "Paths are keyed '/{service}/{operation}' and each operationId is the exact callable name: an operation " +
        "with operationId 'lumenloop.search_directory' is invoked inside the execute tool's sandbox as " +
        "`await lumenloop.search_directory(args)` — args is ONE object matching the operation's requestBody schema " +
        "(POST ops) or its parameter names (GET ops). The exact call line is on each operation as x-execute. " +
        "Every call resolves (never throws) to { ok: true, data } or { ok: false, error: { service, kind, " +
        "message } }; the 200 response schema documents `data`. Every path in this spec is callable — exposure " +
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
        taxonomy: stellarDocsSpec.taxonomy,
        authoredAt: stellarDocsSpec.authoredAt,
        source: "specs/stellar-docs.json",
        note: "Authored spec-as-data operations over the Algolia DocSearch index; x-algolia on each op records the exact query mapping."
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

  // Deterministic serialization: sort keys everywhere (arrays keep order;
  // `paths` key order therefore also becomes lexicographic — stable).
  const sorted = sortKeysDeep(spec);

  // Fail closed before anything ships: pruning must never have removed a
  // component something still points at.
  assertEveryComponentRefResolves(sorted);

  // ADR-0003 leak guard over the WHOLE emitted spec, not just its paths. This
  // artifact is serialized into the sandbox and returned by codemode.spec(), so
  // it is emitted text by the same definition build-catalog.mjs and
  // build-micro-map.mjs already guard. Running it here closes the coverage hole
  // that let scout.FeedbackRequest's description ship the excluded
  // "/api/feedback" path; fail the build rather than write the leak.
  assertNoNonExposedRefsInText(JSON.stringify(sorted), "specs/super-spec.json");

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  const pretty = `${JSON.stringify(sorted, null, 2)}\n`;
  writeFileAtomic(OUT_PATH, pretty);

  // Size report (design doc §4): the compact form is what ships into the
  // sandbox per search — that's the number that matters.
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
  for (const [svc, c] of Object.entries(counts).sort()) {
    console.log(`  ${svc}: ${c} operations`);
  }
  console.log(`  pretty: ${prettyBytes} bytes; compact (ships into sandbox): ${compactBytes} bytes ≈ ${Math.ceil(compactBytes / 4).toLocaleString()} tokens`);
}

await main();
