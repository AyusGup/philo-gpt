'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Message, ChatSession } from '@/lib/types';
import { SUGGESTED_PROMPTS } from '@/lib/constants';

interface UseChatProps {
  currentSession: ChatSession | null;
  onUpdateSession: (id: string, updates: Partial<ChatSession>) => void;
  onNewSession: () => void;
  provider: string;
}

export default function useChat({ currentSession, onUpdateSession, onNewSession, provider }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync with current session
  useEffect(() => {
    setMessages(currentSession?.messages || []);
    setError(null);
  }, [currentSession?.id]);

  // Handle automatic session title generation and persistence
  useEffect(() => {
    if (!currentSession || messages === currentSession.messages) return;
    
    // Guard: skip if messages are stale from a previous session
    // (new session has 0 messages but local state hasn't synced yet)
    if (currentSession.messages.length === 0 && messages.length > 0) return;

    const firstUserText = messages.find(m => m.role === 'user')?.content;
    const isNew = currentSession.title === 'New Reflection';
    
    const title = isNew && firstUserText 
      ? firstUserText.slice(0, 30) + (firstUserText.length > 30 ? '...' : '')
      : currentSession.title;
      
    onUpdateSession(currentSession.id, { messages, title });
  }, [messages, currentSession?.id]);

  const sendMessage = useCallback(async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isLoading) return;

    if (!currentSession) {
      onNewSession();
      return;
    }

    // Prepare for new streaming request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    const botId = Date.now() + 1;
    const userMessage: Message = { role: 'user', content: trimmed, id: Date.now() };
    const updatedMessages = [...messages, userMessage];

    // Optimistically update messages with streaming placeholder
    setMessages([...updatedMessages, { role: 'assistant', content: '', id: botId, streaming: true }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
          provider,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('Failed to initialize stream reader');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.content) {
              accumulated += parsed.content;
              setMessages(prev =>
                prev.map(m => m.id === botId ? { ...m, content: accumulated } : m)
              );
            }
          } catch (e) { /* ignore parse errors for partial chunks */ }
        }
      }

      setMessages(prev => prev.map(m => m.id === botId ? { ...m, streaming: false } : m));
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setMessages(prev => prev.filter(m => m.id !== botId));
      setError(err.message || 'Reflection interrupted. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, currentSession, onNewSession, provider]);

  const clearChat = useCallback(() => {
    abortControllerRef.current?.abort();
    onNewSession();
  }, [onNewSession]);

  const retryLast = useCallback(() => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser) {
      setMessages(prev => prev.slice(0, messages.indexOf(lastUser) + 1));
      sendMessage(lastUser.content);
    }
  }, [messages, sendMessage]);

  const stopChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    setError,
    sendMessage,
    clearChat,
    retryLast,
    stopChat,
    suggestedPrompts: SUGGESTED_PROMPTS,
    hasMessages: messages.length > 0,
  };
}
