'use client';

import React from 'react';
import { PILLAR_QUOTES, APP_NAME, APP_DESCRIPTION } from '@/lib/constants';

interface WelcomeScreenProps {
  onPromptSelect: (prompt: string) => void;
  suggestedPrompts: string[];
}

export default function WelcomeScreen({ onPromptSelect, suggestedPrompts }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full gap-8 p-6 text-center animate-fade-in sm:p-12">
      {/* Emblem */}
      <div className="relative flex items-center justify-center w-20 h-20 border rounded-full border-gold-bright/20 bg-gold-bright/5 animate-pulse-slow">
        <div className="absolute inset-[-6px] rounded-full border border-gold-dim/40 opacity-40" />
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-bg-elevated border border-border-subtle shadow-inner">
          <span className="text-3xl leading-none font-serif text-gold-bright">Ψ</span>
        </div>
      </div>

      {/* Heading */}
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl sm:text-6xl font-serif font-light tracking-tight text-text-primary">
          Welcome to <span className="text-gold-bright italic font-normal">{APP_NAME}</span>
        </h1>
        <p className="text-lg sm:text-xl font-light leading-relaxed text-text-secondary">
          {APP_DESCRIPTION}, grounded in the timeless wisdom of
          Marcus Aurelius, Seneca, and Epictetus.
        </p>
      </div>

      {/* Quotes */}
      <div className="w-full max-w-xl space-y-3">
        {PILLAR_QUOTES.map((q, i) => (
          <div 
            key={i} 
            className="p-5 text-left rounded-xl border border-border-subtle bg-bg-surface/50 group hover:border-gold-dim/30 transition-all duration-500 animate-fade-in-up shadow-sm hover:shadow-md"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <p className="text-base italic font-serif leading-relaxed text-text-secondary mb-2 group-hover:text-text-primary transition-colors">
              "{q.text}"
            </p>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gold-muted/80">
              — {q.author}
            </span>
          </div>
        ))}
      </div>

      {/* Prompts */}
      <div className="w-full max-w-2xl space-y-4 pt-4">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-text-muted">
          Begin your reflection
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list">
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              className="flex items-start gap-2 p-4 text-left transition-all duration-300 border border-border-subtle rounded-xl bg-bg-surface hover:bg-bg-elevated hover:border-gold-dim/50 group animate-fade-in-up shadow-sm hover:shadow-md active:scale-[0.98]"
              onClick={() => onPromptSelect(prompt)}
              role="listitem"
              style={{ animationDelay: `${300 + i * 60}ms` }}
            >
              <span className="text-gold-muted/60 group-hover:text-gold-bright transition-colors">›</span>
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                {prompt}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
