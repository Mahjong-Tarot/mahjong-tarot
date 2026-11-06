#!/usr/bin/env python3
# Build the Amazon KDP upload set for "The Mahjong Mirror" from blocks.json (rendered by generate.py).
#
#   out/interior-6x9-bw.pdf      paperback interior, black & white (recommended: cheapest print cost)
#   out/interior-6x9-color.pdf   paperback interior, standard color (same pagination)
#   out/cover-6x9.pdf            paperback full-wrap cover, spine sized from the page count
#   out/the-mahjong-mirror.epub  Kindle eBook (reflowable EPUB 3)
#   out/kindle-cover.jpg         Kindle eBook cover, 1600 x 2560
#
# Needs: Google Chrome (headless print), poppler (pdftotext/pdfinfo), libwebp (dwebp), ffmpeg.
# Run:   python3 book/build.py && python3 book/kdp/build_kdp.py
import os, re, json, runpy, shutil, subprocess, zipfile, uuid, html, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
BOOK = os.path.dirname(HERE)
OUT  = f"{HERE}/out"
WORK = f"{HERE}/.work"
FONTS= f"{HERE}/fonts"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# ---- book metadata (fill ISBN once KDP assigns one; the line is omitted while empty) ----
TITLE    = "The Mahjong Mirror"
SUBTITLE = "Your Path to Wiser Decisions"
AUTHOR   = "Bill Hajdu"
ROLE     = "Mahjong Tarot Reader & Chinese Astrologer"
YEAR     = 2026
ISBN_PRINT = ""
SITE     = "mahjongtarot.com"

# ---- trim + KDP paper constants (inches) ----
TRIM_W, TRIM_H, BLEED = 6.0, 9.0, 0.125
SPINE_PER_PAGE = 0.002252   # KDP white paper and standard color paper are the same thickness

os.makedirs(OUT, exist_ok=True); os.makedirs(WORK, exist_ok=True)
G = runpy.run_path(f"{BOOK}/generate.py")          # also refreshes book.html (deterministic)
BLOCKS, TOC, BODY = G["BLOCKS"], G["toc"], G["body_html"]
esc = G["esc"]

def chrome(*args):
    subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
                    "--no-pdf-header-footer", "--allow-file-access-from-files", *args],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def print_pdf(html_path, pdf_path):
    chrome(f"--print-to-pdf={pdf_path}", "file://" + html_path)

def pdf_pages(pdf_path):
    txt = subprocess.run(["pdftotext", "-layout", pdf_path, "-"], capture_output=True, text=True, check=True).stdout
    return txt.split("\f")

# chapter heading -> its subtitle (Appendix A/B, Takeaways)
CHSUB = {}
for k, b in enumerate(BLOCKS):
    nxt = BLOCKS[k + 1]["type"] if k + 1 < len(BLOCKS) else None
    if b["type"] == "chapter" and (nxt == "chsub" or (nxt == "subhead" and b.get("appendix"))):
        CHSUB[b["text"].upper()] = BLOCKS[k + 1]["text"]

# ---- black & white palette: brand reds/greens -> slate ink tokens ----
BW_MAP = {"#E63329": "#2A2D35", "#9E1B14": "#14161B", "#75130E": "#14161B", "#C8261C": "#2A2D35",
          "#FFF4F2": "#EFEFF2", "#FFE2DD": "#EFEFF2", "#2A8A48": "#50545E"}
def to_bw(s):
    for a, b in BW_MAP.items():
        s = re.sub(re.escape(a), b, s, flags=re.I)
    return s

# ---- images: webp -> png/jpg (KDP takes neither webp in EPUB nor reliably in print) ----
def convert_images(dest, gray=False):
    os.makedirs(dest, exist_ok=True)
    out = {}
    for sub in ("art", "cards-lineart"):
        for f in sorted(os.listdir(f"{BOOK}/{sub}")):
            if not f.endswith(".webp"): continue
            stem = f[:-5]; png = f"{dest}/{sub}-{stem}.png"
            subprocess.run(["dwebp", "-quiet", f"{BOOK}/{sub}/{f}", "-o", png], check=True)
            final = png
            # ffmpeg, not sips: sips tags files with an sRGB ICC profile, which renders as an off-white box
            # against the untagged white page in print PDFs. Art -> JPEG (small EPUB), B&W -> 8-bit gray.
            if sub == "art" or gray:
                final = png[:-4] + (".jpg" if sub == "art" else "-g.png")
                f_ = ["format=gray"] if gray else []
                if sub == "art":   # the art's paper is 249-253 grey, not white: clip it to pure white
                    w = "if(gte(val,238),255,val)"
                    f_.append(f"lut=y='{w}'" if gray else f"lutrgb=r='{w}':g='{w}':b='{w}'")
                vf = ["-vf", ",".join(f_)] if f_ else []
                subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", png, *vf, *(["-q:v", "2"] if sub == "art" else []), final], check=True)
                os.remove(png)
            out[f"{sub}/{f}"] = final
    return out

