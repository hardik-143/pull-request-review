import { callClaude }  from './providers/claude.js';
import { callCopilot } from './providers/copilot.js';
import { callCodex }   from './providers/codex.js';
import { callGemini }  from './providers/gemini.js';
import { callCursor }  from './providers/cursor.js';

const DISPATCH = {
  claude:  callClaude,
  copilot: callCopilot,
  codex:   callCodex,
  gemini:  callGemini,
  cursor:  callCursor,
};

export async function callAI(prompt, provider, model) {
  const fn = DISPATCH[provider];
  if (!fn) {
    throw new Error(
      `Unknown provider: "${provider}". Valid providers: ${Object.keys(DISPATCH).join(', ')}`
    );
  }
  return fn(prompt, model);
}
