/**
 * Unit tests for tool registration — no running worker needed.
 *
 * Wires the registered McpServer to an in-memory MCP client (from the
 * @modelcontextprotocol/server and /client v2 packages) and asserts the two
 * tools exist with the expected schemas and stub behavior.
 *
 * Under ADR-0001 (research/decisions/0001-search-tool-shape.md), the shipped
 * `search` is the host-side ranked query
 * ({query, kind?, service?, limit?}); the code-shaped {code} search is no
 * longer a top-level tool — that discovery path lives inside `execute`'s
 * sandbox (codemode.spec()/search/catalog, covered by spec-sandbox.test.ts
 * and executor-providers.test.ts).
 */
import { describe, expect, it, beforeAll, vi } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/server";
import { Client } from "@modelcontextprotocol/client";
import { InMemoryTransport } from "@modelcontextprotocol/server";
import { registerTools, SEARCH_KINDS, type RegisterToolsOptions } from "../src/mcp/tools";
import { allowDevUnauthenticated } from "../src/auth/gate";
import type { McpAccessContext } from "../src/server";
import type { ExecuteEvidenceSummary, ExecuteOperationSummary } from "../src/executor/run";
import {
  DOC_CODEMODE_HELPERS,
  DOC_TRACE_EXAMPLE,
  docsPage,
  getDocCatalogCounts,
  landingPage,
  sitemapXml,
  termsPage
} from "../src/site";
import { assertNoNonExposedRefs } from "../scripts/build-catalog.mjs";
import {
  CLAUDE_CODE_TOOL_DESCRIPTION_CAP_CHARS,
  EXPECTED_TOOL_METADATA
} from "./helpers/mcp-tool-metadata";

const oauthAccess: McpAccessContext = { mode: "oauth" };
const apiKeyAccess: McpAccessContext = { mode: "api-key", apiKeyName: "admin" };
const devBypassAccess: McpAccessContext = { mode: "dev-bypass" };

function executeSummaries(
  operationSummary: ExecuteOperationSummary = { total: 0, ok: 0, error: 0, softEmpty: 0 }
): { operationSummary: ExecuteOperationSummary; evidenceSummary: ExecuteEvidenceSummary } {
  return {
    operationSummary,
    evidenceSummary: {
      kind:
        operationSummary.ok > 0
          ? "service-data"
          : operationSummary.total > 0
            ? "service-inconclusive"
            : "none",
      skillRead: false,
      buildAuthoritySkillIds: [],
      buildAuthorityRoles: [],
      skillRuns: 0,
      artifactReads: 0
    }
  };
}

// @ts-expect-error API-key access requires a key name.
const apiKeyWithoutName: McpAccessContext = { mode: "api-key" };
// @ts-expect-error OAuth access excludes API-key data.
const oauthWithApiKeyName: McpAccessContext = { mode: "oauth", apiKeyName: "admin" };
// @ts-expect-error Dev-bypass access excludes legacy bypass flags.
const devBypassWithFlag: McpAccessContext = { mode: "dev-bypass", devBypassFired: true };

vi.mock("cloudflare:workers", () => ({
  tracing: {
    async trace<T>(_name: string, fn: () => T | Promise<T>): Promise<T> {
      return await fn();
    }
  },
  WorkerEntrypoint: class WorkerEntrypoint {}
}));
vi.mock("@cloudflare/workers-oauth-provider", () => ({
  default: class OAuthProvider {
    fetch(request: Request): Response {
      const url = new URL(request.url);
      if (url.pathname === "/mcp" && request.method === "OPTIONS") {
        return new Response(null, { status: 204 });
      }
      if (url.pathname === "/mcp") {
        return new Response(null, { status: 401 });
      }
      return new Response(null, { status: 404 });
    }
  }
}));
vi.mock("agents/mcp", () => ({
  createMcpHandler: vi.fn(() => () => new Response(null, { status: 404 })),
  getMcpAuthContext: vi.fn(() => undefined)
}));
vi.mock("@cloudflare/codemode", () => ({
  DynamicWorkerExecutor: class DynamicWorkerExecutor {}
}));
vi.mock("../src/executor/run", () => ({
  createExecuteRunner: vi.fn()
}));
vi.mock("../src/demo/chat", () => ({
  handleDemoChat: vi.fn()
}));

type JsonSchema = {
  type?: string;
  properties?: Record<string, JsonSchema & { enum?: string[] }>;
  required?: string[];
};

let client: Client;

async function connectedClient(options: RegisterToolsOptions = {}): Promise<Client> {
  const server = new McpServer({ name: "test", version: "0.0.0" });
  registerTools(server, options);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const c = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([server.connect(serverTransport), c.connect(clientTransport)]);
  return c;
}

beforeAll(async () => {
  client = await connectedClient();
});

describe("tool registration", () => {
  it("registers exactly the search and execute tools", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual(["execute", "search"]);
  });

  it("search is ranked discovery plus exact-ID recovery metadata", async () => {
    const { tools } = await client.listTools();
    const search = tools.find((t) => t.name === "search");
    expect(search).toBeDefined();
    const schema = search!.inputSchema as JsonSchema;
    expect(schema.type).toBe("object");
    expect(Object.keys(schema.properties ?? {}).sort()).toEqual([
      "kind",
      "limit",
      "query",
      "reason",
      "recoverFrom",
      "service"
    ]);
    expect(schema.required).toEqual(["query"]);
    expect(schema.properties?.query?.type).toBe("string");
    expect(schema.properties?.kind?.enum).toEqual([...SEARCH_KINDS]);
    expect(schema.properties?.service?.type).toBe("string");
    expect(schema.properties?.limit?.type).toBe("integer");
    // The temporary A/B-candidate framing is gone (ADR-0001: this IS the tool).
    expect(search!.description).not.toMatch(/TEMPORARY|A\/B candidate/);
    // …and the description points at execute's in-sandbox discovery affordances.
    expect(search!.description).toContain("codemode.search");
    expect(search!.description).toContain("codemode.catalog({ kind?, service?, compact? })");
    expect(search!.description).toContain("codemode.spec()");
  });

  it("execute has the expected input schema", async () => {
    const { tools } = await client.listTools();
    const execute = tools.find((t) => t.name === "execute");
    expect(execute).toBeDefined();
    const schema = execute!.inputSchema as JsonSchema;
    expect(schema.type).toBe("object");
    expect(Object.keys(schema.properties ?? {}).sort()).toEqual(["code"]);
    expect(schema.required).toEqual(["code"]);
    expect(schema.properties?.code?.type).toBe("string");
    // execute mirrors upstream REQUEST_TYPES: spec + calls in one sandbox.
    expect(execute!.description).toContain("codemode.spec()");
  });

  it("exposes titles, annotations, and a text-only execute declaration", async () => {
    const { tools } = await client.listTools();
    const search = tools.find((tool) => tool.name === "search");
    const execute = tools.find((tool) => tool.name === "execute");

    expect(search).toMatchObject(EXPECTED_TOOL_METADATA.search);
    expect(execute).toMatchObject(EXPECTED_TOOL_METADATA.execute);
    expect(search?.annotations).not.toHaveProperty("idempotentHint");
    expect(execute?.annotations).not.toHaveProperty("idempotentHint");
    expect(execute).not.toHaveProperty("outputSchema");

    const descriptionPrefix =
      execute?.description?.slice(0, CLAUDE_CODE_TOOL_DESCRIPTION_CAP_CHARS) ?? "";
    expect(descriptionPrefix).toContain("one text result");
    expect(descriptionPrefix).toContain("roughly 6k tokens");
    expect(descriptionPrefix).toContain("payloads live under `.data`");
    expect(descriptionPrefix).toContain("no direct network access");
    expect(descriptionPrefix).toContain("`fetch()` fails");
  });
});

