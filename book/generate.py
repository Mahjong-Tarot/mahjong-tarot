#!/usr/bin/env python3
# Render blocks.json -> book.html for "The Mahjong Mirror".
import json, html, re

import os
HERE=os.path.dirname(os.path.abspath(__file__))
BLOCKS=json.load(open(f"{HERE}/blocks.json",encoding="utf-8"))
OUT=f"{HERE}/book.html"

def esc(s): return html.escape(s, quote=False)
def slug(s): return re.sub(r"[^a-z0-9]+","-",s.lower()).strip("-")[:60]
roman={1:"I",2:"II",3:"III",4:"IV"}

# ---------------------------------------------------------------- compass SVG
# geometry (matches the locked master diagram)
CARDS=dict(
  W=[(200,70),(264,70),(328,70)],            # top   = West  = What's in the Way
  Wc=(72,174),                                # (west arm on LEFT? no) -- see arms below
)
# arms: name -> (list of (x,y) card slots, label lines, label placement)
ARMS={
 "west": dict(slots=[(200,70),(264,70),(328,70)], dir="WEST", meaning="What's in the Way", lab=("h",290,40,57)),
 "east": dict(slots=[(200,278),(264,278),(328,278)], dir="EAST", meaning="Who You Are", lab=("h",290,386,403)),
 "north":dict(slots=[(72,174),(136,174),(200,174)], dir="NORTH", meaning="The Long View", lab=("vL",40,212,0)),
 "south":dict(slots=[(328,174),(392,174),(456,174)], dir="SOUTH", meaning="The Year Ahead", lab=("vR",540,212,0)),
}
CENTER=(264,174)

def card_rect(x,y,cls):
    fills={"solid":'fill="#FFFFFF" stroke="#2A2D35" stroke-width="1.6"',
           "ghost":'fill="none" stroke="#C9CCD4" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.7"',
           "new":'fill="#FFE2DD" stroke="#9E1B14" stroke-width="1.8"'}
    return f'<rect x="{x}" y="{y}" width="52" height="76" rx="6" {fills[cls]}/>'

def arm_label(a, active):
    kind,x,y1,y2=a["lab"]
    col = "#9E1B14" if active else "#8A8E98"
    sub = "#50545E" if active else "#B8BBC4"
    if kind=="h":
        return (f'<text x="{x}" y="{y1}" text-anchor="middle" font-size="15" fill="{col}" font-weight="700" letter-spacing="1.5">{a["dir"]}</text>'
                f'<text x="{x}" y="{y2}" text-anchor="middle" font-size="12.5" fill="{sub}">{esc(a["meaning"])}</text>')
    rot = -90 if kind=="vL" else 90
    return (f'<g transform="translate({x},{y1}) rotate({rot})" text-anchor="middle">'
            f'<text x="0" y="-4" font-size="15" fill="{col}" font-weight="700" letter-spacing="1.5">{a["dir"]}</text>'
            f'<text x="0" y="14" font-size="12.5" fill="{sub}">{esc(a["meaning"])}</text></g>')

# Illustrative card assignment for Maya's full reading (swappable) -> position : card
FULL_CARDS={
 "west":["sword","tiger","knot"], "east":["phoenix","peacock","lute"],
 "north":["pine","tortoise","heaven"], "south":["carp","peach","house"], "center":"fire",
}

