#!/usr/bin/env python3
"""
Port the authored Four Pillars narrative content into the shipped, cleaned JSON
the engine reads. Reads the raw extraction in ./data/ (produced by
etl_four_pillars.py) and emits keyed JSON into website/data/fp/.

The per-stage chi/fate narrative (LCPeriodRating) is validated to reproduce the
golden sample word-for-word against the Phase 2 chart engine
(see PHASE-1-FINDINGS.md).

Run from docs/features/four-pillars-report/:  python3 port_content.py
"""
import json
from pathlib import Path

SRC = Path("data")
OUT = Path("../../../website/data/fp")
OUT.mkdir(parents=True, exist_ok=True)

lc = json.load(open(SRC / "life-cycle.json"))
ea = json.load(open(SRC / "element-analysis.json"))
sa = json.load(open(SRC / "sign-analysis.json"))

def s(v):
    return None if v is None else str(v).strip()

def norm(v):
    return "" if v is None else str(v).strip().lower()

# --- LCPeriodRating: (period|hasHour|rating|elementId|force) -> {chi, fate} ---
period_rating = {}
for r in lc["LCPeriodRating"]["rows"]:
    period = norm(r.get("Period"))
    if period in ("", "null"):
        continue
    key = f'{period}|{r.get("hasHour")}|{r.get("Rating")}|{r.get("RulingElementID")}|{norm(r.get("Force"))}'
    period_rating[key] = {"chi": s(r.get("RatingDescription")), "fate": s(r.get("ForceDescription"))}

# --- LCChiDelta: (chiPrev|chiCurrent|hasHour) -> text ---
chi_delta = {}
for r in lc["LCChiDelta"]["rows"]:
    key = f'{r.get("ChiPrev")}|{r.get("ChiCurrent")}|{r.get("HasHour")}'
    chi_delta[key] = s(r.get("Description"))

# --- LCConclusion: (hasHour|mix) -> {desc1, desc2} ---
lc_conclusion = {}
for r in lc["LCConclusion"]["rows"]:
    key = f'{r.get("hasHour")}|{r.get("Mix")}'
    lc_conclusion[key] = {"desc1": s(r.get("Description1")), "desc2": s(r.get("Description2"))}

# --- LCSignEarlyMiddleLateYears: signId -> {early, middle, late} ---
sign_years = {}
for r in lc["LCSignEarlyMiddleLateYears"]["rows"]:
    sign_years[str(r.get("SignID"))] = {
        "early": s(r.get("EarlyYears")), "middle": s(r.get("MiddleYears")), "late": s(r.get("LateYears")),
    }

# --- EAElementMix: (hasHour|elementId|rating) -> text ---
element_mix = {}
for r in ea["EAElementMix"]["rows"]:
    key = f'{r.get("HasHour")}|{r.get("ElementID")}|{r.get("Rating")}'
    element_mix[key] = s(r.get("Description"))

# --- EAElementMixConclusion: (hasHour|mix) -> text ---
mix_conclusion = {}
for r in ea["EAElementMixConclusion"]["rows"]:
    key = f'{r.get("HasHour")}|{r.get("Mix")}'
    mix_conclusion[key] = s(r.get("Description"))

# --- EAElement: elementId -> details ---
element_detail = {}
for r in ea["EAElement"]["rows"]:
    element_detail[str(r.get("ElementID"))] = {
        "characteristics": s(r.get("Characteristics")), "approach": s(r.get("Approach")),
        "positive": s(r.get("PositiveTraits")), "negative": s(r.get("NegativeTraits")),
        "productive": s(r.get("ProductiveCycle")), "destructive": s(r.get("DestructiveCycle")),
    }

# --- EASign: signId -> {fixedElementId, fixedElementDescription} ---
ea_sign = {}
for r in ea["EASign"]["rows"]:
    ea_sign[str(r.get("SignID"))] = {
        "fixedElementId": r.get("FixedElementID"),
        "fixedElementDescription": s(r.get("FixedElementDescription")),
    }

# --- SASign: signId -> personality ---
sa_sign = {}
for r in sa["SASign"]["rows"]:
    sa_sign[str(r.get("signID"))] = {
        "defining": s(r.get("DefiningCharacteristics")), "decisionMaking": s(r.get("DecisionMaking")),
        "positive": s(r.get("PositiveTraits")), "negative": s(r.get("NegativeTraits")),
    }

# --- SAElementSign: (elementId|signId) -> personality ---
element_sign = {}
for r in sa["SAElementSign"]["rows"]:
    key = f'{r.get("ElementID")}|{r.get("SignID")}'
    element_sign[key] = s(r.get("DescriptionPersonality"))

files = {
    "lc-period-rating.json": period_rating,
    "lc-chi-delta.json": chi_delta,
    "lc-conclusion.json": lc_conclusion,
    "lc-sign-years.json": sign_years,
    "ea-element-mix.json": element_mix,
    "ea-mix-conclusion.json": mix_conclusion,
    "ea-element.json": element_detail,
    "ea-sign.json": ea_sign,
    "sa-sign.json": sa_sign,
    "sa-element-sign.json": element_sign,
}
manifest = {}
for name, obj in files.items():
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False))
    manifest[name] = len(obj)
print(json.dumps(manifest, indent=2))
print("wrote to", OUT.resolve())
