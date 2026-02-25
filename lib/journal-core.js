// Shared journal logic — used by Claude Code hooks (CommonJS).
// NOTE: opencode/plugins/journal-plugin.ts contains a TypeScript copy of these
// helpers for the OpenCode plugin (ESM/Bun). Keep both in sync.
'use strict';
const { readFileSync, readdirSync, existsSync, statSync } = require('fs');
const { join, basename } = require('path');

const pad = n => String(n).padStart(2, '0');
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const formatDate = (d, time = false) =>
    `${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${pad(d.getDate())}, ${d.getFullYear()}` +
    (time ? ` ${pad(d.getHours())}:${pad(d.getMinutes())}` : '');

function parseJournalDate(filename) {
    const m = filename.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isNaN(d.getTime()) ? null : d;
}

function resolveJournalDir(projectDir) {
    const gitPath = join(projectDir, '.git');
    const isGitRepo = existsSync(gitPath) && statSync(gitPath).isDirectory();
    const gitJournalDir = join(gitPath, 'journal');
    const plainJournalDir = join(projectDir, 'journal');

    if (isGitRepo) {
        if (existsSync(join(gitJournalDir, 'manifest.md'))) return { journalDir: gitJournalDir, isGitRepo };
        if (existsSync(join(plainJournalDir, 'manifest.md'))) {
            process.stderr.write('journal-plugin: found journal/ in project root — run /journal-enable to migrate to .git/journal/\n');
            return { journalDir: plainJournalDir, isGitRepo };
        }
        return { journalDir: null, isGitRepo };
    }
    if (existsSync(join(plainJournalDir, 'manifest.md'))) return { journalDir: plainJournalDir, isGitRepo: false };
    return { journalDir: null, isGitRepo: false };
}

function hasManifest(projectDir) {
    const gitPath = join(projectDir, '.git');
    const isGitRepo = existsSync(gitPath) && statSync(gitPath).isDirectory();
    return isGitRepo
        ? existsSync(join(gitPath, 'journal', 'manifest.md')) || existsSync(join(projectDir, 'journal', 'manifest.md'))
        : existsSync(join(projectDir, 'journal', 'manifest.md'));
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

function buildSessionContext(journalDir, maxBytes = 8000) {
    const manifest = readFileSync(join(journalDir, 'manifest.md'), 'utf-8');
    const contextDepth = +(manifest.match(/context\s*depth[*:\s]*(\d+)/i)?.[1] ?? 3);

    const journalFiles = readdirSync(journalDir)
        .filter(f => f.endsWith('.md') && f !== 'manifest.md').sort().reverse()
        .map(f => join(journalDir, f));

    let recentJournals = '';
    let bytesUsed = 0;

    for (const f of journalFiles.slice(0, contextDepth)) {
        try {
            const content = readFileSync(f, 'utf-8');
            const entry = `\n\n---\n### ${basename(f, '.md')}\n${content}`;
            if (bytesUsed + entry.length > maxBytes) {
                const remaining = maxBytes - bytesUsed;
                if (remaining > 200) {
                    recentJournals += entry.slice(0, remaining) + '\n\n[truncated — run /log to view full entry]';
                    bytesUsed += remaining;
                }
                break;
            }
            recentJournals += entry;
            bytesUsed += entry.length;
        } catch (e) {
            process.stderr.write(`journal-plugin: could not read ${basename(f)}: ${e.message}\n`);
        }
    }

    const patternsMatch = manifest.includes('## Identified Patterns') && manifest.match(/## Identified Patterns([\s\S]+?)(?=\n## |\s*$)/);
    const patterns = patternsMatch ? patternsMatch[1].trim() : '';

    return { manifest, journalFiles, recentJournals, bytesUsed, patterns, contextDepth };
}

function buildContextBlock(journalDir) {
    const { manifest, journalFiles, recentJournals, bytesUsed, patterns } = buildSessionContext(journalDir);
    process.stderr.write(`journal-plugin: loaded ${bytesUsed} bytes of journal context\n`);
    return `## Journal Plugin Active

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
${patterns}`;
}

module.exports = { resolveJournalDir, hasManifest, buildTemporalContext, buildSessionContext, buildContextBlock, formatDate, parseJournalDate };
