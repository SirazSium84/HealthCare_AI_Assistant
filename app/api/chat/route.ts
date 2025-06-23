import { openai } from "@ai-sdk/openai"
import { streamText, tool } from "ai"
import { z } from "zod"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: `You are a helpful health insurance AI assistant. You help users understand their health insurance coverage, benefits, and medical costs.

When responding:
- Use clear, structured formatting with bullet points and bold headings
- Be professional but friendly
- Always remind users to verify information with their insurance provider
- Format responses with proper structure using markdown-like syntax:
  - Use **text** for bold headings
  - Use • or - for bullet points
  - Use clear paragraphs for readability

You have access to two tools:
1. Document search - for finding information about coverage and benefits
2. Google search - for finding current medical test and procedure costs`,
    tools: {
      document_search: tool({
        description: "Search through insurance policy documents and coverage information",
        parameters: z.object({
          query: z.string().describe("The search query for insurance documents"),
          document_type: z.enum(["policy", "benefits", "coverage", "claims"]).optional(),
        }),
        execute: async ({ query, document_type }) => {
          // Simulate document search
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Mock response based on query
          if (query.toLowerCase().includes("deductible")) {
            return {
              results: [
                {
                  title: "Annual Deductible Information",
                  content:
                    "Your annual deductible is $1,500 for individual coverage. This must be met before insurance begins covering costs at the coinsurance rate.",
                  source: "Policy Document - Section 4.2",
                },
              ],
            }
          } else if (query.toLowerCase().includes("specialist")) {
            return {
              results: [
                {
                  title: "Specialist Referral Requirements",
                  content:
                    "Referrals are required for most specialists except dermatology, gynecology, and mental health services.",
                  source: "Benefits Summary - Page 12",
                },
              ],
            }
          } else {
            return {
              results: [
                {
                  title: "General Coverage Information",
                  content:
                    "Your plan covers preventive care at 100%, emergency services with $250 copay, and prescription drugs with tiered copays.",
                  source: "Policy Summary",
                },
              ],
            }
          }
        },
      }),
      google_search: tool({
        description: "Search for current medical test and procedure costs",
        parameters: z.object({
          query: z.string().describe("The medical test or procedure to search for"),
          location: z.string().optional().describe("Geographic location for cost estimates"),
        }),
        execute: async ({ query, location }) => {
          // Simulate Google search
          await new Promise((resolve) => setTimeout(resolve, 1500))

          // Mock response based on query
          if (query.toLowerCase().includes("mri")) {
            return {
              results: [
                {
                  title: "MRI Cost Information",
                  content: `Average MRI costs ${location ? `in ${location}` : "nationally"}:
                  • Brain MRI: $1,000 - $3,000
                  • Knee MRI: $700 - $2,000
                  • Abdominal MRI: $1,200 - $3,500
                  
                  Costs vary significantly by facility and insurance coverage.`,
                  source: "Healthcare Cost Database",
                },
              ],
            }
          } else if (query.toLowerCase().includes("blood work") || query.toLowerCase().includes("blood test")) {
            return {
              results: [
                {
                  title: "Blood Test Cost Information",
                  content: `Common blood test costs:
                  • Complete Blood Count (CBC): $25 - $100
                  • Basic Metabolic Panel: $30 - $150
                  • Lipid Panel: $40 - $200
                  • Thyroid Function Tests: $50 - $300
                  
                  Many insurance plans cover routine blood work as preventive care.`,
                  source: "Medical Cost Reference",
                },
              ],
            }
          } else {
            return {
              results: [
                {
                  title: "Medical Procedure Cost Estimate",
                  content: `Cost information for ${query}:
                  • Costs vary widely based on location, facility, and insurance coverage
                  • Contact your insurance provider for specific coverage details
                  • Consider getting quotes from multiple providers`,
                  source: "Healthcare Pricing Guide",
                },
              ],
            }
          }
        },
      }),
    },
  })

  return result.toDataStreamResponse()
}
