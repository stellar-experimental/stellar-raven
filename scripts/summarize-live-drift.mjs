#!/usr/bin/env node
/**
 * summarize-live-drift.mjs - Markdown and per-source structured evidence for
 * the auto-filed drift issues.
 *
 * This is intentionally advisory. The live-drift-resolution skill remains the
 * source of truth: agents must regenerate locally and classify from the actual
 * diff before committing. This script makes each issue richer by surfacing the
 * first-pass facts CI can derive from the checked-out old snapshot vs the
 * refreshed working tree.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { RUNNERS } from "../src/skills/runners/index.ts";
import { summarizeAnchorChanges } from "./build-stellar-docs-anchors.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "head", "options"];
const MAX_ITEMS = 20;

function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    // Inventory snapshots exceed Node's 1 MiB default (stellar-light.json is over 1 MB).
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["ignore", "pipe", options.ignoreError ? "ignore" : "pipe"]
  });
}

function readJson(path) {
  return JSON.parse(readFileSync(join(ROOT, path), "utf8"));
}

// Returns null only when the path is absent at HEAD; any other failure throws so a
// read error cannot masquerade as a new inventory file.
export function readHeadJson(path) {
  try {
    git(["cat-file", "-e", `HEAD:${path}`], { ignoreError: true });
  } catch {
    return null;
  }
  return JSON.parse(git(["show", `HEAD:${path}`]));
}

function changedFiles(paths) {
  return git(["diff", "--name-only", "--", ...paths])
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function diffStat(paths) {
  return git(["diff", "--stat", "--", ...paths]).trim();
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = stable(value[key]);
    return out;
  }
  return value;
}

function sameJson(a, b) {
  return JSON.stringify(stable(a)) === JSON.stringify(stable(b));
}

function bulletList(items, empty = "none") {
  if (items.length === 0) return `  - ${empty}`;
  const shown = items.slice(0, MAX_ITEMS);
  const lines = shown.map((item) => `  - ${item}`);
  if (items.length > shown.length) lines.push(`  - ... ${items.length - shown.length} more`);
  return lines.join("\n");
}

function opRecords(openapi, service) {
  const records = new Map();
  for (const [path, pathItem] of Object.entries(openapi?.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const op = pathItem?.[method];
      if (!op) continue;
      const httpMethod = method.toUpperCase();
      const opId = op.operationId ?? `${method}_${path.replace(/[^A-Za-z0-9]+/g, "_")}`;
      records.set(`${httpMethod} ${path}`, {
        key: `${httpMethod} ${path}`,
        catalogId: `${service}.${opId}`,
        opId,
        summary: op.summary ?? "",
        description: op.description ?? "",
        routing: op["x-routing"] ?? null,
        op
      });
    }
  }
  return records;
}

export function classifyOpenapiOperations(oldOpenapi, nextOpenapi, service) {
  const oldOps = opRecords(oldOpenapi, service);
  const nextOps = opRecords(nextOpenapi, service);
  const added = [];
  const removed = [];
  const renamed = [];
  const textChanged = [];
  const schemaChanged = [];
  const touchedCatalogIds = new Set();

  for (const [key, next] of nextOps) {
    const old = oldOps.get(key);
    if (!old) {
      added.push(`${next.catalogId} (${key})`);
      touchedCatalogIds.add(next.catalogId);
      continue;
    }
    if (old.opId !== next.opId) {
      renamed.push(`${key}: ${old.catalogId} -> ${next.catalogId}`);
      touchedCatalogIds.add(old.catalogId);
      touchedCatalogIds.add(next.catalogId);
    }
    if (
      old.opId !== next.opId ||
      old.summary !== next.summary ||
      old.description !== next.description ||
      !sameJson(old.routing, next.routing)
    ) {
      textChanged.push(`${next.catalogId} (${key})`);
      touchedCatalogIds.add(next.catalogId);
    } else if (!sameJson(old.op, next.op)) {
      schemaChanged.push(`${next.catalogId} (${key})`);
      touchedCatalogIds.add(next.catalogId);
    }
  }
  for (const [key, old] of oldOps) {
    if (!nextOps.has(key)) {
      removed.push(`${old.catalogId} (${key})`);
      touchedCatalogIds.add(old.catalogId);
    }
  }
  return { added, removed, renamed, textChanged, schemaChanged, touchedCatalogIds };
}

function summarizeOpenapiInventory(path, service, { label = path, skipUnchangedNote = false } = {}) {
  if (!existsSync(join(ROOT, path))) return { touchedCatalogIds: new Set(), lines: [] };
  const oldInv = readHeadJson(path);
  const nextInv = readJson(path);
  if (!oldInv) {
    return {
      touchedCatalogIds: new Set(),
      lines: [`- ${label}: new inventory file; classify manually.`]
    };
  }
  if (sameJson({ ...oldInv, fetchedAt: nextInv.fetchedAt }, nextInv)) {
    return {
      touchedCatalogIds: new Set(),
      lines: skipUnchangedNote ? [] : [`- ${label}: unchanged ignoring fetchedAt.`]
    };
  }

  const { added, removed, renamed, textChanged, schemaChanged, touchedCatalogIds } =
    classifyOpenapiOperations(oldInv.openapi, nextInv.openapi, service);

  const lines = [
    `- ${label}:`,
    `  - operation surface added: ${added.length}`,
    bulletList(added),
    `  - operation surface removed: ${removed.length}`,
    bulletList(removed),
    `  - operationId changes on existing path/method: ${renamed.length}`,
    bulletList(renamed),
    `  - routing text changes (operationId/summary/description/x-routing): ${textChanged.length}`,
    bulletList(textChanged),
    `  - schema/response-only operation changes: ${schemaChanged.length}`,
    bulletList(schemaChanged)
  ];
  return { touchedCatalogIds, lines };
}

function summarizeLumenloop(path) {
  if (!existsSync(join(ROOT, path))) return { touchedCatalogIds: new Set(), lines: [] };
  const oldInv = readHeadJson(path);
  const nextInv = readJson(path);
  if (!oldInv) {
    return {
      touchedCatalogIds: new Set(),
      lines: [`- ${path}: new inventory file; classify manually.`]
    };
  }
  if (sameJson({ ...oldInv, fetchedAt: nextInv.fetchedAt }, nextInv)) {
    return { touchedCatalogIds: new Set(), lines: [`- ${path}: unchanged ignoring fetchedAt.`] };
  }

  const oldTools = new Map((oldInv.tools ?? []).map((tool) => [tool.name, tool]));
  const nextTools = new Map((nextInv.tools ?? []).map((tool) => [tool.name, tool]));
  const added = [];
  const removed = [];
  const textChanged = [];
  const schemaChanged = [];
  const metadataChanged = [];
  const touchedCatalogIds = new Set();

  for (const [name, next] of nextTools) {
    const catalogId = `lumenloop.${name}`;
    const old = oldTools.get(name);
    if (!old) {
      added.push(catalogId);
      touchedCatalogIds.add(catalogId);
      continue;
    }
    const oldText = {
      description: old.description ?? "",
      when_to_use: old.when_to_use ?? "",
      returns: old.returns ?? ""
    };
    const nextText = {
      description: next.description ?? "",
      when_to_use: next.when_to_use ?? "",
      returns: next.returns ?? ""
    };
    const oldSchemas = { input_schema: old.input_schema, output_schema: old.output_schema };
    const nextSchemas = { input_schema: next.input_schema, output_schema: next.output_schema };
    if (!sameJson(oldText, nextText)) {
      textChanged.push(catalogId);
      touchedCatalogIds.add(catalogId);
    } else if (!sameJson(oldSchemas, nextSchemas)) {
      schemaChanged.push(catalogId);
      touchedCatalogIds.add(catalogId);
    } else if (!sameJson(old, next)) {
      metadataChanged.push(catalogId);
    }
  }
  for (const [name] of oldTools) {
    if (!nextTools.has(name)) {
      const catalogId = `lumenloop.${name}`;
      removed.push(catalogId);
      touchedCatalogIds.add(catalogId);
    }
  }

  const lines = [
    `- ${path}:`,
    `  - tool surface added: ${added.length}`,
    bulletList(added),
    `  - tool surface removed: ${removed.length}`,
    bulletList(removed),
    `  - routing text changes (description/when_to_use/returns): ${textChanged.length}`,
    bulletList(textChanged),
    `  - schema changes: ${schemaChanged.length}`,
    bulletList(schemaChanged),
    `  - other tool metadata changes: ${metadataChanged.length}`,
    bulletList(metadataChanged)
  ];
  return { touchedCatalogIds, lines };
}

/**
 * Classify a change to inventory/stellar-docs.json (the Mintlify backend
 * snapshot). Backend identity and contract-shape changes can break the adapter;
 * page-index changes are content churn that the titles snapshot classifies.
 */