FONT_CSS = "".join(   # static instances of the OFL brand fonts (variable fonts print as Type 3)
    f'@font-face{{font-family:"{fam}";src:url("file://{FONTS}/{f}");font-weight:{w};font-style:{st}}}'
    for fam, f, w, st in [("Fraunces", "Fraunces-Regular.ttf", "100 499", "normal"),
                          ("Fraunces", "Fraunces-SemiBold.ttf", "500 900", "normal"),
                          ("Fraunces", "Fraunces-Italic-Regular.ttf", "100 449", "italic"),
                          ("Fraunces", "Fraunces-MediumItalic.ttf", "450 900", "italic"),
                          ("Inter", "Inter-Regular.ttf", "100 499", "normal"),
                          ("Inter", "Inter-SemiBold.ttf", "500 900", "normal"),
                          ("Inter", "Inter-Italic-Regular.ttf", "100 900", "italic"),
                          # 6-glyph / 1-glyph OFL subsets: the Chinese terms and the ✦ ornament
                          ("Noto Serif SC", "NotoSerifSC-subset.ttf", "100 900", "normal"),
                          ("Noto Sans Symbols 2", "NotoSansSymbols2-subset.ttf", "100 900", "normal")])
TOKENS = """:root{--paper:#FFFFFF;--ink:#14161B;--ink-2:#2A2D35;--ink-3:#50545E;--ink-4:#8A8E98;--rule:#E4E5EA;
--red:#E63329;--red-deep:#9E1B14;--serif:"Fraunces","Noto Sans Symbols 2","Noto Serif SC",serif;
--sans:"Inter","Noto Sans Symbols 2","Noto Serif SC",sans-serif}"""

