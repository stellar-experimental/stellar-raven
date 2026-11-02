/**
 * Golden source sentinels (eval/qa/source-sentinels.mjs): offline checks of validation,
 * normalization, the three check kinds, fetch reuse, and the deterministic issue report.
 * A fake fetch stands in for every network call.
 */
import { describe, expect, it } from "vitest";
import {
  SCHEMA,
  evaluate,
  fetchUrl,
  loadBatteryCases,
  normalize,
  renderReport,
  runSentinels,
  validateSentinels
} from "../eval/qa/source-sentinels.mjs";
import { readFileSync } from "node:fs";

const cases = new Map([
  ["q-a", { asOf: "2026-11-02", state: "active" }],
  ["q-retired", { asOf: "2026-11-02", state: "retired" }]
]);
const sentinel = (over = {}) => ({
  id: "a-fact",
  caseId: "q-a",
  caseAsOf: "2026-11-02",
  url: "https://example.org/page",
  check: { kind: "present", pattern: "Deadline: November 9" },
  ...over
});
const doc = (...sentinels) => ({ schema: SCHEMA, sentinels });

describe("validateSentinels", () => {
  it("accepts a well-formed sentinel", () => {
    expect(validateSentinels(doc(sentinel()), cases)).toEqual({ problems: [], stale: [] });
  });

  it("reports a re-verified case as stale instead of as an error", () => {
    expect(validateSentinels(doc(sentinel({ caseAsOf: "2026-10-01" })), cases)).toEqual({ problems: [], stale: ["a-fact"] });
  });

  it("rejects unknown or retired cases, bad patterns, pinned URLs, and malformed counts", () => {
    const { problems } = validateSentinels(
      doc(
        sentinel({ id: "unknown-case", caseId: "q-missing" }),
        sentinel({ id: "retired-case", caseId: "q-retired" }),
        sentinel({ id: "bad-pattern", check: { kind: "present", pattern: "(" } }),
        sentinel({ id: "pinned", url: "https://github.com/o/r/blob/0123456789abcdef0123456789abcdef01234567/f.md" }),
        sentinel({ id: "bad-count", check: { kind: "count", pattern: "x" } }),
        sentinel({ id: "stray-count", check: { kind: "present", pattern: "x", count: 2 } }),
        sentinel({ id: "a-fact" }),
        sentinel({ id: "a-fact" })
      ),
      cases
    );
    expect(problems.join("\n")).toMatch(/unknown-case.*not a battery case/);
    expect(problems.join("\n")).toMatch(/retired-case.*case is retired/);
    expect(problems.join("\n")).toMatch(/bad-pattern.*valid regular expression/);
    expect(problems.join("\n")).toMatch(/pinned.*cannot drift/);
    expect(problems.join("\n")).toMatch(/bad-count.*non-negative integer/);
    expect(problems.join("\n")).toMatch(/stray-count.*only to a count check/);
    expect(problems.join("\n")).toMatch(/duplicate id/);
  });
});

describe("normalize and evaluate", () => {
  it("reads server-rendered HTML and JSON payload text as one line", () => {
    const html = '<div>SCF #46</div>\n<p>Deadline:&nbsp;November&#32;9</p><script>{\\"x\\":\\"Mainnet\\u0020live\\"}</script>';
    expect(normalize(html)).toBe(' SCF #46 Deadline: November 9 {"x":"Mainnet live"} ');
  });

  it("keeps literal angle brackets outside HTML", () => {
    const json = '[{"ghsa_id":"GHSA-1","summary":"Vec<T> bound"},{"ghsa_id":"GHSA-2","summary":"x > y"}]';
    expect(evaluate({ kind: "count", pattern: '"ghsa_id": ?"GHSA-', count: 2 }, normalize(json, { html: false }))).toEqual({
      verdict: "hold",
      matches: 2
    });
  });

  it("applies present, absent, and count checks", () => {
    const text = "Status: Draft. Row ✅ | Row ✅ |";
    expect(evaluate({ kind: "present", pattern: "Status: Draft" }, text).verdict).toBe("hold");
    expect(evaluate({ kind: "present", pattern: "Status: Final" }, text).verdict).toBe("drift");
    expect(evaluate({ kind: "absent", pattern: "ML-DSA" }, text).verdict).toBe("hold");
    expect(evaluate({ kind: "absent", pattern: "draft", flags: "i" }, text)).toEqual({ verdict: "drift", matches: 1 });
    expect(evaluate({ kind: "count", pattern: "✅ \\|", count: 3 }, text)).toEqual({ verdict: "drift", matches: 2 });
  });

  it("reads GitHub blob URLs as raw files", () => {
    expect(fetchUrl("https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0055.md#status")).toBe(
      "https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0055.md"
    );
    expect(fetchUrl("https://example.org/a#b")).toBe("https://example.org/a");
  });
});

describe("runSentinels and renderReport", () => {
  const page = (body, type = "text/html") => ({ ok: true, status: 200, headers: new Headers({ "content-type": type }), text: async () => body });

  it("fetches each URL once and separates drift from read errors", async () => {
    const calls = [];
    const fakeFetch = async (url) => {
      calls.push(url);
      if (url.includes("down")) return { ok: false, status: 404, headers: new Headers(), text: async () => "" };
      return page("<p>Deadline: November 8</p>");
    };
    const results = await runSentinels(
      [sentinel({ id: "deadline" }), sentinel({ id: "old-deadline", check: { kind: "present", pattern: "November 8" } }), sentinel({ id: "gone", url: "https://down.example/x" })],
      fakeFetch
    );
    expect(calls).toEqual(["https://example.org/page", "https://down.example/x"]);
    expect(results.map((r) => [r.id, r.verdict])).toEqual([
      ["deadline", "drift"],
      ["old-deadline", "hold"],
      ["gone", "error"]
    ]);

    const report = renderReport(results, "abc123");
    expect(report.drift).toBe(1);
    expect(report.errors).toBe(1);
    expect(report.markdown.split("\n")[0]).toBe(`<!-- golden-sentinels-report fingerprint=${report.fingerprint} -->`);
    expect(report.markdown).toContain("| `deadline` | `q-a` | https://example.org/page | anchor no longer matches |");
    expect(report.markdown).toContain("- `gone`: HTTP 404");
  });

  it("fingerprints only the drift set, so read errors cannot churn the issue", () => {
    const drift = { id: "x", caseId: "q-a", url: "u", kind: "present", verdict: "drift", matches: 0 };
    const error = { id: "y", caseId: "q-a", url: "u", kind: "present", verdict: "error", detail: "HTTP 503" };
    expect(renderReport([drift, error]).fingerprint).toBe(renderReport([drift]).fingerprint);
    expect(renderReport([drift]).fingerprint).not.toBe(renderReport([]).fingerprint);
  });
});

describe("committed sentinel set", () => {
  it("passes validation against the battery with no stale sentinel", () => {
    const committed = JSON.parse(readFileSync(new URL("../eval/qa/source-sentinels.json", import.meta.url), "utf8"));
    expect(validateSentinels(committed, loadBatteryCases())).toEqual({ problems: [], stale: [] });
  });
});
