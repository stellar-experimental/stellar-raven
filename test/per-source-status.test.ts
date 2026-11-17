/**
 * Per-source attempts and final status on the run ledger, the `sourceSummary` buckets built from
 * it, and the `execute` error class. Pure Node: the real adapters run against an injected fetch.
 */
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
vi.mock("cloudflare:workers", () => ({ tracing: { trace: async (_name: string, fn: () => unknown) => fn() } }));
vi.mock("@cloudflare/codemode", () => ({ DynamicWorkerExecutor: class DynamicWorkerExecutor {} }));

import { loadManifest, type Catalog } from "../src/catalog/search.ts";
import { buildSandbox, type OpLedgerCall } from "../src/executor/providers.ts";
import { sourceStatusBucket, summarizeSourceLedger } from "../src/executor/run.ts";
import { classifyExecuteError } from "../src/executor/script-hints.ts";
import type { FetchLike } from "../src/adapters/types.ts";
import { lazyPinnedSkillSource as skillSource } from "./helpers/skill-source.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog: Catalog = loadManifest(JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8")));
const fixture = (name: string) => readFileSync(join(ROOT, "test", "fixtures", name), "utf8");

const env = {
  LUMENLOOP_API_KEY: "test-key-not-real-1234",
  MINTLIFY_ASSISTANT_API_KEY: "test-key-not-real-5678"
};
const DOCS_ORIGIN = "https://developers.stellar.org";

type Sandbox = ReturnType<typeof buildSandbox>;
const fnsOf = (providers: Sandbox, name: string) => providers.find((p) => p.name === name)!.fns;

function run(fetchImpl: FetchLike, serviceEnv: Record<string, string> = env) {
  const calls: OpLedgerCall[] = [];
  const providers = buildSandbox(catalog, skillSource, serviceEnv, { fetchImpl, onOpCall: (call) => calls.push(call) });
  return { calls, providers };
}

/** A Docs page store plus site: absent pages 404, `pages` hold content, the site answers `siteStatus`. */
function docsFetch(pages: Record<string, string>, siteStatus: number | "hang" = 404): FetchLike {
  return async (url, init) => {
    if (new URL(url).origin === DOCS_ORIGIN) {
      if (siteStatus === "hang") {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(init.signal!.reason));
        });
      }
      return new Response("not found", { status: siteStatus });
    }
    const { path } = JSON.parse(String(init?.body)) as { path: string };
    const content = pages[path];
    return content ? Response.json({ path, content }) : Response.json({ message: "Page not found" }, { status: 404 });
  };
}

