/**
 * Golden source sentinels (eval/qa/source-sentinels.mjs): offline checks of validation,
 * normalization, the three check kinds, fetch reuse, and the deterministic issue report.
 * A fake fetch stands in for every network call.
 */
import { describe, expect, it } from "vitest";
import {
  SCHEMA,
  carryDrift,
  evaluate,
  fetchUrl,
  loadBatteryCases,
  normalize,
  previousDrift,
  renderReport,
  runSentinels,
  validateSentinels
} from "../eval/qa/source-sentinels.mjs";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

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
        sentinel({ id: "raw-pinned", url: "https://raw.githubusercontent.com/o/r/0123456789abcdef0123456789abcdef01234567/f.md" }),
        sentinel({ id: "unguarded-absent", check: { kind: "absent", pattern: "x402" } }),
        sentinel({ id: "bad-guard", check: { kind: "absent", pattern: "x402", guard: "(" } }),
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
    expect(problems.join("\n")).toMatch(/\(pinned\).*cannot drift/);
    expect(problems.join("\n")).toMatch(/raw-pinned.*cannot drift/);
    expect(problems.join("\n")).toMatch(/unguarded-absent.*needs a guard/);
    expect(problems.join("\n")).toMatch(/bad-guard.*guard must be/);
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
    expect(normalize(json, { html: false })).toContain('"summary":"Vec<T> bound"');
    expect(normalize(json)).not.toContain("Vec<T>");
  });

  it("keeps a page readable when it carries an out-of-range numeric entity", () => {
    expect(normalize("<p>Deadline: November 9</p>&#99999999;&#x110000;&#8212;")).toBe(" Deadline: November 9 &#99999999;&#x110000;—");
  });

  it("reports an unrecognized page as an error when a guard fails, never as a hold", () => {
    const check = { kind: "absent", pattern: "x402", guard: "\\| \\[SEP-0001\\]" };
    expect(evaluate(check, "")).toMatchObject({ verdict: "error" });
    expect(evaluate(check, "Just a moment... verify you are human")).toMatchObject({ verdict: "error" });
    expect(evaluate(check, "| [SEP-0001](sep-0001.md) | Stellar Info File |")).toEqual({ verdict: "hold", matches: 0 });
    expect(evaluate(check, "| [SEP-0001](sep-0001.md) | x402 payments |")).toEqual({ verdict: "drift", matches: 1 });
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
    expect(report.markdown.split("\n")[0]).toBe(`<!-- golden-sentinels-report fingerprint=${report.fingerprint} drift=deadline:0 -->`);
    expect(report.markdown).toContain("| `deadline` | `q-a` | https://example.org/page | anchor no longer matches |");
    expect(report.markdown).toContain("- `gone`: HTTP 404");
  });

  it("fingerprints only the drift set, so read errors cannot churn the issue", () => {
    const drift = { id: "x", caseId: "q-a", url: "u", kind: "present", verdict: "drift", matches: 0 };
    const error = { id: "y", caseId: "q-a", url: "u", kind: "present", verdict: "error", detail: "HTTP 503" };
    expect(renderReport([drift, error]).fingerprint).toBe(renderReport([drift]).fingerprint);
    expect(renderReport([drift]).fingerprint).not.toBe(renderReport([]).fingerprint);
  });

  it("keeps a drifted sentinel in the drift set while its source is unreadable", () => {
    const a = { id: "a", caseId: "q-a", url: "u", kind: "count", expectedCount: 7, verdict: "drift", matches: 9 };
    const b = { id: "b", caseId: "q-a", url: "u", kind: "present", verdict: "drift", matches: 0 };
    const first = renderReport([a, b]);
    expect(first.markdown.split("\n")[0]).toBe(`<!-- golden-sentinels-report fingerprint=${first.fingerprint} drift=a:9,b:0 -->`);

    const flaky = { ...a, verdict: "error", matches: undefined, detail: "HTTP 503" };
    const second = renderReport(carryDrift([flaky, b], previousDrift(first.markdown)));
    expect(second.fingerprint).toBe(first.fingerprint);
    expect(second.errors).toBe(0);
    expect(second.markdown).toContain("expected 7 matches, found 9 (previous run; unreadable now: HTTP 503)");

    const unrelated = { id: "c", caseId: "q-a", url: "u", kind: "present", verdict: "error", detail: "HTTP 503" };
    expect(carryDrift([unrelated], previousDrift(first.markdown))).toEqual([unrelated]);
    expect(previousDrift("")).toEqual(new Map());
    expect(previousDrift("an issue body a person edited")).toEqual(new Map());
  });

  it("reports a stale sentinel as unread without fetching it", async () => {
    const calls = [];
    const fakeFetch = async (url) => (calls.push(url), page("<p>Deadline: November 9</p>"));
    const results = await runSentinels([sentinel({ id: "stale-one" })], fakeFetch, new Map([["stale-one", "stale"]]));
    expect(calls).toEqual([]);
    expect(results).toMatchObject([{ id: "stale-one", verdict: "error", detail: "stale" }]);
  });
});

