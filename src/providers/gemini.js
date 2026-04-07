import { execFileSync } from 'child_process';
import { SYSTEM_PROMPT } from '../prompt.js';

export async function callGemini(prompt, model) {
  const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${prompt}`;

  // -p  non-interactive (exits after response)
  // -o text  plain text output (default, but explicit is safer)
  const cliArgs = ['-p', fullPrompt, '-o', 'text'];

  if (model && model !== 'default') {
    cliArgs.push('-m', model);
  }

  let output;
  try {
    output = execFileSync('gemini', cliArgs, {
      encoding:  'utf8',
      maxBuffer: 50 * 1024 * 1024,
      timeout:   120_000,
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(
        '`gemini` not found. Install: npm install -g @google/gemini-cli\n' +
        '  Then run: gemini  (and authenticate on first launch)'
      );
    }
    if (err.signal === 'SIGTERM') {
      throw new Error('Gemini CLI timed out after 2 minutes. Try reducing the diff size.');
    }
    const stderr = err.stderr?.trim();
    throw new Error(`gemini CLI error: ${stderr || err.message}`);
  }

  return output.trim();
}

