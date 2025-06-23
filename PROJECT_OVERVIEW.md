# 🏥 Healthcare AI Assistant - Project Overview

A beginner-friendly guide to understanding this Next.js TypeScript project structure and how everything connects together.

## 📁 Project Structure Overview

```
rag-next-typescript/
├── 📂 app/                     # Next.js App Router (main application)
├── 📂 components/              # Reusable UI components
├── 📂 lib/                     # Utility functions and business logic
├── 📂 types/                   # TypeScript type definitions
├── 📂 public/                  # Static assets (images, icons)
└── 📄 Configuration files      # Package.json, tsconfig, etc.
```

## 🗂️ Directory Breakdown

### 📂 `app/` - Main Application (Next.js App Router)

This is the heart of our application using Next.js 13+ App Router pattern.

#### `app/page.tsx` - Homepage & Main Chat Interface
```typescript
// Main React component that users see
export default function HealthInsuranceChat() {
  // Uses AI SDK's useChat hook to manage chat state
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/agent",  // 👈 Connects to our API endpoint
    maxSteps: 5,
  })
}
```
**What it does:**
- Renders the main chat interface with beautiful UI
- Manages chat state (messages, loading, input)
- Sends user messages to `/api/agent` endpoint
- Displays AI responses with proper formatting

#### `app/layout.tsx` - Root Layout
```typescript
// Wraps all pages with common HTML structure
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

#### `app/api/agent/route.ts` - AI Agent API Endpoint
```typescript
// POST request handler for chat messages
export async function POST(req: Request) {
  // 1. Get user message from request
  const { messages } = await req.json()
  
  // 2. Configure AI with tools and system prompt
  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      searchDocuments,      // 👈 Document search tool
      getMedicalTestCost,   // 👈 Cost lookup tool
    },
    maxSteps: 5,
  })
  
  // 3. Return streaming response
  return result.toDataStreamResponse()
}
```
**Key Connection:** This receives messages from `page.tsx` and returns AI responses

#### `app/api/chat/route.ts` - Legacy Chat Endpoint
- Original simple RAG implementation
- Now superseded by the agent endpoint
- Shows simpler pattern without tool calling

### 📂 `components/` - Reusable UI Components

#### `components/ui/` - Base UI Components (shadcn/ui)
These are pre-built, customizable components:
- `button.tsx` - Styled button component
- `input.tsx` - Form input component  
- `card.tsx` - Container component
- `scroll-area.tsx` - Custom scrollable area
- `badge.tsx` - Small label component

#### `components/agent-chat.tsx` - Agent Chat Component
```typescript
// Reusable chat component (alternative to main page)
export default function AgentChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/agent'  // 👈 Same API as main page
  })
}
```

### 📂 `lib/` - Business Logic & Utilities

#### `lib/retrieval.ts` - Document Search Logic
```typescript
// Searches vectorized documents using Vectorize.io
export async function searchDocuments(query: string): Promise<string> {
  // 1. Create embedding from query
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  })
  
  // 2. Search vector database
  const results = await vectorize.query(embedding.data[0].embedding, {
    topK: 5,
    returnMetadata: true,
  })
  
  // 3. Return formatted results
  return results.matches.map(match => match.metadata?.text).join('\n')
}
```
**Used by:** `app/api/agent/route.ts` as a tool

#### `lib/google-search.ts` - Medical Cost Search
```typescript
// Searches Google for medical test costs
export async function searchMedicalCosts(query: string): Promise<string> {
  // 1. Call Google Custom Search API
  const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodedQuery}`)
  
  // 2. Extract and format cost information
  const results = data.items || []
  return results.map(item => `${item.title}: ${item.snippet}`).join('\n')
}
```
**Used by:** `app/api/agent/route.ts` as a tool

#### `lib/vectorize.ts` - Vector Database Client
```typescript
// Client for Cloudflare Vectorize
export const vectorize = new Vectorize({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  apiToken: process.env.CLOUDFLARE_API_TOKEN!,
  indexName: process.env.VECTORIZE_INDEX_NAME!,
})
```
**Used by:** `lib/retrieval.ts` for document search

