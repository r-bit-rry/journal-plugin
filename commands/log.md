---
allowed-tools:
  - Read
  - Write
  - Bash(ls:*)
  - Bash(node -e:*)
---

# Log Command

Create or update a daily journal entry with factual session notes.

## Arguments

- `--auto`: Run in non-interactive mode (for compaction-time workflows)

## Instructions

0. **Resolve journal directory:**
   - If the project is git-backed and the git-backed journal contains `manifest.md`, use the git-backed journal location (`.git/journal/` in standard checkouts; the git common dir `journal/` in linked worktrees)
   - Otherwise, if `journal/manifest.md` exists, use `journal/` as a legacy fallback and suggest `/journal-enable` migration
   - Otherwise, for plain directories, journal directory is `journal/`
   - Use this resolved path for ALL subsequent file operations

1. **Verify journal is enabled:**
   - Read `{journal-dir}/manifest.md` — if the file doesn't exist, inform user to run `/journal-enable` first and stop

2. **Get current date and time:**
   - Use your known current date (from system context `# currentDate`) for the date portion
   - Get the current time via node:
     ```bash
     node -e "const d=new Date(),p=n=>String(n).padStart(2,'0');console.log(p(d.getHours())+':'+p(d.getMinutes()))"
     ```
   - Combine into:
     - `FULL_DATE`: `DayOfWeek Month DD, YYYY HH:MM` (e.g. `Tuesday February 17, 2026 12:07`)
     - `FILE_DATE`: `YYYY-MM-DD` (e.g. `2026-02-17`) — derived entirely from system context

3. **Extract notes from the current conversation:**

   Analyze the conversation and extract:

   - **Summary**: One short factual line describing the main outcome — include the purpose/intent and all major components affected, not just the primary activity
   - **Facts**: Concrete actions, changes, measurements, outputs, decisions taken, files updated, tests run, sets/reps/weights, or schedule deviations
   - **User Notes**: User-stated preferences, constraints, goals, context, or quotes
   - Capture **each distinct user statement** as a separate note — do not merge or drop any
   - Use the user's near-exact wording; only rephrase minimally for grammar or clarity
   - **Decisions**: Explicit decisions made by the user or changes actually applied
   - **Open Questions**: Unresolved items, if any
   - **Supported Patterns** (optional, only if clearly evidenced):
     - Only include if the same fact pattern appears at least 3 times or the user explicitly confirms it
     - Multiple user statements expressing the same preference or theme (e.g., 3 instructions all reinforcing "keep it factual") count toward the 3-instance threshold
     - When a new supported pattern is discovered, the manifest **must** be updated in step 6 — do not skip
     - Phrase patterns conservatively as observations, not stories or causal claims

   Extraction guidance:
   - **User Notes completeness**: Every distinct user statement of preference, constraint, goal, or request must appear as a User Note — one per statement. Stay close to the user's original wording; do not heavily paraphrase. If a user request was also acted upon, keep it in User Notes; only add it to Decisions if the assistant made an independent choice about *how* to fulfill it.
   - **Decisions scoping**: Decisions capture choices that emerged or were resolved during the session, not restatements of what the user asked for. When multiple sub-actions serve a single intent, consolidate them into one overarching decision.

   Guardrails:
   - Default to note-taking, not interpretation
   - Do **not** invent lessons, motives, or causal explanations
   - If a conclusion is uncertain, omit it or label it as uncertain
   - Do **not** write agent opinions as if they were the user's conclusions
   - Keep the entry useful for later review, but grounded in what actually happened

4. **Write directly:**
   - Extract notes and write immediately (tool permissions handle user consent)
   - If `--auto` flag is present, add `[Auto-generated: context compact]` marker to entry

5. **Write to journal file:**
   - File path: `{journal-dir}/FILE_DATE.md` (e.g. `.git/journal/2026-02-14.md` or `journal/2026-02-14.md`)
   - If file exists, append new entry with `---` separator
   - If file doesn't exist, create with header

   Entry format:
   ```markdown
   ## Entry FULL_DATE
   [Auto-generated: context compact] <!-- only if --auto -->

   **Summary:** [single factual outcome]

   ### Facts
   - [items]

   ### User Notes
   - [items]

   ### Decisions
   - [items]

   ### Open Questions
   - [items]

   ### Supported Patterns
   - [items] <!-- only if clearly evidenced -->

   ---
   ```

   Rules for empty sections:
   - If there are no open questions, write `- None.`
   - If there are no supported patterns, omit the section entirely
   - If there are no explicit decisions, write `- None beyond logging the facts.`
   - When code changes, configuration changes, or implementation approaches are described in the conversation, record the implementation approach as a decision — only use the default when the session was purely informational or observational

6. **Update manifest patterns (only if changed):**
   - Read `{journal-dir}/manifest.md` and compare extracted patterns against existing ones
   - **Skip the manifest write entirely** if no new supported patterns were discovered
   - Before adding a pattern, check if a semantically equivalent one already exists — if so, update it (e.g. increment N count) instead of adding a duplicate
   - Only update "Last Updated" date when manifest content actually changes, using the `FULL_DATE` format
   - Perform a single write with all changes consolidated — never multiple sequential edits to the manifest
   - Only add patterns that are fact-supported and conservatively phrased
   - Add new good patterns to "### Good Patterns (Keep Doing)"
   - Add new anti-patterns to "### Anti-Patterns (Avoid)"
   - Update "Last Updated" date in manifest

7. **Confirm completion:**
   - Brief: "Logged." or "Logged. Added [N] new patterns."
   - No ceremony. Back to work.