export function classifyDocsBackend(oldInv, nextInv) {
  const lines = [];
  if (!sameJson(oldInv?.source, nextInv?.source)) {
    lines.push(
      "  - backend identity changed (API base, search/page path, subdomain, origin, or auth env).",
      "  - Reconcile specs/stellar-docs.json `backend` and src/adapters/stellar-docs.ts before closing."
    );
  }
  if (!sameJson(oldInv?.contract, nextInv?.contract)) {
    lines.push(
      "  - search or page response shape changed.",
      "  - Run the adapter tests and a live smoke of stellarDocs.search_docs and stellarDocs.get_doc_page."
    );
  }
  const oldIndex = oldInv?.pageIndex;
  const nextIndex = nextInv?.pageIndex;
  if (!sameJson(oldIndex, nextIndex)) {
    const oldFiles = new Map((oldIndex?.indexFiles ?? []).map((file) => [file.path, file]));
    const nextFiles = new Map((nextIndex?.indexFiles ?? []).map((file) => [file.path, file]));
    const changed = [];
    for (const [path, next] of nextFiles) {
      const old = oldFiles.get(path);
      if (!old) changed.push(`${path}: added (${next.pageCount} pages)`);
      else if (old.sha256 !== next.sha256) changed.push(`${path}: ${old.pageCount} -> ${next.pageCount} pages, content changed`);
    }
    for (const [path, old] of oldFiles) {
      if (!nextFiles.has(path)) changed.push(`${path}: removed (${old.pageCount} pages)`);
    }
    lines.push(
      `  - llms.txt page index changed (${oldIndex?.pageCount ?? "unknown"} -> ${nextIndex?.pageCount ?? "unknown"} pages).`,
      bulletList(changed)
    );
  }
  return lines;
}

