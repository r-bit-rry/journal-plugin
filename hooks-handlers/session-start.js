#!/usr/bin/env node
const { readFileSync, readdirSync, existsSync } = require('fs');
const { join, basename } = require('path');

const pad = n => String(n).padStart(2, '0');
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const formatDate = (d, time = false) =>
    `${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${pad(d.getDate())}` +
    (time ? `, ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}` : '');

function parseJournalDate(filename) {
    const m = filename.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isNaN(d.getTime()) ? null : d;
}

function buildTemporalContext(journalFiles) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dated = journalFiles
        .map(f => ({ f, d: parseJournalDate(basename(f, '.md')) }))
        .filter(x => x.d)
        .sort((a, b) => b.d - a.d);
    if (!dated.length) return 'No previous journal entries found.';

    const lines = [`**Today:** ${formatDate(new Date(), true)}`];
    for (const { f, d } of dated.slice(0, 5)) {
        const delta = Math.round((today - d) / 86400000);
        const ago = delta === 0 ? 'today' : delta === 1 ? 'yesterday' : `${delta} days ago`;
        lines.push(`- **${formatDate(d)}** (${ago}): \`${basename(f)}\``);
    }
    const gap = Math.round((today - dated[0].d) / 86400000);
    if (gap > 1) lines.push(`\n⚠ **${gap} days since last session.** Note any recovery or detraining effects.`);
    return lines.join('\n');
}

try {
    const projectDir = process.env.CLAUDE_PROJECT_DIR || '.';
    const manifestPath = join(projectDir, 'journal', 'manifest.md');

    if (!existsSync(manifestPath)) { console.log('{}'); process.exit(0); }

    const manifest = readFileSync(manifestPath, 'utf-8');
    const contextDepth = +(manifest.match(/Context Depth\**:\s*(\d+)/)?.[1] ?? 3);

    const journalDir = join(projectDir, 'journal');
    const journalFiles = existsSync(journalDir)
        ? readdirSync(journalDir).filter(f => f.endsWith('.md') && f !== 'manifest.md').sort().reverse().map(f => join(journalDir, f))
        : [];

    let recentJournals = '';
    for (const f of journalFiles.slice(0, contextDepth)) {
        try { recentJournals += `\n\n---\n### ${basename(f, '.md')}\n${readFileSync(f, 'utf-8')}`; }
        catch (e) { process.stderr.write(`journal-plugin: could not read ${basename(f)}: ${e.message}\n`); }
    }

    const patternsMatch = manifest.includes('## Identified Patterns') && manifest.match(/## Identified Patterns([\s\S]+?)(?=\n## |\s*$)/);
    const patterns = patternsMatch ? patternsMatch[1].trim() : '';

    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext:
`## Journal Plugin Active

### Temporal Context
${buildTemporalContext(journalFiles)}

### Project Manifest
${manifest}

### Recent Journal Entries
${recentJournals}

### Behavioral Guidelines
- Watch for recurring themes, successes, and failures during this session
- Only flag patterns after 3+ occurrences — avoid noise, surface real patterns
- When quoting user guidance, use their exact words
- When significant insights emerge, remind user to run \`/log\` to capture them
- Reference past patterns when making decisions or suggestions

### Known Patterns
${patterns}` }}));
} catch (e) {
    process.stderr.write(`journal-plugin session-start error: ${e.message}\n`);
    console.log('{}');
}
