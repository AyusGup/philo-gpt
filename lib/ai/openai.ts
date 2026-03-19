import OpenAI from 'openai';
import { ChatProvider, Message } from '@/lib/types';
import { DEFAULT_OPENAI_MODEL } from '@/lib/constants';

export class OpenAIProvider implements ChatProvider {
  name = 'OpenAI';

  async *generateStream(messages: Message[]): AsyncGenerator<string, void, unknown> {
    const apiKey = process.env.OPENAI_API_KEY;
    const modelName = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is missing.');
    }

    const client = new OpenAI({ apiKey });
    
    // Explicitly casting messages to OpenAI's required format
    const openAiMessages = messages.map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    try {
      const stream = await client.chat.completions.create({
        model: modelName,
        messages: openAiMessages,
        stream: true,
        max_tokens: 500,
        temperature: 0.7,
      });

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) yield text;
      }
    } catch (error: any) {
      console.error('OpenAI Provider Error:', error);
      throw error;
    }
  }
}