# Daoist single-gesture brush glyphs, drawn in the card's local 52x76 space.
# Each is a list of (path, fill_or_stroke, opacity) — "S" prefix means stroked line.
INK="#14161B"
GLYPHS={
 "fire":  [("M26 20 q7 8 3 16 q-1 3 -6 5 q6 -1 11 3 q6 5 2 13 q9 -6 6 -16 q7 4 5 12 q6 -9 -2 -19 q-9 -11 -24 -14z","F",1)],
 "dragon":[("M15 64 C 6 52, 25 46, 27 35 C 28 27, 32 19, 40 12 C 34 22, 31 29, 30 36 C 29 48, 12 53, 15 64 Z","F",1)],
 "ducks": [("M13 32 C 18 28, 26 27, 31 29 C 26 31, 18 33, 13 32 Z","F",1),
           ("M22 48 C 28 44, 36 43, 41 45 C 36 47, 28 49, 22 48 Z","F",1)],
 "tiger": [("M13 16 C 22 20, 32 32, 36 46 C 37 51, 39 56, 44 58 C 37 61, 32 56, 30 50 C 26 37, 20 25, 13 16 Z","F",1),
           ("M20 44 C 24 41, 29 40, 32 41 C 28 44, 23 45, 20 44 Z","F",.8)],
 "lotus": [("M25 58 C 24 46, 25 34, 29 22 C 28 34, 28 46, 27 58 Z","F",1),
           ("M29 22 C 32 18, 36 16, 40 16 C 37 20, 33 22, 29 22 Z","F",.85),
           ("M14 64 C 20 61, 30 60, 38 62 C 30 64, 20 65, 14 64 Z","F",.5)],
 "water": [("M10 30 C 17 24, 25 30, 32 26 C 38 23, 43 25, 46 22 C 42 28, 36 30, 30 30 C 23 32, 15 34, 10 30 Z","F",1),
           ("M14 44 C 20 39, 27 43, 33 40 C 38 38, 42 39, 44 37 C 41 42, 35 44, 30 44 C 24 45, 18 47, 14 44 Z","F",.7),
           ("M18 56 C 23 52, 29 55, 34 53 C 37 52, 40 52, 42 51 C 39 55, 34 56, 30 56 C 26 57, 21 58, 18 56 Z","F",.45)],
 "sword": [("M26 14 C 27 28, 27 44, 26 58 C 25 44, 25 28, 26 14 Z","F",1),
           ("M19 24 C 23 23, 29 23, 33 24 C 29 26, 23 26, 19 24 Z","F",.85)],
 "knot":  [("M16 24 C 34 28, 36 46, 22 52 C 12 56, 12 40, 24 38 C 36 36, 40 24, 30 18","S",1)],
 "phoenix":[("M14 58 C 22 44, 32 30, 44 18 C 38 30, 30 42, 18 56 Z","F",1),
            ("M40 22 C 43 18, 46 16, 49 15 C 46 19, 43 21, 40 22 Z","F",.85)],
 "peacock":[("M26 46 C 25 36, 25 26, 27 18 C 28 26, 28 36, 26 46 Z","F",1),
            ("M20 46 C 15 38, 12 30, 12 22 C 16 30, 19 38, 20 46 Z","F",.75),
            ("M32 46 C 37 38, 40 30, 40 22 C 36 30, 33 38, 32 46 Z","F",.75),
            ("M22 52 C 24 49, 28 49, 30 52 C 28 54, 24 54, 22 52 Z","F",1)],
 "lute":  [("M26 18 C 26 26, 20 30, 18 38 C 15 48, 22 56, 30 54 C 38 52, 39 42, 34 36 C 30 31, 27 26, 27 18","S",1)],
 "pine":  [("M24 58 C 25 46, 26 36, 28 24 C 28 36, 27 47, 26 58 Z","F",1),
           ("M14 26 C 22 21, 32 19, 40 21 C 32 25, 22 27, 14 26 Z","F",1),
           ("M18 38 C 23 35, 28 35, 31 37 C 27 40, 21 40, 18 38 Z","F",.7)],
 "tortoise":[("M14 46 C 16 34, 36 34, 38 46 C 30 42, 22 42, 14 46 Z","F",1),
             ("M12 52 C 20 50, 32 50, 40 52 C 32 54, 20 54, 12 52 Z","F",.6)],
 "heaven":[("M10 24 C 20 18, 32 18, 42 24 C 32 22, 20 22, 10 24 Z","F",1),
           ("M24 34 C 26 33, 28 33, 30 34 C 28 36, 26 36, 24 34 Z","F",.7)],
 "carp":  [("M16 50 C 18 38, 28 28, 38 26 C 40 25, 42 22, 42 18 C 44 24, 42 28, 38 30 C 30 34, 22 42, 16 50 Z","F",1)],
 "peach": [("M30 20 C 40 24, 44 36, 38 46 C 32 55, 18 54, 14 44 C 10 34, 18 23, 27 20","S",1),
           ("M28 16 C 31 13, 35 12, 38 13 C 35 16, 31 17, 28 16 Z","F",.85)],
 "house": [("M12 34 L26 20 L40 34","S",1),
           ("M18 48 C 24 46, 30 46, 36 48 C 30 50, 24 50, 18 48 Z","F",.7)],
 "mushroom":[("M14 36 C 17 24, 35 24, 38 36 C 30 32, 22 32, 14 36 Z","F",1),
             ("M24 38 C 24 46, 24 52, 26 58 C 28 52, 28 46, 28 38 Z","F",1),
             ("M20 30 C 22 29, 24 29, 26 30 C 24 31, 22 31, 20 30 Z","F",.6)],
 "pearl": [("M32 26 a9 9 0 1 0 0.15 0","S",1),
           ("M14 48 C 22 42, 34 42, 42 48","S",.7)],
 "willow":[("M20 18 C 22 32, 22 44, 20 58 C 19 44, 19 30, 20 18 Z","F",1),
           ("M22 22 C 30 28, 33 40, 30 52","S",.75),
           ("M24 20 C 34 24, 39 34, 38 46","S",.5)],
 "north": [("M32 24 C 39 28, 41 37, 37 44 C 32 51, 22 50, 18 43 C 14 36, 18 27, 26 24","S",1)],
 "earth": [("M17 46 L27 30 L37 46 C 30 43, 24 43, 17 46 Z","F",1),
           ("M12 54 C 22 51, 32 51, 42 54 C 32 56, 22 56, 12 54 Z","F",.55)],
 "coin":  [("M26 24 a13 13 0 1 0 0.15 0","S",1),
           ("M21 32 h10 v11 h-10 Z","S",.85)],
 "south": [("M16 44 C 19 33, 32 29, 39 37","S",1),
           ("M27 22 l0 -6","S",.8),("M37 26 l4 -5","S",.8),("M17 27 l-4 -4","S",.8)],
}

def glyph_svg(card, color=INK):
    out=[]
    for path,kind,op in GLYPHS[card]:
        o=f' opacity="{op}"' if op!=1 else ""
        if kind=="S":
            out.append(f'<path d="{path}" fill="none" stroke="{color}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"{o}/>')
        else:
            out.append(f'<path d="{path}" fill="{color}"{o}/>')
    return "".join(out)

