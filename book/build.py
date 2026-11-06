#!/usr/bin/env python3
# Build book.html from manuscript.txt for "The Mahjong Mirror".
# Stages: parse -> clean text -> restructure front matter -> emit HTML.
import re, html, json, unicodedata

import os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC  = f"{HERE}/manuscript.txt"
OUT  = f"{HERE}/book.html"

# ----------------------------------------------------------------------------
# 1. PARSE  (indentation-driven paragraph assembly)
# ----------------------------------------------------------------------------
raw = open(SRC, encoding="utf-8").read().replace("\f","")   # form feeds mark PDF page breaks
lines = ["" if re.fullmatch(r"\s*\d{1,3}\s*", l) else l for l in raw.split("\n")]   # page numbers act as a break
text  = "\n".join(lines)
pos = [m.start() for m in re.finditer(r"ABOUT THE AUTHOR", text)]
body = text[pos[1]:] if len(pos) >= 2 else text
blines = body.split("\n")

RE_PART      = re.compile(r"^\s*SECTION\s+\d+\s*$")
RE_ANGLE     = re.compile(r"^\s*The\s+(First|Second|Third|Fourth)\s+Angle\s*($|[:\-–].*)$")
RE_CHAPTER   = re.compile(r"^\s*Chapter\s+\d+:\s*.+$")
RE_APPENDIX  = re.compile(r"^\s*APPENDIX\s+[A-C]\s*$")
RE_NAMED     = re.compile(r"^\s*(PREFACE|INTRODUCTION|ABOUT THE AUTHOR|TAKEAWAYS)\s*$")
RE_CARDGROUP = re.compile(r"^\s*\d+\.\s+[A-Z][A-Z ]+$")
RE_LISTITEM  = re.compile(r"^\s*(•|\d+\.\s)")

def leading(l): return len(l) - len(l.lstrip(" "))

def looks_subhead(s):
    if not s or len(s) > 70: return False
    if s[-1] in ".!,:;\"”’": return False
    if s[0] in "\"“'‘": return False
    if not s[0].isupper(): return False
    if len(s.split()) > 10: return False
    if sum(c.isalpha() for c in s) < len(s)*0.6: return False
    return True

blocks=[]; para=[]; last_struct=None
def flush():
    global para
    if para:
        t=" ".join(x.strip() for x in para)
        t=re.sub(r"(\w)-\s+(\w)", r"\1-\2", t)     # line-end hyphens in the source are real (decision-making)
        t=re.sub(r"\s{2,}"," ",t).strip()
        if t: blocks.append({"type":"li" if RE_LISTITEM.match(t) else "para","text":t})
        para=[]

