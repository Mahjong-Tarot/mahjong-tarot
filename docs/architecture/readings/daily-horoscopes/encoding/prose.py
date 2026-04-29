"""
Prose layer: turn a signal payload into a horoscope in The Mahjong Tarot voice.

Uses the Anthropic API with prompt caching. The system prompt + few-shot examples are cached
across calls, so each per-call cost is just the signal payload + the output.

Usage:
    # one horoscope (sign-specific)
    python3 prose.py 2026-02-17 Tiger general

    # day-level horoscope (no sign)
    python3 prose.py 2026-02-17 - general

    # one full day (1 day-level + 12 signs) x 3 categories = 39 horoscopes
    python3 prose.py 2026-02-17 ALL ALL

    # date range
    python3 prose.py 2026-02-15 2026-02-21 ALL ALL

Requires:
    pip install anthropic
    export ANTHROPIC_API_KEY=sk-...
"""
from __future__ import annotations
import json
import os
import re
import sys
from datetime import date, timedelta
from pathlib import Path

from signals import get_signals, render_signal_brief, SIGNS, CATEGORIES

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
OUT = ROOT / "out"

MODEL = "claude-sonnet-4-6"


SYSTEM_PROMPT = """You are writing a daily horoscope for The Mahjong Tarot, in the voice of Bill Hajdu.

CORE VOICE:
- 2nd person ("you"), conversational, warm, lifestyle-oriented
- Reads like a friend giving you a vibe-check, not a horoscope app
- Bill is NOT a strict determinist. Outcomes are odds, never verdicts. The user always has agency.
- Aim for ~55 words for sign-specific horoscopes, ~70 for day-level. Range 45-90.
- Concrete, sensory specifics over abstractions. Name an activity ("hike a new trail", "buy a kite", "send the email"), not a vague feeling.

PROBABILISTIC FRAMING (mandatory):
- Frame outcomes as odds. Use phrases like "60/40", "the wind's at your back", "uphill but not bad", "headwinds today", "tailwind for X", "the numbers favor".
- Low scores ARE NEVER "bad" or "avoid." They are "uphill," "headwinds," "different game," "smart play wins, big play loses."
- Don't be literal with percentages every time. Vary it. Some days say "60/40," some say "the wind is with you," some say "uphill," some just frame the strategy without numbers.
- The score from the payload is your guide:
    >=80  auspicious   "wind at your back," "70/30 in your favor," "tailwind"
    60-79 favorable    "60/40 with you," "favored move," "things lean your way"
    40-59 neutral      "even odds," "could go either way," "your call"
    20-39 cautionary   "uphill," "30/70 against the obvious moves," "headwinds"
    <20   challenging  "25/75 today," "the day asks you to play differently"

NO EM DASHES (CRITICAL):
- NEVER use the em dash character (—) or en dash (–). Use periods, commas, parentheses, semicolons, or rewrite the sentence.
- Hyphens (-) are fine when joining words ("low-key", "high-stakes").

CATEGORY-SPECIFIC ANGLE:
- general: the day's overall energy and what to do with it. Pulls from Action, Mental, Home/Family, Health, Travel, Leisure.
- love:    romance, friendships, social warmth, family bonds. Pulls from Love, Friendship, Social/Style. Distinguish romance vs platonic vs family love when the payload supports it.
- money:   financial decisions, career moves, work output. Pulls from Financial, Job. Acknowledge that money calls today might be different from money calls tomorrow.

HOW TO USE THE PAYLOAD:
- `tone` and `score` set the affect.
- `matrix_keywords` (focus domains) are the prose seeds. Transmute them into natural advice, don't quote them verbatim.
- `voice` (likes / dislikes / traits) shapes word choice for sign-specific horoscopes.
- `match_day` and `user_sign_relations` flag a loaded day. Lean in subtly, don't announce.
- `house` is framing. Use lightly.
- `western_moment` is OPTIONAL. Only weave it in if it adds something. Most days won't.
- For DAY-LEVEL horoscopes (no user_sign): synthesize what the day's energy means generally, across all signs. Mention which signs have headwinds vs tailwinds when it lands naturally.

WHAT NOT TO DO:
- Do not say "Fire Horse year", "auspicious day", "your zodiac sign", or other overt astrology vocabulary.
- Do not announce match days or relations. Show, don't tell.
- Do not use "—" anywhere. Ever.
- Do not be preachy or moralistic. Stay in lifestyle suggestions.
- Do not mention the user's sign by name in every horoscope. Aim for ~1 in 6.

OUTPUT FORMAT:
- Just the horoscope text. No headers, no labels, no quotation marks, no "Today's horoscope:".
- 1 to 3 short paragraphs OR continuous prose.
"""


