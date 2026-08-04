/**
 * /demo page tests — pure rendering, plain Node.
 *
 * The load-bearing one is the CSP hash guard: DEMO_PAGE_HEADERS pins the
 * single inline <script> by sha256 (no 'unsafe-inline' for script). The hash
 * is hard-coded in src/demo/page.ts (Web Crypto is async; the headers are a
 * sync module const), so this test recomputes it from the rendered page —
 * any edit to the client script fails here with the new value to paste in.
 *
 * ADR-0003: the page is emitted text — it must not reference non-exposed
 * ops or retired skills. Checked against the real exclusion data in
 * scripts/exposure.mjs, never a hand-copied list.
 */
import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { demoPage, DEMO_PAGE_HEADERS } from "../src/demo/page";
import { DEMO_CAPS } from "../src/demo/budget";
import { loadManifest, searchCatalogPage } from "../src/catalog/search";
// The reusable ADR-0003 leak guard (backed by scripts/exposure.mjs data) —
// the design requires running it over the rendered demo HTML.
import { assertNoNonExposedRefsInText } from "../scripts/emitted-text-guard.mjs";

const lockedHtml = demoPage({ authenticated: false });
const chatHtml = demoPage({ authenticated: true });

describe("demo page CSP", () => {
  it("pins the exact inline script by sha256 (no unsafe-inline for script)", () => {
    const scripts = [...chatHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    expect(scripts).toHaveLength(1);
    const hash = createHash("sha256").update(scripts[0]?.[1] ?? "", "utf8").digest("base64");
    const csp = DEMO_PAGE_HEADERS["content-security-policy"] ?? "";
    expect(csp).toContain(`script-src 'sha256-${hash}'`);
    expect(csp).not.toContain("unsafe-eval");
    expect(csp.includes("script-src 'unsafe-inline'")).toBe(false);
  });

  it("keeps the contract-required directives and headers", () => {
    const csp = DEMO_PAGE_HEADERS["content-security-policy"] ?? "";
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("style-src 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' data:");
    expect(DEMO_PAGE_HEADERS["cache-control"]).toBe("no-store");
    expect(DEMO_PAGE_HEADERS["x-robots-tag"]).toBe("noindex");
  });
});

describe("demo page states", () => {
  it("sets complete noindex social metadata for the demo URL", () => {
    expect(lockedHtml).toContain("<title>Playground · Stellar Raven</title>");
    expect(lockedHtml).toContain(
      '<meta name="description" content="Try Stellar Raven\'s live agent playground for Stellar ecosystem questions."/>'
    );
    expect(lockedHtml).toContain('<meta name="robots" content="noindex"/>');
    expect(lockedHtml).toContain('<meta property="og:type" content="website"/>');
    expect(lockedHtml).toContain('<meta property="og:title" content="Playground · Stellar Raven"/>');
    expect(lockedHtml).toContain('<meta property="og:image" content="https://raven.stellar.org/og.png"/>');
    expect(lockedHtml).toContain('<meta property="og:image:width" content="1200"/>');
    expect(lockedHtml).toContain('<meta property="og:image:height" content="630"/>');
    expect(lockedHtml).toContain('<meta property="og:url" content="https://raven.stellar.org/playground"/>');
    expect(lockedHtml).toContain('<meta name="twitter:card" content="summary_large_image"/>');
    expect(lockedHtml).toContain('<meta name="twitter:image" content="https://raven.stellar.org/og.png"/>');
    expect(lockedHtml).toContain('<link rel="apple-touch-icon"');
    expect(lockedHtml).toContain('<link rel="canonical" href="https://raven.stellar.org/playground"/>');
  });

  it("locked: sign-in link, static example trace, zero script", () => {
    expect(lockedHtml).toContain('href="/playground/login"');
    expect(lockedHtml).toContain("Test drive <span class=\"r\">Raven</span>");
    expect(lockedHtml).toContain("Example session");
    expect(lockedHtml).toContain("soroban smart contract deploy");
    expect(lockedHtml).toContain("&quot;sections&quot;: [");
    expect(lockedHtml).not.toContain("&quot;playbook&quot;: [");
    expect(lockedHtml).toContain("4 of 15 matches");
    // The static example never shows a section HIT — sections left search at
    // the 2026-07-13 skills-form A/B (the sample code still READS a section).
    expect(lockedHtml).not.toContain("skill-section");
    expect(lockedHtml).toContain("The playground shows the live trace");
    expect(lockedHtml).toContain("connect an MCP client to <code>/mcp</code>");
    expect(lockedHtml).not.toContain("<script>");
    expect(lockedHtml).not.toContain("Watch an agent");
    expect(lockedHtml).not.toContain('class="flow"');
    // No numbered step dividers: they taught a false fixed-pipeline mental
    // model for what is a free-form tool loop (search/execute interleave).
    expect(lockedHtml).not.toContain("stepline");
    expect(lockedHtml).not.toContain("step 1");
    expect(lockedHtml).not.toMatch(/<br\s*\/?\s*>/i);
  });

  it("authenticated: composer + trace client wired to /playground/chat", () => {
    expect(chatHtml).toContain('id="composer-form"');
    expect(chatHtml).toContain('id="log"');
    expect(chatHtml).toContain('id="log" role="log" aria-live="off"');
    expect(chatHtml).not.toContain('id="log" aria-live="polite"');
    expect(chatHtml).toContain('id="jump"');
    expect(chatHtml).toContain('role="status"');
    expect(chatHtml).toContain('first && !reduceMotion ? "smooth" : "instant"');
    expect(chatHtml).toContain('history.length === 1');
    expect(chatHtml).toContain('behavior: "instant"');
    expect(chatHtml).toContain("preventScroll: true");
    expect(chatHtml).toContain(`maxlength="${DEMO_CAPS.maxUserMessageChars}"`);
    expect(chatHtml).toContain('fetch("/playground/chat"');
    expect(chatHtml).toContain("Ask about Stellar and Raven will search its connected sources");
    expect(chatHtml).not.toContain("full power and glory of Stellar Raven");
    expect(chatHtml).toContain("connect an MCP client to <code>/mcp</code>");
    expect(chatHtml).toContain("backdrop-filter:none");
    expect(chatHtml).not.toContain('class="flow"');
    for (const t of ["token", "tool-start", "tool-result", "done", "error"]) {
      expect(chatHtml).toContain(`"${t}"`);
    }
    expect(chatHtml).toContain("stalled"); // the no-result-by-done state
    expect(chatHtml).not.toContain("stepline"); // no step dividers in the live trace either
  });

  it("keeps demo-facing copy free of transport and envelope jargon", () => {
    expect(chatHtml).not.toContain("MCP OAuth transport");
    expect(chatHtml).not.toContain("error.kind");
    expect(chatHtml).not.toContain("soft-empty");
    expect(chatHtml).not.toMatch(/denied/i);
  });
});

describe("static example trace is truthful", () => {
  // src/demo/page.ts claims its hard-coded sample is "a real
  // searchCatalogPage page against the current catalog". Recompute it so a
  // catalog or scoring change that moves the real page fails here with the
  // fresh values to paste in, instead of the locked page silently lying.
  it("sample hits/scores/total match the live engine on the current catalog", () => {
    const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
    const catalog = loadManifest(
      JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8"))
    );
    const page = searchCatalogPage(catalog, { query: "soroban smart contract deploy", limit: 4 });
    expect(lockedHtml).toContain(`${page.hits.length} of ${page.total} matches`);
    let cursor = -1;
    for (const hit of page.hits) {
      const rendered = lockedHtml.indexOf(`<span class="hid">${hit.id}</span>`);
      expect(rendered, `sample is missing or misorders real hit ${hit.id}`).toBeGreaterThan(cursor);
      cursor = rendered;
      expect(lockedHtml, `stale score for ${hit.id}`).toContain(
        `<span class="hscore">${hit.score}</span>`
      );
    }
  });
});

describe("ADR-0003 — no non-exposed refs in emitted page text", () => {
  for (const [state, html] of [
    ["locked", lockedHtml],
    ["authenticated", chatHtml]
  ] as const) {
    it(`${state} page is clean`, () => {
      expect(() => assertNoNonExposedRefsInText(html, `rendered /demo HTML (${state})`)).not.toThrow();
    });
  }
});
