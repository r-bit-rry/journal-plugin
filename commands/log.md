---
allowed-tools:
  - Read
  - Write
  - Bash(ls:*)
  - Bash(node -e:*)
---

# Log Command

Create or update a daily journal entry capturing session insights.

## Arguments

- `--auto`: Run in non-interactive mode (used by PreCompact hook)

## Instructions

1. **Verify journal is enabled:**
   - Read `journal/manifest.md` — if the file doesn't exist, inform user to run `/journal-enable` first and stop

2. **Get current date and time:**
   - Use your known current date (from system context `# currentDate`) for the date portion
   - Get the current time via node:
     ```bash
     node -e "const d=new Date(),p=n=>String(n).padStart(2,'0');console.log(p(d.getHours())+':'+p(d.getMinutes()))"
     ```
   - Combine into:
     - `FULL_DATE`: `DayOfWeek Month DD, YYYY HH:MM` (e.g. `Tuesday February 17, 2026 12:07`)
     - `FILE_DATE`: `YYYY-MM-DD` (e.g. `2026-02-17`) — derived entirely from system context

3. **Extract insights from the current conversation:**

   Analyze the conversation and extract:

   - **Session Highlight**: The single most significant outcome (PR merged, bug fixed, feature shipped, test suite passing). One line, auto-extracted from tool outputs and conversation.
   - **What Was Done**: Key tasks, changes, or actions completed
   - **What Went Well**: Successful approaches, smooth implementations
   - **What Didn't Work**: Failed attempts, obstacles encountered, workarounds needed
   - **Lessons Learned**: New knowledge gained, insights about the codebase or tools
   - **Patterns Discovered** (only add if seen 3+ times in recent sessions):
     - Good patterns: Approaches that worked well and should be repeated
     - Anti-patterns: Approaches that failed or caused problems
   - **User Guidance Captured**: Quote user preferences/instructions exactly as they said them
   - **Open Questions**: Unresolved issues, things to investigate later

4. **Write directly:**
   - Extract insights and write immediately (tool permissions handle user consent)
   - If `--auto` flag is present, add `[Auto-generated: context compact]` marker to entry

5. **Write to journal file:**
   - File path: `journal/FILE_DATE.md` (e.g. `journal/2026-02-14.md`)
   - If file exists, append new entry with `---` separator
   - If file doesn't exist, create with header

   Entry format:
   ```markdown
   ## Entry FULL_DATE
   [Auto-generated: context compact] <!-- only if --auto -->

   **Highlight:** [single most significant outcome]

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

   ### User Guidance
   > '[exact user quote]' — [context]

   ### Open Questions
   - [items]

   ---
   ```

6. **Update manifest patterns (only if changed):**
   - Read `journal/manifest.md` and compare extracted patterns against existing ones
   - **Skip the manifest write entirely** if no new patterns were discovered
   - Before adding a pattern, check if a semantically equivalent one already exists — if so, update it (e.g. increment N count) instead of adding a duplicate
   - Only update "Last Updated" date when manifest content actually changes, using the `FULL_DATE` format
   - Perform a single write with all changes consolidated — never multiple sequential edits to the manifest
   - Add new good patterns to "### Good Patterns (Keep Doing)"
   - Add new anti-patterns to "### Anti-Patterns (Avoid)"
   - Update "Last Updated" date in manifest

7. **Confirm completion:**
   - Brief: "Logged." or "Logged. Added [N] new patterns."
   - No ceremony. Back to work.
