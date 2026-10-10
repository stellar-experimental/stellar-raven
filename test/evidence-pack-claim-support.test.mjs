import { describe, expect, it } from "vitest";
import {
  buildTranscriptEvidencePack,
  findTranscriptEvidencePackOmissions
} from "../eval/qa/evidence-pack.mjs";

// p7 claim-support fixtures. Every assertion reads the final serialized pack text.
const CASE = {
  question: "What do the returned records say?",
  golden: {
    answer: "Report the returned records with their sources.",
    keyFacts: ["Names the returned records."],
    avoid: []
  },
  tags: { freshness: "live" }
};

function execute(result, extra = {}) {
  const text = typeof result === "string" ? result : JSON.stringify(result);
  return { tool: "mcp__raven__execute", result: text, resultChars: text.length, isError: false, ...extra };
}

function pack(candidateAnswer, transcript, extra = {}) {
  return buildTranscriptEvidencePack({ ...CASE, candidateAnswer, transcript, ...extra });
}

/** The claimSupport section of a final pack, as lines. */
function supportSection(text) {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line.startsWith("claimSupport:"));
  const end = lines.findIndex((line) => line.startsWith("caseSnippets:"));
  return lines.slice(start, end);
}

/** Each support unit as one header line plus its span line. */
function supportUnits(text) {
  const lines = supportSection(text);
  const units = [];
  lines.forEach((line, index) => {
    if (/^\d+\. anchors=/.test(line)) units.push({ header: line, span: lines[index + 1] ?? "" });
  });
  return units;
}

function omissionLine(text) {
  return text.split("\n").find((line) => line.startsWith("claimSupportOmitted:"));
}

function noOmissions(transcript, text, claims) {
  const check = findTranscriptEvidencePackOmissions({ transcript, transcriptEvidence: text, claims });
  return { omittedTerms: check.omittedTerms, omittedProse: check.omittedProse };
}

const filler = (count, prefix = "Routine") =>
  Array.from({ length: count }, (_, index) => ({
    title: `${prefix} record ${index}`,
    url: `https://example.test/${prefix.toLowerCase()}/${index}`,
    summary: `${prefix} context sentence about unrelated ecosystem work. `.repeat(12)
  }));

