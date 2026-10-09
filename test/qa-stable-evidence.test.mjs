import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { describe, expect, it, vi } from "vitest";
import { diagnoseArtifact, diagnoseRow, main } from "../eval/qa/diagnose-stable-evidence.mjs";

import * as sanitizer from "../eval/qa/evidence-sanitizer.mjs";

const execute = (result, extra = {}) => ({ tool: "mcp__raven__execute", result, ...extra });
const row = (claim, transcript, answer = claim) => ({
  id: "stable-example",
  tags: { freshness: "stable" },
  answer,
  verdict: { score: "wrong", wrongClaims: [claim] },
  evidencePack: { text: "", packVersion: "p6" },
  transcript
});

describe("offline stable evidence diagnostic", () => {
  it("reports per-claim exact and prose matches without changing any saved field", () => {
    const input = row('Claims "the project supports recurring monthly payments" without evidence.', [
      execute(JSON.stringify({ description: "The project supports recurring monthly payments." }))
    ]);
    input.verdict.wrongClaims.push("Claims `latestRelease` is available without evidence.");
    input.answer = "The project supports recurring monthly payments. The latestRelease field is available.";
    input.transcript.push(execute('{"latestRelease":"v3.5.0"}'));
    const before = JSON.stringify(input);
    const result = diagnoseRow(input);
    expect(result.claims.map((claim) => claim.status)).toEqual(["prose-match", "term-match"]);
    expect(result.claims[0].matches[0]).toMatchObject({ transcriptIndex: 0, supportedProse: 1 });
    expect(result.claims[1].matches[0]).toMatchObject({ transcriptIndex: 1, terms: ["latestRelease"] });
    expect(JSON.stringify(input)).toBe(before);
  });

  it("reports unsupported and unprobeable claims as uncertainty", () => {
    const unsupported = diagnoseRow(row("Claims `missingMethod` exists.", [execute('{"name":"Other"}')]));
    expect(unsupported.claims[0]).toMatchObject({ status: "uncertain", reason: "no-match-in-saved-evidence" });
    expect(diagnoseRow(row("It works.", [execute("Other evidence.")])).claims[0].reason).toBe("no-probes");
  });

  it.each([
    ['{"value":"visible"}\n--- SOURCE BASIS ---\ntruncated=true', {}],
    ['{"value":"visible"}\n--- TRUNCATED ---\nmore', {}],
    ['{"value":"visible"}', { resultChars: 2000 }]
  ])("keeps truncation uncertainty and checks the visible evidence", (body, extra) => {
    const result = diagnoseRow(row("Claims `hiddenMethod` exists.", [execute(body, extra)]));
    expect(result.evidenceLosses).toEqual(["entry-0:truncated-result"]);
    expect(result.claims[0]).toMatchObject({ status: "uncertain", reason: "incomplete-evidence" });
    const visible = diagnoseRow(row("Claims `visible` exists.", [execute(body, extra)]));
    expect(visible.claims[0].status).toBe("term-match");
    expect(visible.evidenceLosses).toEqual(["entry-0:truncated-result"]);
  });

  it("distinguishes absent transcripts, absent results, and explicit empty transcripts", () => {
    expect(diagnoseRow(row("Claims `methodName` exists.")).claims[0].reason).toBe("missing-transcript");
    expect(diagnoseRow(row("Claims `methodName` exists.", [])).claims[0].reason).toBe("no-execute-results");
    const missing = diagnoseRow(row("Claims `methodName` exists.", [{ tool: "execute" }]));
    expect(missing.evidenceLosses).toEqual(["entry-0:missing-result"]);
    expect(missing.claims[0].reason).toBe("incomplete-evidence");
  });

  it("excludes inputs, search results, errors, provenance, and console output", () => {
    const result = diagnoseRow(row("Claims `methodName` exists.", [
      { tool: "search", result: "methodName" },
      execute("{}", { input: "methodName" }),
      execute("methodName", { isError: true }),
      execute("Execution failed: methodName"),
      execute("{}\n--- SOURCE METADATA ---\nmethodName"),
      execute("{}\n\n--- console (1) ---\nmethodName")
    ]));
    expect(result.claims[0].matches).toEqual([]);
    expect(result.claims[0].status).toBe("uncertain");
  });

  it("does not treat a matching number as proof of the full claim", () => {
    const result = diagnoseRow(row("Claims 125 people founded the project without evidence.", [
      execute('{"unrelatedCount":125}')
    ]));
    expect(result.claims[0]).toMatchObject({ status: "term-match", reason: "fragment-match", numberOnly: true });
    expect(result.claims[0].matches[0]).toMatchObject({ terms: ["125"], supportedProse: 0 });
    expect(diagnoseRow(row("Claims 125 people.", [execute('{"count":1250}')])).claims[0].status).toBe("uncertain");
  });

  it("excludes a golden-only number from candidate support", () => {
    const input = row(
      "Candidate states SStream is 'not SCF-funded', contradicting the golden's SCF #16 provenance.",
      [execute('{"round":16}')],
      "SStream is not SCF-funded."
    );
    const result = diagnoseArtifact({ rows: [input] });
    expect(result.rows[0].claims[0]).toMatchObject({
      status: "uncertain", reason: "judge-text-only", matches: [],
      excludedMatches: [{ transcriptIndex: 0, reason: "judge-text-only", terms: ["16"], prose: [] }]
    });
    expect(result.summary).toMatchObject({ termMatches: 0, numberOnlyMatches: 0, judgeTextOnly: 1, uncertain: 1 });
  });

  it("excludes judge-only prose while retaining an answer term", () => {
    const input = row(
      'Claims `releaseTag` exists but the golden says "the project supports recurring monthly payments".',
      [execute('{"releaseTag":"v1","summary":"The project supports recurring monthly payments."}')],
      "The releaseTag field exists."
    );
    const claim = diagnoseRow(input).claims[0];
    expect(claim.status).toBe("term-match");
    expect(claim.matches[0]).toMatchObject({ terms: ["releaseTag"], prose: [] });
    expect(claim.excludedMatches[0]).toMatchObject({ reason: "judge-text-only", prose: ["the project supports recurring monthly payments"] });
  });

  it("counts number-only matches separately from prose and other terms", () => {
    const result = diagnoseArtifact({ rows: [
      row("Claims 125 people without evidence.", [execute('{"count":125}')], "There are 125 people."),
      row("Claims `methodName` exists.", [execute('{"methodName":true}')], "Use `methodName`.")
    ] });
    expect(result.summary).toMatchObject({ termMatches: 2, numberOnlyMatches: 1, proseMatches: 0 });
  });

  it("does not infer candidate support when the saved answer is missing", () => {
    const input = row("Claims `methodName` exists.", [execute('{"methodName":true}')]);
    delete input.answer;
    expect(diagnoseRow(input).claims[0]).toMatchObject({ status: "uncertain", reason: "missing-answer", matches: [] });
  });

  it("recognizes a date and an identifier before sentence-final periods", () => {
    const input = row(
      "Claims `getLedger` was released on 2025-09-26 without evidence.",
      [execute('{"method":"getLedger","released":"2025-09-26"}')],
      "Released 2025-09-26. Use getLedger."
    );
    const before = JSON.stringify(input);
    const claim = diagnoseRow(input).claims[0];
    expect(claim.status).toBe("term-match");
    expect(claim.answerTerms).toEqual(expect.arrayContaining(["getLedger", "2025-09-26"]));
    expect(claim.matches[0].terms).toEqual(expect.arrayContaining(["getLedger", "2025-09-26"]));
    expect(claim.excludedMatches).toEqual([]);
    expect(JSON.stringify(input)).toBe(before);
    const longerTokens = { ...input, answer: "Released 2025-09-26.99. Use getLedger.details." };
    expect(diagnoseRow(longerTokens).claims[0].matches).toEqual([]);
  });

  it("selects saved stable tags and preserves rows without claims", () => {
    const stable = row("Claims `methodName` exists.", []);
    const live = { ...stable, id: "live", tags: { freshness: "live" } };
    const unknown = { ...stable, id: "unknown", tags: undefined };
    const noClaims = { ...stable, id: "no-claims", verdict: { wrongClaims: [] } };
    const input = { rows: [stable, live, unknown, noClaims] };
    expect(diagnoseArtifact(input).summary).toEqual({
      savedRows: 4, selectedRows: 2, rowsWithoutClaims: 1, skippedById: 0,
      skippedFreshness: 2, unknownFreshness: 1, claims: 1, proseMatches: 0, termMatches: 0, numberOnlyMatches: 0, judgeTextOnly: 0, uncertain: 1
    });
    expect(diagnoseArtifact(input, { allFreshness: true, ids: ["live"] }).rows.map((r) => r.id)).toEqual(["live"]);
  });

  it("runs the CLI read-only, reports skipped files, and redacts saved credentials", () => {
    const directory = mkdtempSync(join(tmpdir(), "qa-stable-evidence-"));
    try {
      const source = join(directory, "qa.json");
      const input = JSON.stringify({ rows: [row("API_KEY=example-private-value", [])] });
      writeFileSync(source, input);
      writeFileSync(join(directory, "plan.json"), JSON.stringify({ rows: [{ id: "example" }] }));
      const output = execFileSync(process.execPath, ["eval/qa/diagnose-stable-evidence.mjs", directory], { encoding: "utf8" });
      const report = JSON.parse(output);
      expect(report.artifacts).toHaveLength(1);
      expect(report.artifacts[0].sourceSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(report.skipped[0].reason).toBe("not-saved-qa-rows");
      expect(output).not.toContain("example-private-value");
      expect(readFileSync(source, "utf8")).toBe(input);
      for (const args of [["--help", source], [source, "-h"], ["--help", "/missing/file.json"]]) {
        const help = execFileSync(process.execPath, ["eval/qa/diagnose-stable-evidence.mjs", ...args], { encoding: "utf8" });
        expect(help).toContain("Usage:");
      }
      const failed = spawnSync(process.execPath, ["eval/qa/diagnose-stable-evidence.mjs", source, "--out", source]);
      expect(failed.status).toBe(1);
      expect(readFileSync(source, "utf8")).toBe(input);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
  it("emits a sanitizer sentinel without parsing it", () => {
    const directory = mkdtempSync(join(tmpdir(), "qa-stable-sentinel-"));
    const sanitize = vi.spyOn(sanitizer, "sanitizeCliEvidenceText").mockReturnValue("[redacted]");
    const output = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      expect(() => main([directory])).not.toThrow();
      expect(output).toHaveBeenCalledWith("[redacted]");
    } finally {
      output.mockRestore();
      sanitize.mockRestore();
      rmSync(directory, { recursive: true, force: true });
    }
  });

});