#### `lib/utils.ts` - Utility Functions
```typescript
// Helper function for CSS class merging (from shadcn/ui)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### `lib/consts.ts` - Constants
- Contains configuration values
- API endpoints, default settings, etc.

### 📂 `types/` - TypeScript Type Definitions

#### `types/chat.ts` - Chat-related Types
```typescript
// Defines the structure of chat messages
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: Date
}

// Tool call types for AI agent
export interface ToolCall {
  toolName: string
  args: Record<string, any>
}
```

#### `types/vectorize.ts` - Vector Database Types
```typescript
// Types for Vectorize.io integration
export interface VectorizeMatch {
  id: string
  score: number
  metadata?: Record<string, any>
}
```

## 🔄 Data Flow & Connections

### 1. User Interaction Flow
```
User types message in UI (page.tsx)
    ↓
useChat hook sends POST to /api/agent
    ↓
Agent API processes message with AI + tools
    ↓
Streaming response back to UI
    ↓
UI updates with AI response
```

### 2. Tool Calling Flow
```
AI receives user question
    ↓
AI decides which tool to use:
    ├── "How much does MRI cost?" → getMedicalTestCost
    └── "What's covered?" → searchDocuments
    ↓
Tool executes and returns data
    ↓
AI formats response for user
```

### 3. Document Search Flow
```
searchDocuments tool called
    ↓
lib/retrieval.ts creates embedding
    ↓
lib/vectorize.ts queries database
    ↓
Results returned to AI agent
    ↓
AI formats for user response
```

## 🛠️ Key Technologies & Concepts

### **Next.js App Router**
- Modern React framework with file-based routing
- `app/` directory defines routes automatically
- Server and client components

### **AI SDK (@ai-sdk/react)**
- `useChat` hook manages chat state
- `streamText` enables streaming AI responses
- Tool calling for multi-step reasoning

### **TypeScript**
- Static typing for JavaScript
- Interfaces define data shapes
- Better development experience with autocomplete

### **shadcn/ui**
- Pre-built, customizable React components
- Uses Tailwind CSS for styling
- Components in `components/ui/`

### **Vector Search (RAG)**
- Documents converted to embeddings (vectors)
- Search by semantic similarity
- Powered by Cloudflare Vectorize

## 🚀 How to Study This Codebase

### **For TypeScript Beginners:**

1. **Start with types/** - Understand data structures
2. **Study components/ui/** - Learn component patterns
3. **Read app/page.tsx** - See how React hooks work
4. **Explore lib/** - Understand business logic separation

### **For React/Next.js Learning:**

1. **app/layout.tsx** - Layout patterns
2. **app/page.tsx** - Component state management
3. **app/api/** - API routes and server-side logic
4. **components/** - Component composition

### **For AI/RAG Learning:**

1. **lib/retrieval.ts** - Vector search implementation
2. **app/api/agent/route.ts** - AI tool calling
3. **lib/google-search.ts** - External API integration

## 📚 Key Functions & Their Connections

| Function | File | Purpose | Called By |
|----------|------|---------|-----------|
| `useChat()` | `app/page.tsx` | Manages chat state | React component |
| `POST()` | `app/api/agent/route.ts` | Handles AI requests | `useChat` hook |
| `searchDocuments()` | `lib/retrieval.ts` | Searches vectorized docs | AI agent tools |
| `searchMedicalCosts()` | `lib/google-search.ts` | Gets cost data | AI agent tools |
| `streamText()` | `app/api/agent/route.ts` | Generates AI responses | API endpoint |

## 🎯 Learning Path Recommendations

1. **Start Simple:** Look at `app/page.tsx` to understand the UI
2. **Follow the Data:** Trace a message from UI → API → tools → response
3. **Understand Types:** Study `types/` to see data structures
4. **Explore Tools:** See how `lib/` functions power the AI agent
5. **Experiment:** Try modifying prompts, adding new tools, or changing UI

This project is a great example of modern TypeScript development with AI integration! 🚀 