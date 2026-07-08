'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { parseFile, type ParseResult } from '@/lib/parsing';
import { getEmbeddingsBatch, getEmbeddingPipeline } from '@/lib/embeddings';
import { db } from '@/lib/db';

interface FileProgress {
  id: string;
  name: string;
  size: number;
  stage: 'pending' | 'parsing' | 'downloading-model' | 'embedding' | 'storing' | 'ready' | 'error';
  progress: number; // 0 - 100
  detail: string;
  error?: string;
}

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

export default function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<FileProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const updateFileProgress = (id: string, updates: Partial<FileProgress>) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const processFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ext === 'pdf' || ext === 'docx' || ext === 'pptx';
    });

    if (validFiles.length === 0) return;

    const newItems = validFiles.map((file) => ({
      id: `${file.name}-${Date.now()}`,
      name: file.name,
      size: file.size,
      stage: 'pending' as const,
      progress: 0,
      detail: 'In Queue...',
    }));

    setQueue((prev) => [...newItems, ...prev]);

    for (const item of newItems) {
      const file = files.find((f) => f.name === item.name);
      if (!file) continue;

      try {
        // Step 1: Parsing
        updateFileProgress(item.id, { stage: 'parsing', progress: 10, detail: 'Deconstructing document...' });
        const parseResult = await parseFile(file, (stage, percent) => {
          updateFileProgress(item.id, {
            progress: Math.round(percent * 0.4),
            detail: `${stage} (${percent}%)`,
          });
        });

        if (parseResult.chunks.length === 0) {
          throw new Error('Document seems to contain no readable text.');
        }

        // Step 2: Load Embedding Model (handles initial download)
        updateFileProgress(item.id, {
          stage: 'downloading-model',
          progress: 40,
          detail: 'Retrieving model weights...',
        });

        await getEmbeddingPipeline((data) => {
          if (data.status === 'downloading') {
            const pct = data.progress ? Math.round(data.progress) : 0;
            updateFileProgress(item.id, {
              progress: 40 + Math.round(pct * 0.15),
              detail: `DL Model: ${Math.round(data.loaded! / 1024 / 1024)}MB / ${Math.round(data.total! / 1024 / 1024)}MB`,
            });
          } else if (data.status === 'done') {
            updateFileProgress(item.id, {
              progress: 55,
              detail: 'Model weights active. Generating tokens...',
            });
          }
        });

        // Step 3: Embed text chunks
        updateFileProgress(item.id, {
          stage: 'embedding',
          progress: 55,
          detail: `Vectorizing (0/${parseResult.chunks.length} chunks)...`,
        });

        const chunkTexts = parseResult.chunks.map((c) => c.content);
        const embeddings = await getEmbeddingsBatch(chunkTexts, (current, total) => {
          const embedProgress = Math.round((current / total) * 35);
          updateFileProgress(item.id, {
            progress: 55 + embedProgress,
            detail: `Index vectors: ${current}/${total}`,
          });
        });

        // Step 4: Storing in IndexedDB
        updateFileProgress(item.id, {
          stage: 'storing',
          progress: 90,
          detail: 'Committing to sandboxed IndexedDB...',
        });

        const docId = crypto.randomUUID();
        const docRecord = {
          id: docId,
          name: file.name,
          type: file.name.split('.').pop()?.toLowerCase() as 'pdf' | 'docx' | 'pptx',
          uploadDate: Date.now(),
          totalPages: parseResult.totalPages,
          totalSlides: parseResult.totalSlides,
          fileSize: file.size,
        };

        const chunkRecords = parseResult.chunks.map((chunk, idx) => ({
          documentId: docId,
          content: chunk.content,
          pageNumber: chunk.pageNumber,
          slideNumber: chunk.slideNumber,
          chunkIndex: chunk.chunkIndex,
          embedding: embeddings[idx],
        }));

        await db.transaction('rw', [db.documents, db.chunks], async () => {
          await db.documents.put(docRecord);
          await db.chunks.bulkPut(chunkRecords);
        });

        updateFileProgress(item.id, {
          stage: 'ready',
          progress: 100,
          detail: `Ready! ${parseResult.chunks.length} index nodes created.`,
        });

        if (onUploadComplete) {
          onUploadComplete();
        }
      } catch (err: any) {
        console.error('File parsing failed:', err);
        updateFileProgress(item.id, {
          stage: 'error',
          progress: 0,
          detail: 'Routine failed',
          error: err.message || 'Unknown processing error',
        });
      }
    }
  };

  const getStageColor = (stage: FileProgress['stage']) => {
    switch (stage) {
      case 'ready':
        return 'text-emerald-600 border-emerald-500/20 bg-emerald-500/5 dark:text-emerald-400';
      case 'error':
        return 'text-accent-rose border-accent-rose/25 bg-accent-rose/5';
      default:
        return 'text-ink-light/80 border-sand-muted bg-white/20 dark:bg-sand-dark/10 dark:border-white/5';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-5">
      {/* Upload Zone (Glassmorphic & Animated Border on hover) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative border border-dashed rounded-2xl p-6.5 text-center cursor-pointer transition-all duration-300 group glass-panel ${
          isDragging
            ? 'border-primary bg-primary/5 scale-[0.99] shadow-inner'
            : 'border-sand-muted/50 hover:border-primary hover:scale-[1.01] hover:shadow-md hover:shadow-primary/5'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.pptx"
          multiple
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-3 relative z-10">
          <div className="p-3.5 rounded-xl bg-sand/50 dark:bg-sand-dark/65 text-primary group-hover:scale-105 transition-transform duration-300 shadow-sm border border-sand-muted/20 dark:border-white/5">
            <Upload size={20} />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-ink-light dark:text-ink-dark">
              Import Source Files
            </h3>
            <p className="text-[10px] text-ink-light/50 dark:text-ink-dark/50 mt-1 max-w-[15rem] mx-auto leading-relaxed">
              Drag & drop files or click to browse. Supports <span className="font-bold text-primary">PDF, DOCX,</span> and <span className="font-bold text-primary">PPTX</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Queue Progress */}
      {queue.length > 0 && (
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-[9px] font-extrabold text-ink-light/40 dark:text-ink-dark/40 uppercase tracking-widest font-mono">
            <span>Core Routines</span>
            <span>{queue.filter((q) => q.stage === 'ready').length}/{queue.length} Active</span>
          </div>

          <div className="space-y-2">
            {queue.map((item) => (
              <div
                key={item.id}
                className={`border rounded-xl p-3 transition-all-custom flex items-start space-x-3 text-xs backdrop-blur-xs ${getStageColor(
                  item.stage
                )}`}
              >
                <div className="mt-0.5 text-primary shrink-0">
                  <FileText size={15} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold truncate text-ink-light dark:text-ink-dark pr-2">
                      {item.name}
                    </p>
                    <span className="text-[9px] text-ink-light/40 dark:text-ink-dark/45 font-mono">
                      {formatSize(item.size)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="truncate text-ink-light/65 dark:text-ink-dark/65 font-mono uppercase tracking-wide font-medium">
                      {item.detail}
                    </span>
                    <span className="font-bold font-mono shrink-0 ml-1">
                      {item.progress}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {item.stage !== 'ready' && item.stage !== 'error' && (
                    <div className="w-full bg-sand-muted/20 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}

                  {item.stage === 'error' && item.error && (
                    <p className="text-[10px] text-accent-rose font-bold mt-1 font-mono uppercase">
                      ERR: {item.error}
                    </p>
                  )}
                </div>

                <div className="shrink-0 mt-0.5">
                  {item.stage === 'ready' && (
                    <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400 animate-fade-in" />
                  )}
                  {item.stage === 'error' && (
                    <AlertCircle size={16} className="text-accent-rose animate-pulse" />
                  )}
                  {item.stage !== 'ready' && item.stage !== 'error' && (
                    <Loader2 size={14} className="animate-spin text-primary/80" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
