import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { CASES as executeCases } from "./live/run-live-execute.mjs";
import { CASES as specCases } from "./live/run-live-spec-search.mjs";
import { existingServerUrl, parseRpc } from "./live/client.mjs";

const manifest = JSON.parse(readFileSync(new URL("../catalog/manifest.json", import.meta.url), "utf8"));
const spec = JSON.parse(readFileSync(new URL("../specs/super-spec.json", import.meta.url), "utf8"));
const entries = new Map(manifest.entries.map((entry) => [entry.id, entry]));

describe("manual live case contracts (offline)", () => {
  it.each([...executeCases, ...specCases].filter((item) => item.code))(
    "uses current service and skill identities: $label", ({ code }) => {
      const excludedControl = "scout.submitPartnerListing";
      for (const match of code.matchAll(/\b(?:scout|lumenloop|stellarDocs)\.\w+/g)) {
        if (match[0] === excludedControl) {
          expect(entries.has(excludedControl)).toBe(false);
        } else {
          expect(entries.has(match[0]), match[0]).toBe(true);
        }
      }
      for (const match of code.matchAll(/codemode\.skill\.read\("([^"]+)"/g)) {
        expect(entries.get(match[1])?.kind, match[1]).toBe("skill");
      }
    }
  );

  it.each(specCases)("executes with the committed spec: $label", async ({ code, label }) => {
    const result = await runInNewContext(`(${code})()`, {
      codemode: { spec: async () => spec },
      lumenloop: {},
      stellarDocs: {
        search_anchor_sep_docs: async () => ({
          ok: true, data: { nbHits: 1, hits: [{ url: "https://developers.stellar.org/fixture" }] }
        })
      }
    });
    if (label.startsWith("1.")) {
      expect(Object.values(result.services).reduce((sum, service) => sum + service.callable, 0)).toBe(64);
      expect(result.hasLumenloopGlobal).toBe(true);
    } else if (label.startsWith("2.")) {
      expect(result.searchOps.lumenloop).toContain("lumenloop.search_content_semantic");
      expect(result.direct.map((hit) => hit.op)).toContain("stellarDocs.search_anchor_sep_docs");
    } else if (label.startsWith("3.")) {
      expect(result.hits.map((hit) => hit.id)).toContain("skills.stellar-dev.standards");
    } else if (label.startsWith("4.")) {
      expect(result).toBe(spec);
    } else {
      expect(result.specOps).toContain("stellarDocs.search_anchor_sep_docs");
      expect(result.nbHits).toBe(1);
    }
  });

  it("requires the existing local server origin", () => {
    expect(() => existingServerUrl([])).toThrow(/Usage/);
    expect(existingServerUrl(["--base-url", "http://localhost:8787"])).toBe("http://localhost:8787");
    for (const value of ["https://example.com", "http://user:password@localhost", "http://localhost/mcp"]) {
      expect(() => existingServerUrl(["--base-url", value])).toThrow(/existing local/);
    }
  });

  it("parses JSON and SSE tool responses", () => {
    const payload = { jsonrpc: "2.0", result: { content: [] } };
    expect(parseRpc(JSON.stringify(payload))).toEqual(payload);
    expect(parseRpc(`event: message\ndata: ${JSON.stringify(payload)}\n\n`)).toEqual(payload);
  });
});
