import type { Plugin } from "@opencode-ai/plugin";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { basename, join } from "path";

// ── shared helpers ────────────────────────────────────────────────────────────
// NOTE: These helpers mirror lib/journal-core.js (CommonJS, used by Claude Code hooks).
// Keep both in sync when changing journal resolution or context-building logic.

const pad = (n: number) => String(n).padStart(2, "0");
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const formatDate = (d: Date, time = false) =>
    `${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${pad(d.getDate())}, ${d.getFullYear()}` +
    (time ? ` ${pad(d.getHours())}:${pad(d.getMinutes())}` : "");

function parseJournalDate(filename: string): Date | null {
    const m = filename.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isNaN(d.getTime()) ? null : d;
}

function resolveJournalDir(projectDir: string): string | null {
    const gitPath = join(projectDir, ".git");
    const isGitRepo = existsSync(gitPath) && statSync(gitPath).isDirectory();
    const gitJournalDir = join(gitPath, "journal");
    const plainJournalDir = join(projectDir, "journal");

    if (isGitRepo) {
        if (existsSync(join(gitJournalDir, "manifest.md"))) return gitJournalDir;
        if (existsSync(join(plainJournalDir, "manifest.md"))) {
            process.stderr.write("journal-plugin: found journal/ in project root — run /journal-enable to migrate to .git/journal/\n");
            return plainJournalDir;
        }
        return null;
    }
    return existsSync(join(plainJournalDir, "manifest.md")) ? plainJournalDir : null;
}

function hasManifest(projectDir: string): boolean {
    const gitPath = join(projectDir, ".git");
    const isGitRepo = existsSync(gitPath) && statSync(gitPath).isDirectory();
    return isGitRepo
        ? existsSync(join(gitPath, "journal", "manifest.md")) || existsSync(join(projectDir, "journal", "manifest.md"))
        : existsSync(join(projectDir, "journal", "manifest.md"));
}

function buildTemporalContext(journalFiles: string[]): string {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dated = journalFiles
        .map(f => ({ f, d: parseJournalDate(basename(f, ".md")) }))
        .filter((x): x is { f: string; d: Date } => x.d !== null)
        .sort((a, b) => b.d.getTime() - a.d.getTime());
    if (!dated.length) return "No previous journal entries found.";

    const lines = [`**Today:** ${formatDate(new Date(), true)}`];
    for (const { f, d } of dated.slice(0, 5)) {
        const delta = Math.round((today.getTime() - d.getTime()) / 86400000);
        const ago = delta === 0 ? "today" : delta === 1 ? "yesterday" : `${delta} days ago`;
        lines.push(`- **${formatDate(d)}** (${ago}): \`${basename(f)}\``);
    }
    const gap = Math.round((today.getTime() - dated[0].d.getTime()) / 86400000);
    if (gap > 1) lines.push(`\n⚠ **${gap} days since last session.** Note any recovery or detraining effects.`);
    return lines.join("\n");
}

function buildContextBlock(journalDir: string, maxBytes = 8000): string {
    const manifest = readFileSync(join(journalDir, "manifest.md"), "utf-8");
    const contextDepth = +(manifest.match(/context\s*depth[*:\s]*(\d+)/i)?.[1] ?? 3);

    const journalFiles = readdirSync(journalDir)
        .filter(f => f.endsWith(".md") && f !== "manifest.md").sort().reverse()
        .map(f => join(journalDir, f));

    let recentJournals = "";
    let bytesUsed = 0;

    for (const f of journalFiles.slice(0, contextDepth)) {
        try {
            const content = readFileSync(f, "utf-8");
            const entry = `\n\n---\n### ${basename(f, ".md")}\n${content}`;
            if (bytesUsed + entry.length > maxBytes) {
                const remaining = maxBytes - bytesUsed;
                if (remaining > 200) { recentJournals += entry.slice(0, remaining) + "\n\n[truncated — run /log to view full entry]"; }
                break;
            }
            recentJournals += entry;
            bytesUsed += entry.length;
        } catch (e: any) {
                process.stderr.write(`journal-plugin: could not read ${basename(f)}: ${e.message}\n`);
            }
    }

    const patternsMatch = manifest.match(/## Identified Patterns([\s\S]+?)(?=\n## |\s*$)/);
    const patterns = patternsMatch ? patternsMatch[1].trim() : "";

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

// ── plugin ────────────────────────────────────────────────────────────────────

export const JournalPlugin: Plugin = async ({ directory }) => {
    return {
        // session.created fires when OpenCode starts a new session.
        // We log the journal context to stderr so the operator can see it,
        // and emit a tui.prompt.append to surface the load confirmation to the user.
        // The actual journal content is injected via the journal-context skill
        // referenced in ~/.config/opencode/AGENTS.md.
        "session.created": async () => {
            const journalDir = resolveJournalDir(directory);
            if (!journalDir) return;
            try {
                const manifest = readFileSync(join(journalDir, "manifest.md"), "utf-8");
                const entries = readdirSync(journalDir).filter(f => f.endsWith(".md") && f !== "manifest.md");
                process.stderr.write(`journal-plugin: active — ${entries.length} entries in ${journalDir}\n`);
                const goalMatch = manifest.match(/\*\*Goal\*\*:\s*(.+)/);
                const goal = goalMatch ? goalMatch[1].trim() : "not set";
                process.stderr.write(`journal-plugin: project goal: ${goal}\n`);
            } catch (e: any) {
                process.stderr.write(`journal-plugin session.created error: ${e.message}\n`);
            }
        },

        // experimental.session.compacting fires before OpenCode compacts the session.
        // We inject the full journal context so it persists across compaction boundaries,
        // and add a reminder prompt to save insights — replacing both the Claude PreCompact
        // warning and providing richer continuity than Claude's hookSpecificOutput.
        "experimental.session.compacting": async (input, output) => {
            if (!hasManifest(directory)) return;
            try {
                const journalDir = resolveJournalDir(directory);
                const contextBlock = journalDir ? buildContextBlock(journalDir) : "";

                output.context.push(`## Journal Plugin — Compaction Context

⚠ CONTEXT COMPACTION IN PROGRESS — preserve all journal-relevant state below.

**CRITICAL**: Before this compaction completes, synthesize any insights from this session that have NOT yet been logged. These will be auto-appended when the user next runs \`/log\`.

${contextBlock}

## Session Insights to Preserve
Summarize any discoveries, decisions, patterns, or lessons from this session that should be captured in the next \`/log\` run. Format as bullet points under these headings:
- What Was Done
- What Went Well
- What Didn't Work
- Lessons Learned
- Patterns (if 3+ occurrences)
- Open Questions`);
            } catch (e: any) {
                process.stderr.write(`journal-plugin compaction error: ${e.message}\n`);
            }
        },
    };
};