# =====================================================================================
# 1. PAPERBACK INTERIOR
# =====================================================================================
PRINT_CSS = FONT_CSS + TOKENS + """
@page{size:6in 9in;margin:0.75in 0.6in 0.8in 0.8in;
  @bottom-center{content:counter(page);font:8.5pt "Inter",sans-serif;color:#50545E;letter-spacing:.06em}}
@page :left{margin-left:0.6in;margin-right:0.8in}
@page plain{@bottom-center{content:none}}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font-family:var(--serif);font-size:10.6pt;line-height:1.48;color:var(--ink);
  text-align:justify;hyphens:auto;-webkit-hyphens:auto;orphans:2;widows:2}
.book{max-width:none;padding:0;margin:0}
.totop{display:none}
.plain{page:plain}
.blank{page:plain;break-before:page;height:1px}
.pm{position:absolute;font-size:1pt;color:#fff}
p{margin:0;text-indent:1.4em}
.ch-head + p,.ch-head + .reveal + p,.subhead + p,.epigraph + p,.ch-sub + p,.cardgroup + p,h4 + figure + p,
.list + p,.prologue-note + p,.reveal + p,.blessings + p,.cardfig + p,.cardfloat + p,.angles-num + p,p:first-child{text-indent:0}
/* front matter */
.fm{page:plain;break-before:page;display:flex;flex-direction:column;justify-content:center;align-items:center;
  text-align:center;height:7.35in}
.fm-title h1{font-size:34pt;line-height:1.02;font-weight:600;margin:0}
.fm-title h1 em{color:var(--red);font-weight:500}
.fm-kick{font-family:var(--sans);letter-spacing:.38em;text-transform:uppercase;font-size:7.5pt;color:var(--red);margin:0 0 1.6em;text-indent:0}
.fm-sub{font-style:italic;color:var(--ink-3);font-size:13pt;margin:1em 0 2em;text-indent:0}
.fm-orn{color:var(--red-deep);font-size:14pt;margin-bottom:2em}
.fm-author{font-family:var(--sans);font-size:11pt;letter-spacing:.06em;text-indent:0}
.fm-role{font-family:var(--sans);font-size:7.5pt;color:var(--ink-3);letter-spacing:.14em;text-transform:uppercase;margin-top:.5em;text-indent:0}
.fm-copy{justify-content:flex-end;align-items:flex-start;text-align:left;font-size:8.5pt;line-height:1.55;color:var(--ink-2)}
.fm-copy p{text-indent:0;margin:0 0 .8em}
.ptoc{page:plain;break-before:page}
.ptoc h2{font-family:var(--sans);text-transform:uppercase;letter-spacing:.32em;font-size:8pt;color:var(--red);
  text-align:center;margin:.3in 0 .3in;font-weight:600}
.ptoc ul{list-style:none;margin:0;padding:0}
.ptoc li{display:flex;align-items:baseline;gap:.4em;margin:.16em 0;font-size:9.6pt;line-height:1.35;text-align:left}
.ptoc .lab{flex:0 1 auto}.ptoc .dots{flex:1;border-bottom:1px dotted var(--ink-4);transform:translateY(-.25em)}
.ptoc .pn{font-family:var(--sans);font-size:8.5pt;color:var(--ink-3);min-width:1.6em;text-align:right;flex-shrink:0;white-space:nowrap}
.ptoc .dots{min-width:1em}
.ptoc .t-part{margin-top:.8em;font-family:var(--sans);font-size:7.5pt;letter-spacing:.2em;text-transform:uppercase;color:var(--red-deep);font-weight:600}
.ptoc .t-part .dots,.ptoc .t-part .pn{display:none}
.ptoc .t-chapter{padding-left:1.1em}
.ptoc .num{font-family:var(--sans);font-size:8.5pt;color:var(--ink-3);min-width:1.4em}
.ptoc .t-front,.ptoc .t-appendix{margin-top:.45em}
.keep{break-inside:avoid}
.ptoc .sub{font-style:italic;color:var(--ink-3)}
/* section opener */
.section-open{break-before:page;break-after:page;page:plain;height:7.35in;min-height:0;display:flex;flex-direction:column;
  justify-content:center;text-align:center;border:0;padding:0}
.so-art{margin:0 0 .45in}.so-img{width:100%}
.so-kicker{font-family:var(--sans);text-transform:uppercase;letter-spacing:.5em;font-size:8pt;color:var(--red);margin:0;text-indent:0}
.so-title{font-size:20pt;font-weight:500;font-style:italic;margin:.35em auto 0;max-width:4in;line-height:1.2}
.so-orn{color:var(--red);font-size:12pt;margin-top:.8em}
/* chapters */
.chapter,.page.chapter{break-before:page;padding-top:.55in;min-height:0;display:block;border:0}
.ch-head{text-align:center;margin:0 0 .35in}
.ch-kick{font-family:var(--sans);text-transform:uppercase;letter-spacing:.34em;font-size:7.5pt;color:var(--red);margin:0 0 .6em;text-indent:0}
.ch-title{font-size:20pt;line-height:1.15;margin:0;font-weight:600;text-align:center;hyphens:none}
.ch-title.solo{font-size:20pt}
.ch-orn{color:var(--red-deep);letter-spacing:.5em;margin-top:.8em;font-size:7pt}
.ch-sub{text-align:center;font-style:italic;color:var(--ink-3);font-size:11.5pt;margin:-.15in 0 .3in;text-indent:0;hyphens:none}
.subhead{font-family:var(--serif);font-weight:600;font-size:11.2pt;color:var(--red-deep);margin:1.3em 0 .45em;
  line-height:1.3;text-align:left;hyphens:none;break-after:avoid}
.subhead::before{width:1.4em;height:1.2pt;margin:0 0 .55em;background:var(--red)}
.epigraph{margin:.5em auto 1.4em;max-width:3.6in;text-align:center;font-style:italic;color:var(--ink-3);font-size:10.2pt;hyphens:none;break-inside:avoid}
.epigraph::before{font-size:22pt;line-height:.6;margin-bottom:.15em}
.ep-cite{font-size:7.5pt;margin-top:.5em;letter-spacing:.1em;text-transform:uppercase}
.list{margin:.5em 0 .8em;padding-left:1.4em;text-align:left}.list li{margin:.25em 0}
.angles-num{margin:.6em 0 .9em}.angles-num li{padding-left:2em;margin:.45em 0}
.angles-num li::before{width:1.35em;height:1.35em;font-size:7.5pt;top:.05em}
.prologue-note{font-family:var(--sans);text-transform:uppercase;letter-spacing:.28em;font-size:7.5pt;color:var(--red);text-align:center;margin:0 0 1.4em;text-indent:0}
.cardgroup{margin:1.6em 0 .6em;break-after:avoid}
.cg-title{font-family:var(--sans);font-size:8.5pt;letter-spacing:.28em;padding:.6em 0}
.angle-loose{text-align:center;font-style:italic;color:var(--ink-3);text-indent:0}
/* figures */
.reveal,.blessings{width:100%;left:auto;transform:none;margin:.2in auto .3in;break-inside:avoid}
.reveal-focus{width:72%}
.reveal-cap,.blessings figcaption{font-family:var(--sans);font-size:7.5pt;color:var(--ink-3);font-style:italic;margin-top:.5em;text-align:center;text-indent:0}
.compass{font-family:var(--sans)}
.cardfig{width:1.15in;margin:.6em auto .9em;break-inside:avoid}
.cardfloat{float:right;width:1.05in;margin:.15em 0 .5em 1.2em}
.cardimg{border-radius:3px}
"""

