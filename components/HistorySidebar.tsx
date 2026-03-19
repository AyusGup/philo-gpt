'use client';

import React from 'react';
import { ChatSession } from '@/lib/types';
import { Trash2, MessageSquare, Plus, Menu, X } from 'lucide-react';

interface HistorySidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function HistorySidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isOpen,
  setIsOpen,
}: HistorySidebarProps) {
  return (
    <>
      {/* Mobile Toggle Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-bg-surface border-r border-border-subtle z-50 transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex lg:flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 flex items-center justify-center rounded bg-gold-bright/10 text-gold-bright font-serif text-sm">Ψ</span>
            <span className="text-sm font-serif font-bold tracking-widest uppercase text-text-primary">History</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-bg-elevated rounded-lg transition-colors lg:hidden text-text-muted"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => {
              onNewSession();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-border-gold bg-gold-bright/5 hover:bg-gold-bright/10 text-gold-bright rounded-xl transition-all duration-300 group shadow-md"
            aria-label="New Reflection"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">New Reflection</span>
          </button>
        </div>

        {/* Session List */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-xs text-text-muted font-light italic">No reflections yet.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 
                  ${session.id === currentSessionId 
                    ? 'bg-bg-elevated border border-border-subtle shadow-inner' 
                    : 'hover:bg-bg-elevated/50 border border-transparent'}
                `}
                onClick={() => {
                  onSelectSession(session.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
              >
                <MessageSquare size={16} className={session.id === currentSessionId ? 'text-gold-bright' : 'text-text-muted'} />
                
                <div className="flex-grow min-w-0 pr-4">
                  <p className={`text-sm truncate font-light ${session.id === currentSessionId ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                    {session.title}
                  </p>
                  <p className="text-[9px] text-text-muted/60 mt-0.5 font-bold uppercase tracking-widest">
                    {new Date(session.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="absolute right-3 opacity-0 group-hover:opacity-100 hover:text-red-400 p-1.5 transition-all duration-300 rounded-lg bg-bg-surface/80 text-text-muted"
                  aria-label="Delete reflection"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle">
           <p className="text-[10px] text-center text-text-muted/60 tracking-widest uppercase font-bold">
            Stoic Wisdom Archive
          </p>
        </div>
      </aside>
    </>
  );
}
