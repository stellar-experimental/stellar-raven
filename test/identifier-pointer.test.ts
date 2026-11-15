/**
 * Item 5: the pointer before a research call. When a call's string argument names a joined or
 * hyphenated identifier of a declared document series and no call to that series' operation names
 * it, the EVIDENCE CHECKPOINT adds one generated sentence. The series come from the manifest, the
 * token rule is amendment A6's, and nothing in the host names a standard.
 */
import { describe, expect, it, vi } from "vitest";
// run.ts is Worker-only; these cases need only its pure hint builder, not the sandbox.
vi.mock("cloudflare:workers", () => ({ tracing: { trace: async (_name: string, fn: () => unknown) => fn() } }));
vi.mock("@cloudflare/codemode", () => ({ DynamicWorkerExecutor: class DynamicWorkerExecutor {} }));

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { documentSeriesOf } from "../src/catalog/document-series.ts";
import { loadManifest } from "../src/catalog/search.ts";
import type { CatalogEntry } from "../src/catalog/types.ts";
import {
  MAX_IDENTIFIER_POINTERS,
  evidenceRecoveryHint,
  identifierPointersOf,
  summarizeOperationLedger
} from "../src/executor/run.ts";
import { buildSandbox, exactRowsOf, type OpLedgerCall } from "../src/executor/providers.ts";
import type { FetchLike } from "../src/adapters/types.ts";
import { evidenceCheckpointBlock, pointersOnlyHint } from "../src/policy/evidence-checkpoint.ts";
import { identifierTokens, identifiersInArguments } from "../src/policy/identifier-token.ts";
import { lazyPinnedSkillSource as skillSource } from "./helpers/skill-source.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8"));
const catalog = loadManifest(RAW);
const RESEARCH = "scout.searchResearch";
const SERIES = new Set(["sep", "cap", "paper", "lumenloop", "audit", "incident", "release"]);

const token = (text: string) => identifiersInArguments(text, SERIES)[0]!;
const call = (op: string, query?: string, extra: Partial<OpLedgerCall> = {}): OpLedgerCall => ({
  op,
  outcome: "ok",
  hasServiceData: true,
  ms: 0,
  ...(query === undefined ? {} : { identifiers: identifiersInArguments({ query }, SERIES) }),
  ...extra
});
const hintOf = (ledger: OpLedgerCall[]) => evidenceRecoveryHint(ledger, summarizeOperationLedger(ledger));
const sentence = (id: string, series = id.replace(/[-\d]+$/, "").toLowerCase()) =>
  `If \`${id}\` names a document, \`${RESEARCH}\` holds documents of source \`${series}\`: call it with \`{ q: "${id}", source: "${series}" }\`. A row it marks exact is the document itself.`;

