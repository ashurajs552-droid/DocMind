import Dexie, { type Table } from 'dexie';

export interface DocumentRecord {
  id: string; // unique ID (e.g. crypto.randomUUID or file hash)
  name: string;
  type: 'pdf' | 'docx' | 'pptx';
  uploadDate: number;
  totalPages?: number;
  totalSlides?: number;
  fileSize: number;
  customName?: string;
}

export interface ChunkRecord {
  id?: number; // auto-incrementing primary key
  documentId: string;
  content: string;
  pageNumber?: number; // for PDFs
  slideNumber?: number; // for PPTXs
  chunkIndex: number;
  embedding: number[]; // Float vector from embedding model
}

class DocMindDatabase extends Dexie {
  documents!: Table<DocumentRecord, string>;
  chunks!: Table<ChunkRecord, number>;

  constructor() {
    super('DocMindDatabase');
    this.version(1).stores({
      documents: 'id, name, type, uploadDate',
      chunks: '++id, documentId, chunkIndex',
    });
  }
}

export const db = new DocMindDatabase();

// Cosine similarity helper
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Vector search interface
export interface SearchResult {
  chunk: ChunkRecord;
  similarity: number;
}

/**
 * Perform local vector search inside IndexedDB
 */
export async function localVectorSearch(
  queryEmbedding: number[],
  documentIds: string[], // empty array means search all
  topK: number = 5
): Promise<SearchResult[]> {
  let chunks: ChunkRecord[] = [];
  
  if (documentIds.length === 0) {
    chunks = await db.chunks.toArray();
  } else {
    // If we have specific documentIds, query them in parallel
    const chunkPromises = documentIds.map(docId =>
      db.chunks.where('documentId').equals(docId).toArray()
    );
    const results = await Promise.all(chunkPromises);
    chunks = results.flat();
  }

  // Calculate similarity
  const scoredChunks = chunks.map(chunk => {
    const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
    return { chunk, similarity };
  });

  // Sort by similarity descending
  scoredChunks.sort((a, b) => b.similarity - a.similarity);

  // Return top K
  return scoredChunks.slice(0, topK);
}
