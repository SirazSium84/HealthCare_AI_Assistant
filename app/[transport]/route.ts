// Healthcare AI Assistant MCP Server using Vercel MCP Adapter
import { createMcpHandler } from "@vercel/mcp-adapter";
import { 
  searchDocumentsTool,
  getMedicalTestCostTool,
  uploadDocumentTool
} from "../../tools";

const handler = createMcpHandler(
  async (server) => {
    // Register Search Documents Tool
    server.tool(
      searchDocumentsTool.name,
      searchDocumentsTool.description,
      searchDocumentsTool.schema.shape,
      searchDocumentsTool.handler
    );

    // Register Medical Test Cost Tool
    server.tool(
      getMedicalTestCostTool.name,
      getMedicalTestCostTool.description,
      getMedicalTestCostTool.schema.shape,
      getMedicalTestCostTool.handler
    );

    // Register Document Upload Tool
    server.tool(
      uploadDocumentTool.name,
      uploadDocumentTool.description,
      uploadDocumentTool.schema.shape,
      uploadDocumentTool.handler
    );
  },
  {},
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    // Add Redis configuration if available
    // ...(isRedisAvailable() && { redisUrl: getRedisUrl() }),
  }
);

export { handler as GET, handler as POST, handler as DELETE };