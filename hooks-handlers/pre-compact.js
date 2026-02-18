#!/usr/bin/env node
const { existsSync, statSync } = require('fs');
const { join } = require('path');

try {
    const projectDir = process.env.CLAUDE_PROJECT_DIR || '.';
    const gitPath = join(projectDir, '.git');
    const isGitRepo = existsSync(gitPath) && statSync(gitPath).isDirectory();
    const hasManifest = isGitRepo
        ? existsSync(join(gitPath, 'journal', 'manifest.md')) || existsSync(join(projectDir, 'journal', 'manifest.md'))
        : existsSync(join(projectDir, 'journal', 'manifest.md'));

    if (!hasManifest) { console.log('{}'); process.exit(0); }

    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreCompact', additionalContext:
`⚠ CONTEXT COMPACT IMMINENT — Run \`/log --auto\` NOW to save session insights before they are lost.` }}));
} catch (e) {
    process.stderr.write(`journal-plugin pre-compact error: ${e.message}\n`);
    console.log('{}');
}
