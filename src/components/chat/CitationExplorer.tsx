'use client';

import React from 'react';
import { FileText, X, Quote, Calendar, Bookmark, Info } from 'lucide-react';
import { type ChunkRecord } from '@/lib/db';

interface CitationExplorerProps {
  activeChunk: (ChunkRecord & { documentName: string }) | null;
  onClose: () => void;
}

export default function CitationExplorer({ activeChunk, onClose }: CitationExplorerProps) {
  if (!activeChunk) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 border-l border-sand-muted dark:border-sand-dark bg-sand-light/10 dark:bg-sand-dark/5">
        <div className="p-3 rounded-full bg-sand dark:bg-sand-dark text-ink-light/20 dark:text-ink-dark/20 mb-3">
          <Quote size={24} />
        </div>
        <h4 className="font-serif text-sm font-semibold text-ink-light/75 dark:text-ink-dark/75">
          Source Citation Explorer
        </h4>
        <p className="text-[11px] text-ink-light/50 dark:text-ink-dark/50 mt-1 max-w-[15rem] leading-relaxed">
          Click on any page or slide citation badge inside the chat history to preview the exact source text excerpt here.
        </p>
      </div>
    );
  }

  const { content, pageNumber, slideNumber, documentName } = activeChunk;
  const isPage = pageNumber !== undefined;
  const isSlide = slideNumber !== undefined;

  return (
    <div className="h-full flex flex-col border-l border-sand-muted dark:border-sand-dark bg-white dark:bg-paper-dark animate-fade-in">
      {/* Explorer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-sand-muted dark:border-sand-dark bg-sand-light/20 dark:bg-sand-dark/10">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-primary/10 text-primary">
            <FileText size={15} />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-ink-light dark:text-ink-dark">
              Source Excerpt
            </h4>
            <p className="text-[10px] text-ink-light/50 dark:text-ink-dark/50 font-mono">
              Citation Verification
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-sand-muted dark:hover:bg-sand-dark text-ink-light/40 hover:text-ink-light dark:text-ink-dark/40 dark:hover:text-ink-dark transition-theme cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Excerpt Details Panel */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Document metadata block */}
        <div className="space-y-2.5 p-3 rounded-lg border border-sand-muted dark:border-sand-dark bg-sand-light/10 dark:bg-sand-dark/10">
          <div className="flex items-start gap-2">
            <Bookmark size={14} className="text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5 min-w-0">
              <p className="text-[10px] uppercase font-bold tracking-widest text-ink-light/40 dark:text-ink-dark/40 font-mono">
                Source Document
              </p>
              <p className="text-xs font-semibold text-ink-light dark:text-ink-dark truncate">
                {documentName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-ink-light/50 dark:text-ink-dark/50 pt-2 border-t border-sand-muted/50 dark:border-sand-dark/50 font-mono">
            <div>
              <span className="font-semibold text-ink-light/70 dark:text-ink-dark/75">Reference:</span>{' '}
              {isPage ? `Page ${pageNumber}` : isSlide ? `Slide ${slideNumber}` : 'Full Text'}
            </div>
            <div>
              <span className="font-semibold text-ink-light/70 dark:text-ink-dark/75">Location:</span>{' '}
              Chunk #{activeChunk.chunkIndex + 1}
            </div>
          </div>
        </div>

        {/* Text Excerpt Block */}
        <div className="relative">
          <Quote
            size={36}
            className="absolute -top-3.5 -left-2 text-sand-muted/40 dark:text-sand-dark/40 transform -scale-x-100 pointer-events-none"
          />
          <div className="pl-6 border-l-2 border-primary/35">
            <p className="font-serif text-sm text-ink-light/95 dark:text-ink-dark/95 leading-relaxed italic whitespace-pre-wrap select-text">
              {content}
            </p>
          </div>
        </div>

        {/* Note on RAG authenticity */}
        <div className="p-3 border border-secondary/15 bg-secondary/5 rounded-lg flex items-start gap-2 text-[10px] text-secondary-dark dark:text-secondary-light dark:text-ink-dark/60 leading-normal">
          <Info size={14} className="shrink-0 text-secondary mt-0.5" />
          <p>
            This exact text was pulled from your local browser database and injected into the Groq Llama LLM system prompt to ensure the response remains grounded and verified.
          </p>
        </div>
      </div>
    </div>
  );
}
