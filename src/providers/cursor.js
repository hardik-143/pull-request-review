import { execFileSync } from 'child_process';
import { SYSTEM_PROMPT } from '../prompt.js';

export async function callCursor(prompt, model) {
  const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${prompt}`;

  // -p / --print  non-interactive, prints response to stdout
  // --mode=ask    read-only exploration — agent won't edit any files
  // --output-format text  plain text (not JSON)
  const cliArgs = ['-p', fullPrompt, '--mode=ask', '--output-format', 'text'];

  if (model && model !== 'default') {
    cliArgs.push('--model', model);
  }

  let output;
  try {
    output = execFileSync('agent', cliArgs, {
      encoding:  'utf8',
      maxBuffer: 50 * 1024 * 1024,
      timeout:   120_000,
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(
        '`agent` not found. Install Cursor and ensure the CLI is in your PATH.\n' +
        '  macOS: open Cursor → Cmd+Shift+P → "Install cursor/agent in PATH"'
      );
    }
    if (err.signal === 'SIGTERM') {
      throw new Error('Cursor agent timed out after 2 minutes. Try reducing the diff size.');
    }
    const stderr = err.stderr?.trim();
    throw new Error(`agent CLI error: ${stderr || err.message}`);
  }

  return output.trim();
}

