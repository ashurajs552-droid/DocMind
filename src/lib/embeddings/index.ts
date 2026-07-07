import { pipeline, env } from '@xenova/transformers';

// Ensure Xenova uses CDN-based model loading in the browser
if (typeof window !== 'undefined') {
  env.allowLocalModels = false;
  // Use jsdelivr or Hugging Face CDN
  env.backends.onnx.wasm.numThreads = 1;
}

type ProgressCallback = (progress: {
  status: 'initiate' | 'downloading' | 'done' | 'progress';
  file: string;
  loaded?: number;
  total?: number;
  progress?: number;
}) => void;

let pipelineInstance: any = null;
let loadingPromise: Promise<any> | null = null;

/**
 * Initialize the embedding pipeline with progress callback
 */
export function getEmbeddingPipeline(onProgress?: ProgressCallback): Promise<any> {
  if (pipelineInstance) {
    return Promise.resolve(pipelineInstance);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      progress_callback: (data: any) => {
        if (onProgress) {
          onProgress(data);
        }
      },
    })
      .then((instance) => {
        pipelineInstance = instance;
        resolve(instance);
      })
      .catch((err) => {
        loadingPromise = null;
        reject(err);
      });
  });

  return loadingPromise;
}

/**
 * Generate an embedding for a single text chunk
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const extractor = await getEmbeddingPipeline();
  
  // Extract features
  const output = await extractor(text, {
    pooling: 'mean',
    normalize: true,
  });

  // Convert Float32Array to standard JS number array
  return Array.from(output.data);
}

/**
 * Generate embeddings for multiple text chunks in sequence, notifying progress
 */
export async function getEmbeddingsBatch(
  texts: string[],
  onChunkProgress?: (current: number, total: number) => void
): Promise<number[][]> {
  const extractor = await getEmbeddingPipeline();
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i++) {
    const output = await extractor(texts[i], {
      pooling: 'mean',
      normalize: true,
    });
    embeddings.push(Array.from(output.data));
    
    if (onChunkProgress) {
      onChunkProgress(i + 1, texts.length);
    }
  }

  return embeddings;
}
