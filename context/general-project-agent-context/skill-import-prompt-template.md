# Skill Import Prompt Template

Use this prompt in Cowork whenever you need to import skills for an agent.
Replace `<agent-name>` and `<path>` with the actual values.

---

## Template

```
Read all SKILL.md files under `agents/<agent-name>/context/skills/` — one subfolder per skill.

For each skill found:
1. Read the SKILL.md content
2. Create a `.skill` file in the project root named after the skill folder
   (e.g. `daily-checkin.skill`) with the full SKILL.md content inside
3. Skip any skill that is already installed — note it as "already installed"

After creating all `.skill` files, tell me:
- How many new skills were found
- The name of each one
- Ask me to click "Save Skill" on each in the Cowork UI

Then wait for my confirmation before continuing.

Once I confirm, for each skill:
- Check that the skill is now installed (visible in the skills list)
- If confirmed installed: delete the `.skill` temp file
- If not yet installed: leave the file and flag it as pending

Do not delete any `.skill` file until the corresponding skill is verified as installed.
```

---

## Examples

| Agent | Replace `<agent-name>` with |
|---|---|
| Project Manager | `project manager` |
| Web Developer | `web-developer` |
| Any new agent | The folder name under `agents/` |

---

## When to use
- First time setting up an agent in Cowork on any machine
- After adding a new SKILL.md to an agent's skills folder
- After pulling changes that include new agent skills
