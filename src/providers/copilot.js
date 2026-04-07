import { execFileSync } from 'child_process';
import { SYSTEM_PROMPT } from '../prompt.js';

export async function callCopilot(prompt, model) {
  const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${prompt}`;

  // -p  non-interactive (exits after response)
  // -s  output only the agent response (no stats/spinners) — perfect for scripting
  const cliArgs = ['-p', fullPrompt, '-s'];

  if (model && model !== 'default') {
    cliArgs.push('--model', model);
  }

  let output;
  try {
    output = execFileSync('copilot', cliArgs, {
      encoding:  'utf8',
      maxBuffer: 50 * 1024 * 1024,
      timeout:   120_000,
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(
        '`copilot` not found. Install: npm install -g @github/copilot\n' +
        '  Then run: copilot /login'
      );
    }
    if (err.signal === 'SIGTERM') {
      throw new Error('Copilot CLI timed out after 2 minutes. Try reducing the diff size.');
    }
    const stderr = err.stderr?.trim();
    throw new Error(`copilot CLI error: ${stderr || err.message}`);
  }

  return output.trim();
}

