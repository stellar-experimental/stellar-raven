import { describe, expect, it } from "vitest";
import { candidateEvidenceBlock } from "../src/policy/evidence-checkpoint";
import { withExactEvidence } from "../src/policy/exact-evidence";

describe("exact rows in the candidate evidence block", () => {
  const exact = [
    {
      op: "scout.searchResearch",
      rows: [{ key: "sep-0043", url: "https://example.org/ecosystem/sep-0043.md" }]
    }
  ];
  const SENTENCE =
    " Exception: `scout.searchResearch` returned the document the query names by identifier (`sep-0043`, `https://example.org/ecosystem/sep-0043.md`). That row is the document itself, not a candidate. State only what its returned text shows. A status or version line that is not in the returned text is unverified. The other rows stay candidates.";

  it("leaves a block with no exact row byte-identical", () => {
    const plain = candidateEvidenceBlock(2);
    expect(withExactEvidence(plain, undefined)).toBe(plain);
    expect(withExactEvidence(plain, [])).toBe(plain);
    expect(withExactEvidence(plain, [{ op: "scout.searchResearch", rows: [] }])).toBe(plain);
  });

  it("appends one generated exception after the unchanged guidance", () => {
    const plain = candidateEvidenceBlock(1);
    expect(withExactEvidence(plain, exact)).toBe(`${plain}${SENTENCE}`);
  });

  it("writes one sentence per exact row of a call, with a URL only when one is plain", () => {
    const plain = candidateEvidenceBlock(1);
    const block = withExactEvidence(plain, [
      { op: "scout.searchResearch", rows: [{ key: "sep-0043" }, { key: "cap-0038", url: "https://x.org/cap-0038.md" }] }
    ]);
    const sentences = block.slice(plain.length).split(" Exception: ").filter(Boolean);
    expect(sentences).toHaveLength(2);
    expect(sentences[0]).toContain("identifier (`sep-0043`). That row is the document itself");
    expect(sentences[1]).toContain("identifier (`cap-0038`, `https://x.org/cap-0038.md`). That row is the document itself");
    expect(block).not.toContain("`; `");
  });

  it("stays silent when the block is suppressed or there is no candidate call", () => {
    expect(withExactEvidence(candidateEvidenceBlock(1, true), exact)).toBe("");
    expect(withExactEvidence(candidateEvidenceBlock(undefined), exact)).toBe("");
  });

  it("makes no status or date claim of its own", () => {
    expect(SENTENCE).not.toMatch(/\b(active|final|draft|accepted|implemented|as of|published)\b/i);
  });
});
