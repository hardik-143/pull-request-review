import { execFile } from 'child_process';
import { promisify } from 'util';
import { SYSTEM_PROMPT } from '../prompt.js';

const execFileAsync = promisify(execFile);

export async function callGemini(prompt, model) {
  const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${prompt}`;

  // -p  non-interactive; -o text  plain text output
  const cliArgs = ['-p', fullPrompt, '-o', 'text'];
  if (model && model !== 'default') cliArgs.push('-m', model);

  try {
    const { stdout } = await execFileAsync('gemini', cliArgs, {
      encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, timeout: 120_000,
    });
    return stdout.trim();
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error('`gemini` not found. Install: npm install -g @google/gemini-cli\n  Then run: gemini  (and authenticate on first launch)');
    if (err.signal === 'SIGTERM') throw new Error('Gemini CLI timed out after 2 minutes. Try reducing the diff size.');
    throw new Error(`gemini CLI error: ${err.stderr?.trim() || err.message}`);
  }
}
