import { ToolInvocation, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { HealthcareMcpClient } from '@/lib/mcp-client';

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

  const result = streamText({
    model: openai('gpt-4o'),
    system: `You are a helpful AI assistant specializing in health insurance and medical information. You have access to two tools that you should use strategically:

**Tool Usage Rules:**
1. **getMedicalTestCost**: Use ONLY when the user specifically asks for cost estimates, pricing, or "how much does X cost"
2. **searchDocuments**: Use for ALL other questions about health insurance, medical procedures, coverage, benefits, etc.

**When to use getMedicalTestCost:**
- "What does an MRI cost?"
- "How much is a blood test?"
- "What's the price of a colonoscopy?"
- Any question specifically asking for cost/price estimates

**When to use searchDocuments:**
- Health insurance coverage questions
- Medical procedure information
- Benefits and policy questions
- Treatment recommendations
- ALL non-pricing healthcare questions

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

Be proactive in using the appropriate tool based on the user's question type. Do not use both tools unless the user specifically asks for both cost AND coverage information.`,
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
    tools: {
      searchDocuments: {
        description: 'Search through vectorized documents to find relevant information based on questions regarding Health Insurance and Medical procedures',
        parameters: z.object({
          query: z.string().describe('The search query to find relevant documents'),
        }),
        execute: async ({ query }) => {
          console.log(`🔍 Calling MCP searchDocuments tool for: "${query}"`);
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
        execute: async ({ testName }) => {
          console.log(`💰 Calling MCP getMedicalTestCost tool for: "${testName}"`);
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
      },
    },
  });

  return result.toDataStreamResponse();
}
