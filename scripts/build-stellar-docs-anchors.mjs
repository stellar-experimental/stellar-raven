#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Window } from "happy-dom";
import { writeFileAtomic } from "./lib/shared.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = join(ROOT, "src/adapters/stellar-docs-anchors.json");
const ORIGIN = "https://developers.stellar.org";

/** Read rendered text and IDs, including custom IDs and every duplicate heading. */
export function extractPageAnchors(html) {
  const window = new Window();
  try {
    // Parse heading fragments only; the full Next.js payload is large and unnecessary.
    const rendered = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    window.document.body.innerHTML = [...rendered.matchAll(/<h([2-6])\b[^>]*>[\s\S]*?<\/h\1>/gi)].map(([tag]) => tag).join("");
    const anchors = Object.create(null);
    for (const heading of window.document.querySelectorAll("h2[id],h3[id],h4[id],h5[id],h6[id]")) {
      const link = heading.querySelector('a[aria-label="Navigate to header"]');
      if (!link || link.getAttribute("href") !== `#${heading.id}`) continue;
      link.remove();
      const text = heading.textContent.replace(/\u200b/g, "").trim();
      if (text) (anchors[text] ??= []).push(heading.id);
    }
    return Object.fromEntries(Object.entries(anchors).sort(([a], [b]) => a.localeCompare(b, "en")));
  } finally {
    window.close();
  }
}

function readPreviousIndex(path) {
  let previous;
  try {
    previous = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" || error instanceof SyntaxError) return null;
    throw error;
  }
  const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  if (!record(previous) || !record(previous.pages)) return null;
  for (const page of Object.values(previous.pages)) {
    if (!record(page) || !Object.values(page).every((ids) => Array.isArray(ids) && ids.every((id) => typeof id === "string"))) return null;
  }
  return previous;
}

/** Shared by the capture command and the daily drift report. */
export function summarizeAnchorChanges(previous, next) {
  const paths = Object.keys(next.pages);
  const headings = Object.values(next.pages).flatMap((page) => Object.values(page));
  return {
    pages: paths.length,
    headings: headings.reduce((n, ids) => n + ids.length, 0),
    ambiguousHeadings: headings.filter((ids) => ids.length > 1).length,
    changedPages: paths.filter((path) => JSON.stringify(previous?.pages?.[path]) !== JSON.stringify(next.pages[path])).length,
    removedPages: Object.keys(previous?.pages ?? {}).filter((path) => !Object.hasOwn(next.pages, path)).length
  };
}

export async function buildAnchorIndex({ fetchImpl = fetch, outputPath = OUTPUT, errorLog = console.error } = {}) {
  const controller = new AbortController();
  const failures = new Map();
  const fail = (url, error) => {
    const cancelled = controller.signal.aborted && (error === controller.signal.reason || error.name === "AbortError");
    failures.set(url, cancelled ? "Aborted after another URL failed" : error.message);
    controller.abort();
  };
  const get = async (url) => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(30_000)]);
      try {
        controller.signal.throwIfAborted();
        const response = await fetchImpl(url, {
          redirect: "error",
          headers: { "User-Agent": "stellar-experimental/stellar-raven docs-anchor-refresh" },
          signal
        });
        if (response.status >= 500 && attempt === 0) {
          await response.body?.cancel();
          continue;
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();
      } catch (error) {
        const timedOut = error.name === "TimeoutError" || signal.reason?.name === "TimeoutError";
        if (attempt === 0 && !controller.signal.aborted && timedOut) continue;
        throw error;
      }
    }
  };

  try {
    const sitemapUrl = `${ORIGIN}/sitemap.xml`;
    const sitemap = await get(sitemapUrl).catch((error) => { fail(sitemapUrl, error); throw error; });
    const paths = [...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
      const url = new URL(match[1]);
      if (url.origin !== ORIGIN || !/^\/(docs|meetings)\//.test(url.pathname) || url.search || url.hash) return null;
      return url.pathname.replace(/\/index$/, "").replace(/\/$/, "");
    }).filter(Boolean))].sort();
    if (!paths.length) throw new Error("The sitemap contains no docs or meeting pages");

    const pages = Object.create(null);
    let next = 0;
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (!controller.signal.aborted && next < paths.length) {
        const path = paths[next++];
        const url = `${ORIGIN}${path}`;
        try {
          pages[path] = extractPageAnchors(await get(url));
        } catch (error) {
          fail(url, error);
        }
      }
    }));
    if (failures.size) throw new Error(`Anchor capture failed for ${failures.size} URLs`);

    const sortedPages = Object.fromEntries(paths.map((path) => [path, pages[path]]));
    const previous = readPreviousIndex(outputPath);
    const index = { source: sitemapUrl, capturedAt: new Date().toISOString(), pages: sortedPages };
    const summary = summarizeAnchorChanges(previous, index);
    // Preserve capture time when the site headings did not change.
    if (!previous || summary.changedPages || summary.removedPages) {
      writeFileAtomic(outputPath, JSON.stringify(index, null, 2) + "\n");
    }
    return { ...summary, bytes: Buffer.byteLength(readFileSync(outputPath)) };
  } catch (error) {
    for (const [url, message] of failures) errorLog(`${url}: ${message}`);
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildAnchorIndex().then((summary) => console.log(JSON.stringify(summary))).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
