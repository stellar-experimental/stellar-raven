/**
 * runSkill dispatcher tests — resolution ladder,
 * host-owned call ledger, deadline race, warn belts, and assertRunnersWired
 * in every drift direction.
 *
 * The catalog here is hand-built. It pins the runtime semantics against
 * synthetic runnable entries whose schemas come from the real runners. The
 * wiring assertions therefore exercise the real registry.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Catalog, CatalogEntry } from "../src/catalog/types.ts";
import type { AdapterResult } from "../src/adapters/types.ts";
import { validateArgs } from "../src/policy/validate.ts";
import type { OpsFacade, SkillRunner } from "../src/skills/runners/types.ts";
import { RUNNERS } from "../src/skills/runners/index.ts";
import { runSkill, assertRunnersWired, RUNNER_DEADLINE_MS } from "../src/skills/run.ts";
import { nearestSkillId } from "../src/skills/store.ts";
import fxSemantic from "./fixtures/skill-runners/lumenloop.search_content_semantic.ts";
import fxListDocs from "./fixtures/skill-runners/lumenloop.list_documents.ts";
import fxEntity from "./fixtures/skill-runners/lumenloop.find_content_by_entity.ts";

const DIGEST_ID = "skills.lumenloop.stellar-ecosystem-digest";

// ---------------------------------------------------------------------------
// synthetic catalog + facade builders
// ---------------------------------------------------------------------------
const provenance = { source: "test://catalog", fetchedAt: "2026-07-06T00:00:00Z" };

const opEntry = (id: string): CatalogEntry => ({
  id,
  service: "lumenloop",
  kind: "operation",
  description: `test operation ${id}`,
  inputSchema: { type: "object" },
  outputSchema: null,
  transport: { type: "http", method: "GET", path: "/test" },
  provenance
});

const runnableEntry = (id: string, runner: SkillRunner): CatalogEntry =>
  ({
    id,
    service: "skills",
    kind: "skill",
    description: `runnable test skill ${id}`,
    inputSchema: runner.inputSchema,
    outputSchema: runner.outputSchema,
    transport: {
      type: "file",
      url: `https://raw.githubusercontent.com/acme/skills/${"0".repeat(40)}/${id}/SKILL.md`,
      sha: "0".repeat(40),
      sha256: "0".repeat(64)
    },
    provenance,
    runnable: true
  }) as CatalogEntry;

const proseSkillEntry = (id: string): CatalogEntry => ({
  id,
  service: "skills",
  kind: "skill",
  description: `prose skill ${id}`,
  inputSchema: null,
  outputSchema: null,
  transport: {
      type: "file",
      url: `https://raw.githubusercontent.com/acme/skills/${"0".repeat(40)}/${id}/SKILL.md`,
      sha: "0".repeat(40),
      sha256: "0".repeat(64)
    },
  provenance
});

const sectionEntry = (id: string): CatalogEntry => ({
  id,
  service: "skills",
  kind: "skill-section",
  description: `section ${id}`,
  inputSchema: null,
  outputSchema: null,
  transport: null,
  provenance
});

const makeCatalog = (entries: CatalogEntry[]): Catalog => ({
  version: 1,
  generatedAt: "2026-07-06T00:00:00Z",
  entries
});

type StubValue = AdapterResult | ((args: Record<string, unknown>) => AdapterResult);
function stubFacade(map: Record<string, StubValue>): OpsFacade {
  const out: OpsFacade = {};
  for (const [opId, v] of Object.entries(map)) {
    const service = opId.slice(0, opId.indexOf("."));
    const fnName = opId.slice(opId.indexOf(".") + 1);
    (out[service] ??= {})[fnName] = async (args?: unknown) =>
      typeof v === "function" ? v((args ?? {}) as Record<string, unknown>) : v;
  }
  return out;
}

const okData = (data: unknown): AdapterResult => ({ ok: true, data });
const hardError = (message = "upstream 500"): AdapterResult => ({
  ok: false,
  error: { service: "lumenloop", kind: "error", message }
});
const softEmpty = (message = "nothing matched"): AdapterResult => ({
  ok: false,
  error: { service: "lumenloop", kind: "soft-empty", message }
});

/** The real-registry catalog: the runnable entry + every declared op. */
function realCatalog(): Catalog {
  const declaredOps = [...new Set(Object.values(RUNNERS).flatMap((r) => r.ops))];
  return makeCatalog([
    ...declaredOps.map(opEntry),
    runnableEntry(DIGEST_ID, RUNNERS[DIGEST_ID]!),
    proseSkillEntry("skills.lumenloop.stellar-content-auditor"),
    sectionEntry(`${DIGEST_ID}#pipeline`)
  ]);
}