def print_toc_html(pages=None):
    rows = []
    for kind, label, sub, rid in TOC:
        pn = str(pages.get(rid, "")) if pages else "000"
        if kind == "part":
            rows.append(f'<li class="t-part"><span class="lab">{esc(label)} · {esc(sub)}</span></li>')
        elif kind == "chapter":
            num = label.replace("Chapter ", "")
            rows.append(f'<li class="t-chapter"><span class="num">{esc(num)}</span><span class="lab">{esc(sub)}</span>'
                        f'<span class="dots"></span><span class="pn">{pn}</span></li>')
        else:
            lab = label.title() if kind == "appendix" else label
            s = CHSUB.get(label.upper()) if kind == "appendix" else None
            lab_html = esc(lab) + (f': <span class="sub">{esc(s)}</span>' if s else "")
            rows.append(f'<li class="t-{kind}"><span class="lab">{lab_html}</span><span class="dots"></span><span class="pn">{pn}</span></li>')
    return f'<nav class="ptoc"><h2>Contents</h2><ul>{"".join(rows)}</ul></nav>'

def front_matter_print():
    isbn = f"<p>ISBN {esc(ISBN_PRINT)}</p>" if ISBN_PRINT else ""
    title = f'''<section class="fm fm-title"><p class="fm-kick">A Mahjong Tarot Book</p>
<h1>The Mahjong<br><em>Mirror</em></h1><p class="fm-sub">{esc(SUBTITLE)}</p><div class="fm-orn">✦</div>
<p class="fm-author">{esc(AUTHOR)}</p><p class="fm-role">{esc(ROLE)}</p></section>'''
    copy = f'''<section class="fm fm-copy"><p><strong>{esc(TITLE)}: {esc(SUBTITLE)}</strong></p>
<p>Copyright © {YEAR} {esc(AUTHOR)}. All rights reserved.</p>
<p>No part of this book may be reproduced, stored, or transmitted in any form or by any means without written permission from the author, except for brief quotations in reviews.</p>
<p>This book offers a framework for reflection and decision-making. It is not a substitute for professional financial, legal, medical, or psychological advice.</p>
{isbn}<p>{esc(SITE)}</p></section>'''
    return title + copy

def body_for_print(markers, recto_before, img_map, bw):
    body = BODY
    for src, path in img_map.items():
        body = body.replace(f'src="{src}"', f'src="file://{path}"')
    def sec(m):
        rid = m.group(2)
        pre = '<div class="blank"></div>' * recto_before.get(rid, 0)
        mk = f'<span class="pm">@@{rid}@@</span>' if markers else ""
        return pre + m.group(0) + mk
    body = re.sub(r'<section class="([^"]*)" id="([^"]*)"[^>]*>', sec, body)
    # keep runs of headings together with the card figure or first paragraph that follows them
    # (Chrome does not reliably honor break-after:avoid)
    head = r'(?:<h4 class="subhead">.*?</h4>|<div class="cardgroup">.*?</div>)'
    body = re.sub(rf'((?:{head}\s*)+)(<figure class="cardfig">.*?</figure>|<p>.*?</p>)',
                  r'<div class="keep">\1\2</div>', body, flags=re.S)
    return to_bw(body) if bw else body

def print_html(markers, recto_before, img_map, bw, pages=None):
    css = to_bw(PRINT_CSS) if bw else PRINT_CSS
    toc = print_toc_html(pages)
    head_blank = '<div class="blank"></div>' * recto_before.get("__toc__", 0)
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{esc(TITLE)}</title>'
            f'<style>{G["CSS"]}</style><style>{css}</style></head><body><main class="book">'
            f'{front_matter_print()}{head_blank}{toc}{body_for_print(markers, recto_before, img_map, bw)}</main></body></html>')

def locate(pdf):
    """page number (1-based) where each section marker lands"""
    found = {}
    for n, txt in enumerate(pdf_pages(pdf), 1):
        for rid in re.findall(r"@@([a-z0-9-]+)@@", txt):
            found.setdefault(rid, n)
    return found

# sections that must open on a right-hand (odd) page: the contents, the prologue, and each Section opener
def recto_ids():
    ids = [rid for kind, _, _, rid in TOC if kind == "part"]
    first_front = next(rid for kind, _, _, rid in TOC if kind == "front")
    return ids + [first_front]

def build_interior(variant):
    bw = variant == "bw"
    imgs = convert_images(f"{WORK}/img-{variant}", gray=bw)
    hp, pdf = f"{WORK}/interior-{variant}.html", f"{WORK}/measure-{variant}.pdf"
    recto = {"__toc__": 0}            # front matter is title (1) + copyright (2): contents starts on 3
    # pass 1..n: insert blank pages until every recto section lands on an odd page
    for _ in range(12):
        open(hp, "w").write(print_html(True, recto, imgs, bw)); print_pdf(hp, pdf)
        pages = locate(pdf); changed = False
        for rid in recto_ids():
            if pages[rid] % 2 == 0:
                recto[rid] = recto.get(rid, 0) + 1; changed = True; break   # one at a time: later pages shift
        if not changed: break
    missing = [rid for *_, rid in TOC if rid not in pages]
    assert not missing, f"TOC targets not found in PDF: {missing}"
    # final: real page numbers in the contents, no markers
    open(hp, "w").write(print_html(False, recto, imgs, bw, pages))
    final = f"{OUT}/interior-6x9-{variant}.pdf"; print_pdf(hp, final)
    n = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", final], capture_output=True, text=True).stdout).group(1))
    print(f"interior {variant}: {n} pages -> {final}")
    return n, pages

