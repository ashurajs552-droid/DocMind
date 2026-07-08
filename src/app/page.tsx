'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Cpu, BookOpen, Quote, HardDrive, Layers, ArrowRight, Mic, Volume2, Globe, ExternalLink, Sun, Moon, Mail } from 'lucide-react';
import OnboardingModal from '@/components/OnboardingModal';
import { DocMindLogoIcon, DocMindLogoFull } from '@/components/DocMindLogo';

export default function LandingPage() {
  const [activeVoiceOrbState, setActiveVoiceOrbState] = useState<'idle' | 'breathing'>('idle');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [forceOnboarding, setForceOnboarding] = useState(false);

  // Load theme and user details from localStorage
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

  // Simple scroll-triggered intersection observer to handle fade/slide-ins
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-12');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );

    const targets = document.querySelectorAll('.reveal-on-scroll');
    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  // Set up periodic voice visualizer shift to simulate "live" breathing state
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVoiceOrbState((prev) => (prev === 'idle' ? 'breathing' : 'idle'));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-paper-light dark:bg-[#080b11] text-ink-light dark:text-ink-dark transition-colors duration-300 relative overflow-x-hidden tech-grid">
      {/* Onboarding Dialog */}
      <OnboardingModal onComplete={handleOnboardingComplete} forceOpen={forceOnboarding} onClose={() => setForceOnboarding(false)} />

      {/* Background Ambient Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[35rem] h-[35rem] rounded-full bg-secondary/10 dark:bg-secondary/5 blur-[130px] animate-float-slow-a" />
        <div className="absolute top-[40%] right-[-10rem] w-[40rem] h-[40rem] rounded-full bg-primary/5 blur-[150px] animate-float-slow-b" />
        <div className="absolute top-[20%] left-[30%] w-[30rem] h-[30rem] rounded-full bg-accent-violet/5 blur-[140px] animate-float-slow-a" />
        <div className="absolute bottom-[-10rem] left-[10%] w-[35rem] h-[35rem] rounded-full bg-secondary/5 blur-[120px] animate-float-slow-a" />
      </div>

      {/* Nav Bar */}
      <nav 
        className="relative z-50 border-b border-sand-muted/20 dark:border-sand-dark/80 bg-paper-light/80 dark:bg-[#080b11]/80 backdrop-blur-md px-6 pb-4 flex items-center justify-between sticky top-0"
        style={{ paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3.5 cursor-pointer group">
            <DocMindLogoFull />
            <span className="font-serif text-xl font-extrabold tracking-tight text-ink-light dark:text-ink-dark group-hover:text-primary transition-colors">
              DocMind
            </span>
          </Link>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-ink-light/60 dark:text-ink-dark/60">
          <button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors cursor-pointer">
            Features
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-primary transition-colors cursor-pointer">
            How it works
          </button>
          <Link href="/privacy" className="hover:text-primary transition-colors cursor-pointer">
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

      {/* Hero Section */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-28 md:pb-40 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Hero Content */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-secondary-light font-mono bg-secondary/15 px-3.5 py-2 rounded-full border border-secondary/25 tracking-widest uppercase shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary-light animate-pulse" />
              100% Client-Side Vectors
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-accent-rose-light font-mono bg-accent-rose/10 px-3.5 py-2 rounded-full border border-accent-rose/25 tracking-widest uppercase shadow-xs">
              <Mic size={11} className="text-accent-rose" />
              Voice Enabled
            </span>
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-ink-light dark:text-ink-dark leading-[1.08]">
            Ask your documents anything. <br />
            <span className="bg-gradient-to-r from-primary via-accent-violet to-accent-cyan bg-clip-text text-transparent underline decoration-accent-violet/30 underline-offset-8">
              Nothing leaves your device.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-ink-light/75 dark:text-ink-dark/75 max-w-2xl leading-relaxed font-sans">
            Upload PDFs, Word docs, or slide decks. DocMind reads them locally, answers your questions with exact citations, and can even talk back — no cloud storage, no data upload, ever.
          </p>

          <div className="flex flex-wrap items-center gap-4.5 pt-2">
            <Link
              href="/app"
              className="px-6 py-3.5 bg-primary text-white hover:bg-primary-dark rounded-xl text-xs font-bold font-mono tracking-wider transition-all duration-300 uppercase shadow-lg shadow-primary/20 hover:scale-105"
            >
              Get Started
            </Link>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-xs font-bold font-mono tracking-widest uppercase text-ink-light/60 dark:text-ink-dark/60 hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer py-2 group"
            >
              See how it works
              <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Hero Visual (Animated Voice Orb representation) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-72 h-72 sm:w-85 sm:h-85 rounded-3xl border border-sand-muted/20 dark:border-sand-dark/60 bg-sand-light/10 dark:bg-sand-dark/10 backdrop-blur-md p-6 flex flex-col items-center justify-center shadow-2xl overflow-hidden group">
            {/* Ambient scanning light */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[150%] -top-[25%] animate-pulse pointer-events-none" />

            {/* Orb Visual Component */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Outer orbit dashed ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-primary/20 animate-orbit-slow" />
              <div className="absolute inset-2.5 rounded-full border border-dashed border-secondary/15 animate-spin" style={{ animationDuration: '40s' }} />

              {/* Inner glowing aura */}
              <div className={`absolute inset-6 rounded-full blur-xl transition-all duration-[2000ms] opacity-40 ${
                activeVoiceOrbState === 'idle' ? 'bg-secondary scale-95' : 'bg-accent-violet scale-105'
              }`} />

              {/* Centered logo core */}
              <div className="relative z-10 w-24 h-24 rounded-full bg-white dark:bg-[#0d1117] border border-sand-muted/20 dark:border-white/5 flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
                <Mic size={28} className="text-primary animate-pulse" />
                <span className="text-[7px] font-mono tracking-widest text-ink-light/40 dark:text-ink-dark/40 uppercase mt-1">Local Core</span>
              </div>
            </div>

            {/* Waveforms */}
            <div className="flex items-center gap-1 mt-6 h-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((bar) => {
                const heightScale = [0.3, 0.5, 0.7, 0.9, 0.8, 0.4, 0.7, 0.9, 0.6, 0.4, 0.3][bar - 1];
                const animationDelay = `${bar * 0.1}s`;
                return (
                  <div
                    key={bar}
                    className="w-0.5 bg-primary/80 rounded-full h-full transform origin-center animate-waveform"
                    style={{ animationDelay, animationDuration: '1.5s', transform: `scaleY(${heightScale})` }}
                  />
                );
              })}
            </div>

            <div className="mt-4 text-center">
              <span className="text-[9px] font-mono tracking-widest text-ink-light/40 dark:text-ink-dark/40 uppercase">AI Speech Engine Idle</span>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 border-t border-sand-muted/20 dark:border-sand-dark/40">
        <div className="reveal-on-scroll opacity-0 translate-y-12 transition-all duration-700 space-y-4 max-w-3xl text-left mb-20">
          <p className="text-xs font-bold font-mono tracking-widest text-primary uppercase">Architecture Flow</p>
          <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink-light dark:text-ink-dark leading-tight">
            Zero upload, instant local pipeline.
          </h3>
          <p className="text-sm sm:text-base text-ink-light/60 dark:text-ink-dark/60 leading-relaxed max-w-2xl font-sans">
            DocMind processes files within the sandbox boundary of your web browser. Here is exactly how documents are digested and queried.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Upload',
              description: 'Drop in a PDF, DOCX, or PPTX. Nothing is sent anywhere yet.',
              icon: <Layers size={18} />,
              colorClass: 'border-accent-cyan/20 bg-accent-cyan/[0.02] hover:border-accent-cyan/60 hover:bg-accent-cyan/[0.04]',
              iconColor: 'text-accent-cyan',
              stepColor: 'text-accent-cyan-light'
            },
            {
              step: '02',
              title: 'Parse & Embed Locally',
              description: 'Your document is read and converted into searchable meaning right in your browser.',
              icon: <Cpu size={18} />,
              colorClass: 'border-secondary/20 bg-secondary/[0.02] hover:border-secondary/60 hover:bg-secondary/[0.04]',
              iconColor: 'text-secondary',
              stepColor: 'text-secondary-light'
            },
            {
              step: '03',
              title: 'Ask',
              description: 'Type a question or just talk. DocMind finds the relevant parts of your document.',
              icon: <Mic size={18} />,
              colorClass: 'border-accent-violet/20 bg-accent-violet/[0.02] hover:border-accent-violet/60 hover:bg-accent-violet/[0.04]',
              iconColor: 'text-accent-violet',
              stepColor: 'text-accent-violet-light'
            },
            {
              step: '04',
              title: 'Get a Cited Answer',
              description: 'Every answer points back to the exact page or slide it came from.',
              icon: <Quote size={18} />,
              colorClass: 'border-accent-rose/20 bg-accent-rose/[0.02] hover:border-accent-rose/60 hover:bg-accent-rose/[0.04]',
              iconColor: 'text-accent-rose',
              stepColor: 'text-accent-rose-light'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`reveal-on-scroll opacity-0 translate-y-12 transition-all duration-700 border p-7 rounded-2xl flex flex-col justify-between min-h-[15rem] sm:min-h-[16rem] transition-all duration-300 group shadow-xs ${item.colorClass}`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="flex justify-between items-start">
                <span className={`font-mono text-sm font-bold ${item.stepColor}`}>{item.step}</span>
                <div className={`p-2.5 rounded-xl bg-sand-light/45 dark:bg-sand-dark/45 border border-sand-muted/20 dark:border-white/5 transition-colors duration-300 ${item.iconColor}`}>
                  {item.icon}
                </div>
              </div>
              <div className="space-y-3 mt-6">
                <h4 className="font-serif text-base sm:text-lg font-bold text-ink-light dark:text-ink-dark leading-tight">{item.title}</h4>
                <p className="text-xs sm:text-sm text-ink-light/55 dark:text-ink-dark/55 leading-relaxed font-sans">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 border-t border-sand-muted/20 dark:border-sand-dark/40">
        <div className="reveal-on-scroll opacity-0 translate-y-12 transition-all duration-700 space-y-4 max-w-3xl text-left mb-20">
          <p className="text-xs font-bold font-mono tracking-widest text-primary uppercase">Specifications</p>
          <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink-light dark:text-ink-dark leading-tight">
            Complete local document intelligence.
          </h3>
          <p className="text-sm sm:text-base text-ink-light/60 dark:text-ink-dark/60 leading-relaxed max-w-2xl font-sans">
            DocMind is configured with components to serve as a fast, reliable, private research workbench.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Multi-format support',
              description: 'Works with PDF, DOCX, and PPTX — upload one or several at once.',
              icon: <Layers size={16} />,
              borderClass: 'hover:border-accent-cyan/40',
              iconColor: 'text-accent-cyan',
              iconBg: 'bg-accent-cyan/10'
            },
            {
              title: 'Voice assistant',
              description: 'Ask out loud and hear the answer back, with live transcription as you speak.',
              icon: <Volume2 size={16} />,
              borderClass: 'hover:border-accent-rose/40',
              iconColor: 'text-accent-rose',
              iconBg: 'bg-accent-rose/10'
            },
            {
              title: 'Source citations',
              description: 'Click any citation in a response to preview the exact excerpt it came from.',
              icon: <Quote size={16} />,
              borderClass: 'hover:border-accent-violet/40',
              iconColor: 'text-accent-violet',
              iconBg: 'bg-accent-violet/10'
            },
            {
              title: '100% local storage',
              description: "Documents are parsed and stored on your device using your browser's local storage — never uploaded to a server or third-party database.",
              icon: <HardDrive size={16} />,
              borderClass: 'hover:border-secondary/40',
              iconColor: 'text-secondary',
              iconBg: 'bg-secondary/10'
            },
            {
              title: 'Persistent library',
              description: "Your documents stay available across sessions, so you don't have to re-upload every time.",
              icon: <BookOpen size={16} />,
              borderClass: 'hover:border-primary/40',
              iconColor: 'text-primary',
              iconBg: 'bg-primary/10'
            },
            {
              title: 'Fast streaming answers',
              description: 'Powered by Llama 3.1 on Groq for near-instant, token-by-token responses.',
              icon: <Cpu size={16} />,
              borderClass: 'hover:border-accent-violet/40',
              iconColor: 'text-accent-violet',
              iconBg: 'bg-accent-violet/10'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`reveal-on-scroll opacity-0 translate-y-12 transition-all duration-700 border border-sand-muted/20 dark:border-sand-dark/75 bg-sand-light/10 dark:bg-[#0f1422]/30 backdrop-blur-xs p-7.5 rounded-2xl space-y-5 hover:scale-[1.01] transition-all duration-200 group shadow-xs ${item.borderClass}`}
              style={{ transitionDelay: `${(idx % 3) * 100}ms` }}
            >
              <div className={`p-3 w-11 h-11 rounded-xl border border-sand-muted/20 dark:border-white/5 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform ${item.iconBg} ${item.iconColor}`}>
                {item.icon}
              </div>
              <div className="space-y-3">
                <h4 className="font-serif text-base sm:text-lg font-bold text-ink-light dark:text-ink-dark">{item.title}</h4>
                <p className="text-xs sm:text-sm text-ink-light/60 dark:text-ink-dark/60 leading-relaxed font-sans">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy / Local-First Section (Dedicated) */}
      <section id="privacy" className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 border-t border-sand-muted/20 dark:border-sand-dark/40">
        <div className="reveal-on-scroll opacity-0 translate-y-12 transition-all duration-700 border border-secondary/15 bg-secondary/5 rounded-3xl p-8 md:p-14 relative overflow-hidden secure-scan max-w-5xl mx-auto shadow-lg">
          {/* Subtle tech coordinates */}
          <span className="absolute top-4 right-6 font-mono text-[9px] text-ink-light/20 dark:text-ink-dark/20 uppercase tracking-widest hidden sm:inline">
            SECURE BOUNDARY // LAT-00.419
          </span>

          <div className="max-w-3xl space-y-6 relative z-10 text-left">
            <div className="flex items-center gap-2 text-secondary-light font-mono text-xs font-bold tracking-widest uppercase">
              <Shield size={16} />
              Privacy Protocol Active
            </div>
            
            <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink-light dark:text-ink-dark leading-tight">
              Your documents never leave your browser.
            </h3>
            
            <p className="text-sm sm:text-base text-ink-light/75 dark:text-ink-dark/75 leading-relaxed font-sans">
              Most document Q&A tools upload your files to a server and store them in a cloud database. DocMind doesn't. Parsing, embedding, and search all happen locally in your browser using IndexedDB. The only thing that leaves your device is the specific question you ask and the small snippet of text needed to answer it — never the full document, never stored anywhere but here.
            </p>

            <div className="pt-4">
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 px-6 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 hover:scale-105 shadow-md shadow-primary/20"
              >
                Get Started
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="about" className="relative z-10 border-t border-sand-muted/20 dark:border-sand-dark/50 bg-[#04060a]/50 dark:bg-[#04060a] px-6 py-14 md:py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Tagline / Logo */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="flex items-center gap-2.5">
              <DocMindLogoFull className="w-7 h-7 rounded-lg" iconClassName="w-4 h-4" />
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
                  <button onClick={() => scrollToSection('features')} className="hover:text-primary cursor-pointer transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-primary cursor-pointer transition-colors">
                    How it works
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h5 className="font-mono text-[9px] uppercase tracking-wider text-ink-light/45 dark:text-ink-dark/45 font-extrabold">Legal</h5>
              <ul className="space-y-2 text-xs text-ink-light/60 dark:text-ink-dark/60 font-mono">
                <li>
                  <Link href="/privacy" className="hover:text-primary cursor-pointer transition-colors">
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
