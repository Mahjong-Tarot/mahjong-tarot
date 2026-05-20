#!/usr/bin/env python3
"""
Build portal-user-guide.pdf from portal-user-guide.md + screenshots/.

Lightweight: parses the markdown ourselves (we control the source) and
uses reportlab Platypus to lay out a clean PDF with embedded screenshots.

Run from the docs/onboarding/ directory:
    python3 build_pdf.py
"""
import os
import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame,
    Paragraph, Spacer, PageBreak, Image as RLImage,
    Table, TableStyle, KeepTogether,
)
from PIL import Image as PILImage

HERE = Path(__file__).resolve().parent
MD_PATH = HERE / "portal-user-guide.md"
SHOTS_DIR = HERE / "screenshots"
OUT_PDF = HERE / "portal-user-guide.pdf"

# Page geometry
PAGE_W, PAGE_H = LETTER
MARGIN_L = 0.85 * inch
MARGIN_R = 0.85 * inch
MARGIN_T = 0.85 * inch
MARGIN_B = 0.85 * inch
FRAME_W = PAGE_W - MARGIN_L - MARGIN_R

# Brand
INK = colors.HexColor("#1a1a1a")
INK_2 = colors.HexColor("#2a2a2a")
INK_3 = colors.HexColor("#4a4a4a")
INK_4 = colors.HexColor("#6b6258")
RULE = colors.HexColor("#ece6da")
FIRE = colors.HexColor("#c8442e")
PAPER = colors.HexColor("#faf6ef")


def build_styles():
    s = getSampleStyleSheet()
    base = dict(fontName="Helvetica", fontSize=10.5, leading=15.5, textColor=INK_2)
    return {
        "title": ParagraphStyle("Title", parent=s["Title"], fontSize=28, leading=34,
                                spaceAfter=10, textColor=INK, alignment=TA_LEFT,
                                fontName="Helvetica-Bold"),
        "subtitle": ParagraphStyle("Subtitle", parent=s["Normal"], fontSize=14,
                                   leading=20, textColor=INK_3, spaceAfter=24,
                                   fontName="Helvetica"),
        "h1": ParagraphStyle("H1", parent=s["Heading1"], fontSize=20, leading=26,
                             spaceBefore=20, spaceAfter=12, textColor=INK,
                             fontName="Helvetica-Bold"),
        "h2": ParagraphStyle("H2", parent=s["Heading2"], fontSize=15, leading=21,
                             spaceBefore=14, spaceAfter=6, textColor=INK,
                             fontName="Helvetica-Bold"),
        "h3": ParagraphStyle("H3", parent=s["Heading3"], fontSize=12.5, leading=17,
                             spaceBefore=10, spaceAfter=4, textColor=INK_2,
                             fontName="Helvetica-Bold"),
        "p": ParagraphStyle("P", **base, spaceAfter=8),
        "li": ParagraphStyle("LI", **base, leftIndent=18, bulletIndent=4,
                             spaceAfter=2),
        "caption": ParagraphStyle("Caption", parent=s["Italic"], fontSize=9,
                                  leading=12, textColor=INK_4, spaceAfter=14,
                                  alignment=TA_CENTER, fontName="Helvetica-Oblique"),
        "meta": ParagraphStyle("Meta", parent=s["Normal"], fontSize=9, leading=13,
                               textColor=INK_4, fontName="Helvetica"),
        "code": ParagraphStyle("Code", parent=s["Normal"], fontSize=9.5,
                               leading=14, textColor=INK_2, fontName="Courier",
                               backColor=PAPER, borderPadding=4, leftIndent=4),
        "blockquote": ParagraphStyle("BQ", parent=s["Normal"], fontSize=10.5,
                                     leading=15, textColor=INK_3,
                                     leftIndent=18, fontName="Helvetica-Oblique"),
    }


def inline_md(text):
    """Convert inline markdown to ReportLab-friendly HTML-ish."""
    # backticks → mono span
    text = re.sub(r"`([^`]+)`", r'<font face="Courier" size="9.5">\1</font>', text)
    # bold
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    # italic (single *)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", text)
    # autolinks [label](url)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)",
                  r'<font color="#c8442e"><u>\1</u></font>', text)
    # escape ampersands that aren't already part of an entity
    text = re.sub(r"&(?!amp;|lt;|gt;|quot;|#)", "&amp;", text)
    return text


