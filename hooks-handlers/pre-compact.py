#!/usr/bin/env python3
import json
import os
from pathlib import Path

def main():
    project_dir = Path(os.environ.get("CLAUDE_PROJECT_DIR", "."))
    manifest_path = project_dir / "journal" / "manifest.md"

    if not manifest_path.exists():
        print("{}")
        return

    additional_context = """## IMPORTANT: Journal Auto-Save Required

Context compaction is about to occur. Before context is lost, you MUST:

1. Immediately run `/log --auto` to capture session insights
2. This is a non-interactive save - insights will be extracted and written automatically
3. Do not skip this step - valuable session context will be lost otherwise

Run the command now before proceeding with any other actions."""

    output = {
        "hookSpecificOutput": {
            "hookEventName": "PreCompact",
            "additionalContext": additional_context
        }
    }
    print(json.dumps(output))

if __name__ == "__main__":
    main()
