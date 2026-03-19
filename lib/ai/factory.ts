import { ChatProvider } from '@/lib/types';
import { GeminiProvider } from './gemini';
import { DEFAULT_AI_PROVIDER } from '@/lib/constants';

/** 
 * AI Provider Factory
 * Gemini fast preview is used as default model as free tier is provided
*/
export function getAIProvider(providerName?: string): ChatProvider {
  const provider = (providerName || DEFAULT_AI_PROVIDER).toLowerCase();

  switch (provider) {
    case 'gemini':
      return new GeminiProvider();
    default:
      return new GeminiProvider();
  }
}
