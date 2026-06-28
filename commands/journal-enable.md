---
allowed-tools:
  - Read
  - Write
  - Bash(mkdir:*)
  - Bash(ls:*)
  - Bash(mv:*)
  - Bash(rmdir:*)
  - AskUserQuestion
---

# Journal Enable Command

## Execution Path Labels

This skill has four mutually exclusive execution paths (referred to as **mode**):
- **wizard_setup** — no existing manifest, or user chose to reconfigure; runs the interactive wizard (steps 2-7)
- **legacy_migration** — step 1b conditions met and user accepts migration; stops after migration confirmation
- **legacy_keep_existing** — step 1b conditions met but user declines migration; keeps existing `journal/` location, no wizard or file writes (all write actions are `skip`), stops immediately
- **reconfigure** — manifest already exists and user chose to reconfigure; re-runs wizard

Each path has a **terminal step** (stop_after):
- `confirmation` — wizard_setup and reconfigure paths (step 7)
- `migration_complete` — legacy_migration path (step 1b, migration accepted)
- `legacy_kept` — legacy_keep_existing path (step 1b, migration declined)
- `reconfigure_declined` — user declines reconfiguration at step 1

**Migration decision values:** `not_applicable` when step 1b conditions are not met (non-git repo, no legacy manifest, or git-backed manifest already exists); `accept` or `decline` when the migration prompt is reached.

**gitignore_entry** is always `journal/` — the managed entry name, independent of whether it was actually written.

Initialize journal tracking for this project.

## Instructions

0. **Detect environment:**
   - If the project is git-backed, use the repo's git-backed journal location (`.git/journal/` in standard checkouts; the git common dir `journal/` in linked worktrees)
   - If the project is not git-backed, journal directory is `journal/`
   - Store this decision for all subsequent steps
   - The **mode** for a fresh setup (no existing manifest, no legacy migration) is `wizard_setup`

1. First, check if `{journal-dir}/manifest.md` already exists:
   - If it exists, warn the user that journal is already enabled and ask if they want to reconfigure

1b. **Check for legacy location (git repos only):**
    - If this is a git repo AND `journal/manifest.md` exists AND the git-backed journal manifest does NOT exist:
      - Inform user: "Found journal data in `journal/` (legacy location). The git-backed journal location persists across branch switches and linked worktrees."
      - Ask: "Migrate existing journal data to the git-backed journal location?"
      - If yes:
        - Create the git-backed journal directory
        - Move all files from `journal/` to the git-backed journal directory
        - If `journal/archive/` exists, move it too
        - Remove the now-empty `journal/` directory
        - Remove the `journal/` line from `.gitignore` if present
        - Confirm: "Migration complete. Journal data now lives in the git-backed journal location."
        - Stop (config is preserved, no need to re-run wizard)
      - If no: this is the **legacy_keep_existing** path (stop_after: `legacy_kept`). Resolve journal dir to `journal/`. The assistant_reply must be **only** the short confirmation: "Migration skipped. Keeping existing journal data in `journal/`." — do **not** include the informational text about the legacy location or git-backed benefits in the reply. **Stop** — do not run the wizard, do not write any files (manifest_md is empty, claude_md_action and gitignore_action are both `skip`)

2. Run an interactive wizard asking the user:

   **Question 1 - Project Goal:**
   Ask: "What is the main goal of this project?"
   (Free text input)

   **Question 2 - Success Metrics:**
   Ask: "How will you measure success for this project?"
   (Free text input)

   **Question 3 - Reminder Cadence:**
   Ask: "When should I remind you to log session notes?"
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

4. Create `{journal-dir}/manifest.md` with this structure, filling in wizard responses:

   ```markdown
   # Journal Manifest

   ## Project Overview
   **Goal**: {project_goal}
   **Created**: {TODAY_DATE}
   **Last Updated**: {TODAY_DATE}

   ## Configuration
   - **Reminder Cadence**: {reminder_cadence}
   - **Interaction Style**: {interaction_style}
   - **Context Depth**: {context_depth}

   ## Success Metrics
   {success_metrics}

   ## Domain-Specific Sections
   {domain_sections}

   ## Pattern Categories
   {pattern_categories}

   ## Identified Patterns

   ### Good Patterns (Keep Doing)
   <!-- Patterns are added here by /log command -->

   ### Anti-Patterns (Avoid)
   <!-- Anti-patterns are added here by /log command -->

   ## Change History
   | Date | Change | Reason |
   |------|--------|--------|
   | {TODAY_DATE} | Initial setup | Journal enabled |
   ```

5. **Handle gitignore (only if using `journal/` in a git repo):**
   - If journal directory is git-backed: **skip this step entirely** (inherently untracked)
   - If journal directory is `journal/` AND `.gitignore` exists: append `journal/` if not already present
   - If journal directory is `journal/` AND no `.gitignore`: do nothing

6. Check if `CLAUDE.md` exists in project root:
   - If exists, read its contents first — only append the journal section if no `Journal Plugin` section already exists
   - If not exists, create it with the journal reference

   Add this section:
   ```markdown
   ## Journal Plugin
   This project uses journal-plugin for session logging. Run `/log` to capture factual session notes.
   ```

7. Confirm to user that journal has been enabled and explain:
   - If git-backed: "Journal entries stored in the repo's git-backed journal location (`.git/journal/` in standard checkouts). Run `/log` to capture factual session notes."
   - If plain directory: "Journal entries stored in `journal/`. Run `/log` to capture factual session notes."
   - Context from past journals will be loaded on session start by the Claude hooks