def full_spread_svg():
    parts=['<svg viewBox="0 0 580 440" xmlns="http://www.w3.org/2000/svg" role="img" class="compass">',
           '<title>Maya&#39;s complete reading, all thirteen cards</title>',
           '<line x1="34" y1="212" x2="546" y2="212" stroke="#E4E5EA" stroke-width="1" stroke-dasharray="3 5"/>',
           '<line x1="290" y1="66" x2="290" y2="358" stroke="#E4E5EA" stroke-width="1" stroke-dasharray="3 5"/>']
    def slot(x,y,card,accent=None):
        col=accent or INK
        frame=f'<rect x="0" y="0" width="52" height="76" rx="6" fill="{"#FFF4F2" if accent else "#FFFFFF"}" stroke="{accent or "#2A2D35"}" stroke-width="{3 if accent else 1.6}"/>'
        name=f'<text x="26" y="90" text-anchor="middle" font-size="8" letter-spacing="1" fill="{"#9E1B14" if accent else "#50545E"}" font-weight="600">{card.upper()}</text>'
        return f'<g transform="translate({x},{y})">{frame}{glyph_svg(card,col)}{name}</g>'
    for name,a in ARMS.items():
        for (x,y),card in zip(a["slots"], FULL_CARDS[name]):
            parts.append(slot(x,y,card))
        parts.append(arm_label(a, True))
    cx,cy=CENTER
    parts.append(slot(cx,cy,FULL_CARDS["center"],accent="#E63329"))
    parts.append('</svg>')
    return "\n".join(parts)

# The author's own cards, shown in the arm each Angle unlocks (Ch.2: Water/Ducks/Lotus)
STAGE_CARDS={2:{"east":["water","ducks","lotus"]}}
CAPTIONS={
 1:"The spread begins at the centre: one card names the heart of it.",
 2:"From my own reading: Water, Ducks, and Lotus, the three cards of my essential nature.",
 3:"The spread so far — this Angle turns to what stands in the way.",
 4:"The spread complete — both futures open at once.",
}
REVEAL={1:["center"],2:["center","east"],3:["center","east","west"],4:["center","east","west","north","south"]}
NEW={1:"center",2:"east",3:"west",4:"north"}   # arm highlighted as newly-unlocked (4 unlocks both futures)

def compass_svg(level, full=False, master=False, focus=None, title=None):
    # master: all four arms established (labels active, solid slots)
    # focus:  arm name to highlight in red while everything is established
    shown=set(ARMS) if (full or master) else (set(REVEAL[level]) if not focus else set())
    ttl = title or ("Maya&#39;s complete reading" if full else f"Spread reveal, stage {level}")
    FOCUS_VB={"south":"300 130 272 160","north":"8 130 272 160","west":"176 18 228 150",
              "east":"176 262 228 158","center":"228 150 124 152"}
    vb=FOCUS_VB.get(focus,"0 0 580 430") if focus else "0 0 580 430"
    parts=[f'<svg viewBox="{vb}" xmlns="http://www.w3.org/2000/svg" role="img" class="compass">',
           f'<title>{ttl}</title>']
    if not focus:   # focus mode isolates one arm: no compass axes
        parts+=['<line x1="34" y1="212" x2="546" y2="212" stroke="#E4E5EA" stroke-width="1" stroke-dasharray="3 5"/>',
                '<line x1="290" y1="66" x2="290" y2="358" stroke="#E4E5EA" stroke-width="1" stroke-dasharray="3 5"/>']
    for name,a in ARMS.items():
        if focus and name!=focus:      # focus: draw only the focused arm
            continue
        active = (name in shown) or (focus==name)
        if master or focus:
            newly = (focus==name)
        else:
            newly = (not full) and ((level==4 and name in ("north","south")) or (NEW.get(level)==name))
        cls = "new" if (active and newly) else ("solid" if active else "ghost")
        # which cards (if any) to draw face-up in this arm
        arm_cards = None
        if master or focus:
            arm_cards = FULL_CARDS[name]                 # master/focus: full deck face-up
        elif (not full) and STAGE_CARDS.get(level,{}).get(name) and active:
            arm_cards = STAGE_CARDS[level][name]         # per-Angle author cards
        if arm_cards and active:
            hi = newly                                    # focused (or newly revealed) arm shows red
            for (x,y),card in zip(a["slots"], arm_cards):
                fill = "#FFF4F2" if hi else "#FFFFFF"
                stroke = "#9E1B14" if hi else "#2A2D35"
                gcol = "#9E1B14" if hi else INK
                ncol = "#9E1B14" if hi else "#50545E"
                parts.append(f'<g transform="translate({x},{y})">'
                             f'<rect x="0" y="0" width="52" height="76" rx="6" fill="{fill}" stroke="{stroke}" stroke-width="{1.8 if hi else 1.6}"/>'
                             f'{glyph_svg(card,gcol)}'
                             f'<text x="26" y="90" text-anchor="middle" font-size="8" letter-spacing="1" fill="{ncol}" font-weight="600">{card.upper()}</text></g>')
        else:
            for (x,y) in a["slots"]:
                parts.append(card_rect(x,y,cls))
        parts.append(arm_label(a, active))
    # center card — drawn for every view except a focus on an arm
    if (not focus) or focus=="center":
        cx,cy=CENTER
        parts.append(f'<rect x="{cx}" y="{cy}" width="52" height="76" rx="6" fill="#FFF4F2" stroke="#E63329" stroke-width="3"/>')
        parts.append(f'<path d="M{cx+26} {cy+20} q7 8 3 16 q-1 3 -6 5 q6 -1 11 3 q6 5 2 13 q9 -6 6 -16 q7 4 5 12 q6 -9 -2 -19 q-9 -11 -24 -14z" fill="#E63329" opacity="0.9"/>')
        parts.append(f'<text x="{cx+26}" y="{cy+92}" text-anchor="middle" font-size="10" fill="#9E1B14" font-weight="700" letter-spacing="1">THE HEART OF IT</text>')
    parts.append('</svg>')
    return "\n".join(parts)