# =====================================================================================
# 2. COVERS
# =====================================================================================
BLURB = [
    "You do not need to know how to play Mahjong. You need an open mind, and the willingness to look at your life from new angles.",
    "For more than thirty-five years, Bill Hajdu has used a thirteen-card Mahjong spread to help people make the decisions that shape their lives. In <em>The Mahjong Mirror</em> he lays out the framework behind those readings: four angles of reflection that turn a confusing choice into a clear one.",
]
ANGLES = [("The Central Theme", "the one force shaping everything else"),
          ("Know Thyself", "who you are, what is happening now, and what you really want"),
          ("The Opposition", "what stands in your way, and how to move past it"),
          ("The Future", "the year ahead, and the long view")]
BIO = ("Bill Hajdu is a Mahjong Tarot reader and Chinese astrologer with over 35 years of practice. A former Air Force "
       "interrogator, he holds a degree in English Education and master's degrees in Political Science and International Relations.")

COVER_CSS = FONT_CSS + TOKENS + """
*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:var(--serif);color:var(--ink)}
.front{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;background:#fff;overflow:hidden}
.f-kick{font-family:var(--sans);text-transform:uppercase;color:var(--red);font-weight:600;margin:0}
.f-title{font-weight:600;line-height:.98;margin:0;letter-spacing:-.01em}
.f-title em{color:var(--red);font-weight:500}
.f-sub{font-style:italic;color:var(--ink-3);margin:0}
.f-art{display:block;object-fit:contain}
.f-author{font-family:var(--sans);letter-spacing:.16em;text-transform:uppercase;font-weight:600;margin:0;color:var(--ink)}
.f-rule{background:var(--red)}
"""

def front_cover_html(w_in, h_in, unit):
    """front cover content in a w x h box; unit = px per inch for sizing.
    The art (1376 px wide) is held to 4.59 in so it prints at 300 DPI."""
    u = lambda x: f"{x*unit:.2f}px"
    art = "file://" + COVER_ART
    return f'''<div class="front" style="width:{u(w_in)};height:{u(h_in)};padding:{u(0.62)} {u(0.5)} {u(0.55)}">
<p class="f-kick" style="font-size:{u(0.105)};letter-spacing:{u(0.045)}">A framework for wiser decisions</p>
<div class="f-rule" style="width:{u(0.42)};height:{u(0.025)};margin:{u(0.24)} 0 {u(0.3)}"></div>
<h1 class="f-title" style="font-size:{u(0.86)}">The Mahjong<br><em>Mirror</em></h1>
<p class="f-sub" style="font-size:{u(0.25)};margin-top:{u(0.22)}">{esc(SUBTITLE)}</p>
<img class="f-art" src="{art}" style="width:{u(1376/300)};height:{u(h_in*0.40)};margin:{u(0.1)} 0 auto">
<p class="f-author" style="font-size:{u(0.2)}">{esc(AUTHOR)}</p></div>'''

