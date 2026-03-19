import { PillarQuote } from './types';

export const APP_NAME = 'PhiloGPT';
export const APP_DESCRIPTION = 'Your AI Guide to Philosophical Reflections';

export const MAX_MESSAGE_CHARS = 600;
export const MAX_HISTORY_MESSAGES = 15;

export const RATE_LIMIT_REQUESTS = 20;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export const DEFAULT_AI_PROVIDER = 'gemini';
export const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash-latest';
export const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

export const SUGGESTED_PROMPTS = [
  "How do I stop worrying about things I can't control?",
  "How can I deal with anger and frustration?",
  "What does Stoicism say about death and grief?",
  "How do I find purpose and meaning in my work?",
  "How can I build resilience in the face of adversity?",
  "What is the Stoic view on happiness?",
];

export const PILLAR_QUOTES: PillarQuote[] = [
  { text: 'You have power over your mind, not outside events.', author: 'Marcus Aurelius' },
  { text: 'We suffer more in imagination than in reality.', author: 'Seneca' },
  { text: 'No man is free who is not master of himself.', author: 'Epictetus' },
];
