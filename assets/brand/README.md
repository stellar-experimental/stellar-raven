# assets/brand/ — brand masters (upload source-of-truth)

These brand assets are for external dashboards. The WorkOS AuthKit sign-in customizer uses them.
The Worker does not serve them, and `wrangler.jsonc` has no `assets` binding. These files keep
brand uploads versioned and reproducible.

The live site holds its own assets as generated code:

- `src/site.ts` holds the `FAVICON` data URI and `ravenSvg()`.
- `src/fonts.ts` holds the fonts.
- `src/og.ts` holds `/og.png`.

`src/site.ts` is the source of truth for the shape (`RAVEN_PATH`) and the palette (`TOKENS`).
If those blocks change, regenerate the files here.

## Files

| File | Upload slot |
|------|-------------|
| `raven-icon.svg` / `raven-icon-512.png` | Logo icon — light **and** dark (mark reads on both) |
| `raven-favicon.svg` / `raven-favicon-256.png` | Favicon — light **and** dark (identical to the icon) |
| `raven-logo-dark.svg` | Logo (full lockup) — dark-mode page (light wordmark) |
| `raven-logo-light.svg` | Logo (full lockup) — light-mode page (dark wordmark) |

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
magick -background none raven-icon.svg -resize 512x512 raven-icon-512.png
magick -background none raven-favicon.svg -resize 256x256 raven-favicon-256.png
```

The SVGs embed the exact `RAVEN_PATH` from `src/site.ts` scaled to fill the frame width.