def build_cover(pages):
    spine = pages * SPINE_PER_PAGE
    W, H = 2 * TRIM_W + spine + 2 * BLEED, TRIM_H + 2 * BLEED
    U = 96   # CSS px per inch
    u = lambda x: f"{x*U:.2f}px"
    bullets = "".join(f'<li><strong>{esc(a)}</strong>: {esc(b)}</li>' for a, b in ANGLES)
    spine_text = (f'<div style="position:absolute;left:{u(BLEED+TRIM_W)};top:0;width:{u(spine)};height:{u(H)};'
                  f'display:flex;align-items:center;justify-content:center">'
                  f'<div style="transform:rotate(90deg);white-space:nowrap;display:flex;gap:{u(0.35)};align-items:baseline;'
                  f'font-size:{u(min(0.17, spine*0.5))}">'
                  f'<span style="font-weight:600">The Mahjong <em style="color:var(--red);font-weight:500">Mirror</em></span>'
                  f'<span style="font-family:var(--sans);text-transform:uppercase;letter-spacing:.14em;font-size:.7em;font-weight:600">{esc(AUTHOR)}</span>'
                  f'</div></div>') if pages >= 100 else ""     # KDP: spine text only from 100 pages
    back = f'''<div style="position:absolute;left:{u(BLEED+0.6)};top:{u(BLEED+0.75)};width:{u(TRIM_W-1.2)};
  font-size:{u(0.135)};line-height:1.5;color:var(--ink-2)">
<p style="font-family:var(--sans);text-transform:uppercase;letter-spacing:.3em;font-size:{u(0.085)};color:var(--red);font-weight:600;margin:0 0 {u(0.25)}">The Mahjong Mirror</p>
<p style="font-size:{u(0.2)};line-height:1.3;font-style:italic;color:var(--ink);margin:0 0 {u(0.25)}">{BLURB[0]}</p>
<p style="margin:0 0 {u(0.18)}">{BLURB[1]}</p>
<ul style="margin:0 0 {u(0.18)};padding-left:{u(0.2)}">{bullets}</ul>
<p style="margin:0">Methodical, practical, and grounded in observable patterns, this is a book for anyone standing at a crossroads who wants a wiser way to decide.</p>
<div style="width:{u(0.42)};height:{u(0.02)};background:var(--red);margin:{u(0.3)} 0 {u(0.2)}"></div>
<p style="font-size:{u(0.115)};color:var(--ink-3);margin:0">{esc(BIO)}</p>
<p style="font-family:var(--sans);font-size:{u(0.1)};letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);margin:{u(0.2)} 0 0">{esc(SITE)}</p>
</div>'''
    front = (f'<div style="position:absolute;left:{u(BLEED+TRIM_W+spine)};top:0">'
             f'{front_cover_html(TRIM_W+BLEED, H, U)}</div>')
    # KDP prints the barcode in a 2 x 1.2 in box, 0.25 in from the trim on the back cover's lower right: keep it clear
    doc = (f'<!doctype html><html><head><meta charset="utf-8"><style>{COVER_CSS}'
           f'@page{{size:{W:.4f}in {H:.4f}in;margin:0}}'
           f'.sheet{{position:relative;width:{u(W)};height:{u(H)};overflow:hidden;background:#fff}}</style></head>'
           f'<body><div class="sheet">{back}{spine_text}{front}</div></body></html>')
    hp = f"{WORK}/cover.html"; open(hp, "w").write(doc)
    pdf = f"{OUT}/cover-6x9.pdf"; print_pdf(hp, pdf)
    print(f"cover: {W:.4f} x {H:.4f} in, spine {spine:.4f} in -> {pdf}")

def build_kindle_cover():
    U = 1600 / 6.25   # 1600 x 2560 px at the 1:1.6 Kindle ratio
    doc = (f'<!doctype html><html><head><meta charset="utf-8"><style>{COVER_CSS}</style></head><body>'
           f'{front_cover_html(6.25, 10.0, U)}</body></html>')
    hp = f"{WORK}/kindle-cover.html"; open(hp, "w").write(doc)
    png = f"{WORK}/kindle-cover.png"
    chrome(f"--screenshot={png}", "--window-size=1600,2560", "--default-background-color=ffffffff", "file://" + hp)
    jpg = f"{OUT}/kindle-cover.jpg"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", png, "-q:v", "2", jpg], check=True)
    print("kindle cover ->", jpg)
    return jpg

# =====================================================================================
# 3. KINDLE EPUB
# =====================================================================================
EPUB_CSS = """
body{font-family:serif;line-height:1.5;margin:0;orphans:2;widows:2}
p{margin:0;text-indent:1.3em;text-align:justify}
p.noind,.ch-head + p,.subhead + p,.epigraph + p,.ch-sub + p,.list + p,figure + p,.prologue-note + p,.cardgroup + p,.angles-num + p{text-indent:0}
h1,h2,h3,h4{font-weight:bold;text-align:center;page-break-after:avoid}
.ch-head{margin:2em 0 1.5em;text-align:center}
.ch-kick,.so-kicker,.prologue-note{font-family:sans-serif;text-transform:uppercase;letter-spacing:.2em;font-size:.75em;color:#9E1B14;text-align:center;text-indent:0;margin:0 0 .5em}
.ch-title{font-size:1.6em;margin:0;line-height:1.2}
.ch-orn,.so-orn{color:#9E1B14;text-align:center;font-size:.8em;margin-top:.6em;letter-spacing:.4em}
.ch-sub{font-style:italic;text-align:center;text-indent:0;margin:0 0 1.5em}
.section-open{text-align:center;padding-top:15%}
.so-title{font-size:1.6em;font-style:italic;font-weight:normal;margin:.4em 0 0}
.subhead{text-align:left;font-size:1.05em;color:#9E1B14;margin:1.6em 0 .5em}
.epigraph{margin:1em 1.5em 1.5em;text-align:center;font-style:italic;text-indent:0}
.ep-cite{display:block;font-style:normal;font-size:.8em;margin-top:.4em;letter-spacing:.08em;text-transform:uppercase}
.list,.angles-num{margin:.5em 0 1em 0;padding-left:1.5em}
.list li,.angles-num li{margin:.3em 0}
.cardgroup{text-align:center;margin:2em 0 1em}
.cg-title{font-family:sans-serif;letter-spacing:.2em;font-size:.95em;color:#9E1B14;text-transform:uppercase}
figure,.reveal,.blessings,.so-art{margin:1em 0;text-align:center;page-break-inside:avoid}
figure img,.reveal img,.so-art img,.blessings img{max-width:100%}
.cardfig img{width:40%;max-width:12em}
.cardfloat{float:right;width:30%;margin:0 0 .5em 1em}.cardfloat img{width:100%}
.reveal-cap,figcaption{font-size:.8em;font-style:italic;text-align:center;text-indent:0;margin-top:.4em}
.angle-loose{text-align:center;font-style:italic;text-indent:0}
.tp{text-align:center;padding-top:20%}.tp h1{font-size:2.2em;margin:0}.tp p{text-indent:0;text-align:center}
.copy p{text-indent:0;font-size:.85em;margin:0 0 .8em;text-align:left}
"""