describe("the series come from the manifest", () => {
  it("records the research operation's plain-letter `source` values, and no other operation", () => {
    const withSeries = catalog.entries.filter((entry) => entry.documentSeries);
    expect(withSeries.map((entry) => entry.id)).toEqual([RESEARCH]);
    const series = withSeries[0]!.documentSeries!;
    expect(series).toMatchObject({ filter: "source", query: "q" });
    const upstream = (RAW.entries.find((entry: { id: string }) => entry.id === RESEARCH).inputSchema.properties.source.enum as string[]);
    expect(series.values).toEqual(upstream.filter((value) => /^[a-z]+$/.test(value)));
    expect(series.values).toEqual(expect.arrayContaining(["sep", "cap"]));
    expect(series.values).not.toContain("sdf-blog");
  });

  const synthetic = (patch: Record<string, unknown>) => {
    const entry = RAW.entries.find((candidate: { id: string }) => candidate.id === RESEARCH);
    return { ...entry, ...patch } as CatalogEntry;
  };
  const withInput = (source: unknown, extra: Record<string, unknown> = {}) => {
    const entry = RAW.entries.find((candidate: { id: string }) => candidate.id === RESEARCH);
    return synthetic({ inputSchema: { ...entry.inputSchema, properties: { ...entry.inputSchema.properties, source, ...extra } } });
  };

  it("needs an input enum, a string query, rows that carry `source` and `url`, and a candidate lane", () => {
    expect(documentSeriesOf(synthetic({}))).not.toBeNull();
    expect(documentSeriesOf(withInput({ type: "string" }))).toBeNull();
    expect(documentSeriesOf(withInput({ type: "string", enum: ["sep"] }, { q: { type: "number" }, query: { type: "number" } }))).toBeNull();
    expect(documentSeriesOf(withInput({ type: "string", enum: ["sdf-blog", "a1"] }))).toBeNull();
    expect(documentSeriesOf(synthetic({ retrievalProfile: { lane: "directory", emptyScope: "operation", recoverWith: [] } }))).toBeNull();
    const noUrl = { type: "object", properties: { results: { type: "array", items: { properties: { source: { type: "string" } } } } } };
    expect(documentSeriesOf(synthetic({ outputSchema: noUrl }))).toBeNull();
    expect(documentSeriesOf({ ...synthetic({}), kind: "skill" } as CatalogEntry)).toBeNull();
  });

  it("fails the manifest check when the recorded series is not what the schemas declare", () => {
    const edit = (change: (entry: Record<string, any>) => void) => {
      const copy = structuredClone(RAW);
      change(copy.entries.find((entry: { id: string }) => entry.id === RESEARCH));
      return () => loadManifest(copy);
    };
    expect(edit(() => undefined)).not.toThrow();
    expect(edit((entry) => delete entry.documentSeries)).toThrow(/document series of scout.searchResearch/);
    expect(edit((entry) => entry.documentSeries.values.push("zzz"))).toThrow(/document series/);
    expect(edit((entry) => (entry.documentSeries.filter = "severity"))).toThrow(/document series/);
    expect(edit((entry) => delete entry.inputSchema.properties.source.enum)).toThrow(/document series/);
    const other = structuredClone(RAW);
    other.entries.find((entry: { id: string }) => entry.id === "scout.getRfps").documentSeries = { filter: "status", query: "q", values: ["open"] };
    expect(() => loadManifest(other)).toThrow(/document series of scout.getRfps/);
  });
});