i=0; n=len(blines); prev_blank=True
while i<n:
    l=blines[i]; s=l.strip(); ind=leading(l)
    nxt=blines[i+1].strip() if i+1<n else ""
    if s=="":
        i+=1; prev_blank=True; continue
    if RE_PART.match(l):
        flush(); blocks.append({"type":"part","text":s}); last_struct="part"; i+=1; prev_blank=False; continue
    if RE_ANGLE.match(l) and last_struct=="part":
        title=s; j=i+1
        while j<n and blines[j].strip() and not RE_CHAPTER.match(blines[j]) and blines[j].strip()[0] not in "\"“":
            title+=" "+blines[j].strip(); j+=1
        flush(); blocks.append({"type":"angle","text":re.sub(r"\s+"," ",title)}); last_struct="angle"; i=j; prev_blank=True; continue
    if RE_CHAPTER.match(l):
        title=s; j=i+1
        while j<n and blines[j].strip() and blines[j].strip()[0] not in "\"“":
            title+=" "+blines[j].strip(); j+=1
        flush(); blocks.append({"type":"chapter","text":re.sub(r"\s+"," ",title)}); last_struct="chapter"; i=j; prev_blank=True; continue
    if RE_APPENDIX.match(l):
        flush(); blocks.append({"type":"chapter","text":s,"appendix":True}); last_struct="chapter"; i+=1; prev_blank=False; continue
    if RE_NAMED.match(l):
        flush(); blocks.append({"type":"chapter","text":s,"named":True}); last_struct="chapter"; i+=1; prev_blank=False; continue
    if RE_CARDGROUP.match(l):
        flush(); blocks.append({"type":"cardgroup","text":s}); last_struct="cardgroup"; i+=1; prev_blank=False; continue
    if prev_blank and s[0]=="“":           # curly-quoted block = epigraph (straight quotes are dialogue)
        q=[s]; j=i+1
        while j<n and blines[j].strip(): q.append(blines[j].strip()); j+=1
        q=re.sub(r"\s+"," "," ".join(q)); k=q.rfind("”")
        e={"type":"epigraph","text":q[:k+1].strip() if k>0 else q}
        if k>0 and q[k+1:].strip(): e["cite"]=q[k+1:].strip()
        flush(); blocks.append(e); last_struct="epigraph"; i=j; prev_blank=False; continue
    # centered multi-line heading: a blank-delimited run of deeply indented short lines
    if prev_blank and ind>=4 and not RE_LISTITEM.match(l) and nxt:
        j=i; g=[]
        while j<n and blines[j].strip() and leading(blines[j])>=(4 if j==i else 5) and len(blines[j].strip())<70 and not RE_LISTITEM.match(blines[j]):
            g.append(blines[j].strip()); j+=1
        if len(g)>=2 and (j>=n or not blines[j].strip()):
            t=re.sub(r"\s+"," "," ".join(g))
            typ="chsub" if last_struct=="chapter" else "subhead"
            t,_,rest=t.partition(" Chapter: ")      # Appendix A carries a second, chapter-style title
            flush(); blocks.append({"type":typ,"text":t})
            if rest: blocks.append({"type":"subhead","text":rest})
            last_struct=typ; i=j; prev_blank=False; continue
    if prev_blank and nxt=="" and looks_subhead(s):
        flush(); blocks.append({"type":"subhead","text":s}); last_struct="subhead"; i+=1; prev_blank=False; continue
    # ordinary body line -> indentation decides paragraph boundary
    if para and RE_LISTITEM.match(para[0]) and not RE_LISTITEM.match(l) and ind>leading(para[0]):
        pass                 # continuation of a list item (hanging indent)
    elif ind>=2 and para:    # indented => new paragraph
        flush()
    elif para and RE_LISTITEM.match(l):
        flush()
    para.append(l); i+=1; prev_blank=False
flush()

# a numbered line that reads as a heading and is followed by prose is a numbered subhead, not a list
for k,b in enumerate(blocks):
    if b["type"]=="li" and re.match(r"\d+\.\s",b["text"]) and not b["text"].endswith("?") and looks_subhead(re.sub(r"^\d+\.\s+","",b["text"])) \
       and (k+1>=len(blocks) or blocks[k+1]["type"]!="li"):
        b["type"]="subhead"

# ----------------------------------------------------------------------------
# 2. CLEAN TEXT  (em dashes, spaced-hyphen dashes, age line)
# ----------------------------------------------------------------------------
def dedash(t):
    t=re.sub("[\u2f00-\u2fdf]", lambda m: unicodedata.normalize("NFKC", m.group()), t)  # Kangxi radicals -> 人, 无
    t=t.replace("—", ", ").replace("–", ", ")  # em/en dash -> comma
    t=re.sub(r"\s+-\s+", ", ", t)                  # spaced hyphen used as a dash -> comma
    t=re.sub(r"\s+,\s+", ", ", t)
    t=re.sub(r",\s*,", ",", t)
    t=re.sub(r",\s*([.;:!?])", r"\1", t)
    t=re.sub(r"([?!]),\s", r"\1 ", t)          # "Who Am I?, This" -> "Who Am I? This"
    t=re.sub(r"\s+([.,;:!?])", r"\1", t)
    t=re.sub(r"\s{2,}"," ",t)
    return t.strip()

AGE_RE=re.compile(r",?\s*at seventy-seven,?", re.I)
for b in blocks:
    if b["type"] in ("para","li","epigraph"):
        if b["type"]=="para" and AGE_RE.search(b["text"]):
            b["text"]=AGE_RE.sub(", in the latter stages of my life,", b["text"])
        b["text"]=dedash(b["text"])
    if b["type"] in ("chapter","chsub","subhead","angle","part","cardgroup"):
        # keep angle/subhead dashes as a colon-free clean form
        b["text"]=b["text"].replace("—",": ").strip()
        b["text"]=re.sub(r"\s*:\s+",": ",re.sub(r"\s+-\s+",": ",b["text"])) if b["type"] in ("angle","chapter","chsub","subhead") else b["text"]