describe("artifact owner resolution", () => {
  it("OAuth mode passes its subject through unchanged", async () => {
    const { resolveArtifactOwner } = await import("../src/server");
    expect(resolveArtifactOwner("peppered-subject", oauthAccess)).toBe("peppered-subject");
  });

  it("dev loopback bypass gets the fixed local owner only when the gate fired", async () => {
    const { resolveArtifactOwner } = await import("../src/server");
    const gateFired = allowDevUnauthenticated(
      { DEV_ALLOW_UNAUTHENTICATED: "true" } as Env,
      "localhost"
    );
    expect(gateFired).toBe(true);
    expect(resolveArtifactOwner(undefined, devBypassAccess)).toBe("dev-local");
  });

  it("API-key bypass gets no owner even when OAuth props contain a subject", async () => {
    const { resolveArtifactOwner } = await import("../src/server");
    expect(resolveArtifactOwner("stale-oauth-subject", apiKeyAccess)).toBeUndefined();
  });

  it("prod-hostname requests get no dev owner even if the dev env var exists", async () => {
    const { resolveArtifactOwner } = await import("../src/server");
    const gateFired = allowDevUnauthenticated(
      { DEV_ALLOW_UNAUTHENTICATED: "true" } as Env,
      "stellar-raven.example"
    );
    expect(gateFired).toBe(false);
    expect(resolveArtifactOwner(undefined, oauthAccess)).toBeUndefined();
  });
});

describe("public page metadata", () => {
  it("preserves landing JSON-LD and the canonical URL", () => {
    const page = landingPage();

    expect(page).toContain('<link rel="canonical" href="https://raven.stellar.org/"/>');
    expect(page).toContain('<meta property="og:url" content="https://raven.stellar.org/"/>');
    expect(page).toContain('<script type="application/ld+json">');
  });

  it("preserves the terms canonical URL without noindex", () => {
    const page = termsPage();

    expect(page).toContain('<link rel="canonical" href="https://raven.stellar.org/terms"/>');
    expect(page).toContain('<meta property="og:url" content="https://raven.stellar.org/terms"/>');
    expect(page).not.toContain('<meta name="robots" content="noindex"/>');
  });

  it("preserves the docs canonical URL without noindex", () => {
    const page = docsPage();

    expect(page).toContain('<link rel="canonical" href="https://raven.stellar.org/docs"/>');
    expect(page).toContain('<meta property="og:url" content="https://raven.stellar.org/docs"/>');
    expect(page).not.toContain('<meta name="robots" content="noindex"/>');
  });

  it("lists /docs in the sitemap next to /terms", () => {
    const sitemap = sitemapXml();

    expect(sitemap).toContain("<loc>https://raven.stellar.org/docs</loc>");
    expect(sitemap).toContain("<loc>https://raven.stellar.org/terms</loc>");
  });
});

/**
 * Runs the rendered /docs text through the SAME ADR-0003 guard the catalog
 * build runs, by handing it to assertNoNonExposedRefs as one more entry.
 *
 * assertNoNonExposedRefsInText alone is not enough: it is allowlist-free by
 * design, so it catches excluded lumenloop names, raw scout paths, and retired
 * skill ids, but knows nothing about which service.op tokens the manifest
 * actually exposes — a leaked "scout.submitFeedback" walks straight past it.
 * assertNoNonExposedRefs owns that manifest comparison, so the page borrows the
 * manifest's operation ids as its allowlist and this test defines no second
 * exposure list of its own.
 */
function assertDocsExposureClean(pageText: string): void {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const manifest = JSON.parse(
    readFileSync(join(root, "catalog", "manifest.json"), "utf8")
  ) as { entries: { id: string; kind: string }[] };
  // Ids only: the manifest's own text is already guarded at build time and in
  // catalog.test.ts, so re-scanning it here would only slow the page check.
  const exposedOpIds = manifest.entries
    .filter((entry) => entry.kind === "operation")
    .map((entry) => ({ id: entry.id, kind: "operation" }));

  assertNoNonExposedRefs([
    ...exposedOpIds,
    { id: "GET /docs page", kind: "page", description: pageText }
  ]);
}