def fit_image(path, max_w=FRAME_W * 0.92, max_h=PAGE_H * 0.7):
    with PILImage.open(path) as im:
        w, h = im.size
    ratio = min(max_w / w, max_h / h, 1.0)
    return w * ratio, h * ratio


def image_block(path, caption=None, styles=None):
    iw, ih = fit_image(path)
    flow = [
        Spacer(0, 6),
        RLImage(str(path), width=iw, height=ih),
    ]
    if caption:
        flow.append(Paragraph(caption, styles["caption"]))
    else:
        flow.append(Spacer(0, 14))
    return KeepTogether(flow)


def parse_markdown(md_text):
    """Yield (kind, payload) tuples for our renderer."""
    lines = md_text.splitlines()
    i = 0
    in_table = False
    table_buf = []
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Tables
        if "|" in stripped and not stripped.startswith("```"):
            # collect a contiguous table block
            block = []
            while i < len(lines) and "|" in lines[i].strip():
                block.append(lines[i].strip())
                i += 1
            if len(block) >= 2 and re.match(r"^\|?[\s\-:|]+\|?$", block[1]):
                # header + separator + rows
                rows = []
                for idx, b in enumerate(block):
                    if idx == 1:
                        continue
                    cells = [c.strip() for c in re.split(r"\s*\|\s*", b.strip().strip("|"))]
                    rows.append(cells)
                yield ("table", rows)
                continue
            else:
                # treat as paragraphs (no real table)
                for b in block:
                    yield ("p", b)
                continue

        if not stripped:
            i += 1
            continue

        # Horizontal rule
        if stripped == "---":
            yield ("hr", None)
            i += 1
            continue

        # Image
        m = re.match(r"!\[([^\]]*)\]\(([^)]+)\)", stripped)
        if m:
            yield ("image", (m.group(1), m.group(2)))
            i += 1
            continue

        # Headings
        if stripped.startswith("# "):
            yield ("h1", stripped[2:].strip())
            i += 1
            continue
        if stripped.startswith("## "):
            yield ("h2", stripped[3:].strip())
            i += 1
            continue
        if stripped.startswith("### "):
            yield ("h3", stripped[4:].strip())
            i += 1
            continue

        # Lists
        if stripped.startswith("- ") or re.match(r"^\d+\.\s", stripped):
            items = []
            ordered = bool(re.match(r"^\d+\.\s", stripped))
            while i < len(lines):
                l = lines[i].strip()
                if not l:
                    break
                if l.startswith("- "):
                    items.append(l[2:].strip())
                    i += 1
                elif re.match(r"^\d+\.\s", l):
                    items.append(re.sub(r"^\d+\.\s", "", l))
                    i += 1
                else:
                    break
            yield ("ol" if ordered else "ul", items)
            continue

        # Blockquote
        if stripped.startswith("> "):
            buf = []
            while i < len(lines) and lines[i].strip().startswith("> "):
                buf.append(lines[i].strip()[2:])
                i += 1
            yield ("blockquote", " ".join(buf))
            continue

        # Default: paragraph (may span multiple lines until blank line)
        buf = [stripped]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(
            r"^(#{1,3}\s|---|!\[|>|-\s|\d+\.\s|\|)", lines[i].strip()
        ):
            buf.append(lines[i].strip())
            i += 1
        yield ("p", " ".join(buf))


