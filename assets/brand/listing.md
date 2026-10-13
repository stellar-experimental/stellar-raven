# Connector listing media — design record

The Claude connector directory listing uses the files in [`public/listing/`](../../public/listing/)
and the two site logos in [`public/`](../../public/). They were built on 2026-10-07. This page
records why they look the way they do and how to rebuild them.
[`research/listing-carousel-evidence-2026-10-07.md`](../../research/listing-carousel-evidence-2026-10-07.md)
records the Raven calls behind each carousel frame.

Paper file: "Stellar Raven — connector listing media"
(`https://app.paper.design/file/01M4BDN09G226GZH57QDYZWHWK`). It holds the three carousel
artboards, the three logo artboards, and the brand tokens.

## Files and slots

| Served file | Slot | Source |
|---|---|---|
| `/listing/logo-header-tile.svg` | Logo URL | `tools/outline_logos.py` (`raven-logo-header-tile.svg`). 422×96. |
| `/listing/logo-header-tile@2x.png` | Logo URL, PNG fallback | Paper export of the tile artboard, 844×192, transparent corners. |
| `/listing/carousel-{1,2,3}-*.png` | Carousel images 1–3 | Paper artboards, 1920×1080. |
| `/listing/pattern.svg`, `/listing/pattern@2x.png` | Header background pattern | `tools/make_pattern.py` (`raven-pattern.svg`, `raven-pattern@2x.png`). |
| `/raven-logo-dark.svg`, `/raven-logo-light.svg` | Site logos (existing use) | `tools/outline_logos.py` (`raven-logo-{dark,light}-outlined.svg`). 360×72. |

The icon slot uses `/raven-icon.svg`. The orange mark reads on light and dark grounds.

`outline_logos.py` also writes `raven-logo-header-dark.svg` and `raven-logo-header-light.svg`.
These transparent header lockups are not served. Use the matching one only if the directory shows
the logo on a known single theme.

## Logo decision

The old lockups fell short in a listing header for three reasons.

1. **Font fallback.** They set the wordmark with `font-family`. An `<img>` SVG cannot load web
   fonts, so the wordmark rendered in a Georgia-like face. The new files use outlined paths from
   IBM Plex Serif SemiBold and IBM Plex Mono Medium.
2. **One slot, two themes.** The directory has one Logo URL. A fog wordmark disappears on a light
   page, and a green wordmark disappears on a dark page. The tile carries its own `#0E150D`
   ground, so one file works in both themes.
3. **Small text.** At a 40px header height, the `CODEMODE` line is about 6px tall. The header
   lockups drop it. The 360×72 site logos keep it.

The mark path is unchanged: `RAVEN_PATH` in `src/site.ts`, in `#FF5500`.

## Carousel

**Size: 1920×1080 PNG.** No published directory spec gives a pixel size. 1920×1080 stays sharp on
high-density screens and scales down by clean factors (960, 480). The smallest text is 19px and
most text is 22–30px. At 960px wide, all text reads. At 480px wide, the headline, the prompt, and
the tool rows read.

Each frame shows a branded recreation of a Claude conversation: the prompt, Raven's `search` call,
Raven's `execute` call, and a grounded answer. A left rail gives the outcome and the dated sources.
Every name, number, code line, and date comes from the calls in the evidence file. If the directory
requires real product screenshots, run the same three prompts in claude.ai and capture them.

Frame 2 quotes live directory values as of 2026-10-07 (TVL as of 2026-10-05). Check them again
before a new submission.

## Pattern

One seamless 384×384 tile with no text. Serve it with
`background: #0E150D url(pattern.svg) repeat`. For the PNG, add `background-size: 384px 384px`.

The tile echoes the site's dither globe. It uses the globe's 4×4 Bayer matrix and its 3px cell
size (`FRAG` and `GL_TUNE.px` in `src/site.ts`). A low-frequency field drives sparse dithered
clusters. The field uses only whole-number frequencies across the tile, so the edges join with no
seam. Eighteen orange stars sit on top, at least 22 cells apart with wrap-around.

| Element | Color | Contrast to `#0E150D` |
|---|---|---|
| Ground | `#0E150D` (`--bg`) | — |
| Dither cells (5.7% of cells) | `#1A2818` | 1.2:1 |
| Bright stars | `#FF5500` at 30% (`#562809`) | 1.5:1 |
| Dim stars | `#FF5500` at 16% (`#351F0B`) | 1.19:1 |

Fog text (`#EEF0E2`) keeps 13.4:1 even on a dither cell. The SVG is 15,245 bytes (limit: 20 KB).
A fixed seed (`20261007`) keeps the output reproducible, and the SVG and PNG match pixel for pixel.

## Rebuilding

Both scripts reproduce the served files byte for byte. Run them from this directory and rename the
outputs to the served names in the table above.

```sh
# Pattern (needs Pillow).
uv run --no-project --with pillow python -I tools/make_pattern.py /tmp/raven-pattern

# Logos (needs fontTools and the IBM Plex TTFs from google/fonts).
curl -fLO https://github.com/google/fonts/raw/main/ofl/ibmplexserif/IBMPlexSerif-SemiBold.ttf
curl -fLO https://github.com/google/fonts/raw/main/ofl/ibmplexmono/IBMPlexMono-Medium.ttf
uv run --no-project --with fonttools python -I tools/outline_logos.py . /tmp/raven-logos
```

`test/auth.test.ts` requires each served SVG to carry the site's mark path. If `RAVEN_PATH` or
`TOKENS` in `src/site.ts` changes, update the constants at the top of each script.
