/**
 * shapeLogs tests for the redact-first, clip-second ordering that keeps a
 * secret straddling the clip boundary from leaking its prefix, plus the line
 * cap, dropped-lines footer, and lossy-only telemetry.
 */
import { describe, expect, it, vi } from "vitest";
import { shapeLogs, MAX_LOG_LINES, MAX_LOG_LINE_CHARS } from "../src/executor/shape-logs.ts";

const CLIP_MARKER = "… [log line clipped]";

describe("shapeLogs — redact then clip", () => {
  it("a secret straddling the clip boundary leaks NO prefix (redaction runs first)", () => {
    const secret = "LEAKYSECRET_" + "z".repeat(24); // 36 chars, distinctive prefix
    // Straddle MAX_LOG_LINE_CHARS: the secret starts a few chars before the
    // boundary and ends well after it. Clip-then-redact would leave the ~6
    // pre-boundary chars ("LEAKY…") un-scrubbed; redact-then-clip does not.
    const line = "a".repeat(MAX_LOG_LINE_CHARS - 6) + secret + "b".repeat(40);
    const out = shapeLogs([line], [secret], () => {})[0]!;
    expect(out).not.toContain("LEAKY");
    expect(out).not.toContain(secret);
    expect(out.endsWith(CLIP_MARKER)).toBe(true);
  });

  it("replaces secrets on lines short enough to survive un-clipped", () => {
    const secret = "PLAINSECRET_1234"; // secret-scan:allow — synthetic fixture
    const [out] = shapeLogs([`token=${secret} done`], [secret], () => {});
    expect(out).toBe("token=[REDACTED] done");
  });
});

describe("shapeLogs — structural caps", () => {
  it("clips over-long lines with a marker and leaves short ones untouched", () => {
    const long = "x".repeat(MAX_LOG_LINE_CHARS + 500);
    const [a, b] = shapeLogs([long, "short line"], [], () => {}) as [string, string];
    expect(a.endsWith(CLIP_MARKER)).toBe(true);
    expect(a.length).toBe(MAX_LOG_LINE_CHARS + CLIP_MARKER.length);
    expect(b).toBe("short line");
  });

  it("caps line COUNT and appends a dropped-lines footer", () => {
    const logs = Array.from({ length: MAX_LOG_LINES + 25 }, (_, i) => `line ${i}`);
    const out = shapeLogs(logs, [], () => {});
    expect(out).toHaveLength(MAX_LOG_LINES + 1); // kept lines + footer
    expect(out[out.length - 1]).toBe("… [25 more log lines dropped]");
  });

  it("returns [] for undefined logs", () => {
    expect(shapeLogs(undefined, [], () => {})).toEqual([]);
  });
});

describe("shapeLogs — telemetry", () => {
  it("emits execute_logs_shaped ONLY when something is actually lost", () => {
    const emit = vi.fn();
    shapeLogs(["fine", "also fine"], [], emit);
    expect(emit).not.toHaveBeenCalled();

    const lossy = Array.from(
      { length: MAX_LOG_LINES + 3 },
      () => "y".repeat(MAX_LOG_LINE_CHARS + 1)
    );
    shapeLogs(lossy, [], emit);
    expect(emit).toHaveBeenCalledTimes(1);
    const [evt, fields] = emit.mock.calls[0] as [string, Record<string, number>];
    expect(evt).toBe("execute_logs_shaped");
    expect(fields.totalLines).toBe(MAX_LOG_LINES + 3);
    expect(fields.dropped).toBe(3);
    expect(fields.clipped).toBe(MAX_LOG_LINES); // only the kept lines are inspected/clipped
  });
});