def svg_to_png(svg, path, width=1600):
    vb = [float(x) for x in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
    h = round(width * vb[3] / vb[2])
    svg = re.sub(r"<svg ", f'<svg width="{width}" height="{h}" ', svg, count=1)
    doc = (f'<!doctype html><html><head><meta charset="utf-8"><style>{FONT_CSS}'
           f'html,body{{margin:0;background:#fff}}svg{{display:block;font-family:"Inter",sans-serif}}</style></head><body>{svg}</body></html>')
    hp = path[:-4] + ".html"; open(hp, "w").write(doc)
    chrome(f"--screenshot={path}", f"--window-size={width},{h}", "--default-background-color=ffffffff", "file://" + hp)
    os.remove(hp)

def xhtml(title, body):
    return ('<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n'
            '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">'
            f'<head><meta charset="utf-8"/><title>{esc(title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>'
            f'<body>{body}</body></html>')

def build_epub(cover_jpg):
    ed = f"{WORK}/epub"; shutil.rmtree(ed, ignore_errors=True)
    os.makedirs(f"{ed}/META-INF"); os.makedirs(f"{ed}/OEBPS/images")
    imgs = convert_images(f"{WORK}/img-epub")
    manifest_imgs = []
    body = BODY
    for src, path in imgs.items():
        name = os.path.basename(path)
        if f'src="{src}"' in body:
            shutil.copy(path, f"{ed}/OEBPS/images/{name}"); manifest_imgs.append(name)
            body = body.replace(f'src="{src}"', f'src="images/{name}"')
    # inline SVG diagrams -> PNG (Kindle renders raster figures reliably)
    svgs = re.findall(r"<svg\b.*?</svg>", body, flags=re.S)
    for k, svg in enumerate(dict.fromkeys(svgs), 1):
        name = f"diagram-{k:02d}.png"; svg_to_png(svg, f"{ed}/OEBPS/images/{name}"); manifest_imgs.append(name)
        t = re.search(r"<title>(.*?)</title>", svg, flags=re.S)
        alt = html.escape(html.unescape(t.group(1)) if t else "Diagram", quote=True)
        body = body.replace(svg, f'<img src="images/{name}" alt="{alt}"/>')
    body = re.sub(r"<img\b([^>]*?)\s*/?>", r"<img\1/>", body)
    body = body.replace("<br>", "<br/>")
    # split into one file per <section>
    starts = [m for m in re.finditer(r'<section class="([^"]*)" id="([^"]*)"[^>]*>', body)]
    files = []
    for k, m in enumerate(starts):
        chunk = body[m.start(): starts[k + 1].start() if k + 1 < len(starts) else len(body)].strip()
        files.append((m.group(2), chunk))
    rid_file = {rid: f"s{k+1:03d}.xhtml" for k, (rid, _) in enumerate(files)}
    oe = f"{ed}/OEBPS"
    open(f"{oe}/style.css", "w").write(EPUB_CSS)
    shutil.copy(cover_jpg, f"{oe}/images/cover.jpg")
    open(f"{oe}/cover.xhtml", "w").write(xhtml(TITLE, '<div style="text-align:center"><img src="images/cover.jpg" alt="Cover: The Mahjong Mirror by Bill Hajdu" style="max-width:100%"/></div>'))
    open(f"{oe}/title.xhtml", "w").write(xhtml(TITLE, f'<section class="tp" epub:type="titlepage"><h1>{esc(TITLE)}</h1>'
        f'<p><em>{esc(SUBTITLE)}</em></p><p>✦</p><p>{esc(AUTHOR)}</p><p>{esc(ROLE)}</p></section>'))
    open(f"{oe}/copyright.xhtml", "w").write(xhtml("Copyright", f'<section class="copy" epub:type="copyright-page">'
        f'<p><strong>{esc(TITLE)}: {esc(SUBTITLE)}</strong></p><p>Copyright © {YEAR} {esc(AUTHOR)}. All rights reserved.</p>'
        '<p>No part of this book may be reproduced, stored, or transmitted in any form or by any means without written permission from the author, except for brief quotations in reviews.</p>'
        '<p>This book offers a framework for reflection and decision-making. It is not a substitute for professional financial, legal, medical, or psychological advice.</p>'
        f'<p>{esc(SITE)}</p></section>'))
    for rid, chunk in files:
        t = next((l + (": " + s if s and k == "chapter" else "") for k, l, s, r in TOC if r == rid), TITLE)
        open(f"{oe}/{rid_file[rid]}", "w").write(xhtml(html.unescape(t), chunk))
    # navigation
    items, open_part = [], False
    for kind, label, sub, rid in TOC:
        href = rid_file[rid]
        if kind == "part":
            if open_part: items.append("</ol></li>")
            items.append(f'<li><a href="{href}">{esc(label)}: {esc(sub)}</a><ol>'); open_part = True
        elif kind == "chapter":
            items.append(f'<li><a href="{href}">{esc(label)}: {esc(sub)}</a></li>')
        else:
            if open_part: items.append("</ol></li>"); open_part = False
            lab = label.title() if kind == "appendix" else label
            s = CHSUB.get(label.upper()) if kind == "appendix" else None
            items.append(f'<li><a href="{href}">{esc(lab)}{": " + esc(s) if s else ""}</a></li>')
    if open_part: items.append("</ol></li>")
    first = rid_file[files[0][0]]
    nav = (f'<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>{"".join(items)}</ol></nav>'
           f'<nav epub:type="landmarks" hidden=""><ol><li><a epub:type="cover" href="cover.xhtml">Cover</a></li>'
           f'<li><a epub:type="toc" href="nav.xhtml">Contents</a></li>'
           f'<li><a epub:type="bodymatter" href="{first}">Start</a></li></ol></nav>')
    open(f"{oe}/nav.xhtml", "w").write(xhtml("Contents", nav))
    # package
    bid = "urn:uuid:" + str(uuid.uuid5(uuid.NAMESPACE_URL, "https://www.mahjongtarot.com/book/the-mahjong-mirror"))
    mod = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    spine_ids = ["cover", "title", "copyright", "nav"] + [f"s{k+1:03d}" for k in range(len(files))]
    man = ['<item id="css" href="style.css" media-type="text/css"/>',
           '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
           '<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>',
           '<item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>',
           '<item id="copyright" href="copyright.xhtml" media-type="application/xhtml+xml"/>',
           '<item id="cover-image" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>']
    man += [f'<item id="s{k+1:03d}" href="s{k+1:03d}.xhtml" media-type="application/xhtml+xml"/>' for k in range(len(files))]
    for k, name in enumerate(dict.fromkeys(manifest_imgs)):
        mt = "image/jpeg" if name.endswith(".jpg") else "image/png"
        man.append(f'<item id="img{k:03d}" href="images/{name}" media-type="{mt}"/>')
    opf = f'''<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="en">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="bookid">{bid}</dc:identifier><dc:title>{esc(TITLE)}: {esc(SUBTITLE)}</dc:title>
<dc:creator>{esc(AUTHOR)}</dc:creator><dc:language>en</dc:language><dc:rights>Copyright © {YEAR} {esc(AUTHOR)}</dc:rights>
<meta property="dcterms:modified">{mod}</meta><meta name="cover" content="cover-image"/>
</metadata>
<manifest>{"".join(man)}</manifest>
<spine>{"".join(f'<itemref idref="{i}"' + (' linear="no"' if i == "nav" else "") + '/>' for i in spine_ids)}</spine>
</package>'''
    open(f"{oe}/content.opf", "w").write(opf)
    open(f"{ed}/META-INF/container.xml", "w").write('<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">'
        '<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>')
    epub = f"{OUT}/the-mahjong-mirror.epub"
    with zipfile.ZipFile(epub, "w") as z:
        z.writestr(zipfile.ZipInfo("mimetype"), "application/epub+zip", compress_type=zipfile.ZIP_STORED)
        for root, _, fs in os.walk(ed):
            for f in sorted(fs):
                p = os.path.join(root, f)
                z.write(p, os.path.relpath(p, ed), compress_type=zipfile.ZIP_DEFLATED)
    print(f"epub: {len(files)} sections, {len(set(manifest_imgs))} images -> {epub}")

# =====================================================================================
COVER_ART = convert_images(f"{WORK}/img-cover")["art/sec4-future.webp"]
if __name__ == "__main__":
    counts = {}
    for v in ("bw", "color"):
        counts[v], _ = build_interior(v)
    assert counts["bw"] == counts["color"], counts
    build_cover(counts["bw"])
    build_epub(build_kindle_cover())
    json.dump({"pages": counts, "trim": "6x9in", "built": datetime.date.today().isoformat()},
              open(f"{OUT}/build-info.json", "w"), indent=1)
