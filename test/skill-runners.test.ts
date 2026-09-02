/**
 * Runner unit tests (design §12, unit row 1) — each runner against a stub
 * facade serving live-captured fixtures (test/fixtures/skill-runners/,
 * production capture 2026-07-06), plus the two confinement drift belts:
 * the import/token lint and the behavioral fetch-stub test.
 *
 * The self-authored outputSchema is reused as the oracle (validateArgs) —
 * outputs, with a host-style `calls` array attached the way runSkill does,
 * must validate against the runner's own contract.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { AdapterResult } from "../src/adapters/types.ts";
import { validateArgs } from "../src/policy/validate.ts";
import type { OpsFacade, SkillRunner } from "../src/skills/runners/types.ts";
import { RUNNERS } from "../src/skills/runners/index.ts";
import { stellarEcosystemDigest } from "../src/skills/runners/stellar-ecosystem-digest.ts";
import fxSemantic from "./fixtures/skill-runners/lumenloop.search_content_semantic.ts";
import fxListDocs from "./fixtures/skill-runners/lumenloop.list_documents.ts";
import fxEntity from "./fixtures/skill-runners/lumenloop.find_content_by_entity.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const DIGEST_ID = "skills.lumenloop.stellar-ecosystem-digest";

// ---------------------------------------------------------------------------
// stub facade — records every call's op + args so default-application and
// mode-routing assertions read the wire, not runner internals.
// ---------------------------------------------------------------------------
type Recorded = { op: string; args: Record<string, unknown> };
type StubValue = AdapterResult | ((args: Record<string, unknown>) => AdapterResult);

function stubFacade(map: Record<string, StubValue>, recorded?: Recorded[]): OpsFacade {
  const out: OpsFacade = {};
  for (const [opId, v] of Object.entries(map)) {
    const service = opId.slice(0, opId.indexOf("."));
    const fnName = opId.slice(opId.indexOf(".") + 1);
    (out[service] ??= {})[fnName] = async (args?: unknown) => {
      const a = (args ?? {}) as Record<string, unknown>;
      recorded?.push({ op: opId, args: a });
      return typeof v === "function" ? v(a) : v;
    };
  }
  return out;
}

const softEmpty = (message = "nothing matched"): AdapterResult => ({
  ok: false,
  error: { service: "lumenloop", kind: "soft-empty", message }
});
const hardError = (message = "upstream 500"): AdapterResult => ({
  ok: false,
  error: { service: "lumenloop", kind: "error", message }
});
const okData = (data: unknown): AdapterResult => ({ ok: true, data });

const digestHappy = (): Record<string, StubValue> => ({
  "lumenloop.search_content_semantic": fxSemantic,
  "lumenloop.list_documents": fxListDocs,
  "lumenloop.find_content_by_entity": fxEntity
});

/** Oracle: output + a host-style calls array must satisfy the runner's own outputSchema. */
function expectValidates(runner: SkillRunner, out: unknown, ops: string[]) {
  const calls = ops.map((op) => ({ op, ok: true, ms: 1 }));
  const issues = validateArgs(runner.outputSchema, { ...(out as Record<string, unknown>), calls });
  expect(issues).toEqual([]);
}

const asRecord = (v: unknown) => v as Record<string, any>;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

