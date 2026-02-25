#!/usr/bin/env node
const { hasManifest } = require('../lib/journal-core');

try {
    const projectDir = process.env.CLAUDE_PROJECT_DIR || '.';
    if (!hasManifest(projectDir)) { console.log('{}'); process.exit(0); }

    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreCompact', additionalContext:
        `⚠ CONTEXT COMPACT IMMINENT — Run \`/log --auto\` NOW to save session insights before they are lost.` } }));
} catch (e) {
    process.stderr.write(`journal-plugin pre-compact error: ${e.message}\n`);
    console.log('{}');
}
