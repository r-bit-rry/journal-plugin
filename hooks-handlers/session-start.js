#!/usr/bin/env node
const { resolveJournalDir, buildContextBlock } = require('../lib/journal-core');

try {
    const projectDir = process.env.CLAUDE_PROJECT_DIR || '.';
    const { journalDir } = resolveJournalDir(projectDir);
    if (!journalDir) { console.log('{}'); process.exit(0); }

    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: buildContextBlock(journalDir) } }));
} catch (e) {
    process.stderr.write(`journal-plugin session-start error: ${e.message}\n`);
    console.log('{}');
}
