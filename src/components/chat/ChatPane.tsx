'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, Sparkles, BookOpen, Quote, ShieldAlert, AlertTriangle, Cpu, Terminal } from 'lucide-react';
import { getEmbedding } from '@/lib/embeddings';
import { localVectorSearch, db, type ChunkRecord } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  retrievedChunks?: (ChunkRecord & { documentName: string })[]; // Store sources used
}

interface ChatPaneProps {
  selectedDocIds: string[];
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isThinking: boolean;
  setIsThinking: (thinking: boolean) => void;
  voiceModeEnabled: boolean;
  setSpeakTextTrigger: (text: string) => void;
  onSelectCitation: (chunk: ChunkRecord & { documentName: string }) => void;
  voiceTranscript: string;
}

export default function ChatPane({
  selectedDocIds,
  messages,
  setMessages,
  isThinking,
  setIsThinking,
  voiceModeEnabled,
  setSpeakTextTrigger,
  onSelectCitation,
  voiceTranscript,
}: ChatPaneProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Live query all documents to translate docId -> docName for citations
  const documents = useLiveQuery(() => db.documents.toArray(), []);

  // Sync transcription from VoiceOrb into input
  useEffect(() => {
    if (voiceTranscript) {
      if (voiceTranscript === 'Transcribing audio...') {
        setInput('Transcribing audio...');
      } else {
        setInput(voiceTranscript);
        // Automatically submit voice transcript after a brief pause
        setTimeout(() => {
          submitQuery(voiceTranscript);
        }, 300);
      }
    }
  }, [voiceTranscript]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const submitQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || trimmed === 'Transcribing audio...') return;

    setInput('');
    setIsThinking(true);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // 1. Generate local query embedding
      const queryEmbedding = await getEmbedding(trimmed);

      // 2. Query IndexedDB for top-K matching chunks
      const searchResults = await localVectorSearch(queryEmbedding, selectedDocIds, 5);
      
      // Map results with document names
      const contextChunks = searchResults.map((res) => {
        const doc = documents?.find((d) => d.id === res.chunk.documentId);
        return {
          ...res.chunk,
          documentName: doc?.customName || doc?.name || 'Unknown Document',
        };
      });

      // 3. Prepare assistant placeholder
      const assistantMessageId = crypto.randomUUID();
      const assistantMessagePlaceholder: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        retrievedChunks: contextChunks,
      };

      setMessages((prev) => [...prev, assistantMessagePlaceholder]);

      // 4. Stream response from Groq API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: contextChunks,
        }),
      });

      if (!response.ok) {
        let errMsg = 'Failed to fetch streaming response';
        try {
          const errorData = await response.json();
          errMsg = errorData.error || errMsg;
        } catch {
          try {
            const rawText = await response.text();
            if (rawText) {
              // Strip HTML tags to keep the error message clean in the chat console
              errMsg = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150);
            }
          } catch {}
        }
        throw new Error(errMsg);
      }

      // 5. Decode Edge stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let completedText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          completedText += chunk;
          
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: completedText } : msg
            )
          );
        }
      }

      setIsThinking(false);

      // If voice mode is on, read it back
      if (voiceModeEnabled && completedText) {
        setSpeakTextTrigger(completedText);
      }
    } catch (err: any) {
      console.error('Chat API Error:', err);
      setIsThinking(false);
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ **Error Processing Request**: ${err.message || 'Check your internet connection or verify your Groq API key configuration.'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitQuery(input);
    }
  };

  const clearChat = () => {
    if (confirm('Clear chat history?')) {
      setMessages([]);
    }
  };

  // Render text containing inline source citations [Page X] or [Slide X] as interactive buttons
  const renderMessageContent = (message: ChatMessage) => {
    const { content, retrievedChunks } = message;
    if (message.role === 'user') {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    // Regex to capture [Page X] or [Slide X] or [Document]
    const regex = /(\[Page \d+\]|\[Slide \d+\]|\[Document\])/g;
    const parts = content.split(regex);

    if (parts.length === 1) {
      return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
    }

    return (
      <p className="whitespace-pre-wrap leading-relaxed">
        {parts.map((part, index) => {
          const isCitation = regex.test(part);
          if (!isCitation) {
            return <React.Fragment key={index}>{part}</React.Fragment>;
          }

          // Extract identifier values
          const isPage = part.toLowerCase().includes('page');
          const isSlide = part.toLowerCase().includes('slide');
          const pageNum = isPage ? parseInt(part.replace(/\D/g, ''), 10) : undefined;
          const slideNum = isSlide ? parseInt(part.replace(/\D/g, ''), 10) : undefined;

          // Find corresponding chunk in retrieved contexts
          const matchedChunk = retrievedChunks?.find((c) => {
            if (pageNum !== undefined) return c.pageNumber === pageNum;
            if (slideNum !== undefined) return c.slideNumber === slideNum;
            return c.pageNumber === undefined && c.slideNumber === undefined; // fallback default
          });

          return (
            <button
              key={index}
              onClick={() => matchedChunk && onSelectCitation(matchedChunk)}
              disabled={!matchedChunk}
              className={`inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded text-xs font-semibold font-sans transition-all-custom border cursor-pointer ${
                matchedChunk
                  ? 'bg-terracotta/10 text-terracotta border-terracotta/25 hover:bg-terracotta/20 hover:border-terracotta/35 dark:bg-terracotta/20 dark:text-terracotta-light'
                  : 'bg-sand/30 text-ink-light/40 border-sand-muted/50 dark:bg-sand-dark dark:text-ink-dark/40 cursor-default'
              }`}
              title={matchedChunk ? `Context from ${matchedChunk.documentName}` : 'Citation details unavailable'}
            >
              <Quote size={10} className="shrink-0" />
              {part.replace('[', '').replace(']', '')}
            </button>
          );
        })}
      </p>
    );
  };

  // Helper description of current context
  const getContextLabel = () => {
    if (!documents) return 'Loading...';
    if (selectedDocIds.length === 0) return 'All Documents';
    if (selectedDocIds.length === 1) {
      const doc = documents.find((d) => d.id === selectedDocIds[0]);
      return doc ? doc.customName || doc.name : '1 selected';
    }
    return `${selectedDocIds.length} Selected Documents`;
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Active Context Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-sand-muted/40 dark:border-sand-dark/60 bg-white/40 dark:bg-sand-dark/10 backdrop-blur-xs relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-terracotta/10 text-terracotta border border-terracotta/15">
            <BookOpen size={14} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-ink-light/40 dark:text-ink-dark/40 font-mono">
              Query Context
            </p>
            <p className="text-xs font-serif font-semibold text-ink-light dark:text-ink-dark truncate max-w-sm">
              {getContextLabel()}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold text-terracotta hover:bg-terracotta/10 rounded-xl transition-all-custom border border-transparent hover:border-terracotta/25 uppercase font-mono tracking-wider cursor-pointer"
          >
            <RefreshCw size={11} />
            Reset Console
          </button>
        )}
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-sand-dark flex items-center justify-center text-terracotta shadow-md border border-sand-muted/30 dark:border-white/5 relative group">
              <div className="absolute inset-0 rounded-2xl bg-terracotta/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Cpu size={24} className="relative z-10" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-extrabold text-ink-light dark:text-ink-dark tracking-tight">
                Ask DocMind anything
              </h2>
              <p className="text-xs text-ink-light/50 dark:text-ink-dark/50 mt-2 leading-relaxed">
                Select your source documents from the library, then type your question or use the voice mode. The assistant answers questions using only the uploaded local content, with precise citations.
              </p>
            </div>
            {selectedDocIds.length === 0 && documents && documents.length > 0 && (
              <div className="p-3.5 border border-amber-500/20 bg-amber-500/5 rounded-xl text-left flex items-start gap-2.5 shadow-sm max-w-xs">
                <AlertTriangle size={15} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 dark:text-amber-400 leading-normal">
                  <span className="font-semibold">Notice:</span> No specific documents selected. DocMind will query across the entire library.
                </p>
              </div>
            )}
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4.5 py-3.5 shadow-xs text-sm leading-relaxed border transition-all-custom ${
                    isUser
                      ? 'bg-forest text-white border-forest dark:bg-sand-dark dark:border-sand-dark dark:text-ink-dark shadow-sm'
                      : 'bg-white/70 dark:bg-sand-dark/40 border-sand-muted/50 dark:border-white/5 text-ink-light dark:text-ink-dark shadow-xs backdrop-blur-xs'
                  }`}
                >
                  <p className="text-[8px] uppercase font-bold tracking-widest opacity-40 font-mono mb-1.5">
                    {isUser ? 'User Core' : 'DocMind Agent'}
                  </p>
                  
                  {renderMessageContent(message)}
                </div>
              </div>
            );
          })
        )}

        {isThinking && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white/60 dark:bg-sand-dark/30 border border-sand-muted/40 dark:border-white/5 rounded-2xl px-4.5 py-3.5 text-sm flex items-center space-x-3 shadow-xs">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[10px] text-ink-light/50 dark:text-ink-dark/50 font-mono flex items-center gap-1.5">
                <Terminal size={11} className="text-terracotta" />
                Retrieving local context...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input panel (Glassmorphic) */}
      <div className="p-4 border-t border-sand-muted/40 dark:border-sand-dark/60 bg-white/40 dark:bg-paper-dark/30 backdrop-blur-md relative z-10">
        <div className="relative flex items-end border border-sand-muted/50 focus-within:border-terracotta/70 dark:border-sand-dark dark:focus-within:border-terracotta/50 rounded-2xl p-2.5 bg-white/50 dark:bg-sand-dark/20 transition-all duration-200 shadow-sm">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking || input === 'Transcribing audio...'}
            placeholder={
              selectedDocIds.length === 0 && documents?.length === 0
                ? 'Upload documents in the library first...'
                : 'Ask a question about your documents...'
            }
            className="flex-1 resize-none bg-transparent outline-none max-h-28 py-1.5 px-2 text-sm text-ink-light dark:text-ink-dark font-sans placeholder-ink-light/40 dark:placeholder-ink-dark/40"
          />
          
          <button
            onClick={() => submitQuery(input)}
            disabled={!input.trim() || isThinking || input === 'Transcribing audio...'}
            className="p-2.5 bg-terracotta hover:bg-terracotta-dark text-white rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:hover:bg-terracotta shadow-md shadow-terracotta/15 disabled:shadow-none"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