# ---------------------------------------------------------------- card figures & blessings
def card_fig(file, label, float_side=False):
    """A single card shown as line art of the real deck card, for in-text discussion.
    No caption: the card's own name plate already labels it.
    float_side=True floats it beside the following prose (used in the card catalog)."""
    cls="cardfig cardfloat" if float_side else "cardfig"
    return (f'<figure class="{cls}"><img class="cardimg" src="cards-lineart/{file}.webp" alt="{esc(label)} card"></figure>')

def blessings_svg():
    """The Three Blessings pattern: Green Dragon first, Red Dragon centre, White Dragon final."""
    n=13; w=24; h=35; gap=6
    total=n*w+(n-1)*gap
    parts=[f'<svg viewBox="0 0 {total} 78" xmlns="http://www.w3.org/2000/svg" role="img">',
           '<title>The Three Blessings pattern: Green Dragon in the first position, Red Dragon in the centre, White Dragon in the final position</title>']
    special={0:("#2A8A48","GREEN"),6:("#E63329","RED"),12:("#9AA0AA","WHITE")}
    for k in range(n):
        x=k*(w+gap)
        if k in special:
            col,nm=special[k]
            parts.append(f'<g transform="translate({x},0)"><rect x="0.8" y="0.8" width="{w-1.6}" height="{h-1.6}" rx="3" fill="#FFFFFF" stroke="{col}" stroke-width="1.6"/>'
                         f'<g transform="scale({w/52:.3f})">{glyph_svg("dragon",col)}</g>'
                         f'<text x="{w/2}" y="{h+12}" text-anchor="middle" font-size="6.5" letter-spacing="0.5" fill="{col}" font-weight="700">{nm}</text>'
                         f'<text x="{w/2}" y="{h+21}" text-anchor="middle" font-size="6" letter-spacing="0.5" fill="#50545E">DRAGON</text></g>')
        else:
            parts.append(f'<rect x="{x+0.8}" y="0.8" width="{w-1.6}" height="{h-1.6}" rx="3" fill="none" stroke="#C9CCD4" stroke-width="1" stroke-dasharray="3 3" opacity="0.7"/>')
    for pos,lab in ((0,"FIRST"),(6,"CENTRE"),(12,"FINAL")):
        parts.append(f'<text x="{pos*(w+gap)+w/2}" y="{h+33}" text-anchor="middle" font-size="6" letter-spacing="1" fill="#9E1B14" font-weight="600">{lab}</text>')
    parts.append('</svg>')
    return "".join(parts)

# subhead prefix -> single real-card line-art figure (file, label)
CARD_FIGS={
 "The Enlightening Mushroom":("mushroom","Mushroom"),
 "Green Dragon - New Beginnings":("green-dragon","Green Dragon"),
 "Red Dragon - Prosperity":("red-dragon","Red Dragon"),
 "White Dragon - Spirituality":("white-dragon","White Dragon"),
 "South - General Success":("south","South"),
 "Phoenix - Joy":("phoenix","Phoenix"),
 "Pearl - Hidden Treasures":("pearl","Pearl"),
 "The North - The Void":("north","North"),
 "Fire - The Consuming Flame":("fire","Fire"),
 "The Knot - The Web":("knot","Knot"),
 "The Willow - The Collapse":("willow","Willow"),
 "The Ducks - True Partnership":("ducks","Ducks"),
 "The Phoenix - Passionate Joy":("phoenix","Phoenix"),
 "The Peach - Complications":("peach","Peach"),
 "The Earth Card - Stability":("earth","Earth"),
 "The Red Dragon - Abundant Prosperity":("red-dragon","Red Dragon"),
}
# subhead prefix -> the Three Blessings diagram
BLESSINGS_AFTER="The Sacred Triangle of Fortune"

