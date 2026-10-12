import { describe, expect, it } from "vitest";
import {
  buildTranscriptEvidencePack,
  entityListClaims,
  entityListCoverage,
  explainTranscriptEvidencePack,
  findTranscriptEvidencePackOmissions,
  packSourceEvidenceText
} from "../eval/qa/evidence-pack.mjs";

// Claim-support fixtures (p7 anchors, p8 fallback and audit, p9 entity lists). Assertions read the
// final serialized pack text; omission checks read the audit-only metadata.
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

const audits = new Map();

function pack(candidateAnswer, transcript, extra = {}) {
  const { text, audit } = explainTranscriptEvidencePack({ ...CASE, candidateAnswer, transcript, ...extra });
  expect(buildTranscriptEvidencePack({ ...CASE, candidateAnswer, transcript, ...extra })).toBe(text);
  audits.set(text, audit);
  return text;
}

/** The claimSupport section of a final pack, as lines. */
function supportSection(text) {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line.startsWith("claimSupport:"));
  const end = lines.findIndex((line) => line.startsWith("caseSnippets:"));
  return lines.slice(start, end);
}

/**
 * Each support unit as its header line and span line. The anchors and claim words that selected a
 * unit are audit-only, so `labels` comes from the audit of the same pack, in the same order.
 */
function supportUnits(text) {
  const lines = supportSection(text);
  const units = [];
  lines.forEach((line, index) => {
    if (/^\d+\. entry=/.test(line)) units.push({ header: line, span: lines[index + 1] ?? "" });
  });
  const audited = audits.get(text)?.units ?? [];
  units.forEach((unit, index) => {
    unit.labels = audited[index] ? [...audited[index].anchors, ...audited[index].claimWords] : [];
  });
  return units;
}

