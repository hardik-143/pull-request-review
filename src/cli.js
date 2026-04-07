#!/usr/bin/env node

import readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';

import { loadConfig, saveConfig, showAndEditConfig } from './config.js';
import { isGitRepo, getCurrentBranch, getDiff, getStagedDiff, getPRNumber } from './git.js';
import { buildReviewPrompt } from './prompt.js';
import { callAI } from './ai.js';
import { saveReport, addMetadata } from './file.js';
import { PROVIDERS, PROVIDER_LIST } from './providers/index.js';

// ─── Argument parsing ────────────────────────────────────────────────────────

const args = process.argv.slice(2);

const flags = {
  staged:   args.includes('--staged'),
  help:     args.includes('--help') || args.includes('-h'),
  version:  args.includes('--version') || args.includes('-v'),
  config:   args[0] === 'config',
  review:   args[0] === 'review',  // explicit subcommand (optional, same as default)
  provider: args.find((a) => a.startsWith('--provider='))?.split('=')[1] ?? null,
  model:    args.find((a) => a.startsWith('--model='))?.split('=')[1] ?? null,
  focus:    args.find((a) => a.startsWith('--focus='))?.split('=')[1] ?? null,
  output:   args.find((a) => a.startsWith('--output='))?.split('=')[1] ?? null,
  base:     args.find((a) => a.startsWith('--base='))?.split('=')[1] ?? null,
};

// ─── Subcommand routing ───────────────────────────────────────────────────────

if (flags.version) {
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  const pkg = require('../package.json');
  console.log(`pr-review v${pkg.version}`);
  process.exit(0);
}

if (flags.help) {
  printHelp();
  process.exit(0);
}

if (flags.config) {
  await showAndEditConfig(chalk);
  process.exit(0);
}

// ─── Main flow ────────────────────────────────────────────────────────────────

await main();