describe("docs page truthfulness", () => {
  it("describes the search contract: operations and whole skills, not sections", () => {
    const page = docsPage();

    expect(page).toContain("exposed operations and whole skills");
    expect(page).toContain("availableSections");
    expect(page).toMatch(/skill sections are not searchable/);
    expect(page).toContain("codemode.artifact.read");
  });

  it("keeps the search-to-execute trace example in sync with the current scorer", async () => {
    const { getCatalog } = await import("../src/catalog/load");
    const { searchCatalogPage } = await import("../src/catalog/search");
    const page = searchCatalogPage(getCatalog(), {
      query: DOC_TRACE_EXAMPLE.query,
      limit: DOC_TRACE_EXAMPLE.limit
    });

    expect(page.hits.map((hit) => hit.id)).toEqual(DOC_TRACE_EXAMPLE.hitIds);
    for (const opId of DOC_TRACE_EXAMPLE.executeOperationIds) {
      expect(DOC_TRACE_EXAMPLE.hitIds).toContain(opId);
      expect(docsPage()).toContain(opId);
    }
  });

  it("renders an execute block that composes the shortlisted operations", () => {
    const html = docsPage();
    const pres = [...html.matchAll(/<pre class="code" tabindex="0">([\s\S]*?)<\/pre>/g)].map(
      (match) => match[1]!
    );
    expect(pres.length).toBe(2);
    const script = pres[1]!.replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
    const called = [...script.matchAll(/([A-Za-z][\w]*)\.(\w+)\(/g)].map(
      ([, service, op]) => `${service}.${op}`
    );
    expect(called.length).toBeGreaterThan(0);
    for (const id of called) {
      expect(DOC_TRACE_EXAMPLE.executeOperationIds).toContain(id);
      expect(DOC_TRACE_EXAMPLE.hitIds).toContain(id);
    }
    for (const id of DOC_TRACE_EXAMPLE.executeOperationIds) {
      expect(called).toContain(id);
    }

    const secondId = DOC_TRACE_EXAMPLE.executeOperationIds[1]!;
    const secondCallStart = script.indexOf(`${secondId}(`);
    expect(secondCallStart).toBeGreaterThan(-1);
    const secondCallEnd = script.indexOf(");", secondCallStart);
    expect(secondCallEnd).toBeGreaterThan(secondCallStart);
    const secondCallArgs = script.slice(
      secondCallStart + secondId.length + 1,
      secondCallEnd
    );
    expect(secondCallArgs).toMatch(/\$\{top\.name\}/);

    const emptyGuardIndex = script.indexOf("projects.length === 0");
    const topReadIndex = script.indexOf("top.name");
    expect(emptyGuardIndex).toBeGreaterThan(-1);
    expect(topReadIndex).toBeGreaterThan(emptyGuardIndex);
  });

  /**
   * The trace's operation ids are bound to the scorer by the tests above. Its
   * ARGUMENT and FIELD names are bound here, against the same manifest schemas
   * the sandbox validates calls with. Without this, an upstream rename of `q`,
   * of `projects`, or of a row's `name` would leave the page showing a script
   * that no longer runs, and every other docs test would still pass.
   */
  it("binds the trace's argument and field names to the manifest schemas", () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), "..");
    const manifest = JSON.parse(
      readFileSync(join(root, "catalog", "manifest.json"), "utf8")
    ) as {
      entries: {
        id: string;
        kind: string;
        inputSchema?: { properties?: Record<string, unknown> };
        outputSchema?: {
          properties?: Record<
            string,
            { type?: string; items?: { properties?: Record<string, unknown> } }
          >;
        };
      }[];
    };
    const entryFor = (id: string) => {
      const entry = manifest.entries.find((candidate) => candidate.id === id);
      expect(entry, `manifest has no entry for ${id}`).toBeDefined();
      return entry!;
    };

    const html = docsPage();
    const pres = [...html.matchAll(/<pre class="code" tabindex="0">([\s\S]*?)<\/pre>/g)].map(
      (match) => match[1]!
    );
    const script = pres[1]!.replace(/<[^>]+>/g, "").replace(/\s+/g, " ");

    // Every argument key the script passes must exist on that operation's input schema.
    for (const id of DOC_TRACE_EXAMPLE.executeOperationIds) {
      const literal = script.match(new RegExp(`${id.replace(".", "\\.")}\\(\\{([^}]*)\\}`));
      expect(literal, `no argument object rendered for ${id}`).not.toBeNull();
      const keys = [...literal![1]!.matchAll(/(\w+)\s*:/g)].map(([, key]) => key!);
      expect(keys.length, `${id} is called with no arguments`).toBeGreaterThan(0);
      const inputProperties = Object.keys(entryFor(id).inputSchema?.properties ?? {});
      for (const key of keys) {
        expect(inputProperties, `${id} has no input field "${key}"`).toContain(key);
      }
    }

    // The payload field the script reads under .data, and the row field it
    // reads off the first element, must both exist on the output schema.
    const rowRead = script.match(/const (\w+) = \w+\.data\.(\w+)\[0\]/);
    expect(rowRead, "the trace no longer reads a row out of the payload").not.toBeNull();
    const [, rowVar, payloadField] = rowRead!;
    const firstOp = entryFor(DOC_TRACE_EXAMPLE.executeOperationIds[0]!);
    const payload = firstOp.outputSchema?.properties?.[payloadField!];
    expect(payload, `output schema has no field "${payloadField}"`).toBeDefined();
    expect(payload!.type).toBe("array");

    const rowFields = [...script.matchAll(new RegExp(`${rowVar}\\.(\\w+)`, "g"))].map(
      ([, field]) => field!
    );
    expect(rowFields.length).toBeGreaterThan(0);
    const itemProperties = Object.keys(payload!.items?.properties ?? {});
    for (const field of rowFields) {
      expect(itemProperties, `a ${payloadField} row has no field "${field}"`).toContain(field);
    }
  });

  it("renders the search block limit from DOC_TRACE_EXAMPLE.limit", () => {
    const html = docsPage();
    const pres = [...html.matchAll(/<pre class="code" tabindex="0">([\s\S]*?)<\/pre>/g)].map(
      (match) => match[1]!
    );
    expect(pres.length).toBe(2);
    const searchBlock = pres[0]!.replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
    expect(searchBlock).toContain(`limit: ${DOC_TRACE_EXAMPLE.limit}`);
  });

  it("matches getDocCatalogCounts() to catalog/manifest.json by kind", () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), "..");
    const manifest = JSON.parse(
      readFileSync(join(root, "catalog", "manifest.json"), "utf8")
    ) as { entries: { kind: string }[] };
    const counts = { operations: 0, skills: 0, sections: 0 };
    for (const entry of manifest.entries) {
      if (entry.kind === "operation") counts.operations++;
      else if (entry.kind === "skill") counts.skills++;
      else if (entry.kind === "skill-section") counts.sections++;
    }
    expect(getDocCatalogCounts()).toEqual(counts);
  });

  it("binds the landing-page counts to the verified catalog constants", () => {
    const page = landingPage();
    const counts = getDocCatalogCounts();
    const total = counts.operations + counts.skills + counts.sections;

    expect(page).toContain(`<b>${counts.operations}</b> live operations`);
    expect(page).toContain(`<b>${total}</b> catalog entries`);
    expect(page).toContain(`<b>${counts.skills}</b> playbooks`);
    expect(page).not.toContain("<b>54</b> live operations");
    expect(page).not.toContain("<b>283</b> catalog entries");
  });

  it("binds the docs-page counts to the verified catalog constants", () => {
    const page = docsPage();
    const counts = getDocCatalogCounts();

    expect(page).toContain(`<b>${counts.operations} operations</b>`);
    expect(page).toContain(`<b>${counts.skills} skills</b>`);
    expect(page).toContain(`<b>${counts.sections} sections</b>`);
  });

  it("names every codemode helper the sandbox exposes", async () => {
    const { getCatalog } = await import("../src/catalog/load");
    const { buildCodemodeProvider } = await import("../src/executor/providers");
    const skillSource = (() => {
      throw new Error("skill source is not called when enumerating helper names");
    }) as unknown as Parameters<typeof buildCodemodeProvider>[1];

    // The flat dispatch names are the sandbox's real helper surface; the
    // prelude re-exposes skill_read/skill_run/artifact_info/artifact_read as
    // the nested codemode.skill.* / codemode.artifact.* namespaces.
    const exposed = Object.keys(buildCodemodeProvider(getCatalog(), skillSource).fns)
      .map((flat) => `codemode.${flat.replace("_", ".")}`)
      .sort();

    expect([...DOC_CODEMODE_HELPERS].sort()).toEqual(exposed);
    expect(DOC_CODEMODE_HELPERS).toHaveLength(8);

    const page = docsPage();
    expect(page).toContain("eight allowed codemode helpers");
    for (const helper of DOC_CODEMODE_HELPERS) {
      expect(page).toContain(`<code>${helper}</code>`);
    }

    // All eight hang off ONE provider. The page copy that states this is
    // asserted by "splits service adapters from the one codemode host provider".
    expect(buildCodemodeProvider(getCatalog(), skillSource).name).toBe("codemode");
  });

  it("emits no non-exposed operation or retired-skill reference", () => {
    expect(() => assertDocsExposureClean(docsPage())).not.toThrow();
  });

  // Real Stellar Light operationIds held off the exposed manifest by
  // scripts/exposure.mjs. None carries an excluded lumenloop name, a raw scout
  // path, or a retired-skill id, so the allowlist-free text guard cannot see
  // them — only the manifest comparison can. These pin that half.
  it.each(["scout.submitFeedback", "scout.partnerAssistant", "scout.partnerOnboard"])(
    "rejects a /docs reference to non-exposed %s",
    (opId) => {
      const leaked = docsPage().replace("</main>", `<p><code>${opId}</code></p></main>`);
      expect(leaked).toContain(opId);

      expect(() => assertDocsExposureClean(leaked)).toThrow(/ADR-0003 leak/);
    }
  );

  it("qualifies artifact reads and scopes credential claims", () => {
    const page = docsPage();

    expect(page).toMatch(/When a\s+truncated response reports an available artifact/);
    expect(page).toMatch(/inspect\s+the operation's signature before using/);
    expect(page).toMatch(/project\s+the\s+result\s+in\s+JavaScript/);
    expect(page).toMatch(/smaller\s+calls/);
    expect(page).toMatch(/signed-in MCP clients/);
    expect(page).toMatch(/2 MiB/);
    expect(page).toContain("upstream service credentials");
  });

  it("splits service adapters from the one codemode host provider", () => {
    const page = docsPage();
    expect(page).toMatch(
      /Service\s+operations\s+run\s+through\s+host-side\s+adapters\s+that\s+hold\s+the\s+upstream\s+credentials/
    );
    // buildCodemodeProvider returns a single provider named "codemode"; the
    // eight helpers are its fns.
    expect(page).toMatch(/functions on one host provider/);
    expect(page).not.toMatch(/codemode helpers[^.]*host-side adapters/s);
  });

  it("scopes the .data envelope rule to service calls", () => {
    const page = docsPage();

    // `codemode.search`, `codemode.describe`, and `codemode.skill.read` resolve
    // at the TOP level, not under `.data` (src/executor/providers.ts even plants
    // a throwing `.data` trap on a successful skill.read). An unscoped "every
    // call" claim sends readers to a field those results do not have.
    expect(page).not.toMatch(/Every call resolves to/);
    expect(page.match(/Every service call resolves to/g)?.length).toBe(2);

    // Each helper name and the result field it returns are asserted as ONE
    // pattern, never as two independent substring checks. Independent checks
    // pass whenever both strings appear anywhere on the page, so they keep
    // passing when a name is documented against the wrong field — which is the
    // only failure these assertions exist to catch.
    const mappings: ReadonlyArray<readonly [string, RegExp]> = [
      // providers.ts search branch: top-level hits/total/truncated
      ["codemode.search → r.hits", /<code>codemode\.search<\/code>\s+gives\s+<code>r\.hits<\/code>/],
      // providers.ts describeCatalogEntry: top-level signature/inputSchema/usage
      [
        "codemode.describe → r.signature + r.inputSchema",
        /<code>codemode\.describe<\/code>\s+gives\s+entry\s+fields\s+such\s+as\s+<code>r\.signature<\/code>\s+and\s+<code>r\.inputSchema<\/code>/
      ],
      // skills/store.ts whole read: top-level content
      [
        "whole codemode.skill.read → r.content",
        /<code>codemode\.skill\.read\(id\)<\/code>\s+gives\s+<code>r\.content<\/code>/
      ],
      // skills/store.ts sectional read: top-level sections
      [
        "sectional codemode.skill.read → r.sections",
        /<code>codemode\.skill\.read\(id, \{ sections \}\)<\/code>\s+gives\s+<code>r\.sections<\/code>/
      ],
      // skill.run and both artifact reads keep the service-call envelope
      [
        "skill.run + artifact.info + artifact.read → r.data envelope",
        /<code>codemode\.skill\.run<\/code>,\s+<code>codemode\.artifact\.info<\/code>,\s+and\s+<code>codemode\.artifact\.read<\/code>\s+use\s+that\s+same\s+envelope/
      ]
    ];
    for (const [label, pattern] of mappings) {
      expect(page, label).toMatch(pattern);
    }

    // Service calls keep the `.data` envelope.
    expect(page).toMatch(/<code>r\.data\.projects<\/code>/);
  });

  it("names the Discord support channel and keeps vulnerability reports private", () => {
    const page = docsPage();
    // Directory review requires a named user support channel distinct from the
    // private security-report path (SECURITY.md).
    expect(page).toContain("https://discord.gg/stellardev");
    expect(page).toMatch(/Do not post a\s+vulnerability in Discord/);
    expect(page).toContain("mailto:frontier@stellar.org");
  });

  it("renders footer legal text at WCAG AA contrast", () => {
    const page = docsPage();
    const match = page.match(/\.foot \.l\{[^}]*color:(#[0-9a-fA-F]{6})/);
    expect(match).not.toBeNull();
    const ratio = contrastRatio(match![1]!, "#0e150d");
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("makes horizontally scrollable trace blocks keyboard focusable", () => {
    const page = docsPage();
    expect(page.match(/<pre class="code" tabindex="0">/g)?.length).toBe(2);
    expect(page).not.toMatch(/<pre class="code">/);
  });
});

function contrastRatio(foreground: string, background: string): number {
  function luminance(hex: string): number {
    const channels = [1, 3, 5].map((offset) => {
      const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return value <= 0.03928
        ? value / 12.92
        : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
  }
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function workerContext(props?: Record<string, unknown>): ExecutionContext {
  return {
    waitUntil() {},
    passThroughOnException() {},
    props
  } as unknown as ExecutionContext;
}

function serverEnv(overrides: Record<string, unknown> = {}): Env {
  const tokens = {
    admin: "a".repeat(43),
    devrel: "d".repeat(43)
  };
  const store = new Map(
    Object.entries(tokens).map(([name, token]) => [
      `raven:api-key:v1:${name}`,
      createHash("sha256").update(token).digest("hex")
    ])
  );
  return {
    MCP_SERVER_SECRET: "unit-test-server-secret",
    OAUTH_KV: {
      async get(key: string) {
        return store.get(key) ?? null;
      }
    },
    ...overrides
  } as unknown as Env;
}

function mcpRequestEvents(spy: { mock: { calls: unknown[][] } }): Record<string, unknown>[] {
  return spy.mock.calls
    .map((call: unknown[]) => call[0])
    .filter((line: unknown): line is string => typeof line === "string")
    .map((line: string) => JSON.parse(line) as Record<string, unknown>)
    .filter((event: Record<string, unknown>) => event.evt === "mcp_request");
}

describe("MCP request event contract", () => {
  it("emits one OAuth event from authenticated props and treats old grants as client-unknown", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const { mcpHandler } = await import("../src/server");
    const subject = "a".repeat(64);
    const response = await mcpHandler.fetch(
      new Request("https://mcp.test/mcp", { headers: { "cf-ray": "abc123-ATL" } }),
      serverEnv(),
      workerContext({ subject, scopes: ["mcp"] })
    );

    expect(response.status).toBe(404);
    const events = mcpRequestEvents(spy);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      accessMode: "oauth",
      subjectHash: expect.stringMatching(/^[a-f0-9]{16}$/),
      clientHash: null,
      rayId: "abc123",
      method: "GET",
      status: 404,
      requestId: expect.any(String)
    });
    expect(JSON.stringify(events[0])).not.toContain(subject);
    spy.mockRestore();
  });

  it("emits exactly one attributed event for named API keys and dev-bypass requests", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const { default: worker } = await import("../src/server");

    await worker.fetch(
      new Request("https://mcp.test/mcp", {
        headers: { authorization: `Bearer admin:${"a".repeat(43)}` }
      }),
      serverEnv(),
      workerContext()
    );
    expect(mcpRequestEvents(spy)).toHaveLength(1);
    expect(mcpRequestEvents(spy)[0]).toMatchObject({
      accessMode: "api-key",
      apiKeyName: "admin",
      subjectHash: null,
      clientHash: null
    });
    expect(JSON.stringify(mcpRequestEvents(spy)[0])).not.toContain("a".repeat(43));

    spy.mockClear();
    await worker.fetch(
      new Request("https://mcp.test/mcp", {
        headers: { authorization: `Bearer devrel:${"d".repeat(43)}` }
      }),
      serverEnv(),
      workerContext()
    );
    expect(mcpRequestEvents(spy)).toHaveLength(1);
    expect(mcpRequestEvents(spy)[0]).toMatchObject({
      accessMode: "api-key",
      apiKeyName: "devrel"
    });

    spy.mockClear();
    await worker.fetch(
      new Request("http://localhost/mcp"),
      serverEnv({ DEV_ALLOW_UNAUTHENTICATED: "true" }),
      workerContext()
    );
    expect(mcpRequestEvents(spy)).toHaveLength(1);
    expect(mcpRequestEvents(spy)[0]).toMatchObject({
      accessMode: "dev-bypass",
      subjectHash: null,
      clientHash: null
    });
    spy.mockRestore();
  });

  it("falls through to OAuth for rejected and legacy credentials without logging attempted names", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const { default: worker } = await import("../src/server");

    const rejected = await worker.fetch(
      new Request("https://mcp.test/mcp", {
        headers: { authorization: `Bearer guessed:${"x".repeat(43)}`, "cf-ray": "reject123-IAD" }
      }),
      serverEnv(),
      workerContext()
    );
    expect(rejected.status).toBe(401);
    const [event] = mcpRequestEvents(spy);
    expect(event).toEqual({
      evt: "mcp_request",
      accessMode: "oauth-rejected",
      method: "GET",
      status: 401,
      rayId: "reject123"
    });
    expect(event).not.toHaveProperty("subjectHash");
    expect(event).not.toHaveProperty("clientHash");
    expect(JSON.stringify(event)).not.toContain("guessed");
    expect(JSON.stringify(event)).not.toContain("x".repeat(43));

    spy.mockClear();
    for (const headers of [
      new Headers({ authorization: `Bearer ${"a".repeat(43)}` }),
      new Headers({ "x-mcp-admin-token": "a".repeat(43) })
    ]) {
      const legacy = await worker.fetch(
        new Request("https://mcp.test/mcp", { headers }),
        serverEnv(),
        workerContext()
      );
      expect(legacy.status).toBe(401);
    }
    expect(mcpRequestEvents(spy)).toHaveLength(2);

    spy.mockClear();
    const preflight = await worker.fetch(
      new Request("https://mcp.test/mcp", { method: "OPTIONS" }),
      serverEnv(),
      workerContext()
    );
    expect(preflight.status).toBe(204);
    expect(mcpRequestEvents(spy)).toEqual([]);
    spy.mockRestore();
  });
});

describe("search behavior (host-side ranked)", () => {
  it("returns real ranked hits + a nextSteps hint", async () => {
    const result = await client.callTool({
      name: "search",
      arguments: { query: "search directory" }
    });
    expect(result.isError).toBeFalsy();
    const structured = result.structuredContent as {
      hits: Array<{ id: string; score: number; signature?: string }>;
      nextSteps: string;
    };
    expect(structured.hits.length).toBeGreaterThan(0);
    expect(structured.hits[0]?.id).toBe("lumenloop.search_directory");
    expect(structured.hits[0]?.signature).toContain("SearchDirectoryInput");
    expect(structured.nextSteps).toMatch(/execute/i);
    expect(structured.nextSteps).toContain("filter raw row JSON");
    expect(structured.nextSteps).toContain("at most two `scout.searchRepos`/`scout.searchProjects`");
    expect(structured.nextSteps).toContain("three returned candidates");
    expect(structured.nextSteps).toMatch(/single-step how-to or debugging/i);
  });

  it("returns bounded exact-ID recovery separately from ranked hits", async () => {
    const baseline = await client.callTool({
      name: "search",
      arguments: { query: "builder directory", limit: 5 }
    });
    const recovered = await client.callTool({
      name: "search",
      arguments: {
        query: "builder directory",
        limit: 5,
        recoverFrom: ["scout.getBuilders"],
        reason: "empty"
      }
    });
    const before = baseline.structuredContent as { hits: Array<{ id: string }> };
    const after = recovered.structuredContent as {
      hits: Array<{ id: string }>;
      recovery: Array<{ from: string; id: string }>;
    };
    expect(after.hits).toEqual(before.hits);
    expect(after.recovery.map((candidate) => candidate.id)).toEqual([
      "lumenloop.search_content_semantic",
      "scout.searchResearch"
    ]);
    expect(after.recovery.every((candidate) => candidate.from === "scout.getBuilders")).toBe(true);
  });

  it("projects structural wider candidates separately from ranked hits", async () => {
    const result = await client.callTool({
      name: "search",
      arguments: { query: "justin rice history", kind: "operation", limit: 10 }
    });
    expect(result.isError).toBeFalsy();
    const structured = result.structuredContent as {
      hits: Array<{ id: string; tier: string }>;
      widerCandidates: Array<{ id: string; lane: string; basis: string }>;
      nextSteps: string;
    };
    expect(structured.hits[0]).toMatchObject({ id: "scout.getPeople", tier: "gated" });
    expect(structured.widerCandidates).toEqual([]);
  });

  it("keeps hit-aware guidance on all-backfill pages with wider candidates", async () => {
    const result = await client.callTool({
      name: "search",
      arguments: {
        query: "Tomer Weller",
        kind: "operation",
        service: "lumenloop",
        limit: 5
      }
    });
    expect(result.isError).toBeFalsy();
    const structured = result.structuredContent as {
      hits: Array<{ tier: string }>;
      widerCandidates: unknown[];
      nextSteps: string;
    };
    expect(structured.hits.length).toBeGreaterThan(0);
    expect(structured.hits.every((hit) => hit.tier === "backfill")).toBe(true);
    expect(structured.widerCandidates.length).toBeGreaterThan(0);
    expect(structured.nextSteps).toContain("prefer the leading hit");
  });

  it("does not infer recovery from ranking or a reason without explicit attempted ids", async () => {
    const baseline = await client.callTool({
      name: "search",
      arguments: { query: "builder directory", limit: 5 }
    });
    const reasonOnly = await client.callTool({
      name: "search",
      arguments: { query: "builder directory", limit: 5, reason: "empty" }
    });
    const before = baseline.structuredContent as { hits: Array<{ id: string }>; recovery: unknown[] };
    const after = reasonOnly.structuredContent as { hits: Array<{ id: string }>; recovery: unknown[] };
    expect(before.recovery).toEqual([]);
    expect(after.hits).toEqual(before.hits);
    expect(after.recovery).toEqual([]);
  });

  it("rejects unknown recoverFrom ids without fuzzy resolution", async () => {
    const result = await client.callTool({
      name: "search",
      arguments: { query: "builder directory", recoverFrom: ["scout.getBuilder"] }
    });
    expect(result.isError).toBe(true);
    const structured = result.structuredContent as {
      hits: unknown[];
      recovery: unknown[];
      widerCandidates: unknown[];
      nextSteps: string;
    };
    expect(structured.hits).toEqual([]);
    expect(structured.recovery).toEqual([]);
    expect(structured.widerCandidates).toEqual([]);
    expect(structured.nextSteps).toContain("scout.getBuilder");
    expect(structured.nextSteps).toContain("exact-match");
  });

  it("skill hits cross the tool boundary with availableSections", async () => {
    const result = await client.callTool({
      name: "search",
      arguments: { query: "skills.lumenloop.stellar-project-dossier", kind: "skill" }
    });
    expect(result.isError).toBeFalsy();
    const structured = result.structuredContent as {
      hits: Array<{ id: string; kind: string; availableSections?: string[] }>;
    };
    const hit = structured.hits.find((h) => h.id === "skills.lumenloop.stellar-project-dossier");
    expect(hit).toBeDefined();
    expect(hit!.kind).toBe("skill");
    expect(hit!.availableSections!.length).toBeGreaterThan(0);
    // The hint teaches sectioned reads, not whole-skill reads.
    const { nextSteps } = result.structuredContent as { nextSteps: string };
    expect(nextSteps).toContain("availableSections");
    expect(nextSteps).toContain("codemode.skill.read");
  });

  it("returns an empty-hits result with guidance for a no-match query", async () => {
    // Truly zero-overlap tokens: since the M1 tiered backfill, any single
    // matched token (even a prefix overlap like "nonexistent" ~ "no") fills
    // an otherwise-empty page instead of returning [].
    const result = await client.callTool({
      name: "search",
      arguments: { query: "zzzzqqqq zzqqzzqq" }
    });
    expect(result.isError).toBeFalsy();
    const structured = result.structuredContent as {
      hits: unknown[];
      widerCandidates: unknown[];
      nextSteps: string;
    };
    expect(structured.hits).toEqual([]);
    expect(structured.widerCandidates.length).toBeGreaterThan(0);
    expect(structured.nextSteps).toMatch(/no hits/i);
    expect(structured.nextSteps).toContain(
      "No gated operation matched either; run one bounded broad pass over the advisory widerCandidates before retrying, and still do not conclude absence."
    );
    expect(structured.nextSteps).not.toContain("prefer the leading hit");
  });

  it("keeps a valid service-scoped zero-hit search successful", async () => {
    // Truly zero-overlap tokens: since the M1 tiered backfill, any single
    // matched token (even a prefix overlap like "nonexistent" ~ "no") fills
    // an otherwise-empty page instead of returning [].
    const result = await client.callTool({
      name: "search",
      arguments: { query: "zzzzqqqq zzqqzzqq", service: "stellarDocs" }
    });
    expect(result.isError).toBeFalsy();
    const structured = result.structuredContent as {
      hits: unknown[];
      widerCandidates: unknown[];
      nextSteps: string;
    };
    expect(structured.hits).toEqual([]);
    expect(structured.widerCandidates.length).toBeGreaterThan(0);
    expect(structured.nextSteps).toMatch(/no hits/i);
    expect(structured.nextSteps).toContain(
      "No gated operation matched either; run one bounded broad pass over the advisory widerCandidates before retrying, and still do not conclude absence."
    );
    expect(structured.nextSteps).not.toContain("prefer the leading hit");
  });

  it("rejects an invalid kind value", async () => {
    const result = await client.callTool({
      name: "search",
      arguments: { query: "test", kind: "nonsense" }
    });
    // SDK surfaces input validation failures as isError results.
    expect(result.isError).toBe(true);
  });

  it("carries tier on every hit plus total/truncated pagination facts", async () => {
    const result = await client.callTool({
      name: "search",
      arguments: { query: "stellar soroban contract", limit: 5 }
    });
    expect(result.isError).toBeFalsy();
    const structured = result.structuredContent as {
      hits: Array<{ tier: string }>;
      total: number;
      truncated: boolean;
      nextSteps: string;
    };
    expect(structured.hits).toHaveLength(5);
    expect(structured.hits.every((h) => h.tier === "gated" || h.tier === "backfill")).toBe(true);
    expect(structured.total).toBeGreaterThan(structured.hits.length);
    expect(structured.truncated).toBe(true);
    // The truncation-retry hint rides along on truncated pages.
    expect(structured.nextSteps).toContain("More entries matched than shown");
  });

  it("logs privacy-bounded search page facts and honest invalid-filter semantics", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      await client.callTool({
        name: "search",
        arguments: {
          query: "Tomer Weller",
          kind: "operation",
          service: "lumenloop",
          limit: 5,
          recoverFrom: ["scout.getBuilders"],
          reason: "empty"
        }
      });
      await client.callTool({
        name: "search",
        arguments: { query: "docs search", service: "stellardocs", limit: 3 }
      });
      const events = logSpy.mock.calls
        .map((call) => {
          try {
            return JSON.parse(String(call[0])) as Record<string, unknown>;
          } catch {
            return null;
          }
        })
        .filter((event): event is Record<string, unknown> => event?.evt === "search");
      const valid = events.find((event) => event.requestedLimit === 5 && event.effectiveLimit === 5);
      const invalid = events.find((event) => event.requestedLimit === 3 && event.effectiveLimit === null);

      expect(valid).toMatchObject({
        source: "tool",
        queryChars: 12,
        requestedLimit: 5,
        effectiveLimit: 5,
        truncated: true,
        recovery: 2,
        recoveryTop: ["lumenloop.search_content_semantic", "scout.searchResearch"],
        widerCandidates: 2,
        widerCandidateTop: ["lumenloop.find_av_passages", "lumenloop.search_content_semantic"]
      });
      expect(valid).not.toHaveProperty("query");
      expect(valid).not.toHaveProperty("queryPreview");
      expect(valid).not.toHaveProperty("queryHash");
      expect(Number(valid?.gatedHits) + Number(valid?.backfillHits)).toBe(valid?.hits);
      expect(invalid).toMatchObject({
        requestedLimit: 3,
        effectiveLimit: null,
        omittedCount: 0,
        gatedHits: 0,
        backfillHits: 0,
        hits: 0,
        total: 0,
        truncated: false
      });
      expect(invalid).not.toHaveProperty("query");
      expect(JSON.stringify(events)).not.toContain("Tomer Weller");
      expect(JSON.stringify(events)).not.toContain("docs search");
    } finally {
      logSpy.mockRestore();
    }
  });

  it("a VALID service filter flows through validation to service-scoped hits", async () => {
    const result = await client.callTool({
      name: "search",
      arguments: { query: "docs search", service: "stellarDocs", limit: 20 }
    });
    expect(result.isError).toBeFalsy();
    const structured = result.structuredContent as {
      hits: Array<{ service: string }>;
      total: number;
      truncated: boolean;
      nextSteps: string;
    };
    expect(structured.hits.length).toBeGreaterThan(0);
    expect(structured.hits.every((h) => h.service === "stellarDocs")).toBe(true);
    // limit 20 covers every stellarDocs entry: an un-truncated page must NOT
    // carry the truncation-retry hint.
    expect(structured.truncated).toBe(false);
    expect(structured.nextSteps).not.toContain("More entries matched than shown");
  });

  it("an unknown service filter returns zero hits with the valid names, not a silent empty page", async () => {
    const result = await client.callTool({
      name: "search",
      arguments: { query: "docs search", service: "stellardocs" }
    });
    expect(result.isError).toBe(true);
    const structured = result.structuredContent as {
      hits: unknown[];
      total: number;
      truncated: boolean;
      nextSteps: string;
    };
    expect(structured.hits).toEqual([]);
    expect(structured.total).toBe(0);
    expect(structured.truncated).toBe(false);
    expect(structured.nextSteps).toContain('"stellardocs"');
    expect(structured.nextSteps).toContain("stellarDocs");
    expect(structured.nextSteps).toContain("lumenloop");
    expect(structured.nextSteps).toContain("scout");
  });
});

