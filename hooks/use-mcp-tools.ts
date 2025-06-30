// React hook for integrating MCP tools into chat interface
import { useState, useCallback } from 'react';
import { mcpClient, type McpToolResult } from '@/lib/mcp-client';

export interface McpToolCall {
  toolName: string;
  args: Record<string, any>;
  timestamp: string;
}

export interface UseMcpToolsReturn {
  callMcpTool: (toolName: string, args: Record<string, any>) => Promise<McpToolResult>;
  mcpResults: McpToolResult[];
  mcpLoading: boolean;
  mcpError: string | null;
  clearMcpResults: () => void;
  isToolAvailable: (toolName: string) => boolean;
  getAvailableTools: () => string[];
}

const AVAILABLE_TOOLS = [
  'searchDocuments',
  'getMedicalTestCost'
];

export function useMcpTools(): UseMcpToolsReturn {
  const [mcpResults, setMcpResults] = useState<McpToolResult[]>([]);
  const [mcpLoading, setMcpLoading] = useState(false);
  const [mcpError, setMcpError] = useState<string | null>(null);

  const callMcpTool = useCallback(async (toolName: string, args: Record<string, any>): Promise<McpToolResult> => {
    setMcpLoading(true);
    setMcpError(null);

    try {
      const result = await mcpClient.callTool({
        tool: toolName,
        arguments: args
      });

      setMcpResults(prev => [...prev, result]);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      setMcpError(errorMessage);
      
      const errorResult: McpToolResult = {
        tool: toolName,
        arguments: args,
        result: {
          success: false,
          error: errorMessage
        },
        timestamp: new Date().toISOString(),
        server: 'Error'
      };
      
      setMcpResults(prev => [...prev, errorResult]);
      return errorResult;
    } finally {
      setMcpLoading(false);
    }
  }, []);

  const clearMcpResults = useCallback(() => {
    setMcpResults([]);
    setMcpError(null);
  }, []);

  const isToolAvailable = useCallback((toolName: string): boolean => {
    return AVAILABLE_TOOLS.includes(toolName);
  }, []);

  const getAvailableTools = useCallback((): string[] => {
    return [...AVAILABLE_TOOLS];
  }, []);

  return {
    callMcpTool,
    mcpResults,
    mcpLoading,
    mcpError,
    clearMcpResults,
    isToolAvailable,
    getAvailableTools
  };
}

// Utility function to format MCP results for display
export function formatMcpResult(result: McpToolResult): string {
  if (!result.result.success) {
    return `❌ **${result.tool}** failed: ${result.result.error}`;
  }

  const data = result.result.data;
  
  switch (result.tool) {
    case 'searchDocuments':
      return `📄 **Document Search**: Found relevant health insurance and medical information`;
    
    case 'getMedicalTestCost':
      return `💰 **Medical Test Cost**: Retrieved cost information for medical procedure`;
    
    default:
      return `✅ **${result.tool}** completed successfully`;
  }
}

// Helper function to suggest MCP tools based on user input
export function suggestMcpTool(userInput: string): string | null {
  const input = userInput.toLowerCase();
  
  if (input.includes('search') || input.includes('find') || input.includes('coverage') || input.includes('insurance') || input.includes('policy')) {
    return 'searchDocuments';
  }
  
  if (input.includes('cost') || input.includes('price') || input.includes('how much') || input.includes('expensive')) {
    return 'getMedicalTestCost';
  }
  
  return null;
}