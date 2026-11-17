/**
 * Spec-sandbox tests for the code-shaped spec-search machinery that
 * mirrors @cloudflare/codemode@0.5.6's openApiMcpServer internals. Since
 * ADR-0001 (research/decisions/0001-search-tool-shape.md) this is no longer
 * a top-level tool: resolveSpecRefs feeds `execute`'s codemode.spec(), and
 * the wrapper backs the retained (unregistered) spec-search runner.
 *
 * The generated wrapper is plain JavaScript (an async arrow function source
 * string), so beyond asserting its shape we EVALUATE it directly under Node —
 * exercising the real in-sandbox behavior: lazy $ref resolution (cache,
 * cycles, external refs) and the raw returned value. Output shaping is
 * host-side (run.ts `specResponseText`); the Dynamic Worker transport and
 * that shaping run in test/smoke/executor.test.ts. The manual live scripts
 * additionally check service traffic against an existing local server.
 */
import { describe, expect, it } from "vitest";
import {
  createSpecSandboxCode,
  resolveSpecRefs,
  serializeSpecForSandbox
} from "../src/executor/spec-sandbox.ts";

const FIXTURE_SPEC = {
  openapi: "3.1.0",
  info: { title: "fixture", version: "1.0.0" },
  paths: {
    "/scout/getThing": {
      get: {
        operationId: "scout.getThing",
        parameters: [{ $ref: "#/components/parameters/q" }],
        responses: {
          200: {
            content: { "application/json": { schema: { $ref: "#/components/schemas/Thing" } } }
          }
        }
      }
    }
  },
  components: {
    parameters: { q: { name: "q", in: "query", schema: { type: "string" } } },
    schemas: {
      Thing: {
        type: "object",
        properties: {
          name: { type: "string" },
          // cycle: Thing → Thing
          parent: { $ref: "#/components/schemas/Thing" },
          // external ref: must pass through untouched
          ext: { $ref: "https://example.com/other.json#/Foo" }
        }
      }
    }
  }
};

/** Evaluate the generated wrapper the way the sandbox would run it. */
async function runWrapped(code: string, spec: unknown = FIXTURE_SPEC): Promise<unknown> {
  const source = createSpecSandboxCode(code, serializeSpecForSandbox(spec));
  // eslint-disable-next-line no-eval
  const fn = eval(`(${source})`) as () => Promise<unknown>;
  return fn();
}

describe("createSpecSandboxCode — source generation", () => {
  it("escapes </ in the spec (script-injection hygiene, upstream behavior)", () => {
    const serialized = serializeSpecForSandbox({ note: "</script>alert(1)" });
    expect(serialized).not.toContain("</");
    expect(serialized).toContain("\\u003c/script>");
    // and it still round-trips
    expect(JSON.parse(serialized)).toEqual({ note: "</script>alert(1)" });
  });

  it("executes code inside Markdown fences", async () => {
    const fenced = "```js\nasync () => 42\n```";
    expect(await runWrapped(fenced, {})).toBe(42);
  });

  it("returns the script's raw value and leaves output shaping to the host", async () => {
    const source = createSpecSandboxCode("async () => ({ a: 1 })", serializeSpecForSandbox({}));
    expect(source).not.toContain("__truncateResponse");
    expect(await runWrapped("async () => ({ a: 1 })", {})).toEqual({ a: 1 });
  });
});

describe("generated wrapper — evaluated behavior", () => {
  it("codemode.spec() resolves internal $refs inline", async () => {
    const result = await runWrapped(`async () => {
      const spec = await codemode.spec();
      return spec.paths["/scout/getThing"].get.parameters[0];
    }`);
    expect(result).toEqual({ name: "q", in: "query", schema: { type: "string" } });
  });

  it("marks circular refs with $circular and leaves external refs untouched", async () => {
    const result = await runWrapped(`async () => {
      const spec = await codemode.spec();
      const thing = spec.paths["/scout/getThing"].get.responses["200"].content["application/json"].schema;
      return { parent: thing.properties.parent, ext: thing.properties.ext };
    }`);
    expect(result).toEqual({
      parent: { $circular: "#/components/schemas/Thing" },
      ext: { $ref: "https://example.com/other.json#/Foo" }
    });
  });

  it("resolves the spec lazily, once (second spec() call returns the cached object)", async () => {
    const result = await runWrapped(`async () => {
      const a = await codemode.spec();
      const b = await codemode.spec();
      return a === b;
    }`);
    expect(result).toBe(true);
  });

  it("works against the REAL super spec: services + a known operation resolve", async () => {
    const { readFileSync } = await import("node:fs");
    const { fileURLToPath } = await import("node:url");
    const { join, dirname } = await import("node:path");
    const superSpec = JSON.parse(
      readFileSync(
        join(dirname(fileURLToPath(import.meta.url)), "..", "specs", "super-spec.json"),
        "utf8"
      )
    );
    const manifest = JSON.parse(
      readFileSync(
        join(dirname(fileURLToPath(import.meta.url)), "..", "catalog", "manifest.json"),
        "utf8"
      )
    ) as { entries: Array<{ kind: string }> };
    const parsed = (await runWrapped(
      `async () => {
        const spec = await codemode.spec();
        const services = new Set();
        for (const item of Object.values(spec.paths)) {
          for (const op of Object.values(item)) services.add(op["x-service"]);
        }
        const search = spec.paths["/scout/searchProjects"].get;
        return {
          services: [...services].sort(),
          qParam: search.parameters.find(p => p.name === "q"),
          skillCount: spec.paths["/skills/list_skills"].get["x-skill-index"].length
        };
      }`,
      superSpec
    )) as {
      services: string[];
      qParam: { name: string; in: string };
      skillCount: number;
    };
    expect(parsed.services).toEqual(["lumenloop", "scout", "skills", "stellarDocs", "stellarOrg"]);
    expect(parsed.qParam.in).toBe("query"); // $ref → resolved parameter object
    expect(parsed.skillCount).toBe(manifest.entries.filter((entry) => entry.kind === "skill").length);
  });
});

describe("resolveSpecRefs (host twin for execute's codemode.spec())", () => {
  it("produces the same resolution as the sandbox's __resolveRefs", async () => {
    const hostResolved = resolveSpecRefs(FIXTURE_SPEC) as Record<string, unknown>;
    const sandboxResolved = await runWrapped("async () => await codemode.spec()");
    expect(hostResolved).toEqual(sandboxResolved);
  });
});
