import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { withoutScripts, buildAnchorIndex, extractPageAnchors } from "../scripts/build-stellar-docs-anchors.mjs";

const ORIGIN = "https://developers.stellar.org";
const heading = (text, id) => `<h3 id="${id}"><div><a href="#${id}" aria-label="Navigate to header">​<svg></svg></a></div><span>${text}</span></h3>`;
const directories = [];
const outputPath = () => {
  const directory = mkdtempSync(join(tmpdir(), "stellar-docs-anchors-"));
  directories.push(directory);
  return join(directory, "anchors.json");
};
const sitemap = (paths = ["/docs/a"]) => `<urlset>${paths.map((path) => `<url><loc>${ORIGIN}${path}</loc></url>`).join("")}</urlset>`;
const captureFetch = async (url) => new Response(url.endsWith("/sitemap.xml") ? sitemap() : heading("Example", "example"));

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true });
});

describe("rendered docs anchor capture", () => {
  it("captures custom IDs, duplicates, code text, entities, and Unicode", () => {
    expect(extractPageAnchors([
      '<h1 id="page-title">Page</h1>',
      '<h2 id="sidebar">Sidebar</h2>',
      heading('When to <code>require_auth</code>', 'when-to-require_auth'),
      heading('Application (app)', 'app'),
      heading('Step 2: Alice &amp; Bob’s account', 'step-2-alice-bobs-account'),
      heading('Repeated', 'repeated'),
      heading('Repeated', 'repeated-2'),
      '<script>"<h2 id=\"fake\">Fake</h2>"</script>'
    ].join(''))).toEqual({
      'Application (app)': ['app'],
      Repeated: ['repeated', 'repeated-2'],
      'Step 2: Alice & Bob’s account': ['step-2-alice-bobs-account'],
      'When to require_auth': ['when-to-require_auth']
    });
  });

  it.each(["{", "{}", '{"pages":null}', '{"pages":[]}', '{"pages":{"/docs/a":{"Example":"not-an-array"}}}']) (
    "replaces a malformed previous index: %s", async (previous) => {
      const path = outputPath();
      writeFileSync(path, previous);
      const summary = await buildAnchorIndex({ fetchImpl: captureFetch, outputPath: path });
      expect(summary.changedPages).toBe(1);
      expect(JSON.parse(readFileSync(path, "utf8")).pages).toEqual({ "/docs/a": { Example: ["example"] } });
    }
  );

  it.each(["5xx", "timeout"])("retries a %s failure once and identifies the repository", async (failure) => {
    let attempts = 0;
    const fetchImpl = async (url, init) => {
      expect(init.headers).toEqual({ "User-Agent": "stellar-experimental/stellar-raven docs-anchor-refresh" });
      if (url.endsWith("/sitemap.xml")) return new Response(sitemap());
      if (++attempts === 1) {
        if (failure === "timeout") throw new DOMException("Timed out", "TimeoutError");
        return new Response("Temporary failure", { status: 503 });
      }
      return new Response(heading("Example", "example"));
    };
    const summary = await buildAnchorIndex({ fetchImpl, outputPath: outputPath() });
    expect(attempts).toBe(2);
    expect(summary.headings).toBe(1);
  });

  it("reports an exhausted retry and leaves the previous index intact", async () => {
    const path = outputPath();
    const previous = '{"pages":{}}';
    writeFileSync(path, previous);
    let attempts = 0;
    const errors = [];
    const fetchImpl = async (url) => {
      if (url.endsWith("/sitemap.xml")) return new Response(sitemap());
      attempts += 1;
      return new Response("Unavailable", { status: 503 });
    };
    await expect(buildAnchorIndex({ fetchImpl, outputPath: path, errorLog: (message) => errors.push(message) })).rejects.toThrow("Anchor capture failed");
    expect(attempts).toBe(2);
    expect(errors).toEqual([`${ORIGIN}/docs/a: HTTP 503`]);
    expect(readFileSync(path, "utf8")).toBe(previous);
  });

  it("aborts active requests, reports every failed URL, and stops the queue", async () => {
    const errors = [];
    const calls = [];
    const signals = [];
    const fetchImpl = async (url, init) => {
      calls.push(url);
      if (url.endsWith("/sitemap.xml")) return new Response(sitemap(["/docs/a", "/docs/b", "/docs/c", "/docs/d", "/docs/e"]));
      signals.push(init.signal);
      if (url.endsWith("/a")) return new Response("Missing", { status: 404 });
      return new Promise((_, reject) => {
        init.signal.addEventListener("abort", () => reject(init.signal.reason), { once: true });
      });
    };
    await expect(buildAnchorIndex({ fetchImpl, outputPath: outputPath(), errorLog: (message) => errors.push(message) })).rejects.toThrow("Anchor capture failed for 4 URLs");
    expect(calls).toHaveLength(5);
    expect(calls).not.toContain(`${ORIGIN}/docs/e`);
    expect(signals.every((signal) => signal.aborted)).toBe(true);
    expect(errors).toEqual([
      `${ORIGIN}/docs/a: HTTP 404`,
      `${ORIGIN}/docs/b: Aborted after another URL failed`,
      `${ORIGIN}/docs/c: Aborted after another URL failed`,
      `${ORIGIN}/docs/d: Aborted after another URL failed`
    ]);
  });

  it("preserves the capture time and bytes when the page data is unchanged", async () => {
    const path = outputPath();
    await buildAnchorIndex({ fetchImpl: captureFetch, outputPath: path });
    const previous = readFileSync(path, "utf8");
    const summary = await buildAnchorIndex({ fetchImpl: captureFetch, outputPath: path });
    expect(summary.changedPages).toBe(0);
    expect(summary.removedPages).toBe(0);
    expect(readFileSync(path, "utf8")).toBe(previous);
  });
});

describe("withoutScripts", () => {
  it("drops script elements, including upper-case and spaced end tags", () => {
    const html = '<h2 id="a">A</h2><script>var x = "<h2 id=\'b\'>B</h2>";</script ><h3 id="c">C</h3><SCRIPT type="x">y</SCRIPT>tail';
    expect(withoutScripts(html)).toBe('<h2 id="a">A</h2><h3 id="c">C</h3>tail');
  });
  it("drops an unterminated script to the end", () => {
    expect(withoutScripts('<h2 id="a">A</h2><script>never closed <h2 id="b">B</h2>')).toBe('<h2 id="a">A</h2>');
  });
});
