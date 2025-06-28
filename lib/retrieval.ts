import { VectorizeService } from "@/lib/vectorize";
import { PineconeService } from "@/lib/pinecone";
import type { ChatSource } from "@/types/chat";

export interface RetrievalResult {
  contextDocuments: string;
  sources: ChatSource[];
}

export async function performRetrieval(query: string): Promise<RetrievalResult> {
  console.log(`🔍 Starting document retrieval for: "${query}"`);
  
  // Try Pinecone first (where new uploads go)
  try {
    console.log("🏓 Trying Pinecone search...");
    const pineconeService = new PineconeService();
    const pineconeResults = await pineconeService.searchDocuments(query);
    
    if (pineconeResults && pineconeResults.length > 0) {
      console.log(`✅ Found ${pineconeResults.length} results in Pinecone`);
      
      // Format Pinecone results for chat
      const contextDocuments = pineconeResults
        .map((result, index) => {
          const filename = result.filename || result.source_display_name || `Document ${index + 1}`;
          return `[${filename}]\n${result.text}`;
        })
        .join('\n\n');
        
      const sources: ChatSource[] = pineconeResults.map((result, index) => ({
        id: result.id || `pinecone-${index}`,
        title: result.filename || result.source_display_name || `Pinecone Document ${index + 1}`,
        snippet: result.text || '',
        url: result.url || '',
        similarity: result.score || 0
      }));
      
      return {
        contextDocuments,
        sources
      };
    }
  } catch (pineconeError) {
    console.warn("🏓 Pinecone search failed, trying Vectorize:", pineconeError);
  }
  
  // Fallback to Vectorize.io (existing documents)
  try {
    console.log("🔧 Trying Vectorize.io search...");
    const vectorizeService = new VectorizeService();
    const documents = await vectorizeService.retrieveDocuments(query);
    const contextDocuments = vectorizeService.formatDocumentsForContext(documents);
    const sources = vectorizeService.convertDocumentsToChatSources(documents);
    
    console.log(`✅ Found ${sources.length} results in Vectorize.io`);
    
    return {
      contextDocuments,
      sources
    };
  } catch (vectorizeError) {
    console.error("❌ Both Pinecone and Vectorize retrieval failed:", vectorizeError);
    return {
      contextDocuments: "Unable to retrieve relevant documents at this time.",
      sources: []
    };
  }
} 