def render_table(rows, styles):
    data = []
    for r_idx, row in enumerate(rows):
        styled = [Paragraph(inline_md(c), styles["p"]) for c in row]
        data.append(styled)
    col_count = max(len(r) for r in data)
    col_w = FRAME_W / col_count
    tbl = Table(data, colWidths=[col_w] * col_count, repeatRows=1)
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PAPER),
        ("TEXTCOLOR", (0, 0), (-1, 0), INK),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, INK_4),
        ("LINEBELOW", (0, 0), (-1, -1), 0.25, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return tbl


def build_pdf():
    md = MD_PATH.read_text()
    styles = build_styles()

    # Strip the first H1 + tagline lines — we render a custom cover.
    md_lines = md.splitlines()
    cover_title = "Mahjong Tarot Astrologer Portal"
    cover_subtitle = "User Guide — v1.0"
    cover_meta = [
        "For Bill Hajdu (Astrologer) and Dave Hajdu (Operator)",
        "Date: 2026-05-20",
        "Live URL: mahjongtarot.com/portal",
    ]
    # Find first horizontal rule after the H1/H2 block; skip past it.
    body_start = 0
    seen_hr = 0
    for idx, l in enumerate(md_lines):
        if l.strip() == "---":
            seen_hr += 1
            if seen_hr == 1:
                body_start = idx + 1
                break
    md_body = "\n".join(md_lines[body_start:])

    flow = []

    # ---------- Cover page ----------
    flow.append(Spacer(0, 1.4 * inch))
    flow.append(Paragraph(cover_title, styles["title"]))
    flow.append(Paragraph(cover_subtitle, styles["subtitle"]))
    for line in cover_meta:
        flow.append(Paragraph(line, styles["meta"]))
    flow.append(Spacer(0, 0.3 * inch))
    flow.append(Paragraph(
        "This guide walks through every screen in the portal. "
        "Real screenshots from the live site, captioned with what to do. "
        "Bill — Part 2 is yours. Dave — read everything, but Part 3 is "
        "where the admin tools live. Questions go to yon@edge8.co.",
        styles["p"]))
    flow.append(PageBreak())

    # ---------- Body ----------
    for kind, payload in parse_markdown(md_body):
        if kind == "h1":
            flow.append(PageBreak())
            flow.append(Paragraph(inline_md(payload), styles["h1"]))
        elif kind == "h2":
            flow.append(Paragraph(inline_md(payload), styles["h2"]))
        elif kind == "h3":
            flow.append(Paragraph(inline_md(payload), styles["h3"]))
        elif kind == "p":
            flow.append(Paragraph(inline_md(payload), styles["p"]))
        elif kind == "ul":
            for item in payload:
                flow.append(Paragraph("• " + inline_md(item), styles["li"]))
        elif kind == "ol":
            for n, item in enumerate(payload, 1):
                flow.append(Paragraph(f"{n}. " + inline_md(item), styles["li"]))
        elif kind == "blockquote":
            flow.append(Paragraph(inline_md(payload), styles["blockquote"]))
        elif kind == "hr":
            flow.append(Spacer(0, 8))
        elif kind == "table":
            flow.append(render_table(payload, styles))
            flow.append(Spacer(0, 10))
        elif kind == "image":
            alt, src = payload
            img_path = (HERE / src).resolve()
            if not img_path.exists():
                flow.append(Paragraph(
                    f"<i>[Image not found: {src}]</i>", styles["caption"]))
                continue
            flow.append(image_block(img_path, caption=alt, styles=styles))

    # ---------- Build ----------
    doc = BaseDocTemplate(
        str(OUT_PDF),
        pagesize=LETTER,
        leftMargin=MARGIN_L, rightMargin=MARGIN_R,
        topMargin=MARGIN_T, bottomMargin=MARGIN_B,
        title="Mahjong Tarot — Astrologer Portal User Guide",
        author="Mahjong Tarot",
    )

    frame = Frame(MARGIN_L, MARGIN_B, FRAME_W,
                  PAGE_H - MARGIN_T - MARGIN_B, id="main",
                  showBoundary=0)

    def on_page(canvas, doc):
        canvas.saveState()
        # Footer: page number + brand
        canvas.setFont("Helvetica", 8.5)
        canvas.setFillColor(INK_4)
        canvas.drawString(MARGIN_L, 0.5 * inch, "Mahjong Tarot — Portal User Guide v1.0")
        canvas.drawRightString(PAGE_W - MARGIN_R, 0.5 * inch, f"{doc.page}")
        canvas.restoreState()

    doc.addPageTemplates([PageTemplate(id="default", frames=[frame],
                                       onPage=on_page)])
    doc.build(flow)
    print(f"OK: {OUT_PDF} ({OUT_PDF.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    build_pdf()