# ---- full-deck card matcher: display name -> line-art file ----
DECK={
 "Green Dragon":"green-dragon","Red Dragon":"red-dragon","White Dragon":"white-dragon",
 "Plum Blossom":"plum-blossom","Seven Stars":"seven-stars",
 "Bamboo":"bamboo","Carp":"carp","Chrysanthemum":"chrysanthemum","Door":"door","Dragon":"dragon",
 "Ducks":"ducks","Earth":"earth","Farmer":"farmer","Fire":"fire","Fisherman":"fisherman",
 "Heaven":"heaven","House":"house","Insect":"insect","Jade":"jade","Knot":"knot","Lotus":"lotus",
 "Lute":"lute","Mushroom":"mushroom","Orchid":"orchid","Peach":"peach","Peacock":"peacock",
 "Pearl":"pearl","Phoenix":"phoenix","Pine":"pine","Scholar":"scholar","Sword":"sword",
 "Tiger":"tiger","Toad":"toad","Tortoise":"tortoise","Unicorn":"unicorn","Water":"water",
 "Willow":"willow","Woodcutter":"woodcutter",
 "North":"north","South":"south","East":"east","West":"west",
}
# longest names first so "Green Dragon" wins over "Dragon"
_DECK_ORDER=sorted(DECK, key=lambda s:-len(s))
def find_card(text):
    """Return (file,label) for a high-confidence card reference in text, else None.
    High-confidence = the Title-Case card name followed by Card / Guardian / '(' /
    'in the ... position', or preceded by 'the'."""
    for name in _DECK_ORDER:
        # directional honor cards double as spread positions -> too ambiguous to auto-detect
        if name in ("North","South","East","West"):
            continue
        # name as a proper card reference: "<Name> Card/Guardian" or "The <Name>"
        if re.search(r'\b'+re.escape(name)+r'\b(?=\s+(?:Card|Guardian))',text):
            return DECK[name],name
        if re.search(r'\b'+re.escape(name)+r'\b(?=\s+in\s+the\s+\w+\s+position)',text):
            return DECK[name],name
        if re.search(r'\bThe\s+'+re.escape(name)+r'\b',text):
            return DECK[name],name
    return None

# chapter number -> extra diagram after the chapter head
CHAPTER_DIAGRAMS={
 9:("focus","south","The Year Ahead: the South arm holds your next twelve months."),
 10:("focus","north","The Long View: the North arm holds the future you are building toward."),
 11:("master",None,"The complete Mahjong Mirror: all four angles of reflection at once."),
}
SECTION_ART={
 1:("sec1-contemplation.webp","A hand holds a mirror upright; a faint reflection waits in the glass."),
 2:("sec2-know-thyself.webp","The mirror drawn close; the reflection fills the glass."),
 3:("sec3-opposition.webp","The mirror turned away; only its dark back shows."),
 4:("sec4-future.webp","The mirror lifted high; red light streams from the glass."),
}

# ---------------------------------------------------------------- exhibit / imagery placeholders
exhibit_n=0
def exhibit(label, kind, ratio):
    global exhibit_n; exhibit_n+=1
    tags={"card":("Cards","the real card art"),"diagram":("Diagram","a card-position diagram"),
          "art":("Art","an illustration for this section")}
    tag,hint=tags[kind]
    return (f'<figure class="ex ex-{kind}" data-ratio="{ratio}"><div class="ex-frame">'
            f'<span class="ex-plus">＋</span><span class="ex-drop">{hint}</span></div>'
            f'<figcaption><span class="ex-tag">{tag} · Exhibit {exhibit_n}</span>{esc(label)}</figcaption></figure>')

# ---------------------------------------------------------------- walk blocks -> HTML + TOC
bodyht=[]; toc=[]; used=set(); section_n=0; awaiting_reveal=None
def uid(base):
    b=slug(base) or "s"; x=b; k=2
    while x in used: x=f"{b}-{k}";k+=1
    used.add(x); return x

def close_open():   # close any open <section>
    if bodyht and bodyht[-1]=="<!open-sec-->": bodyht.pop()

i=0; N=len(BLOCKS); open_sec=False
in_appendix_c=False; cards_shown=set()
def opensec(cls,rid,extra=""):
    global open_sec
    if open_sec: bodyht.append("</section>")
    bodyht.append(f'<section class="{cls}" id="{rid}" {extra}>'); open_sec=True