/** Added and removed `path title` pairs between two titles snapshots. */
export function diffDocsTitles(oldInv, nextInv) {
  const key = (entry) => `${entry.path} ${entry.title}`;
  const oldKeys = new Set((oldInv?.titles ?? []).map(key));
  const nextKeys = new Set((nextInv?.titles ?? []).map(key));
  return {
    added: [...nextKeys].filter((entry) => !oldKeys.has(entry)),
    removed: [...oldKeys].filter((entry) => !nextKeys.has(entry))
  };
}

export function summarizeDocsAnchors(oldIndex, nextIndex) {
  const summary = summarizeAnchorChanges(oldIndex, nextIndex);
  return [
    "- src/adapters/stellar-docs-anchors.json: section anchor index changed.",
    `  - changed pages: ${summary.changedPages}`,
    `  - removed pages: ${summary.removedPages}`,
    `  - ambiguous headings: ${summary.ambiguousHeadings}`
  ];
}

function summarizeDocsInventory(path) {
  if (!changedFiles([path]).includes(path)) return [];
  const oldInv = readHeadJson(path);
  const nextInv = readJson(path);
  if (!oldInv) return [`- ${path}: new inventory file; classify manually.`];
  if (sameJson({ ...oldInv, fetchedAt: nextInv.fetchedAt }, nextInv)) {
    return [`- ${path}: unchanged ignoring fetchedAt.`];
  }
  if (path.endsWith("stellar-docs-titles.json")) {
    const oldTotal = oldInv.total ?? oldInv.titles?.length ?? "unknown";
    const nextTotal = nextInv.total ?? nextInv.titles?.length ?? "unknown";
    const { added, removed } = diffDocsTitles(oldInv, nextInv);
    return [
      `- ${path}: docs page-title vocabulary changed (${oldTotal} -> ${nextTotal}).`,
      "  - This feeds catalog keywords; treat as routing-relevant until the routing gate proves it safe.",
      `  - path/title pairs added: ${added.length}`,
      bulletList(added),
      `  - path/title pairs removed: ${removed.length}`,
      bulletList(removed)
    ];
  }
  const lines = classifyDocsBackend(oldInv, nextInv);
  return [
    `- ${path}: Mintlify backend snapshot changed.`,
    ...(lines.length > 0 ? lines : ["  - only fields outside source, contract, and pageIndex changed; classify manually."])
  ];
}

