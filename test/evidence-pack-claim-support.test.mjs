import { describe, expect, it } from "vitest";
import {
  buildTranscriptEvidencePack,
  explainTranscriptEvidencePack,
  findTranscriptEvidencePackOmissions,
  packSourceEvidenceText
} from "../eval/qa/evidence-pack.mjs";

// Claim-support fixtures (p7 anchors, p8 fallback and audit). Assertions read the final serialized
// pack text; omission checks read the audit-only metadata.
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
