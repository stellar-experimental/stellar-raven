/**
 * Regenerate src/og.ts — the 1200x630 social-preview image served at /og.png.
 *
 *   node scripts/gen-og.mjs   (or: npm run site:og)
 *
 * Requires ImageMagick (`magick`) on PATH. Mirrors the landing hero: the SAME
 * dither-globe as the playground/consent backdrops (shared
 * scripts/lib/dither-globe.mjs — a frozen frame of src/site.ts's WebGL shader),
 * here in hot orange on the left, with editorial type (IBM Plex Serif / Plex
 * Sans / Plex Mono, fetched from google/fonts) set on the right. ImageMagick is
 * used only to composite the legibility scrim + type over the globe; the globe
 * itself is the JS core (real Lambert sphere, not a centred radial gradient).
 * Deterministic — never hand-edit src/og.ts, rerun this instead.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { renderGlobePng } from "./lib/dither-globe.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const work = mkdtempSync(join(tmpdir(), "raven-og-"));
const p = (f) => join(work, f);

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed ${res.status} ${res.statusText}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
}
const magick = (args) => execFileSync("magick", args, { stdio: ["ignore", "ignore", "inherit"] });

const SERIF = p("PlexSerif.ttf");
const SANS = p("PlexSans.ttf");
const MONO = p("PlexMono.ttf");
await download("https://github.com/google/fonts/raw/main/ofl/ibmplexserif/IBMPlexSerif-Bold.ttf", SERIF);
await download("https://github.com/google/fonts/raw/main/ofl/ibmplexsans/IBMPlexSans%5Bwdth,wght%5D.ttf", SANS);
await download("https://github.com/google/fonts/raw/main/ofl/ibmplexmono/IBMPlexMono-Regular.ttf", MONO);

const RAVEN = "path 'M2 14 C8 13 10 9 12 4 C14 9 16 13 22 14 C16 14 13 16 12 20 C11 16 8 14 2 14 Z'";

// 1) the globe — the SHARED Lambert dither sphere (scripts/lib/dither-globe.mjs)
//    in hot orange (#ff5500) on the deep-green canvas (#0e150d), anchored
//    bottom-left like the landing hero. Rendered at half-res (600x315) so the
//    2x pixel-doubled upscale (step 4, -scale, nearest) gives crisp ~2px dots.
writeFileSync(p("globe_half.png"), renderGlobePng({
  cols: 600, rows: 315,
  front: [1.0, 0.333, 0.0], // #ff5500 orange (lit near-hemisphere)
  back: [0.0549, 0.0824, 0.051], // #0e150d deep green (unlit field == canvas)
  // smaller (larger scale shrinks the sphere) and pulled left (more-negative
  // offX) so the bottom-right terminator clears the raven.stellar.org/mcp link.
  scale: 1.62, offX: -0.46, offY: -0.42
}));
// 4) upscale the globe to 1200x630 (crisp pixel-doubling), then a legibility
//    scrim: dark radial pocket over the copy (right) + top band
magick([p("globe_half.png"), "-scale", "1200x630!",
  "(", "-size", "1200x630", "-define", "gradient:center=880,320", "-define", "gradient:radii=700,600",
  "radial-gradient:#0e150dF2-#0e150d00", ")", "-composite",
  "(", "-size", "1200x150", "gradient:#0e150dCC-#0e150d00", ")", "-geometry", "+0+0", "-composite",
  p("og_base.png")]);
// 5) type — right column (x≈600), editorial faces, title stacked on two lines
// The brand appears once (the big title) — the top row is the raven mark plus
// the category eyebrow, not a second wordmark. Tagline leads with the value
// line in bright type, the pillar line beneath it in dim type, both sized to
// stay inside the right column (x 600..1140).
const RX = 648;
magick([p("og_base.png"),
  // Raven mark as a hanging bullet: ~2x size, offset LEFT of the text column so
  // every text line (eyebrow, title, tagline, link) stays left-aligned at RX,
  // while the mark hangs in the margin, vertically centred on the eyebrow line.
  "-fill", "#ff5500", "-draw", `translate ${RX - 75},120 scale 2.6,2.6 ${RAVEN}`,
  "-font", MONO, "-pointsize", "19", "-fill", "#9aa890", "-annotate", `+${RX}+158`, "REMOTE MCP SERVER",
  // LIVE indicator: a filled status dot (not the tiny middot glyph) vertically
  // centred on the eyebrow's optical middle, snug against REMOTE MCP SERVER.
  "-fill", "#ff5500", "-draw", `circle ${RX + 220},151 ${RX + 220},156`,
  "-font", MONO, "-pointsize", "19", "-fill", "#ff5500", "-annotate", `+${RX + 236}+158`, "LIVE",
  "-font", SERIF, "-weight", "700", "-pointsize", "96", "-fill", "#eef0e2", "-annotate", `+${RX}+262`, "Stellar",
  "-font", SERIF, "-weight", "700", "-pointsize", "96", "-fill", "#ff5500", "-annotate", `+${RX}+362`, "Raven",
  "-font", SANS, "-weight", "600", "-pointsize", "29", "-fill", "#eef0e2", "-annotate", `+${RX}+442`, "All of Stellar, one connection.",
  "-font", SANS, "-weight", "400", "-pointsize", "22", "-fill", "#9aa890", "-annotate", `+${RX}+484`, "Docs · data · intel · playbooks. No keys.",
  "-font", MONO, "-pointsize", "21", "-fill", "#ff5500", "-annotate", `+${RX}+560`, "raven.stellar.org/mcp",
  "-resize", "1200x630!", "-strip", p("og_final.png")]);

const b64 = readFileSync(p("og_final.png")).toString("base64");
const out =
  `// AUTO-GENERATED by scripts/gen-og.mjs — do not hand-edit.\n` +
  `// OG/social preview image (1200x630 PNG) served at /og.png, mirroring the\n` +
  `// landing hero (Bayer-dithered globe + editorial IBM Plex title).\n` +
  `export const OG_PNG_BASE64 =\n  "${b64}";\n`;
writeFileSync(join(root, "src", "og.ts"), out);
console.log(`wrote src/og.ts (${b64.length} b64 chars)`);
