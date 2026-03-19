'use client';

import React, { useRef, useEffect, useState } from 'react';
import useChat from '@/hooks/useChat';
import useChatHistory from '@/hooks/useChatHistory';
import WelcomeScreen from '@/components/WelcomeScreen';
import MessageBubble from '@/components/MessageBubble';
import ChatInput from '@/components/ChatInput';
import TypingIndicator from '@/components/TypingIndicator';
import ThemeToggle from '@/components/ThemeToggle';
import HistorySidebar from '@/components/HistorySidebar';
import ModelSelector from '@/components/ModelSelector';
import { Menu, Info } from 'lucide-react';
import { DEFAULT_AI_PROVIDER } from '@/lib/constants';

export default function Home() {
  const [provider, setProvider] = useState<string>(DEFAULT_AI_PROVIDER);

  useEffect(() => {
    const saved = localStorage.getItem('stoa-provider');
    if (saved) setProvider(saved);
  }, []);

  const handleProviderChange = (p: string) => {
    setProvider(p);
    localStorage.setItem('stoa-provider', p);
  };

  const {
    sessions,
    currentSession,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
    updateSession,
    deleteSession,
    isHydrated: historyHydrated,
  } = useChatHistory();

  const {
    messages,
    isLoading,
    error,
    setError,
    sendMessage,
    clearChat,
    retryLast,
    stopChat,
    suggestedPrompts,
    hasMessages,
  } = useChat({
    currentSession,
    onUpdateSession: updateSession,
    onNewSession: createNewSession,
    provider,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initial session creation - if none exist after hydration
  useEffect(() => {
    if (historyHydrated && sessions.length === 0) {
      createNewSession();
    }
  }, [historyHydrated, sessions.length]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!historyHydrated) return null;

  return (
    <div className="flex bg-bg-deep stoic-gradient h-screen overflow-hidden selection:bg-gold-muted/20">
      {/* Sidebar */}
      <HistorySidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewSession={createNewSession}
        onDeleteSession={deleteSession}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex flex-col flex-grow relative overflow-hidden transition-all duration-300">
        {/* Header */}
        <header className="flex-shrink-0 z-10 border-b border-border-subtle bg-bg-deep/60 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 hover:bg-bg-elevated rounded-lg transition-colors text-text-primary"
                aria-label="Open history"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-3 group cursor-default">
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gold-bright/10 border border-gold-bright/20 text-gold-bright font-serif text-lg group-hover:bg-gold-bright/20 transition-colors">Ψ</span>
                <span className="text-xl font-serif tracking-widest font-light text-text-primary group-hover:text-gold-bright transition-colors hidden sm:inline-block">PhiloGPT</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ModelSelector currentProvider={provider} onProviderChange={handleProviderChange} />
              <button
                className="px-4 py-2 text-[10px] uppercase font-bold tracking-[0.2em] text-gold-muted/80 hover:text-gold-bright bg-gold-bright/5 hover:bg-gold-bright/10 border border-gold-bright/10 rounded-full transition-all duration-300 active:scale-95 whitespace-nowrap hidden sm:inline-block"
                onClick={clearChat}
                aria-label="New Reflection"
              >
                New Reflection
              </button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Messages Content */}
        <section className="flex-grow flex flex-col relative overflow-hidden">
          {!hasMessages ? (
            <div className="flex-grow overflow-y-auto custom-scrollbar pt-6 pb-12">
              <div className="max-w-4xl mx-auto min-h-full">
                <WelcomeScreen
                  onPromptSelect={sendMessage}
                  suggestedPrompts={suggestedPrompts}
                />
              </div>
            </div>
          ) : (
            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto px-4 py-8 space-y-8 custom-scrollbar scroll-smooth"
            >
              <div className="max-w-4xl mx-auto space-y-10 pb-12">
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}

                {isLoading && !messages.find(m => m.streaming) && (
                  <TypingIndicator />
                )}

                {error && (
                  <div role="alert" className="flex items-start gap-4 p-5 rounded-2xl border border-red-500/20 bg-red-500/5 max-w-lg mx-auto animate-fade-in shadow-xl shadow-red-500/5">
                    <span className="text-xl text-red-500/80 mt-0.5 animate-pulse font-bold">!</span>
                    <div className="flex flex-col gap-3">
                      <p className="text-sm font-medium text-text-primary leading-relaxed">{error}</p>
                      <button 
                        className="inline-flex items-center w-fit px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-text-primary bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors border border-red-500/30"
                        onClick={retryLast}
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Input area */}
        <footer className="flex-shrink-0 relative">
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-deep to-transparent pointer-events-none -top-16 opacity-60" />
          <div className="relative pt-2">
            <ChatInput onSend={sendMessage} onStop={stopChat} isLoading={isLoading} />
          </div>
          <div className="relative py-2 flex items-center justify-center gap-2 group cursor-default">
             <Info size={10} className="text-text-muted/20 group-hover:text-gold-bright/30 transition-colors" />
             <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-muted/30 group-hover:text-text-muted/50 transition-colors animate-fade-in">
              PhiloGPT AI Reflections — Reason for yourself.
             </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