describe("per-call attempts and final status", () => {
  it("counts a Docs 5xx followed by a 200 as two attempts ending 200", async () => {
    let count = 0;
    const { calls, providers } = run(async () =>
      count++ === 0
        ? Response.json({ message: "boom" }, { status: 502 })
        : new Response(fixture("stellar-docs-success.json"))
    );
    await fnsOf(providers, "stellarDocs").search_docs!({ query: "soroban storage" });
    expect(calls[0]).toMatchObject({ op: "stellarDocs.search_docs", outcome: "ok", attempts: 2, finalStatus: "200" });
  });

  it("labels an exhausted Docs 5xx with its last status and the http-5xx reason", async () => {
    const { calls, providers } = run(async () => Response.json({ message: "boom" }, { status: 503 }));
    const result = await fnsOf(providers, "stellarDocs").search_docs!({ query: "soroban" });
    expect(result).toMatchObject({ ok: false, error: { kind: "error", status: 503 } });
    expect(calls[0]).toMatchObject({ outcome: "error", reason: "http-503", attempts: 2, finalStatus: "503" });
  });

  it("keeps an absent Docs page soft-empty at 404 across three requests, even when the probe fails", async () => {
    for (const siteStatus of [404, 500] as const) {
      const { calls, providers } = run(docsFetch({}, siteStatus));
      await fnsOf(providers, "stellarDocs").get_doc_page!({ path: "/docs/build/absent" });
      expect(calls[0]).toMatchObject({ outcome: "soft-empty", attempts: 3, finalStatus: "404" });
    }
  });

  it("labels a hung Docs site probe on an absent page 404, not timeout", async () => {
    // The adapter's own 404 wins over the probe: a real miss never looks like a hung source.
    const realTimeout = AbortSignal.timeout.bind(AbortSignal);
    const spy = vi.spyOn(AbortSignal, "timeout").mockImplementation(() => realTimeout(5));
    try {
      const { calls, providers } = run(docsFetch({}, "hang"));
      await fnsOf(providers, "stellarDocs").get_doc_page!({ path: "/docs/build/absent" });
      expect(calls[0]).toMatchObject({ outcome: "soft-empty", attempts: 3, finalStatus: "404" });
    } finally {
      spy.mockRestore();
    }
  });

  it("records the last hop's status for a stellar.org redirect", async () => {
    let count = 0;
    const { calls, providers } = run(
      async () =>
        count++ === 0
          ? new Response(null, { status: 308, headers: { location: "/foundation/roadmap" } })
          : new Response("<main><h1>Roadmap</h1></main>", { status: 200, headers: { "content-type": "text/html" } }),
      {}
    );
    await fnsOf(providers, "stellarOrg").get_page!({ path: "/foundation/old-roadmap" });
    expect(calls[0]).toMatchObject({ op: "stellarOrg.get_page", outcome: "ok", attempts: 2, finalStatus: "200" });
  });

  it("labels a call whose last request timed out `timeout`", async () => {
    const realTimeout = AbortSignal.timeout.bind(AbortSignal);
    const spy = vi.spyOn(AbortSignal, "timeout").mockImplementation(() => realTimeout(5));
    try {
      const hang: FetchLike = (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(init.signal!.reason));
        });
      const { calls, providers } = run(hang);
      const result = await fnsOf(providers, "scout").searchResearch!({ q: "base reserve" });
      expect(result).toMatchObject({ ok: false, error: { kind: "error", message: "scout timed out after 24 s" } });
      expect(calls[0]).toMatchObject({ outcome: "error", reason: "timeout", attempts: 1, finalStatus: "timeout" });
    } finally {
      spy.mockRestore();
    }
  });

  it("labels a call whose last request threw before any response `network`", async () => {
    const { calls, providers } = run(async () => {
      throw new TypeError("offline");
    });
    await fnsOf(providers, "scout").searchResearch!({ q: "base reserve" });
    expect(calls[0]).toMatchObject({ outcome: "error", attempts: 1, finalStatus: "network" });
  });

  it("labels a guard refusal and a missing key `none` with zero attempts", async () => {
    const fetchImpl = vi.fn<FetchLike>(async () => Response.json({}));
    const refused = run(fetchImpl);
    await fnsOf(refused.providers, "lumenloop").get_document!({ collection: "articles" });
    expect(refused.calls[0]).toMatchObject({ outcome: "error", attempts: 0, finalStatus: "none" });

    const keyless = run(fetchImpl, {});
    await fnsOf(keyless.providers, "lumenloop").search_directory!({ query: "x" });
    expect(keyless.calls[0]).toMatchObject({ outcome: "error", attempts: 0, finalStatus: "none" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("passes the request through to fetch untouched", async () => {
    const seen: Array<{ url: string; init?: RequestInit }> = [];
    const { providers } = run(async (url, init) => {
      seen.push({ url, init });
      return new Response(fixture("scout-success.json"), { headers: { "content-type": "application/json" } });
    });
    await fnsOf(providers, "scout").searchResearch!({ q: "base reserve" });
    expect(seen).toHaveLength(1);
    expect(seen[0]!.url).toContain("/api/research");
    expect(seen[0]!.init).toMatchObject({ method: "GET" });
    expect(seen[0]!.init?.signal).toBeInstanceOf(AbortSignal);
  });
});

describe("sourceSummary", () => {
  const call = (op: string, outcome: OpLedgerCall["outcome"], attempts: number, finalStatus: string): OpLedgerCall => ({
    op,
    outcome,
    attempts,
    finalStatus,
    ms: 1
  });

  it("buckets exact statuses into fixed keys", () => {
    expect(
      ["200", "204", "301", "404", "400", "429", "500", "503", "timeout", "network", "none", "100", "x"].map(sourceStatusBucket)
    ).toEqual(["2xx", "2xx", "3xx", "4xx", "4xx", "429", "5xx", "5xx", "timeout", "network", "none", "none", "none"]);
  });

  it("summarizes a mixed ledger per service with fixed keys only", () => {
    const summary = summarizeSourceLedger([
      call("lumenloop.search_directory", "ok", 1, "200"),
      call("lumenloop.search_directory", "error", 1, "timeout"),
      call("scout.searchResearch", "error", 1, "503"),
      call("stellarDocs.get_doc_page", "soft-empty", 3, "404"),
      call("stellarDocs.search_docs", "ok", 2, "200"),
      call("stellarOrg.get_page", "error", 0, "none"),
      call("lumenloop.get_document", "error", 1, "429")
    ]);
    expect(summary).toEqual({
      lumenloop: {
        calls: 3,
        attempts: 3,
        ok: 1,
        error: 2,
        softEmpty: 0,
        finalStatus: { "2xx": 1, timeout: 1, "429": 1 }
      },
      scout: { calls: 1, attempts: 1, ok: 0, error: 1, softEmpty: 0, finalStatus: { "5xx": 1 } },
      stellarDocs: { calls: 2, attempts: 5, ok: 1, error: 0, softEmpty: 1, finalStatus: { "4xx": 1, "2xx": 1 } },
      stellarOrg: { calls: 1, attempts: 0, ok: 0, error: 1, softEmpty: 0, finalStatus: { none: 1 } }
    });
  });

  it("lists only the services a run called", () => {
    expect(summarizeSourceLedger([])).toEqual({});
    expect(Object.keys(summarizeSourceLedger([call("scout.getProject", "ok", 1, "200")]))).toEqual(["scout"]);
  });
});

describe("classifyExecuteError", () => {
  it.each([
    ["Execution timed out", false, "timeout"],
    ["SyntaxError: Unexpected token ')'", false, "SyntaxError"],
    ["Failed to start Worker: Uncaught SyntaxError: Unexpected identifier 'x'", true, "SyntaxError"],
    ["Unexpected end of JSON input", false, "SyntaxError"],
    ['"abc" is not valid JSON', false, "SyntaxError"],
    ["scoutt is not defined", false, "ReferenceError"],
    ["Cannot access 'x' before initialization", false, "ReferenceError"],
    ["Cannot read properties of null (reading 'x')", false, "TypeError"],
    ["codemode.nope is not a function", false, "TypeError"],
    ["undefined is not iterable (cannot read property Symbol(Symbol.iterator))", false, "TypeError"],
    ["Assignment to constant variable.", false, "TypeError"],
    ["Cannot destructure property 'a' of 'undefined' as it is undefined.", false, "TypeError"],
    // A model-thrown Error carries no recognizable form.
    ["x", false, "other"],
    ["Tool \"lumenloop.nope\" not found", false, "other"],
    // The load-rejection path also carries RPC, isolate, and loader faults.
    ["Network connection lost.", true, "other"],
    ["Could not serialize object of type \"Function\"", true, "other"],
    ["scoutt is not defined", true, "other"]
  ])("classifies %j (loadRejected=%s) as %s", (message, loadRejected, expected) => {
    expect(classifyExecuteError(message, loadRejected)).toBe(expected);
  });
});
