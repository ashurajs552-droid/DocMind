import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';

// export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'GROQ_API_KEY is not configured in your environment variables. Please add it to .env.local',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages must be an array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Groq provider
    const groq = createGroq({ apiKey });

    // Format context excerpts
    const contextText = context && Array.isArray(context) && context.length > 0
      ? context
          .map(
            (c: { content: string; pageNumber?: number; slideNumber?: number; documentName: string }) => {
              const sourceLabel = c.pageNumber 
                ? `Page ${c.pageNumber}` 
                : c.slideNumber 
                ? `Slide ${c.slideNumber}` 
                : 'Document';
              return `[Source: ${c.documentName} - ${sourceLabel}]\n${c.content}`;
            }
          )
          .join('\n\n---\n\n')
      : 'No relevant document excerpts were found. Explain that no files are uploaded or selected as context.';

    // Construct system prompt
    const systemPrompt = `You are DocMind, an intelligent document analysis assistant.
You answer the user's questions based ONLY on the provided document excerpts (context) below.

CRITICAL RULES:
1. Base your answer solely on the context provided.
2. If the answer cannot be found in the context or if you are not sure, state clearly: "I cannot find the answer to this question in the uploaded documents." Do not try to make up an answer or pull from external knowledge.
3. For every claim, fact, or statement you make that is derived from the context, you MUST cite the source. Cite using the exact format: [Page X] (for page X) or [Slide X] (for slide X) or [Document] (for DOCX or files without pagination).
4. Do not mention "context provided" in your answers, refer to it as the "documents" or "slides".
5. Keep your tone helpful, professional, and precise.

Here is the document context:
=========================================
${contextText}
=========================================`;

    // Stream text using Groq Llama 3.1
    const result = streamText({
      model: groq('llama-3.1-8b-instant'),
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.1, // Low temperature for factual compliance in RAG
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('Error in Groq chat API:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred during chat inference' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
