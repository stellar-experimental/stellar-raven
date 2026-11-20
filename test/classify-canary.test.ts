/** Canary verdict classifier tests (scripts/classify-canary.mjs). */
import { describe, expect, it } from "vitest";
// @ts-expect-error — plain .mjs script, no type declarations
import { classifyCanary, STALE_AFTER_MS } from "../scripts/classify-canary.mjs";

const NOW = Date.parse("2026-07-30T12:00:00.000Z");
const at = (msAgo: number) =>
  JSON.stringify({ ok: true, checkedAt: new Date(NOW - msAgo).toISOString(), checked: 30, ms: 900, error: null });

const classify = (status: string, body: string) => classifyCanary({ status, body, now: NOW });

describe("classifyCanary", () => {
  it("clean: a fresh ok verdict", () => {
    expect(classify("200", at(10 * 60 * 1000))).toBe("clean");
  });

  it("failing: the Worker reported ok:false", () => {
    const body = JSON.stringify({
      ok: false,
      checkedAt: new Date(NOW).toISOString(),
      checked: 3,
      ms: 400,
      error: "could not fetch https://raw.githubusercontent.com/…: fetch failed"
    });
    expect(classify("503", body)).toBe("failing");
  });

  it("stale: ok:true but older than the window — the detector stopped", () => {
    // The dangerous case. A verdict frozen when the cron died still says
    // ok:true, so age is the only thing separating "healthy" from "blind".
    expect(classify("200", at(STALE_AFTER_MS + 60_000))).toBe("stale");
    expect(classify("200", at(STALE_AFTER_MS - 60_000))).toBe("clean");
  });

  it("error, never a domain verdict, when the check itself could not conclude", () => {
    // Each of these once tempted a shortcut that would have asserted an outage.
    expect(classify("000", "")).toBe("error"); // curl failed entirely
    expect(classify("502", "<html>bad gateway</html>")).toBe("error"); // edge error, not our app
    expect(classify("200", "not json")).toBe("error"); // garbled body
    expect(classify("200", "null")).toBe("error"); // valid JSON, useless
    expect(classify("200", JSON.stringify({ ok: true }))).toBe("error"); // no checkedAt
    expect(classify("200", JSON.stringify({ ok: true, checkedAt: "nonsense" }))).toBe("error");
  });

  it("error on a future timestamp rather than trusting it as fresh", () => {
    // Clock skew or a garbled field. `now - checkedAt` goes negative, which
    // trivially passes any `age > window` test — so a naive check would call
    // an unbounded-future verdict the freshest possible reading.
    expect(classify("200", at(-60 * 60 * 1000))).toBe("error");
    // Small skew between the Worker and the runner is normal, not an error.
    expect(classify("200", at(-60 * 1000))).toBe("clean");
  });

  it("the endpoint's real no-record body is an error, never an outage", () => {
    // Returned on first deploy before the first cron or when KV throws; must be error, not failing.
    const noRecord = JSON.stringify({ ok: false, reason: "no usable canary verdict recorded" });
    expect(classify("503", noRecord)).toBe("error");
  });

  it("an OLD failure is stale, not a current outage", () => {
    // An ok:false from months ago proves the detector stopped, not that
    // retrieval is broken now. Checking `ok` before age conflated the two.
    const old = JSON.stringify({
      ok: false,
      checkedAt: new Date(NOW - STALE_AFTER_MS - 60_000).toISOString(),
      error: "could not fetch"
    });
    expect(classify("503", old)).toBe("stale");
  });

  it("rejects status/body disagreement in both directions", () => {
    // If the status and the body disagree, something rewrote one of them and
    // neither is trustworthy — so neither may drive a domain verdict.
    const fresh = (ok: boolean) => JSON.stringify({ ok, checkedAt: new Date(NOW).toISOString() });
    expect(classify("503", fresh(true))).toBe("error");
    expect(classify("200", fresh(false))).toBe("error");
    // ...and the agreeing pairs still work.
    expect(classify("200", fresh(true))).toBe("clean");
    expect(classify("503", fresh(false))).toBe("failing");
  });

  it("rejects a structurally invalid record", () => {
    expect(classify("503", JSON.stringify({}))).toBe("error");
    expect(classify("200", JSON.stringify([]))).toBe("error");
    expect(classify("200", JSON.stringify({ ok: "yes", checkedAt: new Date(NOW).toISOString() }))).toBe("error");
  });
});
