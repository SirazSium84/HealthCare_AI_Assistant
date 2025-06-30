#!/usr/bin/env node

/**
 * Claude MCP Bridge for Healthcare AI Assistant
 * 
 * This script bridges your Healthcare MCP server to Claude Desktop
 * by translating between Claude's MCP protocol and your HTTP API.
 */

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3001/http';

// Healthcare MCP Bridge Class
class HealthcareMcpBridge {
  constructor() {
    this.serverUrl = MCP_SERVER_URL;
    console.error(`🏥 Healthcare MCP Bridge starting...`);
    console.error(`📡 Server URL: ${this.serverUrl}`);
  }

  async callHealthcareTool(toolName, args = {}) {
    try {
      console.error(`🔧 Calling tool: ${toolName} with args:`, args);

      // For Node.js environments that might not have fetch
      const fetch = globalThis.fetch || (await import('node-fetch')).default;
      
      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: toolName,
          arguments: args
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.error(`✅ Tool result:`, result);

      if (result.result && result.result.success) {
        return {
          content: [
            {
              type: "text",
              text: this.formatToolResult(toolName, result.result.data)
            }
          ]
        };
      } else {
        throw new Error(result.result?.error || 'Unknown error from healthcare server');
      }
    } catch (error) {
      console.error(`❌ Tool execution failed:`, error);
      throw new Error(`Healthcare tool '${toolName}' failed: ${error.message}`);
    }
  }

  formatToolResult(toolName, data) {
    // Format the results in a user-friendly way
    switch (toolName) {
      case 'searchDocuments':
        return `📄 **Healthcare Document Search Results**

**Search Query**: ${data.query || 'Health insurance documents'}

**📋 Document Information Found**:
${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}

✅ Document search completed successfully.`;

      case 'getMedicalTestCost':
        return `💰 **Medical Test Cost Information**

**Test/Procedure**: ${data.testName || 'Medical procedure'}

**💵 Cost Information**:
${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}

✅ Cost lookup completed successfully.`;

      default:
        return `📋 **Tool Result**: ${toolName}

${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}

✅ Tool execution completed successfully.`;
    }
  }
}

// Initialize the bridge
const bridge = new HealthcareMcpBridge();

// Define available healthcare tools for Claude - Match actual server tools
const HEALTHCARE_TOOLS = [
  {
    name: "searchDocuments",
    description: "Search through vectorized documents to find relevant information based on questions regarding Health Insurance and Medical procedures",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query to find relevant documents (e.g., 'health insurance coverage', 'deductible information')"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "getMedicalTestCost",
    description: "Search for cost estimates of medical tests and procedures using web search",
    inputSchema: {
      type: "object",
      properties: {
        testName: {
          type: "string",
          description: "The name of the medical test or procedure to search for cost information (e.g., 'MRI brain', 'colonoscopy')"
        }
      },
      required: ["testName"]
    }
  }
];

// Handle incoming MCP messages from Claude
process.stdin.on('data', async (data) => {
  try {
    const message = JSON.parse(data.toString().trim());
    console.error(`📨 Received message:`, message);
    
    let response;

    switch (message.method) {
      case 'initialize':
        response = {
          jsonrpc: "2.0",
          id: message.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
              prompts: {},
              resources: {}
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
            tools: HEALTHCARE_TOOLS
          }
        };
        break;

      case 'tools/call':
        try {
          const { name, arguments: args } = message.params;
          console.error(`🔧 Tool call requested: ${name} with args:`, args);
          
          // Call the healthcare tool directly and get the raw data
          const toolResult = await bridge.callHealthcareTool(name, args || {});
          
          response = {
            jsonrpc: "2.0",
            id: message.id,
            result: toolResult
          };
        } catch (error) {
          console.error(`❌ Tool call failed:`, error);
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

    console.error(`📤 Sending response:`, response);
    process.stdout.write(JSON.stringify(response) + '\n');
    
  } catch (error) {
    console.error('❌ Bridge error:', error);
    
    // Try to extract message ID if possible, otherwise use null
    let messageId = null;
    try {
      const partialMessage = JSON.parse(data.toString().trim());
      messageId = partialMessage.id || null;
    } catch (e) {
      // If we can't parse at all, use null
    }
    
    const errorResponse = {
      jsonrpc: "2.0",
      id: messageId,
      error: {
        code: -32700,
        message: `Parse error: ${error.message}`
      }
    };
    
    process.stdout.write(JSON.stringify(errorResponse) + '\n');
  }
});

// Handle process cleanup
process.on('SIGINT', () => {
  console.error('🛑 Healthcare MCP Bridge shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('🛑 Healthcare MCP Bridge terminated');
  process.exit(0);
});

console.error('🏥 Healthcare AI Assistant MCP Bridge ready for Claude Desktop!');
console.error('🔗 Available tools (2): searchDocuments, getMedicalTestCost');
console.error('✨ Claude can now access your healthcare documents and cost intelligence!');