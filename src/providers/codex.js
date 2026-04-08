import { execFile } from 'child_process';
import { promisify } from 'util';
import { SYSTEM_PROMPT } from '../prompt.js';

const execFileAsync = promisify(execFile);

export async function callCodex(prompt, model) {
  const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${prompt}`;

  // `codex exec` — non-interactive scripting mode (outputs result to stdout)
  const cliArgs = ['exec'];
  if (model && model !== 'default') cliArgs.push('--model', model);
  cliArgs.push(fullPrompt);

  try {
    const { stdout } = await execFileAsync('codex', cliArgs, {
      encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, timeout: 180_000,
    });
    return stdout.trim();
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error('`codex` not found. Install: npm install -g @openai/codex\n  Then run: codex  (and sign in on first launch)');
    if (err.signal === 'SIGTERM') throw new Error('Codex timed out after 3 minutes. Try reducing the diff size.');
    throw new Error(`codex CLI error: ${err.stderr?.trim() || err.message}`);
  }
}
