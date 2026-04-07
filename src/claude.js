import { execFileSync } from 'child_process';
import { SYSTEM_PROMPT } from './prompt.js';

// Map friendly short names → claude CLI model aliases
const MODEL_ALIASES = {
  'sonnet-4.5':       'claude-sonnet-4-5',
  'sonnet-4':         'claude-sonnet-4',
  'opus-4.5':         'claude-opus-4-5',
  'opus-4':           'claude-opus-4',
  'haiku-3.5':        'claude-haiku-3-5',
  'haiku-3':          'claude-haiku-3',
  // short aliases the claude CLI itself accepts
  'sonnet':           'sonnet',
  'opus':             'opus',
  'haiku':            'haiku',
};

function resolveModel(model) {
  return MODEL_ALIASES[model] ?? model;
}

export async function callClaude(prompt, model) {
  const resolvedModel = resolveModel(model);

  // Full prompt = system prompt + user prompt, joined clearly
  const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${prompt}`;

  let output;
  try {
    output = execFileSync(
      'claude',
      [
        '--print',                        // non-interactive, print and exit
        '--output-format', 'text',        // plain text output
        '--model', resolvedModel,
        '--no-session-persistence',       // don't pollute session history
        fullPrompt,
      ],
      {
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024,     // 50 MB
        timeout:   120_000,              // 2 min timeout
      }
    );
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(
        '`claude` command not found. Install Claude Code: https://claude.ai/code'
      );
    }
    if (err.signal === 'SIGTERM') {
      throw new Error('Claude timed out after 2 minutes. Try reducing the diff size.');
    }
    const stderr = err.stderr?.trim();
    throw new Error(`claude CLI error: ${stderr || err.message}`);
  }

  return output.trim();
}
