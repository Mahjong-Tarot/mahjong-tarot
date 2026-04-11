# Cowork Setup Guide — Dave & Yon

How to connect Claude Cowork to this project on your machine so the daily check-in skill works.

---

## One-time setup

**1. Clone the repo** (skip if already done)

```bash
git clone https://github.com/Mahjong-Tarot/mahjong-tarot.git ~/Documents/mahjong-tarot
```

**2. Open the project in Claude Cowork**

- Open Claude Cowork (desktop app or VS Code extension)
- Set the working directory to `~/Documents/mahjong-tarot`
- Cowork will pick up `CLAUDE.md` and all agent context automatically

**3. Pull before starting each day**

```bash
cd ~/Documents/mahjong-tarot && git pull origin main
```

---

## Daily check-in routine (2 minutes)

**1.** Open Claude Cowork with the project folder active

**2.** Type:
```
Help me write my check-in
```
or
```
I need to do my standup
```

**3.** Answer the questions — Claude will ask what you're working on and if you have any blockers

**4.** Once Claude confirms the file is saved, run:

```bash
cd ~/Documents/mahjong-tarot
git add standup/<your-name>.md
git commit -m "check-in: $(date +%Y-%m-%d)"
git push origin main
```

That's it. The PM agent picks up the file automatically and consolidates it into the monthly report.

---

## Notes

- You only ever touch `standup/<your-name>.md` — never the other person's file
- If you need to update your check-in later in the day, just run the skill again and push — it overwrites cleanly
- The PM agent handles the monthly report; you don't need to touch `reports/`
