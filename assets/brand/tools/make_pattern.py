"""Build the Stellar Raven header background pattern.

One seamless tile: a Bayer-dithered field on #0E150D, using the same 4x4 matrix and
3px cell size as the site's dither globe (src/site.ts FRAG / GL_TUNE.px), plus a few
orange star cells. Writes the SVG tile and a pixel-exact 2x PNG from one cell grid.

usage: python make_pattern.py <out_dir>
"""
import math
import random
import sys
from pathlib import Path

from PIL import Image

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)

TILE = 384          # px; multiple of CELL * 4 so the Bayer period wraps cleanly
CELL = 3            # px; matches GL_TUNE.px on the site
N = TILE // CELL    # 128 cells per side

BG = "#0E150D"      # --bg
DOT = "#1A2818"     # one step above --green-2 (#182617): low-contrast dither cells
STAR = "#FF5500"    # --orange, used at low opacity
STAR_OPACITY = 0.30
STAR_DIM_OPACITY = 0.16

BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
TAU = 2 * math.pi


def field(i, j):
    """Periodic field in [0, 1]; integer frequencies keep the tile seamless."""
    u, v = i / N, j / N
    f = (0.55 * math.sin(TAU * (u + 0.15)) * math.cos(TAU * v)
         + 0.30 * math.sin(TAU * (2 * u + 3 * v) + 1.3)
         + 0.25 * math.cos(TAU * (3 * u - v) + 0.4)
         + 0.15 * math.sin(TAU * (4 * v - u) + 2.1))
    return (f + 1.25) / 2.5


def density(i, j):
    shape = max(0.0, field(i, j) - 0.48) / 0.52
    return 0.34 * shape ** 1.3


dots = [[density(i, j) > BAYER[j % 4][i % 4] / 16 for i in range(N)] for j in range(N)]

# Sparse star field: a fixed seed keeps the output reproducible.
rng = random.Random(20261007)
stars = []          # (i, j, opacity, plus_shape)
MIN_GAP = 22        # cells, measured with wrap-around so the tile edges count


def wrap_dist(a, b):
    d = abs(a - b) % N
    return min(d, N - d)


while len(stars) < 18:
    i, j = rng.randrange(N), rng.randrange(N)
    if all(math.hypot(wrap_dist(i, si), wrap_dist(j, sj)) >= MIN_GAP for si, sj, *_ in stars):
        big = len(stars) < 4
        stars.append((i, j, STAR_OPACITY if big else STAR_DIM_OPACITY, big))
star_cells = {}
for i, j, op, big in stars:
    cells = [(0, 0)] + ([(1, 0), (-1, 0), (0, 1), (0, -1)] if big else [])
    for di, dj in cells:
        key = ((i + di) % N, (j + dj) % N)
        star_cells[key] = max(star_cells.get(key, 0), op if (di, dj) == (0, 0) else op * 0.55)
        dots[key[1]][key[0]] = False   # a star cell replaces a dither cell


def runs(row):
    """Yield (start, length) for each run of True cells in a row."""
    i = 0
    while i < N:
        if row[i]:
            s = i
            while i < N and row[i]:
                i += 1
            yield s, i - s
        else:
            i += 1


parts = []
for j, row in enumerate(dots):
    for s, n in runs(row):
        parts.append(f"M{s * CELL} {j * CELL}h{n * CELL}v{CELL}h-{n * CELL}z")
dot_path = "".join(parts)

by_op = {}
for (i, j), op in star_cells.items():
    by_op.setdefault(round(op, 3), []).append(f"M{i * CELL} {j * CELL}h{CELL}v{CELL}h-{CELL}z")

svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{TILE}" height="{TILE}" '
       f'viewBox="0 0 {TILE} {TILE}" shape-rendering="crispEdges">',
       f'<rect width="{TILE}" height="{TILE}" fill="{BG}"/>',
       f'<path fill="{DOT}" d="{dot_path}"/>']
for op, ps in sorted(by_op.items()):
    svg.append(f'<path fill="{STAR}" fill-opacity="{op}" d="{"".join(ps)}"/>')
svg.append("</svg>\n")
(OUT / "raven-pattern.svg").write_text("".join(svg))


def hex_rgb(h):
    return tuple(int(h[k:k + 2], 16) for k in (1, 3, 5))


def over(fg, bg, a):
    return tuple(round(f * a + b * (1 - a)) for f, b in zip(fg, bg))


SCALE = 2
img = Image.new("RGB", (TILE * SCALE, TILE * SCALE), hex_rgb(BG))
px = img.load()
cs = CELL * SCALE
for j in range(N):
    for i in range(N):
        col = None
        if dots[j][i]:
            col = hex_rgb(DOT)
        elif (i, j) in star_cells:
            col = over(hex_rgb(STAR), hex_rgb(BG), star_cells[(i, j)])
        if col:
            for y in range(j * cs, (j + 1) * cs):
                for x in range(i * cs, (i + 1) * cs):
                    px[x, y] = col
img.save(OUT / "raven-pattern@2x.png", optimize=True)

on = sum(map(sum, dots))
print(f"tile {TILE}px, {N}x{N} cells, {on} dither cells ({on / N / N:.1%}), "
      f"{len(star_cells)} star cells, svg {len(''.join(svg))} bytes")