// ===========================================================================
// stellar-ecosystem-digest
// ===========================================================================
describe("stellar-ecosystem-digest runner", () => {
  it("theme happy path on live fixtures: window framing, flat items, counts, upcoming", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-06T12:00:00Z"));
    const recorded: Recorded[] = [];
    const out = asRecord(
      await stellarEcosystemDigest.run({ subject: "RWA tokenization" }, stubFacade(digestHappy(), recorded))
    );

    expect(out.subject).toBe("RWA tokenization");
    expect(out.subjectType).toBe("theme");
    expect(out.window).toEqual({ dateStart: "2026-06-06", dateEnd: "2026-07-06" });
    expect(out.softEmpty).toBe(false);
    expect(out.items).toHaveLength(6);
    expect(out.counts).toEqual({ articles: 2, av: 1, events: 1, research: 2 });
    // date-desc ordering (nulls last)
    const dates = out.items.map((i: any) => i.date).filter((d: any) => d !== null);
    expect([...dates].sort().reverse()).toEqual(dates);
    // upcoming events: live slim rows carry no start_at → null, not guessed
    expect(out.upcomingEvents).toHaveLength(2);
    expect(out.upcomingEvents[0]).toEqual({
      title: "Built in Nairobi: Stellar Impact Studio Demo Day",
      url: "https://luma.com/xzvdmrt0",
      startAt: null
    });
    expect("calls" in out).toBe(false);
    expect(recorded).toHaveLength(2);
    expectValidates(stellarEcosystemDigest, out, recorded.map((r) => r.op));
  });

  it("keeps A/V created_at out of digest dates and recency sorting", async () => {
    const map = digestHappy();
    map["lumenloop.search_content_semantic"] = okData({
      items: [
        {
          id: "av-445",
          collection: "av",
          title: "Workshop: Stellar | Multichain Day | DEVCON 2024",
          created_at: "2026-09-01T00:00:00Z",
          date: "2026-09-01T00:00:00Z",
          dateField: "created_at"
        },
        {
          id: "article",
          collection: "articles",
          title: "Article",
          publishing_date: "2026-08-31T00:00:00Z"
        },
        {
          id: "research",
          collection: "research",
          title: "Research",
          created_at: "2026-08-30T00:00:00Z"
        },
        {
          id: "event",
          collection: "events",
          title: "Event",
          start_at: "2026-08-29T00:00:00Z"
        }
      ],
      counts: { articles: 1, av: 1, events: 1, research: 1 },
      meta: {}
    });
    const recorded: Recorded[] = [];

    const out = asRecord(
      await stellarEcosystemDigest.run({ subject: "x" }, stubFacade(map, recorded))
    );

    expect(out.items.map((item: any) => [item.type, item.date])).toEqual([
      ["articles", "2026-08-31T00:00:00Z"],
      ["research", "2026-08-30T00:00:00Z"],
      ["events", "2026-08-29T00:00:00Z"],
      ["av", null]
    ]);
    expectValidates(stellarEcosystemDigest, out, recorded.map((r) => r.op));
  });

  it('applies its own defaults: 30-day window, "theme" mode, perTypeLimit 5, upcoming limit 5', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-06T12:00:00Z"));
    const recorded: Recorded[] = [];
    await stellarEcosystemDigest.run({ subject: "payments" }, stubFacade(digestHappy(), recorded));
    expect(recorded.map((r) => r.op).sort()).toEqual([
      "lumenloop.list_documents",
      "lumenloop.search_content_semantic"
    ]);
    const sem = recorded.find((r) => r.op === "lumenloop.search_content_semantic")!;
    expect(sem.args).toEqual({
      query: "payments",
      date_start: "2026-06-06",
      date_end: "2026-07-06",
      types: ["articles", "av", "events", "research"],
      limit: 5,
      response_format: "concise"
    });
    const docs = recorded.find((r) => r.op === "lumenloop.list_documents")!;
    expect(docs.args).toEqual({ collection: "events", period: "upcoming", limit: 5 });
  });

  it("window math honors explicit days and stays YYYY-MM-DD UTC", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-06T23:59:00Z"));
    const out = asRecord(
      await stellarEcosystemDigest.run({ subject: "x", days: 7 }, stubFacade(digestHappy()))
    );
    expect(out.window).toEqual({ dateStart: "2026-06-29", dateEnd: "2026-07-06" });
    expect(out.window.dateStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("entity mode routes to find_content_by_entity only; upcomingEvents stays null (not attempted)", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-06T12:00:00Z"));
    const recorded: Recorded[] = [];
    const out = asRecord(
      await stellarEcosystemDigest.run(
        { subject: "Soroswap", subjectType: "entity" },
        stubFacade(digestHappy(), recorded)
      )
    );
    expect(recorded.map((r) => r.op)).toEqual(["lumenloop.find_content_by_entity"]);
    expect(recorded[0]!.args).toEqual({
      entity: "Soroswap",
      date_start: "2026-06-06",
      date_end: "2026-07-06",
      limit: 5
    });
    expect(out.upcomingEvents).toBeNull();
    // live entity fixture: proposals/scf_submissions keys DROPPED (not digest
    // output types), rows carry no summary → projected ""
    expect(out.items).toHaveLength(2);
    for (const item of out.items) {
      expect(["articles", "av", "events", "research"]).toContain(item.type);
      expect(item.summary).toBe("");
    }
    expect(out.counts).toEqual({ articles: 2, av: 0, events: 0, research: 0 });
    expectValidates(stellarEcosystemDigest, out, recorded.map((r) => r.op));
  });

  it("keeps type-keyed entity A/V rows undated", async () => {
    const map = digestHappy();
    map["lumenloop.find_content_by_entity"] = okData({
      articles: [
        {
          id: "article",
          title: "Article",
          publishing_date: "2026-08-31T00:00:00Z"
        }
      ],
      av: [
        {
          id: "av-1162",
          title: "Passkeys: The Future of Passwords",
          created_at: "2026-09-01T00:00:00Z"
        }
      ],
      events: [],
      research: []
    });
    const recorded: Recorded[] = [];

    const out = asRecord(
      await stellarEcosystemDigest.run(
        { subject: "passkeys", subjectType: "entity" },
        stubFacade(map, recorded)
      )
    );

    expect(out.items.map((item: any) => [item.type, item.date])).toEqual([
      ["articles", "2026-08-31T00:00:00Z"],
      ["av", null]
    ]);
    expectValidates(stellarEcosystemDigest, out, recorded.map((r) => r.op));
  });

  it("dedups by url across types and by id when url is absent", async () => {
    const map = digestHappy();
    map["lumenloop.search_content_semantic"] = okData({
      items: [
        { id: "1", collection: "articles", title: "A", url: "https://dup", publishing_date: "2026-07-01", summary: "s" },
        { id: "2", collection: "articles", title: "A again", url: "https://dup", publishing_date: "2026-07-02", summary: "s" },
        { id: 9, collection: "research", title: "R", summary: "s", created_at: "2026-06-30" },
        { id: 9, collection: "research", title: "R copy", summary: "s", created_at: "2026-06-30" }
      ],
      counts: { articles: 2, research: 2 },
      meta: {}
    });
    const out = asRecord(await stellarEcosystemDigest.run({ subject: "x" }, stubFacade(map)));
    expect(out.items).toHaveLength(2);
    expect(out.counts).toEqual({ articles: 1, av: 0, events: 0, research: 1 });
  });

  it("primary soft-empty → quiet-window answer: ok data with softEmpty true, items []", async () => {
    const map = digestHappy();
    map["lumenloop.search_content_semantic"] = softEmpty();
    const recorded: Recorded[] = [];
    const out = asRecord(await stellarEcosystemDigest.run({ subject: "x" }, stubFacade(map, recorded)));
    expect(out.ok).toBeUndefined(); // data payload, not an error envelope
    expect(out.softEmpty).toBe(true);
    expect(out.items).toEqual([]);
    expect(out.counts).toEqual({ articles: 0, av: 0, events: 0, research: 0 });
    expect(out.upcomingEvents).toHaveLength(2); // the sibling call still lands
    expectValidates(stellarEcosystemDigest, out, recorded.map((r) => r.op));
  });

  it("primary hard error → the run fails as data, naming the op", async () => {
    const map = digestHappy();
    map["lumenloop.search_content_semantic"] = hardError("pgvector down");
    const out = asRecord(await stellarEcosystemDigest.run({ subject: "x" }, stubFacade(map)));
    expect(out.ok).toBe(false);
    expect(out.error.kind).toBe("error");
    expect(out.error.message).toContain("lumenloop.search_content_semantic");
    expect(out.error.message).toContain("pgvector down");
  });

  it("upcoming-events error degrades that section to null; soft-empty to []", async () => {
    const errMap = digestHappy();
    errMap["lumenloop.list_documents"] = hardError();
    const outErr = asRecord(await stellarEcosystemDigest.run({ subject: "x" }, stubFacade(errMap)));
    expect(outErr.upcomingEvents).toBeNull();
    expect(outErr.items).toHaveLength(6); // primary unaffected

    const emptyMap = digestHappy();
    emptyMap["lumenloop.list_documents"] = softEmpty();
    const outEmpty = asRecord(await stellarEcosystemDigest.run({ subject: "x" }, stubFacade(emptyMap)));
    expect(outEmpty.upcomingEvents).toEqual([]);
  });

  it("primary shape drift (no expected type keys) → treated as the call erroring", async () => {
    const map = digestHappy();
    map["lumenloop.search_content_semantic"] = okData({ weird: 1 });
    const out = asRecord(await stellarEcosystemDigest.run({ subject: "x" }, stubFacade(map)));
    expect(out.ok).toBe(false);
    expect(out.error.message).toContain("unexpected payload shape");
  });

  it("upcoming-events shape drift → that section null, run unaffected", async () => {
    const map = digestHappy();
    map["lumenloop.list_documents"] = okData({ weird: 1 });
    const out = asRecord(await stellarEcosystemDigest.run({ subject: "x" }, stubFacade(map)));
    expect(out.upcomingEvents).toBeNull();
    expect(out.items).toHaveLength(6);
  });

  it("truncates item summaries to ≤ 200 chars", async () => {
    const map = digestHappy();
    map["lumenloop.search_content_semantic"] = okData({
      items: [
        {
          id: "1",
          collection: "articles",
          title: "t",
          url: "https://u",
          publishing_date: "2026-07-01",
          summary: "s".repeat(5000)
        }
      ],
      counts: { articles: 1 },
      meta: {}
    });
    const out = asRecord(await stellarEcosystemDigest.run({ subject: "x" }, stubFacade(map)));
    expect(out.items[0].summary).toHaveLength(200);
  });
});

