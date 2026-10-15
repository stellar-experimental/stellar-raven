# Connector listing media — design record

The Claude connector directory listing uses the files in [`public/listing/`](../../public/listing/)
and the two site logos in [`public/`](../../public/). The files date from 2026-10-07. This page
records the design reasons and the rebuild steps.
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

The old lockups did not work in a listing header, for three reasons.

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

Each frame recreates a Claude conversation. It shows the prompt, Raven's `search` call, Raven's
`execute` call, and an answer with sources. A left rail gives the outcome and the dated sources.
The evidence file records the prompts, the calls, and the values that the answers cite. It does not
record the search totals or the `scfAsOf` date range that the frames also show. If the directory
requires real product screenshots, run the same three prompts in claude.ai and capture them.

The frames quote live values. Check them against the evidence file before a new submission.

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
outputs to the served names in the table above. The commands pin the verified package versions and
an immutable `google/fonts` commit.

```sh
# Pattern.
uv run --no-project --with pillow==11.3.0 python -I tools/make_pattern.py /tmp/raven-pattern

# Logos. The fonts are IBM Plex (SIL Open Font License) from google/fonts.
F=https://github.com/google/fonts/raw/94301472b4d809299b4775bc6502592b83dd6934/ofl
curl -fLO "$F/ibmplexserif/IBMPlexSerif-SemiBold.ttf"
curl -fLO "$F/ibmplexmono/IBMPlexMono-Medium.ttf"
shasum -a 256 -c <<'EOF'
27ce4d105591b48f666b228e1e399838a704594efea22b730000951bea700a60  IBMPlexSerif-SemiBold.ttf
a9b4c49bb299e05b5f6c481e7fb5e78943d2793249a0c8874ab574a2d1ea6755  IBMPlexMono-Medium.ttf
EOF
uv run --no-project --with fonttools==4.59.0 python -I tools/outline_logos.py . /tmp/raven-logos
```

The pinned build was verified with Python 3.9.6 and zlib 1.2.12. Pillow 12.3.0 and fontTools
4.67.0 also gave identical files on 2026-10-15.

`test/auth.test.ts` requires `raven-icon.svg`, `raven-logo-dark.svg`, and `raven-logo-light.svg` to
carry the site's mark path. It does not check the listing tile or the pattern. If `RAVEN_PATH` or
`TOKENS` in `src/site.ts` changes, update the constants at the top of each script.