describe("the token rule (amendment A6)", () => {
  it("accepts a hyphenated or joined token, and reads zero padding as the same number", () => {
    expect(identifierTokens("SEP-45 and CAP-0046 and sep24", { joinedOnly: true }).map(({ letters, number }) => `${letters}-${number}`)).toEqual([
      "sep-45",
      "cap-46",
      "sep-24"
    ]);
  });

  it.each(["audit 2024", "release 23", "incident 2023", "paper 1", "SEP 45", "version 2"])("does not read %j as an identifier", (phrase) => {
    expect(identifiersInArguments({ query: phrase }, SERIES)).toEqual([]);
  });

  it.each(["CVE-2024-1234", "SEP-43.1", "protocol-23.2"])("does not read the longer identifier %j", (text) => {
    expect(identifiersInArguments(text, SERIES)).toEqual([]);
  });

  it("arm 2's spaced form is unchanged: a query may say `SEP 45`", () => {
    expect(identifierTokens("SEP 45 and sep-45 and sep45", { joinedOnly: false }).map(({ letters, number }) => `${letters}-${number}`)).toEqual([
      "sep-45",
      "sep-45",
      "sep-45"
    ]);
    const research = catalog.entries.find((entry) => entry.id === RESEARCH)!;
    const row = { source: "sep", url: "https://example.org/sep-0045" };
    expect(exactRowsOf(research, { q: "SEP 45 contract auth" }, { results: [row] })).toHaveLength(1);
    expect(exactRowsOf(research, { q: "audit 45" }, { results: [row] })).toEqual([]);
  });

  it("bounds the digits to six, so a token echoed twice cannot be long (review F1)", () => {
    const long = `SEP-${"0".repeat(200)}45`;
    expect(identifiersInArguments(long, SERIES)).toEqual([]);
    expect(identifiersInArguments(`sep${"9".repeat(50)}`, SERIES)).toEqual([]);
    expect(identifiersInArguments("seven digits SEP-1234567", SERIES)).toEqual([]);
    expect(identifiersInArguments("SEP-123456 and CAP-0046", SERIES).map((t) => t.text)).toEqual(["SEP-123456", "CAP-0046"]);
    expect(hintOf([call("stellarDocs.search_docs", long)])?.identifier).toBeUndefined();
  });

  it("does not read a token whose letters are title case: all-upper and all-lower are identifiers (review F2)", () => {
    for (const joinedOnly of [true, false]) {
      const read = (text: string) => identifierTokens(text, { joinedOnly }).map((t) => t.text);
      expect(read("Sep-24 Cap-12 Sep24")).toEqual([]);
      expect(read("SEP-24 and sep-24 and CAP12")).toEqual(["SEP-24", "sep-24", "CAP12"]);
    }
    expect(identifierTokens("Sep 24", { joinedOnly: false })).toEqual([]);
    expect(identifierTokens("SEP 24 and sep 24", { joinedOnly: false })).toHaveLength(2);
    // Known and accepted: an all-upper month joined to digits (`10-SEP-2024`) still reads as SEP-2024.
    expect(identifiersInArguments("10-Sep-2024 and 2024-Sep-10", SERIES)).toEqual([]);
    // The pointer does not fire on a month, and fires on both ways a standard is written.
    expect(hintOf([call("stellarDocs.search_docs", "Sep-24")])?.identifier).toBeUndefined();
    expect(hintOf([call("stellarDocs.search_docs", "SEP-24")])?.identifier).toHaveLength(1);
    expect(hintOf([call("stellarDocs.search_docs", "sep-24")])?.identifier).toHaveLength(1);
  });

  it("arm 2 does not mark an exact row for a title-case query, and still does for SEP-24 and sep-24", () => {
    const research = catalog.entries.find((entry) => entry.id === RESEARCH)!;
    const row = { source: "sep", url: "https://example.org/sep-0024" };
    expect(exactRowsOf(research, { q: "Sep-24" }, { results: [row] })).toEqual([]);
    expect(exactRowsOf(research, { q: "Sep 24 event" }, { results: [row] })).toEqual([]);
    expect(exactRowsOf(research, { q: "SEP-24" }, { results: [row] })).toHaveLength(1);
    expect(exactRowsOf(research, { q: "sep-24" }, { results: [row] })).toHaveLength(1);
  });

  it("reads nested string values only, and only the letters of a declared series", () => {
    expect(
      identifiersInArguments({ a: ["x", { b: "see SEP-10" }], SEP99: "keys are not read", n: 45, c: "cve-2024 and abc-5" }, SERIES).map((t) => t.text)
    ).toEqual(["SEP-10"]);
  });
});

