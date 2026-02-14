# Linear Concierge CLI

A TypeScript CLI tool that generates intelligent daily briefs of your Linear issues. Perfect for tracking support-driven issues that you subscribe to manually.

## Features

- Fetches issues you're subscribed to via Linear's GraphQL API
- Categorizes issues using smart heuristics:
  - Stale (no updates in N days)
  - Not moving (no activity in N days)
  - Confusion signals (keyword patterns and question marks)
  - In progress (healthy state)
  - Closed recently (last 14 days)
- Calculates severity scores for intelligent prioritization
- Generates clean Markdown output for Obsidian or any markdown viewer
- Configurable thresholds via CLI arguments
- Single markdown file, overwritten on each run

## Installation

1. Clone or navigate to this repository:
   ```bash
   cd /users/anand/Playground/linear-concierge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Linear API key:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your Linear API key:
   ```
   LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
   ```

5. Build the project:
   ```bash
   npm run build
   ```

6. Make the executable:
   ```bash
   chmod +x dist/index.js
   ```

## Getting Your Linear API Key

1. Go to [Linear Settings → API](https://linear.app/settings/api)
2. Click "Create new Personal API Key"
3. Give it a name (e.g., "Linear Concierge")
4. Copy the key and add it to your `.env` file

## Usage

### Basic Command

```bash
linear-concierge --out "<path to output file>"
```

### Full Command with Options

```bash
linear-concierge \
  --out "/Users/anand/Documents/Obsidian Vault/Linear Concierge Today.md" \
  --daysStale 2 \
  --daysNoMove 4 \
  --maxIssues 50
```

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--out <path>` | Output path for markdown file | **Required** |
| `--daysStale <number>` | Days since update to consider issue stale | `2` |
| `--daysNoMove <number>` | Days since activity to consider not moving | `4` |
| `--maxIssues <number>` | Maximum number of issues to fetch | `50` |

### Development Mode

Run without building:

```bash
npm run dev -- --out "/Users/anand/Documents/Obsidian Vault/Linear Concierge Today.md"
```

### Production Mode

After building:

```bash
npm start -- --out "/Users/anand/Documents/Obsidian Vault/Linear Concierge Today.md"
```

Or run directly:

```bash
./dist/index.js --out "/Users/anand/Documents/Obsidian Vault/Linear Concierge Today.md"
```

### Install Globally (Optional)

```bash
npm link
```

Then run from anywhere:

```bash
linear-concierge --out "/path/to/output.md"
```

## Classification Logic

### Issue Categories

**Stale**
- NOT closed AND days since `updatedAt` >= `daysStale` (default: 2 days)

**Not Moving**
- NOT closed AND (days since `updatedAt` >= `daysNoMove` OR days since last comment >= `daysNoMove`)
- Default threshold: 4 days

**Confusion / Churn Signals**
- NOT closed AND either:
  - Confusion keyword hits >= 2 in last 20 comments
  - Question marks >= 3 in last 20 comments
- Keywords: "confused", "unclear", "not sure", "stuck", "blocked", "why", "clarify", "understand", "confusing", "reproduce", "repro", "waiting", etc.

**Needs Attention**
- Has any of: stale, not-moving, or confusion flags

**In Progress (Healthy)**
- State type is "started" AND no negative flags

**Closed Recently**
- State type is "completed" or "canceled" AND updated within last 14 days

### Severity Scoring

Issues are scored for sorting the "Needs Attention" section:

- **Priority weight**: 10-40 points (inverted: urgent = higher score)
- **Age weight**: 10-20 points (older = higher)
- **Confusion**: +25 points
- **Not moving**: +15 points
- **Stale**: +10 points
- **Assigned but not moving**: +10 bonus points

Higher severity = more urgent, appears first in "Needs attention now" section.

## Output Structure

The generated markdown file includes:

```markdown
# Linear Concierge — Today

**Generated at:** [timestamp]

---

## Summary
- Total subscribed issues: X
- Open: Y
- Needs attention: Z
- Closed recently (last 14d): W

---

## Needs attention now (N)
[Issues sorted by severity score]

## Not moving / stale (N)
### Not moving
[Issues not moving]

### Stale
[Stale issues]

## Internal confusion / churn signals (N)
[Issues with confusion signals]

## In progress (healthy) (N)
[Healthy in-progress issues]

## Closed recently (N)
[Recently closed issues]
```

Each issue includes:
- Identifier + title (linked to Linear)
- State name and type
- Assignee
- Priority
- Updated time (relative + days ago)
- Last comment time
- Age since creation
- Labels
- Flags/reasons for classification

## Scheduling Daily Runs

### Using cron (macOS/Linux)

Edit your crontab:

```bash
crontab -e
```

Add a line to run daily at 9 AM:

```bash
0 9 * * * cd /users/anand/Playground/linear-concierge && npm start -- --out "/Users/anand/Documents/Obsidian Vault/Linear Concierge Today.md" >> /tmp/linear-concierge.log 2>&1
```

### Using launchd (macOS)

Create a plist file at `~/Library/LaunchAgents/com.linear-concierge.daily.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.linear-concierge.daily</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/users/anand/Playground/linear-concierge/dist/index.js</string>
        <string>--out</string>
        <string>/Users/anand/Documents/Obsidian Vault/Linear Concierge Today.md</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/linear-concierge.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/linear-concierge.error.log</string>
</dict>
</plist>
```

Load it:

```bash
launchctl load ~/Library/LaunchAgents/com.linear-concierge.daily.plist
```

## Architecture

```
linear-concierge/
├── src/
│   ├── cli/          # CLI command setup and argument parsing
│   ├── linear/       # Linear API client wrapper
│   ├── services/     # Business logic (fetching, classification, scoring)
│   ├── markdown/     # Markdown generation and formatting
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions and error handling
├── dist/             # Compiled output
└── package.json      # Dependencies and scripts
```

### Data Flow

```
CLI Args → Config → Linear Client → Issue Fetcher → Classifier → Scorer → Markdown Generator → File Write
```

## Development

### Type Check

```bash
npm run type-check
```

### Build

```bash
npm run build
```

### Run in Dev Mode

```bash
npm run dev -- --out "output.md"
```

## Troubleshooting

### "LINEAR_API_KEY not found"

Make sure you've created a `.env` file in the project root with:

```
LINEAR_API_KEY=your_api_key_here
```

### "Failed to connect to Linear API"

- Check that your API key is valid
- Verify you have internet connection
- Ensure the API key has proper permissions

### "No issues found"

- Verify you're subscribed to issues in Linear
- Try increasing `--maxIssues` parameter
- Check that your Linear workspace has issues

## Future Enhancements

Potential improvements for future versions:

- `--open` flag to automatically open the markdown file
- File-based caching to reduce API calls
- Custom markdown templates
- Filter by labels, projects, or teams
- Slack/Discord notifications for high-priority issues
- AI-powered issue summaries
- JSON/HTML output formats
- Trend tracking over time

## License

MIT

## Author

Built with Claude Code for Anand
