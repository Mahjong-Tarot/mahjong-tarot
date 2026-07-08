#!/usr/bin/env python3
"""
ETL — Four Pillars (Life Cycle) authored source -> JSON.

Reads Bill's authored workbooks from
  docs/architecture/readings/Four Pillars Rewrite/
and emits one JSON file per sheet into ./data/. This is the seed for the
proprietary Four Pillars engine (website/lib/fp/) — the SAME pattern used
for Purple Star (docs/features/purple-star-report/etl_*.py).

Run from docs/features/four-pillars-report/:  python3 etl_four_pillars.py
"""
import json, sys
from pathlib import Path
import openpyxl

SRC = Path("../../architecture/readings/Four Pillars Rewrite")
OUT = Path("data")
OUT.mkdir(exist_ok=True)

WORKBOOKS = {
    "element-analysis": "Element AnalysisRevised.xlsx",
    "sign-analysis":    "Sign Analysis.xlsx",
    "life-cycle":       "Life Cycle.xlsx",
}

def clean(v):
    if v is None:
        return None
    if hasattr(v, "isoformat"):
        return v.isoformat()
    if isinstance(v, str):
        return v.strip()
    return v

manifest = {}
for key, fn in WORKBOOKS.items():
    path = SRC / fn
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    book = {}
    for ws in wb.worksheets:
        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            book[ws.title] = {"headers": [], "rows": []}
            continue
        headers = [clean(h) for h in rows[0]]
        data = []
        for r in rows[1:]:
            if all(c is None for c in r):
                continue
            data.append({headers[i]: clean(r[i]) for i in range(len(headers)) if headers[i] is not None})
        book[ws.title] = {"headers": [h for h in headers if h is not None], "rows": data}
    outfile = OUT / f"{key}.json"
    outfile.write_text(json.dumps(book, ensure_ascii=False, indent=1))
    manifest[key] = {sheet: len(v["rows"]) for sheet, v in book.items()}
    wb.close()

(OUT / "_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
print(json.dumps(manifest, indent=2))