async function main() {
  console.log(chalk.bold.cyan('\n┌─────────────────────────────────────┐'));
  console.log(chalk.bold.cyan('   🔍  pr-review — AI Code Review         '));
  console.log(chalk.bold.cyan('└─────────────────────────────────────┘\n'));

  if (!isGitRepo()) {
    fatal('Not inside a git repository. Run pr-review from your project root.');
  }

  const config = loadConfig();
  console.log(chalk.dim('  Config: ~/.pr-review/config.json\n'));

  // ── Select AI provider ─────────────────────────────────────────────────────

  const selectedProviderKey = flags.provider
    ? flags.provider
    : await selectProvider(config.defaultProvider ?? 'claude');

  const provider = PROVIDERS[selectedProviderKey];
  if (!provider) fatal(`Unknown provider: "${selectedProviderKey}". Valid: ${Object.keys(PROVIDERS).join(', ')}`);

  // ── Select model ───────────────────────────────────────────────────────────

  const defaultModelForProvider =
    config.defaultModels?.[selectedProviderKey] ?? provider.defaultModel;

  const selectedModel = flags.model
    ? flags.model
    : await selectModel(provider, defaultModelForProvider);

  // Persist last-used provider + model per provider
  const updatedModels = { ...(config.defaultModels ?? {}), [selectedProviderKey]: selectedModel };
  saveConfig({ ...config, defaultProvider: selectedProviderKey, defaultModels: updatedModels });

  console.log('');

  // ── Select branches ────────────────────────────────────────────────────────

  let sourceBranch, destBranch;
  const currentBranch = getCurrentBranch();

  if (flags.staged) {
    sourceBranch = '(staged changes)';
    destBranch   = '(index)';
  } else {
    sourceBranch = await prompt(
      `  Source branch     ${chalk.dim(`(default: ${chalk.yellow(currentBranch)})`)}: `,
      currentBranch
    );
    destBranch = flags.base ?? await prompt(
      `  Destination branch ${chalk.dim(`(default: ${chalk.yellow(config.defaultBaseBranch)})`)}: `,
      config.defaultBaseBranch
    );
  }

  // ── Detect PR number → determine output filename ───────────────────────────

  const prNumber  = getPRNumber();
  const outputFile = flags.output
    ?? (prNumber ? `pr-${prNumber}-review.md` : config.outputFile);

  if (prNumber) {
    console.log(chalk.dim(`\n  🔗 PR #${prNumber} detected → output: ${chalk.yellow(outputFile)}`));
  }

  console.log('');

  // ── Fetch diff ─────────────────────────────────────────────────────────────

  let diff;
  const spinner1 = ora({ text: 'Fetching git diff…', color: 'cyan' }).start();

  try {
    diff = flags.staged
      ? getStagedDiff(config.ignoreFiles)
      : getDiff(sourceBranch, destBranch, config.ignoreFiles);
  } catch (err) {
    spinner1.fail(chalk.red(`Diff failed: ${err.message}`));
    process.exit(1);
  }

  if (!diff || diff.trim().length === 0) {
    spinner1.warn(chalk.yellow('No changes found between the selected branches.'));
    process.exit(0);
  }

  let truncated = false;
  if (diff.length > config.maxDiffLength) {
    diff      = diff.slice(0, config.maxDiffLength) + '\n\n[DIFF TRUNCATED — exceeded maxDiffLength]\n';
    truncated = true;
  }

  spinner1.succeed(
    chalk.green('Diff fetched') +
    chalk.dim(` — ${diff.length.toLocaleString()} chars${truncated ? ' (truncated)' : ''}`)
  );

  // ── Build prompt ───────────────────────────────────────────────────────────

  const reviewPrompt = buildReviewPrompt(sourceBranch, destBranch, diff, flags.focus);

  // ── Call AI ────────────────────────────────────────────────────────────────

  const spinner2 = ora({
    text: `Calling ${provider.name} (${selectedModel})…`,
    color: 'cyan',
  }).start();

  let reviewText;
  try {
    reviewText = await callAI(reviewPrompt, selectedProviderKey, selectedModel);
    spinner2.succeed(chalk.green(`${provider.name} review received`));
  } catch (err) {
    spinner2.fail(chalk.red(`${provider.name} error: ${err.message}`));
    process.exit(1);
  }

  // ── Write report ───────────────────────────────────────────────────────────

  const spinner3 = ora({ text: 'Writing report…', color: 'cyan' }).start();
  let outputPath;

  try {
    const finalContent = addMetadata(reviewText, {
      sourceBranch,
      destBranch,
      provider:   provider.name,
      model:      selectedModel,
      prNumber,
      diffLength: diff.length,
      generatedAt: new Date().toISOString(),
    });

    outputPath = saveReport(finalContent, outputFile);
    spinner3.succeed(chalk.green('Report saved') + chalk.dim(` → ${outputPath}`));
  } catch (err) {
    spinner3.fail(chalk.red(`Failed to write report: ${err.message}`));
    process.exit(1);
  }

  // ── Done ───────────────────────────────────────────────────────────────────

  console.log('');
  console.log(chalk.bold.green('✅ PR Review complete!'));
  if (prNumber) {
    console.log(chalk.dim(`   PR #${prNumber} · ${provider.name} · ${selectedModel}`));
  }
  console.log(chalk.dim(`   Open ${outputPath} to read the review.\n`));
}

// ─── Provider selection ───────────────────────────────────────────────────────

async function selectProvider(defaultProvider) {
  const defaultIndex = PROVIDER_LIST.findIndex((p) => p.key === defaultProvider);
  const safeDefault  = defaultIndex >= 0 ? defaultIndex : 0;

  const items = PROVIDER_LIST.map((p) => ({ label: p.label, description: p.description }));
  const idx   = await arrowSelect('Select AI provider:', items, safeDefault);

  const chosen = PROVIDER_LIST[idx];
  console.log(chalk.dim(`  → ${chosen.label}\n`));
  return chosen.key;
}

// ─── Model selection ──────────────────────────────────────────────────────────

async function selectModel(provider, defaultModel) {
  const defaultIndex = provider.models.findIndex((m) => m.id === defaultModel);
  const safeDefault  = defaultIndex >= 0 ? defaultIndex : 0;

  const items = provider.models.map((m) => ({ label: m.label }));
  const idx   = await arrowSelect(`Select ${provider.name} model:`, items, safeDefault);

  const chosen = provider.models[idx];
  console.log(chalk.dim(`  → ${chosen.id}\n`));
  return chosen.id;
}

// ─── Arrow-key list selector ──────────────────────────────────────────────────

