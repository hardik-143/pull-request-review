# Changelog

All notable changes to **pull-request-review** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] — 2026-04-08

### ✨ Added

- **Remote branch support** — `git fetch --all` is now run automatically before every diff so branches that only exist on the remote (e.g. a freshly-pushed PR branch) are resolved correctly. A visible spinner step "Fetching remotes…" confirms the fetch happened.
- **`fetchAll()` + `resolveRef()`** — Two new helpers in `git.js`. `resolveRef` tries the local branch name first, then `origin/<branch>`, then `refs/remotes/origin/<branch>`, returning whichever ref exists. This means a branch like `copilot/fix-blog-detail-page-responsiveness` that only lives on origin is found automatically without any extra flags.
- **Non-developer-friendly report format** — The AI prompt was fully redesigned so reviewers without a coding background (product managers, QA, designers, business stakeholders) can read every finding without technical knowledge. Each issue now has a plain-English headline, a real-world impact statement, and a secondary technical detail block for the developer.
- **At a Glance table** — Every report now opens with a `🗂️ At a Glance` section: a single summary table listing every finding, its category, severity (🔴/🟡/🟢), and whether it must be fixed before release.
- **GFM tables throughout** — All report sections (Critical Issues, Security, Performance, Code Quality, Test Coverage, Suggestions) now use GitHub Flavored Markdown pipe-tables with context-appropriate columns instead of freeform prose.
- **Blocking items list** — The Final Verdict section now includes a bulleted "Blocking items before merge" list derived from all 🔴 High findings.

### 🔄 Changed

- **All AI providers now use async `execFile`** — Previously, all five provider wrappers (`claude`, `copilot`, `codex`, `gemini`, `cursor`) used the synchronous `execFileSync`, which blocked the Node.js event loop and caused the `ora` spinner to freeze for the entire duration of the AI call. Switched to `promisify(execFile)` so the event loop stays free and the spinner animates correctly.
- **Codex CLI invocation updated** — The `-q` flag (no longer supported in the current Codex CLI) was replaced with the `codex exec` subcommand, which is the official non-interactive scripting mode.
- **`stdio: 'pipe'` on all providers** — AI CLI output is fully captured internally; no markdown or progress text from child processes leaks to the terminal. Only the tool's own spinner messages appear during a review run.
- **All provider model lists refreshed** to reflect the current model menus of each CLI:
  - **Claude** — `claude-sonnet-4-6` (default), `claude-opus-4-6`, `claude-haiku-4-5`, `claude-opus-4-5`, `claude-sonnet-4`
  - **Copilot** — Full list including `claude-opus-4.6-fast`, `gpt-5.3-codex`, `gpt-5.2-codex`, `gpt-5.1`, `gpt-5-mini`, and all other current models
  - **Codex** — `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.3-codex`, `gpt-5.2` (removed legacy `o3`/`o4-mini`)
  - **Gemini** — Auto (Gemini 3) as default, Auto (Gemini 2.5), plus individual models `gemini-3.1-pro`, `gemini-3-flash`, `gemini-2.5-pro`, `gemini-2.5-flash`
  - **Cursor** — Full `/model` name list: Auto, Codex 5.3 variants (High, Extra High, Spark, Spark High), Composer 2, Codex 5.2, GPT-5.2
- **Help text updated** in `--help` output to list current models for each provider.
- **`branchExists()` removed** from `git.js` — replaced entirely by the more capable `resolveRef()` which checks both local and remote refs.

### 🐛 Fixed

- **"Branch not found" on remote-only branches** — Running a review against a branch that hadn't been fetched locally (e.g. a Copilot-created branch) previously threw `✖ Diff failed: Branch not found`. The tool now fetches all remotes first and falls back to `origin/<branch>` automatically.
- **Frozen spinner during AI calls** — The loading spinner appeared completely stuck for the duration of every AI call because `execFileSync` blocks the entire Node.js event loop. Fixed by switching to async `execFile`.
- **Codex `-q` flag error** — `codex CLI error: unexpected argument '-q' found` is resolved by using `codex exec` instead.

---

## [1.0.0] — 2026-04-01

### 🎉 Initial Release

- **Interactive CLI** — `pr-review` (or `pr-review review`) launches a full interactive terminal workflow: pick an AI provider, pick a model, enter source and destination branches, and get a review saved to a Markdown file.
- **Five AI providers** out of the box — `claude` (Claude Code CLI), `copilot` (GitHub Copilot CLI), `codex` (OpenAI Codex CLI), `gemini` (Google Gemini CLI), `cursor` (Cursor agent CLI). No API keys required — all providers use their respective local CLIs.
- **`--staged` mode** — Review uncommitted staged changes without specifying branches, ideal for a pre-commit quality check.
- **Auto PR number detection** — If a GitHub PR is open for the current branch (`gh pr view`), the output file is automatically named `pr-<number>-review.md`.
- **Persistent config** — Last-used provider and model per provider are saved to `~/.pr-review/config.json` and restored on next run. Default base branch and output file are configurable.
- **`pr-review config`** — View and interactively edit global config from the terminal.
- **`--base`, `--provider`, `--model`, `--focus`, `--output` flags** — Skip any interactive prompt when running in CI or scripted workflows.
- **Diff truncation** — Diffs exceeding `maxDiffLength` (default 80 000 chars) are truncated with a notice so very large PRs don't exceed model context limits.
- **File ignore list** — `ignoreFiles` in config excludes lock files and generated files (e.g. `package-lock.json`, `yarn.lock`) from the diff automatically.
- **Metadata header** — Every saved report includes a frontmatter block with provider, model, diff size, branches, PR number, and generation timestamp.
