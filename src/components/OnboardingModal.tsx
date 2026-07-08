'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, GraduationCap, School, Shield, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: (name: string, role: string) => void;
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function OnboardingModal({ onComplete, forceOpen = false, onClose }: OnboardingModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'personal'>('personal');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('docmind_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setName(parsed.name || '');
        setRole(parsed.role || 'personal');
      }
      if (!stored && !forceOpen) {
        setIsOpen(true);
      }
    }
  }, [forceOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const userData = { name: name.trim(), role };
    localStorage.setItem('docmind_user', JSON.stringify(userData));
    setIsOpen(false);
    onComplete(userData.name, userData.role);
    if (onClose) onClose();
  };

  const shouldShow = isOpen || forceOpen;

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white/95 dark:bg-[#0c0f16]/95 border border-sand-muted/30 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center backdrop-blur-xl transition-all duration-300">
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-primary via-accent-violet to-accent-cyan rounded-full" />

        {/* Header Icon */}
        <div className="flex justify-center">
          <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shadow-inner">
            <Sparkles size={24} className="animate-pulse" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-ink-light dark:text-ink-dark">
            Welcome to DocMind
          </h2>
          <p className="text-xs text-ink-light/50 dark:text-ink-dark/50 max-w-xs mx-auto">
            Let's personalize your secure, offline-first document sandbox.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-light/60 dark:text-ink-dark/50">
              Your Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Aashuraj S"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-sand-light/30 dark:bg-sand-dark/25 border border-sand-muted/40 dark:border-white/5 rounded-xl px-4 py-3 outline-none text-xs text-ink-light dark:text-ink-dark focus:border-primary dark:focus:border-primary transition-colors font-medium shadow-inner"
            />
          </div>

          {/* Role Cards Selector */}
          <div className="space-y-2">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-light/60 dark:text-ink-dark/50">
              Primary Role
            </label>
            
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: 'student' as const,
                  label: 'Student',
                  icon: <GraduationCap size={16} />,
                },
                {
                  id: 'teacher' as const,
                  label: 'Teacher',
                  icon: <School size={16} />,
                },
                {
                  id: 'personal' as const,
                  label: 'Personal',
                  icon: <Shield size={16} />,
                },
              ].map((r) => {
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary scale-[1.03] shadow-md shadow-primary/5'
                        : 'border-sand-muted/20 dark:border-white/5 bg-sand-light/20 dark:bg-sand-dark/10 hover:border-primary/45 text-ink-light/60 dark:text-ink-dark/65'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg mb-1.5 ${isSelected ? 'bg-primary/15' : 'bg-sand/30 dark:bg-sand-dark/40'}`}>
                      {r.icon}
                    </div>
                    <span className="text-[10px] font-bold font-sans uppercase tracking-wider">
                      {r.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white hover:bg-primary-dark rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all duration-300 shadow-md shadow-primary/15 hover:shadow-primary/25 cursor-pointer mt-4"
          >
            Enter Sandbox
            <ArrowRight size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}
