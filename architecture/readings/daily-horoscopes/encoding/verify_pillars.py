"""
Verify the pillar calculator against every row of SignMatches.xls 'Elements' sheet
(2010-05-01 through 2012-12-31). Adds 2010-2012 lunar calendar entries on demand.
"""
import json
import sys
from datetime import date
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parent
SRC = ROOT.parent
SIGN_MATCHES = Path("/Users/davepro/Downloads/SignMatches.xls")

# Load lunar calendar; ensure 2010-2012 are present (they're needed for verification only)
LUNAR_PATH = ROOT / "data" / "lunar_calendar.json"
lc = json.loads(LUNAR_PATH.read_text())

ADD_2010_2012 = {
    "2009": {  # needed because 2010-01-01..2010-02-13 falls in Chinese year 2009 (Yi Chou / Earth Ox)
        "new_year": "2009-01-26", "stem_branch": "Ji Chou", "element_sign": "Earth Ox",
        "leap_month": 5,
        "month_starts": {
            "1": "2009-01-26", "2": "2009-02-25", "3": "2009-03-27", "4": "2009-04-25",
            "5": "2009-05-24", "leap_5": "2009-06-23", "6": "2009-07-22", "7": "2009-08-20",
            "8": "2009-09-19", "9": "2009-10-18", "10": "2009-11-17", "11": "2009-12-16",
            "12": "2010-01-15"
        },
    },
    "2010": {
        "new_year": "2010-02-14", "stem_branch": "Geng Yin", "element_sign": "Metal Tiger",
        "leap_month": None,
        "month_starts": {
            "1": "2010-02-14", "2": "2010-03-16", "3": "2010-04-14", "4": "2010-05-14",
            "5": "2010-06-12", "6": "2010-07-12", "7": "2010-08-10", "8": "2010-09-08",
            "9": "2010-10-08", "10": "2010-11-06", "11": "2010-12-06", "12": "2011-01-04"
        },
    },
    "2011": {
        "new_year": "2011-02-03", "stem_branch": "Xin Mao", "element_sign": "Metal Rabbit",
        "leap_month": None,
        "month_starts": {
            "1": "2011-02-03", "2": "2011-03-05", "3": "2011-04-03", "4": "2011-05-03",
            "5": "2011-06-02", "6": "2011-07-01", "7": "2011-07-31", "8": "2011-08-29",
            "9": "2011-09-27", "10": "2011-10-27", "11": "2011-11-25", "12": "2011-12-25"
        },
    },
    "2012": {
        "new_year": "2012-01-23", "stem_branch": "Ren Chen", "element_sign": "Water Dragon",
        "leap_month": 4,
        "month_starts": {
            "1": "2012-01-23", "2": "2012-02-22", "3": "2012-03-22", "4": "2012-04-21",
            "leap_4": "2012-05-21", "5": "2012-06-19", "6": "2012-07-19", "7": "2012-08-17",
            "8": "2012-09-16", "9": "2012-10-15", "10": "2012-11-14", "11": "2012-12-13",
            "12": "2013-01-11"
        },
    },
}

for k, v in ADD_2010_2012.items():
    lc["years"].setdefault(k, v)
LUNAR_PATH.write_text(json.dumps(lc, indent=2))

# Now import the pillar calculator (must come AFTER lunar table extension)
sys.path.insert(0, str(ROOT))
from pillars import pillars_for  # noqa


def main():
    df = pd.read_excel(SIGN_MATCHES, sheet_name="Elements", header=0)
    df.columns = [str(c).strip() for c in df.columns]
    df["Date_parsed"] = pd.to_datetime(df["Date"].astype(str).str.rstrip("/").str.strip())
    df = df.sort_values("Date_parsed").reset_index(drop=True)

    fails = {"year": [], "month": [], "day": []}
    counts = {"year": 0, "month": 0, "day": 0}

    for _, row in df.iterrows():
        d = row["Date_parsed"].date()
        p = pillars_for(d)
        for pillar in ("year", "month", "day"):
            exp_e = str(row[f"{pillar.capitalize()}Element"]).strip()
            exp_s = str(row[f"{pillar.capitalize()}Sign"]).strip()
            got_e = p[pillar]["element"]
            got_s = p[pillar]["sign"]
            counts[pillar] += 1
            if (exp_e, exp_s) != (got_e, got_s):
                fails[pillar].append((d, exp_e, exp_s, got_e, got_s))

    print(f"Tested {len(df)} dates from {df['Date_parsed'].min().date()} to {df['Date_parsed'].max().date()}")
    print()
    for pillar in ("year", "month", "day"):
        n_ok = counts[pillar] - len(fails[pillar])
        print(f"{pillar.upper():>5}: {n_ok}/{counts[pillar]} match  ({len(fails[pillar])} mismatches)")
        for d, ee, es, ge, gs in fails[pillar][:8]:
            print(f"        {d}  expected {ee} {es:8}  got {ge} {gs}")
        if len(fails[pillar]) > 8:
            print(f"        ... +{len(fails[pillar]) - 8} more")


if __name__ == "__main__":
    main()
