---
description: Synthesize old journal entries, deduplicate patterns, and archive stale content
---

# Journal Review Command

Synthesize old journal entries, deduplicate manifest patterns, and archive stale content.

## Instructions

0. **Resolve journal directory:**
   - Check if `.git/` exists and is a directory (not a file)
   - If yes: journal directory is `.git/journal/`
   - If no: journal directory is `journal/`
   - Use this resolved path for ALL subsequent file operations

1. **Verify journal is enabled:**
   - Read `{journal-dir}/manifest.md` — if missing, inform user to run `/journal-enable` first and stop

2. **List all journal entries:**
   - List files in `{journal-dir}/` matching `YYYY-MM-DD.md` pattern (exclude `manifest.md`)
   - Sort by date, newest first
   - If fewer than 3 date-named entries exist, inform user: "Not enough entries to review yet (need at least 3)." and stop

3. **Identify entries to synthesize:**
   - Entries older than 7 days from today are candidates
   - If zero entries qualify, inform user: "No entries older than 7 days. Nothing to archive." and stop
   - Keep the 7 most recent days untouched regardless of count

4. **Read and synthesize candidate entries:**
   - Read all candidate entries
   - Extract and consolidate:
     - **Key Outcomes**: Major accomplishments across all entries
     - **Recurring Themes**: Topics that appeared in 2+ entries
     - **Consolidated Lessons**: Deduplicated lessons learned
     - **Pattern Evolution**: How patterns emerged, changed, or were reinforced

5. **Write synthesis file:**
   - Create `{journal-dir}/archive/` directory if it doesn't exist:
     ```bash
     mkdir -p {journal-dir}/archive
     ```
   - File path: `{journal-dir}/archive/synthesis-YYYY-MM-DD.md` (today's date)
   - Format:
     ```markdown
     # Journal Synthesis — FIRST_DATE to LAST_DATE

     Covers N entries.

     ## Key Outcomes
     - [items]

     ## Recurring Themes
     - [items]

     ## Consolidated Lessons
     - [items]

     ## Pattern Evolution
     - [items]
     ```

6. **Archive original entries:**
   - Move each synthesized entry to `{journal-dir}/archive/`:
     ```bash
     mv {journal-dir}/YYYY-MM-DD.md {journal-dir}/archive/YYYY-MM-DD.md
     ```
   - Do NOT move entries from the last 7 days
   - Do NOT move `manifest.md`

7. **Deduplicate manifest patterns:**
   - Read `{journal-dir}/manifest.md`
   - In both "Good Patterns (Keep Doing)" and "Anti-Patterns (Avoid)" sections:
     - Merge semantically equivalent patterns into one line
     - If merging, note frequency (e.g., "Use early returns for validation (seen 4x)")
     - If more than 15 total patterns exist, prune the least recently reinforced ones down to 15
   - Update "Last Updated" date
   - Write the updated manifest in a single write operation

8. **Report:**
   - Brief: "Reviewed. [N] entries synthesized -> `{journal-dir}/archive/synthesis-YYYY-MM-DD.md`. [M] entries archived. [K] patterns deduplicated."