/** Live-fixture facade covering every declared op of the real runner. */
function realFacade(overrides?: Record<string, StubValue>): OpsFacade {
  return stubFacade({
    "lumenloop.search_content_semantic": fxSemantic,
    "lumenloop.list_documents": fxListDocs,
    "lumenloop.find_content_by_entity": fxEntity,
    ...overrides
  });
}

// ---- fake-runner world for dispatcher-behavior tests -----------------------
const FAKE_ID = "skills.test.fake-runner";
const fakeRunner = (over?: Partial<SkillRunner>): SkillRunner => ({
  ops: ["lumenloop.ping"],
  inputSchema: {
    type: "object",
    additionalProperties: false,
    properties: { q: { type: "string" } }
  },
  outputSchema: { type: "object" },
  run: async () => ({ note: "hello" }),
  ...over
});

function fakeWorld(runner: SkillRunner, stubs?: Record<string, StubValue>) {
  const catalog = makeCatalog([
    opEntry("lumenloop.ping"),
    opEntry("lumenloop.other"),
    runnableEntry(FAKE_ID, runner)
  ]);
  const registry = { [FAKE_ID]: runner };
  const facade = stubFacade({ "lumenloop.ping": okData({ pong: true }), "lumenloop.other": okData({}), ...stubs });
  return { catalog, registry, facade };
}

/** Capture skill_run events logEvent writes as console.log JSON lines. */
function captureEvents() {
  const lines: Record<string, unknown>[] = [];
  const spy = vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    try {
      const parsed = JSON.parse(String(args[0]));
      if (parsed && typeof parsed === "object") lines.push(parsed);
    } catch {
      /* non-JSON console noise — ignore */
    }
  });
  return { lines, spy };
}