// ===========================================================================
// confinement drift belts (design §2/§12)
// ===========================================================================
describe("runner confinement belts", () => {
  const RUNNER_DIR = join(ROOT, "src", "skills", "runners");
  const runnerFiles = readdirSync(RUNNER_DIR).filter(
    (f) => f.endsWith(".ts") && f !== "types.ts" && f !== "index.ts"
  );

  it("covers every registered runner (one module per registry entry)", () => {
    expect(runnerFiles.length).toBe(Object.keys(RUNNERS).length);
  });

  it("import-discipline lint: specifiers ⊆ {./types.ts}, no forbidden tokens", () => {
    // The design's §12 token set plus the dynamic-eval spellings (eval /
    // Function / constructor) a review flagged as lint-escapable egress
    // vectors. Still a drift BELT, not a boundary (design §2/§7) — the
    // behavioral fetch-stub test below and first-party review remain the
    // real enforcement.
    const FORBIDDEN = [
      "fetch(",
      "env.",
      "process.",
      "import(",
      "globalThis",
      "self.",
      "Reflect",
      "eval(",
      "Function(",
      "constructor"
    ];
    for (const file of runnerFiles) {
      const source = readFileSync(join(RUNNER_DIR, file), "utf8");
      const specifiers = [
        ...source.matchAll(/(?:import|export)[^"'\n]*from\s*["']([^"']+)["']/g),
        ...source.matchAll(/import\s*["']([^"']+)["']/g)
      ].map((m) => m[1]);
      expect(specifiers.length, `${file}: expected at least one import`).toBeGreaterThan(0);
      for (const spec of specifiers) {
        expect(spec, `${file}: import specifier ${spec}`).toBe("./types.ts");
      }
      for (const token of FORBIDDEN) {
        expect(source.includes(token), `${file}: forbidden token ${JSON.stringify(token)}`).toBe(false);
      }
    }
  });

  it("behavioral confinement: every runner completes end-to-end with global fetch stubbed to throw", async () => {
    vi.stubGlobal("fetch", () => {
      throw new Error("network egress attempted from a runner — facade-only rule violated");
    });
    const inputs: Record<string, { input: Record<string, unknown>; map: Record<string, StubValue> }> = {
      [DIGEST_ID]: { input: { subject: "RWA tokenization" }, map: digestHappy() }
    };
    for (const [id, runner] of Object.entries(RUNNERS)) {
      const setup = inputs[id];
      expect(setup, `no confinement-test input for ${id} — add one when registering a runner`).toBeDefined();
      const out = asRecord(await runner.run(setup!.input, stubFacade(setup!.map)));
      expect(out.ok).not.toBe(false); // completed on the facade alone
    }
  });
});

// ===========================================================================
// registry + schema dialect sanity
// ===========================================================================
describe("RUNNERS registry", () => {
  it("is keyed by exact catalog ids with declared ops on every runner", () => {
    expect(Object.keys(RUNNERS).sort()).toEqual([DIGEST_ID]);
    for (const runner of Object.values(RUNNERS)) {
      expect(runner.ops.length).toBeGreaterThan(0);
      for (const op of runner.ops) expect(op).toMatch(/^[a-z][a-zA-Z]*\.[a-z_]+$/);
    }
  });

  it("keeps schemas inside the bounded validate.ts dialect (no oneOf/$ref/allOf/anyOf)", () => {
    for (const [id, runner] of Object.entries(RUNNERS)) {
      for (const schema of [runner.inputSchema, runner.outputSchema]) {
        const text = JSON.stringify(schema);
        for (const kw of ['"oneOf"', '"anyOf"', '"allOf"', '"$ref"', '"not"']) {
          expect(text.includes(kw), `${id}: schema uses ${kw}`).toBe(false);
        }
      }
      expect(runner.inputSchema["additionalProperties"]).toBe(false);
    }
  });

  it("rejects unknown input keys and out-of-range limits via validateArgs (unknown keys refused, never ignored)", () => {
    const digest = RUNNERS[DIGEST_ID]!;
    expect(validateArgs(digest.inputSchema, { subject: "x", section: "y" })).not.toEqual([]);
    expect(validateArgs(digest.inputSchema, { subject: "x", subjectType: "both" })).not.toEqual([]);
    expect(validateArgs(digest.inputSchema, { subject: "x", days: 365 })).not.toEqual([]);
    expect(validateArgs(digest.inputSchema, {})).not.toEqual([]);
    expect(validateArgs(digest.inputSchema, { subject: "x" })).toEqual([]);
  });
});
