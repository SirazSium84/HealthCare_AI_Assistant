# MCP (Model Context Protocol) Beginner's Guide

## What is MCP?

**Model Context Protocol (MCP)** is a standardized way for AI applications to interact with external tools and data sources. Think of it as a bridge that lets your AI assistant access real-world tools like databases, APIs, file systems, and custom business logic.

## How MCP Works in This Healthcare AI Project

This project demonstrates MCP implementation with a **healthcare AI assistant** that can:
- 📄 Analyze insurance documents
- 💰 Get medical procedure cost intelligence  
- 🗄️ Manage session data

---

## 🏗️ Architecture Overview

```
Frontend (React/Next.js) ←→ MCP Client ←→ MCP Server ←→ Tools & Data Sources
```

### Core Components

1. **MCP Client** (`lib/mcp-client.ts`) - Frontend interface to MCP server
2. **MCP Server** (`app/[transport]/route.ts`) - Backend that hosts the tools
3. **MCP Types** (`types/mcp.ts`) - TypeScript interfaces for type safety
4. **React Hooks** (`hooks/use-mcp-tools.ts`) - UI integration helpers

---

## 📁 File Structure & Connections

### 1. MCP Client (`lib/mcp-client.ts`)

The **frontend client** that communicates with your MCP server:

```typescript
export class HealthcareMcpClient {
  private baseUrl: string;
  private transport: string;

  async callTool(toolCall: McpToolCall): Promise<McpToolResult> {
    const url = `${this.baseUrl}/${this.transport}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toolCall),
    });
    return await response.json();
  }
}
```

**Key Features:**
- 🌐 HTTP transport for communication
- 🛡️ Error handling with fallback responses
- 🏥 Healthcare-specific tool methods (insurance analysis, cost intelligence)

### 2. MCP Server (`app/[transport]/route.ts`)

The **backend server** that hosts your MCP tools:

```typescript
const HEALTHCARE_TOOLS = {
  analyze_insurance_info: {
    name: 'analyze_insurance_info',
    description: 'Extract key information and analyze insurance coverage',
    handler: async (args: { query: string, coverageType?: string }) => {
      // Tool implementation
      return { success: true, data: result };
    }
  },
  // More tools...
};
```

**Key Features:**
- 🔧 3 healthcare-focused tools
- 📡 HTTP/SSE transport support
- ✅ Input validation and error handling

### 3. Type Definitions (`types/mcp.ts`)

**TypeScript interfaces** for type safety across the entire MCP system:

```typescript
export interface McpToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
  };
  handler: McpToolHandler;
}
```

**Benefits:**
- 🔒 Type safety for tool calls and responses
- 📋 Clear contracts between client and server
- 🏥 Healthcare-specific types (insurance analysis, cost estimates)

### 4. React Integration (`hooks/use-mcp-tools.ts`)

**React hook** for easy MCP integration in your UI:

```typescript
export function useMcpTools(): UseMcpToolsReturn {
  const [mcpResults, setMcpResults] = useState<McpToolResult[]>([]);
  const [mcpLoading, setMcpLoading] = useState(false);

  const callMcpTool = useCallback(async (toolName: string, args: any) => {
    const result = await mcpClient.callTool({ tool: toolName, arguments: args });
    setMcpResults(prev => [...prev, result]);
    return result;
  }, []);

  return { callMcpTool, mcpResults, mcpLoading, /* ... */ };
}
```

**Features:**
- ⚛️ React state management
- 🔄 Loading states and error handling
- 🎯 Tool suggestion based on user input

---

## 🔧 Available Tools

### 1. **Insurance Analysis** (`analyze_insurance_info`)
```typescript
// Usage
await mcpClient.analyzeInsuranceInfo(
  "policy details deductible copay", 
  "medical"
);
```
- **Purpose:** Extract policy numbers, amounts, dates from insurance documents
- **Input:** Query string + coverage type (medical/dental/vision)
- **Output:** Structured data with policy info and coverage analysis

### 2. **Cost Intelligence** (`get_cost_intelligence`)
```typescript
// Usage  
await mcpClient.getCostIntelligence("MRI brain", "California");
```
- **Purpose:** Get real-world pricing for medical procedures
- **Input:** Procedure name + location (optional)
- **Output:** Cost breakdown with saving tips

### 3. **Session Management** (`manage_session`)
```typescript
// Usage
await mcpClient.manageSession("info");        // Get session info
await mcpClient.manageSession("clear");       // Clear documents
await mcpClient.manageSession("initialize");  // Reset session
```
- **Purpose:** Manage document sessions and cleanup
- **Input:** Action type (info/clear/initialize)
- **Output:** Session status and metadata

---

## 🚀 How Data Flows

### 1. **User Interaction** → **React Component**
```typescript
// In your React component
const { callMcpTool, mcpResults, mcpLoading } = useMcpTools();