const errOf = (r: AdapterResult) => (r.ok ? (undefined as never) : r.error);
const dataOf = (r: AdapterResult) => (r.ok ? (r.data as Record<string, any>) : (undefined as never));

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// ===========================================================================
// resolution ladder
// ===========================================================================
describe("runSkill resolution ladder", () => {
  const catalog = realCatalog();

  it("rejects a non-string name as an envelope, never a throw", async () => {
    const r = await runSkill(catalog, RUNNERS, realFacade(), 42, {});
    expect(r.ok).toBe(false);
    expect(errOf(r).service).toBe("skills");
    expect(errOf(r).message).toContain("non-empty string");
  });

  it("unknown id: names ALL runnable ids plus the nearest-id suggestion (never a resolution)", async () => {
    const r = await runSkill(catalog, RUNNERS, realFacade(), "skills.lumenloop.stellar-ecosystem-diges", {
      subject: "RWA"
    });
    expect(r.ok).toBe(false);
    const e = errOf(r);
    expect(e.message).toContain('unknown runnable skill "skills.lumenloop.stellar-ecosystem-diges"');
    expect(e.message).toContain(DIGEST_ID);
    expect(e.message).toContain(`Did you mean "${DIGEST_ID}"?`);
    // The retired dossier runner must not be advertised as runnable.
    expect(e.message).not.toContain("stellar-project-dossier");
  });

  it("suggestion pool is runnable entries ONLY (prose skills never suggested)", async () => {
    // nearest overall would be the prose auditor; the runnable-filtered pool
    // must not offer it.
    const r = await runSkill(catalog, RUNNERS, realFacade(), "skills.lumenloop.stellar-content-auditor2", {});
    expect(r.ok).toBe(false);
    expect(errOf(r).message).not.toContain('Did you mean "skills.lumenloop.stellar-content-auditor"');
    // sanity: the unfiltered store helper WOULD have suggested the prose skill
    expect(nearestSkillId(catalog, "skills.lumenloop.stellar-content-auditor2")).toBe(
      "skills.lumenloop.stellar-content-auditor"
    );
  });

  it("existing but non-runnable skill id → points at codemode.skill.read", async () => {
    const r = await runSkill(catalog, RUNNERS, realFacade(), "skills.lumenloop.stellar-content-auditor", {});
    expect(r.ok).toBe(false);
    const e = errOf(r);
    expect(e.message).toContain('"skills.lumenloop.stellar-content-auditor" is not runnable');
    expect(e.message).toContain(DIGEST_ID);
    expect(e.message).toContain("codemode.skill.read");
  });

  it("a skill-section id is not runnable either", async () => {
    const r = await runSkill(catalog, RUNNERS, realFacade(), `${DIGEST_ID}#pipeline`, {});
    expect(r.ok).toBe(false);
    expect(errOf(r).message).toContain("is not runnable");
  });

  it("invalid input surfaces validateArgs issues — identical UX to operation misuse", async () => {
    const r = await runSkill(catalog, RUNNERS, realFacade(), DIGEST_ID, {});
    expect(r.ok).toBe(false);
    const e = errOf(r);
    expect(e.message).toBe(`invalid arguments for ${DIGEST_ID} — no call was made`);
    expect(e.details).toEqual([{ path: "subject", message: "required" }]);
  });

  it("unknown input keys are refused, never ignored", async () => {
    const r = await runSkill(catalog, RUNNERS, realFacade(), DIGEST_ID, { subject: "RWA", sections: ["x"] });
    expect(r.ok).toBe(false);
    expect(JSON.stringify(errOf(r).details)).toContain("sections");
  });

  it("registry-miss belt: runnable in the catalog but no bundled runner", async () => {
    const r = await runSkill(catalog, {}, realFacade(), DIGEST_ID, { subject: "RWA" });
    expect(r.ok).toBe(false);
    expect(errOf(r).message).toContain("runner is missing from this build");
  });
});

