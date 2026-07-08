'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Shield, ArrowRight, Sun, Moon, Mail, ExternalLink, HardDrive, Cpu, Mic, EyeOff, Ban, Trash2 } from 'lucide-react';
import OnboardingModal from '@/components/OnboardingModal';

export default function PrivacyPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [forceOnboarding, setForceOnboarding] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');

      const storedUser = localStorage.getItem('docmind_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

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

  return (
    <div className="min-h-screen bg-paper-light dark:bg-[#080b11] text-ink-light dark:text-ink-dark transition-colors duration-300 relative overflow-x-hidden tech-grid flex flex-col">
      {/* Onboarding Dialog */}
      <OnboardingModal onComplete={handleOnboardingComplete} forceOpen={forceOnboarding} onClose={() => setForceOnboarding(false)} />

      {/* Background Ambient Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[35rem] h-[35rem] rounded-full bg-secondary/10 dark:bg-secondary/5 blur-[130px]" />
        <div className="absolute top-[40%] right-[-10rem] w-[40rem] h-[40rem] rounded-full bg-primary/5 blur-[150px]" />
      </div>

      {/* Nav Bar */}
      <nav className="relative z-50 border-b border-sand-muted/20 dark:border-sand-dark/80 bg-paper-light/80 dark:bg-[#080b11]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3.5 cursor-pointer group">
            <div className="flex items-center justify-center w-10.5 h-10.5 rounded-xl bg-primary text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles size={20} />
            </div>
            <span className="font-serif text-xl font-extrabold tracking-tight text-ink-light dark:text-ink-dark group-hover:text-primary transition-colors">
              DocMind
            </span>
          </Link>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-ink-light/60 dark:text-ink-dark/60">
          <Link href="/#features" className="hover:text-primary transition-colors cursor-pointer">
            Features
          </Link>
          <Link href="/#how-it-works" className="hover:text-primary transition-colors cursor-pointer">
            How it works
          </Link>
          <Link href="/privacy" className="text-primary hover:text-primary transition-colors cursor-pointer">
            Privacy
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors cursor-pointer">
            About
          </Link>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3.5">
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

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-sand-muted/40 dark:border-sand-dark text-ink-light/60 hover:text-ink-light dark:text-ink-dark/60 dark:hover:text-ink-dark transition-all duration-200 cursor-pointer bg-white/50 dark:bg-sand-dark/20 backdrop-blur-xs"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>

          <Link
            href="/app"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white hover:bg-primary-dark rounded-xl text-xs font-bold font-mono tracking-wider transition-all duration-300 uppercase shadow-md shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02]"
          >
            Get Started
            <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24 flex-1">
        <div className="space-y-12">
          {/* Header Section */}
          <div className="space-y-4 text-left">
            <div className="inline-flex items-center gap-2 text-secondary-light font-mono text-xs font-bold tracking-widest uppercase bg-secondary/10 px-3.5 py-1.5 rounded-full border border-secondary/20">
              <Shield size={14} />
              Privacy Protocol Active
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-ink-light dark:text-ink-dark tracking-tight leading-tight">
              Privacy, by architecture — <br />
              <span className="bg-gradient-to-r from-primary via-accent-violet to-accent-cyan bg-clip-text text-transparent">
                not by policy.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-ink-light/60 dark:text-ink-dark/60 max-w-2xl font-sans leading-relaxed">
              DocMind was built from day one on local-first principles. We believe your private research data should stay exactly where it belongs: on your own machine. Here is exactly what that means.
            </p>
          </div>

          {/* Privacy Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Section: What's stored locally */}
            <div className="border border-sand-muted/20 dark:border-sand-dark/75 bg-sand-light/10 dark:bg-[#0f1422]/20 backdrop-blur-xs p-6.5 rounded-2xl space-y-4 hover:scale-[1.01] transition-all duration-200 group">
              <div className="p-3 w-11 h-11 rounded-xl bg-primary/15 text-primary border border-sand-muted/20 dark:border-white/5 flex items-center justify-center">
                <HardDrive size={18} />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink-light dark:text-ink-dark">What's stored locally</h3>
              <p className="text-xs sm:text-sm text-ink-light/60 dark:text-ink-dark/60 leading-relaxed font-sans">
                When you upload a document, DocMind parses it, splits it into chunks, generates embeddings, and stores all of it in your browser's IndexedDB. This all happens on your device.
              </p>
            </div>

            {/* Section: What's never stored */}
            <div className="border border-sand-muted/20 dark:border-sand-dark/75 bg-sand-light/10 dark:bg-[#0f1422]/20 backdrop-blur-xs p-6.5 rounded-2xl space-y-4 hover:scale-[1.01] transition-all duration-200 group">
              <div className="p-3 w-11 h-11 rounded-xl bg-accent-rose/15 text-accent-rose border border-sand-muted/20 dark:border-white/5 flex items-center justify-center">
                <EyeOff size={18} />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink-light dark:text-ink-dark">What's never stored</h3>
              <p className="text-xs sm:text-sm text-ink-light/60 dark:text-ink-dark/60 leading-relaxed font-sans">
                There's no account, no server-side copy of your document, and no cloud vector database. If you clear your browser data or delete a document in the app, it's gone — we never had a copy to begin with.
              </p>
            </div>

            {/* Section: What does leave your device */}
            <div className="border border-sand-muted/20 dark:border-sand-dark/75 bg-sand-light/10 dark:bg-[#0f1422]/20 backdrop-blur-xs p-6.5 rounded-2xl space-y-4 hover:scale-[1.01] transition-all duration-200 group">
              <div className="p-3 w-11 h-11 rounded-xl bg-accent-cyan/15 text-accent-cyan border border-sand-muted/20 dark:border-white/5 flex items-center justify-center">
                <Cpu size={18} />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink-light dark:text-ink-dark">What does leave your device</h3>
              <p className="text-xs sm:text-sm text-ink-light/60 dark:text-ink-dark/60 leading-relaxed font-sans">
                When you ask a question, only your question text and the small relevant snippet of your document needed to answer it are sent to Groq's API to generate a response. The full document itself is never uploaded.
              </p>
            </div>

            {/* Section: Voice & microphone */}
            <div className="border border-sand-muted/20 dark:border-sand-dark/75 bg-sand-light/10 dark:bg-[#0f1422]/20 backdrop-blur-xs p-6.5 rounded-2xl space-y-4 hover:scale-[1.01] transition-all duration-200 group">
              <div className="p-3 w-11 h-11 rounded-xl bg-accent-violet/15 text-accent-violet border border-sand-muted/20 dark:border-white/5 flex items-center justify-center">
                <Mic size={18} />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink-light dark:text-ink-dark">Voice & microphone</h3>
              <p className="text-xs sm:text-sm text-ink-light/60 dark:text-ink-dark/60 leading-relaxed font-sans">
                Voice input uses your browser's built-in Speech Recognition API for live transcription. Audio isn't recorded, stored, or sent to any server.
              </p>
            </div>

            {/* Section: Clearing your data */}
            <div className="border border-sand-muted/20 dark:border-sand-dark/75 bg-sand-light/10 dark:bg-[#0f1422]/20 backdrop-blur-xs p-6.5 rounded-2xl space-y-4 hover:scale-[1.01] transition-all duration-200 group">
              <div className="p-3 w-11 h-11 rounded-xl bg-secondary/15 text-secondary border border-sand-muted/20 dark:border-white/5 flex items-center justify-center">
                <Trash2 size={18} />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink-light dark:text-ink-dark">Clearing your data</h3>
              <p className="text-xs sm:text-sm text-ink-light/60 dark:text-ink-dark/60 leading-relaxed font-sans">
                You can delete any document from your library at any time from the app. To remove everything DocMind has stored, clear your browser's site data for this domain.
              </p>
            </div>

            {/* Section: No tracking */}
            <div className="border border-sand-muted/20 dark:border-sand-dark/75 bg-sand-light/10 dark:bg-[#0f1422]/20 backdrop-blur-xs p-6.5 rounded-2xl space-y-4 hover:scale-[1.01] transition-all duration-200 group">
              <div className="p-3 w-11 h-11 rounded-xl bg-accent-rose/15 text-accent-rose border border-sand-muted/20 dark:border-white/5 flex items-center justify-center">
                <Ban size={18} />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink-light dark:text-ink-dark">No tracking</h3>
              <p className="text-xs sm:text-sm text-ink-light/60 dark:text-ink-dark/60 leading-relaxed font-sans">
                DocMind doesn't use third-party analytics or tracking scripts. The client-side database runs locally, keeping your workspace logs entirely isolated.
              </p>
            </div>
          </div>

          {/* Back to App Link */}
          <div className="flex justify-center pt-8 border-t border-sand-muted/20 dark:border-sand-dark/40">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-xl text-xs font-mono font-bold tracking-wider uppercase hover:bg-primary-dark transition-all hover:scale-105 shadow-md shadow-primary/20"
            >
              Back to app workspace
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer id="about" className="relative z-10 border-t border-sand-muted/20 dark:border-sand-dark/50 bg-[#04060a]/50 dark:bg-[#04060a] px-6 py-14 md:py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Tagline / Logo */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-white">
                <Sparkles size={14} />
              </div>
              <span className="font-serif text-base font-extrabold text-ink-light dark:text-ink-dark">DocMind</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-ink-light/45 dark:text-ink-dark/45 font-serif italic max-w-xs">
                Local-first document intelligence.
              </p>
            </div>
            <div className="text-[10px] font-mono text-ink-light/35 dark:text-ink-dark/30 pt-4 uppercase tracking-widest flex items-center">
              <span>&copy; {new Date().getFullYear()} DocMind. All rights preserved.</span>
              <span className="ml-2.5 px-1.5 py-0.5 rounded-md bg-sand-light/30 dark:bg-sand-dark/25 border border-sand-muted/20 dark:border-white/5 font-semibold text-[8px]">v1.0.0</span>
            </div>
          </div>

          {/* Columns */}
          <div className="md:col-span-4 grid grid-cols-2 gap-8 text-left">
            <div className="space-y-3">
              <h5 className="font-mono text-[9px] uppercase tracking-wider text-ink-light/45 dark:text-ink-dark/45 font-extrabold">Product</h5>
              <ul className="space-y-2 text-xs text-ink-light/60 dark:text-ink-dark/60 font-mono">
                <li>
                  <Link href="/#features" className="hover:text-primary cursor-pointer transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="hover:text-primary cursor-pointer transition-colors">
                    How it works
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h5 className="font-mono text-[9px] uppercase tracking-wider text-ink-light/45 dark:text-ink-dark/45 font-extrabold">Legal</h5>
              <ul className="space-y-2 text-xs text-ink-light/60 dark:text-ink-dark/60 font-mono">
                <li>
                  <Link href="/privacy" className="text-primary hover:text-primary cursor-pointer transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-primary cursor-pointer transition-colors">
                    About
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Socials & Credits */}
          <div className="md:col-span-3 space-y-4 text-left md:text-right">
            <div className="space-y-1">
              <h5 className="font-mono text-[9px] uppercase tracking-wider text-ink-light/45 dark:text-ink-dark/45 font-extrabold">Developed By</h5>
              <a
                href="https://github.com/ashurajs552-droid"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs font-bold text-primary tracking-widest uppercase hover:underline transition-all inline-block"
              >
                Aashuraj S
              </a>
            </div>

            <div className="flex items-center justify-start md:justify-end gap-2.5 text-ink-light/40 dark:text-ink-dark/40 pt-2">
              <a
                href="https://github.com/ashurajs552-droid"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-sand-light/45 dark:bg-sand-dark/45 hover:text-ink-light dark:hover:text-ink-dark border border-sand-muted/20 dark:border-white/5 hover:border-primary/20 transition-all flex items-center justify-center"
                title="GitHub Repository"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/aashu-raj-s-2b4329406?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-sand-light/45 dark:bg-sand-dark/45 hover:text-ink-light dark:hover:text-ink-dark border border-sand-muted/20 dark:border-white/5 hover:border-primary/20 transition-all flex items-center justify-center"
                title="LinkedIn Profile"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="mailto:aashurajs552@gmail.com"
                className="p-2 rounded-lg bg-sand-light/45 dark:bg-sand-dark/45 hover:text-ink-light dark:hover:text-ink-dark border border-sand-muted/20 dark:border-white/5 hover:border-primary/20 transition-all flex items-center justify-center"
                title="Email Contact"
              >
                <Mail size={14} />
              </a>
              <a
                href="https://github.com/ashurajs552-droid"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-sand-light/45 dark:bg-sand-dark/45 hover:text-ink-light dark:hover:text-ink-dark border border-sand-muted/20 dark:border-white/5 hover:border-primary/20 transition-all flex items-center justify-center"
                title="Portfolio Website"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
