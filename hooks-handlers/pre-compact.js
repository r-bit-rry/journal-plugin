#!/usr/bin/env node
const { existsSync } = require('fs');
const { join } = require('path');

try {
    const manifestPath = join(process.env.CLAUDE_PROJECT_DIR || '.', 'journal', 'manifest.md');

    if (!existsSync(manifestPath)) { console.log('{}'); process.exit(0); }

    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreCompact', additionalContext:
`## IMPORTANT: Journal Auto-Save Required

Context compaction is about to occur. Before context is lost, you MUST:

1. Immediately run \`/log --auto\` to capture session insights
2. This is a non-interactive save - insights will be extracted and written automatically
3. Do not skip this step - valuable session context will be lost otherwise

Run the command now before proceeding with any other actions.` }}));
} catch (e) {
    process.stderr.write(`journal-plugin pre-compact error: ${e.message}\n`);
    console.log('{}');
}