def _few_shots():
    examples = json.loads((DATA / "few_shot_examples.json").read_text())
    msgs = []
    for ex in examples:
        msgs.append({
            "role": "user",
            "content": f"```\n{render_signal_brief(ex['signal_payload'])}\n```",
        })
        msgs.append({"role": "assistant", "content": ex["horoscope"]})
    msgs[-1] = {
        "role": "assistant",
        "content": [{
            "type": "text",
            "text": examples[-1]["horoscope"],
            "cache_control": {"type": "ephemeral"},
        }],
    }
    return msgs


def _validate(text):
    """Reject any output containing an em dash or en dash."""
    if "—" in text or "–" in text:
        raise ValueError(f"em/en dash found in output: {text[:100]}...")
    return text


def generate_one(client, payload):
    user_msg = {
        "role": "user",
        "content": f"```\n{render_signal_brief(payload)}\n```",
    }
    resp = client.messages.create(
        model=MODEL,
        max_tokens=400,
        system=[{
            "type": "text",
            "text": SYSTEM_PROMPT,
            "cache_control": {"type": "ephemeral"},
        }],
        messages=_few_shots() + [user_msg],
    )
    text = resp.content[0].text.strip()
    return _validate(text)


def main():
    try:
        import anthropic
    except ImportError:
        print("Install the SDK first:  pip install anthropic")
        sys.exit(1)
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("Set ANTHROPIC_API_KEY in your environment.")
        sys.exit(1)
    client = anthropic.Anthropic()

    args = sys.argv[1:]
    if len(args) < 2:
        print("usage:")
        print("  python3 prose.py <date> <sign|-|ALL> [<category|ALL>]")
        print("  python3 prose.py <start_date> <end_date> ALL ALL")
        sys.exit(2)

    OUT.mkdir(exist_ok=True)
    log_path = OUT / "horoscopes.jsonl"

    # Date range mode: prose.py START END ALL ALL
    if len(args) >= 3 and re.match(r"\d{4}-\d{2}-\d{2}", args[1]):
        start = date.fromisoformat(args[0])
        end = date.fromisoformat(args[1])
        signs = SIGNS + [None] if args[2].upper() == "ALL" else [args[2]]
        cats = list(CATEGORIES) if (len(args) >= 4 and args[3].upper() == "ALL") else ["general"]
    else:
        start = end = date.fromisoformat(args[0])
        signs_arg = args[1]
        if signs_arg.upper() == "ALL":
            signs = SIGNS + [None]
        elif signs_arg == "-":
            signs = [None]
        else:
            signs = [signs_arg]
        cats = list(CATEGORIES) if (len(args) >= 3 and args[2].upper() == "ALL") else (
            [args[2]] if len(args) >= 3 else ["general"]
        )

    d = start
    written = 0
    while d <= end:
        for sign in signs:
            for cat in cats:
                payload = get_signals(d, sign, cat)
                text = generate_one(client, payload)
                out = {
                    "date": str(d),
                    "scope": sign or "general",
                    "category": cat,
                    "text": text,
                    "signal": payload,
                }
                with log_path.open("a") as f:
                    f.write(json.dumps(out) + "\n")
                label = sign or "DAY"
                print(f"  {d} {label:8} {cat:7}  ({len(text.split())}w)")
                written += 1
        d += timedelta(days=1)
    print(f"\nWrote {written} horoscopes to {log_path}")


if __name__ == "__main__":
    main()
