import { execFile } from 'child_process';
import { promisify } from 'util';
import { SYSTEM_PROMPT } from '../prompt.js';

const execFileAsync = promisify(execFile);

export async function callCursor(prompt, model) {
  const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${prompt}`;

  // -p / --print  non-interactive; --mode=ask  read-only
  const cliArgs = ['-p', fullPrompt, '--mode=ask', '--output-format', 'text'];
  if (model && model !== 'default' && model !== 'auto') cliArgs.push('--model', model);

  try {
    const { stdout } = await execFileAsync('agent', cliArgs, {
      encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, timeout: 120_000,
    });
    return stdout.trim();
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error('`agent` not found. Install Cursor and ensure the CLI is in your PATH.\n  macOS: open Cursor → Cmd+Shift+P → "Install cursor/agent in PATH"');
    if (err.signal === 'SIGTERM') throw new Error('Cursor agent timed out after 2 minutes. Try reducing the diff size.');
    throw new Error(`agent CLI error: ${err.stderr?.trim() || err.message}`);
  }
}
