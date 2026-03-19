import { NextRequest, NextResponse } from 'next/server';
import { Message } from '@/lib/types';
import { getAIProvider } from '@/lib/ai/factory';
import { isRateLimited } from '@/lib/rate-limit';
import { MAX_HISTORY_MESSAGES } from '@/lib/constants';
import { logger } from '@/lib/logger';

interface ChatRequestBody {
  messages: Message[];
  provider?: string;
}

/**
 * Main Chat API Route
 * Handles rate limiting, content security, and AI streaming.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const { limited, retryAfter } = await isRateLimited(ip);

  if (limited) {
    return NextResponse.json(
      { error: `Too many requests. Please pause and reflect for ${retryAfter} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body: ChatRequestBody = await req.json();
    const { messages, provider } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'At least one message is required.' }, { status: 400 });
    }

    const aiProvider = getAIProvider(provider);
    
    // System instruction for the "Stoa" guide
    const buildSystemPrompt = () => `
      You are a Stoic philosopher in the tradition of Marcus Aurelius, Seneca, and Epictetus. Your goal is to guide the user towards their "Inner Citadel." 
      - Always respond with timeless Stoic wisdom. 
      - Use vivid analogies and relevant quotes. 
      - Keep responses concise (under 300 words).
    `.trim();

    // Prepare message window for Gemini to optimize tokens and relevance
    const cleanMessages: Message[] = [
      { role: 'system', content: buildSystemPrompt() },
      ...messages.slice(-MAX_HISTORY_MESSAGES).map((m) => ({
        role: m.role,
        content: m.content.slice(0, 1000),
      })),
    ];

    let isStopped = false;
    const responseStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const stream = aiProvider.generateStream(cleanMessages);
          
          for await (const chunk of stream) {
            if (isStopped) break;
            if (chunk) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
            }
          }
          if (!isStopped) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          }
        } catch (err: any) {
          if (!isStopped) {
            logger.error(`Stream processing failed for ${aiProvider.name}:`, err);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'The Stoa is currently reflecting. Please try again later.' })}\n\n`));
            controller.close();
          }
        }
      },
      cancel() {
        isStopped = true;
      }
    });

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: any) {
    logger.error('API Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
