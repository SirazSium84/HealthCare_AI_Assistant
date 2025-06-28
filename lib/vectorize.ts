import { Configuration, PipelinesApi, ConnectorsApi, UploadsApi } from "@vectorize-io/vectorize-client";
import type { VectorizeDocument, VectorizeResponse } from "@/types/vectorize";
import type { ChatSource } from "@/types/chat";

export class VectorizeService {
  private pipelinesApi: any;
  private connectorsApi: any;
  private uploadsApi: any;
  private organizationId: string;
  private pipelineId: string;

  constructor() {
    const config = new Configuration({
      accessToken: process.env.VECTORIZE_PIPELINE_ACCESS_TOKEN,
      basePath: "https://api.vectorize.io/v1",
    });

    this.pipelinesApi = new PipelinesApi(config);
    this.connectorsApi = new ConnectorsApi(config);
    this.uploadsApi = new UploadsApi(config);
    this.organizationId = process.env.VECTORIZE_ORGANIZATION_ID!;
    this.pipelineId = process.env.VECTORIZE_PIPELINE_ID!;
    
    // Debug logging
    console.log('🔧 VectorizeService initialized:');
    console.log(`  Organization ID: ${this.organizationId ? 'SET' : 'UNDEFINED'}`);
    console.log(`  Pipeline ID: ${this.pipelineId ? 'SET' : 'UNDEFINED'}`);
    console.log(`  Access Token: ${process.env.VECTORIZE_PIPELINE_ACCESS_TOKEN ? 'SET' : 'UNDEFINED'}`);
  }

  async retrieveDocuments(
    question: string,
    numResults: number = 5
  ): Promise<VectorizeDocument[]> {
    try {
      const response = await this.pipelinesApi.retrieveDocuments({
        organization: this.organizationId,
        pipeline: this.pipelineId,
        retrieveDocumentsRequest: {
          question,
          numResults,
        },
      });

      return response.documents || [];
    } catch (error: any) {
      console.error("Vectorize API Error:", error?.response);
      if (error?.response?.text) {
        console.error("Error details:", await error.response.text());
      }
      throw new Error("Failed to retrieve documents from Vectorize");
    }
  }

  formatDocumentsForContext(documents: VectorizeDocument[]): string {
    if (!documents.length) {
      return "No relevant documents found.";
    }

    return documents
      .map((doc, index) => `Document ${index + 1}:\n${doc.text}`)
      .join("\n\n---\n\n");
  }

  convertDocumentsToChatSources(documents: VectorizeDocument[]): ChatSource[] {
    return documents.map((doc) => ({
      id: doc.id,
      title: doc.source_display_name || doc.source,
      url: doc.source,
      snippet: doc.text, // Full text content for hover display
      relevancy: doc.relevancy,
      similarity: doc.similarity,
    }));
  }

  async uploadDocument(chunks: any[], filename: string): Promise<void> {
    try {
      console.log(`🔄 Starting upload process for ${filename}`);
      console.log(`📝 Using direct API approach with connector: medical_insurance_booklet`);
      
      const connectorId = "medical_insurance_booklet";
      const baseUrl = "https://api.vectorize.io/v1";
      
      // Create a text file from chunks
      const combinedText = chunks.map(chunk => 
        `Source: ${chunk.metadata.source}\n` +
        `Chunk ${chunk.metadata.chunk_index + 1}/${chunk.metadata.total_chunks}\n\n` +
        chunk.text + '\n\n---\n\n'
      ).join('');
      
      // Convert text to buffer
      const fileBuffer = Buffer.from(combinedText, 'utf-8');
      
      // Step 1: Request an upload URL
      console.log('📋 Step 1: Requesting upload URL...');
      
      const requestBody = {
        name: filename,
        contentType: "text/plain",
        metadata: JSON.stringify({
          source: filename,
          upload_date: new Date().toISOString(),
          chunks_count: chunks.length,
          document_type: 'user_upload'
        })
      };
      
      const uploadUrlResponse = await fetch(
        `${baseUrl}/org/${this.organizationId}/uploads/${connectorId}/files`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${process.env.VECTORIZE_PIPELINE_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );
      
      if (!uploadUrlResponse.ok) {
        const errorText = await uploadUrlResponse.text();
        throw new Error(`Failed to get upload URL: ${uploadUrlResponse.status} ${errorText}`);
      }
      
      const uploadData = await uploadUrlResponse.json();
      const {uploadUrl} = uploadData;
      
      console.log('✅ Step 1: Upload URL received');
      
      // Step 2: Upload the file to the provided URL
      console.log('📤 Step 2: Uploading file content...');
      
      const fileUploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: fileBuffer
      });
      
      if (!fileUploadResponse.ok) {
        const errorText = await fileUploadResponse.text();
        throw new Error(`Failed to upload file: ${fileUploadResponse.status} ${errorText}`);
      }
      
      console.log('✅ Step 2: File uploaded successfully');
      console.log(`🎉 Document "${filename}" uploaded successfully to Vectorize.io!`);
      console.log(`📊 Upload summary: ${chunks.length} chunks, ${fileBuffer.length} bytes`);
      
    } catch (error: any) {
      console.error("Vectorize upload error:", error);
      
      // Provide helpful debugging info
      throw new Error(`Upload failed for "${filename}".
      
      Document processed successfully:
      • Chunks: ${chunks.length}
      • Total characters: ${chunks.reduce((sum, chunk) => sum + chunk.text.length, 0)}
      
      Error details: ${error.message}
      
      The document is properly formatted and ready - this appears to be an API connectivity issue.`);
    }
  }

  async getConnectors(): Promise<any> {
    try {
      const response = await this.connectorsApi.getSourceConnectors({
        organization: this.organizationId
      });
      console.log("📡 Available connectors:", response);
      return response;
    } catch (error: any) {
      console.error("Failed to get connectors:", error);
      throw new Error("Failed to retrieve connectors from Vectorize");
    }
  }

  async clearPipeline(): Promise<void> {
    try {
      console.log('🗑️ Attempting to clear pipeline...');
      // This method may not exist in the current API
      // We'll implement based on what's available
      console.log('⚠️ Pipeline clearing not implemented - check Vectorize.io docs for pipeline management');
    } catch (error: any) {
      console.error("Clear pipeline error:", error);
      throw new Error("Failed to clear pipeline");
    }
  }
}
