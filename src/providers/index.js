export const PROVIDERS = {
  // claude CLI: model IDs use dashes (e.g. claude-sonnet-4-6)
  claude: {
    key:          'claude',
    name:         'Claude',
    label:        'Claude (Anthropic)',
    description:  'Uses local claude CLI — no API key needed',
    defaultModel: 'claude-sonnet-4-6',
    models: [
      { id: 'claude-sonnet-4-6', label: 'claude-sonnet-4-6          · Default / Sonnet 4.6 (Recommended)' },
      { id: 'claude-opus-4-6',   label: 'claude-opus-4-6            · Opus 4.6 — most capable' },
      { id: 'claude-opus-4-6',   label: 'claude-opus-4-6 (1M ctx)   · Opus 4.6 with 1M context' },
      { id: 'claude-haiku-4-5',  label: 'claude-haiku-4-5           · Haiku 4.5 — fastest' },
      { id: 'claude-opus-4-5',   label: 'claude-opus-4-5            · Opus 4.5' },
      { id: 'claude-sonnet-4',   label: 'claude-sonnet-4            · Sonnet 4' },
    ],
  },
  // copilot CLI: model IDs use periods (e.g. claude-sonnet-4.6, gpt-5.4)
  copilot: {
    key:          'copilot',
    name:         'GitHub Copilot',
    label:        'GitHub Copilot',
    description:  'Uses copilot CLI — run `copilot /login` first',
    defaultModel: 'claude-sonnet-4.6',
    models: [
      { id: 'claude-sonnet-4.6',    label: 'Claude Sonnet 4.6         · Default (Recommended) · 1x' },
      { id: 'claude-opus-4.6',      label: 'Claude Opus 4.6           · Most capable · 3x' },
      { id: 'claude-opus-4.6-fast', label: 'Claude Opus 4.6 Fast      · Fastest capable · 30x (Preview)' },
      { id: 'claude-opus-4.5',      label: 'Claude Opus 4.5           · 3x' },
      { id: 'claude-sonnet-4.5',    label: 'Claude Sonnet 4.5         · 1x' },
      { id: 'claude-sonnet-4',      label: 'Claude Sonnet 4           · 1x' },
      { id: 'claude-haiku-4.5',     label: 'Claude Haiku 4.5          · Fast · 0.33x' },
      { id: 'gpt-5.4',              label: 'GPT-5.4                   · 1x' },
      { id: 'gpt-5.3-codex',        label: 'GPT-5.3-Codex             · 1x' },
      { id: 'gpt-5.2-codex',        label: 'GPT-5.2-Codex             · 1x' },
      { id: 'gpt-5.2',              label: 'GPT-5.2                   · 1x' },
      { id: 'gpt-5.1',              label: 'GPT-5.1                   · 1x' },
      { id: 'gpt-5.4-mini',         label: 'GPT-5.4 mini              · Fast · 0.33x' },
      { id: 'gpt-5-mini',           label: 'GPT-5 mini                · Fast' },
      { id: 'gpt-4.1',              label: 'GPT-4.1                   · Cheap' },
    ],
  },
  // codex CLI: model IDs from codex model picker
  codex: {
    key:          'codex',
    name:         'Codex',
    label:        'OpenAI Codex',
    description:  'Uses codex CLI — run `codex` once to sign in',
    defaultModel: 'gpt-5.4',
    models: [
      { id: 'gpt-5.4',       label: 'gpt-5.4        · Latest frontier agentic coding (Recommended)' },
      { id: 'gpt-5.4-mini',  label: 'gpt-5.4-mini   · Smaller frontier agentic coding' },
      { id: 'gpt-5.3-codex', label: 'gpt-5.3-codex  · Frontier Codex-optimized agentic coding' },
      { id: 'gpt-5.2',       label: 'gpt-5.2        · Professional work and long-running agents' },
    ],
  },
  // gemini CLI: model IDs / auto aliases
  gemini: {
    key:          'gemini',
    name:         'Gemini',
    label:        'Google Gemini',
    description:  'Uses gemini CLI — run `gemini` once to authenticate',
    defaultModel: 'default',
    models: [
      { id: 'default',          label: 'Auto (Gemini 3)    · gemini-3.1-pro, gemini-3-flash (Recommended)' },
      { id: 'gemini-2.5',       label: 'Auto (Gemini 2.5)  · gemini-2.5-pro, gemini-2.5-flash' },
      { id: 'gemini-3.1-pro',   label: 'gemini-3.1-pro     · Most capable Gemini 3' },
      { id: 'gemini-3-flash',   label: 'gemini-3-flash     · Fast Gemini 3' },
      { id: 'gemini-2.5-pro',   label: 'gemini-2.5-pro     · Most capable Gemini 2.5' },
      { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash   · Fast Gemini 2.5' },
    ],
  },
  // cursor agent CLI: model names as used in /model command
  cursor: {
    key:          'cursor',
    name:         'Cursor',
    label:        'Cursor',
    description:  'Uses agent CLI — install Cursor + add agent to PATH',
    defaultModel: 'auto',
    models: [
      { id: 'auto',                  label: 'Auto                    · Let Cursor decide' },
      { id: 'Codex 5.3',             label: 'Codex 5.3               · Frontier coding' },
      { id: 'Codex 5.3 High',        label: 'Codex 5.3 High          · Higher reasoning effort' },
      { id: 'Codex 5.3 Extra High',  label: 'Codex 5.3 Extra High    · Max reasoning effort' },
      { id: 'Codex 5.3 Spark',       label: 'Codex 5.3 Spark         · Spark variant' },
      { id: 'Codex 5.3 Spark High',  label: 'Codex 5.3 Spark High    · Spark high effort' },
      { id: 'Composer 2',            label: 'Composer 2              · Composer model' },
      { id: 'Codex 5.2',             label: 'Codex 5.2               · Previous generation' },
      { id: 'Codex 5.2 High',        label: 'Codex 5.2 High          · Previous gen, high effort' },
      { id: 'GPT-5.2',               label: 'GPT-5.2' },
    ],
  },
};

export const PROVIDER_LIST = Object.values(PROVIDERS);

