// Healthcare AI Assistant MCP Server Demo
// This demonstrates the MCP server concept with healthcare-specific tools

import { NextRequest } from 'next/server';
import { PineconeService } from '@/lib/pinecone';
import { searchMedicalTestCost } from '@/lib/google-search';
import { performRetrieval } from '@/lib/retrieval';
import { getSessionManager } from '@/lib/session-manager';

// Healthcare MCP Tools Registry - Moved from agent/route.ts
const HEALTHCARE_TOOLS = {

  // Document Search Tool (from agent)
  searchDocuments: {
    name: 'searchDocuments',
    description: 'Search through vectorized documents to find relevant information based on questions regarding Health Insurance and Medical procedures',
    parameters: {
      query: 'Required: The search query to find relevant documents'
    },
    handler: async (args: { query: string }) => {
      try {
        console.log(`🔍 Searching documents for: "${args.query}"`);
        const { contextDocuments, sources } = await performRetrieval(args.query);
        console.log(`📄 Found ${sources.length} documents`);
        console.log(`📝 Context length: ${contextDocuments.length} characters`);
        console.log(`🔍 Document content preview:`, contextDocuments.substring(0, 500) + '...');
        
        return {
          success: true,
          data: `DOCUMENT SEARCH RESULTS:\n\n${contextDocuments}\n\nIMPORTANT: Base your answer ONLY on the information above. Format with proper bullet points (•), bold important terms, and NO disclaimers or hedge words.`
        };
      } catch (error: any) {
        return {
          success: false,
          error: `Error searching documents: ${error.message}`
        };
      }
    }
  },

  // Medical Test Cost Tool (from agent)
  getMedicalTestCost: {
    name: 'getMedicalTestCost',
    description: 'Search for cost estimates of medical tests and procedures using web search',
    parameters: {
      testName: 'Required: The name of the medical test or procedure to search for cost information'
    },
    handler: async (args: { testName: string }) => {
      try {
        console.log(`💰 Getting cost information for: "${args.testName}"`);
        const costInfo = await searchMedicalTestCost(args.testName);
        
        return {
          success: true,
          data: costInfo
        };
      } catch (error: any) {
        return {
          success: false,
          error: `Error getting medical test cost: ${error.message}`
        };
      }
    }
  }
};

// MCP Server Handler
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const transport = url.pathname.split('/')[1]; // Extract transport type (sse, http, etc.)
  
  return new Response(JSON.stringify({
    server: 'Healthcare AI Assistant MCP Server',
    version: '1.0.0',
    transport,
    status: 'running',
    availableTools: Object.keys(HEALTHCARE_TOOLS),
    toolsCount: Object.keys(HEALTHCARE_TOOLS).length,
    capabilities: [
      'Healthcare Document Management',
      'Insurance Policy Analysis', 
      'Medical Cost Intelligence'
    ],
    usage: {
      endpoint: '/[transport]',
      method: 'POST',
      example: {
        tool: 'list_documents',
        arguments: { documentType: 'insurance' }
      }
    }
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool, arguments: args = {} } = body;
    
    // Validate tool exists
    if (!tool || !HEALTHCARE_TOOLS[tool as keyof typeof HEALTHCARE_TOOLS]) {
      return new Response(JSON.stringify({
        success: false,
        error: `Unknown tool: ${tool}`,
        availableTools: Object.keys(HEALTHCARE_TOOLS)
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Execute tool
    const toolDef = HEALTHCARE_TOOLS[tool as keyof typeof HEALTHCARE_TOOLS];
    const result = await toolDef.handler(args);
    
    return new Response(JSON.stringify({
      tool,
      arguments: args,
      result,
      timestamp: new Date().toISOString(),
      server: 'Healthcare AI Assistant MCP Server v1.0.0'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}