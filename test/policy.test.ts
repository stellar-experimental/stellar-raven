/**
 * Policy tests — arg validation, secret redaction, and model-boundary
 * truncation. Everything host-side, pure Node. There is no runtime deny/
 * metered layer to test: exposure is filtered at build time (ADR-0003), so
 * the excluded ops simply do not exist in the manifest.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, type Catalog, type CatalogEntry } from "../src/catalog/search.ts";
import { guard } from "../src/policy/guard.ts";
import { validateArgs } from "../src/policy/validate.ts";
import { redactSecrets, secretsFromEnv } from "../src/policy/redact.ts";
import {
  DEFAULT_MAX_TOKENS,
  MODEL_BOUNDARY_MAX_TOKENS_ENV,
  modelBoundaryMaxTokensFromEnv,
  modelBoundaryMaxTokensFromValue,
  truncateForModel,
  truncateLogsForModel
} from "../src/policy/truncate.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog: Catalog = loadManifest(
  JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8"))
);

function entry(id: string): CatalogEntry {
  const e = catalog.entries.find((x) => x.id === id);
  if (!e) throw new Error(`missing catalog entry ${id}`);
  return e;
}

describe("guard — arg validation (exposure is build-time, ADR-0003)", () => {
  it("the excluded write/paid ops do not exist in the manifest at all", () => {
    for (const id of [
      "lumenloop.request_research",
      "scout.submitFeedback",
      "scout.submitPartnerListing",
      "scout.partnerAssistant"
    ]) {
      expect(catalog.entries.some((e) => e.id === id), id).toBe(false);
    }
  });

  it("rejects invalid args before any call, with actionable issues", () => {
    const r = guard(entry("lumenloop.search_directory"), { limit: 3 }); // missing query
    if (!r || r.ok) throw new Error("expected validation refusal");
    expect(r.error.kind).toBe("error");
    expect(r.error.message).toContain("no call was made");
    expect(JSON.stringify(r.error.details)).toContain("query");
  });

  it("passes valid args (returns null = proceed)", () => {
    expect(guard(entry("lumenloop.search_directory"), { query: "soroswap" })).toBeNull();
    expect(guard(entry("scout.getStatus"), undefined)).toBeNull();
  });

  it("rejects an unknown Lumenloop document sort before upstream traffic", () => {
    const r = guard(entry("lumenloop.list_documents"), {
      collection: "jobs",
      sort: "definitely_not_a_real_sort_key"
    });
    if (!r || r.ok) throw new Error("expected validation refusal");
    expect(r.error.message).toContain("no call was made");
    expect(JSON.stringify(r.error.details)).toContain("sort");
    expect(JSON.stringify(r.error.details)).toContain("must be one of");
  });
});

describe("validateArgs — the manifest schema dialect", () => {
  const schema = entry("lumenloop.search_directory").inputSchema;

  it("accepts conforming args", () => {
    expect(validateArgs(schema, { query: "x", limit: 5 })).toEqual([]);
  });

  it("rejects wrong types, out-of-range numbers, unknown keys", () => {
    const issues = validateArgs(schema, { query: 42, limit: 500, bogus: true });
    const text = JSON.stringify(issues);
    expect(text).toContain("expected string");
    expect(text).toContain("<= 100");
    expect(text).toContain("unknown argument");
  });

  it("rejects enum violations (stellarDocs category)", () => {
    const issues = validateArgs(entry("stellarDocs.search_docs_in_category").inputSchema, {
      query: "fees",
      category: "blog"
    });
    expect(JSON.stringify(issues)).toContain("must be one of");
  });

  it("accepts every documented Lumenloop document sort field", () => {
    const schema = entry("lumenloop.list_documents").inputSchema;
    for (const sort of [
      "processed_at",
      "publishing_date",
      "created_at",
      "domain",
      "source",
      "start_at",
      "updated_at",
      "last_seen_at",
      "published_at"
    ]) {
      expect(validateArgs(schema, { collection: "jobs", sort })).toEqual([]);
    }
  });

  it("accepts current Scout project filters and rejects unknown enum values", () => {
    const schema = entry("scout.searchProjects").inputSchema;
    expect(validateArgs(schema, { type: "Wallet", status: "Live" })).toEqual([]);
    const issues = validateArgs(schema, { type: "Bank", status: "Retired" });
    expect(issues).toHaveLength(2);
    expect(JSON.stringify(issues)).toContain("must be one of");
  });

  it("rejects non-object args outright", () => {
    expect(validateArgs(schema, "query")).toHaveLength(1);
  });

  it("validates every allowed operation's own example-free happy path shape", () => {
    // sanity: no operation schema crashes the validator
    for (const e of catalog.entries) {
      if (e.kind !== "operation") continue;
      expect(() => validateArgs(e.inputSchema, {})).not.toThrow();
    }
  });
});

describe("redaction", () => {
  const secrets = secretsFromEnv({ LUMENLOOP_API_KEY: "llmcp_secret_value_123", ALGOLIA_API_KEY_DOCS: "short" });

  // The case below ("collects every current host secret env name") hardcodes
  // the same five literals as SECRET_ENV_NAMES, so it is a MIRROR of the
  // source, not a set-wise check: add a sixth secret binding and it — and every
  // other test — still passes while that value flows to the sandbox unredacted
  // in any upstream error body that echoes it. This case supplies the missing
  // independent side: the real secret-name set the Worker is configured with.
  it("redacts every secret-shaped binding the Worker actually has, not just a hardcoded five", () => {
    const devVarsPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".dev.vars");
    let devVars: string;
    try {
      devVars = readFileSync(devVarsPath, "utf8");
    } catch {
      // Gitignored and generated (AGENTS.md); CI writes a stub before vitest.
      // Skip rather than fail on a fresh clone — same posture as the gitleaks lane.
      return;
    }

    // Bindings that are deliberately NOT secrets: public identifiers that
    // appear in legitimate results, and a local-dev flag. Redacting these would
    // scrub real content (see the SECRET_ENV_NAMES doc comment).
    const NOT_SECRETS = new Set([
      "WORKOS_CLIENT_ID",
      "DEV_ALLOW_UNAUTHENTICATED",
      "ALGOLIA_APPLICATION_ID_DOCS",
      "ALGOLIA_APPLICATION_ID_SITE",
      "DEMO_AI_GATEWAY_ID",
      "EXECUTE_MODEL_BOUNDARY_MAX_TOKENS",
      // Operator credential for calling the deployed server; never read from
      // env by the Worker itself, so there is nothing to redact host-side.
      "MCP_ADMIN_TOKEN"
    ]);

    const configured = devVars
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split("=")[0]!.trim())
      .filter((name) => name && !NOT_SECRETS.has(name));
    expect(configured.length, "no secret-shaped bindings parsed from .dev.vars").toBeGreaterThan(0);

    // Every one of them must be collected by the redactor. A value long enough
    // to clear the min-length filter, unique per name so a miss is identifiable.
    const env = Object.fromEntries(configured.map((name) => [name, `${name}_value_abcdefgh`]));
    const collected = secretsFromEnv(env);
    const missed = configured.filter((name) => !collected.includes(`${name}_value_abcdefgh`));
    expect(
      missed,
      `these configured bindings are NOT in SECRET_ENV_NAMES (src/policy/redact.ts) and would reach ` +
        `the sandbox unredacted — add them there, or to NOT_SECRETS here if they are public identifiers`
    ).toEqual([]);
  });

  it("collects only plausible secrets (min length)", () => {
    expect(secrets).toEqual(["llmcp_secret_value_123"]);
  });

  it("collects every current host secret env name", () => {
    const collected = secretsFromEnv({
      LUMENLOOP_API_KEY: "lumen_key_abcdefgh",
      ALGOLIA_API_KEY_DOCS: "algolia_key_abcdefgh",
      ALGOLIA_API_KEY_SITE: "algolia_site_key_abcdefgh",
      MCP_SERVER_SECRET: "server_secret_abcdefgh",
      WORKOS_API_KEY: "workos_key_abcdefgh"
    });
    expect(collected).toEqual([
      "lumen_key_abcdefgh",
      "algolia_key_abcdefgh",
      "algolia_site_key_abcdefgh",
      "server_secret_abcdefgh",
      "workos_key_abcdefgh"
    ]);
  });

  it("scrubs accidental key echoes anywhere in a structure", () => {
    const dirty = {
      note: "sent Authorization: Bearer llmcp_secret_value_123 upstream",
      nested: ["ok", { echo: "llmcp_secret_value_123" }]
    };
    const clean = redactSecrets(dirty, secrets) as typeof dirty;
    expect(JSON.stringify(clean)).not.toContain("llmcp_secret_value_123");
    expect(clean.note).toContain("[REDACTED]");
  });

  it("scrubs both property-specific Algolia API keys", () => {
    const propertySecrets = secretsFromEnv({
      ALGOLIA_API_KEY_DOCS: "docs_property_key_abcdefgh",
      ALGOLIA_API_KEY_SITE: "site_property_key_abcdefgh"
    });
    const clean = redactSecrets(
      { docs: "docs_property_key_abcdefgh", site: "site_property_key_abcdefgh" },
      propertySecrets
    );
    expect(JSON.stringify(clean)).not.toContain("docs_property_key_abcdefgh");
    expect(JSON.stringify(clean)).not.toContain("site_property_key_abcdefgh");
  });

  it("returns the same reference when nothing matches", () => {
    const value = { fine: true };
    expect(redactSecrets(value, secrets)).toBe(value);
  });
});

describe("truncation at the model boundary", () => {
  it("parses the host-side model-boundary cap with a safe default", () => {
    expect(modelBoundaryMaxTokensFromEnv({})).toBe(DEFAULT_MAX_TOKENS);
    expect(modelBoundaryMaxTokensFromEnv({ [MODEL_BOUNDARY_MAX_TOKENS_ENV]: "10000" })).toBe(10000);
    expect(modelBoundaryMaxTokensFromEnv({ [MODEL_BOUNDARY_MAX_TOKENS_ENV]: 12000 })).toBe(12000);
  });

  it("rejects invalid or out-of-range model-boundary cap overrides", () => {
    for (const value of ["", "999", "32001", "12.5", "abc", "-10000"]) {
      expect(modelBoundaryMaxTokensFromEnv({ [MODEL_BOUNDARY_MAX_TOKENS_ENV]: value })).toBe(
        DEFAULT_MAX_TOKENS
      );
      expect(modelBoundaryMaxTokensFromValue(value)).toBe(DEFAULT_MAX_TOKENS);
    }
  });

  it("bounds explicit model-boundary cap arguments too", () => {
    expect(truncateForModel("x".repeat(10_000), 1000).maxTokens).toBe(1000);
    expect(truncateForModel("x".repeat(10_000), 999).maxTokens).toBe(DEFAULT_MAX_TOKENS);
    expect(truncateLogsForModel("x".repeat(10_000), 32001).maxTokens).toBe(DEFAULT_MAX_TOKENS);
  });

  it("passes small results through as compact JSON", () => {
    const { text, truncated } = truncateForModel({ a: 1 });
    expect(text).toBe('{"a":1}');
    expect(truncated).toBe(false);
  });

  it("clips oversized results with an actionable footer", () => {
    const big = { rows: Array.from({ length: 5000 }, (_, i) => `row-${i}-${"x".repeat(20)}`) };
    const result = truncateForModel(big);
    const { text, truncated } = result;
    expect(truncated).toBe(true);
    expect(text.length).toBeLessThan(26_000);
    expect(text).toContain("--- TRUNCATED ---");
    expect(text).toContain("select only the fields you need");
    expect(result.originalChars).toBe(JSON.stringify(big).length);
    expect(result.returnedChars).toBe(text.length);
    expect(result.maxTokens).toBe(6000);
    expect(result.maxChars).toBe(24_000);
    expect(result.approxOriginalTokens).toBe(Math.round(result.originalChars / 4));
  });

  it("skill-read advice flag changes footer TEXT only — never which bytes are kept", () => {
    const big = { rows: Array.from({ length: 5000 }, (_, i) => `row-${i}-${"x".repeat(20)}`) };
    const off = truncateForModel(big);
    const on = truncateForModel(big, undefined, { skillSectionAdvice: true });
    expect(off.truncated).toBe(true);
    expect(on.truncated).toBe(true);
    // SECURITY: the cap is a boundary — an advice flag may never widen it or
    // move the cut. Identical kept bytes with the flag on and off.
    const maxChars = 6000 * 4;
    expect(on.text.slice(0, maxChars)).toBe(off.text.slice(0, maxChars));
    expect(on.text).toContain("codemode.skill.read");
    expect(off.text).not.toContain("codemode.skill.read");
  });

  it("the advice flag adds nothing to results under the cap", () => {
    const { text, truncated } = truncateForModel({ a: 1 }, undefined, {
      skillSectionAdvice: true
    });
    expect(text).toBe('{"a":1}');
    expect(truncated).toBe(false);
  });

  it("object footer names the cut and dropped top-level keys with approximate sizes", () => {
    // ~24k-char budget: "meta" fits whole, "rows" straddles the cut, "extra"
    // starts entirely past it.
    const value = {
      meta: { query: "soroswap", total: 5000 },
      rows: Array.from({ length: 5000 }, (_, i) => `row-${i}-${"x".repeat(20)}`),
      extra: "y".repeat(10_000)
    };
    const { text, truncated } = truncateForModel(value);
    expect(truncated).toBe(true);
    const footer = text.slice(24_000);
    expect(footer).toContain("Bulk lost from top-level keys:");
    expect(footer).toMatch(/"rows" ~\d+(\.\d+)?k chars \(cut\)/);
    expect(footer).toMatch(/"extra" ~\d+(\.\d+)?k chars \(dropped\)/);
    expect(footer).toContain('kept intact: "meta"');
    // Actionable advice is repeated alongside the where-the-bulk-is detail.
    expect(footer).toContain("select only the fields you need");
  });

  it("array results report items kept vs total", () => {
    const value = Array.from({ length: 5_000 }, (_, i) => ({ i, pad: "x".repeat(20) }));
    const { text, truncated } = truncateForModel(value);
    expect(truncated).toBe(true);
    expect(text).toMatch(/Array result: kept the first ~\d+ of 5000 items\./);
    // The kept count must be plausible: each item serializes to ~30+ chars,
    // so well under the 24k-char budget's naive item count.
    const kept = Number(/kept the first ~(\d+) of/.exec(text)?.[1]);
    expect(kept).toBeGreaterThan(0);
    expect(kept).toBeLessThan(1_000);
  });

  it("string results report chars kept vs total", () => {
    const value = "z".repeat(100_000);
    const { text, truncated } = truncateForModel(value);
    expect(truncated).toBe(true);
    expect(text).toContain("String result: kept the first 24000 of 100000 chars.");
  });

  it("degrades to the generic footer when the object serializes via toJSON", () => {
    const value = {
      big: "x".repeat(50_000),
      toJSON() {
        return { renamed: this.big };
      }
    };
    const { text, truncated } = truncateForModel(value);
    expect(truncated).toBe(true);
    // Span reconstruction can't see through toJSON — no wrong key spans.
    expect(text).not.toContain("Bulk lost from top-level keys:");
    expect(text).toContain("select only the fields you need");
  });

  it("the loss detail never moves the cut: kept bytes are identical to a plain clip", () => {
    const value = { rows: Array.from({ length: 5000 }, (_, i) => `row-${i}-${"x".repeat(20)}`) };
    const { text } = truncateForModel(value);
    const maxChars = 6000 * 4;
    expect(text.slice(0, maxChars)).toBe(JSON.stringify(value).slice(0, maxChars));
  });

  it("redact-then-clip: a secret straddling the result clip boundary leaks NO prefix", () => {
    // Mirrors run.ts's ordering (redactSecrets THEN truncateForModel): the
    // secret starts just before the 24k-char cut and ends after it. Clip-then-
    // redact would keep an un-scrubbable secret prefix; redact-first collapses
    // it to [REDACTED] before the cut lands.
    const secret = "llmcp_secret_value_1234567890"; // secret-scan:allow — synthetic fixture
    const maxChars = 6000 * 4;
    // Serialization overhead before the leak value: {"pad":" (8) + pad + ",
    // (2) + "leak":" (8) — pad sized so the 29-char secret starts ~12 chars
    // before the cut and ends ~17 past it (straddles), while the shorter
    // [REDACTED] marker lands fully inside the kept prefix.
    const value = {
      pad: "x".repeat(maxChars - 30),
      leak: `${secret} plus trailing context`,
      tail: "y".repeat(1_000)
    };
    const { text, truncated } = truncateForModel(redactSecrets(value, [secret]));
    expect(truncated).toBe(true);
    expect(text).not.toContain(secret);
    expect(text).not.toContain(secret.slice(0, 12)); // no straddled prefix either
    expect(text).toContain("[REDACTED]"); // redaction ran before the clip
  });

  it("passes normal-sized console logs through untouched", () => {
    const logs = Array.from({ length: 100 }, (_, i) => `[step ${i}] fetched page, 42 hits`).join("\n");
    const { text, truncated, originalChars, returnedChars } = truncateLogsForModel(logs);
    expect(text).toBe(logs);
    expect(truncated).toBe(false);
    expect(originalChars).toBe(logs.length);
    expect(returnedChars).toBe(logs.length);
  });

  it("clips oversized console logs with a logs-specific footer", () => {
    // Payload smuggled via console.log: 100 max-length lines ≈ 200k chars,
    // far past the ~6k-token budget.
    const logs = Array.from({ length: 100 }, () => "x".repeat(2_000)).join("\n");
    const { text, truncated, originalChars, returnedChars, maxChars } = truncateLogsForModel(logs);
    expect(truncated).toBe(true);
    expect(text.length).toBeLessThan(26_000);
    expect(text).toContain("--- TRUNCATED ---");
    expect(text).toContain("log counts and previews");
    expect(originalChars).toBe(logs.length);
    expect(returnedChars).toBe(text.length);
    expect(maxChars).toBe(24_000);
  });
});
