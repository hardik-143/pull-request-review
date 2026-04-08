import { execFile } from 'child_process';
import { promisify } from 'util';
import { SYSTEM_PROMPT } from '../prompt.js';

const execFileAsync = promisify(execFile);

export async function callClaude(prompt, model) {
  const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${prompt}`;
  try {
    const { stdout } = await execFileAsync(
      'claude',
      ['--print', '--output-format', 'text', '--model', model, '--no-session-persistence', fullPrompt],
      { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, timeout: 120_000 }
    );
    return stdout.trim();
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error('`claude` not found. Install Claude Code: https://claude.ai/code');
    if (err.signal === 'SIGTERM') throw new Error('Claude timed out after 2 minutes. Try a smaller diff.');
    const detail = err.stderr?.trim() || err.stdout?.trim() || '';
    if (/auth|token|expired|401|login/i.test(detail)) {
      throw new Error('Claude authentication expired. Run `claude` to re-authenticate, then try again.');
    }
    throw new Error(`claude CLI error: ${detail || 'unknown error (run `claude` to check status)'}`);
  }
}
