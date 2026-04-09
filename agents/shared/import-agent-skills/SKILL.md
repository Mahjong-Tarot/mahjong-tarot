# Skill: Import Agent Skills

## Purpose
Scan a given agent's `context/skills/` folder and install all skills into Cowork by creating `.skill` temp files for the user to confirm via the UI.

---

## Trigger
Use this skill when:
- A new agent is being set up in Cowork for the first time
- A new SKILL.md has been added to any agent's skills folder
- The user says "import skills for [agent name]"

---

## Input
The user provides either:
- An agent name (e.g. `project manager`, `web-developer`)
- Or a full skills path (e.g. `agents/project manager/context/skills/`)

If not provided, ask: **"Which agent's skills do you want to import?"**

---

## Steps

### 1. Discover skills
Read all `SKILL.md` files under `agents/<agent-name>/context/skills/`.

List what was found:
- Skill name (folder name)
- One-line description (first non-blank line after `# Skill:` in the file)

Ask the user to confirm before proceeding: **"Found N skills: [list]. Import all?"**

### 2. Create `.skill` temp files
For each skill:
- Read the full SKILL.md content
- Write it to `<skill-folder-name>.skill` in the project root
- Name must be lowercase, hyphenated (e.g. `daily-checkin.skill`, `raid-log.skill`)

After all files are written, tell the user:
> "**N `.skill` files created.** Click **Save Skill** on each one in the Cowork UI, then send any message to continue."

### 3. Wait for user confirmation
Do not proceed until the user sends a message confirming they have clicked Save Skill on each.

### 4. Verify and clean up
For each skill:
- Check whether the skill now appears in the installed skills list
- If installed → delete the `.skill` temp file
- If not installed → leave the file and flag it: "⚠ `<name>` not yet confirmed — file kept"

### 5. Summary
Report:
- Skills successfully installed (with names)
- Any still pending (with file names to retry)

---

## Notes
- Never delete a `.skill` temp file before verifying installation
- If a skill with the same name is already installed, skip creating the temp file and note it as "already installed"
- This skill works for any agent folder following the `agents/<name>/context/skills/<skill-name>/SKILL.md` convention
