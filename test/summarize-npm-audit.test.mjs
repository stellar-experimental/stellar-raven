import { describe, expect, it } from "vitest";
import { MARKER, fingerprint, normalizeAudit, renderReport } from "../scripts/summarize-npm-audit.mjs";

const advisory = (id, severity = "high") => ({
  source: 1,
  name: "pkg",
  dependency: "pkg",
  title: `advisory ${id}`,
  url: `https://github.com/advisories/${id}`,
  severity,
  range: "<2.0.0"
});

const report = (vulnerabilities) => ({
  auditReportVersion: 2,
  vulnerabilities,
  metadata: { vulnerabilities: {} }
});

const sample = () =>
  report({
    "zeta-lib": {
      name: "zeta-lib",
      severity: "moderate",
      isDirect: false,
      via: [advisory("GHSA-bbbb-2222-zzzz", "moderate"), advisory("GHSA-aaaa-1111-yyyy", "low")],
      effects: ["alpha-tool"],
      range: "1.0.0 || >=1.5.0",
      fixAvailable: true
    },
    "alpha-tool": {
      name: "alpha-tool",
      severity: "high",
      isDirect: true,
      via: ["zeta-lib", "beta-lib", "zeta-lib"],
      effects: [],
      range: "<=3.0.0",
      fixAvailable: { name: "alpha-tool", version: "4.0.0", isSemVerMajor: true }
    },
    "beta-lib": {
      name: "beta-lib",
      severity: "high",
      isDirect: false,
      via: [advisory("GHSA-cccc-3333-xxxx")],
      effects: ["alpha-tool"],
      range: "<1.2.0",
      fixAvailable: false
    }
  });

describe("npm audit report", () => {
  it("orders findings by severity, then package, with sorted and de-duplicated sources", () => {
    const findings = normalizeAudit(sample());
    expect(findings.map((f) => f.name)).toEqual(["alpha-tool", "beta-lib", "zeta-lib"]);
    expect(findings[0]).toMatchObject({ direct: true, via: ["beta-lib", "zeta-lib"], advisories: [] });
    expect(findings[2].advisories).toEqual(["GHSA-aaaa-1111-yyyy", "GHSA-bbbb-2222-zzzz"]);
    expect(findings.map((f) => f.fix)).toEqual(["`alpha-tool@4.0.0` (major)", "none", "available"]);
  });

  it("gives the same fingerprint and body when npm lists the same findings in another order", () => {
    const original = sample();
    const reordered = report(Object.fromEntries(Object.entries(original.vulnerabilities).reverse()));
    reordered.vulnerabilities["zeta-lib"].via.reverse();
    const a = renderReport(normalizeAudit(original), { commit: "abc1234" });
    const b = renderReport(normalizeAudit(reordered), { commit: "abc1234" });
    expect(b.fingerprint).toBe(a.fingerprint);
    expect(b.body).toBe(a.body);
  });

  it("changes the fingerprint when an advisory or a fix changes", () => {
    const base = fingerprint(normalizeAudit(sample()));
    const added = sample();
    added.vulnerabilities["beta-lib"].via.push(advisory("GHSA-dddd-4444-wwww"));
    const fixed = sample();
    fixed.vulnerabilities["beta-lib"].fixAvailable = { name: "beta-lib", version: "1.2.0", isSemVerMajor: false };
    expect(fingerprint(normalizeAudit(added))).not.toBe(base);
    expect(fingerprint(normalizeAudit(fixed))).not.toBe(base);
  });

  it("puts the marker and fingerprint first and escapes pipes inside table cells", () => {
    const { body, fingerprint: print, findings } = renderReport(normalizeAudit(sample()), { commit: "abc1234" });
    expect(findings).toBe(3);
    expect(body.split("\n")[0]).toBe(`<!-- ${MARKER} fingerprint=${print} -->`);
    expect(body).toContain("3 vulnerable packages in `package-lock.json`: 2 high, 1 moderate.");
    expect(body).toContain("`1.0.0 \\|\\| >=1.5.0`");
    expect(body).toContain("[GHSA-cccc-3333-xxxx](https://github.com/advisories/GHSA-cccc-3333-xxxx)");
    expect(body).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  it("reports a clean audit with zero findings", () => {
    const { body, findings } = renderReport(normalizeAudit(report({})));
    expect(findings).toBe(0);
    expect(body).toContain("`npm audit` reports no vulnerable packages in `package-lock.json`.");
  });

  it("rejects npm error objects and unknown report shapes instead of reporting a clean audit", () => {
    expect(() => normalizeAudit({ error: { code: "ENOLOCK", summary: "requires a lockfile" } })).toThrow(/ENOLOCK/);
    expect(() => normalizeAudit({ auditReportVersion: 1, advisories: {} })).toThrow(/auditReportVersion/);
    expect(() => normalizeAudit({ auditReportVersion: 2 })).toThrow(/vulnerabilities/);
    const bad = sample();
    bad.vulnerabilities["beta-lib"].severity = "severe";
    expect(() => normalizeAudit(bad)).toThrow(/unknown severity/);
  });
});
