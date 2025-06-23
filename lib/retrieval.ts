import { VectorizeService } from "@/lib/vectorize";
import type { ChatSource } from "@/types/chat";

export interface RetrievalResult {
  contextDocuments: string;
  sources: ChatSource[];
}

export async function performRetrieval(query: string): Promise<RetrievalResult> {
  try {
    const vectorizeService = new VectorizeService();
    const documents = await vectorizeService.retrieveDocuments(query);
    const contextDocuments = vectorizeService.formatDocumentsForContext(documents);
    const sources = vectorizeService.convertDocumentsToChatSources(documents);
    
    return {
      contextDocuments,
      sources
    };
  } catch (vectorizeError) {
    console.error("Vectorize retrieval failed:", vectorizeError);
    return {
      contextDocuments: "Unable to retrieve relevant documents at this time.",
      sources: []
    };
  }
} 