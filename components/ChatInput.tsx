'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MAX_MESSAGE_CHARS } from '@/lib/constants';

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, onStop, isLoading }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charCount = value.length;
  const isOverLimit = charCount > MAX_MESSAGE_CHARS;
  const canSend = value.trim().length > 0 && !isLoading && !isOverLimit;

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [value]);

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(value);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [canSend, onSend, value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 sm:pb-8 flex flex-col gap-3 animate-fade-in">
      <div className={`group relative flex flex-col p-1.5 border transition-all duration-500 rounded-2xl glass-card
        ${isOverLimit ? 'border-red-500/50 bg-red-500/5 shadow-lg shadow-red-500/20' : 'border-border-subtle group-focus-within:border-gold-dim group-focus-within:bg-bg-elevated/80 shadow-2xl shadow-black/40'}
      `}>
        <textarea
          ref={textareaRef}
          id="chat-input"
          className="w-full px-4 py-3 bg-transparent border-none outline-none resize-none overflow-y-auto text-base text-text-primary placeholder:text-text-muted/60 disabled:opacity-50 min-h-[52px] max-h-[160px] custom-scrollbar"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask PhiloGPT about life, adversity, or reason..."
          rows={1}
          disabled={isLoading}
          aria-label="Message input"
          maxLength={MAX_MESSAGE_CHARS + 100}
        />

        <div className="flex items-center justify-between px-3 py-1.5 border-t border-border-subtle/40">
          <span
            className={`text-[10px] font-bold tracking-[0.2em] transition-colors
              ${isOverLimit ? 'text-red-400' : charCount > MAX_MESSAGE_CHARS * 0.8 ? 'text-orange-300' : 'text-text-muted/60'}
            `}
            aria-live="polite"
          >
            {charCount > 0 ? `${charCount}/${MAX_MESSAGE_CHARS}` : ''}
          </span>

          <button
            className={`relative p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm
              ${isLoading ? 'bg-red-500 text-white scale-100 hover:scale-105 active:scale-95' : canSend ? 'bg-gold-bright text-bg-deep shadow-lg shadow-gold-dim/20 scale-100 hover:scale-105 active:scale-95' : 'bg-bg-elevated text-text-muted cursor-not-allowed opacity-50'}
            `}
            onClick={isLoading ? onStop : handleSend}
            disabled={!isLoading && !canSend}
            aria-label={isLoading ? 'Stop response' : 'Send message'}
          >
            {isLoading ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className={canSend ? 'translate-x-0.5' : ''}>
                <path d="M2 10L18 2L10 18L9 11L2 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
