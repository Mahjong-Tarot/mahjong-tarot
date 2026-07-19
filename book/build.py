#!/usr/bin/env python3
# Build book.html from manuscript.txt for "The Mahjong Mirror".
# Stages: parse -> clean text -> restructure front matter -> emit HTML.
import re, html, json

import os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC  = f"{HERE}/manuscript.txt"
OUT  = f"{HERE}/book.html"

# ----------------------------------------------------------------------------
# 1. PARSE  (indentation-driven paragraph assembly)
# ----------------------------------------------------------------------------
raw = open(SRC, encoding="utf-8").read()
lines = [l for l in raw.split("\n") if not re.fullmatch(r"\s*\d{1,3}\s*", l)]
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

def leading(l): return len(l) - len(l.lstrip(" "))

def looks_subhead(s):
    if not s or len(s) > 70: return False
    if s[-1] in ".!?,:;\"”’)": return False
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
        t=re.sub(r"(\w)-\s+(\w)", r"\1\2", t)      # join soft-hyphenated line breaks
        t=re.sub(r"\s{2,}"," ",t).strip()
        if t: blocks.append({"type":"para","text":t})
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
        flush(); blocks.append({"type":"angle","text":re.sub(r"\s+"," ",title)}); last_struct="angle"; i=j; prev_blank=False; continue
    if RE_CHAPTER.match(l):
        title=s; j=i+1
        while j<n and blines[j].strip() and blines[j].strip()[0] not in "\"“":
            title+=" "+blines[j].strip(); j+=1
        flush(); blocks.append({"type":"chapter","text":re.sub(r"\s+"," ",title)}); last_struct="chapter"; i=j; prev_blank=False; continue
    if RE_APPENDIX.match(l):
        flush(); blocks.append({"type":"chapter","text":s,"appendix":True}); last_struct="chapter"; i+=1; prev_blank=False; continue
    if RE_NAMED.match(l):
        flush(); blocks.append({"type":"chapter","text":s,"named":True}); last_struct="chapter"; i+=1; prev_blank=False; continue
    if RE_CARDGROUP.match(l):
        flush(); blocks.append({"type":"cardgroup","text":s}); last_struct="cardgroup"; i+=1; prev_blank=False; continue
    if prev_blank and s[0] in "\"“":
        q=[s]; j=i+1
        while j<n and blines[j].strip(): q.append(blines[j].strip()); j+=1
        flush(); blocks.append({"type":"epigraph","text":re.sub(r"\s+"," "," ".join(q))}); last_struct="epigraph"; i=j; prev_blank=False; continue
    if prev_blank and nxt=="" and looks_subhead(s):
        flush(); blocks.append({"type":"subhead","text":s}); last_struct="subhead"; i+=1; prev_blank=False; continue
    # ordinary body line -> indentation decides paragraph boundary
    if ind>=2 and para:      # indented => new paragraph
        flush()
    para.append(l); i+=1; prev_blank=False
flush()

# ----------------------------------------------------------------------------
# 2. CLEAN TEXT  (em dashes, spaced-hyphen dashes, age line)
# ----------------------------------------------------------------------------
def dedash(t):
    t=t.replace("—", ", ")                    # em dash -> comma
    t=re.sub(r"\s+-\s+", ", ", t)                  # spaced hyphen used as a dash -> comma
    t=re.sub(r"\s+,\s+", ", ", t)
    t=re.sub(r",\s*,", ",", t)
    t=re.sub(r",\s*([.;:!?])", r"\1", t)
    t=re.sub(r"\s+([.,;:!?])", r"\1", t)
    t=re.sub(r"\s{2,}"," ",t)
    return t.strip()

AGE_RE=re.compile(r",?\s*at seventy-seven,?", re.I)
for b in blocks:
    if b["type"] in ("para","epigraph"):
        if b["type"]=="para" and AGE_RE.search(b["text"]):
            b["text"]=AGE_RE.sub(", in the latter stages of my life,", b["text"])
        b["text"]=dedash(b["text"])
    if b["type"] in ("chapter","subhead","angle","part","cardgroup"):
        # keep angle/subhead dashes as a colon-free clean form
        b["text"]=b["text"].replace("—",": ").strip()
        b["text"]=re.sub(r"\s+-\s+",": ",b["text"]) if b["type"] in ("angle",) else b["text"]

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
    back+= [b for b in about if b["type"]!="chapter"]
    back+= confluence

blocks = front + blocks + back

open(f"{HERE}/blocks.json","w").write(json.dumps(blocks,ensure_ascii=False,indent=1))
from collections import Counter
print("blocks:",len(blocks),dict(Counter(b['type'] for b in blocks)))
print("prologue paras:",len(prologue)," about+confluence moved:",len(about)+len(confluence))