// ===========================================================================
// execution: envelope, ledger, deadline, belts
// ===========================================================================
describe("runSkill execution", () => {
  it("happy digest run (theme mode): service envelope out, host-attached calls, output validates", async () => {
    const { lines } = captureEvents();
    const r = await runSkill(realCatalog(), RUNNERS, realFacade(), DIGEST_ID, { subject: "RWA tokenization" });
    expect(r.ok).toBe(true);
    const data = dataOf(r);
    // theme mode: primary semantic search + upcoming-events list, host-recorded
    expect(data.calls).toHaveLength(2);
    for (const c of data.calls) {
      expect(c.ok).toBe(true);
      expect(c.op).toMatch(/^lumenloop\./);
      expect(typeof c.ms).toBe("number");
    }
    expect(validateArgs(RUNNERS[DIGEST_ID]!.outputSchema, data)).toEqual([]);
    const evt = lines.find((l) => l["evt"] === "skill_run")!;
    expect(evt).toMatchObject({
      id: DIGEST_ID,
      outcome: "ok",
      calls: 2,
      callsOk: 2,
      callsError: 0,
      callsSoftEmpty: 0,
      outputSchemaOk: true
    });
    expect(typeof evt["ms"]).toBe("number");
  });

  it("happy digest run (entity mode) through the same dispatcher", async () => {
    const r = await runSkill(realCatalog(), RUNNERS, realFacade(), DIGEST_ID, {
      subject: "Soroswap",
      subjectType: "entity"
    });
    expect(r.ok).toBe(true);
    const data = dataOf(r);
    expect(data.calls).toEqual([
      { op: "lumenloop.find_content_by_entity", ok: true, ms: expect.any(Number) }
    ]);
    expect(validateArgs(RUNNERS[DIGEST_ID]!.outputSchema, data)).toEqual([]);
  });

  it("runner error-as-data passes through with the LEDGER attached as error.details", async () => {
    const facade = realFacade({ "lumenloop.search_content_semantic": hardError("boom") });
    const r = await runSkill(realCatalog(), RUNNERS, facade, DIGEST_ID, { subject: "RWA tokenization" });
    expect(r.ok).toBe(false);
    const e = errOf(r);
    expect(e.kind).toBe("error");
    expect(e.message).toContain("digest primary call lumenloop.search_content_semantic failed");
    const details = e.details as { op: string; ok: boolean }[];
    expect(details).toHaveLength(2); // the parallel upcoming-events call is ledgered too
    expect(details.filter((c) => !c.ok)).toHaveLength(1);
    expect(details.find((c) => !c.ok)!.op).toBe("lumenloop.search_content_semantic");
  });

  it("a runner's soft-empty error envelope propagates kind + hint and logs outcome soft-empty", async () => {
    const { lines } = captureEvents();
    const runner = fakeRunner({
      run: async () => ({
        ok: false,
        error: {
          service: "skills",
          kind: "soft-empty",
          message: "nothing matched",
          hint: "absence is not evidence of absence"
        }
      })
    });
    const { catalog, registry, facade } = fakeWorld(runner);
    const r = await runSkill(catalog, registry, facade, FAKE_ID, {});
    expect(r.ok).toBe(false);
    expect(errOf(r).kind).toBe("soft-empty");
    expect(errOf(r).hint).toContain("is not evidence");
    expect(lines.find((l) => l["evt"] === "skill_run")!["outcome"]).toBe("soft-empty");
  });

  it("ledger integrity: a runner that swallows errors and forges `calls` cannot corroborate its own lie", async () => {
    const { lines } = captureEvents();
    const liar = fakeRunner({
      run: async (_input, ops) => {
        await ops["lumenloop"]!["ping"]!({}); // errors — swallowed
        return { note: "all good, honest", calls: [{ op: "made-up", ok: true, ms: 0 }] };
      }
    });
    const { catalog, registry, facade } = fakeWorld(liar, { "lumenloop.ping": hardError("dropped call") });
    const r = await runSkill(catalog, registry, facade, FAKE_ID, {});
    expect(r.ok).toBe(true);
    const data = dataOf(r);
    // host ledger overwrites the forged key unconditionally
    expect(data.calls).toHaveLength(1);
    expect(data.calls[0]).toMatchObject({ op: "lumenloop.ping", ok: false, errorKind: "error" });
    const evt = lines.find((l) => l["evt"] === "skill_run")!;
    expect(evt).toMatchObject({ calls: 1, callsOk: 0, callsError: 1, callsSoftEmpty: 0 });
  });

  it("soft-empty constituents are counted as soft-empty in the ledger and event", async () => {
    const { lines } = captureEvents();
    const runner = fakeRunner({
      run: async (_input, ops) => {
        await ops["lumenloop"]!["ping"]!({});
        return { fine: true };
      }
    });
    const { catalog, registry, facade } = fakeWorld(runner, { "lumenloop.ping": softEmpty() });
    const r = await runSkill(catalog, registry, facade, FAKE_ID, {});
    expect(r.ok).toBe(true);
    expect(dataOf(r).calls[0]).toMatchObject({ op: "lumenloop.ping", ok: false, errorKind: "soft-empty" });
    expect(lines.find((l) => l["evt"] === "skill_run")!).toMatchObject({ callsSoftEmpty: 1 });
  });

  it("an undeclared op is absent from the sub-facade and fails loudly (runner-bug envelope)", async () => {
    const runner = fakeRunner({
      // declares only lumenloop.ping; lumenloop.other exists in the FACADE
      // but must not exist in the narrowed sub-facade.
      run: async (_input, ops) => {
        await ops["lumenloop"]!["other"]!({});
        return { fine: true };
      }
    });
    const { catalog, registry, facade } = fakeWorld(runner);
    const r = await runSkill(catalog, registry, facade, FAKE_ID, {});
    expect(r.ok).toBe(false);
    expect(errOf(r).message).toContain("runner bug");
  });

  it("a thrown runner exception becomes a caught error envelope, never a throw", async () => {
    const runner = fakeRunner({
      run: async () => {
        throw new Error("kaboom from inside");
      }
    });
    const { catalog, registry, facade } = fakeWorld(runner);
    const r = await runSkill(catalog, registry, facade, FAKE_ID, {});
    expect(r.ok).toBe(false);
    expect(errOf(r).message).toContain("runner bug");
    expect(errOf(r).message).toContain("kaboom from inside");
  });

  it("a non-object runner result is a runner-bug envelope", async () => {
    const runner = fakeRunner({ run: async () => "just a string" });
    const { catalog, registry, facade } = fakeWorld(runner);
    const r = await runSkill(catalog, registry, facade, FAKE_ID, {});
    expect(r.ok).toBe(false);
    expect(errOf(r).message).toContain("non-object result");
  });

  it("ok:false with a MALFORMED error slot is a runner-bug ERROR envelope, never { ok: true } around a failure shape", async () => {
    const { lines } = captureEvents();
    const runner = fakeRunner({
      run: async (_input, ops) => {
        await ops["lumenloop"]!["ping"]!({});
        return { ok: false, error: "timeout" }; // string error — a runner bug
      }
    });
    const { catalog, registry, facade } = fakeWorld(runner);
    const r = await runSkill(catalog, registry, facade, FAKE_ID, {});
    expect(r.ok).toBe(false); // must NOT ship as a success envelope
    const e = errOf(r);
    expect(e.kind).toBe("error");
    expect(e.message).toContain("malformed error slot");
    expect(e.message).toContain("runner bug");
    // attribution stays host-owned: the ledger rides error.details
    expect(e.details).toEqual([{ op: "lumenloop.ping", ok: true, ms: expect.any(Number) }]);
    expect(lines.find((l) => l["evt"] === "skill_run")!["outcome"]).toBe("error");
  });

  it("shape-drifted digest upcoming-events call: section null, call still ledgered", async () => {
    // §12 row 1 ("shape-drift fixture → section null + ledger entry") at the
    // dispatcher level: the audit guarantee is that a call whose payload the
    // runner discarded as drift can never disappear from the calls report.
    const facade = realFacade({ "lumenloop.list_documents": okData({ weird: 1 }) });
    const r = await runSkill(realCatalog(), RUNNERS, facade, DIGEST_ID, { subject: "RWA tokenization" });
    expect(r.ok).toBe(true);
    const data = dataOf(r);
    expect(data.upcomingEvents).toBeNull();
    expect(data.calls.map((c: { op: string; ok: boolean }) => ({ op: c.op, ok: c.ok }))).toContainEqual({
      op: "lumenloop.list_documents",
      ok: true
    });
  });

  it(`deadline race: a hung runner times out at RUNNER_DEADLINE_MS (${RUNNER_DEADLINE_MS} ms) with an error envelope`, async () => {
    vi.useFakeTimers();
    const runner = fakeRunner({ run: () => new Promise(() => {}) }); // never settles
    const { catalog, registry, facade } = fakeWorld(runner);
    const pending = runSkill(catalog, registry, facade, FAKE_ID, {});
    await vi.advanceTimersByTimeAsync(RUNNER_DEADLINE_MS);
    const r = await pending;
    expect(r.ok).toBe(false);
    expect(errOf(r).message).toContain(`${RUNNER_DEADLINE_MS} ms`);
    expect(errOf(r).message).toContain("continue detached");
  });

  it("redaction belt scrubs runner-composed secret echoes from the aggregate", async () => {
    const SECRET = "sk-live-abcdef1234567890"; // fake, exercises the scrubber — secret-scan:allow
    const runner = fakeRunner({
      run: async () => ({ note: `upstream echoed token=${SECRET} in a composed string` })
    });
    const { catalog, registry, facade } = fakeWorld(runner);
    const r = await runSkill(catalog, registry, facade, FAKE_ID, {}, { secrets: [SECRET] });
    expect(r.ok).toBe(true);
    expect(dataOf(r).note).toContain("[REDACTED]");
    expect(JSON.stringify(r)).not.toContain(SECRET);
  });

  it("outputSchema warn belt: a contract mismatch sets outputSchemaOk false WITHOUT failing the run", async () => {
    const { lines } = captureEvents();
    const runner = fakeRunner({
      outputSchema: {
        type: "object",
        required: ["mandatoryField"],
        properties: { mandatoryField: { type: "string" } }
      },
      run: async () => ({ somethingElse: 1 })
    });
    const { catalog, registry, facade } = fakeWorld(runner);
    const r = await runSkill(catalog, registry, facade, FAKE_ID, {});
    expect(r.ok).toBe(true); // warn-only — the run still ships
    const evt = lines.find((l) => l["evt"] === "skill_run")!;
    expect(evt["outputSchemaOk"]).toBe(false);
    expect(lines.some((l) => l["evt"] === "skill_run_schema_mismatch")).toBe(true);
  });

  it("skill_run event carries exactly the §8 field shape", async () => {
    const { lines } = captureEvents();
    await runSkill(realCatalog(), RUNNERS, realFacade(), DIGEST_ID, { subject: "RWA" });
    const evt = lines.find((l) => l["evt"] === "skill_run")!;
    expect(Object.keys(evt).sort()).toEqual(
      ["evt", "id", "outcome", "ms", "calls", "callsOk", "callsError", "callsSoftEmpty", "outputSchemaOk"].sort()
    );
  });
});

