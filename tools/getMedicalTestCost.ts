import { z } from "zod";
import { searchMedicalTestCost } from '@/lib/google-search';

export const getMedicalTestCostTool = {
  name: "getMedicalTestCost",
  description: "Search for cost estimates of medical tests and procedures using web search",
  schema: z.object({
    testName: z.string().describe("The name of the medical test or procedure to search for cost information")
  }),
  handler: async ({ testName }: { testName: string }) => {
    try {
      console.log(`💰 Getting cost information for: "${testName}"`);
      const costInfo = await searchMedicalTestCost(testName);
      
      return {
        content: [
          {
            type: "text" as const,
            text: costInfo
          }
        ]
      };
    } catch (error: any) {
      console.error(`❌ Error getting medical test cost:`, error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error getting medical test cost: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
}; 