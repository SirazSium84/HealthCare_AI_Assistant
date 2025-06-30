// Session Manager for Healthcare AI Assistant
// Handles document cleanup and session initialization

import { PineconeService } from './pinecone';
import { VectorizeService } from './vectorize';

export interface SessionConfig {
  clearOnStart: boolean;
  clearMethod: 'all' | 'by-session' | 'by-age' | 'none';
  maxDocumentAge?: number; // in hours
  preservePatterns?: string[]; // filename patterns to preserve
}

export class SessionManager {
  private pineconeService: PineconeService;
  private vectorizeService: VectorizeService;
  private sessionId: string;
  private config: SessionConfig;

  constructor(config: SessionConfig = {
    clearOnStart: true,
    clearMethod: 'all'
  }) {
    this.pineconeService = new PineconeService();
    this.vectorizeService = new VectorizeService();
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.config = config;
    
    console.log('🎯 Session Manager initialized');
    console.log(`📋 Session ID: ${this.sessionId}`);
    console.log(`🗑️ Clear on start: ${config.clearOnStart}`);
    console.log(`🔧 Clear method: ${config.clearMethod}`);
  }

  async initializeSession(): Promise<void> {
    try {
      console.log('🚀 Initializing new session...');
      
      if (this.config.clearOnStart) {
        await this.clearPreviousDocuments();
      }
      
      const documentCount = await this.pineconeService.getDocumentCount();
      console.log(`📊 Session initialized with ${documentCount} existing documents`);
      
    } catch (error: any) {
      console.error('❌ Failed to initialize session:', error);
      throw new Error(`Session initialization failed: ${error.message}`);
    }
  }

  async clearPreviousDocuments(): Promise<void> {
    try {
      console.log(`🗑️ Clearing previous documents using method: ${this.config.clearMethod}`);
      
      switch (this.config.clearMethod) {
        case 'all':
          await this.clearAllDocuments();
          break;
          
        case 'by-session':
          await this.clearBySession();
          break;
          
        case 'by-age':
          await this.clearByAge();
          break;
          
        case 'none':
          console.log('ℹ️ Document clearing disabled');
          break;
          
        default:
          console.log('⚠️ Unknown clear method, skipping cleanup');
      }
      
    } catch (error: any) {
      console.error('❌ Failed to clear previous documents:', error);
      throw error;
    }
  }

  private async clearAllDocuments(): Promise<void> {
    console.log('🗑️ Clearing ALL documents from Pinecone...');
    
    // Get count before clearing
    const beforeCount = await this.pineconeService.getDocumentCount();
    console.log(`📊 Documents before clearing: ${beforeCount}`);
    
    // Clear Pinecone
    await this.pineconeService.clearAllDocuments();
    
    // Verify clearing
    const afterCount = await this.pineconeService.getDocumentCount();
    console.log(`✅ Documents after clearing: ${afterCount}`);
    console.log(`🗑️ Cleared ${beforeCount - afterCount} documents from Pinecone`);
  }

  private async clearBySession(): Promise<void> {
    console.log('🗑️ Clearing documents from previous sessions...');
    
    // This would require session metadata in documents
    // For now, we'll clear all except current session (which doesn't exist yet)
    await this.clearAllDocuments();
    
    console.log('ℹ️ Note: Session-based clearing requires session metadata in uploads');
  }

  private async clearByAge(): Promise<void> {
    const maxAge = this.config.maxDocumentAge || 24; // Default 24 hours
    console.log(`🗑️ Clearing documents older than ${maxAge} hours...`);
    
    // This would require timestamp metadata in documents
    // For now, we'll implement a basic approach
    console.log('ℹ️ Note: Age-based clearing requires timestamp metadata in uploads');
    
    // You could implement this by:
    // 1. Querying documents with upload_date metadata
    // 2. Filtering by age
    // 3. Deleting old documents
  }

  async getSessionInfo(): Promise<{
    sessionId: string;
    documentCount: number;
    config: SessionConfig;
    uptime: number;
  }> {
    const documentCount = await this.pineconeService.getDocumentCount();
    
    return {
      sessionId: this.sessionId,
      documentCount,
      config: this.config,
      uptime: Date.now() - parseInt(this.sessionId.split('_')[1])
    };
  }

  async clearCurrentSession(): Promise<void> {
    console.log('🗑️ Clearing current session documents...');
    await this.clearAllDocuments();
  }
}

// Global session manager instance
let globalSessionManager: SessionManager | null = null;

export function getSessionManager(config?: SessionConfig): SessionManager {
  if (!globalSessionManager) {
    globalSessionManager = new SessionManager(config);
  }
  return globalSessionManager;
}

export async function initializeGlobalSession(config?: SessionConfig): Promise<void> {
  const sessionManager = getSessionManager(config);
  await sessionManager.initializeSession();
}