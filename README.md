# 🏥 HealthCare AI Assistant

A sophisticated AI-powered assistant that provides instant answers about health insurance coverage, benefits, and real-time medical cost estimates. Built with Next.js, AI SDK, and advanced tool-calling capabilities.

## 🌟 Features

- **💬 Intelligent Chat Interface**: Beautiful, responsive chat UI with real-time streaming responses
- **📋 Document Search**: Query vectorized health insurance documents for specific coverage details
- **💰 Live Cost Estimates**: Real-time medical test and procedure cost lookup via Google Search
- **🔧 Multi-Step Reasoning**: AI agent can use multiple tools in sequence to provide comprehensive answers
- **🎨 Professional UI**: Healthcare-themed interface with clean, readable design
- **⚡ Real-time Streaming**: Instant response delivery with loading states

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEALTHCARE AI ASSISTANT                     │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Chat UI       │  │  Message Formatting│  │ Tool Indicators │ │
│  │  - User Input   │  │  - Markdown       │  │ - Visual Cues   │ │
│  │  - Message Feed │  │  - Bold/Bullets   │  │ - Loading States│ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER (/api/agent)                      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                AI SDK + OpenAI GPT-4o                     │ │
│  │  • Multi-step tool calling                               │ │
│  │  • Intelligent tool selection                            │ │
│  │  • Response streaming                                    │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐
│       TOOL: searchDocuments │    │   TOOL: getMedicalTestCost  │
│                             │    │                             │
│  ┌─────────────────────────┐│    │ ┌─────────────────────────┐ │
│  │    Vectorize Service    ││    │ │   Google Custom Search  │ │
│  │  • Document retrieval  ││    │ │  • Medical cost lookup  │ │
│  │  • Semantic search     ││    │ │  • Real-time pricing    │ │
│  │  • Context formatting  ││    │ │  • Cost extraction      │ │
│  └─────────────────────────┘│    │ └─────────────────────────┘ │
└─────────────────────────────┘    └─────────────────────────────┘
                    │                              │
                    ▼                              ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐
│     VECTORIZED DOCUMENTS    │    │      GOOGLE SEARCH API      │
│                             │    │                             │
│  • Health insurance docs   │    │  • Live web search          │
│  • Coverage details        │    │  • Medical test pricing     │
│  • Policy information      │    │  • Healthcare costs         │
│  • Benefits & procedures   │    │  • Real-time data           │
└─────────────────────────────┘    └─────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- OpenAI API key
- Google Custom Search API credentials
- Vectorize service credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rag-next-typescript
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   
   Create `.env.local` with the following variables:
   ```bash
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   
   # Google Custom Search API
   GOOGLE_API_KEY=your_google_api_key
   GOOGLE_SEARCH_ENGINE_ID=your_custom_search_engine_id
   
   # Vectorize Service
   VECTORIZE_PIPELINE_ACCESS_TOKEN=your_vectorize_access_token
   VECTORIZE_ORGANIZATION_ID=your_organization_id
   VECTORIZE_PIPELINE_ID=your_pipeline_id
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔧 Technical Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS | Modern UI with server-side rendering |
| **AI Engine** | AI SDK v4, OpenAI GPT-4o | Intelligent conversations and tool calling |
| **Document Search** | Vectorize.io | Semantic search through insurance documents |
| **Cost Search** | Google Custom Search API | Real-time medical cost information |
| **UI Components** | Shadcn/ui, Lucide Icons | Professional healthcare interface |
| **Styling** | Tailwind CSS v4 | Responsive, modern design system |

## 🛠️ Key Components

### Agent System (`/app/api/agent/route.ts`)
- **Multi-step tool calling** with intelligent tool selection
- **Two specialized tools**: Document search and cost estimation
- **Streaming responses** for real-time user experience
- **Smart formatting** with professional output guidelines

### Document Retrieval (`/lib/retrieval.ts`)
- **Vectorized search** through health insurance documents
- **Semantic matching** for relevant content discovery
- **Structured responses** with sources and context

### Google Search Integration (`/lib/google-search.ts`)
- **Real-time cost lookup** for medical procedures
- **Intelligent cost extraction** from search results
- **Formatted pricing** with clear, actionable information

### Frontend (`/app/page.tsx`)
- **Modern chat interface** with healthcare theming
- **Message formatting** with markdown support
- **Loading states** and visual feedback
- **Responsive design** for all devices

## 💡 Usage Examples

### Coverage Questions
```
User: "Does insurance cover MRI?"
Assistant: 
• In-Network: 20% coinsurance after deductible
• Out-of-Network: 40% coinsurance after deductible
```

### Cost Inquiries
```
User: "How much does a blood test cost?"
Assistant: Based on current data: $25-$100, $50-$200, $75-$150
```

### Complex Queries
```
User: "What's the coverage and cost for a colonoscopy?"
Assistant: [Uses both tools to provide comprehensive coverage AND cost information]
```

## 🔍 Tool Selection Logic

The AI agent intelligently selects tools based on query intent:

- **Document Search (`searchDocuments`)**: 
  - Insurance coverage questions
  - Policy benefits and limitations
  - Medical procedure information
  - General healthcare queries

- **Cost Search (`getMedicalTestCost`)**:
  - Price estimates and cost inquiries
  - "How much does X cost?" queries
  - Medical test pricing
  - Procedure cost comparisons

## 📁 Project Structure

```
rag-next-typescript/
├── app/
│   ├── api/
│   │   ├── agent/          # AI agent endpoint
│   │   └── chat/           # Legacy chat endpoint
│   ├── agent/              # Simple agent page (backup)
│   ├── page.tsx            # Main chat interface
│   └── layout.tsx          # App layout
├── components/
│   ├── ui/                 # Shadcn UI components
│   └── agent-chat.tsx      # Chat component (legacy)
├── lib/
│   ├── retrieval.ts        # Document search logic
│   ├── google-search.ts    # Cost search logic
│   ├── vectorize.ts        # Vectorize service
│   └── utils.ts            # Utility functions
├── types/
│   ├── chat.ts             # Chat-related types
│   └── vectorize.ts        # Vectorize types
└── .env.local              # Environment variables
```

## 🔒 Security & Best Practices

- **Environment variables** for all sensitive credentials
- **Input validation** on all user queries
- **Rate limiting** on API endpoints (recommended for production)
- **Error handling** with graceful degradation
- **No client-side exposure** of API keys

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
```

### Docker
```dockerfile
# Dockerfile included for containerized deployment
docker build -t healthcare-ai .
docker run -p 3000:3000 healthcare-ai
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Check the [documentation](docs/)
- Review environment setup requirements

---

**Built with ❤️ for better healthcare information access**