function arrowSelect(title, items, defaultIdx = 0) {
  console.log(chalk.bold(`  ${title}\n`));

  // Fallback to plain prompt when stdin is not a TTY (e.g. piped)
  if (!process.stdin.isTTY) {
    items.forEach((item, i) => {
      const marker = i === defaultIdx ? chalk.cyan('❯') : ' ';
      const label  = chalk.dim(item.label) + (item.description ? chalk.dim(` — ${item.description}`) : '');
      console.log(`  ${marker} ${label}`);
    });
    return Promise.resolve(defaultIdx);
  }

  let idx = defaultIdx;

  const render = (first) => {
    if (!first) process.stdout.write(`\x1b[${items.length}A`);
    for (let i = 0; i < items.length; i++) {
      const active = i === idx;
      const cursor = active ? chalk.cyan('❯') : ' ';
      const label  = active ? chalk.bold.white(items[i].label) : chalk.dim(items[i].label);
      const desc   = items[i].description ? chalk.dim(` — ${items[i].description}`) : '';
      process.stdout.write(`  ${cursor} ${label}${desc}\x1b[K\n`);
    }
  };

  render(true);

  return new Promise((resolve) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const onData = (key) => {
      if (key === '\u0003') {                        // Ctrl-C
        process.stdin.setRawMode(false);
        process.exit(0);
      } else if (key === '\u001b[A' || key === 'k') { // Up / k
        idx = (idx - 1 + items.length) % items.length;
        render(false);
      } else if (key === '\u001b[B' || key === 'j') { // Down / j
        idx = (idx + 1) % items.length;
        render(false);
      } else if (key === '\r' || key === '\n') {     // Enter
        process.stdin.setRawMode(false);
        process.stdin.removeListener('data', onData);
        process.stdin.pause();
        process.stdout.write('\n');
        resolve(idx);
      }
    };

    process.stdin.on('data', onData);
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function prompt(question, defaultValue = '') {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

function fatal(message) {
  console.error('\n' + chalk.red('✖ ') + message + '\n');
  process.exit(1);
}

function printHelp() {
  console.log(`
${chalk.bold.cyan('pr-review')} — AI-powered Pull Request reviews

${chalk.bold('USAGE')}
  ${chalk.cyan('pr-review')}                                 Interactive PR review
  ${chalk.cyan('pr-review review')}                          Explicit review subcommand (same as above)
  ${chalk.cyan('pr-review config')}                          View and edit global config
  ${chalk.cyan('pr-review review --staged')}                 Review staged (uncommitted) changes
  ${chalk.cyan('pr-review review --provider=<provider>')}    Skip provider prompt
  ${chalk.cyan('pr-review review --model=<model>')}          Skip model prompt
  ${chalk.cyan('pr-review review --base=<branch>')}          Override destination/base branch
  ${chalk.cyan('pr-review review --focus=<area>')}           Focus: security, performance, etc.
  ${chalk.cyan('pr-review review --output=<file>')}          Override output file name
  ${chalk.cyan('pr-review --help')}                          Show this help
  ${chalk.cyan('pr-review --version')}                       Show version

${chalk.bold('PROVIDERS')}
  ${chalk.cyan('claude')}    claude CLI  — claude-sonnet-4-6, claude-opus-4-6, claude-haiku-4-5
  ${chalk.cyan('copilot')}   copilot CLI — claude-sonnet-4.6, gpt-5.4, claude-opus-4.6, gpt-5.4-mini
  ${chalk.cyan('codex')}     codex CLI   — gpt-5.4, o3, o4-mini, gpt-4.1
  ${chalk.cyan('gemini')}    gemini CLI  — flash, pro, flash-lite
  ${chalk.cyan('cursor')}    agent CLI   — install Cursor + add \`agent\` to PATH

${chalk.bold('PR NUMBER')}
  If a GitHub PR is open for the current branch (\`gh pr view\`),
  the output file is automatically named ${chalk.yellow('pr-<number>-review.md')}.

${chalk.bold('CONFIG')}
  ${chalk.dim('~/.pr-review/config.json')}   Auto-created on first run
  Last-used provider and model per provider are remembered.

${chalk.bold('EXAMPLES')}
  ${chalk.dim('# Standard interactive review')}
  pr-review

  ${chalk.dim('# Explicit review subcommand')}
  pr-review review

  ${chalk.dim('# Skip all prompts')}
  pr-review review --provider=copilot --model=gpt-5.4 --base=develop

  ${chalk.dim('# Security-focused review of staged changes')}
  pr-review review --staged --focus=security

  ${chalk.dim('# Most capable model with custom output file')}
  pr-review review --provider=claude --model=claude-opus-4-6 --output=deep-review.md
`);
}
