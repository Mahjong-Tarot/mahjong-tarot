#!/usr/bin/env python3
# Derive clean line-art versions of the real deck cards (dodge-sketch method),
# for single-card figures in the book. Output: book/cards-lineart/<name>.webp
import os
from PIL import Image, ImageOps, ImageFilter
import numpy as np

HERE=os.path.dirname(os.path.abspath(__file__))
SRC=os.path.join(HERE, "..", "website", "public", "images", "cards")
OUT=os.path.join(HERE, "cards-lineart")
os.makedirs(OUT, exist_ok=True)

PAPER=(255,255,255); INK=(20,22,27)

# real card files needed for the appendix single-card figures
CARDS=["mushroom","green-dragon","red-dragon","white-dragon","south","phoenix",
       "pearl","north","fire","knot","willow","ducks","peach","earth"]

def lineart(im):
    g=im.convert("L")
    inv=ImageOps.invert(g).filter(ImageFilter.GaussianBlur(5))
    a=np.asarray(g).astype(float); b=np.asarray(inv).astype(float)
    dodge=np.clip(a*255.0/(255.0-b+1.0),0,255).astype("uint8")
    s=ImageOps.autocontrast(Image.fromarray(dodge),cutoff=1)
    arr=np.asarray(s).astype(float)/255.0
    t=np.clip((0.86-arr)/0.16,0,1)               # ink amount
    out=np.zeros((*arr.shape,3),dtype="uint8")
    for c in range(3):
        out[...,c]=(PAPER[c]+(INK[c]-PAPER[c])*t).astype("uint8")
    return Image.fromarray(out,"RGB")

done=[]
for name in CARDS:
    p=os.path.join(SRC, f"{name}.webp")
    if not os.path.exists(p):
        print("MISSING", name); continue
    im=Image.open(p).convert("RGB")
    im.thumbnail((360,480))
    lineart(im).save(os.path.join(OUT, f"{name}.webp"), quality=88, method=6)
    done.append(name)
print("wrote", len(done), "line-art cards ->", OUT)