// ===========================================================================
// assertRunnersWired — every drift direction throws
// ===========================================================================
describe("assertRunnersWired", () => {
  it("passes on a consistent catalog/registry pair (the real registry)", () => {
    expect(() => assertRunnersWired(realCatalog(), RUNNERS)).not.toThrow();
  });

  it("throws when a registry key has no runnable skill entry (renamed/retired skill)", () => {
    const catalog = realCatalog();
    catalog.entries = catalog.entries.filter((e) => e.id !== DIGEST_ID);
    expect(() => assertRunnersWired(catalog, RUNNERS)).toThrow(/no runnable skill entry/);
  });

  it("throws when the entry exists but is not flagged runnable", () => {
    const catalog = realCatalog();
    const entry = catalog.entries.find((e) => e.id === DIGEST_ID)! as CatalogEntry & { runnable?: true };
    delete entry.runnable;
    expect(() => assertRunnersWired(catalog, RUNNERS)).toThrow(/no runnable skill entry/);
  });

  it("throws when the manifest marks a skill runnable but no runner is bundled", () => {
    const registry = {}; // digest runner missing
    expect(() => assertRunnersWired(realCatalog(), registry)).toThrow(/no runner is bundled/);
  });

  it("throws on inputSchema inequality (stale manifest vs bundled runner)", () => {
    const catalog = structuredClone(realCatalog());
    const entry = catalog.entries.find((e) => e.id === DIGEST_ID)!;
    entry.inputSchema = { ...entry.inputSchema, extraKeyword: true } as Record<string, unknown>;
    expect(() => assertRunnersWired(catalog, RUNNERS)).toThrow(/inputSchema differs/);
  });

  it("throws on outputSchema inequality", () => {
    const catalog = structuredClone(realCatalog());
    const entry = catalog.entries.find((e) => e.id === DIGEST_ID)!;
    entry.outputSchema = { type: "object" };
    expect(() => assertRunnersWired(catalog, RUNNERS)).toThrow(/outputSchema differs/);
  });

  it("throws when a declared op is not an emitted operation entry (upstream retirement drift)", () => {
    const catalog = realCatalog();
    catalog.entries = catalog.entries.filter((e) => e.id !== "lumenloop.find_content_by_entity");
    expect(() => assertRunnersWired(catalog, RUNNERS)).toThrow(
      /declares op "lumenloop\.find_content_by_entity"/
    );
  });
});
