import { z } from "zod";
import { performRetrieval } from '@/lib/retrieval';

export const searchDocumentsTool = {
  name: "searchDocuments",
  description: "Search through vectorized documents to find relevant information based on questions regarding Health Insurance and Medical procedures",
  schema: z.object({
    query: z.string().describe("The search query to find relevant documents")
  }),
  handler: async ({ query }: { query: string }) => {
    try {
      console.log(`🔍 Searching documents for: "${query}"`);
      const { contextDocuments, sources } = await performRetrieval(query);
      console.log(`📄 Found ${sources.length} documents`);
      console.log(`📝 Context length: ${contextDocuments.length} characters`);
      console.log(`🔍 Document content preview:`, contextDocuments.substring(0, 500) + '...');
      
      const result = `DOCUMENT SEARCH RESULTS:\n\n${contextDocuments}\n\nIMPORTANT: Base your answer ONLY on the information above. Format with proper bullet points (•), bold important terms, and NO disclaimers or hedge words.`;
      
      return {
        content: [
          {
            type: "text" as const,
            text: result
          }
        ]
      };
    } catch (error: any) {
      console.error(`❌ Error searching documents:`, error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error searching documents: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
}; 