import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const caseFile = new URL(
  "../eval/qa/corpus/battery/protocol-core/q-protocol-max-tx-set-size.json",
  import.meta.url
);

describe("maximum transaction-set golden", () => {
  it("attributes the setting shape to XDR and the current values to Docs and live configuration", () => {
    const kase = JSON.parse(readFileSync(caseFile, "utf8"));
    const sentences = kase.golden.answer.split(/(?<=[.!?])\s+/);
    const schemaFact = sentences.find(
      (sentence) =>
        /\b(?:XDR|v27)\b/i.test(sentence) &&
        /\bschema\b/i.test(sentence) &&
        /\bdefines?\b/i.test(sentence) &&
        /\bseparate\b/i.test(sentence) &&
        /\bsetting\b/i.test(sentence)
    );
    const currentValuesFact = sentences.find(
      (sentence) =>
        /\bcurrent\b/i.test(sentence) &&
        /\bDocs\b/i.test(sentence) &&
        /\blive\b/i.test(sentence) &&
        /\b(?:configuration|settings?)\b/i.test(sentence) &&
        /\b1,000\b/.test(sentence) &&
        /\b2,000\b/.test(sentence)
    );
    const unsupportedSchemaValueClaim = sentences.find(
      (sentence) =>
        /\bschema\b/i.test(sentence) &&
        /\b(?:agrees?\s+on|reports?|provides?|supplies?|encodes?|specifies?)\b/i.test(sentence) &&
        /\b(?:values?|1,000|2,000)\b/i.test(sentence) &&
        !/\b(?:does not|do not|doesn't|without)\b/i.test(sentence)
    );

    expect(schemaFact).toBeDefined();
    expect(currentValuesFact).toBeDefined();
    expect(unsupportedSchemaValueClaim).toBeUndefined();
  });
});
