import { execFileSync } from 'child_process';
import { SYSTEM_PROMPT } from '../prompt.js';

export async function callCodex(prompt, model) {
  const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${prompt}`;

  // -q  quiet / non-interactive mode (no TUI, outputs response to stdout)
  // --approval-mode suggest  read-only agent: proposes but never auto-executes
  const cliArgs = ['-q', '--approval-mode', 'suggest'];

  if (model && model !== 'default') {
    cliArgs.push('--model', model);
  }

  cliArgs.push(fullPrompt);

  let output;
  try {
    output = execFileSync('codex', cliArgs, {
      encoding:  'utf8',
      maxBuffer: 50 * 1024 * 1024,
      timeout:   180_000, // 3 min — codex reasoning models can be slow
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(
        '`codex` not found. Install: npm install -g @openai/codex\n' +
        '  Then run: codex  (and sign in on first launch)'
      );
    }
    if (err.signal === 'SIGTERM') {
      throw new Error('Codex timed out after 3 minutes. Try reducing the diff size.');
    }
    const stderr = err.stderr?.trim();
    throw new Error(`codex CLI error: ${stderr || err.message}`);
  }

  return output.trim();
}
