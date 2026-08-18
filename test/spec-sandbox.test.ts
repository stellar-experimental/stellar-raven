/**
 * Spec-sandbox tests for the code-shaped spec-search machinery that
 * mirrors @cloudflare/codemode@0.4.2's openApiMcpServer internals. Since
 * ADR-0001 (research/decisions/0001-search-tool-shape.md) this is no longer
 * a top-level tool: resolveSpecRefs feeds `execute`'s codemode.spec(), and
 * the wrapper backs the retained (unregistered) spec-search runner.
 *
 * The generated wrapper is plain JavaScript (an async arrow function source
 * string), so beyond asserting its shape we EVALUATE it directly under Node —
 * exercising the real in-sandbox behavior: lazy $ref resolution (cache,
 * cycles, external refs), and the in-sandbox truncation. The Dynamic Worker
 * transport itself is covered by test/live/run-live-spec-search.mjs.
 */
import { describe, expect, it } from "vitest";
import {
  CHARS_PER_TOKEN,
  MAX_CHARS,
  MAX_SANDBOX_TRUNCATED_CHARS,
  TRUNCATION_MARKER,
  createSpecSandboxCode,
  resolveSpecRefs,
  sandboxResponseText,
  serializeSpecForSandbox,
  truncateResponse
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
  it("inlines the serialized spec and provides codemode.spec()", () => {
    const source = createSpecSandboxCode("async () => 1", serializeSpecForSandbox(FIXTURE_SPEC));
    expect(source).toContain('const __rawSpec = {"openapi":"3.1.0"');
    expect(source).toContain("spec: async () => (__resolvedSpec ??= __resolveRefs(__rawSpec, __rawSpec))");
    expect(source).toContain("__truncateResponse(await (async () => 1)())");
  });

  it("escapes </ in the spec (script-injection hygiene, upstream behavior)", () => {
    const serialized = serializeSpecForSandbox({ note: "</script>alert(1)" });
    expect(serialized).not.toContain("</");
    expect(serialized).toContain("\\u003c/script>");
    // and it still round-trips
    expect(JSON.parse(serialized)).toEqual({ note: "</script>alert(1)" });
  });

  it("normalizes LLM code: markdown fences are stripped before wrapping", () => {
    const fenced = "```js\nasync () => 42\n```";
    const source = createSpecSandboxCode(fenced, serializeSpecForSandbox({}));
    expect(source).not.toContain("```");
    expect(source).toContain("await (async () => 42)()");
  });
});

describe("generated wrapper — evaluated behavior", () => {
  it("codemode.spec() resolves internal $refs inline", async () => {
    const result = (await runWrapped(`async () => {
      const spec = await codemode.spec();
      return spec.paths["/scout/getThing"].get.parameters[0];
    }`)) as string;
    expect(JSON.parse(result)).toEqual({ name: "q", in: "query", schema: { type: "string" } });
  });

  it("marks circular refs with $circular and leaves external refs untouched", async () => {
    const result = (await runWrapped(`async () => {
      const spec = await codemode.spec();
      const thing = spec.paths["/scout/getThing"].get.responses["200"].content["application/json"].schema;
      return { parent: thing.properties.parent, ext: thing.properties.ext };
    }`)) as string;
    expect(JSON.parse(result)).toEqual({
      parent: { $circular: "#/components/schemas/Thing" },
      ext: { $ref: "https://example.com/other.json#/Foo" }
    });
  });

  it("resolves the spec lazily, once (second spec() call returns the cached object)", async () => {
    const result = (await runWrapped(`async () => {
      const a = await codemode.spec();
      const b = await codemode.spec();
      return a === b;
    }`)) as string;
    expect(result).toBe("true");
  });

  it("truncates oversized results in-sandbox with the upstream footer", async () => {
    const result = (await runWrapped(`async () => "x".repeat(${MAX_CHARS + 4000})`)) as string;
    expect(result.length).toBeLessThanOrEqual(MAX_SANDBOX_TRUNCATED_CHARS);
    expect(result.slice(0, MAX_CHARS)).toBe("x".repeat(MAX_CHARS));
    expect(result).toContain(TRUNCATION_MARKER);
    expect(result).toContain(
      `Response was ~${Math.ceil((MAX_CHARS + 4000) / CHARS_PER_TOKEN).toLocaleString()} tokens`
    );
    // …and the host-side pass-through keeps it verbatim (already truncated).
    expect(sandboxResponseText(result)).toBe(result);
  });

  it("JSON-stringifies non-string results (2-space, upstream behavior)", async () => {
    const result = (await runWrapped(`async () => ({ a: 1 })`)) as string;
    expect(result).toBe('{\n  "a": 1\n}');
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
    const result = (await runWrapped(
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
    )) as string;
    const parsed = JSON.parse(result) as {
      services: string[];
      qParam: { name: string; in: string };
      skillCount: number;
    };
    expect(parsed.services).toEqual(["lumenloop", "scout", "skills", "stellarDocs"]);
    expect(parsed.qParam.in).toBe("query"); // $ref → resolved parameter object
    expect(parsed.skillCount).toBe(manifest.entries.filter((entry) => entry.kind === "skill").length);
  });
});

describe("host-side truncation helpers (upstream mirror)", () => {
  it("truncateResponse passes short content through and truncates long content", () => {
    expect(truncateResponse("short")).toBe("short");
    const long = truncateResponse("y".repeat(MAX_CHARS + 100));
    expect(long).toContain(TRUNCATION_MARKER);
    expect(long.startsWith("y".repeat(MAX_CHARS))).toBe(true);
  });

  it("sandboxResponseText re-truncates non-footered oversized strings", () => {
    const raw = "z".repeat(MAX_CHARS + 100);
    const out = sandboxResponseText(raw);
    expect(out).not.toBe(raw);
    expect(out).toContain(TRUNCATION_MARKER);
  });
});

describe("resolveSpecRefs (host twin for execute's codemode.spec())", () => {
  it("produces the same resolution as the sandbox's __resolveRefs", async () => {
    const hostResolved = resolveSpecRefs(FIXTURE_SPEC) as Record<string, unknown>;
    const sandboxResolved = JSON.parse(
      (await runWrapped("async () => await codemode.spec()")) as string
    );
    expect(hostResolved).toEqual(sandboxResolved);
  });
});