export function classifyStellarOrg(oldInv, nextInv) {
  const lines = [];
  if (!sameJson(oldInv?.source, nextInv?.source)) {
    lines.push(
      "  - backend source identity changed (origin, search path, or auth).",
      "  - Reconcile specs/stellar-org.json `backend` and src/adapters/stellar-org.ts before closing."
    );
  }
  if (!sameJson(oldInv?.contract, nextInv?.contract)) {
    lines.push(
      "  - site search or page probe contract changed.",
      "  - Run test/stellar-org-adapter.test.ts and a live smoke of stellarOrg.search_site and stellarOrg.get_page."
    );
  }
  return lines;
}

function summarizeStellarOrg(path) {
  if (!changedFiles([path]).includes(path)) return [];
  if (!existsSync(join(ROOT, path))) return [`- ${path}: removed; classify manually.`];
  const oldInv = readHeadJson(path);
  const nextInv = readJson(path);
  if (!oldInv) return [`- ${path}: new inventory file; classify manually.`];
  if (sameJson({ ...oldInv, fetchedAt: nextInv.fetchedAt }, nextInv)) {
    return [`- ${path}: unchanged ignoring fetchedAt.`];
  }
  const lines = classifyStellarOrg(oldInv, nextInv);
  return [
    `- ${path}: stellar.org site contract snapshot changed.`,
    ...(lines.length > 0 ? lines : ["  - only fields outside source and contract changed; classify manually."])
  ];
}

function runnerIntersections(touchedCatalogIds) {
  const lines = [];
  for (const [runnerId, runner] of Object.entries(RUNNERS)) {
    const hits = (runner.ops ?? []).filter((op) => touchedCatalogIds.has(op));
    if (hits.length > 0) lines.push(`- ${runnerId}: ${hits.join(", ")}`);
  }
  return lines;
}

function hashStableJson(value) {
  return createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
}

function contentHashForJsonFile(path, { omitFetchedAt = true } = {}) {
  if (!existsSync(join(ROOT, path))) return hashStableJson({ deleted: path });
  const parsed = readJson(path);
  if (omitFetchedAt && parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const { fetchedAt: _ignored, ...rest } = parsed;
    return hashStableJson(rest);
  }
  return hashStableJson(parsed);
}

const ANCHOR_PATH = "src/adapters/stellar-docs-anchors.json";
const INVENTORY_GENERATED_PATHS = ["inventory", "catalog", "specs", ANCHOR_PATH];
// Only these inventory snapshots feed catalog/manifest.json and specs/super-spec.json
// (see inventory/README.md). Anchors, stellar-docs backend, and stellar-org are drift
// evidence / adapter-only and cannot explain a catalog/specs diff.
const CATALOG_FEEDING_SOURCES = new Set(["lumenloop", "stellar-light", "stellar-docs-titles"]);

/**
 * Collect per-source inventory drift records from the current git working tree.
 *
 * Each changed inventory or anchor file produces an independent record whose
 * `contentHash`, `diffStat`, `classificationLines`, and `runnerHits` depend
 * solely on that source, so drift in one service cannot churn another service's
 * drift issue fingerprint.
 */