# ----------------------------------------------------------------------------
# 2b. EDITORIAL REPAIRS  (structure the PDF text extraction lost; exact text -> fix)
# ----------------------------------------------------------------------------
PROMOTE_SUBHEAD={
 "Internal Opposition: When You Stand in Your Own Way",
 "The Three Scenarios: Reading the Probability Landscape",
 "Scenario One: The Mixed Landscape (Approximately 50-50 Probability)",
 "The Decision-Making Framework for Your Twelve Months",
 "When Short-Term Success Meets Long-Term Challenges",
 "The Evolution of My Reading Method: From Scattered Insights to Cohesive Story",
 "The Mechanics of a Mahjong Reading: My Step-by-Step Method",
 "The Three Blessings: When Heaven Whispers Its Rarest Secret",
 "The Eight Guardians: Seasonal Wisdom and Noble Work",
}
LI=lambda t:{"type":"li","text":"• "+t}
REPLACE={
 "Who Am I?: Your core essence and unchanging nature":[LI("Who Am I? Your core essence and unchanging nature")],
 "What Do I Really Want? Your deepest desires beneath surface wishes":[LI("What Do I Really Want? Your deepest desires beneath surface wishes")],
 "What's Happening Now? Your current circumstances and timing":[LI("What's Happening Now? Your current circumstances and timing")],
 "The Central Theme Card, Located at the center":[
   LI("The Central Theme Card: located at the center of the entire spread, representing the core issue at hand"),
   LI("The Center Card in the West: the solution or key to overcoming obstacles"),
   LI("The Center Card in the East: what you truly desire deep in your heart")],
 "What is the central issue you're dealing with? (Central Theme Card)":[
   LI("What is the central issue you're dealing with? (Central Theme Card)"),
   LI("What approach might help you overcome obstacles? (Center Card in the West)"),
   LI("What do you truly want in your heart? (Center Card in the East)")],
}
out=[]
for b in blocks:
    t=b.get("text","")
    if b["type"]=="para" and t in PROMOTE_SUBHEAD:
        b["type"]="subhead"
    rep=next((v for k,v in REPLACE.items() if t.startswith(k)), None)
    if rep and b["type"] in ("para","subhead"): out+=rep; continue
    if b["type"]=="li": b["text"]=re.sub(r"^(\d+\.\s+[^,]{3,60}?), ([A-Z])", r"\1: \2", b["text"])  # "first - What" was dedashed to a comma
    out.append(b)
blocks=out

# ----------------------------------------------------------------------------
# 3. NUMBER THE FOUR ANGLES  (the "dance together" passage)
# ----------------------------------------------------------------------------
for b in blocks:
    if b["type"]=="para" and "four angles dance together" in b["text"]:
        m=re.search(r"(.*?dance together[^.]*\.)\s*(.*)", b["text"])
        if m:
            lead=m.group(1); rest=m.group(2)
            sents=re.findall(r"[^.]*\.", rest)
            items=[s.strip() for s in sents[:4] if s.strip()]
            tail=" ".join(s.strip() for s in sents[4:]).strip()
            b["type"]="numbered_angles"; b["lead"]=lead; b["items"]=items; b["tail"]=tail
        break

# ----------------------------------------------------------------------------
# 4. RESTRUCTURE FRONT MATTER  (prologue + bio to back)  -- relocate, keep prose
# ----------------------------------------------------------------------------
def find(pred):
    return next((k for k,b in enumerate(blocks) if pred(b)), None)

# 4a. lift the Maya scene (subhead 'The Thread That Connects Everything' .. before 'The Heart of the Reading')
s0=find(lambda b:b["type"]=="subhead" and b["text"].startswith("The Thread That Connects"))
s1=find(lambda b:b["type"]=="subhead" and b["text"].startswith("The Heart of the Reading"))
prologue=[]
if s0 is not None and s1 is not None and s1>s0:
    prologue=blocks[s0+1:s1]           # drop the subhead itself, keep the scene paragraphs
    del blocks[s0:s1]

