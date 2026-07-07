'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Cpu, BookOpen, Quote, HardDrive, Layers, ArrowRight, Mic, Volume2, Globe, ExternalLink } from 'lucide-react';

export default function LandingPage() {
  const [activeVoiceOrbState, setActiveVoiceOrbState] = useState<'idle' | 'breathing'>('idle');

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
    <div className="min-h-screen bg-[#0b0a09] text-ink-dark transition-colors duration-300 relative overflow-x-hidden tech-grid">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[35rem] h-[35rem] rounded-full bg-forest/10 blur-[130px] animate-float-slow-a" />
        <div className="absolute top-[40%] right-[-10rem] w-[40rem] h-[40rem] rounded-full bg-terracotta/5 blur-[150px] animate-float-slow-b" />
        <div className="absolute bottom-[-10rem] left-[10%] w-[35rem] h-[35rem] rounded-full bg-forest/5 blur-[120px] animate-float-slow-a" />
      </div>

      {/* Nav Bar */}
      <nav className="relative z-50 border-b border-sand-dark/80 bg-[#0b0a09]/80 backdrop-blur-md px-6 py-4.5 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-terracotta text-white shadow-md shadow-terracotta/20">
            <Sparkles size={16} />
          </div>
          <span className="font-serif text-lg font-extrabold tracking-tight text-ink-dark">
            DocMind
          </span>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-ink-dark/60">
          <button onClick={() => scrollToSection('features')} className="hover:text-terracotta transition-colors cursor-pointer">
            Features
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-terracotta transition-colors cursor-pointer">
            How it works
          </button>
          <button onClick={() => scrollToSection('privacy')} className="hover:text-terracotta transition-colors cursor-pointer">
            Privacy
          </button>
          <button onClick={() => scrollToSection('about')} className="hover:text-terracotta transition-colors cursor-pointer">
            About
          </button>
        </div>

        {/* Right CTA */}
        <div>
          <Link
            href="/app"
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-terracotta text-white hover:bg-terracotta-dark rounded-xl text-xs font-bold font-mono tracking-wider transition-all duration-300 uppercase shadow-md shadow-terracotta/15 hover:shadow-terracotta/25 hover:scale-[1.02]"
          >
            Open App
            <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-36 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Hero Content */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold text-forest-light dark:text-emerald-500 font-mono bg-forest/30 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-forest/50 dark:border-emerald-500/25 tracking-widest uppercase shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              100% Client-Side Vectors
            </span>
            <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold text-terracotta-light font-mono bg-terracotta/10 px-3 py-1.5 rounded-full border border-terracotta/25 tracking-widest uppercase shadow-xs">
              <Mic size={11} className="text-terracotta" />
              Voice Enabled
            </span>
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-ink-dark leading-[1.08]">
            Ask your documents anything. <br />
            <span className="text-terracotta underline decoration-terracotta/30 underline-offset-8">
              Nothing leaves your device.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-ink-dark/65 max-w-xl leading-relaxed">
            Upload PDFs, Word docs, or slide decks. DocMind reads them locally, answers your questions with exact citations, and can even talk back — no cloud storage, no data upload, ever.
          </p>

          <div className="flex flex-wrap items-center gap-4.5 pt-2">
            <Link
              href="/app"
              className="px-6 py-3.5 bg-terracotta text-white hover:bg-terracotta-dark rounded-xl text-xs font-bold font-mono tracking-wider transition-all duration-300 uppercase shadow-lg shadow-terracotta/20 hover:scale-105"
            >
              Open App Workspace
            </Link>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-xs font-bold font-mono tracking-widest uppercase text-ink-dark/60 hover:text-terracotta transition-colors flex items-center gap-1.5 cursor-pointer py-2 group"
            >
              See how it works
              <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Hero Visual (Animated Voice Orb representation) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-3xl border border-sand-dark/60 bg-[#12100e]/30 backdrop-blur-md p-6 flex flex-col items-center justify-center shadow-2xl overflow-hidden group">
            {/* Ambient scanning light */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-terracotta/5 to-transparent h-[150%] -top-[25%] animate-pulse pointer-events-none" />

            {/* Orb Visual Component */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Outer orbit dashed ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-terracotta/20 animate-orbit-slow" />
              <div className="absolute inset-2.5 rounded-full border border-dashed border-forest/15 animate-spin" style={{ animationDuration: '40s' }} />

              {/* Inner glowing aura */}
              <div className={`absolute inset-6 rounded-full blur-xl transition-all duration-[2000ms] opacity-40 ${
                activeVoiceOrbState === 'idle' ? 'bg-forest scale-95' : 'bg-terracotta scale-105'
              }`} />

              {/* Centered logo core */}
              <div className="relative z-10 w-24 h-24 rounded-full bg-[#1b1917] border border-white/5 flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
                <Mic size={28} className="text-terracotta animate-pulse" />
                <span className="text-[7px] font-mono tracking-widest text-ink-dark/40 uppercase mt-1">Local Core</span>
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
                    className="w-0.5 bg-terracotta/80 rounded-full h-full transform origin-center animate-waveform"
                    style={{ animationDelay, animationDuration: '1.5s', transform: `scaleY(${heightScale})` }}
                  />
                );
              })}
            </div>

            <div className="mt-4 text-center">
              <span className="text-[9px] font-mono tracking-widest text-ink-dark/40 uppercase">AI Speech Engine Idle</span>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28 border-t border-sand-dark/40">
        <div className="reveal-on-scroll opacity-0 translate-y-12 transition-all duration-700 space-y-4 max-w-2xl text-left mb-16">
          <p className="text-[10px] font-extrabold font-mono tracking-widest text-terracotta uppercase">Architecture Flow</p>
          <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink-dark">
            Zero upload, instant local pipeline.
          </h3>
          <p className="text-xs sm:text-sm text-ink-dark/50 leading-relaxed">
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
              icon: <Layers size={16} />
            },
            {
              step: '02',
              title: 'Parse & Embed Locally',
              description: 'Your document is read and converted into searchable meaning right in your browser.',
              icon: <Cpu size={16} />
            },
            {
              step: '03',
              title: 'Ask',
              description: 'Type a question or just talk. DocMind finds the relevant parts of your document.',
              icon: <Mic size={16} />
            },
            {
              step: '04',
              title: 'Get a Cited Answer',
              description: 'Every answer points back to the exact page or slide it came from.',
              icon: <Quote size={16} />
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="reveal-on-scroll opacity-0 translate-y-12 transition-all duration-700 border border-sand-dark/75 hover:border-terracotta/40 bg-[#12100e]/20 p-6 rounded-2xl flex flex-col justify-between h-56 transition-all duration-300 group shadow-xs"
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold text-terracotta">{item.step}</span>
                <div className="p-2 rounded-lg bg-sand-dark/45 border border-white/5 text-ink-dark/40 group-hover:text-terracotta group-hover:border-terracotta/20 transition-colors">
                  {item.icon}
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="font-serif text-sm font-bold text-ink-dark">{item.title}</h4>
                <p className="text-[11px] text-ink-dark/50 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28 border-t border-sand-dark/40">
        <div className="reveal-on-scroll opacity-0 translate-y-12 transition-all duration-700 space-y-4 max-w-2xl text-left mb-16">
          <p className="text-[10px] font-extrabold font-mono tracking-widest text-terracotta uppercase">Specifications</p>
          <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink-dark">
            Complete local document intelligence.
          </h3>
          <p className="text-xs sm:text-sm text-ink-dark/50 leading-relaxed">
            DocMind is configured with components to serve as a fast, reliable, private research workbench.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Multi-format support',
              description: 'Works with PDF, DOCX, and PPTX — upload one or several at once.',
              icon: <Layers size={15} />
            },
            {
              title: 'Voice assistant',
              description: 'Ask out loud and hear the answer back, with live transcription as you speak.',
              icon: <Volume2 size={15} />
            },
            {
              title: 'Source citations',
              description: 'Click any citation in a response to preview the exact excerpt it came from.',
              icon: <Quote size={15} />
            },
            {
              title: '100% local storage',
              description: "Documents are parsed and stored on your device using your browser's local storage — never uploaded to a server or third-party database.",
              icon: <HardDrive size={15} />
            },
            {
              title: 'Persistent library',
              description: "Your documents stay available across sessions, so you don't have to re-upload every time.",
              icon: <BookOpen size={15} />
            },
            {
              title: 'Fast streaming answers',
              description: 'Powered by Llama 3.1 on Groq for near-instant, token-by-token responses.',
              icon: <Cpu size={15} />
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="reveal-on-scroll opacity-0 translate-y-12 transition-all duration-700 border border-sand-dark/75 hover:border-terracotta/35 bg-[#12100e]/30 backdrop-blur-xs p-6 rounded-2xl space-y-4 hover:scale-[1.01] transition-all duration-200 group shadow-xs"
              style={{ transitionDelay: `${(idx % 3) * 100}ms` }}
            >
              <div className="p-2.5 w-10 h-10 rounded-xl bg-sand-dark/45 border border-white/5 text-terracotta flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-sm font-bold text-ink-dark">{item.title}</h4>
                <p className="text-xs text-ink-dark/50 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy / Local-First Section (Dedicated) */}
      <section id="privacy" className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28 border-t border-sand-dark/40">
        <div className="reveal-on-scroll opacity-0 translate-y-12 transition-all duration-700 border border-forest/15 bg-forest/5 rounded-3xl p-8 md:p-12 relative overflow-hidden secure-scan max-w-5xl mx-auto shadow-lg">
          {/* Subtle tech coordinates */}
          <span className="absolute top-4 right-6 font-mono text-[9px] text-ink-dark/20 uppercase tracking-widest hidden sm:inline">
            SECURE BOUNDARY // LAT-00.419
          </span>

          <div className="max-w-3xl space-y-6 relative z-10 text-left">
            <div className="flex items-center gap-2 text-forest-light dark:text-emerald-500 font-mono text-[10px] font-extrabold tracking-widest uppercase">
              <Shield size={14} />
              Privacy Protocol Active
            </div>
            
            <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink-dark">
              Your documents never leave your browser.
            </h3>
            
            <p className="text-xs sm:text-sm text-ink-dark/75 leading-relaxed">
              Most document Q&A tools upload your files to a server and store them in a cloud database. DocMind doesn't. Parsing, embedding, and search all happen locally in your browser using IndexedDB. The only thing that leaves your device is the specific question you ask and the small snippet of text needed to answer it — never the full document, never stored anywhere but here.
            </p>

            <div className="pt-2">
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 px-5 py-3 bg-terracotta hover:bg-terracotta-dark text-white rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-colors"
              >
                Launch Sandbox
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="about" className="relative z-10 border-t border-sand-dark/50 bg-[#070605] px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Tagline / Logo */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-terracotta text-white">
                <Sparkles size={14} />
              </div>
              <span className="font-serif text-base font-extrabold text-ink-dark">DocMind</span>
            </div>
            <p className="text-xs text-ink-dark/45 font-serif italic max-w-xs">
              Local-first document intelligence.
            </p>
            <div className="text-[10px] font-mono text-ink-dark/30 pt-4 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} DocMind. All rights preserved.
            </div>
          </div>

          {/* Columns */}
          <div className="md:col-span-4 grid grid-cols-2 gap-8 text-left">
            <div className="space-y-3">
              <h5 className="font-mono text-[9px] uppercase tracking-wider text-ink-dark/45">Routine Map</h5>
              <ul className="space-y-2 text-xs text-ink-dark/60 font-mono">
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-terracotta cursor-pointer">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-terracotta cursor-pointer">
                    How it works
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h5 className="font-mono text-[9px] uppercase tracking-wider text-ink-dark/45">Boundary</h5>
              <ul className="space-y-2 text-xs text-ink-dark/60 font-mono">
                <li>
                  <button onClick={() => scrollToSection('privacy')} className="hover:text-terracotta cursor-pointer">
                    Privacy
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('about')} className="hover:text-terracotta cursor-pointer">
                    About
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Socials & Credits */}
          <div className="md:col-span-3 space-y-4 text-left md:text-right">
            <div className="space-y-1">
              <h5 className="font-mono text-[9px] uppercase tracking-wider text-ink-dark/45">Developed By</h5>
              <div className="font-mono text-xs font-bold text-terracotta tracking-widest uppercase">
                Aashuraj S
              </div>
            </div>

            <div className="flex items-center justify-start md:justify-end gap-3 text-ink-dark/40 pt-2">
              <a
                href="#"
                className="p-2 rounded-lg bg-sand-dark/45 hover:text-ink-dark border border-white/5 hover:border-terracotta/20 transition-all flex items-center justify-center"
                title="GitHub Repository"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-sand-dark/45 hover:text-ink-dark border border-white/5 hover:border-terracotta/20 transition-all flex items-center justify-center"
                title="LinkedIn Profile"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-sand-dark/45 hover:text-ink-dark border border-white/5 hover:border-terracotta/20 transition-all flex items-center justify-center"
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
