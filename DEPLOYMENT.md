# Vercel Deployment Guide

## ✅ Deployment Readiness Status

**Your healthcare AI assistant is READY for Vercel deployment!** 🚀

## 📋 Pre-Deployment Checklist

✅ **Build Success** - Project builds without errors  
✅ **Dependencies** - All packages compatible with Vercel  
✅ **MCP Integration** - Vercel MCP Adapter properly configured  
✅ **API Routes** - All endpoints properly structured  
✅ **Static Assets** - Optimized for production  

## 🔧 Required Environment Variables

Configure these in your Vercel dashboard:

### **OpenAI Configuration**
```
OPENAI_API_KEY=your_openai_api_key_here
```

### **Pinecone Vector Database**
```
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=healthcare-docs
```

### **Google Search API (for cost intelligence)**
```
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

### **Vectorize.io (optional - for alternative vector search)**
```
VECTORIZE_PIPELINE_ACCESS_TOKEN=your_vectorize_token_here
VECTORIZE_ORGANIZATION_ID=your_org_id_here
VECTORIZE_PIPELINE_ID=your_pipeline_id_here
```

## 🚀 Deployment Steps

### **1. Push to GitHub**
✅ Already completed - code is in `healthcare-assistant-mcp-test` repository

### **2. Connect to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import `healthcare-assistant-mcp-test` repository

### **3. Configure Environment Variables**
1. In Vercel project settings → Environment Variables
2. Add all required variables from the list above
3. Make sure to add them for all environments (Production, Preview, Development)

### **4. Deploy**
Vercel will automatically:
- ✅ Install dependencies with `pnpm`
- ✅ Build the project with `next build`
- ✅ Deploy to global CDN
- ✅ Provide HTTPS domain

## 🔗 MCP Integration for Production

### **Important Notes:**
- **Claude Desktop Integration**: Will work with your deployed Vercel URL
- **Update Bridge Configuration**: Change `MCP_SERVER_URL` to your Vercel domain
- **HTTPS Required**: Claude Desktop requires HTTPS (Vercel provides this automatically)

### **Production Bridge Configuration:**
```json
{
  "mcpServers": {
    "healthcare-ai-assistant": {
      "command": "node",
      "args": ["./scripts/simple-mcp-bridge.js"],
      "env": {
        "MCP_SERVER_URL": "https://your-project.vercel.app/mcp"
      }
    }
  }
}
```

## 🎯 Features Available After Deployment

### **✅ Web Interface**
- Document upload and processing
- Real-time chat with AI assistant
- Cost intelligence queries
- Insurance document analysis

### **✅ API Endpoints**
- `/api/agent` - Main chat API with MCP tools
- `/api/upload-pinecone` - Document upload to vector database
- `/api/session` - Session management
- `/mcp` - MCP server for Claude Desktop integration

### **✅ MCP Tools**
- `searchDocuments` - Vector search through healthcare documents
- `getMedicalTestCost` - Medical procedure cost estimates

## ⚠️ Production Considerations

### **Performance**
- ✅ **Static Generation** - Fast page loads
- ✅ **API Optimization** - Efficient database queries
- ✅ **CDN Delivery** - Global edge network

### **Security**
- ✅ **Environment Variables** - Secrets properly secured
- ✅ **HTTPS** - All traffic encrypted
- ✅ **API Rate Limiting** - Built into providers

### **Monitoring**
- Monitor Vercel function logs
- Track API usage (OpenAI, Pinecone, Google)
- Watch for MCP connection issues

## 🔧 Troubleshooting

### **Common Issues:**
1. **Build Failures**: Check environment variables are set
2. **MCP Connection**: Verify HTTPS URL in bridge configuration
3. **API Limits**: Monitor OpenAI/Pinecone usage
4. **PDF Processing**: May need Vercel Pro for larger files

### **Debug Steps:**
1. Check Vercel function logs
2. Test MCP endpoint directly: `https://your-domain.vercel.app/mcp`
3. Verify environment variables in Vercel dashboard

## 📈 Scaling Considerations

### **Free Tier Limits:**
- Function execution time: 10 seconds
- Function memory: 1024 MB
- Bandwidth: 100 GB/month

### **For Production Use:**
- Consider Vercel Pro for:
  - Longer function execution times
  - More memory for PDF processing
  - Higher bandwidth limits
  - Advanced analytics

## 🎉 Ready to Deploy!

Your healthcare AI assistant with MCP integration is production-ready. Simply:

1. **Import to Vercel** from GitHub
2. **Add environment variables**
3. **Deploy**
4. **Update Claude Desktop configuration** with your new HTTPS URL

**Estimated deployment time: 5-10 minutes** ⚡ 