describe("the pointer", () => {
  it("fires for a call that names a series identifier, with the frozen sentence", () => {
    const ledger = [call("stellarDocs.search_docs", "SEP-45 contract auth")];
    expect(hintOf(ledger)?.identifier).toEqual([
      { target: RESEARCH, filter: "source", query: "q", series: "sep", token: "SEP-45" }
    ]);
    expect(evidenceCheckpointBlock(hintOf(ledger))).toContain(` ${sentence("SEP-45")} `);
    // Alone, the block is the sentence and nothing else.
    expect(evidenceCheckpointBlock({ mode: "pointers-only", sourceOperations: [], candidates: [], identifier: hintOf(ledger)!.identifier })).toBe(
      `\n\n--- EVIDENCE CHECKPOINT ---\n${sentence("SEP-45")}`
    );
  });

  it("carries the identifier as the call wrote it", () => {
    expect(evidenceCheckpointBlock(hintOf([call("stellarDocs.search_docs", "CAP-0046 host functions")]))).toContain(sentence("CAP-0046"));
    expect(evidenceCheckpointBlock(hintOf([call("stellarDocs.search_docs", "sep24 flow")]))).toContain(sentence("sep24"));
  });

  it("does not fire on tokens that are not identifiers", () => {
    for (const phrase of ["audit 2024", "release 23", "incident 2023", "paper 1", "SEP 45", "CVE-2024-1234", "SEP-43.1"]) {
      expect(hintOf([call("stellarDocs.search_docs", phrase)])?.identifier).toBeUndefined();
    }
  });

  it("fires for a series name joined to digits: the host cannot tell a numbered series from a dated one", () => {
    // `audit-2024` is a joined token of a declared series. The manifest does not say which series are
    // numbered, and no list is kept. The read lists every firing whose series is not sep or cap.
    expect(hintOf([call("stellarDocs.search_docs", "audit-2024")])?.identifier).toHaveLength(1);
  });

  it("stays silent when a research call names the identifier, however it spelled it", () => {
    for (const named of ["SEP-45", "sep-45", "SEP-0045", "sep45", "CAP-1 SEP-45"]) {
      const ledger = [call("stellarDocs.search_docs", "SEP-45"), call(RESEARCH, named)];
      expect(hintOf(ledger)?.identifier).toBeUndefined();
    }
  });

  it("stays silent when the identifier was answered by an exact row", () => {
    const answered = call(RESEARCH, "SEP-45", { exactRows: [{ index: 0, key: "sep-45", url: "https://example.org/sep-0045" }] });
    expect(hintOf([call("stellarDocs.search_docs", "SEP-45"), answered])?.identifier).toBeUndefined();
  });

  it("counts a research call that failed, soft-emptied or was refused as naming it", () => {
    for (const outcome of ["error", "soft-empty"] as const) {
      const ledger = [call("stellarDocs.search_docs", "SEP-45"), call(RESEARCH, "SEP-45", { outcome, hasServiceData: false })];
      expect(hintOf(ledger)?.identifier).toBeUndefined();
    }
  });

  it("names a document that may not exist, and claims nothing about it", () => {
    const block = evidenceCheckpointBlock(hintOf([call("stellarDocs.search_docs", "SEP-99999")]));
    expect(block).toContain(sentence("SEP-99999"));
    expect(block).not.toMatch(/exists|is the standard|not found|no such/i);
  });

  it("answers only the identifiers research did not name, in a script that mixes lanes", () => {
    const ledger = [
      call("stellarDocs.search_docs", "SEP-45 and CAP-46"),
      call("scout.listAudits"),
      call("lumenloop.search_content_semantic", "sep-10"),
      call(RESEARCH, "CAP-46 host functions")
    ];
    expect(hintOf(ledger)?.identifier?.map((pointer) => pointer.token)).toEqual(["SEP-45", "sep-10"]);
    const block = evidenceCheckpointBlock(hintOf(ledger));
    expect(block).toContain(sentence("SEP-45"));
    expect(block).toContain(sentence("sep-10"));
    expect(block).not.toContain("CAP-46");
  });

  it("is one sentence per identifier, at most three, in order of first appearance", () => {
    const ledger = [call("stellarDocs.search_docs", "SEP-1 SEP-2 SEP-3 SEP-4 SEP-1"), call("lumenloop.search_content_semantic", "CAP-9")];
    const pointers = identifierPointersOf(catalog, ledger);
    expect(MAX_IDENTIFIER_POINTERS).toBe(3);
    expect(pointers.map((pointer) => pointer.token)).toEqual(["SEP-1", "SEP-2", "SEP-3"]);
  });

  it("reads every outcome: a refused or failed call that named it still counts", () => {
    const refused: OpLedgerCall = { op: "stellarDocs.search_docs", outcome: "error", reason: "invalid", ms: 0, identifiers: [token("SEP-45")] };
    expect(hintOf([refused])?.identifier).toHaveLength(1);
  });

  it("leaves a result without such an identifier byte-identical", () => {
    const plain = [call("stellarDocs.search_docs", "stellar accounts"), call("scout.listAudits", "OtterSec")];
    const before = hintOf(plain);
    expect(before?.identifier).toBeUndefined();
    expect(evidenceCheckpointBlock(before)).not.toContain("names a document");
    expect(hintOf([call("stellarDocs.search_docs")])).toEqual(hintOf([call("stellarDocs.search_docs", "no token here")]));
    expect(evidenceCheckpointBlock(hintOf([call("scout.listAudits", "OtterSec")]))).toBe(
      evidenceCheckpointBlock(hintOf([{ ...call("scout.listAudits"), identifiers: [] }]))
    );
  });

  it("sits with the detail sentence and ahead of an alternatives sentence", () => {
    const ledger = [{ ...call("stellarDocs.search_docs", "SEP-45"), detailReady: ["stellarDocs.get_doc_page"] }];
    const block = evidenceCheckpointBlock(hintOf(ledger));
    expect(block.indexOf("returned sections of pages")).toBeGreaterThan(0);
    expect(block.indexOf("returned sections of pages")).toBeLessThan(block.indexOf("If `SEP-45`"));
    const broad = hintOf([call("lumenloop.search_content_semantic", "SEP-45")]);
    expect(broad?.candidates.length).toBeGreaterThan(0);
    const withAlternatives = evidenceCheckpointBlock(broad);
    expect(withAlternatives.indexOf("If `SEP-45`")).toBeGreaterThan(0);
    expect(withAlternatives.indexOf("If `SEP-45`")).toBeLessThan(withAlternatives.indexOf("The host observed"));
  });

  it("travels in the Playground without spending its recovery-advice cycle", () => {
    const hint = hintOf([call("stellarDocs.search_docs", "SEP-45")]);
    const pointers = pointersOnlyHint(hint);
    expect(pointers).toMatchObject({ mode: "pointers-only", candidates: [], identifier: [{ token: "SEP-45" }] });
    expect(pointersOnlyHint(undefined)).toBeNull();
    expect(pointersOnlyHint({ mode: "narrow-only", sourceOperations: [], candidates: [] })).toBeNull();
  });
});