describe("execute behavior", () => {
  it("without an injected runner returns unavailable as data (isError), never a throw", async () => {
    const result = await client.callTool({
      name: "execute",
      arguments: { code: "async () => 1" }
    });
    expect(result.isError).toBe(true);
    const content = result.content as Array<{ type: string; text?: string }>;
    expect(content).toHaveLength(1);
    expect(content[0]?.type).toBe("text");
    expect(content[0]?.text).toMatch(/sandbox runner is not wired/i);
    expect(result).not.toHaveProperty("structuredContent");
  });

  it("delegates to the injected runner and renders result + logs", async () => {
    let seenCode: string | undefined;
    let seenOwner: string | undefined;
    const execClient = await connectedClient({
      executeContext: () => ({ artifactOwner: "owner-a", requestId: "req-a", rayId: "ray-a" }),
      runExecute: async (code, context) => {
        seenCode = code;
        seenOwner = context?.artifactOwner;
        return {
          ok: true,
          result: JSON.stringify({ echoed: code.length }),
          truncated: false,
          logs: ["hello from sandbox"],
          ...executeSummaries()
        };
      }
    });
    const result = await execClient.callTool({
      name: "execute",
      arguments: { code: "async () => 1" }
    });
    expect(result.isError).toBeFalsy();
    expect(seenCode).toBe("async () => 1");
    expect(seenOwner).toBe("owner-a");
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content).toHaveLength(1);
    expect(content[0]?.type).toBe("text");
    expect(result).not.toHaveProperty("structuredContent");
    const text = content[0]?.text ?? "";
    expect(text).toContain('{"echoed":13}');
    expect(text).toContain("--- console (1 lines) ---");
    expect(text).toContain("hello from sandbox");
  });

  it("preserves error, soft-empty, mixed, data, and no-call evidence outcomes in the footer", async () => {
    for (const [summary, expectedHeader] of [
      [{ total: 2, ok: 0, error: 2, softEmpty: 0 }, "--- SERVICE ERRORS ---"],
      [{ total: 2, ok: 0, error: 0, softEmpty: 2 }, "--- EVIDENCE RECOVERY ---"],
      [{ total: 2, ok: 0, error: 1, softEmpty: 1 }, "--- INCONCLUSIVE SERVICE OUTCOMES ---"],
      [{ total: 2, ok: 1, error: 1, softEmpty: 0 }, ""],
      [{ total: 0, ok: 0, error: 0, softEmpty: 0 }, ""]
    ] as const) {
      const execClient = await connectedClient({
        runExecute: async () => ({
          ok: true,
          result: '{"answer":"scoped"}',
          truncated: false,
          logs: [],
          ...executeSummaries(summary)
        })
      });
      const result = await execClient.callTool({
        name: "execute",
        arguments: { code: "async () => 1" }
      });
      const text = (result.content as Array<{ text: string }>)[0]?.text ?? "";
      for (const header of [
        "--- SERVICE ERRORS ---",
        "--- EVIDENCE RECOVERY ---",
        "--- INCONCLUSIVE SERVICE OUTCOMES ---"
      ]) {
        expect(text.includes(header)).toBe(header === expectedHeader);
      }
      if (expectedHeader) expect(text).toContain("open-world negative");
    }
  });

  it("adds recovery for structurally empty successful service calls", async () => {
    const execClient = await connectedClient({
      runExecute: async () => ({
        ok: true,
        result: '{"projects":[],"meta":{"total":0}}',
        truncated: false,
        logs: [],
        operationSummary: { total: 1, ok: 1, error: 0, softEmpty: 0 },
        evidenceSummary: {
          kind: "service-inconclusive",
          skillRead: false,
          skillRuns: 0,
          artifactReads: 0
        },
        recoveryHint: {
          mode: "narrow-only",
          sourceOperations: ["scout.getBuilders"],
          candidates: [
            {
              id: "scout.searchResearch",
              relation: "broader-research",
              reasons: ["empty"]
            }
          ]
        }
      })
    });
    const result = await execClient.callTool({ name: "execute", arguments: { code: "async () => 1" } });
    const text = (result.content as Array<{ text: string }>)[0]?.text ?? "";
    expect(text).toContain("--- EVIDENCE RECOVERY ---");
    expect(text).toContain("structurally empty collections");
    expect(text).toContain("{ ok: true, data } envelopes remain unchanged");
    expect(text).toContain("--- EVIDENCE CHECKPOINT ---");
    expect(text).toContain("scout.searchResearch (broader-research");
  });

  it("does not promise exact guidance for an unprofiled empty success", async () => {
    const execClient = await connectedClient({
      runExecute: async () => ({
        ok: true,
        result: '{"changes":[]}',
        truncated: false,
        logs: [],
        operationSummary: { total: 1, ok: 1, error: 0, softEmpty: 0 },
        evidenceSummary: {
          kind: "service-inconclusive",
          skillRead: false,
          skillRuns: 0,
          artifactReads: 0
        }
      })
    });
    const result = await execClient.callTool({ name: "execute", arguments: { code: "async () => 1" } });
    const text = (result.content as Array<{ text: string }>)[0]?.text ?? "";
    expect(text).toContain("Make one broad pass before making an open-world negative.");
    expect(text).not.toContain("Use the exact recovery guidance below.");
  });

  it("adds a provenance reminder for candidate-evidence operations without forcing recovery", async () => {
    const execClient = await connectedClient({
      runExecute: async () => ({
        ok: true,
        result: '{"rows":[{"title":"nearby"}]}',
        truncated: false,
        logs: [],
        ...executeSummaries({ total: 2, ok: 2, error: 0, softEmpty: 0, candidateEvidence: 1 })
      })
    });
    const result = await execClient.callTool({
      name: "execute",
      arguments: { code: "async () => 1" }
    });
    const text = (result.content as Array<{ text: string }>)[0]?.text ?? "";
    expect(text).toContain("--- CANDIDATE EVIDENCE ---");
    expect(text).toContain("exact identity or canonical slug plus source and date");
    expect(text).toContain("date current or mutable claims by observation time");
    expect(text).toContain("These rows are candidates, not identity or absence proof");
    expect(text).toContain("closed-world directory answer");
    expect(text).not.toContain("--- EVIDENCE RECOVERY ---");
  });

  it("adds conditional exact-id recovery advice after successful narrow-only lookups", async () => {
    const execClient = await connectedClient({
      runExecute: async () => ({
        ok: true,
        result: '{"matchedBuilders":[],"matchedContent":[]}',
        truncated: false,
        logs: [],
        ...executeSummaries({ total: 2, ok: 2, error: 0, softEmpty: 0 }),
        recoveryHint: {
          mode: "narrow-only",
          sourceOperations: ["scout.getBuilders", "lumenloop.find_content_by_entity"],
          candidates: [
            {
              id: "lumenloop.search_content_semantic",
              relation: "broader-semantic",
              reasons: ["empty", "weak", "adjacent", "ambiguous"]
            }
          ]
        }
      })
    });
    const result = await execClient.callTool({ name: "execute", arguments: { code: "async () => 1" } });
    const text = (result.content as Array<{ text: string }>)[0]?.text ?? "";
    expect(text).toContain("--- EVIDENCE CHECKPOINT ---");
    expect(text).toContain("successful narrow, operation-scoped lookup");
    expect(text).toContain("closed-world question about the named source");
    expect(text).toContain("lumenloop.search_content_semantic (broader-semantic");
    expect(text).not.toContain("--- EVIDENCE RECOVERY ---");
  });

  it("renders docs-only broad alternatives through the standalone checkpoint", async () => {
    const execClient = await connectedClient({
      runExecute: async () => ({
        ok: true,
        result: '{"hits":[{"url":"https://developers.stellar.org/docs/example"}]}',
        truncated: false,
        logs: [],
        ...executeSummaries({ total: 1, ok: 1, error: 0, softEmpty: 0 }),
        recoveryHint: {
          mode: "conditional-alternatives",
          sourceOperations: ["stellarDocs.search_docs"],
          candidates: [
            {
              id: "lumenloop.search_content_semantic",
              relation: "cross-family",
              reasons: ["weak", "adjacent", "ambiguous"]
            }
          ]
        }
      })
    });
    const result = await execClient.callTool({
      name: "execute",
      arguments: { code: "async () => 1" }
    });
    const text = (result.content as Array<{ text: string }>)[0]?.text ?? "";
    expect(text).not.toContain("--- CANDIDATE EVIDENCE ---");
    expect(text).toContain("--- EVIDENCE CHECKPOINT ---");
    expect(text).toContain("successful broad operation class(es) (stellarDocs.search_docs)");
    expect(text).toContain("did not inspect or judge the returned rows");
    expect(text).toContain("at most one bounded alternative pass");
  });

  it("adds bounded reuse caveats after Scout prior-art operations", async () => {
    const execClient = await connectedClient({
      runExecute: async () => ({
        ok: true,
        result: '{"repos":[{"name":"example"}]}',
        truncated: false,
        logs: [],
        operationSummary: {
          total: 2,
          ok: 2,
          error: 0,
          softEmpty: 0,
          priorArtCandidates: 1
        },
        evidenceSummary: {
          kind: "skill-content",
          skillRead: true,
          buildAuthoritySkillIds: ["skills.stellar-dev.smart-contracts"],
          buildAuthorityRoles: ["contract"],
          skillRuns: 0,
          artifactReads: 0
        }
      })
    });
    const result = await execClient.callTool({
      name: "execute",
      arguments: { code: "async () => 1" }
    });
    const text = (result.content as Array<{ text: string }>)[0]?.text ?? "";
    expect(text).toContain("--- PRIOR-ART CANDIDATES ---");
    expect(text).toContain("no more than three directly relevant candidates");
    expect(text).toContain("exact URL, role/applicability, freshness/provenance, and limitations");
    expect(text).toMatch(/License, audit, deployment, compatibility.*remain unknown/i);
    expect(text).toContain("rank, stars, funding, directory status, and public source do not");
    expect(text).not.toContain("--- EVIDENCE RECOVERY ---");
  });

  it("does not apply build-stage caps to ordinary Scout project discovery", async () => {
    const execClient = await connectedClient({
      runExecute: async () => ({
        ok: true,
        result: '{"projects":[{"name":"example"}]}',
        truncated: false,
        logs: [],
        operationSummary: {
          total: 1,
          ok: 1,
          error: 0,
          softEmpty: 0,
          candidateEvidence: 1,
          priorArtCandidates: 1
        },
        evidenceSummary: {
          kind: "service-data",
          skillRead: false,
          skillRuns: 0,
          artifactReads: 0
        }
      })
    });
    const result = await execClient.callTool({
      name: "execute",
      arguments: { code: "async () => 1" }
    });
    const text = (result.content as Array<{ text: string }>)[0]?.text ?? "";
    expect(text).toContain("--- CANDIDATE EVIDENCE ---");
    expect(text).not.toContain("--- PRIOR-ART CANDIDATES ---");
  });

  it.each([
    ["skills.stellar-dev.dapp", "dapp"],
    ["skills.stellar-dev.dapp", "sdk-integration"],
    ["skills.stellar-dev.standards", "protocol"],
    ["skills.stellar-dev.data", "infrastructure"]
  ] as const)("recognizes the exact %s build-authority role %s", async (skillId, role) => {
    const execClient = await connectedClient({
      runExecute: async () => ({
        ok: true,
        result: '{"repos":[{"name":"example"}]}',
        truncated: false,
        logs: [],
        operationSummary: { total: 1, ok: 1, error: 0, softEmpty: 0, priorArtCandidates: 1 },
        evidenceSummary: {
          kind: "skill-content",
          skillRead: true,
          buildAuthoritySkillIds: [skillId],
          buildAuthorityRoles: [role],
          skillRuns: 0,
          artifactReads: 0
        }
      })
    });
    const result = await execClient.callTool({ name: "execute", arguments: { code: "async () => 1" } });
    expect((result.content as Array<{ text: string }>)[0]?.text).toContain("--- PRIOR-ART CANDIDATES ---");
  });

  it("does not treat a landscape skill as build authority", async () => {
    const execClient = await connectedClient({
      runExecute: async () => ({
        ok: true,
        result: '{"repos":[{"name":"example"}]}',
        truncated: false,
        logs: [],
        operationSummary: { total: 1, ok: 1, error: 0, softEmpty: 0, priorArtCandidates: 1 },
        evidenceSummary: {
          kind: "skill-content",
          skillRead: true,
          buildAuthoritySkillIds: [],
          buildAuthorityRoles: [],
          skillRuns: 0,
          artifactReads: 0
        }
      })
    });
    const result = await execClient.callTool({ name: "execute", arguments: { code: "async () => 1" } });
    expect((result.content as Array<{ text: string }>)[0]?.text).not.toContain("--- PRIOR-ART CANDIDATES ---");
  });

  it("threads fresh execute context per call so a cached runner cannot capture one owner", async () => {
    const seenOwners: Array<string | undefined> = [];
    let owner = "owner-a";
    const execClient = await connectedClient({
      executeContext: () => ({ artifactOwner: owner }),
      runExecute: async (_code, context) => {
        seenOwners.push(context?.artifactOwner);
        return {
          ok: true,
          result: JSON.stringify({ owner: context?.artifactOwner ?? null }),
          truncated: false,
          logs: [],
          ...executeSummaries()
        };
      }
    });

    await execClient.callTool({ name: "execute", arguments: { code: "async () => 1" } });
    owner = "owner-b";
    await execClient.callTool({ name: "execute", arguments: { code: "async () => 2" } });

    expect(seenOwners).toEqual(["owner-a", "owner-b"]);
  });

  it("budgets the logs block so console output cannot bypass the result cap", async () => {
    // shapeLogs' structural caps still admit ~200k chars of logs; the tool
    // boundary must clip the joined block to the same configured-token budget
    // the result gets, with the logs-specific footer.
    const execClient = await connectedClient({
      runExecute: async () => ({
        ok: true,
        result: '{"fine":true}',
        truncated: false,
        logs: Array.from({ length: 100 }, () => "x".repeat(2_000)),
        ...executeSummaries()
      })
    });
    const result = await execClient.callTool({
      name: "execute",
      arguments: { code: "async () => 1" }
    });
    expect(result.isError).toBeFalsy();
    const text = (result.content as Array<{ text: string }>)[0]?.text ?? "";
    expect(text).toContain('{"fine":true}');
    expect(text).toContain("--- console (100 lines) ---");
    expect(text.length).toBeLessThan(30_000); // result + clipped logs, not ~200k
    expect(text).toContain("log counts and previews");
  });

  it("uses one configured model-boundary cap for result metadata and logs", async () => {
    const execClient = await connectedClient({
      modelBoundaryMaxTokens: 1000,
      runExecute: async () => {
        const result = `${"r".repeat(4_000)}\n--- SOURCE BASIS ---\nshape: object; 100000 chars; ~25000 tokens`;
        return {
          ok: true,
          result,
          truncated: true,
          resultOriginalChars: 100_000,
          resultReturnedChars: result.length,
          resultMaxTokens: 1000,
          resultMaxChars: 4_000,
          resultApproxOriginalTokens: 25_000,
          logs: Array.from({ length: 100 }, () => "x".repeat(2_000)),
          ...executeSummaries()
        };
      }
    });
    const result = await execClient.callTool({
      name: "execute",
      arguments: { code: "async () => 1" }
    });
    expect(result.isError).toBeFalsy();
    const text = (result.content as Array<{ text: string }>)[0]?.text ?? "";
    expect(text).toContain("--- SOURCE BASIS ---");
    expect(text).not.toContain("--- TRUNCATED --- Result was");
    expect(text).toContain("console output was");
    expect(text).toContain("limit: 1000");
    expect(text.length).toBeLessThan(11_000);
  });

  it("caps structured sourceBasis calls and excludes execute content from telemetry", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const execClient = await connectedClient({
        runExecute: async () => ({
          ok: true,
          result: "ok",
          truncated: true,
          logs: [],
          ...executeSummaries({ total: 30, ok: 10, error: 10, softEmpty: 10 }),
          sourceBasis: {
            shape: { kind: "array", serializedChars: 100_000, approxTokens: 25_000, totalItems: 30 },
            calls: Array.from({ length: 30 }, (_, i) => {
              const outcomes = ["ok", "error", "soft-empty"] as const;
              return {
                op: `service.op_${i}`,
                outcome: outcomes[i % outcomes.length]!,
                ms: i
              };
            }),
            canonicalUrls: ["https://sensitive.example/private-result"],
            artifact: { state: "absent", reason: "unavailable" }
          }
        })
      });
      await execClient.callTool({ name: "execute", arguments: { code: "async () => []" } });
      const executeEvent = logSpy.mock.calls
        .map((call) => {
          try {
            return JSON.parse(String(call[0])) as {
              evt?: string;
              sourceBasis?: { calls?: { first?: unknown[]; total?: number; omitted?: number; totals?: unknown } };
            };
          } catch {
            return null;
          }
        })
        .find((event) => event?.evt === "execute");

      expect(executeEvent?.sourceBasis?.calls?.first).toHaveLength(12);
      expect(executeEvent?.sourceBasis?.calls?.total).toBe(30);
      expect(executeEvent?.sourceBasis?.calls?.omitted).toBe(18);
      expect(executeEvent?.sourceBasis?.calls?.totals).toEqual({
        ok: 10,
        error: 10,
        "soft-empty": 10
      });
      expect(executeEvent?.sourceBasis).toMatchObject({ canonicalUrlCount: 1 });
      expect(executeEvent).not.toHaveProperty("code");
      expect(executeEvent).not.toHaveProperty("resultPreview");
      expect(executeEvent).not.toHaveProperty("error");
      expect(JSON.stringify(executeEvent)).not.toContain("sensitive.example");
    } finally {
      logSpy.mockRestore();
    }
  });

  it("budgets error text so a thrown payload cannot bypass the result cap", async () => {
    // Error text is model-authored (`throw new Error(bigPayload)`) — without
    // its own budget it would be the third smuggling channel after result
    // and logs.
    const execClient = await connectedClient({
      runExecute: async () => ({
        ok: false,
        error: "x".repeat(100_000),
        logs: [],
        ...executeSummaries()
      })
    });
    const result = await execClient.callTool({
      name: "execute",
      arguments: { code: "async () => { throw new Error('big') }" }
    });
    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ text: string }>)[0]?.text ?? "";
    expect(text.length).toBeLessThan(30_000); // not ~100k
    expect(text).toContain("--- TRUNCATED ---");
  });

  it("uses the configured model-boundary cap for error text", async () => {
    const execClient = await connectedClient({
      modelBoundaryMaxTokens: 1000,
      runExecute: async () => ({
        ok: false,
        error: "x".repeat(100_000),
        logs: [],
        ...executeSummaries()
      })
    });
    const result = await execClient.callTool({
      name: "execute",
      arguments: { code: "async () => { throw new Error('big') }" }
    });
    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ text: string }>)[0]?.text ?? "";
    expect(text).toContain("--- TRUNCATED ---");
    expect(text).toContain("limit: 1000");
    expect(text.length).toBeLessThan(7_000);
  });

  it("renders runner errors as isError data with logs", async () => {
    const execClient = await connectedClient({
      runExecute: async () => ({
        ok: false,
        error: "fetch is not allowed",
        logs: ["[error] boom"],
        ...executeSummaries()
      })
    });
    const result = await execClient.callTool({
      name: "execute",
      arguments: { code: "async () => fetch('https://x')" }
    });
    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ text: string }>)[0]?.text ?? "";
    expect(text).toContain("Execution failed: fetch is not allowed");
    expect(text).toContain("[error] boom");
  });
});