/** Audit-only omitted anchors for the same input. They never appear in the judge pack. */
function omitted(candidateAnswer, transcript, extra = {}) {
  const { text, audit } = explainTranscriptEvidencePack({ ...CASE, candidateAnswer, transcript, ...extra });
  expect(text).not.toContain("claimSupportOmitted");
  return audit.omitted.map((item) => item.anchor);
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

describe("claim support: replayable coverage", () => {
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
    const audited = omitted(answer, transcript);
    const units = supportUnits(text);

    const tagged = units.find((unit) => unit.labels.includes("v3.5.0"));
    expect(tagged?.span).toBe("   span: releases={tag: v3.5.0 | note: Stable SDK release.}");
    expect(units.some((unit) => unit.labels.includes("v2.1.0"))).toBe(false);
    expect(audited).not.toContain("v2.1.0");
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
    expect(omitted(answer, transcript)).toEqual([]);
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

describe("claim support: controls", () => {
  it("never matches a number against a generated array index", () => {
    const names = Array.from({ length: 40 }, (_, index) => `Issuer ${String.fromCharCode(65 + (index % 26))}${index}`);
    const transcript = [execute({ names })];
    const answer = "The report was dated Aug 26, 2026, and it lists 26 issuers.";
    const text = pack(answer, transcript);

    expect(text).not.toMatch(/names\[\d+\]=/);
    expect(supportUnits(text).some((unit) => unit.labels.includes("26"))).toBe(false);
    expect(omitted(answer, transcript)).toEqual([]);
  });

  it("does not anchor the day number of a written date", () => {
    const transcript = [execute({ stats: { rounds: 26, note: "Round 26 closed." } })];
    const dateOnly = pack("The round closed on Aug 26, 2026.", transcript);
    const counted = pack("The program ran 26 rounds by Aug 26, 2026.", transcript);

    expect(supportUnits(dateOnly).some((unit) => unit.labels.includes("26"))).toBe(false);
    expect(supportUnits(counted).some((unit) => unit.labels.includes("26"))).toBe(true);
  });

  it("drops bare numbers before names and keeps omitted anchors out of the judge pack", () => {
    const records = Array.from({ length: 10 }, (_, index) => ({
      name: `Vault ${String.fromCharCode(65 + index)}${String.fromCharCode(97 + index)}x`,
      count: 7100 + index
    }));
    const transcript = [execute({ records })];
    const answer = records.map((record) => `${record.name} holds ${record.count} accounts.`).join("\n");
    const text = pack(answer, transcript, { maxChars: 1600 });
    const lost = omitted(answer, transcript, { maxChars: 1600 });
    const lostNames = lost.filter((value) => !/^\d+$/.test(value));
    const lostNumbers = lost.filter((value) => /^\d+$/.test(value));

    expect(text).toContain("claimSupportNotice: some execute-result text did not fit this pack");
    expect(text).not.toMatch(/entry=\d+[;)]/);
    expect(lostNumbers.length).toBeGreaterThan(0);
    expect(lostNames.length).toBeLessThan(records.length);
    // Kept units that show only bare numbers come after every unit that shows a name.
    const labels = supportUnits(text).map((unit) => unit.labels);
    const numberOnly = labels.map((list) => list.length > 0 && list.every((value) => /^\d+$/.test(value)));
    const firstNumberOnly = numberOnly.indexOf(true);
    if (firstNumberOnly >= 0) expect(numberOnly.slice(firstNumberOnly).every(Boolean)).toBe(true);
    for (const value of lost) expect(supportSection(text).join("\n")).not.toContain(`"${value}"`);
  });

  it("keeps source items for a roster answer before it drops below 28 support units", () => {
    const wallets = Array.from({ length: 40 }, (_, index) => ({
      title: `Wallet ${index} App`,
      url: `https://example.test/wallet/${index}`,
      summary: `Wallet ${index} App is a self-custody wallet for Stellar payments. `.repeat(6)
    }));
    const transcript = [execute({ wallets })];
    const answer = wallets.map((wallet) => `${wallet.title} is a self-custody wallet.`).join("\n");
    const text = pack(answer, transcript);
    const items = text.split("\n").filter((line) => /^\d+\. title=/.test(line)).length;

    expect(text.length).toBeLessThanOrEqual(12000);
    expect(supportUnits(text).length).toBeGreaterThanOrEqual(28);
    expect(items).toBeGreaterThan(2);
  });

  it("does not support a number from a larger number, a date, or a decimal", () => {
    const transcript = [execute({ grant: { amount: "12,000 USDC", window: "2026-02-20", score: "4.2000" } })];
    const answer = "The grant was 2,000 USDC and 20 reviewers scored it 2000.";
    const text = pack(answer, transcript);

    expect(supportUnits(text).some((unit) => unit.labels.some((value) => ["2,000", "20", "2000"].includes(value)))).toBe(false);
    expect(omitted(answer, transcript)).toEqual([]);
  });

  it("matches an amount in another written form but not a larger amount", () => {
    const transcript = [execute({
      tvl: { summary: "Stellar DeFi TVL stood at $174.4 million at the end of Q1." },
      grants: { amountUSD: 96000, other: "$1174.4 million in another network" }
    })];
    const text = pack("Stellar DeFi TVL was $174.4M. The grant was $96,000.", transcript);
    const units = supportUnits(text);

    expect(units.find((unit) => unit.labels.includes("$174.4M"))?.span).toContain("$174.4 million at the end of Q1");
    const grant = units.find((unit) => unit.labels.includes("$96,000"));
    expect(grant?.span).toBe("   span: grants={amountUSD: 96000 | other: $1174.4 million in another network}");
    // The larger $1174.4 million in the same span does not count as $174.4M.
    expect(grant?.labels).not.toContain("$174.4M");
  });

  it("matches a quotation that drops a short source word", () => {
    const transcript = [execute({ hits: [{ snippet: "lets third-party applications, such as **wallets**, to **cash**-**in** (deposit) USDC on Stellar" }] })];
    const text = pack('The page says it lets "third-party applications, such as wallets, cash-in (deposit) USDC on Stellar".', transcript);

    expect(supportUnits(text).some((unit) => unit.labels.some((value) => value.includes("third-party applications")))).toBe(true);
  });

  it("shows the record that holds an answer number and prefers the claim's own record", () => {
    const transcript = [execute({
      awards: [
        { name: "Beta Vault", amount: "2,000 USDC" },
        { name: "Alpha Bridge", amount: "5,000 USDC", note: "Alpha Bridge also received 2,000 USDC in fees." }
      ]
    })];
    const text = pack("Alpha Bridge received 2,000 USDC.", transcript);
    const unit = supportUnits(text).find((item) => item.labels.includes("2,000 USDC"));

    expect(unit?.header).toContain('source="Alpha Bridge"');

    const unrelated = pack("Gamma Pool received 2,000 USDC.", transcript);
    const shown = supportUnits(unrelated).find((item) => item.labels.includes("2,000 USDC"));
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
    expect(other?.header).toMatch(/role=(?:other-source|related-statement)/);
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
    const { text, audit } = explainTranscriptEvidencePack({ ...CASE, candidateAnswer: answer, transcript, maxChars: 3000 });

    expect(text.length).toBeLessThanOrEqual(3000);
    expect(audit.anchors).toBeGreaterThanOrEqual(audit.transcriptMatched);
    expect(audit.omitted.length).toBeGreaterThan(0);
    expect(audit.shown + audit.omitted.length).toBe(audit.transcriptMatched);
    expect(audit.omitted.every((item) => item.entries.length > 0)).toBe(true);
    expect(text).toContain("claimSupportNotice:");
    expect(text).not.toContain("claimSupportOmitted");
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

describe("claim support: p8 claim-word fallback and audit-only omissions", () => {
  const spansOf = (text) => supportUnits(text).map((unit) => unit.span).join("\n");

  it("keeps a lowercase paraphrase that supports a claim word no anchor covers", () => {
    const transcript = [
      execute({ article: {
        title: "Tessera Pay roadmap",
        content: `${"Roadmap context about merchant tooling. ".repeat(12)}Merchants are expected to settle pool payouts in 2027 through Tessera Pay.`
      } }),
      execute({ news: { title: "Tessera Pay launch recap", long_summary: `${"Launch recap context. ".repeat(10)}With the pool live, merchants can settle payouts instantly through Tessera Pay.` } }),
      execute({ projects: filler(30) })
    ];
    const answer = "Tessera Pay lets merchants settle pool payouts instantly.";
    const text = pack(answer, transcript);
    const units = supportUnits(text);

    expect(text.length).toBeLessThanOrEqual(12000);
    const instant = units.find((unit) => unit.span.includes("settle payouts instantly"));
    expect(instant?.header).toContain('source="Tessera Pay launch recap"');
    // The differing statement stays beside it; p8 does not decide which one is true.
    expect(units.some((unit) => unit.span.includes("expected to settle pool payouts in 2027"))).toBe(true);
  });

  it("finds the support sentence among many records that repeat the same name", () => {
    const records = Array.from({ length: 12 }, (_, index) => ({
      title: `Orion Vault update ${index}`,
      summary: `Orion Vault published routine update ${index} about dashboards and fees.`
    }));
    records.push({ title: "Orion Vault risk policy", summary: "During audits, Orion Vault halts withdrawals for every pool." });
    const transcript = [execute({ records }), execute({ projects: filler(25) })];
    const text = pack("Orion Vault halts withdrawals during audits.", transcript);

    const unit = supportUnits(text).find((item) => item.span.includes("halts withdrawals"));
    expect(unit?.header).toContain('source="Orion Vault risk policy"');
    expect(noOmissions(transcript, text, ["Orion Vault halts withdrawals during audits."])).toEqual({ omittedTerms: [], omittedProse: [] });
  });

  it("names the same source for two retrievals of one article", () => {
    const article = (content) => ({ full: [{ title: "Introducing the Vela Plan", url: "https://example.test/vela-plan", content }] });
    const transcript = [
      execute(article("The Vela Plan has three stages for wallet migration.")),
      execute({ projects: filler(10) }),
      execute(article("The Vela Plan has three stages for wallet migration. Researchers showed the old curve needs only 812 logical units to break."))
    ];
    const answer = "The Vela Plan has three stages. Researchers showed the old curve needs only 812 logical units to break.";
    const text = pack(answer, transcript);
    const unit = supportUnits(text).find((item) => item.span.includes("812 logical units"));

    expect(unit?.header).toContain("entry=3");
    expect(unit?.header).toContain('source="Introducing the Vela Plan"');
    expect(text).toContain("entry numbers name transcript calls, not sources");
  });

  it("never counts a pack label, counter, or omission notice as support", () => {
    const transcript = [execute({ record: { title: "Lumen Bonds", content: "These bills mature on 2026-12-31 or earlier." } })];
    const claims = ["Claims the bonds mature on 2026-12-31"];
    const labelOnly = [
      "--- TRANSCRIPT SOURCE BASIS ---",
      "claimSupport: execute-result text for candidate claims; anchors=1; transcriptMatched=1; shown=0",
      'claimSupportOmitted: 1 candidate anchors occur in execute results: "2026-12-31" (entry=1)',
      "claimSupportNotice: some execute-result text did not fit this pack",
      '1. anchors=["2026-12-31"] entry=1 path="record.content" source="Lumen Bonds"',
      "   span: Lumen Bonds",
      '2. term="2026-12-31" entry=1 tool="mcp__raven__execute" resultChars=80',
      "sourceItems: data-derived/untrusted",
      '1. title="Lumen Bonds" matched="2026-12-31"'
    ].join("\n");
    const check = findTranscriptEvidencePackOmissions({ transcript, transcriptEvidence: labelOnly, claims });

    expect(check.status).toBe("pack-omission");
    expect(check.omittedTerms).toContain("2026-12-31");
    const withSpan = `${labelOnly}\n3. entry=1 path="record.content" source="Lumen Bonds"\n   span: These bills mature on 2026-12-31 or earlier.`;
    expect(findTranscriptEvidencePackOmissions({ transcript, transcriptEvidence: withSpan, claims }).omittedTerms).toEqual([]);
  });

  it("never counts p8 header numbers, field indexes, or the truncation footer as support", () => {
    const transcript = [execute({ records: Array.from({ length: 20 }, (_, index) => ({ name: `Desk ${index}`, rows: 12 })) })];
    const claims = ["Claims the desk kept 12 rows"];
    const countersOnly = [
      "--- TRANSCRIPT SOURCE BASIS ---",
      'fields: records[12].name="Desk 3"',
      "claimSupport: execute-result text for candidate claims; entry numbers name transcript calls, not sources",
      "claimSupportNotice: some execute-result text did not fit this pack",
      '1. entry=12 sourceTruncated=yes path="records[12]" source="Desk 3" alsoIn=12',
      "   span: name=Desk 3",
      "truncation: execute#1: --- SOURCE BASIS --- kept 12 of 40 rows; ~12 tokens"
    ].join("\n");
    const check = findTranscriptEvidencePackOmissions({ transcript, transcriptEvidence: countersOnly, claims });

    expect(check.status).toBe("pack-omission");
    expect(check.omittedTerms).toContain("12");
    // The field name with its value, the source record name, and the span still count.
    expect(packSourceEvidenceText(countersOnly)).toBe(['name="Desk 3"', "Desk 3", "name=Desk 3"].join("\n"));
  });

  it("never counts a provenance character counter or a (+N more) suffix as support (R6 probes)", () => {
    const transcript = [execute({ report: { totalChars: 18126, extraLinks: 20 } })];
    const pack = [
      "--- TRANSCRIPT SOURCE BASIS ---",
      "canonicalUrls: data-derived/untrusted; https://example.test/report (+20 more)",
      "provenance: execute#1: --- SOURCE METADATA --- shape: object; 18126 chars; ~4531 tokens; 1 top-level keys calls: scout.searchProjects=ok/420ms (totals ok=1 error=0 soft-empty=0)"
    ].join("\n");

    for (const number of ["18126", "20"]) {
      const check = findTranscriptEvidencePackOmissions({ transcript, transcriptEvidence: pack, claims: [`Claims the report has ${number} items`] });
      expect(check.status).toBe("pack-omission");
      expect(check.omittedTerms).toContain(number);
    }
    expect(packSourceEvidenceText(pack)).toBe("canonicalUrls: data-derived/untrusted; https://example.test/report");
  });

  it("keeps a real source-metadata date in the provenance line as support", () => {
    const result = `${JSON.stringify({ ok: true, data: { projects: [] } })}\n--- SOURCE METADATA --- sourceMetadata: scout.searchProjects data.meta.generatedAt="2026-10-08T00:04:52.749Z"`;
    const transcript = [execute(result)];
    const pack = 'provenance: execute#1: --- SOURCE METADATA --- shape: object; 900 chars sourceMetadata: scout.searchProjects data.meta.generatedAt="2026-10-08T00:04:52.749Z"; scout.searchProjects data.meta.counts.total=178';
    const check = findTranscriptEvidencePackOmissions({ transcript, transcriptEvidence: pack, claims: ["Claims the directory was generated on 2026-10-08"] });

    expect(check.transcriptSupportedTerms).toBe(1);
    expect(check.omittedTerms).toEqual([]);
    expect(packSourceEvidenceText(pack)).toBe('generatedAt="2026-10-08T00:04:52.749Z"; total=178');
  });

  it("keeps omitted anchors and their entries out of the judge pack", () => {
    const records = Array.from({ length: 40 }, (_, index) => ({
      name: `Relay ${index} Hub`,
      note: `Relay ${index} Hub routes ${3000 + index} transfers per day for partner desks.`
    }));
    const transcript = [execute({ records })];
    const answer = records.map((record) => record.note).join("\n");
    const { text, audit } = explainTranscriptEvidencePack({ ...CASE, candidateAnswer: answer, transcript, maxChars: 4000 });

    expect(audit.omitted.length).toBeGreaterThan(0);
    expect(text).toContain("claimSupportNotice:");
    expect(text).not.toMatch(/anchors=\[|claimWords=\[|claimSupportOmitted|transcriptMatched=/);
    for (const item of audit.omitted) expect(text).not.toContain(`"${item.anchor}" (entry=`);
  });

  it("adds no fallback span from an unrelated record or for a fabricated claim", () => {
    const transcript = [execute({
      records: [
        { title: "Nova Swap fees", summary: "Nova Swap charges a percentage fee for deposits on weekends." },
        { title: "Kite Lend audit", summary: "Kite Lend was audited by a third-party firm before launch." }
      ]
    })];
    const answer = "Vega Bridge charges a flat fee for withdrawals. Vega Bridge was audited by Halborn before its token launch.";
    const { text, audit } = explainTranscriptEvidencePack({ ...CASE, candidateAnswer: answer, transcript });

    expect(spansOf(text)).not.toContain("Nova Swap");
    expect(spansOf(text)).not.toContain("Kite Lend");
    expect(audit.units.filter((unit) => unit.role === "claim-words")).toEqual([]);
  });

  it("stays inside the budget with fallback units under pressure", () => {
    const records = Array.from({ length: 30 }, (_, index) => ({
      title: `Harbor ${index} desk`,
      summary: `${"Desk context sentence for routine operations. ".repeat(6)}Harbor ${index} desk clears overnight batches quietly after the settlement window closes.`
    }));
    const transcript = [execute({ records })];
    const answer = records.map((_, index) => `Harbor ${index} desk clears overnight batches quietly.`).join("\n");
    const { text, audit } = explainTranscriptEvidencePack({ ...CASE, candidateAnswer: answer, transcript });

    expect(text.length).toBeLessThanOrEqual(12000);
    expect(audit.units.length).toBeGreaterThan(0);
    expect(supportUnits(text)).toHaveLength(audit.units.length);
  });
});

describe("claim support: p9 entity lists", () => {
  // The R8-1 shape: one directory array, a host checkpoint after the JSON, and one answer sentence
  // that lists several records and states a status for the list.
  const dex = [
    { id: "a1", name: "Soroswap", slug: "soroswap", status: "Live", tvlUSD: 1243997, url: "https://example.test/soroswap" },
    { id: "a2", name: "Aquarius", slug: "aquarius", status: "Live", tvlUSD: 38937692, url: "https://example.test/aquarius" },
    { id: "a3", name: "Phoenix", slug: "phoenix", status: "Live", tvlUSD: null, url: "https://example.test/phoenix" },
    { id: "a4", name: "StellarTerm", slug: "stellarterm", status: "Live", tvlUSD: null, url: "https://example.test/stellarterm" },
    { id: "a5", name: "Hoops Finance", slug: "hoops", status: "Pre-Release", tvlUSD: null, url: "https://example.test/hoops" },
    { id: "a6", name: "Comet", slug: "comet", status: "Inactive", tvlUSD: null, url: "https://example.test/comet" },
    { id: "a7", name: "Zenex", slug: "zenex", status: "Live", tvlUSD: null, url: "https://example.test/zenex" },
    { id: "a8", name: "Noether", slug: "noether", status: "Pre-Release", tvlUSD: null, url: "https://example.test/noether" },
    { id: "a9", name: "Raum Network", slug: "raum", status: "Development", tvlUSD: null, url: "https://example.test/raum" },
    { id: "a10", name: "Octarine", slug: "octarine", status: "Live", tvlUSD: null, url: "https://example.test/octarine" }
  ];
  const dexTranscript = [
    execute(`${JSON.stringify({ dexProjects: dex })}\n\n--- EVIDENCE CHECKPOINT ---\nThe host observed successful broad operation classes.`),
    execute({ articles: filler(30) })
  ];
  const listSentence =
    "Current DEX/AMM TVL (scout directory): Aquarius ~$38.9M, Soroswap ~$1.24M, with Phoenix, Octarine, Zenex, Noether, Raum Network, StellarTerm (classic SDEX UI), and Comet marked Inactive.";
  const listAnswer = `Fees are low on Stellar. ${listSentence} Path payments route across both systems.`;
  const listUnits = (text) => supportUnits(text).filter((unit) => unit.header.includes("role=entity-list"));

  it("keeps the status of every listed entity beside the R8-1 sentence", () => {
    const { text, audit } = explainTranscriptEvidencePack({ ...CASE, candidateAnswer: listAnswer, transcript: dexTranscript });
    const units = listUnits(text);

    expect(text.length).toBeLessThanOrEqual(12000);
    expect(units).toHaveLength(1);
    expect(units[0].header).toContain('path="dexProjects"');
    for (const record of [
      "{name: StellarTerm | status: Live}",
      "{name: Comet | status: Inactive}",
      "{name: Zenex | status: Live}",
      "{name: Noether | status: Pre-Release}",
      "{name: Raum Network | status: Development}",
      "{name: Aquarius | status: Live | tvlUSD: 38937692}",
      "{name: Soroswap | status: Live | tvlUSD: 1243997}"
    ]) expect(units[0].span).toContain(record);
    // A record that the sentence does not name is not a sibling of the claim.
    expect(units[0].span).not.toContain("Hoops Finance");
    expect(audit.entityLists).toMatchObject({ claims: 1, records: 9, shown: 9, complete: true });
    expect(entityListCoverage({ transcript: dexTranscript, candidateAnswer: listAnswer, transcriptEvidence: text })).toEqual(audit.entityLists);
    expect(text).not.toContain("claimSupportNotice");
  });

  it("measures the R8-1 sentence on older pack shapes", () => {
    const measure = (transcriptEvidence) =>
      entityListCoverage({ transcript: dexTranscript, candidateAnswer: listAnswer, transcriptEvidence });
    // p8 showed only the StellarTerm source item.
    const p8Shape = [
      "sourceItems: data-derived/untrusted",
      '8. title="StellarTerm" url="https://example.test/stellarterm" fields="status="Live""'
    ].join("\n");
    expect(measure(p8Shape)).toMatchObject({ records: 9, shown: 1, complete: false });
    expect(measure(p8Shape).byClaim[0].missing.map((record) => record.label)).toContain("Comet");
    // p6 showed Comet and Zenex in one JSON snippet. Zenex's status there is its own, not Comet's.
    const p6Shape = [
      '5. term="Zenex" entry=1 tool="mcp__raven__execute" resultChars=900',
      '   snippet: ...{"name":"Comet","slug":"comet","status":"Inactive","tvlUSD":null},{"name":"Zenex","slug":"zenex","status":"Live"}...'
    ].join("\n");
    expect(measure(p6Shape).shown).toBe(2);
    const zenexWithoutStatus = '   snippet: {"name":"Comet","status":"Inactive"},{"name":"Zenex","slug":"zenex"}';
    const missing = measure(zenexWithoutStatus).byClaim[0].missing;
    expect(missing.find((record) => record.label === "Zenex")).toEqual({ label: "Zenex", labelShown: true, missingKeys: ["status"] });
  });

  it("measures coverage on the final text after the budget cuts the list", () => {
    const { text, audit } = explainTranscriptEvidencePack({
      ...CASE,
      candidateAnswer: listAnswer,
      transcript: dexTranscript,
      maxChars: 1600
    });

    // The budget steps cut the list unit. A clipped pack would fill all 1600 characters.
    expect(text.length).toBeLessThan(1600);
    expect(listUnits(text)).toEqual([]);
    expect(audit.entityLists.complete).toBe(false);
    expect(audit.entityLists).toEqual(entityListCoverage({ transcript: dexTranscript, candidateAnswer: listAnswer, transcriptEvidence: text }));
    expect(text).toContain("claimSupportNotice: some execute-result text did not fit this pack");
  });

  it("never counts a unit header, path, or notice as a shown record", () => {
    const labelsOnly = [
      "claimSupport: execute-result text for candidate claims",
      "claimSupportNotice: some execute-result text did not fit this pack",
      '1. entry=1 path="dexProjects" role=entity-list',
      '2. term="Comet" entry=1 tool="mcp__raven__execute" resultChars=900'
    ].join("\n");
    expect(entityListCoverage({ transcript: dexTranscript, candidateAnswer: listAnswer, transcriptEvidence: labelsOnly }).shown).toBe(0);
  });

  it("adds one unit when a later claim names only records an earlier unit shows", () => {
    const answer = `${listSentence} Aquarius and Soroswap are Live venues for pool liquidity.`;
    const text = pack(answer, dexTranscript);

    expect(entityListClaims({ transcript: dexTranscript, candidateAnswer: answer })).toHaveLength(2);
    expect(listUnits(text)).toHaveLength(1);
    expect(audits.get(text).entityLists).toMatchObject({ claims: 2, complete: true });
  });

  it("finds no entity list without two named siblings and a claim field", () => {
    const claims = (candidateAnswer, transcript = dexTranscript) => entityListClaims({ transcript, candidateAnswer });
    // One named record is not a list.
    expect(claims("Comet is marked Inactive in the directory.")).toEqual([]);
    // Two names without a field the claim names or states.
    expect(claims("Comet and Zenex both appear in the directory.")).toEqual([]);
    // Two names from different arrays are not siblings.
    const split = [execute({ first: [dex[5], { name: "Other A", status: "Live" }] }), execute({ second: [dex[6], { name: "Other B", status: "Live" }] })];
    expect(claims("Comet and Zenex are marked Inactive.", split)).toEqual([]);
    // A plain lowercase word, such as a confidence label, is not a name.
    const labels = [execute({ ratings: [{ label: "medium", score: 2 }, { label: "high", score: 3 }] })];
    expect(claims("Confidence is medium or high, with score 2.", labels)).toEqual([]);
  });

  it("selects claim fields by name or by a stated value", () => {
    const [claim] = entityListClaims({ transcript: dexTranscript, candidateAnswer: listAnswer });

    expect(claim.keys).toEqual(["status", "tvlUSD"]);
    expect(claim.records.map((record) => record.label)).toEqual([
      "Soroswap", "Aquarius", "Phoenix", "StellarTerm", "Comet", "Zenex", "Noether", "Raum Network", "Octarine"
    ]);
  });

  describe("record scopes (review RJ-1)", () => {
    const pair = [execute({ items: [{ name: "Alpha", status: "Live" }, { name: "Bravo", status: "Live" }] })];
    const measure = (transcriptEvidence) =>
      entityListCoverage({ transcript: pair, candidateAnswer: "Alpha and Bravo are Live.", transcriptEvidence });
    const missingLabels = (text) => measure(text).byClaim[0].missing.map((record) => record.label);

    it("never lends a field of a later object to an earlier record", () => {
      expect(missingLabels('   span: {"name":"Alpha"},{"status":"Live","name":"Bravo"}')).toEqual(["Alpha"]);
    });

    it("accepts a record's own field before or after its identity", () => {
      expect(measure('   span: {"status":"Live","name":"Alpha"},{"name":"Bravo","status":"Live"}').complete).toBe(true);
    });

    it("requires the exact name and the exact value", () => {
      expect(missingLabels("   span: {name: Alpha Other | status: Live}; {name: Bravo | status: Live}")).toEqual(["Alpha"]);
      expect(missingLabels("   span: {name: Alpha | status: Live-preview}; {name: Bravo | status: Live}")).toEqual(["Alpha"]);
    });

    it("never counts a field of a nested object", () => {
      expect(missingLabels('   span: {"name":"Alpha","child":{"status":"Live"}},{"name":"Bravo","status":"Live"}')).toEqual(["Alpha"]);
    });

    it("reads a snippet that starts inside a string", () => {
      expect(measure('   snippet: ...9def8ebfd","name":"Alpha","status":"Live"},{"name":"Bravo","status":"Live"},{"id":"6a2d').complete).toBe(true);
    });

    it("treats an object nested in a clipped record as part of that record", () => {
      const clipped = `[{"name":"Alpha","status":"Live","award":{"name":"Alpha","round":"7"}},{"name":"Bravo","status":"Live"},{"name":"Cut`;
      const [claim] = entityListClaims({ transcript: [execute(clipped)], candidateAnswer: "Alpha and Bravo are Live." });
      expect(claim.records.map((record) => record.label)).toEqual(["Alpha", "Bravo"]);
    });

    it("never reads a field inside another field's quoted value (review RJ2-1)", () => {
      expect(missingLabels('   span: {"name":"Alpha","note":"status: Live; this is only an example"},{"name":"Bravo","status":"Live"}')).toEqual(["Alpha"]);
      expect(missingLabels('   span: {"note":"name: Alpha; status: Live; this is only an example"},{"name":"Bravo","status":"Live"}')).toEqual(["Alpha"]);
    });

    it("keeps a nested field out of its parent after astral characters (review RJ2-2)", () => {
      const bravo = ',{"name":"Bravo","status":"Live"}';
      const nested = JSON.stringify({ name: "Alpha", note: "🚀".repeat(20), child: { status: "Live" } });
      expect(missingLabels(`   span: ${nested}${bravo}`)).toEqual(["Alpha"]);
      const direct = JSON.stringify({ name: "Alpha", note: "🚀".repeat(20), status: "Live" });
      expect(measure(`   span: ${direct}${bravo}`).complete).toBe(true);
    });

    it("never counts an unfinished quoted identity (review RJ3-1)", () => {
      expect(missingLabels('   span: {"name":"Bravo","status":"Live"},{"status":"Live","name":"Alpha')).toEqual(["Alpha"]);
    });

    it("never counts an unfinished quoted claim value (review RJ3-1)", () => {
      expect(missingLabels('   span: {"name":"Bravo","status":"Live"},{"name":"Alpha","status":"Live')).toEqual(["Alpha"]);
    });

    it("keeps the complete fields of an object whose last token is unfinished", () => {
      expect(measure('   span: {"name":"Bravo","status":"Live"},{"status":"Live","name":"Alpha","note":"cut here').complete).toBe(true);
    });

    it("decodes JSON escapes in identities and claim values (review RJ3-2)", () => {
      const bravo = '   span: {"name":"Bravo","status":"Live"},';
      expect(measure(`${bravo}{"name":"\\u0041lpha","status":"Live"}`).complete).toBe(true);
      expect(measure(`${bravo}{"name":"Alpha","status":"Li\\u0076e"}`).complete).toBe(true);
      const spaced = [execute({ items: [{ name: "Alpha One", status: "Live" }, { name: "Bravo", status: "Live" }] })];
      const coverage = entityListCoverage({
        transcript: spaced,
        candidateAnswer: "Alpha One and Bravo are Live.",
        transcriptEvidence: '   span: {"name":"Alpha\\nOne","status":"Live"},{"name":"Bravo","status":"Live"}'
      });
      expect(coverage.complete).toBe(true);
    });

    it("reads the fields of a source-item line as fields of that item", () => {
      expect(missingLabels('1. title="Alpha" url="https://example.test/a" fields="status="Live", rank="2""')).toEqual(["Bravo"]);
    });

    it("never counts a line outside braces that names two records", () => {
      expect(measure('   span: name="Alpha" name="Bravo" status="Live"').shown).toBe(0);
    });

    it("needs one scope for each record when two records share a name", () => {
      const twins = [execute({ items: [{ name: "Alpha", status: "Live" }, { name: "Alpha", status: "Live" }, { name: "Bravo", status: "Live" }] })];
      const coverage = (text) => entityListCoverage({ transcript: twins, candidateAnswer: "Alpha and Bravo are Live.", transcriptEvidence: text });
      expect(coverage("   span: {name: Alpha | status: Live}; {name: Bravo | status: Live}")).toMatchObject({ records: 3, shown: 2 });
      expect(coverage("   span: {name: Alpha | status: Live}; {name: Alpha | status: Live}; {name: Bravo | status: Live}").complete).toBe(true);
    });

    it("quotes a value with a comma, so the measure reads it whole", () => {
      const firms = [execute({ items: [{ name: "Alpha", company: "Acme, Inc" }, { name: "Bravo", company: "Zeta Labs" }] })];
      const answer = "Alpha and Bravo name their company in the directory.";
      const text = pack(answer, firms);
      expect(text).toContain('{name: Alpha | company: "Acme, Inc"}');
      expect(entityListCoverage({ transcript: firms, candidateAnswer: answer, transcriptEvidence: text }).complete).toBe(true);
    });
  });

  describe("requirements before rendering limits (review RJ-2)", () => {
    const records = Array.from({ length: 25 }, (_, index) => ({ name: `Project ${String(index).padStart(2, "0")} Hub`, status: "Live" }));
    const transcript = [execute({ items: records })];
    const answer = `${records.map((record) => record.name).join(", ")} are Live.`;

    it("keeps a record that the unit limit drops in the denominator", () => {
      const [claim] = entityListClaims({ transcript, candidateAnswer: answer });
      expect(claim.records).toHaveLength(25);
      const first24 = `   span: ${records.slice(0, 24).map((record) => `{name: ${record.name} | status: Live}`).join("; ")}`;
      const coverage = entityListCoverage({ transcript, candidateAnswer: answer, transcriptEvidence: first24 });
      expect(coverage).toMatchObject({ records: 25, shown: 24, complete: false });
      expect(coverage.byClaim[0].missing.map((record) => record.label)).toEqual(["Project 24 Hub"]);
    });

    it("names the limit that removed each record", () => {
      const { text, audit } = explainTranscriptEvidencePack({ ...CASE, candidateAnswer: answer, transcript });
      expect(audit.entityListLimits).toEqual([{ claimIndex: 0, path: "items", label: "Project 24 Hub", limit: "records-per-unit" }]);
      // The limit only stops the list unit from showing the record. The measure reads the final
      // text, where another support unit still shows it.
      expect(audit.entityLists).toEqual(entityListCoverage({ transcript, candidateAnswer: answer, transcriptEvidence: text }));
      expect(audit.entityLists.records).toBe(25);
      expect(listUnits(text)[0].span).not.toContain("Project 24 Hub");
    });
  });

  it("measures the clipped text when every budget step is spent", () => {
    const { text, audit } = explainTranscriptEvidencePack({ ...CASE, candidateAnswer: listAnswer, transcript: dexTranscript, maxChars: 600 });

    expect(text).toHaveLength(600);
    expect(text.endsWith("...")).toBe(true);
    expect(audit.entityLists).toEqual(entityListCoverage({ transcript: dexTranscript, candidateAnswer: listAnswer, transcriptEvidence: text }));
    expect(audit.entityLists.complete).toBe(false);
  });

  it("leaves a pack without an entity list unchanged by the list rule", () => {
    const transcript = [execute({ records: [{ title: "Lumen Bonds", content: "These bills mature on 2026-12-31 or earlier." }] })];
    const { text, audit } = explainTranscriptEvidencePack({ ...CASE, candidateAnswer: "The bills mature on 2026-12-31.", transcript });

    expect(listUnits(text)).toEqual([]);
    expect(audit.entityLists).toEqual({ claims: 0, records: 0, shown: 0, complete: true, byClaim: [] });
  });
});
