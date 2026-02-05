---
allowed-tools:
  - Read
  - Write
  - Bash(ls:*)
  - Bash(date:*)
---

# Log Command

Create or update a daily journal entry capturing session insights.

## Arguments

- `--auto`: Run in non-interactive mode (used by PreCompact hook)

## Instructions

1. **Verify journal is enabled:**
   - Check if `journal/manifest.md` exists
   - If not, inform user to run `/journal-enable` first and stop

2. **Get current date and time:**
   ```bash
   date +%Y-%m-%d
   date +%H:%M
   ```

3. **Extract insights from the current conversation:**

   Analyze the conversation and extract:

   - **What Was Done**: Key tasks, changes, or actions completed
   - **What Went Well**: Successful approaches, smooth implementations
   - **What Didn't Work**: Failed attempts, obstacles encountered, workarounds needed
   - **Lessons Learned**: New knowledge gained, insights about the codebase or tools
   - **Patterns Discovered**:
     - Good patterns: Approaches that worked well and should be repeated
     - Anti-patterns: Approaches that failed or caused problems
   - **User Guidance Captured**: Preferences, conventions, or instructions the user provided
   - **Open Questions**: Unresolved issues, things to investigate later

4. **Interactive vs Auto mode:**

   **If `--auto` flag is present:**
   - Skip user confirmation
   - Write insights directly to journal
   - Add `[Auto-generated: context compact]` marker to entry

   **If interactive (default):**
   - Present extracted insights to the user in a readable format
   - Ask if they want to confirm, edit, or add anything
   - Incorporate any user feedback before writing

5. **Write to journal file:**
   - File path: `journal/YYYY-MM-DD.md` (using current date)
   - If file exists, append new entry with `---` separator
   - If file doesn't exist, create with header

   Entry format:
   ```markdown
   ## Entry at HH:MM
   [Auto-generated: context compact] <!-- only if --auto -->

   ### What Was Done
   - [items]

   ### What Went Well
   - [items]

   ### What Didn't Work
   - [items]

   ### Lessons Learned
   - [items]

   ### Patterns
   **Good patterns:**
   - [items]

   **Anti-patterns:**
   - [items]

   ### User Guidance Captured
   - [items]

   ### Open Questions
   - [items]

   ---
   ```

6. **Update manifest patterns:**
   - If new patterns were identified, update the "Identified Patterns" section in `journal/manifest.md`
   - Add new good patterns to "### Good Patterns (Keep Doing)"
   - Add new anti-patterns to "### Anti-Patterns (Avoid)"
   - Update "Last Updated" date in manifest

7. **Confirm completion:**
   - Tell user the journal entry was saved
   - Mention any new patterns added to manifest