while i<N:
    b=BLOCKS[i]; t=b["type"]; tx=b.get("text","")
    if t=="part":
        section_n+=1
        sub=""
        if i+1<N and BLOCKS[i+1]["type"]=="angle": sub=BLOCKS[i+1]["text"]; i+=1
        num=re.sub(r"[^0-9]","",tx); rid=uid("section-"+num)
        toc.append(("part",f"Section {num}",sub,rid))
        if open_sec: bodyht.append("</section>"); open_sec=False
        art=SECTION_ART.get(int(num))
        art_html=(f'<div class="so-art"><img class="so-img" src="art/{art[0]}" alt="{esc(art[1])}"></div>' if art
                  else '<div class="so-art"><div class="ex-frame art"><span class="ex-plus">＋</span><span class="ex-drop">section art</span></div></div>')
        bodyht.append(f'''<section class="page section-open" id="{rid}">
  {art_html}
  <p class="so-kicker">Section {esc(roman.get(int(num),num))}</p>
  <h2 class="so-title">{esc(sub or tx)}</h2>
  <div class="so-orn">✦</div>
</section>''')
        awaiting_reveal=section_n     # next chapter is this angle's intro -> gets the reveal diagram
        i+=1; continue
    if t=="angle":
        bodyht.append(f'<p class="angle-loose">{esc(tx)}</p>'); i+=1; continue
    if t=="chapter":
        named=b.get("named"); app=b.get("appendix")
        in_appendix_c = (tx.strip()=="APPENDIX C")
        if in_appendix_c:
            # dragons feature in the Three Blessings diagram; keep their reference-guide
            # subhead portraits but suppress redundant auto-inserts in the narrative
            cards_shown={"green-dragon","red-dragon","white-dragon"}
        m=re.match(r"Chapter\s+(\d+):\s*(.+)",tx); rid=uid(tx)
        if m:
            cnum,ctitle=m.group(1),m.group(2)
            toc.append(("chapter",f"Chapter {cnum}",ctitle,rid))
            reveal_html=""
            if awaiting_reveal:
                reveal_html=f'<div class="reveal">{compass_svg(min(awaiting_reveal,4))}<p class="reveal-cap">{CAPTIONS[min(awaiting_reveal,4)]}</p></div>'
                awaiting_reveal=None
                cls="page chapter angle-intro"
            elif int(cnum) in CHAPTER_DIAGRAMS:
                kind,arg,cap=CHAPTER_DIAGRAMS[int(cnum)]
                svg=compass_svg(4,master=(kind=="master"),focus=arg,title=cap)
                rc="reveal reveal-focus" if kind=="focus" else "reveal"
                reveal_html=f'<div class="{rc}">{svg}<p class="reveal-cap">{esc(cap)}</p></div>'
                cls="page chapter angle-intro"
            else:
                cls="chapter"
            if open_sec: bodyht.append("</section>"); open_sec=False
            bodyht.append(f'<section class="{cls}" id="{rid}"><header class="ch-head"><p class="ch-kick">Chapter {esc(cnum)}</p><h3 class="ch-title">{esc(ctitle)}</h3><div class="ch-orn">✦ ✦ ✦</div></header>{reveal_html}')
            open_sec=True
        else:
            label=tx.title() if named else tx
            kind="appendix" if app else "front"
            toc.append((kind,label,"",rid))
            if open_sec: bodyht.append("</section>"); open_sec=False
            bodyht.append(f'<section class="chapter {kind}" id="{rid}"><header class="ch-head {kind}"><h3 class="ch-title solo">{esc(label)}</h3><div class="ch-orn">✦ ✦ ✦</div></header>')
            if tx.strip()=="APPENDIX B":
                cap="The Four Angles of the Mahjong Mirror: the complete thirteen-card compass."
                bodyht.append(f'<div class="reveal">{compass_svg(4,master=True,title=cap)}<p class="reveal-cap">{esc(cap)}</p></div>')
            open_sec=True
        i+=1; continue
    if t=="prologue_note":
        bodyht.append(f'<p class="prologue-note">{esc(tx)}</p>'); i+=1; continue
    if t=="full_spread":
        bodyht.append(f'<figure class="reveal full-spread">{full_spread_svg()}<figcaption class="reveal-cap">{esc(tx)} The complete thirteen-card spread, all four Angles at once.</figcaption></figure>'); i+=1; continue
    if t=="cardgroup":
        bodyht.append(f'<div class="cardgroup"><h4 class="cg-title">{esc(tx)}</h4></div>'); i+=1; continue
    if t=="subhead":
        bodyht.append(f'<h4 class="subhead">{esc(tx)}</h4>')
        if tx.startswith(BLESSINGS_AFTER):
            bodyht.append(f'<figure class="blessings">{blessings_svg()}<figcaption class="reveal-cap">The Three Blessings: Green Dragon first, Red Dragon centre, White Dragon final, the rarest and most auspicious pattern.</figcaption></figure>')
            cards_shown.update({"green-dragon","red-dragon","white-dragon"})   # shown in the pattern; don't auto-repeat
        for pref,(cfile,label) in CARD_FIGS.items():
            if tx.startswith(pref):
                bodyht.append(card_fig(cfile,label)); cards_shown.add(cfile); break
        i+=1; continue
    if t=="epigraph":
        bodyht.append(f'<blockquote class="epigraph">{esc(tx)}</blockquote>'); i+=1; continue
    if t=="numbered_angles":
        items="".join(f"<li>{esc(x)}</li>" for x in b["items"])
        tail=f'<p>{esc(b["tail"])}</p>' if b.get("tail") else ""
        bodyht.append(f'<p>{esc(b["lead"])}</p><ol class="angles-num">{items}</ol>{tail}'); i+=1; continue
    if in_appendix_c:
        hit=find_card(tx)
        if hit and hit[0] not in cards_shown:
            cards_shown.add(hit[0])
            bodyht.append(card_fig(hit[0],hit[1],float_side=True))
    bodyht.append(f'<p>{esc(tx)}</p>'); i+=1
if open_sec: bodyht.append("</section>")

toc_html="\n".join(
    f'<li class="toc-{k}"><a href="#{r}"><span class="toc-lab">{esc(l)}</span>'
    +(f'<span class="toc-sub">{esc(s)}</span>' if s else "")+'</a></li>'
    for k,l,s,r in toc)
body_html="\n".join(bodyht)

