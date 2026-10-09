import { env } from "cloudflare:test";
import { afterEach, expect, it, vi } from "vitest";
import { createExecuteRunner } from "../../src/executor/run";
import { SOURCE_BASIS_MANIFEST_MAX_CHARS } from "../../src/policy/source-basis";

const run = createExecuteRunner(env as unknown as Env, { modelBoundaryMaxTokens: 1000 });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const cases = [
  { name: "one source", args: { sources: "cap" }, reason: undefined, ok: true, wire: "cap" },
  { name: "several sources", args: { sources: "cap,sep,dev-docs" }, reason: undefined, ok: true, wire: "cap,sep,dev-docs" },
  { name: "whitespace and empty parts", args: { sources: " , cap , , sep, " }, reason: undefined, ok: true, wire: "cap,sep" },
  { name: "unknown source", args: { sources: "cap,unknown" }, reason: "invalid-args: sources", ok: false },
  { name: "existing source alias", args: { source: "cap, sep" }, reason: undefined, ok: true, wire: "cap,sep" }
] as const;

it.each(cases)("executes the documented comma form: $name", async ({ args, reason, ok, ...testCase }) => {
  vi.spyOn(Date, "now").mockReturnValue(1000);
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
    if ("wire" in testCase) expect(url.searchParams.get("sources")).toBe(testCase.wire);
    expect(url.searchParams.has("source")).toBe(false);
    return Response.json({ results: [{ id: "cap-1" }] });
  });
  vi.stubGlobal("fetch", fetchMock);
  const outcome = await run(`async () => {
    const r = await scout.searchResearch(${JSON.stringify({ q: "base reserve", ...args })});
    return { ok: r.ok, pad: "x".repeat(6000) };
  }`);
  if (!outcome.ok) throw new Error(outcome.error);
  expect(outcome.result).toContain(`"ok":${ok}`);
  expect(fetchMock).toHaveBeenCalledTimes(ok ? 1 : 0);
  expect(outcome.sourceBasis?.calls[0]?.reason).toBe(reason);
  expect(outcome.result.split("\n").find((line) => line.startsWith("calls:"))).toBe(
    `calls: scout.searchResearch=${ok ? "ok" : "error"}/0ms${reason ? ` [${reason}]` : ""} (totals ok=${ok ? 1 : 0} error=${ok ? 0 : 1} soft-empty=0)`
  );
});

it("keeps a rejection reason after truncation drops its branch", async () => {
  vi.spyOn(Date, "now").mockReturnValue(1000);
  const outcome = await run(`async () => {
    const rejected = await scout.searchResearch({ q: "base reserve", sources: ["unknown"] });
    return { pad: "x".repeat(6000), rejected };
  }`);
  if (!outcome.ok) throw new Error(outcome.error);
  expect(outcome.truncated).toBe(true);
  expect(outcome.result.slice(0, 4000)).not.toContain('"rejected"');
  expect(outcome.result.split("\n").find((line) => line.startsWith("calls:"))).toBe(
    "calls: scout.searchResearch=error/0ms [invalid-args: sources] (totals ok=0 error=1 soft-empty=0)"
  );
});

it.each([
  { name: "filtered HTTP failure", timeout: false, pad: true, reason: "http-404" },
  { name: "filtered timeout", timeout: true, pad: true, reason: "timeout" },
  { name: "compact filtered HTTP failure", timeout: false, pad: false, reason: "http-404" }
])("keeps the reason for $name", async ({ timeout, pad, reason }) => {
  vi.spyOn(Date, "now").mockReturnValue(1000);
  vi.stubGlobal("fetch", async () => {
    if (timeout) throw new DOMException("timeout https://example.test/?key=smoke-test-lumenloop-key", "TimeoutError");
    return Response.json({ error: "private upstream body https://example.test/?key=smoke-test-lumenloop-key" }, { status: 404 });
  });
  const outcome = await run(`async () => {
    const docs = [];
    const d = await lumenloop.get_document({ collection: "articles", id: 123 });
    if (d.ok) docs.push(d.data);
    return { docs${pad ? ', pad: "x".repeat(6000)' : ""} };
  }`);
  if (!outcome.ok) throw new Error(outcome.error);
  expect(outcome.truncated).toBe(pad);
  expect(outcome.result).toContain('"docs":[]');
  expect(outcome.result.split("\n").find((line) => line.startsWith("calls:"))).toBe(
    `calls: lumenloop.get_document=error/0ms [${reason}] (totals ok=0 error=1 soft-empty=0)`
  );
  expect(outcome.result).toContain("--- SOURCE BASIS ---");
  expect(outcome.result).not.toContain("private upstream body");
  expect(outcome.result).not.toContain("example.test");
  expect(outcome.result).not.toContain("smoke-test-lumenloop-key");
  const block = outcome.result.slice(outcome.result.lastIndexOf("--- SOURCE BASIS ---"));
  expect(block.length).toBeLessThanOrEqual(SOURCE_BASIS_MANIFEST_MAX_CHARS);
});
