'use client';

import React, { useState, useCallback } from 'react';
import { Message } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
}

function renderMarkdown(text: string): string {
  if (!text) return '';

  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-gold-muted/40 pl-4 my-3 font-serif italic text-lg text-text-secondary">$1</blockquote>')
    .replace(/^### (.+)$/gm, '<h4 class="text-lg font-serif font-bold text-gold-bright mt-4 mb-2">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="text-xl font-serif font-bold text-gold-bright mt-5 mb-2">$1</h3>')
    .replace(/^[-•] (.+)$/gm, '<li class="relative pl-5 before:content-[\'›\'] before:absolute before:left-0 before:text-gold-muted/60 text-sm text-text-secondary my-1">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, match => `<ul class="my-4 space-y-2 pb-1">${match}</ul>`)
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br>')
    .replace(/^(.+)$/, '<p class="mb-4 last:mb-0 leading-relaxed">$1</p>');
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { role, content, id, streaming } = message;
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard errors
    }
  }, [content]);

  return (
    <div
      className={`flex gap-3 max-w-[92%] sm:max-w-[85%] animate-fade-in-up ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'}`}
      role="article"
      aria-label={`${isUser ? 'Your message' : "Stoa's response"}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 mt-1 rounded-full bg-bg-elevated border border-gold-bright/30 flex items-center justify-center animate-fade-in shadow-inner">
          <span className="text-sm font-serif text-gold-bright">Ψ</span>
        </div>
      )}

      <div className={`flex flex-col gap-1 min-w-0 group animate-fade-in`}>
        {/* Bubble */}
        <div
          className={`px-5 py-4 rounded-2xl border transition-all duration-300 shadow-sm ${
            isUser
              ? 'bg-gold-dim/10 border-gold-dim/20 text-text-primary rounded-tr-sm group-hover:shadow-md'
              : 'bg-bg-surface border-border-subtle text-text-primary rounded-tl-sm group-hover:border-gold-dim/30 group-hover:shadow-md'
          }`}
        >
          {isUser ? (
            <p className="text-base leading-relaxed whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="relative">
              <div 
                className="text-base text-text-primary max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
              {streaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-gold-bright/60 vertical-middle animate-pulse" />
              )}
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className={`flex items-center gap-3 px-1 transition-opacity opacity-0 group-hover:opacity-100 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] font-medium tracking-wider text-text-muted">
            {formatTime(id)}
          </span>

          {!isUser && !streaming && content && (
            <button
              className="flex items-center gap-1 px-2 py-1 text-[10px] uppercase font-bold tracking-widest text-text-muted hover:text-gold-muted transition-colors rounded-lg hover:bg-gold-bright/5 active:scale-95"
              onClick={handleCopy}
              aria-label={copied ? 'Copied to clipboard' : 'Copy message'}
            >
              {copied ? (
                <span className="text-gold-bright italic">Copied</span>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="5" y="1" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M1 5H3.5V15H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