describe("p7 claim support: replayable coverage", () => {
  it("keeps a late lowercase narrative clause that the answer repeats without quotes", () => {
    const summary =
      `${"The program opened with routine context about grants and events. ".repeat(14)}` +
      "Later the founders moved the team to the coast after the second funding round closed.";
    const transcript = [execute({ projects: [{ title: "Coastal Wallet", summary }, ...filler(20)] })];
    const answer = "Coastal Wallet is a wallet project. The founders moved the team to the coast after the second funding round.";
    const text = pack(answer, transcript);

    expect(text.length).toBeLessThanOrEqual(12000);
    const unit = supportUnits(text).find((item) => item.span.includes("moved the team to the coast after the second funding round"));
    expect(unit?.header).toContain('path="projects[0].summary" source="Coastal Wallet"');
    expect(noOmissions(transcript, text, [answer])).toEqual({ omittedTerms: [], omittedProse: [] });
  });

  it("keeps a quoted lowercase clause that is not a candidate term", () => {
    const content = `${"Quarterly recap text. ".repeat(30)}We published a three-stage plan that's already becoming protocol. ${"More recap. ".repeat(30)}`;
    const transcript = [execute({ articles: [{ title: "Q2 recap", content }] })];
    const answer = 'The recap says the plan is "already becoming protocol," but the CAP is a Draft.';
    const text = pack(answer, transcript);

    expect(supportUnits(text).some((unit) => unit.span.includes("already becoming protocol"))).toBe(true);
    expect(noOmissions(transcript, text, ['Claims the plan is "already becoming protocol"'])).toEqual({
      omittedTerms: [],
      omittedProse: []
    });
  });

  it("keeps both overlapping anchors that sit inside one source window", () => {
    const content =
      "The recommended way to use these is through derive macros: `#[derive(Upgradeable)]` and `#[derive(UpgradeableMigratable)]`. " +
      "Implement `_require_auth` to check the operator. ".repeat(3);
    const transcript = [execute({ sections: [{ section: "module", content }] })];
    const answer = "Use `#[derive(Upgradeable)]` or `#[derive(UpgradeableMigratable)]`, and implement `_require_auth`.";
    const text = pack(answer, transcript);

    const spans = supportUnits(text).map((unit) => unit.span).join("\n");
    expect(spans).toContain("#[derive(Upgradeable)]");
    expect(spans).toContain("#[derive(UpgradeableMigratable)]");
    expect(spans).toContain("_require_auth");
    expect(noOmissions(transcript, text, [answer])).toEqual({ omittedTerms: [], omittedProse: [] });
  });

  it("matches a complete release tag and rejects a prerelease or longer version", () => {
    const transcript = [execute({
      releases: [
        { tag: "v3.5.0-rc.1", note: "Release candidate for the SDK." },
        { tag: "v13.5.0", note: "A different major line." },
        { tag: "v3.5.0", note: "Stable SDK release." },
        { tag: "v2.1.0-rc.2", note: "Only a candidate for the older line." }
      ]
    })];
    const answer = "The SDK shipped v3.5.0 as stable. The older line reached v2.1.0.";
    const text = pack(answer, transcript);
    const units = supportUnits(text);

    const tagged = units.find((unit) => unit.header.includes('"v3.5.0"'));
    expect(tagged?.span).toBe("   span: releases[2]={tag: v3.5.0 | note: Stable SDK release.}");
    expect(units.some((unit) => unit.header.includes('"v2.1.0"'))).toBe(false);
    expect(omissionLine(text)).not.toContain("v2.1.0");
  });

  it("keeps a repository and its commit date in one unit", () => {
    const repos = [
      { fullName: "example/other-sdk", lastCommitAt: "2026-09-12T00:00:00Z", stars: 4 },
      { fullName: "example/js-sdk", lastCommitAt: "2026-09-30T08:00:00Z", stars: 9 },
      { fullName: "example/rust-sdk", lastCommitAt: "2026-08-01T00:00:00Z", stars: 2 }
    ];
    const transcript = [execute({ repos, projects: filler(16) })];
    const answer = "`example/js-sdk` had its last commit on 2026-09-30.";
    const text = pack(answer, transcript);

    const unit = supportUnits(text).find((item) => item.span.includes("2026-09-30"));
    expect(unit?.span).toContain("fullName: example/js-sdk");
    expect(unit?.header).toContain('source="example/js-sdk"');
    expect(noOmissions(transcript, text, [answer])).toEqual({ omittedTerms: [], omittedProse: [] });
  });

  it("gives a secondary anchor its own unit when shortening removes it from the selected span", () => {
    const sentence =
      "The module exposes `UpgradeableInternal` for authorization" +
      " and other things".repeat(20) +
      " while `MigrationHook` runs after the upgrade completes";
    const transcript = [execute({ guide: { content: `${sentence}.` }, projects: filler(30) })];
    const answer = "Implement `UpgradeableInternal`; the `MigrationHook` runs after the upgrade.";
    const text = pack(answer, transcript);
    const units = supportUnits(text);

    expect(units.some((unit) => unit.span.includes("UpgradeableInternal"))).toBe(true);
    expect(units.some((unit) => unit.span.includes("MigrationHook"))).toBe(true);
    // The two anchors are too far apart for one bounded span.
    expect(units.some((unit) => unit.span.includes("UpgradeableInternal") && unit.span.includes("MigrationHook"))).toBe(false);
    expect(omissionLine(text)).toBe("claimSupportOmitted: none");
  });

  it("keeps all fourteen dated prose claims of the synthetic pressure control", () => {
    const claims = Array.from({ length: 14 }, (_, index) => `Claim ${index}: release date is 2026-09-${String(index + 1).padStart(2, "0")}.`);
    const transcript = claims.map((claim, index) => execute({
      name: `Project ${index}`,
      summary: `${"Routine source context. ".repeat(40)}${claim}`,
      date: `2026-09-${String(index + 1).padStart(2, "0")}`
    }));
    const text = pack(claims.join("\n"), transcript);

    expect(text.length).toBeLessThanOrEqual(12000);
    expect(noOmissions(transcript, text, claims)).toEqual({ omittedTerms: [], omittedProse: [] });
  });
});

