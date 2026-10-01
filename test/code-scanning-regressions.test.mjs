import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { extractEvidenceTerms } from "../eval/qa/evidence-pack.mjs";
import { markdownTable } from "../scripts/improvements-lib.mjs";

// A subprocess timeout stops a regressed expression without hanging the test worker.
function evidenceProbe(expression) {
  return spawnSync(process.execPath, ["--input-type=module", "-e", `
    import { extractEvidenceTerms, buildTranscriptEvidencePack, findTranscriptEvidencePackOmissions }
      from ${JSON.stringify(new URL("../eval/qa/evidence-pack.mjs", import.meta.url).href)};
    ${expression}
  `], { encoding: "utf8", timeout: 2_000 });
}

const quotedIdentifier = JSON.stringify("`aA" + "0A".repeat(50) + "_`");

describe("code scanning regressions", () => {
  it("escapes existing backslashes before table separators", () => {
    const table = markdownTable([[String.raw`value\|next`]], ["field"]);
    expect(table.split("\n")[2]).toBe(String.raw`| value\\\|next |`);
    expect(markdownTable([["a\nb"]], ["field"])).toContain("a b");
  });

  it.each([
    ['camel-case extraction', `extractEvidenceTerms({ candidateAnswer: 'aA' + '0A'.repeat(50) + '_' });`],
    ['protocol version extraction', `extractEvidenceTerms({ candidateAnswer: 'A' + '-A'.repeat(50) + '!' });`],
    ['camel-case priority', `buildTranscriptEvidencePack({ tags: { freshness: 'live' },
      candidateAnswer: ${quotedIdentifier},
      transcript: [{ tool: 'execute', result: 'fixture' }] });`],
    ['identifier matching', `findTranscriptEvidencePackOmissions({
      claims: [${quotedIdentifier}],
      transcript: [{ tool: 'execute', result: 'fixture' }] });`]
  ])("bounds %s on adversarial text", (_name, expression) => {
    const result = evidenceProbe(expression);
    expect(result.error?.message).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
  });

  it("preserves protocol versions and camel-case identifiers", () => {
    const terms = extractEvidenceTerms({ candidateAnswer:
      "Alpha-Beta 1.2; CAP-Alpha-Beta 2.3.4; alpha-Beta-Gamma 3.4; lowerCamelCase0; aB; aBC_" });
    expect(terms).toContain("Alpha-Beta 1.2");
    expect(terms).toContain("CAP-Alpha-Beta 2.3.4");
    expect(terms).toContain("Beta-Gamma 3.4");
    expect(terms).toContain("lowerCamelCase0");
    expect(terms).not.toContain("aB");
    expect(terms).not.toContain("aBC");
  });

  it("preserves inventory diagnostics and public app IDs while redacting secret forms", () => {
    const root = realpathSync(mkdtempSync(join(tmpdir(), "inventory-error-")));
    const secretNames = ["LUMENLOOP_API_KEY", "ALGOLIA_API_KEY_DOCS", "ALGOLIA_API_KEY_SITE", "MCP_SERVER_SECRET", "WORKOS_API_KEY"];
    const publicNames = ["ALGOLIA_APPLICATION_ID_DOCS", "ALGOLIA_APPLICATION_ID_SITE"];
    const fixtures = Object.fromEntries([...secretNames, ...publicNames].map((name, index) =>
      [name, `fixture-${index}/value+with=symbols`]
    ));
    const forms = (value) => [value, encodeURIComponent(value), Buffer.from(value).toString("base64")];
    try {
      mkdirSync(join(root, "scripts/lib"), { recursive: true });
      copyFileSync(new URL("../scripts/refresh-inventory.mjs", import.meta.url), join(root, "scripts/refresh-inventory.mjs"));
      copyFileSync(new URL("../scripts/lib/shared.mjs", import.meta.url), join(root, "scripts/lib/shared.mjs"));
      const preload = join(root, "fetch-fixture.mjs");
      writeFileSync(preload, `globalThis.fetch = async () => new Response(JSON.stringify({
        success: false, error: ${JSON.stringify("HTTP 503; count guard expected 12: " + Object.values(fixtures).flatMap(forms).join(" | "))}
      }), { status: 200 });`);
      const run = (env) => spawnSync(process.execPath, ["--import", preload,
        join(root, "scripts/refresh-inventory.mjs"), "--service", "lumenloop"], {
        encoding: "utf8", env: { ...process.env, ...fixtures, ...env }
      });
      const result = run({});
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("refresh-inventory failed: lumenloop /tools: envelope error");
      expect(result.stderr).toContain("HTTP 503; count guard expected 12");
      expect(result.stderr.match(/\[redacted\]/g)).toHaveLength(secretNames.length * 3);
      for (const name of secretNames) {
        for (const form of forms(fixtures[name])) expect(result.stderr + result.stdout).not.toContain(form);
      }
      for (const name of publicNames) {
        for (const form of forms(fixtures[name])) expect(result.stderr).toContain(form);
      }
      const missing = run({ LUMENLOOP_API_KEY: "" });
      expect(missing.status).toBe(1);
      expect(missing.stderr).toContain("missing required env var LUMENLOOP_API_KEY");
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});
