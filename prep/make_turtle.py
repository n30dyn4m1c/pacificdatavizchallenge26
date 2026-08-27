#!/usr/bin/env python3
"""
make_turtle.py — the turtle brand assets, from the Challenge's own favicon.

The Pacific Data Viz Challenge's mark is a black turtle with a koru spiral
in its shell. The competition site ships it only as 256×256 favicons, and
past entries (e.g. https://holtzy.github.io/pacific-challenge/) use exactly
that favicon as their logo. This piece does the same, scaled up: the
favicon PNG is upscaled ×2 by interpolating its ALPHA channel only — the
mark is constant-colour (every opaque pixel is #000), so alpha alone
carries the whole shape, and a Catmull-Rom bicubic over it re-renders the
contours with clean anti-aliasing at 512. Recolouring to white is the
same file with the constant RGB flipped, alpha untouched.

    prep/source/pdc-turtle-256.png   committed source: the 256×256 frame,
                                     extracted from the favicon used by
                                     holtzy's previous-years entry (the
                                     identical artwork ships as the
                                     Challenge site's own
                                     /themes/custom/pacific_dataviz/favicon-light.png)
    static/turtle.png                black mark, 512×512 — for paper surfaces
    static/turtle-white.png          white mark, 512×512 — for the dark cover
    static/favicon-light.png         black mark, 256×256 — light browser chrome
    static/favicon-dark.png          white mark, 256×256 — dark browser chrome

All four are written as greyscale+alpha PNGs (colour type 4): the mark has
one colour, so RGBA would spend three bytes per pixel repeating it.

Run: python3 prep/make_turtle.py
Exits non-zero if the source does not verify as the black-on-transparent
mark (i.e. if the source file ever gets replaced by something else).
"""

import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "prep" / "source" / "pdc-turtle-256.png"
OUT = ROOT / "static"
# page marks display at ≤ ~10rem, so ×2 (512) leaves retina headroom at a
# quarter of the ×4 weight; favicons stay at the source's native 256
PAGE_SCALE = 2


