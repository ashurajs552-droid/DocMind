'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, VolumeX, Settings, Disc, Sparkles, Sliders } from 'lucide-react';

interface VoiceOrbProps {
  onTranscript: (text: string) => void;
  isThinking: boolean;
  voiceModeEnabled: boolean;
  onToggleVoiceMode: (enabled: boolean) => void;
  speakTextTrigger?: string; // Parent sets this to trigger speech
}

export default function VoiceOrb({
  onTranscript,
  isThinking,
  voiceModeEnabled,
  onToggleVoiceMode,
  speakTextTrigger,
}: VoiceOrbProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [useWhisper, setUseWhisper] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Speech Synthesis Settings
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);

  // Audio Recording (Whisper) refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Web Speech Recognition ref
  const recognitionRef = useRef<any>(null);

  // TTS Ref
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load SpeechSynthesis voices client-side
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices.filter(v => v.lang.startsWith('en')));
      
      const defaultVoice = 
        allVoices.find(v => v.name.includes('Google US English')) ||
        allVoices.find(v => v.name.includes('Samantha')) ||
        allVoices.find(v => v.name.includes('Daniel')) ||
        allVoices.find(v => v.lang.startsWith('en'));
      
      if (defaultVoice) {
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Web Speech Recognition Initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          onTranscript(text);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [onTranscript]);

  // Handle TTS trigger from parent
  useEffect(() => {
    if (voiceModeEnabled && speakTextTrigger && typeof window !== 'undefined') {
      speak(speakTextTrigger);
    }
  }, [speakTextTrigger, voiceModeEnabled]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // TTS implementation
  const speak = (text: string) => {
    if (typeof window === 'undefined') return;

    window.speechSynthesis.cancel();

    // Strip citations like [Page X], [Slide X] or [Document]
    const cleanText = text
      .replace(/\[Page \d+\]/gi, '')
      .replace(/\[Slide \d+\]/gi, '')
      .replace(/\[Document\]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voiceObj = voices.find(v => v.name === selectedVoice);
    if (voiceObj) {
      utterance.voice = voiceObj;
    }
    
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Start listening (STT)
  const startListening = async () => {
    if (typeof window === 'undefined') return;
    stopSpeaking();

    if (useWhisper) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach((track) => track.stop());
          
          await transcribeAudioWithWhisper(audioBlob);
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error opening microphone:', err);
        alert('Could not access microphone. Please check permissions.');
      }
    } else {
      if (!recognitionRef.current) {
        alert('Web Speech Recognition is not supported in this browser. Please try Chrome/Safari or enable Groq Whisper mode.');
        return;
      }
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  // Stop listening
  const stopListening = () => {
    if (useWhisper) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    }
  };

  // Whisper API call handler
  const transcribeAudioWithWhisper = async (blob: Blob) => {
    try {
      setIsListening(false);
      onTranscript('Transcribing audio...');
      
      const formData = new FormData();
      formData.append('file', blob);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Whisper transcription failed');
      }

      const result = await response.json();
      if (result.text) {
        onTranscript(result.text);
      } else {
        onTranscript('');
      }
    } catch (err) {
      console.error('Whisper transcribe error:', err);
      onTranscript('');
      alert('Error during Whisper transcription fallback.');
    }
  };

  const handleToggleVoiceMode = () => {
    const nextState = !voiceModeEnabled;
    onToggleVoiceMode(nextState);
    if (!nextState) {
      stopSpeaking();
      stopListening();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 border border-sand-muted/40 dark:border-white/5 rounded-2xl p-4 bg-white/20 dark:bg-sand-dark/10 backdrop-blur-xs transition-all duration-300">
      {/* Upper Controls */}
      <div className="w-full flex items-center justify-between">
        <button
          onClick={handleToggleVoiceMode}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-extrabold font-mono tracking-widest transition-all duration-200 border cursor-pointer ${
            voiceModeEnabled
              ? 'bg-terracotta text-white border-terracotta hover:bg-terracotta-dark shadow-sm shadow-terracotta/25'
              : 'border-sand-muted/50 hover:border-terracotta/40 text-ink-light/50 hover:text-ink-light dark:text-ink-dark/50 dark:hover:text-ink-dark bg-white/30 dark:bg-sand-dark/20'
          }`}
        >
          {voiceModeEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          {voiceModeEnabled ? 'VOICE CONSOLE: ENABLED' : 'VOICE CONSOLE: MUTED'}
        </button>

        <div className="flex items-center gap-2">
          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
              showSettings
                ? 'border-terracotta text-terracotta bg-terracotta/5'
                : 'border-sand-muted/50 hover:border-terracotta/40 text-ink-light/40 hover:text-ink-light dark:text-ink-dark/40 dark:hover:text-ink-dark bg-white/30 dark:bg-sand-dark/20'
            }`}
            title="Console Settings"
          >
            <Settings size={13} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="w-full border-t border-dashed border-sand-muted/40 dark:border-sand-dark/60 pt-3.5 mt-1.5 space-y-3.5 text-xs animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ink-light/75 dark:text-ink-dark/75 flex items-center gap-2 font-mono text-[10px] tracking-wide">
              <Sparkles size={11} className="text-terracotta" />
              HIGH ACCURACY fallback (Whisper API)
            </span>
            <button
              onClick={() => setUseWhisper(!useWhisper)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                useWhisper ? 'bg-forest' : 'bg-sand-muted/80 dark:bg-sand-dark'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                  useWhisper ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[9px] uppercase tracking-wider text-ink-light/50 dark:text-ink-dark/50">Speech Voice</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full bg-white dark:bg-sand-dark border border-sand-muted/40 rounded-xl px-3 py-1.5 outline-none text-xs text-ink-light dark:text-ink-dark shadow-inner"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name.replace('Microsoft', '').replace('Google', '').trim()} ({v.lang})
                </option>
              ))}
              {voices.length === 0 && <option>Default System Voice</option>}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[9px] text-ink-light/50 dark:text-ink-dark/50">
                <span>SPEED</span>
                <span>{speechRate}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-terracotta cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[9px] text-ink-light/50 dark:text-ink-dark/50">
                <span>PITCH</span>
                <span>{speechPitch}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={speechPitch}
                onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                className="w-full accent-terracotta cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Orb */}
      {voiceModeEnabled && (
        <div className="flex flex-col items-center justify-center py-2.5 w-full animate-fade-in">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Ambient Background Aura */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-700 blur-xl opacity-50 ${
                isListening
                  ? 'bg-terracotta animate-orb-pulse scale-110'
                  : isSpeaking
                  ? 'bg-forest animate-orb-pulse scale-105'
                  : isThinking
                  ? 'bg-amber-500 animate-pulse scale-100'
                  : 'bg-sand/20 dark:bg-sand-dark/20 scale-90'
              }`}
            />

            {/* Futuristic Orbiting radar ring (Idle/active) */}
            <div
              className={`absolute inset-1 rounded-full border border-dashed transition-all duration-500 pointer-events-none ${
                isListening
                  ? 'border-terracotta/40 scale-105 animate-orbit-slow'
                  : isSpeaking
                  ? 'border-forest/40 scale-105 animate-orbit-slow'
                  : 'border-sand-muted/30 dark:border-white/10 animate-orbit-slow'
              }`}
            />

            {/* Central Glowing Core Orb */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-lg cursor-pointer ${
                isListening
                  ? 'bg-terracotta text-white border-2 border-white/30 scale-95 hover:scale-100 shadow-terracotta/30'
                  : isSpeaking
                  ? 'bg-forest text-white border-2 border-white/20 shadow-forest/30 hover:scale-105'
                  : isThinking
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-white dark:bg-sand-dark border border-sand-muted/50 dark:border-white/10 text-terracotta hover:border-terracotta hover:scale-105 hover:shadow-terracotta/15'
              }`}
            >
              {isListening ? (
                <Disc size={26} className="animate-spin" />
              ) : isSpeaking ? (
                <Volume2 size={26} className="animate-bounce" />
              ) : (
                <Mic size={26} />
              )}
            </button>
          </div>

          {/* Text Status & Feedback */}
          <div className="mt-3 text-center">
            <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-ink-light/50 dark:text-ink-dark/50">
              {isListening
                ? 'LISTENING... TAP TO STOP'
                : isSpeaking
                ? 'SPEAKING RESPONSE'
                : isThinking
                ? 'PROCESS ROUTINE ACTIVE'
                : 'TAP TO INITIATE VOICE'}
            </p>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="text-[9px] text-terracotta hover:underline mt-1 font-mono uppercase font-bold tracking-widest cursor-pointer"
              >
                Interrupt Audio Playback
              </button>
            )}
          </div>

          {/* Custom Animated Waveform (Speaking mode) */}
          {isSpeaking && (
            <div className="flex items-center gap-0.5 mt-3 h-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((bar) => {
                const animationDelay = `${bar * 0.12}s`;
                return (
                  <div
                    key={bar}
                    className="w-0.5 bg-forest dark:bg-emerald-500 rounded-full h-full transform origin-center animate-waveform"
                    style={{ animationDelay }}
                  />
                );
              })}
            </div>
          )}

          {/* Listening Pulsing visual lines */}
          {isListening && (
            <div className="flex items-center justify-center gap-1.5 mt-3 text-[9px] font-mono font-bold uppercase tracking-wider text-terracotta">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
              <span>Mic Active ({useWhisper ? 'Whisper' : 'SpeechAPI'})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
