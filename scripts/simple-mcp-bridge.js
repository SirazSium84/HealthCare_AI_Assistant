#!/usr/bin/env node

/**
 * Simple MCP Bridge for Healthcare AI Assistant
 * Correctly implements MCP protocol for Claude Desktop
 */

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'https://healthcare-assistant-mcp-test.vercel.app/mcp';

// Simple MCP Bridge
class SimpleMcpBridge {
  constructor() {
    this.serverUrl = MCP_SERVER_URL;
    console.error(`🏥 Simple Healthcare MCP Bridge starting...`);
    console.error(`📡 Server URL: ${this.serverUrl}`);
  }

  async callTool(toolName, args = {}) {
    try {
      // Use dynamic import for node-fetch if fetch is not available
      const fetch = globalThis.fetch || (await import('node-fetch')).default;
      
      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream'
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
            name: toolName,
            arguments: args
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      
      // Parse Server-Sent Events format
      const lines = responseText.trim().split('\n');
      let result = null;
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            result = JSON.parse(line.substring(6));
            break;
          } catch (e) {
            console.error('Failed to parse SSE data:', line);
          }
        }
      }
      
      if (!result) {
        throw new Error('No valid data found in SSE response');
      }
      
      if (result.error) {
        throw new Error(result.error.message || 'Tool execution failed');
      }
      
      if (result.result) {
        return result.result;
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error(`❌ Tool execution failed:`, error);
      throw error;
    }
  }
}

const bridge = new SimpleMcpBridge();

// MCP Tool Definitions
const TOOLS = [
  {
    name: "searchDocuments",
    description: "Search through vectorized documents to find relevant information about Health Insurance and Medical procedures",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query to find relevant documents"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "getMedicalTestCost",
    description: "Search for cost estimates of medical tests and procedures",
    inputSchema: {
      type: "object",
      properties: {
        testName: {
          type: "string",
          description: "The name of the medical test or procedure"
        }
      },
      required: ["testName"]
    }
  },
  {
    name: "uploadDocument",
    description: "Upload and process healthcare documents (PDF, TXT) to the vector database for future search and analysis",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "Base64 encoded content of the document"
        },
        filename: {
          type: "string",
          description: "Name of the file including extension (e.g., 'insurance_policy.pdf')"
        },
        mimeType: {
          type: "string",
          description: "MIME type of the file (e.g., 'application/pdf', 'text/plain')"
        }
      },
      required: ["content", "filename", "mimeType"]
    }
  }
];

// Handle MCP protocol messages
process.stdin.on('data', async (data) => {
  try {
    const message = JSON.parse(data.toString().trim());
    console.error(`📨 Received:`, message);
    
    let response;

    switch (message.method) {
      case 'initialize':
        response = {
          jsonrpc: "2.0",
          id: message.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: "healthcare-ai-assistant",
              version: "1.0.0"
            }
          }
        };
        break;

      case 'tools/list':
        response = {
          jsonrpc: "2.0",
          id: message.id,
          result: {
            tools: TOOLS
          }
        };
        break;

      case 'tools/call':
        try {
          const { name, arguments: args } = message.params;
          const result = await bridge.callTool(name, args);
          
          response = {
            jsonrpc: "2.0",
            id: message.id,
            result: result
          };
        } catch (error) {
          response = {
            jsonrpc: "2.0",
            id: message.id,
            error: {
              code: -32603,
              message: error.message
            }
          };
        }
        break;

      default:
        response = {
          jsonrpc: "2.0",
          id: message.id,
          error: {
            code: -32601,
            message: `Method not found: ${message.method}`
          }
        };
    }

    console.error(`📤 Sending:`, response);
    process.stdout.write(JSON.stringify(response) + '\n');
    
  } catch (error) {
    console.error('❌ Bridge error:', error);
    
    const errorResponse = {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32700,
        message: `Parse error: ${error.message}`
      }
    };
    
    process.stdout.write(JSON.stringify(errorResponse) + '\n');
  }
});

// Handle cleanup
process.on('SIGINT', () => {
  console.error('🛑 Simple MCP Bridge shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('🛑 Simple MCP Bridge terminated');
  process.exit(0);
});

console.error('🚀 Simple Healthcare MCP Bridge ready for Claude Desktop!');
console.error('🔗 Available tools: searchDocuments, getMedicalTestCost, uploadDocument'); 