# ── a minimal PNG decoder (the repo keeps its pipeline dependency-free) ──────
def decode_png(path):
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path.name}: not a PNG")
    pos, idat = 8, b""
    w = h = bd = ct = il = 0
    while pos < len(data):
        (ln,) = struct.unpack(">I", data[pos : pos + 4])
        typ = data[pos + 4 : pos + 8]
        chunk = data[pos + 8 : pos + 8 + ln]
        if typ == b"IHDR":
            w, h, bd, ct, _, _, il = struct.unpack(">IIBBBBB", chunk)
            if bd != 8 or il != 0:
                raise ValueError(f"{path.name}: bit depth {bd}, interlace {il} — unsupported")
        elif typ == b"IDAT":
            idat += chunk
        pos += 12 + ln
    nch = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[ct]
    raw = zlib.decompress(idat)
    stride = w * nch
    px = bytearray(h * stride)
    prev = bytearray(stride)
    p = 0
    for y in range(h):
        f = raw[p]
        p += 1
        line = bytearray(raw[p : p + stride])
        p += stride
        if f == 1:
            for i in range(nch, stride):
                line[i] = (line[i] + line[i - nch]) & 255
        elif f == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 255
        elif f == 3:
            for i in range(stride):
                a = line[i - nch] if i >= nch else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 255
        elif f == 4:
            for i in range(stride):
                a = line[i - nch] if i >= nch else 0
                b = prev[i]
                c = prev[i - nch] if i >= nch else 0
                pp = a + b - c
                pa, pb, pc = abs(pp - a), abs(pp - b), abs(pp - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 255
        px[y * stride : (y + 1) * stride] = line
        prev = line
    return w, h, ct, nch, bytes(px)


# ── and encoder: greyscale+alpha (ct 4), grey constant ───────────────────────
def encode_ga_png(w, h, grey, alpha):
    def chunk(typ, payload):
        c = struct.pack(">I", len(payload)) + typ + payload
        return c + struct.pack(">I", zlib.crc32(typ + payload) & 0xFFFFFFFF)

    stride = w * 2
    raw = bytearray()
    for y in range(h):
        raw.append(0)  # filter: none
        row = bytearray(stride)
        for x in range(w):
            row[x * 2] = grey
            row[x * 2 + 1] = alpha[y * w + x]
        raw += row
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 4, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


# ── Catmull-Rom bicubic weights, precomputed per output sample ───────────────
def cr_weights(src_n, dst_n):
    """For each output index: (4 source indices, 4 weights), edges clamped."""
    scale = src_n / dst_n
    out = []
    for o in range(dst_n):
        s = (o + 0.5) * scale - 0.5  # source-space centre
        i0 = int(s // 1)
        t = s - i0
        idx = [max(0, min(src_n - 1, i0 - 1 + k)) for k in range(4)]
        # Catmull-Rom kernel, evaluated at t-k for k = -1..2 → t+1, t, 1-t, 2-t
        ts = (t + 1.0, t, 1.0 - t, 2.0 - t)
        wts = []
        for u in ts:
            a = abs(u)
            if a <= 1:
                wts.append(1.5 * a**3 - 2.5 * a**2 + 1)
            else:
                wts.append(-0.5 * a**3 + 2.5 * a**2 - 4.0 * a + 2.0)
        out.append((idx, wts))
    return out


def upscale_alpha(alpha, w, h, scale):
    """Separable Catmull-Rom on the alpha channel only."""
    wx = cr_weights(w, w * scale)
    wy = cr_weights(h, h * scale)
    # horizontal: 256 → 1024 per row
    tmp = [[0.0] * (w * scale) for _ in range(h)]
    for y in range(h):
        row = alpha[y * w : (y + 1) * w]
        tr = tmp[y]
        for o in range(w * scale):
            idx, wts = wx[o]
            tr[o] = (
                row[idx[0]] * wts[0]
                + row[idx[1]] * wts[1]
                + row[idx[2]] * wts[2]
                + row[idx[3]] * wts[3]
            )
    # vertical: 256 → 1024 per column of the intermediate
    W = w * scale
    H = h * scale
    out = bytearray(W * H)
    for o in range(H):
        idx, wts = wy[o]
        r0, r1, r2, r3 = tmp[idx[0]], tmp[idx[1]], tmp[idx[2]], tmp[idx[3]]
        base = o * W
        for x in range(W):
            v = r0[x] * wts[0] + r1[x] * wts[1] + r2[x] * wts[2] + r3[x] * wts[3]
            out[base + x] = 0 if v <= 0 else (255 if v >= 255 else int(v + 0.5))
    return out


def main():
    w, h, ct, nch, px = decode_png(SRC)
    if (w, h) != (256, 256) or ct != 6:
        raise SystemExit(f"make_turtle: unexpected source {w}x{h} ct={ct} — want 256×256 RGBA")

    # verify it really is the black-on-transparent mark, and measure it
    alpha = bytearray(w * h)
    x0, y0, x1, y1 = w, h, -1, -1
    for i in range(w * h):
        r, g, b, a = px[i * 4 : i * 4 + 4]
        if a > 0 and (r, g, b) != (0, 0, 0):
            raise SystemExit(f"make_turtle: non-black opaque pixel {(r, g, b, a)} — wrong source?")
        alpha[i] = a
        if a > 0:
            x0, y0 = min(x0, i % w), min(y0, i // w)
            x1, y1 = max(x1, i % w), max(y1, i // w)
    print(f"source ok: 256×256, mark bbox x {x0}–{x1}, y {y0}–{y1}")

    big = upscale_alpha(alpha, w, h, PAGE_SCALE)
    bw = bh = w * PAGE_SCALE

    OUT.mkdir(exist_ok=True)
    for name, grey in (
        ("turtle.png", 0),
        ("turtle-white.png", 255),
        ("favicon-light.png", 0),
        ("favicon-dark.png", 255),
    ):
        favicon = name.startswith("favicon")
        data, size = (alpha, (w, h)) if favicon else (big, (bw, bh))
        png = encode_ga_png(size[0], size[1], grey, data)
        (OUT / name).write_bytes(png)
        print(f"wrote static/{name}  {size[0]}×{size[1]}  {len(png)} bytes")


if __name__ == "__main__":
    main()
