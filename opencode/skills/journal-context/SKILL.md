---
name: journal-context
description: Load project journal context — manifest, recent entries, and identified patterns — to restore continuity from past sessions
---

## What I do

I load the project's journal data into context so you have continuity from past sessions:

1. **Resolve journal directory** — check for `.git/journal/` (git repos) or `journal/` (plain dirs)
2. **Read manifest.md** — project goal, configuration, success metrics, and identified patterns
3. **Read recent entries** — the N most recent daily journal files (N = context depth in manifest, default 3)
4. **Build temporal context** — show how many days ago each entry was, flag gaps > 1 day
5. **Surface known patterns** — good patterns and anti-patterns to guide this session

## When to use me

Load me at the start of every session to restore working context. The global AGENTS.md instructs you to do this automatically.

Also load me after a `/log` run to refresh your in-context knowledge of the updated manifest.

## How to use me

After loading this skill, execute the following steps using your available tools:

### Step 1 — Resolve journal directory

```bash
ls .git/journal/manifest.md 2>/dev/null && echo GIT || ls journal/manifest.md 2>/dev/null && echo PLAIN || echo NONE
```

- If `GIT`: journal directory is `.git/journal/`
- If `PLAIN`: journal directory is `journal/`
- If `NONE`: journal not enabled — inform user to run `/journal-enable` and stop

### Step 2 — Read the manifest

Read `{journal-dir}/manifest.md` in full. Extract:
- Project goal
- Context depth (default 3 if not set)
- All identified patterns (good and anti-patterns)

### Step 3 — Read recent journal entries

List files in `{journal-dir}/` matching `YYYY-MM-DD.md`, sort newest-first, read the top N (context depth).

For each entry, note:
- Date and how many days ago it was
- Session highlight
- Key lessons and patterns

### Step 4 — Synthesize temporal context

Compute today's date and compare it to the most recent entry:
- If gap > 1 day: note recovery context may be needed
- List the 5 most recent entries with dates and relative times

### Step 5 — Report what you loaded

Output a brief summary:
```
Journal loaded: X entries, last session Y days ago.
Project: [goal from manifest]
Active patterns: [count] good, [count] anti-patterns
```

Then continue with the user's request, applying pattern knowledge throughout the session.

## Behavioral guidelines (apply for the rest of the session)

- Watch for recurring themes, successes, and failures
- Only flag patterns after 3+ occurrences — avoid noise
- When quoting user guidance, use their exact words
- Remind user to run `/log` when significant insights emerge
- Reference past patterns when making decisions or suggestions
