---
allowed-tools:
  - Read
  - Write
  - Bash(mkdir:*)
  - Bash(ls:*)
  - AskUserQuestion
---

# Journal Enable Command

Initialize journal tracking for this project.

## Instructions

1. First, check if `journal/manifest.md` already exists in the project:
   - If it exists, warn the user that journal is already enabled and ask if they want to reconfigure

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
   - 3 journals (minimal)
   - 7 journals (recommended)
   - 14 journals (extensive)
   - All journals

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
   mkdir -p journal
   ```

4. Create `journal/manifest.md` using the template from `templates/manifest-template.md`, filling in user responses

5. Check if `CLAUDE.md` exists in project root:
   - If exists, append the journal reference section (if not already present)
   - If not exists, create it with the journal reference

   Add this section:
   ```markdown
   ## Journal Plugin
   This project uses journal-plugin for session logging. Run `/log` to capture insights.
   ```

6. Confirm to user that journal has been enabled and explain:
   - Journal entries will be stored in `journal/` directory
   - Run `/log` to capture session insights
   - Context from past journals will be loaded on session start
