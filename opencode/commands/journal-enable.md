---
description: Initialize journal tracking for this project
---

# Journal Enable Command

Initialize journal tracking for this project.

## Instructions

0. **Detect environment:**
   - Check if `.git/` exists and is a directory (not a file)
   - If yes: this is a **git repo** — journal directory is `.git/journal/`
   - If no: this is a **plain directory** — journal directory is `journal/`
   - Store this decision for all subsequent steps

1. First, check if `{journal-dir}/manifest.md` already exists:
   - If it exists, warn the user that journal is already enabled and ask if they want to reconfigure

1b. **Check for legacy location (git repos only):**
    - If this is a git repo AND `journal/manifest.md` exists AND `.git/journal/manifest.md` does NOT exist:
      - Inform user: "Found journal data in `journal/` (legacy location). The new location `.git/journal/` persists across branch switches."
      - Ask: "Migrate existing journal data to `.git/journal/`?"
      - If yes:
        - Create `.git/journal/` directory
        - Move all files from `journal/` to `.git/journal/`
        - If `journal/archive/` exists, move it too
        - Remove the now-empty `journal/` directory
        - Remove the `journal/` line from `.gitignore` if present
        - Confirm: "Migration complete. Journal data now in `.git/journal/`."
        - Stop (config is preserved, no need to re-run wizard)
      - If no: continue using `journal/` location

2. Run an interactive wizard asking the user:

   **Question 1 - Project Goal:**
   Ask: "What is the main goal of this project?"
   (Free text input)

   **Question 2 - Success Metrics:**
   Ask: "How will you measure success for this project?"
   (Free text input)

   **Question 3 - Reminder Cadence:**
   Ask: "When should I remind you to log insights?"
   Options:
   - Every major milestone
   - Time-based (suggest every 30 minutes of active work)
   - Only when I ask
   - When patterns emerge

   **Question 4 - Interaction Style:**
   Ask: "How should journal entries be formatted?"
   Options:
   - Concise bullets
   - Detailed narrative
   - Structured sections
   - Mixed (adapt to content)

   **Question 5 - Context Depth:**
   Ask: "How many past journal entries should be loaded for context?"
   Options:
   - 3 journals (recommended)
   - 7 journals (extended)
   - 14 journals (extensive)

   **Question 6 - Domain Sections:**
   Ask: "Any domain-specific areas to track? (e.g., API changes, performance metrics, security considerations)"
   (Free text input, can be empty)

   **Question 7 - Pattern Categories:**
   Ask: "What pattern categories should I watch for?"
   Options (multi-select):
   - Code patterns
   - Workflow patterns
   - Common mistakes to avoid
   - Successful approaches
   - User preferences

3. Create the journal directory:
   ```bash
   mkdir -p {journal-dir}
   ```

4. Create `{journal-dir}/manifest.md` using the template from `templates/manifest-template.md`, filling in user responses

5. **Handle gitignore (only if using `journal/` in a git repo):**
   - If journal directory is `.git/journal/`: **skip this step entirely** (inherently untracked)
   - If journal directory is `journal/` AND `.gitignore` exists: append `journal/` if not already present
   - If journal directory is `journal/` AND no `.gitignore`: do nothing

6. Check if `AGENTS.md` exists in project root (fall back to `CLAUDE.md` if present):
   - If `AGENTS.md` exists, read its contents first — only append the journal section if no `Journal Plugin` section already exists
   - If `CLAUDE.md` exists (no `AGENTS.md`), read and append to it instead
   - If neither exists, create `AGENTS.md` with the journal reference

   Add this section:
   ```markdown
   ## Journal Plugin
   This project uses journal-plugin for session logging. Run `/log` to capture insights.
   ```

7. Confirm to user that journal has been enabled and explain:
   - If git repo: "Journal entries stored in `.git/journal/` — persists across branch switches. Run `/log` to capture insights."
   - If plain directory: "Journal entries stored in `journal/`. Run `/log` to capture insights."
   - Context from past journals will be loaded on session start via the journal-context skill
