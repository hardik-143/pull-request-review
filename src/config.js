import fs from 'fs';
import os from 'os';
import path from 'path';
import readline from 'readline';

export const CONFIG_DIR = path.join(os.homedir(), '.pr-review');
export const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export const DEFAULT_CONFIG = {
  defaultProvider: 'claude',
  defaultModels: {
    claude:  'claude-sonnet-4-5',
    copilot: 'default',
    codex:   'default',
    gemini:  'flash',
    cursor:  'default',
  },
  defaultBaseBranch: 'main',
  maxDiffLength: 100000,
  ignoreFiles: ['package-lock.json', 'yarn.lock'],
  outputFile: 'pr-review-review.md',
  strictMode: true,
};

export function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig() {
  ensureConfigDir();

  if (!fs.existsSync(CONFIG_FILE)) {
    saveConfig(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    // Merge with defaults so new keys are always present
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

export function getConfigPath() {
  return CONFIG_FILE;
}

function ask(rl, question, defaultValue) {
  return new Promise((resolve) => {
    rl.question(`  ${question} [${defaultValue}]: `, (answer) => {
      const trimmed = answer.trim();
      resolve(trimmed === '' ? String(defaultValue) : trimmed);
    });
  });
}

export async function showAndEditConfig(chalk) {
  const config = loadConfig();

  console.log(chalk.bold('\nCurrent configuration:'));
  console.log(chalk.dim(`  File: ${CONFIG_FILE}\n`));
  console.log(JSON.stringify(config, null, 2));
  console.log('');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log(chalk.bold('Update values') + chalk.dim(' (press Enter to keep current):\n'));

  const newModel      = await ask(rl, 'Default model      ', config.defaultModel);
  const newBranch     = await ask(rl, 'Default base branch', config.defaultBaseBranch);
  const newMaxDiff    = await ask(rl, 'Max diff length    ', config.maxDiffLength);
  const newOutputFile = await ask(rl, 'Output file        ', config.outputFile);
  const newStrictMode = await ask(rl, 'Strict mode        ', config.strictMode);
  const newIgnore     = await ask(rl, 'Ignore files (csv) ', config.ignoreFiles.join(','));

  rl.close();

  const updated = {
    ...config,
    defaultModel:      newModel,
    defaultBaseBranch: newBranch,
    maxDiffLength:     parseInt(newMaxDiff, 10) || config.maxDiffLength,
    outputFile:        newOutputFile,
    strictMode:        newStrictMode === 'true',
    ignoreFiles:       newIgnore.split(',').map((f) => f.trim()).filter(Boolean),
  };

  saveConfig(updated);
  console.log('\n' + chalk.green('✔ Config saved.\n'));
  console.log(JSON.stringify(updated, null, 2));
  console.log('');
}