describe("committed sentinel set", () => {
  const committed = JSON.parse(readFileSync(new URL("../eval/qa/source-sentinels.json", import.meta.url), "utf8"));
  const byId = (id) => committed.sentinels.find((s) => s.id === id).check;

  it("passes validation against the battery with no stale sentinel", () => {
    expect(validateSentinels(committed, loadBatteryCases())).toEqual({ problems: [], stale: [] });
  });

  it("binds the Chief Scientist title to Mazières's own team card", () => {
    const card = (title, description) => `{"_type":"card","description":"${description}","image":{"url":"x"},"title":"${title}"}`;
    const check = byId("mazieres-chief-scientist");
    expect(evaluate(check, card("David Mazières", "Founder and Chief Scientist")).verdict).toBe("hold");
    expect(evaluate(check, card("Someone Else", "Founder and Chief Scientist") + card("David Mazières", "Founder")).verdict).toBe("drift");
  });

  it("binds the Go SDK recommendation to the go-stellar-sdk repository", () => {
    const check = byId("go-sdk-module");
    const text = (repo) => `This SDK is split up into separate packages, all of which you can find in the \`,_jsx(_components.a,{href:\`https://github.com/stellar/${repo}\``;
    expect(evaluate(check, text("go-stellar-sdk")).verdict).toBe("hold");
    expect(evaluate(check, text("go") + " go-stellar-sdk is deprecated").verdict).toBe("drift");
  });

  it("rejects a renamed Go module that only extends the old name", () => {
    const text = "all of which you can find in the https://github.com/stellar/go-stellar-sdk-v2";
    expect(evaluate(byId("go-sdk-module"), text).verdict).toBe("drift");
  });

  it("requires the Session intent next to Charge on the MPP page", () => {
    const check = byId("mpp-payment-intents");
    expect(evaluate(check, "supports two payment intents: Charge One-time payments. Session The session intent enables").verdict).toBe("hold");
    expect(evaluate(check, "supports two payment intents: Charge One-time payments. Nav: MPP Session Guide").verdict).toBe("drift");
  });

  it("detects a replaced archive provider that keeps the row count", () => {
    const header = "| Provider | Futurenet | Testnet | Mainnet | Dedicated Nodes | RPC Archive | ";
    const row = (name) => `| [${name}](https://x) | ❌ | ✅ | ✅ | ✅ | ✅ | `;
    const roster = ["Validation Cloud\\*", "Gateway\\*", "Ankr", "Obsrvr\\*", "OnFinality\\*", "Lightsail Network - Quasar\\*", "Exaion", "GetBlock", "node101"];
    const page = (names) => header + names.map(row).join("");
    expect(evaluate(byId("rpc-archive-provider-names"), page(roster)).verdict).toBe("hold");
    expect(evaluate(byId("rpc-archive-provider-rows"), page(roster)).verdict).toBe("hold");
    const replaced = [...roster.slice(0, 8), "NewCo"];
    expect(evaluate(byId("rpc-archive-provider-names"), page(replaced))).toEqual({ verdict: "drift", matches: 8 });
    expect(evaluate(byId("rpc-archive-provider-rows"), page(replaced)).verdict).toBe("hold");
    expect(evaluate(byId("rpc-archive-provider-rows"), page(roster).replace("Dedicated Nodes | ", "")).verdict).toBe("error");
  });
});

describe("CLI", () => {
  const cli = (...args) => spawnSync(process.execPath, ["eval/qa/source-sentinels.mjs", ...args], { encoding: "utf8" });
  const dir = mkdtempSync(path.join(tmpdir(), "sentinels-"));
  const committed = JSON.parse(readFileSync(new URL("../eval/qa/source-sentinels.json", import.meta.url), "utf8"));
  const staleFile = path.join(dir, "stale.json");
  writeFileSync(staleFile, JSON.stringify({ schema: SCHEMA, sentinels: [{ ...committed.sentinels[0], caseAsOf: "2000-01-01" }] }));

  it("fails --check on a stale sentinel", () => {
    const run = cli("--check", "--sentinels", staleFile);
    expect(run.status).toBe(1);
    expect(run.stderr).toContain("stale sentinel");
  });

  it("reports a stale sentinel as unread in report mode, without a fetch", () => {
    const report = path.join(dir, "report.md");
    const run = cli("--sentinels", staleFile, "--report", report, "--commit", "abc");
    expect(run.status).toBe(0);
    expect(run.stdout.trim().split("\n")).toEqual([
      "drift=0",
      "errors=1",
      `fingerprint=${renderReport([]).fingerprint}`
    ]);
    expect(readFileSync(report, "utf8")).toContain("stale: the case was re-verified");
  });

  it("rejects an unknown sentinel id before any fetch", () => {
    const run = cli("--ids", "no-such-sentinel");
    expect(run.status).toBe(1);
    expect(run.stderr).toContain("unknown sentinel id no-such-sentinel");
  });
});
