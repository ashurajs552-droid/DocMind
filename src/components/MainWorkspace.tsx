'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DocumentUpload from '@/components/upload/DocumentUpload';
import DocumentList from '@/components/upload/DocumentList';
import ChatPane, { type ChatMessage } from '@/components/chat/ChatPane';
import VoiceOrb from '@/components/voice/VoiceOrb';
import CitationExplorer from '@/components/chat/CitationExplorer';
import OnboardingModal from '@/components/OnboardingModal';
import { type ChunkRecord } from '@/lib/db';
import { Sun, Moon, Sparkles, Menu, X } from 'lucide-react';

export default function MainWorkspace() {
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [speakTextTrigger, setSpeakTextTrigger] = useState('');
  const [activeChunk, setActiveChunk] = useState<(ChunkRecord & { documentName: string }) | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [forceOnboarding, setForceOnboarding] = useState(false);

  const handleOnboardingComplete = (name: string, role: string) => {
    setUser({ name, role });
    setForceOnboarding(false);
  };

  const getCleanGreeting = () => {
    if (!user) return null;
    const hour = new Date().getHours();
    let emoji = '☀️';
    let greeting = 'GOOD AFTERNOON';
    
    if (hour >= 5 && hour < 12) {
      emoji = '🌅';
      greeting = 'GOOD MORNING';
    } else if (hour >= 12 && hour < 17) {
      emoji = '☀️';
      greeting = 'GOOD AFTERNOON';
    } else if (hour >= 17 && hour < 22) {
      emoji = '🌆';
      greeting = 'GOOD EVENING';
    } else {
      emoji = '🌌';
      greeting = 'GOOD NIGHT';
    }
    
    return `${emoji} ${greeting}, ${user.name.toUpperCase()}`;
  };

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
      {/* Onboarding Modal */}
      <OnboardingModal
        onComplete={handleOnboardingComplete}
        forceOpen={forceOnboarding}
        onClose={() => setForceOnboarding(false)}
      />

      {/* Dynamic Animated Ambient Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-secondary/15 dark:bg-secondary/10 blur-[110px] animate-float-slow-a" />
        <div className="absolute -bottom-32 -right-32 w-[35rem] h-[35rem] rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px] animate-float-slow-b" />
      </div>

      {/* Brand Header / Top Bar (Glassmorphic) */}
      <header className="relative z-30 border-b border-sand-muted/40 dark:border-sand-dark/60 bg-white/70 dark:bg-[#080b11]/85 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu on smaller screens */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-xl text-ink-light/70 hover:text-ink-light dark:text-ink-dark/70 dark:hover:text-ink-dark hover:bg-sand/30 dark:hover:bg-sand-dark/30 transition-colors cursor-pointer"
            title="Open Document Library"
          >
            <Menu size={20} />
          </button>

          <Link href="/" className="flex items-center gap-3.5 cursor-pointer group">
            <div className="flex items-center justify-center w-10.5 h-10.5 rounded-xl bg-primary text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="font-serif text-xl font-extrabold tracking-tight text-ink-light dark:text-ink-dark flex items-center gap-2 group-hover:text-primary transition-colors">
                DocMind
                <span className="hidden sm:inline-block text-[9px] tracking-widest uppercase font-mono font-bold bg-sand/60 dark:bg-sand-dark/80 text-ink-light/60 dark:text-ink-dark/50 px-2 py-0.5 rounded-md border border-sand-muted/30 dark:border-sand-dark/40">
                  Local RAG v1.0
                </span>
              </h1>
            </div>
          </Link>
        </div>

        {/* Center: Greeting */}
        {user && (
          <div className="flex items-center gap-2 bg-sand-light/35 dark:bg-sand-dark/25 pl-2.5 md:pl-3.5 pr-1 py-1 rounded-full border border-sand-muted/20 dark:border-white/5">
            <span className="hidden md:inline-block text-[10px] font-bold font-mono tracking-wider text-ink-light/80 dark:text-ink-dark/80 mr-1.5">
              {getCleanGreeting()}
            </span>
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold uppercase shadow-sm">
              {user.name.charAt(0)}
            </div>
          </div>
        )}

        {/* Global Action Header Items */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-semibold text-secondary-dark dark:text-secondary-light font-mono bg-secondary/5 dark:bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/15 dark:border-secondary/20 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            <span>Secure Sandbox Workspace</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-sand-muted/50 hover:border-sand-dark dark:border-sand-dark dark:hover:border-sand-muted text-ink-light/60 hover:text-ink-light dark:text-ink-dark/60 dark:hover:text-ink-dark transition-all duration-200 cursor-pointer bg-white/50 dark:bg-sand-dark/20 backdrop-blur-xs"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left column: Document Library & Upload */}
        {/* Sidebar Backdrop Overlay on Mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-80 sm:w-96 lg:static lg:w-80 xl:w-96 border-r border-sand-muted/40 dark:border-sand-dark/60 bg-paper-light dark:bg-[#0c0e15] lg:bg-white/40 lg:dark:bg-paper-dark/30 backdrop-blur-md p-6 flex flex-col space-y-6 shrink-0 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Mobile sidebar header close button */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-sand-muted/20 dark:border-sand-dark/20">
            <span className="font-serif text-sm font-bold text-ink-light dark:text-ink-dark">Document Library</span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg text-ink-light/50 hover:text-ink-light dark:text-ink-dark/50 dark:hover:text-ink-dark hover:bg-sand/30 dark:hover:bg-sand-dark/30 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

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
          <div className="flex-1 flex flex-col justify-end min-h-0">
            <DocumentList
              selectedDocIds={selectedDocIds}
              onToggleSelectDoc={(id) => {
                handleToggleSelectDoc(id);
              }}
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
          <div className="px-4 pb-4 pt-2.5 sm:px-6 sm:pb-6 sm:pt-4 border-t border-sand-muted/40 dark:border-sand-dark/60 bg-white/45 dark:bg-paper-dark/45 backdrop-blur-md">
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
        {/* Backdrop for Citation Explorer Drawer on Mobile */}
        {activeChunk && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
            onClick={() => setActiveChunk(null)}
          />
        )}
        
        <aside
          className={`fixed inset-y-0 right-0 z-50 w-85 max-w-[90vw] sm:w-96 lg:static lg:w-80 xl:w-96 shrink-0 h-full bg-paper-light dark:bg-[#0c0e15] lg:bg-white/45 lg:dark:bg-paper-dark/45 backdrop-blur-md transform transition-transform duration-300 ease-in-out border-l border-sand-muted/40 dark:border-sand-dark/60 ${
            activeChunk ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          } ${activeChunk ? 'block' : 'hidden lg:block'}`}
        >
          <CitationExplorer
            activeChunk={activeChunk}
            onClose={() => setActiveChunk(null)}
          />
        </aside>
      </div>
    </div>
  );
}
