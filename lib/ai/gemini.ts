import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ChatProvider, Message } from '@/lib/types';
import { DEFAULT_GEMINI_MODEL } from '@/lib/constants';

export class GeminiProvider implements ChatProvider {
  name = 'Gemini';

  async *generateStream(messages: Message[]): AsyncGenerator<string, void, unknown> {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      ],
    });

    // Gemini requires alternating roles and NO empty messages. 
    // We filter out the system message and any empty content to prevent 400 errors.
    const systemMessage = messages.find((m) => m.role === 'system');
    const chatHistory = messages
      .filter((m) => m.role !== 'system' && m.content.trim() !== '')
      .slice(0, -1)
      .map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: m.content.trim() }],
      }));

    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || !lastMessage.content.trim()) {
      throw new Error('The last message cannot be empty.');
    }

    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: systemMessage?.content ? {
        role: 'system',
        parts: [{ text: systemMessage.content }]
      } : undefined,
    });

    try {
      const result = await chat.sendMessageStream(lastMessage.content);
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
      }
    } catch (error: any) {
      console.error('Gemini Provider Error:', error);
      throw error;
    }
  }
}
