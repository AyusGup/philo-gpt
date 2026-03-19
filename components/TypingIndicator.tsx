'use client';

import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 max-w-[80%] animate-fade-in" aria-label="Stoa is thinking" role="status" aria-live="polite">
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 border border-gold-bright/30 rounded-full bg-bg-elevated flex items-center justify-center">
        <span className="text-sm font-serif text-gold-bright">Ψ</span>
      </div>

      {/* Dot animation */}
      <div className="flex items-center gap-1.5 px-5 py-4 rounded-2xl rounded-tl-sm border border-border-subtle bg-bg-surface">
        {[0, 160, 320].map((delay) => (
          <span 
            key={delay}
            className="w-1.5 h-1.5 rounded-full bg-gold-muted/40 animate-bounce" 
            style={{ animationDelay: `${delay}ms` }} 
          />
        ))}
      </div>
    </div>
  );
}
