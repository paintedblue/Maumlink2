# /// script
# requires-python = ">=3.10"
# dependencies = ["fonttools[woff]>=4.50", "brotli"]
# ///
"""
`pnpm fonts` — builds the self-hosted Korean web font (PRD D14/D15, §9 budget).

Downloads Noto Sans KR (variable, OFL) from the Google Fonts repository, instances
weights 400 and 700, and subsets each to:
  • the 2,350 KS X 1001 Hangul syllables (covers modern Korean text),
  • Hangul compatibility jamo, CJK punctuation, basic/Latin-1, general punctuation,
    arrows, circled numbers, geometric shapes, hearts,
  • plus every character that actually appears in content/*.json (so draft or
    unusual syllables can never render as tofu).
Outputs public/fonts/NotoSansKR-{400,700}.woff2 (~400 KB each instead of ~5 MB of
unicode-range slices), fully precached for offline use.
"""
from __future__ import annotations

import io
import json
import sys
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "fonts"
CACHE = ROOT / ".tmp" / "NotoSansKR[wght].ttf"
URL = "https://github.com/google/fonts/raw/main/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf"

BASE_RANGES = [
    (0x0020, 0x007E),  # Basic Latin
    (0x00A0, 0x00FF),  # Latin-1 (×, ·, ±, «»)
    (0x2010, 0x2027),  # dashes, quotes, bullets, ellipsis
    (0x2030, 0x205E),  # ‰ ′ ″ ‹ › ‼ ⁇ …
    (0x20A9, 0x20A9),  # ₩
    (0x2190, 0x2199),  # arrows
    (0x2460, 0x2473),  # ①–⑳
    (0x25A0, 0x25FF),  # geometric shapes (□ ■ ○ ●)
    (0x2660, 0x2667),  # ♠♡♢♣♤♥♦♧
    (0x3000, 0x303F),  # CJK punctuation 「」『』、。
    (0x3131, 0x318E),  # Hangul compatibility jamo (ㅋㅋㅋ, ㅠㅠ)
    (0xFF01, 0xFF5E),  # fullwidth forms (＂ ！ ？)
]


def ksx1001_syllables() -> set[int]:
    """The 2,350 precomposed syllables of KS X 1001 (strict codec: iso2022_kr; Python's
    euc_kr is the CP949 superset and would return all 11,172)."""
    out: set[int] = set()
    for cp in range(0xAC00, 0xD7A4):
        try:
            chr(cp).encode("iso2022_kr")
            out.add(cp)
        except UnicodeEncodeError:
            pass
    assert len(out) == 2350, len(out)
    return out


def content_codepoints() -> set[int]:
    cps: set[int] = set()
    for p in (ROOT / "content").rglob("*.json"):
        text = json.dumps(json.loads(p.read_text("utf-8")), ensure_ascii=False)
        cps.update(ord(c) for c in text)
    return cps


def download() -> bytes:
    if CACHE.exists():
        return CACHE.read_bytes()
    print(f"↓ downloading {URL}")
    with urllib.request.urlopen(URL, timeout=120) as r:
        data = r.read()
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    CACHE.write_bytes(data)
    return data


def build(weight: int, src: bytes, unicodes: set[int]) -> Path:
    font = TTFont(io.BytesIO(src))
    static = instancer.instantiateVariableFont(font, {"wght": weight}, inplace=False)
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["kern", "liga", "ccmp", "mark", "mkmk", "locl"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    opts.hinting = False
    opts.desubroutinize = True
    s = subset.Subsetter(options=opts)
    s.populate(unicodes=sorted(unicodes))
    s.subset(static)
    OUT.mkdir(parents=True, exist_ok=True)
    out = OUT / f"NotoSansKR-{weight}.woff2"
    static.save(out)
    return out


def main() -> int:
    unicodes = ksx1001_syllables()
    for lo, hi in BASE_RANGES:
        unicodes.update(range(lo, hi + 1))
    content = content_codepoints()
    extra = {cp for cp in content if cp not in unicodes and cp > 0x7F}
    unicodes.update(content)
    src = download()
    for w in (400, 700):
        out = build(w, src, unicodes)
        print(f"✔ {out.relative_to(ROOT)}  {out.stat().st_size / 1024:.0f} KB")
    print(f"  {len(unicodes)} code points ({len(extra)} from content outside the base set)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
