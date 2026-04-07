# pr-review

> AI-powered Pull Request reviews — pick your AI, get a structured Markdown report, right from your terminal.

`pr-review` diffs two branches, sends the diff to your chosen AI, and saves a structured Markdown review to a file. If a GitHub PR is open, the file is automatically named `pr-<number>-review.md`.

**No API keys required.** All providers use their official CLI tools with your existing authenticated sessions.

---

## Installation

```bash
npm install -g pull-request-review
```

Or from source:

```bash
git clone https://github.com/hardik-143/pull-request-review
cd pr-review
npm install
npm install -g .
```

---

## Requirements

- Node.js ≥ 18
- Git in `PATH`
- At least one AI provider CLI installed and authenticated (see [Providers](#providers))

---

## Quickstart

```bash
# Run inside any git repository
cd your-project
pr-review
```

You'll be prompted to pick an AI provider, a model, and your branches. That's it.

---

## Providers

All five providers use their official CLI — no API keys, no environment variables.

| Provider | CLI binary | Auth |
|---|---|---|
| **Claude** | `claude` | Already logged in via Claude Code |
| **GitHub Copilot** | `copilot` | `copilot /login` |
| **OpenAI Codex** | `codex` | Sign in on first `codex` run |
| **Google Gemini** | `gemini` | Sign in on first `gemini` run |
| **Cursor** | `agent` | Install Cursor → Cmd+Shift+P → *Install agent in PATH* |

### Installing provider CLIs

```bash
# Claude
# Already installed if you're using Claude Code

# GitHub Copilot
npm install -g @github/copilot
copilot /login

# OpenAI Codex
npm install -g @openai/codex
codex   # sign in on first launch

# Google Gemini
npm install -g @google/gemini-cli
gemini  # sign in on first launch

# Cursor
# Install Cursor app → Cmd+Shift+P → "Install cursor/agent in PATH"
```

---

## Usage

### Interactive review

```bash
pr-review
```

Flow:

```
  Select AI provider:

    1) Claude (Anthropic)   — Uses local claude CLI — no API key needed
    2) GitHub Copilot       — Uses copilot CLI — run `copilot /login` first
    3) OpenAI Codex         — Uses codex CLI — run `codex` to sign in
    4) Google Gemini        — Uses gemini CLI — run `gemini` to authenticate
    5) Cursor               — Uses agent CLI — install Cursor + add agent to PATH

  Choice [1]:

  Select Claude model:

    1) claude-sonnet-4-5  · Recommended
    2) claude-opus-4-5   · Most capable
    3) claude-haiku-3-5  · Fastest
    ...

  Choice [1]:

  Source branch     (default: feature/auth):
  Destination branch (default: main):

  🔗 PR #42 detected → output: pr-42-review.md

✔ Diff fetched — 4,821 chars
✔ Claude review received
✔ Report saved → /your/project/pr-42-review.md

✅ PR Review complete!
   PR #42 · Claude · claude-sonnet-4-5
```

---

### Commands & flags

```
pr-review                              Interactive PR review
pr-review review                       Explicit review subcommand (same as above)
pr-review config                       View and edit global config
pr-review review --staged              Review staged (uncommitted) changes
pr-review review --provider=<provider> Skip provider prompt
pr-review review --model=<model>       Skip model prompt
pr-review review --base=<branch>       Override destination/base branch
pr-review review --focus=<area>        Focus: security, performance, etc.
pr-review review --output=<file>       Override output file name
pr-review --help                       Show help
pr-review --version                    Show version
```

### Examples

```bash
# Standard interactive review
pr-review

# Explicit review subcommand
pr-review review

# Non-interactive — skip all prompts
pr-review review --provider=claude --model=claude-sonnet-4-5 --base=main

# Security-focused review of staged changes
pr-review review --staged --focus=security

# Use Gemini's most capable model
pr-review review --provider=gemini --model=pro

# Review with GitHub Copilot, custom output file
pr-review review --provider=copilot --output=review-$(date +%Y%m%d).md

# View and update config
pr-review config
```

---

## PR Number Detection

If a GitHub PR is open for the current branch, `pr-review` automatically detects it via `gh pr view` and names the output file:

```
pr-42-review.md
```

Falls back to `pr-review-review.md` (from config) if no PR is found or `gh` is not installed.

---

## Models

### Claude
| Model | Description |
|---|---|
| `claude-sonnet-4-5` | Recommended (default) |
| `claude-opus-4-5` | Most capable |
| `claude-haiku-3-5` | Fastest |
| `claude-sonnet-4` | Previous Sonnet |
| `claude-opus-4` | Previous Opus |

### GitHub Copilot
| Model | Description |
|---|---|
| `default` | Your Copilot plan's default (recommended) |
| `gpt-4.1` | GPT-4.1 |
| `gpt-4o` | GPT-4o |
| `claude-sonnet-4-5` | Claude via Copilot |
| `o3` | Reasoning model |
| `o4-mini` | Fast reasoning |

### OpenAI Codex
| Model | Description |
|---|---|
| `default` | Your Codex plan's default (recommended) |
| `gpt-4o` | GPT-4o |
| `o3` | Reasoning |
| `o4-mini` | Fast reasoning |

### Google Gemini
| Model alias | Resolves to | Description |
|---|---|---|
| `flash` | gemini-2.5-flash | Recommended (default) |
| `pro` | gemini-2.5-pro | Most capable |
| `flash-lite` | gemini-2.5-flash-lite | Fastest |
| `auto` | auto-select | Best available |

### Cursor
| Model | Description |
|---|---|
| `default` | Your Cursor plan's default (recommended) |
| `gpt-4o` | GPT-4o |
| `claude-sonnet-4-5` | Claude via Cursor |
| `gemini-2.5-pro` | Gemini via Cursor |
| `o3` | Reasoning |

---

## Global Config

Auto-created at `~/.pr-review/config.json` on first run.

**Default config:**

```json
{
  "defaultProvider": "claude",
  "defaultModels": {
    "claude":  "claude-sonnet-4-5",
    "copilot": "default",
    "codex":   "default",
    "gemini":  "flash",
    "cursor":  "default"
  },
  "defaultBaseBranch": "main",
  "maxDiffLength": 100000,
  "ignoreFiles": ["package-lock.json", "yarn.lock"],
  "outputFile": "pr-review-review.md",
  "strictMode": true
}
```

The last-used provider and model per provider are automatically remembered.

**Edit interactively:**

```bash
pr-review config
```

**Or edit directly:**

```bash
nano ~/.pr-review/config.json
```

### Config options

| Key | Description | Default |
|---|---|---|
| `defaultProvider` | AI provider to pre-select | `claude` |
| `defaultModels` | Last-used model per provider | see above |
| `defaultBaseBranch` | Branch to diff against | `main` |
| `maxDiffLength` | Max diff characters sent to AI | `100000` |
| `ignoreFiles` | Files excluded from diff | `[package-lock.json, yarn.lock]` |
| `outputFile` | Fallback report filename | `pr-review-review.md` |
| `strictMode` | Strict review mode in prompt | `true` |

---

## Output format

Every generated report has this structure:

```markdown
---
<!-- Generated by pr-review on 2026-04-03T18:00:00.000Z -->
<!-- Provider: Claude | Model: claude-sonnet-4-5 | Diff: 4821 chars | feature/auth → main -->
<!-- PR: #42 -->
---

# PR Review: `feature/auth` → `main`

## Summary
## Critical Issues
## Security
## Performance
## Code Quality & Improvements
## Test Coverage
## Suggestions
## Final Verdict
```

---

## Project structure

```
pr-review/
├── src/
│   ├── cli.js              Main entry point, argument parsing, user prompts
│   ├── ai.js               Provider dispatcher
│   ├── config.js           Config manager (~/.pr-review/config.json)
│   ├── git.js              Git diff + PR number detection
│   ├── prompt.js           PR review prompt builder + system prompt
│   ├── file.js             Report file writer
│   └── providers/
│       ├── index.js        Provider registry (models, labels, descriptions)
│       ├── claude.js       claude CLI adapter
│       ├── copilot.js      copilot CLI adapter
│       ├── codex.js        codex CLI adapter
│       ├── gemini.js       gemini CLI adapter
│       └── cursor.js       agent CLI adapter (Cursor)
├── package.json
└── README.md
```

---

## License

MIT

