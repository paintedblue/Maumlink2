# /// script
# requires-python = ">=3.10"
# dependencies = ["fonttools[woff]==4.66.1", "brotli"]
# ///
"""Build portable, outlined wordmarks from the local OFL Noto Sans KR font.
Run: uv run scripts/build-brand.py && pnpm app-icons
The editable symbol master is public/brand/symbol.svg; no network fonts are used.
"""
from pathlib import Path
import re
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/brand"
DOC = ROOT / "docs/brand"
font = TTFont(ROOT / "public/fonts/NotoSansKR-700.woff2")
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
units = font["head"].unitsPerEm
master = (OUT / "symbol.svg").read_text()
body = re.sub(r"<svg[^>]*>|</svg>|<title>.*?</title>", "", master).strip()


def korean_wordmark(x, baseline, size, color):
    # 마 / 음 / 잇 / 다, drawn as legible rounded Korean letterforms.
    letters = [
        '<rect x="8" y="22" width="30" height="45" rx="6"/><path d="M56 16V78M56 44H71"/>',
        '<ellipse cx="38" cy="26" rx="19" ry="14"/><path d="M10 49H66"/><rect x="17" y="64" width="42" height="23" rx="5"/>',
        '<circle cx="27" cy="29" r="15"/><path d="M59 14V46M36 61Q31 76 15 86M36 61Q42 77 59 86"/>',
        '<path d="M39 23H12Q8 23 8 29V63Q8 68 13 68H39M57 16V78M57 44H72"/>',
    ]
    art = ''.join(f'<g transform="translate({i*84} 0)">{letter}</g>' for i, letter in enumerate(letters))
    return f'<g transform="translate({x} {baseline-size*.86:g}) scale({size/100:g})" fill="none" stroke="{color}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">{art}</g>'


def lettering(text, x, baseline, size, color, tracking=0):
    if text == "마음잇다":
        return korean_wordmark(x, baseline, size, color)
    scale = size / units
    parts = []
    for char in text:
        glyph = glyphs[cmap[ord(char)]]
        pen = SVGPathPen(glyphs)
        glyph.draw(pen)
        parts.append(f'<path d="{pen.getCommands()}" transform="translate({x:g} {baseline:g}) scale({scale:g} {-scale:g})"/>')
        x += glyph.width * scale + tracking
    return f'<g fill="{color}">' + "".join(parts) + "</g>"


def svg(width, height, content, title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" fill="none"><title>{title}</title>{content}</svg>\n'


def mark(x=0, y=0, size=120, variant="color", ident="a"):
    art = body.replace("friend-gap", f"friend-gap-{ident}")
    if variant in ["mono", "white"]:
        # Keep the faces visible in the one-ink export using white negative details.
        ink = "#554478" if variant == "mono" else "#FFFFFF"
        detail = "#FFFFFF" if variant == "mono" else "#554478"
        art = art.replace("#554478", detail)
        for color in ["#FFB59B", "#B9A7EC", "#EF907D", "#A18AD8"]:
            art = art.replace(color, ink)
    # The soft peach/lavender mark remains legible on both light and dark fields.
    return f'<g transform="translate({x} {y}) scale({size / 120:g})">{art}</g>'


for variant in ["mono", "reverse", "white"]:
    (OUT / f"symbol-{variant}.svg").write_text(svg(120, 120, mark(variant=variant), "Maum:Link"))
for variant in ["color", "mono", "reverse"]:
    ink = "#FFFFFF" if variant == "reverse" else "#554478"
    suffix = "" if variant == "color" else f"-{variant}"
    (OUT / f"logo-ko{suffix}.svg").write_text(svg(310, 100, mark(size=100, variant=variant) + lettering("마음잇다", 115, 66, 54, ink, -1.4), "마음잇다"))
    (OUT / f"logo-en{suffix}.svg").write_text(svg(375, 100, mark(size=100, variant=variant) + lettering("Maum:Link", 115, 65, 46, ink, -1.5), "Maum:Link"))
    (OUT / f"logo-signature{suffix}.svg").write_text(svg(325, 120, mark(variant=variant) + lettering("마음잇다", 138, 66, 50, ink, -1.3) + lettering("Maum:Link", 140, 92, 17, ink, 1.4), "마음잇다 · Maum:Link"))

# A single presentation sheet. All lettering is outlined, including Korean.
board = '<rect width="1440" height="1080" fill="#FFF9F1"/>'
board += lettering("Maum:Link", 76, 78, 24, "#554478", -.5)
board += lettering("HEART FRIENDS / 02", 1040, 78, 14, "#81738F", 1)
board += '<path d="M76 108H1364" stroke="#E7DFF0"/>'
board += mark(204, 171, 272, ident="hero")
board += lettering("마음잇다", 518, 336, 112, "#554478", -3)
board += lettering("Maum:Link", 522, 390, 29, "#81738F", 3)
board += lettering("내 마음도, 네 마음도 소중해.", 518, 464, 23, "#81738F", -.4)
board += '<rect x="76" y="564" width="404" height="320" rx="20" fill="#FFFFFF"/>'
board += '<rect x="498" y="564" width="404" height="320" rx="20" fill="#554478"/>'
board += '<rect x="920" y="564" width="444" height="320" rx="20" fill="#F0EBFA"/>'
board += lettering("01 / SINGLE COLOR", 106, 608, 13, "#81738F", .8)
board += mark(194, 639, 168, variant="mono", ident="mono")
board += lettering("02 / REVERSED", 528, 608, 13, "#E2D8F2", .8)
board += mark(616, 639, 168, variant="reverse", ident="reverse")
board += lettering("03 / APP ICON", 950, 608, 13, "#81738F", .8)
board += '<rect x="1062" y="656" width="160" height="160" rx="36" fill="#FFF9F1"/>'
board += mark(1076, 670, 132, variant="reverse", ident="app")
for x, name, color in [(76, "PLUM / #554478", "#554478"), (522, "PEACH / #FFB59B", "#FFB59B"), (968, "LAVENDER / #B9A7EC", "#B9A7EC")]:
    board += f'<circle cx="{x+18}" cy="952" r="18" fill="{color}" stroke="#E7DFF0"/>'
    board += lettering(name, x+50, 957, 13, "#81738F", .25)
board += lettering("마음과 마음이 만나는 친구.", 76, 1032, 19, "#554478", -.3)
board += lettering("Little hearts. Growing together.", 966, 1032, 14, "#81738F", 0)
(DOC / "logo-presentation.svg").write_text(svg(1440, 1080, board, "마음잇다 로고 디자인"))
print("Built outlined Korean, English, bilingual, monochrome and reversed logo assets.")
