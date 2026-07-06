#!/usr/bin/env python3
"""Generate PWA icons without external dependencies."""

import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "icons"
BG = (13, 15, 10)
SAFFRON = (232, 132, 26)
GOLD = (244, 196, 48)
TEAL = (26, 107, 92)


def set_pixel(buf, size, x, y, color):
    if 0 <= x < size and 0 <= y < size:
        i = (y * size + x) * 3
        buf[i], buf[i + 1], buf[i + 2] = color


def fill_circle(buf, size, cx, cy, r, color):
    r2 = r * r
    for y in range(size):
        for x in range(size):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r2:
                set_pixel(buf, size, x, y, color)


def draw_icon(size, maskable=False):
    buf = bytearray(size * size * 3)
    for i in range(0, len(buf), 3):
        buf[i : i + 3] = BG

    inset = int(size * 0.12) if maskable else 0
    cx = cy = size // 2
    outer = int(size * 0.42) - inset
    inner = int(size * 0.28) - inset // 2

    fill_circle(buf, size, cx, cy, outer, SAFFRON)
    fill_circle(buf, size, cx, cy, inner, BG)
    fill_circle(buf, size, cx, cy, int(size * 0.12), GOLD)

    # Stylized subcontinent wedge
    margin = int(size * 0.22)
    for y in range(margin, size - margin):
        t = (y - margin) / max(1, size - 2 * margin)
        x0 = int(margin + t * size * 0.08)
        x1 = int(size - margin - (1 - t) * size * 0.18)
        for x in range(x0, x1):
            if (x - cx) ** 2 + (y - cy) ** 2 <= inner ** 2:
                set_pixel(buf, size, x, y, TEAL)

    return bytes(buf)


def write_png(path, size, pixels):
    raw = b""
    stride = size * 3
    for y in range(size):
        raw += b"\x00" + pixels[y * stride : (y + 1) * stride]

    compressed = zlib.compress(raw, 9)

    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", ihdr)
    png += chunk(b"IDAT", compressed)
    png += chunk(b"IEND", b"")

    path.write_bytes(png)


def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    for name, size, maskable in [
        ("icon-192.png", 192, False),
        ("icon-512.png", 512, False),
        ("icon-maskable-512.png", 512, True),
    ]:
        pixels = draw_icon(size, maskable=maskable)
        write_png(ROOT / name, size, pixels)
        print(f"Wrote {ROOT / name}")


if __name__ == "__main__":
    main()
