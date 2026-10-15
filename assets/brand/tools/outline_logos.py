"""Build outlined Stellar Raven logo SVGs (text converted to paths)."""
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONTS = Path(sys.argv[1])
OUT = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

MARK = "M2 14C8 13 10 9 12 4C14 9 16 13 22 14C16 14 13 16 12 20C11 16 8 14 2 14Z"
ORANGE, FOG, GREEN, DIM, DIM_LIGHT, BG = "#FF5500", "#EEF0E2", "#151F14", "#9AA890", "#6B7A63", "#0E150D"

serif = TTFont(FONTS / "IBMPlexSerif-SemiBold.ttf")
mono = TTFont(FONTS / "IBMPlexMono-Medium.ttf")


def text_path(font, text, size, x, baseline, tracking=0.0):
    """Return (svg path d, advance width) for text set at size with tracking in px."""
    upm = font["head"].unitsPerEm
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    hmtx = font["hmtx"]
    s = size / upm
    pen = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
    cx = x
    for i, ch in enumerate(text):
        g = cmap[ord(ch)]
        tp = TransformPen(pen, (s, 0, 0, -s, cx, baseline))
        gs[g].draw(tp)
        cx += hmtx[g][0] * s
        if i < len(text) - 1:
            cx += tracking
    return pen.getCommands(), cx - x


def mark_g(tx, ty, scale):
    return f'<g transform="translate({tx} {ty}) scale({scale})"><path d="{MARK}" fill="{ORANGE}"/></g>'


def write(name, w, h, body):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">\n'
           f'{body}\n</svg>\n')
    (OUT / name).write_text(svg)
    print(name, w, h)


# 1. Existing 360x72 lockups, same geometry, text outlined.
for name, word, sub in (("raven-logo-dark-outlined.svg", FOG, DIM),
                        ("raven-logo-light-outlined.svg", GREEN, DIM_LIGHT)):
    d1, _ = text_path(serif, "Stellar Raven", 28, 86, 34, -0.4)
    d2, _ = text_path(mono, "CODEMODE", 12, 88, 54, 2.9)
    write(name, 360, 72,
          "  " + mark_g(6, 14, 1.83) + "\n"
          f'  <path d="{d1}" fill="{word}"/>\n'
          f'  <path d="{d2}" fill="{sub}"/>')

# 2. Header wordmark: mark + "Stellar Raven" only, sized for a listing header.
#    Mark spans x 2..22, y 4..20 in its 24-unit box (20 x 16).
H = 96
size = 44
mscale = 3.0                       # mark 60 x 48
mark_w, mark_h = 20 * mscale, 16 * mscale
gap = 20
d, adv = text_path(serif, "Stellar Raven", size, 0, 0, -0.66)
# Plex Serif cap height 698/1000 em; center caps on the mark's vertical center.
cap = 0.698 * size


def header(pad_x, word_color, tile=None):
    w = round(pad_x * 2 + mark_w + gap + adv)
    my = (H - mark_h) / 2
    mx = pad_x
    baseline = H / 2 + cap / 2
    tx = mx + mark_w + gap
    dd, _ = text_path(serif, "Stellar Raven", size, tx, baseline, -0.66)
    parts = []
    if tile:
        parts.append(f'  <rect width="{w}" height="{H}" rx="20" fill="{tile}"/>')
    parts.append("  " + mark_g(mx - 2 * mscale, my - 4 * mscale, mscale))
    parts.append(f'  <path d="{dd}" fill="{word_color}"/>')
    return w, "\n".join(parts)

w, body = header(32, FOG, tile=BG)
write("raven-logo-header-tile.svg", w, H, body)
w, body = header(4, FOG)
write("raven-logo-header-dark.svg", w, H, body)
w, body = header(4, GREEN)
write("raven-logo-header-light.svg", w, H, body)
