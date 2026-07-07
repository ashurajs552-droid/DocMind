import JSZip from 'jszip';
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

// Polyfill ReadableStream.prototype.values and asyncIterator for WebKit/Safari compatibility
if (typeof ReadableStream !== 'undefined') {
  const proto = ReadableStream.prototype as any;
  if (!proto.values) {
    proto.values = function () {
      const reader = this.getReader();
      return {
        next() {
          return reader.read().then(({ done, value }: { done: boolean; value?: any }) => {
            if (done) {
              reader.releaseLock();
              return { done: true, value: undefined };
            }
            return { done: false, value };
          });
        },
        [Symbol.asyncIterator]() {
          return this;
        },
      } as any;
    };
  }
  if (!proto[Symbol.asyncIterator]) {
    proto[Symbol.asyncIterator] = function () {
      return this.values();
    };
  }
}

// Configure PDFJS worker path using local public copy to ensure 100% offline, local parsing
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

export interface ParsedChunk {
  content: string;
  pageNumber?: number;
  slideNumber?: number;
  chunkIndex: number;
}

export interface ParseResult {
  fileName: string;
  fileSize: number;
  totalPages?: number;
  totalSlides?: number;
  chunks: ParsedChunk[];
}

/**
 * Word-based chunker with sliding window overlap
 */
export function chunkText(
  text: string,
  metadata: { pageNumber?: number; slideNumber?: number },
  startChunkIndex: number,
  maxWords: number = 450,
  overlapWords: number = 80
): ParsedChunk[] {
  const words = text.trim().split(/\s+/);
  if (words.length === 0 || words[0] === '') return [];

  const chunks: ParsedChunk[] = [];
  let chunkIndex = startChunkIndex;

  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + maxWords);
    const content = chunkWords.join(' ');
    
    chunks.push({
      content,
      pageNumber: metadata.pageNumber,
      slideNumber: metadata.slideNumber,
      chunkIndex: chunkIndex++,
    });

    if (words.length <= maxWords) {
      break;
    }

    i += (maxWords - overlapWords);
  }

  return chunks;
}

/**
 * Parse a PDF file client-side
 */
export async function parsePdf(
  file: File,
  onProgress?: (stage: string, percent: number) => void
): Promise<ParseResult> {
  if (onProgress) onProgress('Loading document', 10);
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
  
  // Track loading progress
  loadingTask.onProgress = (progress: { loaded: number; total: number }) => {
    if (progress.total > 0 && onProgress) {
      const percent = Math.round((progress.loaded / progress.total) * 40) + 10;
      onProgress('Reading file content', percent);
    }
  };

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const chunks: ParsedChunk[] = [];
  let chunkIndex = 0;

  if (onProgress) onProgress(`Found ${numPages} pages. Extracting text...`, 50);

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    if (onProgress) {
      const percent = Math.round(50 + (i / numPages) * 45);
      onProgress(`Parsing page ${i}/${numPages} (found ${textContent.items.length} text items)`, percent);
    }

    const pageText = textContent.items
      .map((item: any) => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        return item.str ?? '';
      })
      .join(' ');

    if (pageText.trim()) {
      const pageChunks = chunkText(pageText, { pageNumber: i }, chunkIndex);
      chunks.push(...pageChunks);
      chunkIndex += pageChunks.length;
    }
  }

  if (onProgress) onProgress('Finished parsing', 100);

  return {
    fileName: file.name,
    fileSize: file.size,
    totalPages: numPages,
    chunks,
  };
}

/**
 * Parse a DOCX file client-side
 */
export async function parseDocx(
  file: File,
  onProgress?: (stage: string, percent: number) => void
): Promise<ParseResult> {
  if (onProgress) onProgress('Reading file data', 20);
  const arrayBuffer = await file.arrayBuffer();
  
  if (onProgress) onProgress('Extracting word text', 50);
  const result = await mammoth.extractRawText({ arrayBuffer });
  const fullText = result.value;

  if (onProgress) onProgress('Chunking content', 80);
  const chunks = chunkText(fullText, {}, 0);

  if (onProgress) onProgress('Finished parsing', 100);

  return {
    fileName: file.name,
    fileSize: file.size,
    chunks,
  };
}

/**
 * Parse a PPTX file client-side
 */
export async function parsePptx(
  file: File,
  onProgress?: (stage: string, percent: number) => void
): Promise<ParseResult> {
  if (onProgress) onProgress('Reading file data', 10);
  const arrayBuffer = await file.arrayBuffer();
  
  if (onProgress) onProgress('Opening slide deck archive', 30);
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // Find all slide XML files
  const slideFiles = Object.keys(zip.files).filter(
    (path) => path.startsWith('ppt/slides/slide') && path.endsWith('.xml')
  );

  // Sort slides numerically (slide1.xml, slide2.xml, etc.)
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.replace('ppt/slides/slide', '').replace('.xml', ''), 10);
    const numB = parseInt(b.replace('ppt/slides/slide', '').replace('.xml', ''), 10);
    return numA - numB;
  });

  const chunks: ParsedChunk[] = [];
  let chunkIndex = 0;
  const parser = new DOMParser();

  if (onProgress) onProgress(`Extracting content from ${slideFiles.length} slides`, 50);

  for (let i = 0; i < slideFiles.length; i++) {
    const slidePath = slideFiles[i];
    const slideNumber = i + 1;

    try {
      const slideXmlText = await zip.files[slidePath].async('text');
      const slideDoc = parser.parseFromString(slideXmlText, 'text/xml');
      
      // Extract slide text (inside <a:t> elements)
      const tNodes = slideDoc.getElementsByTagName('a:t');
      let slideText = Array.from(tNodes)
        .map((n) => n.textContent || '')
        .join(' ');

      // Check if there is corresponding speaker notes
      // Typically stored in ppt/notesSlides/notesSlide[N].xml
      // Note: mapping notes slides directly by index or searching zip
      const notesPath = `ppt/notesSlides/notesSlide${slideNumber}.xml`;
      let notesText = '';
      if (zip.files[notesPath]) {
        const notesXmlText = await zip.files[notesPath].async('text');
        const notesDoc = parser.parseFromString(notesXmlText, 'text/xml');
        const notesTNodes = notesDoc.getElementsByTagName('a:t');
        notesText = Array.from(notesTNodes)
          .map((n) => n.textContent || '')
          .join(' ');
      }

      let combinedText = slideText;
      if (notesText.trim()) {
        combinedText += `\n[Speaker Notes]: ${notesText}`;
      }

      if (combinedText.trim()) {
        const slideChunks = chunkText(combinedText, { slideNumber }, chunkIndex);
        chunks.push(...slideChunks);
        chunkIndex += slideChunks.length;
      }
    } catch (e) {
      console.error(`Error parsing slide ${slideNumber}:`, e);
    }

    if (onProgress) {
      const percent = Math.round(50 + ((i + 1) / slideFiles.length) * 45);
      onProgress(`Parsing slide ${slideNumber}/${slideFiles.length}`, percent);
    }
  }

  if (onProgress) onProgress('Finished parsing', 100);

  return {
    fileName: file.name,
    fileSize: file.size,
    totalSlides: slideFiles.length,
    chunks,
  };
}

/**
 * Main parser entry point which delegates based on file type
 */
export async function parseFile(
  file: File,
  onProgress?: (stage: string, percent: number) => void
): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return parsePdf(file, onProgress);
    case 'docx':
      return parseDocx(file, onProgress);
    case 'pptx':
      return parsePptx(file, onProgress);
    default:
      throw new Error(`Unsupported file type: .${extension}`);
  }
}
