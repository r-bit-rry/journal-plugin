# Journal Plugin for Claude Code

Session logging and pattern tracking for Claude Code. Captures insights, tracks patterns, and maintains continuity across development sessions.

## Features

- **Session Logging**: Capture what was done, what worked, what didn't, and lessons learned
- **Pattern Tracking**: Identify and persist good patterns and anti-patterns across sessions
- **Context Continuity**: Automatically load past journal entries for session context
- **Auto-Save on Compact**: Automatically saves session insights before context compaction

## Installation

### From GitHub (recommended)

```bash
claude plugin install github:r-bit-rry/journal-plugin
```

### Local Installation

Install directly from a local directory:

```bash
# From the plugin directory
claude /plugin install .

# Or from anywhere using absolute path
claude /plugin install /path/to/journal-plugin
```

### Via Marketplace

```bash
# Add local marketplace first
claude plugin marketplace add /path/to/journal-plugin

# Then install by name
claude plugin install journal-plugin
```

### Manual Installation

Add to your Claude Code settings:

```bash
claude settings add plugins "file:///path/to/journal-plugin"
```

## Usage

### Enable Journal Tracking

Run the enable command to initialize journaling for your project:

```
/journal-enable
```

This will guide you through a setup wizard to configure:
- Project goal and success metrics
- Reminder cadence for logging
- Interaction style preferences
- Context depth (how many past journals to load)
- Pattern categories to watch

### Log Session Insights

Capture insights from your current session:

```
/log
```

This extracts and saves:
- What was done
- What went well / didn't work
- Lessons learned
- Patterns discovered
- User guidance captured
- Open questions

### Auto-Logging

The plugin automatically prompts to save insights before context compaction to prevent losing valuable session information.

## File Structure

After enabling, your project will have:

```
your-project/
├── journal/
│   ├── manifest.md      # Project config and identified patterns
│   ├── 2025-02-05.md    # Daily journal entries
│   └── ...
└── CLAUDE.md            # Updated with journal reference
```

## How It Works

1. **SessionStart Hook**: Loads manifest and recent journals into context
2. **During Session**: Claude watches for patterns and reminds you to log
3. **On /log**: Extracts insights from conversation, saves to daily journal
4. **PreCompact Hook**: Triggers auto-save before context is lost

## Configuration Options

### Reminder Cadence
- Every major milestone
- Time-based (e.g., every 30 minutes)
- Only on request
- When patterns emerge

### Interaction Style
- Concise bullets
- Detailed narrative
- Structured sections
- Mixed (adapts to content)

### Context Depth
- 3 journals (minimal)
- 7 journals (recommended)
- 14 journals (extensive)
- All journals

## License

MIT
