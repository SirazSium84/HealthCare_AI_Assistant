// Frontend MCP Client for Healthcare AI Assistant
import type { HealthcareMcpResult, McpToolDefinition } from '@/types/mcp';

export interface McpToolCall {
  tool: string;
  arguments: Record<string, any>;
}

export interface McpToolResult {
  tool: string;
  arguments: Record<string, any>;
  result: {
    success: boolean;
    data?: any;
    error?: string;
  };
  timestamp: string;
  server: string;
}

export class HealthcareMcpClient {
  private baseUrl: string;
  private transport: string;

  constructor(baseUrl: string = '', transport: string = 'http') {
    this.baseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    this.transport = transport;
  }

  async callTool(toolCall: McpToolCall): Promise<McpToolResult> {
    const url = `${this.baseUrl}/${this.transport}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolCall),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      return {
        tool: toolCall.tool,
        arguments: toolCall.arguments,
        result: {
          success: false,
          error: error.message
        },
        timestamp: new Date().toISOString(),
        server: 'Healthcare AI Assistant MCP Server (Error)'
      };
    }
  }

  async getServerInfo() {
    const url = `${this.baseUrl}/${this.transport}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(`Failed to get server info: ${error.message}`);
    }
  }

  async getAvailableTools(): Promise<McpToolDefinition[]> {
    try {
      const serverInfo = await this.getServerInfo();
      
      // For now, return the known tools from the server
      // In a full MCP implementation, this would call the tools/list endpoint
      return [
        {
          name: 'searchDocuments',
          description: 'Search through vectorized documents to find relevant information based on questions regarding Health Insurance and Medical procedures',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The search query to find relevant documents'
              }
            },
            required: ['query']
          }
        },
        {
          name: 'getMedicalTestCost',
          description: 'Search for cost estimates of medical tests and procedures using web search',
          inputSchema: {
            type: 'object',
            properties: {
              testName: {
                type: 'string',
                description: 'The name of the medical test or procedure to search for cost information'
              }
            },
            required: ['testName']
          }
        }
      ];
    } catch (error: any) {
      throw new Error(`Failed to get available tools: ${error.message}`);
    }
  }

  // Document Search Tool (moved from agent)
  async searchDocuments(query: string) {
    return this.callTool({
      tool: 'searchDocuments',
      arguments: { query }
    });
  }

  // Medical Test Cost Tool (moved from agent)
  async getMedicalTestCost(testName: string) {
    return this.callTool({
      tool: 'getMedicalTestCost',
      arguments: { testName }
    });
  }

}

// Default client instance
export const mcpClient = new HealthcareMcpClient();