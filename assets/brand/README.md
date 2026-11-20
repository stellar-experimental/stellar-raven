# assets/brand/ — brand masters (upload source-of-truth)

Versioned brand uploads for external dashboards (such as the WorkOS AuthKit sign-in customizer).

URL-loaded assets for external listings live in [`public/`](../../public/) (served as Workers static assets with `public/_headers`):

- `/raven-icon.svg`, `/raven-logo-dark.svg`, `/raven-logo-light.svg` (outlined IBM Plex glyphs because `<img>` SVGs cannot load web fonts; `test/auth.test.ts` requires the site's mark path).
- `/listing/`: Claude connector directory header logo, carousel images, and pattern ([`listing.md`](listing.md), [`research/listing-carousel-evidence-2026-10-07.md`](../../research/listing-carousel-evidence-2026-10-07.md), rebuilt by `tools/`).

Live site assets are generated code in `src/site.ts` (`FAVICON`, `ravenSvg()`, source of truth for `RAVEN_PATH` and `TOKENS`), `src/fonts.ts`, and `src/og.ts`. Regenerate files here if `RAVEN_PATH` or `TOKENS` change.

## Files

| File | Upload slot |
|------|-------------|
| `../../public/raven-icon.svg` | Logo icon, vector — light **and** dark (mark reads on both) |
| `raven-icon-512.png` | Logo icon, 512px raster — light **and** dark |
| `raven-favicon.svg` / `raven-favicon-256.png` | Favicon — light **and** dark (identical to the icon) |
| `../../public/raven-logo-dark.svg` | Logo (full lockup) — dark-mode page (light wordmark) |
| `../../public/raven-logo-light.svg` | Logo (full lockup) — light-mode page (dark wordmark) |

The mark is one orange shape (`#FF5500`) on a transparent background. One icon file and one
favicon file therefore serve the light and dark slots. The full lockups differ only in wordmark
color.

## Palette (from `TOKENS` in `src/site.ts`)

| Token | Hex | AuthKit use |
|-------|-----|-------------|
| `--orange` | `#FF5500` | mark, button background, dark-mode link (see below) |
| on-orange text | `#180A00` | button text (both modes) |
| `--bg` | `#0E150D` | page background — dark |
| `--fog` | `#EEF0E2` | page background — light; wordmark on dark |
| `--green` | `#151F14` | wordmark on light |
| `--orange-2` | `#FF7A33` | link — dark page (7:1) |
| darkened orange | `#B23C00` | link — light page (`#FF5500` fails contrast there; 5.2:1) |

Font family: **IBM Plex Sans** (fallback **Inter**). Corner radius: **Medium**.

## Regenerating

```sh
# icon + favicon (edge-to-edge orange mark, transparent)
magick -background none ../../public/raven-icon.svg -resize 512x512 raven-icon-512.png
magick -background none raven-favicon.svg -resize 256x256 raven-favicon-256.png
```

The SVGs embed the exact `RAVEN_PATH` from `src/site.ts` scaled to fill the frame width.