CSS=r"""
:root{--paper:#FFFFFF;--paper-2:#F5F5F7;--ink:#14161B;--ink-soft:#50545E;--red:#E63329;
--red-deep:#9E1B14;--red-dark:#75130E;--rule:#E4E5EA;--frame:#C9CCD4;
--serif:"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif;
--sans:"Avenir Next","Segoe UI",system-ui,sans-serif;--measure:36rem;}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--serif);font-size:1.18rem;
line-height:1.75;text-align:left;hyphens:none;-webkit-hyphens:none;word-break:normal;overflow-wrap:break-word;
-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;}
.book{max-width:var(--measure);margin:0 auto;padding:0 1.4rem 8rem;}
.page{min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:3rem 0;
scroll-margin-top:0;}
p{margin:0 0 1.15rem}
/* title */
.titlepage{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
text-align:center;border-bottom:1px solid var(--rule)}
.tp-kicker{font-family:var(--sans);letter-spacing:.42em;text-transform:uppercase;font-size:.72rem;color:var(--red);margin:0 0 1.4rem}
.titlepage h1{font-size:clamp(2.8rem,9vw,4.6rem);line-height:1.02;margin:0;font-weight:600}
.tp-sub{font-style:italic;color:var(--ink-soft);font-size:1.25rem;margin:1.2rem 0 2rem}
.tp-orn{color:var(--red-deep);font-size:1.6rem;margin-bottom:2rem}
.tp-author{font-family:var(--sans);letter-spacing:.06em}
.tp-role{font-family:var(--sans);font-size:.82rem;color:var(--ink-soft);letter-spacing:.12em;text-transform:uppercase;margin-top:.4rem}
/* toc */
.toc{min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:3rem 0}
.toc h2{font-family:var(--sans);text-transform:uppercase;letter-spacing:.3em;font-size:.8rem;color:var(--red);text-align:center;margin:0 0 1.8rem}
.toc ul{list-style:none;margin:0;padding:0}
.toc a{text-decoration:none;color:var(--ink);display:flex;flex-direction:column;padding:.32rem .2rem;border-radius:4px}
.toc a:hover{background:var(--paper-2)}
.toc-lab{font-family:var(--sans);font-size:.92rem}
.toc-sub{color:var(--ink-soft);font-style:italic;font-size:.9rem}
.toc-part{margin-top:1.3rem}
.toc-part .toc-lab{text-transform:uppercase;letter-spacing:.18em;font-size:.78rem;color:var(--red-deep);font-weight:600}
.toc-chapter{padding-left:1.2rem}
.toc-appendix .toc-lab,.toc-front .toc-lab{color:var(--ink-soft);letter-spacing:.14em;text-transform:uppercase;font-size:.76rem;margin-top:.7rem}
/* section opener (full page) */
.section-open{text-align:center;border-top:1px solid var(--rule)}
.so-art{margin:0 0 2.4rem}
.so-kicker{font-family:var(--sans);text-transform:uppercase;letter-spacing:.5em;font-size:.74rem;color:var(--red);margin:0}
.so-title{font-size:clamp(1.7rem,5vw,2.4rem);font-weight:500;font-style:italic;margin:.6rem auto 0;max-width:26rem}
.so-orn{color:var(--red);font-size:1.3rem;margin-top:1.2rem}
/* chapter */
.chapter{margin:0;padding-top:3rem}
.ch-head{text-align:center;margin:0 0 2rem}
.ch-kick{font-family:var(--sans);text-transform:uppercase;letter-spacing:.34em;font-size:.74rem;color:var(--red);margin:0 0 .5rem}
.ch-title{font-size:2rem;line-height:1.15;margin:0;font-weight:600}
.ch-title.solo{font-size:1.7rem}
.ch-orn{color:var(--red-deep);letter-spacing:.5em;margin-top:1rem;font-size:.8rem}
.angle-intro{border-top:1px solid var(--rule)}
/* reveal diagram */
.reveal{width:min(48rem,92vw);max-width:none;margin:1.5rem auto 3rem;text-align:center;position:relative;left:50%;transform:translateX(-50%)}
.reveal-focus{width:min(26rem,80vw)}
.cardimg{width:100%;height:auto;display:block;border-radius:4px}
.cardfig figcaption{font-family:var(--sans);font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;color:var(--red-deep);margin-top:.5rem;font-weight:600}
.cardfloat{float:right;width:9rem;margin:.2rem 0 1rem 1.6rem;clear:right}
@media(max-width:34rem){.cardfloat{float:none;margin:1.2rem auto;width:8rem}}
.compass{width:100%;height:auto;font-family:var(--sans)}
.reveal-cap{font-family:var(--sans);font-size:.85rem;color:var(--ink-soft);font-style:italic;margin-top:.9rem}
/* subhead / epigraph */
.subhead{font-family:var(--sans);font-weight:600;font-size:1.12rem;margin:2.6rem 0 1rem;color:var(--red-deep);line-height:1.35}
.subhead::before{content:"";display:block;width:2.2rem;height:2px;background:var(--red);margin:0 0 .9rem;opacity:.7}
.epigraph{margin:1.4rem auto 2.2rem;max-width:27rem;text-align:center;font-style:italic;color:var(--ink-soft);border:none;padding:0}
.epigraph::before{content:"\201C";font-size:2.6rem;color:var(--red);opacity:.5;display:block;line-height:.6;margin-bottom:.3rem}
.angles-num{margin:1rem 0 1.4rem;padding-left:0;list-style:none;counter-reset:a}
.angles-num li{counter-increment:a;position:relative;padding-left:2.6rem;margin:.7rem 0}
.angles-num li::before{content:counter(a);position:absolute;left:0;top:-.1rem;width:1.7rem;height:1.7rem;
background:var(--red-deep);color:var(--paper);border-radius:50%;font-family:var(--sans);font-weight:700;
font-size:.9rem;display:flex;align-items:center;justify-content:center}
.prologue-note{font-family:var(--sans);text-transform:uppercase;letter-spacing:.28em;font-size:.72rem;color:var(--red);text-align:center;margin:0 0 2rem}
.cardgroup{text-align:center;margin:3.5rem 0 1rem}
.cg-title{font-family:var(--sans);text-transform:uppercase;letter-spacing:.28em;font-size:1rem;color:var(--red);margin:0;padding:1rem 0;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
/* placeholders */
.ex,.reveal{page-break-inside:avoid}
.ex{margin:2rem auto 2.4rem;max-width:30rem}
.ex-frame{position:relative;border:2px dashed var(--frame);border-radius:10px;background:var(--paper-2);
display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4rem;color:var(--ink-soft)}
.ex[data-ratio="card"] .ex-frame{aspect-ratio:5/4}
.ex[data-ratio="wide"] .ex-frame{aspect-ratio:16/7}
.so-art .ex-frame.art{aspect-ratio:16/9}
.ex-plus{font-size:1.7rem;color:var(--frame)}
.ex-drop{font-family:var(--sans);font-size:.7rem;letter-spacing:.16em;text-transform:uppercase}
.ex figcaption{font-family:var(--sans);font-size:.84rem;text-align:center;margin-top:.6rem;color:var(--ink)}
.ex-tag{display:inline-block;background:var(--red-deep);color:#fff;font-size:.62rem;letter-spacing:.14em;
text-transform:uppercase;padding:.16rem .48rem;border-radius:3px;margin-right:.5rem;vertical-align:.08em}
.angle-loose{font-style:italic;color:var(--ink-soft);text-align:center}
.totop{position:fixed;right:1rem;bottom:1rem;font-family:var(--sans);font-size:.72rem;letter-spacing:.1em;
text-transform:uppercase;background:var(--red-deep);color:#fff;text-decoration:none;padding:.5rem .8rem;border-radius:20px;opacity:.85}
.so-img{width:100%;height:auto;display:block;margin:0 auto}
.cardfig{margin:1.8rem auto 2.2rem;width:8.5rem;text-align:center;page-break-inside:avoid}
.cardfig svg{width:100%;height:auto}
.blessings{width:min(40rem,92vw);margin:1.8rem auto 2.4rem;text-align:center;position:relative;left:50%;transform:translateX(-50%);page-break-inside:avoid}
.blessings svg{width:100%;height:auto}
@media print{.totop{display:none}.page,.section-open,.titlepage,.toc{min-height:auto;page-break-after:always}
.angle-intro{page-break-before:always}}
"""

