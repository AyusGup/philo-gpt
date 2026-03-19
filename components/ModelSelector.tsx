'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Sparkles, Brain } from 'lucide-react';

interface ModelSelectorProps {
  currentProvider: string;
  onProviderChange: (provider: string) => void;
}

export default function ModelSelector({ currentProvider, onProviderChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const providers = [
    { id: 'gemini', name: 'Gemini 1.5 Flash', icon: <Sparkles size={14} className="text-gold-bright" />, description: 'Fast & Concise' },
    // { id: 'openai', name: 'GPT-4o / 3.5', icon: <Brain size={14} className="text-gold-muted" />, description: 'Detailed Logic' },
  ];

  const current = providers.find(p => p.id === currentProvider) || providers[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-subtle bg-bg-elevated/40 hover:bg-bg-elevated/80 transition-all duration-300 active:scale-95 group shadow-sm"
        aria-label="Select AI Model"
      >
        {current.icon}
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-primary">
          {current.id}
        </span>
        <ChevronDown size={14} className={`text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full right-0 mt-2 w-56 bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl z-50 p-2 animate-fade-in divide-y divide-border-subtle/40 backdrop-blur-xl">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  onProviderChange(provider.id);
                  setIsOpen(false);
                }}
                className={`w-full flex flex-col gap-0.5 p-3 rounded-xl transition-all duration-300 text-left
                  ${currentProvider === provider.id 
                    ? 'bg-gold-bright/5 border border-gold-bright/10' 
                    : 'hover:bg-bg-elevated'}
                `}
              >
                <div className="flex items-center gap-2">
                  {provider.icon}
                  <span className={`text-sm font-medium ${currentProvider === provider.id ? 'text-gold-bright' : 'text-text-primary'}`}>
                    {provider.name}
                  </span>
                </div>
                <span className="text-[10px] text-text-muted ml-5 font-bold uppercase tracking-wider opacity-60">
                  {provider.description}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
