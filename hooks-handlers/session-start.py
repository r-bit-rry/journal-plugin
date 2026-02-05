#!/usr/bin/env python3
import json
import os
import re
from pathlib import Path

def main():
    project_dir = Path(os.environ.get("CLAUDE_PROJECT_DIR", "."))
    manifest_path = project_dir / "journal" / "manifest.md"

    if not manifest_path.exists():
        print("{}")
        return

    manifest_content = manifest_path.read_text(encoding="utf-8")

    context_match = re.search(r"\*\*Context Depth\*\*:\s*(\d+)", manifest_content)
    context_depth = int(context_match.group(1)) if context_match else 7

    journal_dir = project_dir / "journal"
    recent_journals = ""
    if journal_dir.is_dir():
        journal_files = sorted(
            [f for f in journal_dir.glob("*.md") if f.name != "manifest.md"],
            key=lambda f: f.stat().st_mtime,
            reverse=True
        )[:context_depth]
        for f in journal_files:
            recent_journals += f"\n\n---\n### {f.stem}\n{f.read_text(encoding='utf-8')}"

    patterns = ""
    if "## Identified Patterns" in manifest_content:
        match = re.search(r"## Identified Patterns(.+?)## Change History", manifest_content, re.DOTALL)
        if match:
            patterns = match.group(1).strip()

    additional_context = f"""## Journal Plugin Active

### Project Manifest
{manifest_content}

### Recent Journal Entries
{recent_journals}

### Behavioral Guidelines
- Watch for recurring themes, successes, and failures during this session
- Detect patterns in user preferences, successful approaches, and anti-patterns
- When significant insights emerge, remind user to run `/log` to capture them
- Reference past patterns when making decisions or suggestions

### Known Patterns
{patterns}"""

    output = {
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": additional_context
        }
    }
    print(json.dumps(output))

if __name__ == "__main__":
    main()