describe("the ledger", () => {
  /** Runs one call against a fixed response and returns the ledger it left. */
  async function ledgerOf(namespace: string, name: string, args: unknown, response: Response): Promise<OpLedgerCall[]> {
    const ledger: OpLedgerCall[] = [];
    const fetchImpl: FetchLike = async () => response;
    const fns = buildSandbox(catalog, skillSource, {}, { fetchImpl, onOpCall: (entry) => ledger.push(entry) }).find(
      (provider) => provider.name === namespace
    )!.fns;
    await fns[name]!(args);
    return ledger;
  }

  it("records the series identifiers a call's string arguments name, on an ok call", async () => {
    const ledger = await ledgerOf("stellarDocs", "search_docs", { query: "SEP-45 and sep 24 and audit 2024" }, Response.json({ hits: [] }));
    expect(ledger).toHaveLength(1);
    expect(ledger[0]!.identifiers?.map((t) => t.text)).toEqual(["SEP-45"]);
  });

  it("records them on a failed call, and records nothing for a call that names none", async () => {
    const failed = await ledgerOf("stellarDocs", "search_docs", { query: "CAP-46" }, new Response("no", { status: 500 }));
    expect(failed[0]).toMatchObject({ outcome: "error" });
    expect(failed[0]!.identifiers?.map((t) => t.text)).toEqual(["CAP-46"]);
    const none = await ledgerOf("stellarDocs", "search_docs", { query: "stellar accounts" }, Response.json({ hits: [] }));
    expect("identifiers" in none[0]!).toBe(false);
  });
});