export function collectInventoryDrift() {
  const generatedChanged = changedFiles(INVENTORY_GENERATED_PATHS);
  if (generatedChanged.length === 0) return [];

  const sourceItems = [];
  const handled = new Set();

  if (generatedChanged.includes("inventory/lumenloop.json")) {
    handled.add("inventory/lumenloop.json");
    const touched = new Set();
    const lumenloop = summarizeLumenloop("inventory/lumenloop.json");
    for (const id of lumenloop.touchedCatalogIds) touched.add(id);
    const lumenloopOpenapi = summarizeOpenapiInventory("inventory/lumenloop.json", "lumenloop", {
      label: "inventory/lumenloop.json (OpenAPI surface)",
      skipUnchangedNote: true
    });
    for (const id of lumenloopOpenapi.touchedCatalogIds) touched.add(id);
    sourceItems.push({
      source: "lumenloop",
      files: ["inventory/lumenloop.json"],
      diffStat: diffStat(["inventory/lumenloop.json"]),
      classificationLines: [...lumenloop.lines, ...lumenloopOpenapi.lines],
      runnerHits: runnerIntersections(touched),
      contentHash: contentHashForJsonFile("inventory/lumenloop.json")
    });
  }

  if (generatedChanged.includes("inventory/stellar-light.json")) {
    handled.add("inventory/stellar-light.json");
    const scout = summarizeOpenapiInventory("inventory/stellar-light.json", "scout");
    sourceItems.push({
      source: "stellar-light",
      files: ["inventory/stellar-light.json"],
      diffStat: diffStat(["inventory/stellar-light.json"]),
      classificationLines: scout.lines,
      runnerHits: runnerIntersections(scout.touchedCatalogIds),
      contentHash: contentHashForJsonFile("inventory/stellar-light.json")
    });
  }

  if (generatedChanged.includes("inventory/stellar-docs.json")) {
    handled.add("inventory/stellar-docs.json");
    sourceItems.push({
      source: "stellar-docs",
      files: ["inventory/stellar-docs.json"],
      diffStat: diffStat(["inventory/stellar-docs.json"]),
      classificationLines: summarizeDocsInventory("inventory/stellar-docs.json"),
      runnerHits: [],
      contentHash: contentHashForJsonFile("inventory/stellar-docs.json")
    });
  }

  if (generatedChanged.includes("inventory/stellar-docs-titles.json")) {
    handled.add("inventory/stellar-docs-titles.json");
    sourceItems.push({
      source: "stellar-docs-titles",
      files: ["inventory/stellar-docs-titles.json"],
      diffStat: diffStat(["inventory/stellar-docs-titles.json"]),
      classificationLines: summarizeDocsInventory("inventory/stellar-docs-titles.json"),
      runnerHits: [],
      contentHash: contentHashForJsonFile("inventory/stellar-docs-titles.json")
    });
  }

  if (generatedChanged.includes("inventory/stellar-org.json")) {
    handled.add("inventory/stellar-org.json");
    sourceItems.push({
      source: "stellar-org",
      files: ["inventory/stellar-org.json"],
      diffStat: diffStat(["inventory/stellar-org.json"]),
      classificationLines: summarizeStellarOrg("inventory/stellar-org.json"),
      runnerHits: [],
      contentHash: contentHashForJsonFile("inventory/stellar-org.json")
    });
  }

  if (generatedChanged.includes(ANCHOR_PATH)) {
    handled.add(ANCHOR_PATH);
    const lines = existsSync(join(ROOT, ANCHOR_PATH))
      ? summarizeDocsAnchors(readHeadJson(ANCHOR_PATH), readJson(ANCHOR_PATH))
      : [`- ${ANCHOR_PATH}: removed; classify manually.`];
    sourceItems.push({
      source: "stellar-docs-anchors",
      files: [ANCHOR_PATH],
      diffStat: diffStat([ANCHOR_PATH]),
      classificationLines: lines,
      runnerHits: [],
      contentHash: contentHashForJsonFile(ANCHOR_PATH, { omitFetchedAt: false })
    });
  }

  // Catch any newly added inventory/*.json source not explicitly mapped above.
  for (const file of generatedChanged) {
    if (handled.has(file) || !file.startsWith("inventory/") || !file.endsWith(".json")) continue;
    handled.add(file);
    const source = basename(file, ".json").toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
    sourceItems.push({
      source,
      files: [file],
      diffStat: diffStat([file]),
      classificationLines: [`- ${file}: inventory snapshot changed; classify manually.`],
      runnerHits: [],
      contentHash: contentHashForJsonFile(file)
    });
  }

  // Emit a derived-only item whenever catalog/specs artifacts changed without a
  // change in any catalog-feeding inventory snapshot. Ignore documentation files
  // like inventory/README.md.
  if (!sourceItems.some((item) => CATALOG_FEEDING_SOURCES.has(item.source))) {
    const derivedFiles = generatedChanged.filter(
      (file) => !handled.has(file) && (file.startsWith("catalog/") || file.startsWith("specs/")) && file.endsWith(".json")
    );
    if (derivedFiles.length > 0) {
      const rawDiff = git(["diff", "--", ...derivedFiles]);
      sourceItems.push({
        source: "derived",
        files: derivedFiles,
        diffStat: diffStat(derivedFiles),
        classificationLines: ["- No catalog-feeding inventory files changed; inspect catalog/spec diffs and the run logs."],
        runnerHits: [],
        contentHash: createHash("sha256").update(rawDiff).digest("hex")
      });
    }
  }

  return sourceItems.sort((a, b) => (a.source < b.source ? -1 : a.source > b.source ? 1 : 0));
}