const handleAnalyzeInsurance = async () => {
  await callMcpTool('analyze_insurance_info', {
    query: 'find policy number and deductible',
    coverageType: 'medical'
  });
};
```

### 2. **React Hook** → **MCP Client**
```typescript
// hooks/use-mcp-tools.ts calls lib/mcp-client.ts
const result = await mcpClient.callTool({
  tool: toolName,
  arguments: args
});
```

### 3. **MCP Client** → **MCP Server** 
```typescript
// HTTP POST to /[transport] endpoint
fetch(`${baseUrl}/${transport}`, {
  method: 'POST',
  body: JSON.stringify({ tool: 'analyze_insurance_info', arguments: {...} })
});
```

### 4. **MCP Server** → **Tool Handler**
```typescript
// app/[transport]/route.ts executes the tool
const toolDef = HEALTHCARE_TOOLS[tool];
const result = await toolDef.handler(args);
```

### 5. **Tool Handler** → **External Services**
```typescript
// Tool accesses your data sources
const { contextDocuments } = await performRetrieval(query);
const costInfo = await searchMedicalTestCost(procedure);
```

---

## 🎯 Key Integration Points

### **Session Manager Integration**
```typescript
// lib/session-manager.ts connects to MCP tools
export class SessionManager {
  async initializeSession(): Promise<void> {
    if (this.config.clearOnStart) {
      await this.clearPreviousDocuments();
    }
  }
}
```

### **Testing Interface** (`app/mcp-tools/page.tsx`)
- 🧪 Live testing environment for all MCP tools
- 📊 Real-time results display
- ⚙️ Parameter configuration UI

---

## 🎓 Learning Path

### **Beginner (Start Here)**
1. ✅ Understand the MCP concept (client ↔ server ↔ tools)
2. ✅ Explore `types/mcp.ts` to understand data structures
3. ✅ Look at `lib/mcp-client.ts` to see how clients work
4. ✅ Visit `/mcp-tools` page to test tools interactively

### **Intermediate**
1. 🔍 Study `app/[transport]/route.ts` to understand server implementation
2. 🎣 Examine `hooks/use-mcp-tools.ts` for React integration patterns
3. 🔧 Modify existing tools or add new parameters

### **Advanced**
1. ➕ Add your own MCP tools to `HEALTHCARE_TOOLS`
2. 🌐 Implement different transport mechanisms (SSE, WebSockets)
3. 🏗️ Build MCP tools that connect to your own APIs/databases

---

## 🛠️ Quick Start Guide  

### **1. Test Existing Tools**
Visit `http://localhost:3000/mcp-tools` to interact with tools directly.

### **2. Add a New Tool**
```typescript
// In app/[transport]/route.ts
const HEALTHCARE_TOOLS = {
  // ... existing tools
  my_new_tool: {
    name: 'my_new_tool',
    description: 'My custom healthcare tool',
    handler: async (args: { input: string }) => {
      // Your tool logic here
      return { success: true, data: 'Tool result' };
    }
  }
};
```

### **3. Use in React Component**
```typescript
// In your React component
const { callMcpTool } = useMcpTools();

const handleCustomTool = async () => {
  const result = await callMcpTool('my_new_tool', { input: 'test' });
  console.log(result);
};
```

---

## 📚 Key Concepts Recap

- **MCP Client**: Frontend interface (like a remote control)
- **MCP Server**: Backend that hosts tools (like a toolbox)
- **Transport**: Communication method (HTTP, SSE, WebSocket)
- **Tools**: Individual functions your AI can use
- **Types**: TypeScript contracts ensuring everything fits together

This healthcare AI project shows MCP in action with real-world tools for document analysis, cost intelligence, and session management. Start with the testing interface, then dive into the code to understand how each piece connects! 🚀