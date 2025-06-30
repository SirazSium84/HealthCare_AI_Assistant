import { ToolInvocation, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { HealthcareMcpClient } from '@/lib/mcp-client';
import type { McpToolDefinition } from '@/types/mcp';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();
  
  // Create MCP client with the correct base URL for server-side usage
  const url = new URL(req.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const mcpClient = new HealthcareMcpClient(baseUrl);

  // Use static tool definitions that match our MCP server
  console.log('🔧 Using static MCP tools: searchDocuments, getMedicalTestCost');

  // Convert MCP tools to AI SDK format
  const tools: Record<string, any> = {
    searchDocuments: {
      description: 'Search through vectorized documents to find relevant information based on questions regarding Health Insurance and Medical procedures',
      parameters: z.object({
        query: z.string().describe('The search query to find relevant documents'),
      }),
      execute: async ({ query }: { query: string }) => {
        console.log(`🔧 Calling MCP tool: searchDocuments with args:`, { query });
        const result = await mcpClient.callTool({
          tool: 'searchDocuments',
          arguments: { query }
        });
        
        if (result.result.success) {
          console.log(`✅ MCP searchDocuments succeeded`);
          return result.result.data;
        } else {
          console.error(`❌ MCP searchDocuments failed:`, result.result.error);
          throw new Error(result.result.error || 'MCP searchDocuments failed');
        }
      },
    },
    getMedicalTestCost: {
      description: 'Search for cost estimates of medical tests and procedures using web search',
      parameters: z.object({
        testName: z.string().describe('The name of the medical test or procedure to search for cost information'),
      }),
      execute: async ({ testName }: { testName: string }) => {
        console.log(`🔧 Calling MCP tool: getMedicalTestCost with args:`, { testName });
        const result = await mcpClient.callTool({
          tool: 'getMedicalTestCost',
          arguments: { testName }
        });
        
        if (result.result.success) {
          console.log(`✅ MCP getMedicalTestCost succeeded`);
          return result.result.data;
        } else {
          console.error(`❌ MCP getMedicalTestCost failed:`, result.result.error);
          throw new Error(result.result.error || 'MCP getMedicalTestCost failed');
        }
      },
    }
  };

  const result = streamText({
    model: openai('gpt-4o'),
    system: `You are a helpful AI assistant specializing in health insurance and medical information. 

You have access to healthcare tools that can:
- Search through vectorized healthcare documents 
- Get medical test cost estimates
- And other healthcare-specific functions

**CRITICAL: When you receive document search results, you MUST:**
1. Extract and state EXACT percentages, dollar amounts, and specific coverage details from the documents
2. If documents mention coinsurance rates (like 20%, 40%), state them directly
3. If documents mention deductible amounts or requirements, include them
4. Do NOT include document citations or references like "[Document 1]" or "[Chunk 1]"
5. Do NOT say "details are not mentioned" - look harder for specific numbers and percentages
6. NEVER add disclaimers about contacting insurance - give the specific answer from the documents

**FORMATTING REQUIREMENTS:**
- Use proper bullet points (•) NOT hyphens (-) for lists
- Keep responses concise and direct - no hedge words like "typically" or "generally"
- Use **bold** for important terms like coverage types or percentages
- Organize information logically (e.g., In-Network vs Out-of-Network)
- NO disclaimers about "check with your provider" - just give the facts
- Use clean line breaks and spacing for readability

Be proactive in using the appropriate tool based on the user's question type.`,
    messages,
    onStepFinish: (stepResult) => {
      if (stepResult.toolCalls && stepResult.toolCalls.length > 0) {
        console.log('\n🔧 Tools Used:');
        stepResult.toolCalls.forEach((toolCall, index) => {
          console.log(`  ${index + 1}. ${toolCall.toolName} - ${JSON.stringify(toolCall.args)}`);
        });
        console.log('');
      }
    },
    tools,
  });

  return result.toDataStreamResponse();
}

// Helper function to convert MCP input schema to Zod schema
function convertMcpSchemaToZod(mcpSchema: any): any {
  const zodSchema: Record<string, any> = {};
  
  if (mcpSchema.properties) {
    for (const [key, prop] of Object.entries(mcpSchema.properties as Record<string, any>)) {
      if (prop.type === 'string') {
        zodSchema[key] = z.string().describe(prop.description || '');
      } else if (prop.type === 'number') {
        zodSchema[key] = z.number().describe(prop.description || '');
      } else if (prop.type === 'boolean') {
        zodSchema[key] = z.boolean().describe(prop.description || '');
      } else {
        zodSchema[key] = z.any().describe(prop.description || '');
      }
    }
  }
  
  return z.object(zodSchema);
}
