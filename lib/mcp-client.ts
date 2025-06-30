// Frontend MCP Client for Healthcare AI Assistant
import type { HealthcareMcpResult } from '@/types/mcp';

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