HTML=f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Mahjong Mirror by Bill Hajdu</title>
<meta name="description" content="Your path to wiser decisions. Bill Hajdu&#39;s guide to the thirteen-card Mahjong spread: four angles of reflection revealing the heart of it, who you are, what stands in the way, and the futures ahead.">
<link rel="canonical" href="https://www.mahjongtarot.com/book/the-mahjong-mirror.html">
<meta property="og:type" content="book">
<meta property="og:title" content="The Mahjong Mirror: Your Path to Wiser Decisions">
<meta property="og:description" content="Bill Hajdu&#39;s guide to the thirteen-card Mahjong spread: four angles of reflection revealing the heart of it, who you are, what stands in the way, and the futures ahead.">
<meta property="og:url" content="https://www.mahjongtarot.com/book/the-mahjong-mirror.html">
<meta property="og:image" content="https://www.mahjongtarot.com/book/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="The Mahjong Tarot">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="The Mahjong Mirror: Your Path to Wiser Decisions">
<meta name="twitter:description" content="Bill Hajdu&#39;s guide to the thirteen-card Mahjong spread: four angles of reflection for wiser decisions.">
<meta name="twitter:image" content="https://www.mahjongtarot.com/book/og-image.png">
<style>{CSS}</style></head>
<body><a class="totop" href="#top">↑ Top</a><main class="book" id="top">
<header class="titlepage"><p class="tp-kicker">The Mahjong Mirror</p>
<h1>The<br>Mahjong<br>Mirror</h1><p class="tp-sub">Your Path to Wiser Decisions</p>
<div class="tp-orn">✦</div><p class="tp-author">By Bill Hajdu</p>
<p class="tp-role">Mahjong Tarot Reader &amp; Chinese Astrologer</p></header>
<nav class="toc"><h2>Contents</h2><ul>{toc_html}</ul></nav>
{body_html}
</main></body></html>"""
open(OUT,"w",encoding="utf-8").write(HTML)
print("wrote",OUT,"| exhibits:",exhibit_n,"| toc:",len(toc))
