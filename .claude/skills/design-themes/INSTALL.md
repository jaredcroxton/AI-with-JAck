# Installing the `design-themes` skill

This skill lets you say things like *"build a dashboard in the TrendHustler
style"* and have Claude Code apply a saved website design theme.

There are two ways to install it. Pick based on where you want to use it.

---

## Option A — Use it in EVERY project (recommended for "future use")

Copy the skill into your **personal** Claude Code skills folder. It then works
in any project on your machine, no matter what repo you're in.

**macOS / Linux:**
```bash
mkdir -p ~/.claude/skills
cp -r /path/to/AI-with-JAck/.claude/skills/design-themes ~/.claude/skills/
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force "$HOME\.claude\skills"
Copy-Item -Recurse "C:\path\to\AI-with-JAck\.claude\skills\design-themes" "$HOME\.claude\skills\"
```

Replace the path with wherever you cloned this repo. Done — restart Claude Code
and the skill is available everywhere.

> To update later (e.g. after adding new themes), just re-run the copy command;
> it overwrites the old copy.

---

## Option B — Use it only in THIS project

Do nothing. The skill already lives at `.claude/skills/design-themes/` in this
repo, so it's active whenever you run Claude Code inside the `AI-with-JAck`
project. It travels with the repo (it's committed to git).

---

## How to use it (either option)

- **List themes:** *"List my design themes"* / *"What styles do I have saved?"*
- **Apply a theme:** *"Build a pricing page in the Cyber-Grunge Developer style"*
- **Add a new theme:** *"Add a design theme from this URL: …"*

Tip: include the word **style / theme / design** plus the **theme name**
(Trending AI Topics · Glitch Cat Club · TrendHustler · Cyber-Grunge Developer)
and Claude Code will pick up the skill automatically.

## Previewing a theme
Open any theme's `demo.html` in a browser:
`themes/<theme-name>/demo.html`. Themes that use Google Fonts look best with an
internet connection.
