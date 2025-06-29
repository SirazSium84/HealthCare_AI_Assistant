import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

export class PineconeService {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private indexName: string;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
    
    this.indexName = process.env.PINECONE_INDEX_NAME || 'healthcare-docs';
    
    console.log('🔧 PineconeService initialized:');
    console.log(`  Index Name: ${this.indexName}`);
    console.log(`  Pinecone API Key: ${process.env.PINECONE_API_KEY ? 'SET' : 'UNDEFINED'}`);
    console.log(`  OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'SET' : 'UNDEFINED'}`);
  }

  async uploadDocument(chunks: any[], filename: string): Promise<void> {
    try {
      console.log(`🔄 Starting Pinecone upload for ${filename}`);
      console.log(`📝 Processing ${chunks.length} chunks`);
      
      const index = this.pinecone.Index(this.indexName);
      
      // Generate embeddings in batches for better performance
      const vectors = [];
      const embeddingBatchSize = 20; // Process up to 20 chunks at once
      
      for (let i = 0; i < chunks.length; i += embeddingBatchSize) {
        const batchChunks = chunks.slice(i, i + embeddingBatchSize);
        console.log(`📊 Generating embeddings for batch ${Math.floor(i/embeddingBatchSize) + 1}/${Math.ceil(chunks.length/embeddingBatchSize)} (${batchChunks.length} chunks)`);
        
        // Create batch embedding request
        const texts = batchChunks.map(chunk => chunk.text);
        
        try {
          // Generate embeddings for the batch
          const embeddingResponse = await this.openai.embeddings.create({
            model: "text-embedding-3-small",
            input: texts,
          });
          
          // Process each embedding in the batch
          for (let j = 0; j < batchChunks.length; j++) {
            const chunk = batchChunks[j];
            const embedding = embeddingResponse.data[j].embedding;
            const chunkIndex = i + j;
            
            // Create vector object for Pinecone
            const vector = {
              id: `${filename}_chunk_${chunkIndex}`,
              values: embedding,
              metadata: {
                text: chunk.text,
                source: chunk.metadata.source,
                source_display_name: chunk.metadata.source_display_name,
                chunk_index: chunk.metadata.chunk_index,
                total_chunks: chunk.metadata.total_chunks,
                upload_date: chunk.metadata.upload_date,
                document_type: chunk.metadata.document_type,
                filename: filename
              }
            };
            
            vectors.push(vector);
          }
        } catch (embeddingError: any) {
          console.error(`Failed to generate embeddings for batch ${Math.floor(i/embeddingBatchSize) + 1}:`, embeddingError);
          throw new Error(`Embedding generation failed: ${embeddingError.message}`);
        }
      }
      
      console.log(`📤 Uploading ${vectors.length} vectors to Pinecone...`);
      
      // Upload vectors to Pinecone in batches
      const pineconeUpsertBatchSize = 100; // Pinecone recommended batch size
      for (let i = 0; i < vectors.length; i += pineconeUpsertBatchSize) {
        const batch = vectors.slice(i, i + pineconeUpsertBatchSize);
        
        try {
          await index.upsert(batch);
          console.log(`✅ Uploaded Pinecone batch ${Math.floor(i/pineconeUpsertBatchSize) + 1}/${Math.ceil(vectors.length/pineconeUpsertBatchSize)}`);
        } catch (upsertError: any) {
          console.error(`Failed to upload batch ${Math.floor(i/pineconeUpsertBatchSize) + 1} to Pinecone:`, upsertError);
          throw new Error(`Pinecone upsert failed: ${upsertError.message}`);
        }
      }
      
      console.log(`🎉 Successfully uploaded "${filename}" to Pinecone!`);
      console.log(`📊 Total vectors: ${vectors.length}`);
      
    } catch (error: any) {
      console.error("Pinecone upload error:", error);
      throw new Error(`Pinecone upload failed for "${filename}": ${error.message}`);
    }
  }

  async searchDocuments(query: string, topK: number = 5): Promise<any[]> {
    try {
      console.log(`🔍 Searching Pinecone for: "${query}"`);
      
      const index = this.pinecone.Index(this.indexName);
      
      // Generate embedding for the query
      const embeddingResponse = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query,
      });
      
      const queryEmbedding = embeddingResponse.data[0].embedding;
      
      // Search Pinecone
      const searchResponse = await index.query({
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
      });
      
      const results = searchResponse.matches?.map(match => ({
        id: match.id,
        score: match.score,
        text: match.metadata?.text,
        source: match.metadata?.source,
        source_display_name: match.metadata?.source_display_name,
        filename: match.metadata?.filename,
        chunk_index: match.metadata?.chunk_index,
        document_type: match.metadata?.document_type
      })) || [];
      
      console.log(`📄 Found ${results.length} results in Pinecone`);
      
      return results;
      
    } catch (error: any) {
      console.error("Pinecone search error:", error);
      throw new Error(`Pinecone search failed: ${error.message}`);
    }
  }

  async getIndexStats(): Promise<any> {
    try {
      const index = this.pinecone.Index(this.indexName);
      const stats = await index.describeIndexStats();
      return stats;
    } catch (error: any) {
      console.error("Failed to get Pinecone stats:", error);
      throw new Error(`Failed to get index stats: ${error.message}`);
    }
  }
} 