#!/usr/bin/env python3
"""Generate the social share image (static/share/og.png, 1200x630).

Hand-drawn with PIL so it is reproducible offline: warm paper, the title,
and a row of ONI-style diverging bars with 2026 standing out — the piece's
one visual sentence. Re-run: python3 prep/make_share_image.py
"""

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
PAPER = "#f7f3ea"
INK = "#1d1a14"
INK_2 = "#55503f"
INK_3 = "#8a8578"
WARM = "#c74331"
COOL = "#2a78d6"
GRID = "#e5ddcc"

FONT_SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
FONT_SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_SANS_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

img = Image.new("RGB", (W, H), PAPER)
d = ImageDraw.Draw(img)

def font(path, size):
    return ImageFont.truetype(path, size)

# ── diverging bar field along the bottom (schematic ONI strip) ───────────────
# (value, is_2026) — warm bars up, cool bars down from a shared baseline
vals = [
    0.4, -0.6, 0.9, -0.3, 1.9, -0.8, 0.5, -1.1, 0.7, 2.3,  # 1982 & 1997 stand tall
    -0.5, 0.4, -0.9, 1.6, -0.4, 0.6, -1.3, 0.5, 2.1, -0.7,  # 2015
    0.4, -0.6, 1.8, -0.5, -0.4, 2.6,  # 2023, weak la niña, then 2026 tallest
]
n = len(vals)
margin = 90
bw = (W - 2 * margin) / n
baseline = H - 140
unit = 36  # px per °C-ish
d.line([(margin - 20, baseline), (W - margin + 20, baseline)], fill=GRID, width=2)
for i, v in enumerate(vals):
    x0 = margin + i * bw + bw * 0.22
    x1 = margin + (i + 1) * bw - bw * 0.22
    last = i == n - 1
    c = WARM if v > 0 else COOL
    h = abs(v) * unit
    y0, y1 = (baseline - h, baseline) if v > 0 else (baseline, baseline + h)
    d.rectangle([x0, y0, x1, y1], fill=c, outline=INK if last else None, width=3 if last else 0)

# label the tall events
f_bar = font(FONT_SANS_B, 22)
for i, name in [(4, "1982"), (9, "1997"), (18, "2015"), (22, "2023")]:
    x = margin + i * bw + bw / 2
    y = baseline - vals[i] * unit - 34
    d.text((x, y), name, font=f_bar, fill=INK_3, anchor="mm")
x = margin + (n - 1) * bw + bw / 2
y = baseline - vals[-1] * unit - 36
d.text((x, y), "2026", font=font(FONT_SANS_B, 26), fill=WARM, anchor="mm")

# ── type ─────────────────────────────────────────────────────────────────────
f_kick = font(FONT_SANS_B, 24)
f_sub = font(FONT_SANS, 34)

# title sized to fit: start big, shrink until it clears the right margin
title = "The Ocean Knows First"
size = 84
while size > 40:
    f_title = font(FONT_SERIF, size)
    if d.textlength(title, font=f_title) <= W - 2 * margin:
        break
    size -= 2

d.text((margin, 80), "PACIFIC DATAVIZ CHALLENGE 2026", font=f_kick, fill=INK_3)
d.text((margin - 3, 128), title, font=f_title, fill=INK)
d.text(
    (margin, 250),
    "El Niño, Papua New Guinea, and the months to prepare.",
    font=f_sub,
    fill=INK_2,
)
d.text(
    (margin, 306),
    "The drought signal is read in the ocean, months ahead. So is the preparation.",
    font=font(FONT_SANS, 26),
    fill=INK_3,
)

import os
os.makedirs("static/share", exist_ok=True)
img.save("static/share/og.png", optimize=True)
print("wrote static/share/og.png", img.size)
