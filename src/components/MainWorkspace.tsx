'use client';

import React, { useState, useEffect } from 'react';
import DocumentUpload from '@/components/upload/DocumentUpload';
import DocumentList from '@/components/upload/DocumentList';
import ChatPane, { type ChatMessage } from '@/components/chat/ChatPane';
import VoiceOrb from '@/components/voice/VoiceOrb';
import CitationExplorer from '@/components/chat/CitationExplorer';
import { type ChunkRecord } from '@/lib/db';
import { Sun, Moon, Sparkles, ShieldCheck } from 'lucide-react';

export default function MainWorkspace() {
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [speakTextTrigger, setSpeakTextTrigger] = useState('');
  const [activeChunk, setActiveChunk] = useState<(ChunkRecord & { documentName: string }) | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load theme from localStorage on start
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (storedTheme) {
        setTheme(storedTheme);
        document.documentElement.classList.toggle('dark', storedTheme === 'dark');
      } else {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = systemPrefersDark ? 'dark' : 'light';
        setTheme(initialTheme);
        document.documentElement.classList.toggle('dark', systemPrefersDark);
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleToggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllDocs = (ids: string[]) => {
    setSelectedDocIds(ids);
  };

  const handleSelectCitation = (chunk: ChunkRecord & { documentName: string }) => {
    setActiveChunk(chunk);
  };

  const handleTranscript = (text: string) => {
    setVoiceTranscript(text);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden transition-colors duration-300 relative tech-grid">
      {/* Dynamic Animated Ambient Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-forest/15 dark:bg-forest/10 blur-[110px] animate-float-slow-a" />
        <div className="absolute -bottom-32 -right-32 w-[35rem] h-[35rem] rounded-full bg-terracotta/10 dark:bg-terracotta/5 blur-[120px] animate-float-slow-b" />
      </div>

      {/* Brand Header / Top Bar (Glassmorphic) */}
      <header className="relative z-10 border-b border-sand-muted/40 dark:border-sand-dark/60 bg-white/70 dark:bg-paper-dark/70 backdrop-blur-md px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-forest text-white dark:bg-terracotta shadow-md shadow-terracotta/10">
            <Sparkles size={17} />
          </div>
          <div>
            <h1 className="font-serif text-xl font-extrabold tracking-tight text-ink-light dark:text-ink-dark flex items-center gap-2.5">
              DocMind
              <span className="text-[10px] tracking-widest uppercase font-mono font-bold bg-sand/60 dark:bg-sand-dark/80 text-ink-light/60 dark:text-ink-dark/50 px-2 py-0.5 rounded-md border border-sand-muted/30 dark:border-sand-dark/40">
                Local RAG v1.0
              </span>
            </h1>
          </div>
        </div>

        {/* Global Action Header Items */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-semibold text-forest dark:text-ink-dark/60 font-mono bg-forest/5 dark:bg-sand-dark/65 px-3 py-1.5 rounded-full border border-forest/15 dark:border-sand-dark/80 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Secure Sandbox Workspace</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-sand-muted/50 hover:border-sand-dark dark:border-sand-dark dark:hover:border-sand-muted text-ink-light/60 hover:text-ink-light dark:text-ink-dark/60 dark:hover:text-ink-dark transition-all duration-200 cursor-pointer bg-white/50 dark:bg-sand-dark/20 backdrop-blur-xs"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left column: Document Library & Upload */}
        <aside className="w-80 md:w-96 border-r border-sand-muted/40 dark:border-sand-dark/60 bg-white/40 dark:bg-paper-dark/30 backdrop-blur-md p-6 flex flex-col space-y-6 shrink-0 overflow-y-auto">
          <div>
            <h2 className="font-serif text-lg font-bold text-ink-light dark:text-ink-dark">
              Upload Sources
            </h2>
            <p className="text-xs text-ink-light/50 dark:text-ink-dark/50 mt-1">
              Add local PDF, DOCX, or PPTX files. Text extraction and embedding runs locally.
            </p>
          </div>

          {/* Upload Queue */}
          <DocumentUpload />

          {/* Document list & toggle selector */}
          <div className="flex-1 flex flex-col justify-end">
            <DocumentList
              selectedDocIds={selectedDocIds}
              onToggleSelectDoc={handleToggleSelectDoc}
              onSelectAll={handleSelectAllDocs}
            />
          </div>
        </aside>

        {/* Center column: Chat feed */}
        <main className="flex-1 flex flex-col min-w-0 border-r border-sand-muted/40 dark:border-sand-dark/60 bg-paper-light/30 dark:bg-paper-dark/10 backdrop-blur-xs">
          <div className="flex-1 overflow-hidden">
            <ChatPane
              selectedDocIds={selectedDocIds}
              messages={messages}
              setMessages={setMessages}
              isThinking={isThinking}
              setIsThinking={setIsThinking}
              voiceModeEnabled={voiceModeEnabled}
              setSpeakTextTrigger={setSpeakTextTrigger}
              onSelectCitation={handleSelectCitation}
              voiceTranscript={voiceTranscript}
            />
          </div>

          {/* Voice Assistant Panel (docked in bottom center) */}
          <div className="px-6 pb-6 border-t border-sand-muted/40 dark:border-sand-dark/60 pt-4 bg-white/45 dark:bg-paper-dark/45 backdrop-blur-md">
            <VoiceOrb
              onTranscript={handleTranscript}
              isThinking={isThinking}
              voiceModeEnabled={voiceModeEnabled}
              onToggleVoiceMode={setVoiceModeEnabled}
              speakTextTrigger={speakTextTrigger}
            />
          </div>
        </main>

        {/* Right column: Source preview / citation lookup */}
        <aside className="w-80 md:w-96 shrink-0 h-full hidden lg:block bg-white/45 dark:bg-paper-dark/45 backdrop-blur-md">
          <CitationExplorer
            activeChunk={activeChunk}
            onClose={() => setActiveChunk(null)}
          />
        </aside>
      </div>
    </div>
  );
}
