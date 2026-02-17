#!/usr/bin/env node
const { existsSync } = require('fs');
const { join } = require('path');

try {
    const manifestPath = join(process.env.CLAUDE_PROJECT_DIR || '.', 'journal', 'manifest.md');

    if (!existsSync(manifestPath)) { console.log('{}'); process.exit(0); }

    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreCompact', additionalContext:
`⚠ CONTEXT COMPACT IMMINENT — Run \`/log --auto\` NOW to save session insights before they are lost.` }}));
} catch (e) {
    process.stderr.write(`journal-plugin pre-compact error: ${e.message}\n`);
    console.log('{}');
}
