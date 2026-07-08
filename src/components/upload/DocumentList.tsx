'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type DocumentRecord } from '@/lib/db';
import { Trash2, Edit2, Check, X, Shield, File, Layers, Calendar, HardDrive } from 'lucide-react';

interface DocumentListProps {
  selectedDocIds: string[];
  onToggleSelectDoc: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
}

export default function DocumentList({
  selectedDocIds,
  onToggleSelectDoc,
  onSelectAll,
}: DocumentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Live query documents from Dexie, sorted by date descending
  const documents = useLiveQuery(async () => {
    const list = await db.documents.toArray();
    return list.sort((a, b) => b.uploadDate - a.uploadDate);
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this document? All local vector indices and chunks will be permanently removed.')) {
      await db.transaction('rw', [db.documents, db.chunks], async () => {
        await db.documents.delete(id);
        await db.chunks.where('documentId').equals(id).delete();
      });
      // If it was selected, toggle it off
      if (selectedDocIds.includes(id)) {
        onToggleSelectDoc(id);
      }
    }
  };

  const startRename = (doc: DocumentRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(doc.id);
    setEditName(doc.customName || doc.name);
  };

  const saveRename = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editName.trim()) {
      await db.documents.update(id, { customName: editName.trim() });
      setEditingId(null);
    }
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectAllToggle = () => {
    if (!documents) return;
    const allIds = documents.map((d) => d.id);
    if (selectedDocIds.length === documents.length) {
      onSelectAll([]); // deselect all
    } else {
      onSelectAll(allIds); // select all
    }
  };

  if (!documents) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-ink-light/30 dark:text-ink-dark/30">
        <div className="w-6 h-6 rounded-full border-2 border-dashed border-current animate-spin mb-3" />
        <span className="text-[10px] font-mono tracking-widest uppercase">Initializing...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* List Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-sand-muted/40 dark:border-sand-dark/60">
        <h3 className="font-serif text-sm font-bold text-ink-light dark:text-ink-dark flex items-center gap-2">
          <Layers size={14} className="text-primary" />
          Active Context
        </h3>
        
        {documents.length > 0 && (
          <button
            onClick={handleSelectAllToggle}
            className="text-[11px] font-bold text-primary hover:text-primary-light transition-colors uppercase tracking-wider cursor-pointer"
          >
            {selectedDocIds.length === documents.length ? 'Clear Selection' : 'Select All'}
          </button>
        )}
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[18rem] md:max-h-[22rem]">
        {documents.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl border border-dashed border-sand-muted/40 dark:border-sand-dark/60 bg-white/20 dark:bg-sand-dark/10 backdrop-blur-xs">
            <File size={24} className="mx-auto text-ink-light/20 dark:text-ink-dark/20 mb-2.5" />
            <p className="font-serif text-xs font-semibold text-ink-light/65 dark:text-ink-dark/65">
              Library is Empty
            </p>
            <p className="text-[10px] text-ink-light/40 dark:text-ink-dark/40 mt-1 max-w-xs mx-auto">
              Please upload source files to build your sandboxed memory space.
            </p>
          </div>
        ) : (
          documents.map((doc) => {
            const isSelected = selectedDocIds.includes(doc.id);
            const displayName = doc.customName || doc.name;
            const isEditing = editingId === doc.id;

            return (
              <div
                key={doc.id}
                onClick={() => !isEditing && onToggleSelectDoc(doc.id)}
                className={`group border rounded-xl p-3.5 cursor-pointer transition-all duration-200 relative ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-xs scale-[1.01]'
                    : 'border-sand-muted/50 hover:border-primary/40 hover:bg-white/40 dark:border-sand-dark dark:hover:border-primary/30 dark:hover:bg-[#121520]/30'
                }`}
              >
                {/* File Type Tag */}
                <div className="absolute top-3.5 right-3.5 text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-sand/80 dark:bg-sand-dark/85 text-ink-light/60 dark:text-ink-dark/50 border border-sand-muted/30 dark:border-sand-dark/40 font-mono tracking-widest">
                  {doc.type}
                </div>

                <div className="space-y-2">
                  {/* File Name Header */}
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 pr-12" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 text-xs bg-white dark:bg-paper-dark border border-primary rounded-lg px-2.5 py-1 outline-none font-sans font-semibold text-ink-light dark:text-ink-dark"
                        autoFocus
                      />
                      <button
                        onClick={(e) => saveRename(doc.id, e)}
                        className="p-1.5 rounded-md hover:bg-secondary/15 text-secondary cursor-pointer"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={cancelRename}
                        className="p-1.5 rounded-md hover:bg-accent-rose/15 text-accent-rose cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between pr-12">
                      <p className={`font-serif text-xs font-bold truncate ${
                        isSelected ? 'text-primary' : 'text-ink-light dark:text-ink-dark'
                      }`}>
                        {displayName}
                      </p>
                    </div>
                  )}

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-ink-light/40 dark:text-ink-dark/40">
                    <span className="flex items-center gap-1 font-mono">
                      <HardDrive size={9} />
                      {formatSize(doc.fileSize)}
                    </span>
                    
                    <span className="flex items-center gap-1">
                      <Calendar size={9} />
                      {formatDate(doc.uploadDate)}
                    </span>
 
                    {(doc.totalPages || doc.totalSlides) && (
                      <span className="font-mono bg-sand/30 dark:bg-sand-dark/45 px-1 py-0.5 rounded border border-sand-muted/20 dark:border-sand-dark/30">
                        {doc.type === 'pdf' ? `${doc.totalPages}p` : `${doc.totalSlides}s`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover Action Buttons */}
                {!isEditing && (
                  <div className="absolute right-3.5 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1.5">
                    <button
                      onClick={(e) => startRename(doc, e)}
                      className="p-1.5 rounded-md hover:bg-sand/65 dark:hover:bg-sand-dark/80 text-ink-light/60 hover:text-ink-light dark:text-ink-dark/60 dark:hover:text-ink-dark transition-colors cursor-pointer"
                      title="Rename"
                    >
                      <Edit2 size={11} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="p-1.5 rounded-md hover:bg-accent-rose/15 text-accent-rose/75 hover:text-accent-rose transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Privacy Shield Indicator (High-Tech, secure-scan) */}
      <div className="border border-secondary/15 dark:border-white/5 bg-secondary/5 dark:bg-secondary/10 rounded-2xl p-4.5 mt-auto relative overflow-hidden secure-scan group hover:border-secondary/25 transition-colors duration-300">
        <div className="flex gap-3.5 items-start relative z-10">
          <div className="p-2 rounded-xl bg-secondary/10 dark:bg-secondary/25 text-secondary dark:text-secondary-light shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
            <Shield size={16} />
          </div>
          <div>
            <h4 className="font-serif text-xs font-bold text-secondary-dark dark:text-ink-dark flex items-center gap-1.5">
              Hardware Secure Local Sandbox
              <span className="inline-flex h-2 w-2 rounded-full bg-secondary-light animate-pulse shrink-0" />
            </h4>
            <p className="text-[10px] text-secondary-dark/75 dark:text-ink-dark/50 mt-1 leading-relaxed">
              DocMind runs 100% locally. Text processing, embeddings, and vector similarity calculations occur entirely within this browser context. No cloud trackers, zero leakages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
