#!/usr/bin/env python3
# Generate the 1200x630 social share image for the Mahjong Mirror book page.
# Brand: white paper, near-black ink #14161B, brand red #E63329 / deep red #9E1B14.
import os
from PIL import Image, ImageDraw, ImageFont

HERE=os.path.dirname(os.path.abspath(__file__))
OUT=f"{HERE}/og-image.png"

W,H=1200,630
PAPER=(255,255,255); INK=(20,22,27); SOFT=(80,84,94)
RED=(230,51,41); RED_DEEP=(158,27,20); RED_50=(255,244,242); RULE=(228,229,234); GHOST=(201,204,212)

img=Image.new("RGB",(W,H),PAPER)
d=ImageDraw.Draw(img)

def font(candidates,size):
    for p in candidates:
        if os.path.exists(p):
            try: return ImageFont.truetype(p,size)
            except Exception: pass
    return ImageFont.load_default()

SERIF=["/System/Library/Fonts/Supplemental/Georgia.ttf","/System/Library/Fonts/Supplemental/Times New Roman.ttf"]
SERIF_IT=["/System/Library/Fonts/Supplemental/Georgia Italic.ttf","/System/Library/Fonts/Supplemental/Times New Roman Italic.ttf"]
SANS=["/System/Library/Fonts/Supplemental/Arial.ttf","/System/Library/Fonts/Helvetica.ttc"]

f_kick=font(SANS,22); f_title=font(SERIF,92); f_sub=font(SERIF_IT,32)
f_auth=font(SANS,24); f_role=font(SANS,17)

def tracked(draw,xy,text,fnt,fill,tracking):
    x,y=xy
    for ch in text:
        draw.text((x,y),ch,font=fnt,fill=fill)
        x+=draw.textlength(ch,font=fnt)+tracking
    return x

# ---- left text block ----
LX=84
tracked(d,(LX,96),"MAHJONGTAROT.COM",f_kick,RED,8)
d.text((LX,140),"The Mahjong",font=f_title,fill=INK)
d.text((LX,240),"Mirror",font=f_title,fill=INK)
d.text((LX,368),"Your Path to Wiser Decisions",font=f_sub,fill=SOFT)
d.rectangle([LX,438,LX+64,441],fill=RED)
d.text((LX,468),"By Bill Hajdu",font=f_auth,fill=INK)
tracked(d,(LX,506),"MAHJONG TAROT READER & CHINESE ASTROLOGER",f_role,SOFT,3)

# ---- right compass spread ----
CW,CH=62,92; GAP=13
cx,cy=930,315          # centre of the centre card
def card(x,y,style):
    box=[x,y,x+CW,y+CH]
    if style=="ghost":
        d.rounded_rectangle(box,radius=8,outline=GHOST,width=2)
    elif style=="centre":
        d.rounded_rectangle(box,radius=8,fill=RED_50,outline=RED,width=4)

def arm(cx0,cy0,dx,dy):
    for k in (1,2,3):
        card(cx0-CW//2+dx*k,cy0-CH//2+dy*k,"ghost")

step_x=CW+GAP; step_y=CH+GAP
# horizontal arms (3 each side)
for k in (1,2,3):
    card(cx-CW//2-step_x*k, cy-CH//2,"ghost")
    card(cx-CW//2+step_x*k, cy-CH//2,"ghost")
# vertical arms
card(cx-CW//2, cy-CH//2-step_y,"ghost")
card(cx-CW//2, cy-CH//2+step_y,"ghost")
card(cx-CW//2-step_x, cy-CH//2-step_y,"ghost")
card(cx-CW//2+step_x, cy-CH//2-step_y,"ghost")
card(cx-CW//2-step_x, cy-CH//2+step_y,"ghost")
card(cx-CW//2+step_x, cy-CH//2+step_y,"ghost")
card(cx-CW//2, cy-CH//2,"centre")

# ---- flame glyph in centre (sampled quadratic beziers of the book glyph) ----
segs=[((26,20),(33,28),(29,36)),((29,36),(28,39),(23,41)),((23,41),(29,40),(34,44)),
      ((34,44),(40,49),(36,57)),((36,57),(45,51),(42,41)),((42,41),(49,45),(47,53)),
      ((47,53),(53,44),(45,34)),((45,34),(36,23),(21,20))]
pts=[]
for (p0,p1,p2) in segs:
    for i in range(16):
        t=i/15
        x=(1-t)**2*p0[0]+2*(1-t)*t*p1[0]+t**2*p2[0]
        y=(1-t)**2*p0[1]+2*(1-t)*t*p1[1]+t**2*p2[1]
        pts.append((x,y))
sc=CW/52.0
poly=[(cx-CW//2+px*sc, cy-CH//2+py*sc) for (px,py) in pts]
d.polygon(poly,fill=RED)

# hairline frame
d.rectangle([24,24,W-24,H-24],outline=RULE,width=2)

img.save(OUT)
print("wrote",OUT,img.size)