function main() {
  const anchorPath = ANCHOR_PATH;
  const generatedPaths = INVENTORY_GENERATED_PATHS;
  const generatedChanged = changedFiles(generatedPaths);
  const stat = diffStat(generatedPaths);
  const touchedCatalogIds = new Set();
  const classificationLines = [];

  const lumenloop = summarizeLumenloop("inventory/lumenloop.json");
  for (const id of lumenloop.touchedCatalogIds) touchedCatalogIds.add(id);
  classificationLines.push(...lumenloop.lines);

  // Refresh commits Lumenloop's FULL OpenAPI document, not just its tool list,
  // so an operation added/removed/renamed there — or a routing-text or
  // schema-only change — moves the inventory while the tool summary above
  // reports nothing. That left the operator with an unexplained diff and a
  // report that implied there was nothing to explain. Account/write-surface
  // changes are exactly the policy-relevant kind, even while excluded.
  //
  // Its touched ids DO count toward runner intersection. Lumenloop's OpenAPI
  // operationIds are not a separate namespace from its tool names — 18 of 33
  // match exactly, and three of those (find_content_by_entity, list_documents,
  // search_content_semantic) are declared ops of the stellar-ecosystem-digest
  // runner. Withholding them would report OpenAPI-only drift on a declared op
  // while the same issue said no runner was affected. Non-matching ids are
  // harmless: runnerIntersections filters against each runner's exact declared
  // ops, so an account/write id simply never matches.
  const lumenloopOpenapi = summarizeOpenapiInventory("inventory/lumenloop.json", "lumenloop", {
    label: "inventory/lumenloop.json (OpenAPI surface)",
    skipUnchangedNote: true
  });
  for (const id of lumenloopOpenapi.touchedCatalogIds) touchedCatalogIds.add(id);
  classificationLines.push(...lumenloopOpenapi.lines);

  const scout = summarizeOpenapiInventory("inventory/stellar-light.json", "scout");
  for (const id of scout.touchedCatalogIds) touchedCatalogIds.add(id);
  classificationLines.push(...scout.lines);

  classificationLines.push(...summarizeDocsInventory("inventory/stellar-docs.json"));
  classificationLines.push(...summarizeDocsInventory("inventory/stellar-docs-titles.json"));
  classificationLines.push(...summarizeStellarOrg("inventory/stellar-org.json"));
  if (generatedChanged.includes(anchorPath)) {
    classificationLines.push(...summarizeDocsAnchors(readHeadJson(anchorPath), readJson(anchorPath)));
  }

  const runnerHits = runnerIntersections(touchedCatalogIds);

  console.log("#### Resolution runbook");
  console.log();
  console.log(
    "Use `.agents/skills/live-drift-resolution/SKILL.md` to resolve this. The summary below is CI-derived evidence, not a verdict. Regenerate locally and classify from the actual diff before committing."
  );
  console.log();
  console.log("Minimum checks before close: drift class, ADR-0003 exposure decision if needed, routing gate when routing text/keywords changed, runner live smoke if runner ops intersect, `npm run secrets:scan -- --tree`, independent review, and production deploy when approved.");
  console.log();
  console.log("#### Generated files changed");
  console.log();
  if (stat) {
    console.log("```");
    console.log(stat);
    console.log("```");
  } else {
    console.log("_No generated file diff at the time of summary generation._");
  }
  console.log();
  if (generatedChanged.length > 0) {
    console.log(generatedChanged.map((file) => `- \`${file}\``).join("\n"));
  }
  console.log();
  console.log("#### Classification hints");
  console.log();
  if (classificationLines.length > 0) {
    console.log(classificationLines.join("\n"));
  } else {
    console.log("- No inventory files changed; inspect catalog/spec diffs and the run logs.");
  }
  console.log();
  console.log("#### Runner-affecting hints");
  console.log();
  if (runnerHits.length > 0) {
    console.log(runnerHits.join("\n"));
    console.log();
    console.log("Re-run the affected runnable skills live and verify projections before closing.");
  } else {
    console.log("- No current runner declared ops intersect the CI-detected operation/tool changes.");
  }
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) main();
