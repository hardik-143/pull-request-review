export const PROVIDERS = {
  // claude CLI: model IDs use dashes (e.g. claude-sonnet-4-6)
  claude: {
    key:          'claude',
    name:         'Claude',
    label:        'Claude (Anthropic)',
    description:  'Uses local claude CLI — no API key needed',
    defaultModel: 'claude-sonnet-4-6',
    models: [
      { id: 'claude-sonnet-4-6', label: 'claude-sonnet-4-6  · Recommended' },
      { id: 'claude-opus-4-6',   label: 'claude-opus-4-6    · Most capable' },
      { id: 'claude-haiku-4-5',  label: 'claude-haiku-4-5   · Fastest' },
      { id: 'claude-sonnet-4-5', label: 'claude-sonnet-4-5' },
      { id: 'claude-sonnet-4',   label: 'claude-sonnet-4' },
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
      { id: 'claude-sonnet-4.6', label: 'claude-sonnet-4.6  · Recommended' },
      { id: 'claude-opus-4.6',   label: 'claude-opus-4.6    · Most capable' },
      { id: 'gpt-5.4',           label: 'gpt-5.4            · Standard' },
      { id: 'gpt-5.2',           label: 'gpt-5.2            · Standard' },
      { id: 'claude-haiku-4.5',  label: 'claude-haiku-4.5   · Fast/cheap' },
      { id: 'gpt-5.4-mini',      label: 'gpt-5.4-mini       · Fast/cheap' },
      { id: 'gpt-4.1',           label: 'gpt-4.1            · Fast/cheap' },
    ],
  },
  // codex CLI: model IDs from ~/.codex/config.toml and codex help examples
  codex: {
    key:          'codex',
    name:         'Codex',
    label:        'OpenAI Codex',
    description:  'Uses codex CLI — run `codex` once to sign in',
    defaultModel: 'gpt-5.4',
    models: [
      { id: 'gpt-5.4',  label: 'gpt-5.4   · Recommended' },
      { id: 'o3',       label: 'o3        · Reasoning' },
      { id: 'o4-mini',  label: 'o4-mini   · Fast reasoning' },
      { id: 'gpt-4.1',  label: 'gpt-4.1   · Cheaper' },
    ],
  },
  // gemini CLI: uses short aliases (flash, pro, flash-lite, auto)
  gemini: {
    key:          'gemini',
    name:         'Gemini',
    label:        'Google Gemini',
    description:  'Uses gemini CLI — run `gemini` once to authenticate',
    defaultModel: 'flash',
    models: [
      { id: 'flash',      label: 'flash      · gemini-2.5-flash (Recommended)' },
      { id: 'pro',        label: 'pro        · gemini-2.5-pro (Most capable)' },
      { id: 'flash-lite', label: 'flash-lite · gemini-2.5-flash-lite (Fastest)' },
      { id: 'auto',       label: 'auto       · Auto-select best available' },
    ],
  },
  // cursor agent CLI: model IDs (install Cursor + add agent binary to PATH)
  cursor: {
    key:          'cursor',
    name:         'Cursor',
    label:        'Cursor',
    description:  'Uses agent CLI — install Cursor + add agent to PATH',
    defaultModel: 'default',
    models: [
      { id: 'default',           label: 'Default (your Cursor plan model)' },
      { id: 'claude-sonnet-4-6', label: 'claude-sonnet-4-6' },
      { id: 'gpt-5.4',           label: 'gpt-5.4' },
      { id: 'gemini-2.5-pro',    label: 'gemini-2.5-pro' },
      { id: 'o3',                label: 'o3                · Reasoning' },
    ],
  },
};

export const PROVIDER_LIST = Object.values(PROVIDERS);