describe("p7 claim support: controls", () => {
  it("does not support a number from a larger number, a date, or a decimal", () => {
    const transcript = [execute({ grant: { amount: "12,000 USDC", window: "2026-02-20", score: "4.2000" } })];
    const text = pack("The grant was 2,000 USDC and 20 reviewers scored it 2000.", transcript);

    expect(supportUnits(text).some((unit) => /"2,000"|"20"|"2000"/.test(unit.header))).toBe(false);
    expect(omissionLine(text)).toBe("claimSupportOmitted: none");
  });

  it("shows the record that holds an answer number and prefers the claim's own record", () => {
    const transcript = [execute({
      awards: [
        { name: "Beta Vault", amount: "2,000 USDC" },
        { name: "Alpha Bridge", amount: "5,000 USDC", note: "Alpha Bridge also received 2,000 USDC in fees." }
      ]
    })];
    const text = pack("Alpha Bridge received 2,000 USDC.", transcript);
    const unit = supportUnits(text).find((item) => item.header.includes('"2,000 USDC"'));

    expect(unit?.header).toContain('source="Alpha Bridge"');

    const unrelated = pack("Gamma Pool received 2,000 USDC.", transcript);
    const shown = supportUnits(unrelated).find((item) => item.header.includes('"2,000 USDC"'));
    expect(shown?.header).toMatch(/source="(?:Beta Vault|Alpha Bridge)"/);
  });

  it("shows a conflicting second source with its provenance", () => {
    const transcript = [
      execute({ project: { name: "Alpha Bridge", launch: "Alpha Bridge launched on 2026-03-01 on mainnet." } }),
      execute({ project: { name: "Alpha Bridge", launch: "Alpha Bridge launched on 2026-04-01 after an audit delay." } })
    ];
    const text = pack("Alpha Bridge launched on 2026-03-01.", transcript);
    const units = supportUnits(text);

    expect(units.find((unit) => unit.span.includes("2026-03-01"))?.header).toContain("entry=1");
    const other = units.find((unit) => unit.span.includes("2026-04-01"));
    expect(other?.header).toContain("entry=2");
    expect(other?.header).toContain("role=other-source");
  });

  it("keeps support from a clipped JSON string and keeps the truncation footer", () => {
    const visible =
      '{"articles":[{"title":"Ledger history","content":"The archive keeps every checkpoint for seven years and serves them from cold storage';
    const result = `${visible}\n--- SOURCE BASIS ---\nshape: object; 90000 chars; Bulk lost from top-level keys: "articles" ~70.0k chars (cut).`;
    const transcript = [execute(result, { resultChars: 90000 })];
    const answer = 'The archive "keeps every checkpoint for seven years".';
    const text = pack(answer, transcript);
    const unit = supportUnits(text).find((item) => item.span.includes("keeps every checkpoint for seven years"));

    expect(unit?.header).toContain("sourceTruncated=yes");
    expect(unit?.header).toContain('path="visible-json.content(cut)" source="Ledger history"');
    expect(text).toContain("truncation: execute#1: --- SOURCE BASIS ---");
  });

  it("returns no pack when the transcript or its execute results are missing", () => {
    expect(pack("Any answer.", undefined)).toBe("");
    expect(pack("Any answer.", [])).toBe("");
    expect(pack("Any answer.", [{ tool: "mcp__raven__search", result: "{\"hits\":[]}" }])).toBe("");
    expect(pack("Any answer.", [{ tool: "mcp__raven__execute" }])).toBe("");
  });

  it("shows a duplicated source span once and names the other entry", () => {
    const record = { project: { name: "Delta Pay", summary: "Delta Pay settles remittances in under five seconds for retail users." } };
    const transcript = [execute(record), execute(record)];
    const text = pack("Delta Pay settles remittances in under five seconds.", transcript);
    const matching = supportUnits(text).filter((unit) => unit.span.includes("settles remittances in under five seconds"));

    expect(matching).toHaveLength(1);
    expect(matching[0].header).toContain("alsoIn=2");
  });

  it("marks support from an errored execute result", () => {
    const transcript = [execute("Execution failed: lumenloop.get_project returned 404 for slug delta-pay", { isError: true })];
    const text = pack("The lookup for delta-pay returned 404.", transcript);

    expect(supportUnits(text).find((unit) => unit.span.includes("404"))?.header).toContain("outcome=error");
  });

  it("records omissions when the evidence cannot fit the budget", () => {
    const records = Array.from({ length: 30 }, (_, index) => ({
      name: `Project ${index}`,
      note: `Project ${index} closed its pilot with partner number ${1000 + index} after review.`
    }));
    const transcript = [execute({ records })];
    const answer = records.map((record) => record.note).join("\n");
    const text = pack(answer, transcript, { maxChars: 3000 });
    const header = supportSection(text)[0];
    const [, anchors, matched, shown] = header.match(/anchors=(\d+); transcriptMatched=(\d+); shown=(\d+)/).map(Number);
    const omitted = Number(omissionLine(text).match(/claimSupportOmitted: (\d+)/)?.[1] ?? 0);

    expect(text.length).toBeLessThanOrEqual(3000);
    expect(anchors).toBeGreaterThanOrEqual(matched);
    expect(omitted).toBeGreaterThan(0);
    expect(shown + omitted).toBe(matched);
  });

  it("keeps stable rows without a pack", () => {
    const transcript = [execute({ project: { name: "Delta Pay" } })];
    expect(pack("Delta Pay.", transcript, { tags: { freshness: "stable" } })).toBe("");
  });

  it("selects judge input without reading any verdict", () => {
    const transcript = [execute({ project: { name: "Delta Pay", summary: "Delta Pay settles remittances." } })];
    const input = { ...CASE, candidateAnswer: "Delta Pay settles remittances.", transcript };
    const withVerdict = buildTranscriptEvidencePack({
      ...input,
      verdict: { wrongClaims: ["Delta Pay settles remittances."] },
      wrongClaims: ["Delta Pay settles remittances."]
    });

    expect(withVerdict).toBe(buildTranscriptEvidencePack(input));
  });

  it("is deterministic", () => {
    const transcript = [execute({ projects: filler(25) }), execute({ projects: filler(25, "Second") })];
    const answer = "Routine record 3 and Second record 7 describe unrelated ecosystem work.";
    expect(pack(answer, transcript)).toBe(pack(answer, transcript));
  });
});