# 4b. pull 'A Confluence of Experiences' subhead + its paras (until next subhead/chapter)
c0=find(lambda b:b["type"]=="subhead" and b["text"].startswith("A Confluence of Experiences"))
confluence=[]
if c0 is not None:
    c1=c0+1
    while c1<len(blocks) and blocks[c1]["type"] not in ("subhead","chapter","part","cardgroup"):
        c1+=1
    confluence=blocks[c0:c1]
    del blocks[c0:c1]

# 4c. pull the whole 'ABOUT THE AUTHOR' chapter (until next chapter)
a0=find(lambda b:b["type"]=="chapter" and b["text"].upper()=="ABOUT THE AUTHOR")
about=[]
if a0 is not None:
    a1=a0+1
    while a1<len(blocks) and blocks[a1]["type"]!="chapter":
        a1+=1
    about=blocks[a0:a1]
    del blocks[a0:a1]

# assemble: [PROLOGUE] + remaining(front+body) + [ABOUT BILL at back]
front=[]
if prologue:
    front.append({"type":"chapter","text":"Prologue","named":True})
    front.append({"type":"prologue_note","text":"A reading."})
    front+=prologue
    # close the scene by pulling back to Maya's complete reading (begin with the end in mind)
    front.append({"type":"subhead","text":"The Whole Picture"})
    front.append({"type":"para","text":"But the Fire card was only the center of the reading. Around it lay twelve more, arranged like points on a compass, each one throwing light on Maya's situation from a different direction."})
    front.append({"type":"para","text":"This is where most people misunderstand the practice. There is a great deal more to this astrology than the year you were born, or a single card turned over and pronounced above you like a verdict. Your zodiac sign is one thread in the weave. A lone card is one word in a sentence. Neither can carry the whole story of a life."})
    front.append({"type":"para","text":"What Maya received that afternoon was the entire picture. The card at the center named the force shaping everything else. The cards to one side showed her who she truly was beneath the exhaustion, and the cards opposite showed what stood in her way. Ahead of her lay two futures: the year directly in front of her, and the longer life she was quietly building toward."})
    front.append({"type":"full_spread","text":"Maya's reading, in full."})
    front.append({"type":"para","text":"By the time we finished, Maya had stopped asking whether to change her job or her city. She was asking a better question, one the spread had placed in her hands: how do I build a life that lets my fire warm me rather than burn me out? She walked away with a decision, not a horoscope."})
    front.append({"type":"para","text":"That is the promise of the pages ahead. Over the chapters to come you will learn to read all four angles of your own reflection, discovering the full framework one direction at a time, until the complete picture is yours to see. We begin, as every sound decision does, and as Maya did, with the end in mind."})
back=[]
if about or confluence:
    back.append({"type":"chapter","text":"About Bill Hajdu","named":True})
    back+= [b for b in about if b["type"] not in ("chapter","chsub")]
    back+= confluence

blocks = front + blocks + back

# typographic quotes: the manuscript mixes straight and curly
def smart(t):
    t=re.sub(r'(^|[\s(\[{])"', r'\1“', t).replace('"', '”')
    t=re.sub(r'(^|\s)”(?=\w)', r'\1“', t)               # source has a few backwards curly openers
    t=re.sub(r"(\w)'(\w)", r"\1’\2", t)                 # apostrophes: don't, Maya's
    t=re.sub(r"(^|[\s(\[{“])'", r"\1‘", t).replace("'", "’")
    return t
for b in blocks:
    for k in ("text","lead","tail","cite"):
        if k in b: b[k]=smart(b[k])
    if "items" in b: b["items"]=[smart(x) for x in b["items"]]

open(f"{HERE}/blocks.json","w").write(json.dumps(blocks,ensure_ascii=False,indent=1))
from collections import Counter
print("blocks:",len(blocks),dict(Counter(b['type'] for b in blocks)))
print("prologue paras:",len(prologue)," about+confluence moved:",len(about)+len(confluence))
