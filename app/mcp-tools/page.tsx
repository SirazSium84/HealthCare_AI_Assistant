"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  FileSearch, 
  Search, 
  Shield, 
  DollarSign, 
  Activity,
  Loader2,
  CheckCircle,
  XCircle,
  Database,
  FileText,
  Settings,
  Home
} from "lucide-react"
import { mcpClient, type McpToolResult } from "@/lib/mcp-client"
import Link from "next/link"

interface ToolTest {
  id: string
  name: string
  description: string
  category: string
  icon: any
  parameters: Array<{
    name: string
    type: string
    required: boolean
    placeholder: string
    options?: string[]
  }>
  defaultArgs: Record<string, any>
}

const TOOL_TESTS: ToolTest[] = [
  // Document Search Tool (moved from agent)
  {
    id: 'searchDocuments',
    name: 'Search Documents',
    description: 'Search through vectorized documents to find relevant information based on questions regarding Health Insurance and Medical procedures',
    category: 'Document Search',
    icon: FileSearch,
    parameters: [
      {
        name: 'query',
        type: 'text',
        required: true,
        placeholder: 'The search query to find relevant documents (e.g., "health insurance coverage", "deductible information")'
      }
    ],
    defaultArgs: { 
      query: 'health insurance deductible copay coverage benefits'
    }
  },

  // Medical Test Cost Tool (moved from agent)
  {
    id: 'getMedicalTestCost',
    name: 'Get Medical Test Cost',
    description: 'Search for cost estimates of medical tests and procedures using web search',
    category: 'Cost Intelligence',
    icon: DollarSign,
    parameters: [
      {
        name: 'testName',
        type: 'text',
        required: true,
        placeholder: 'The name of the medical test or procedure (e.g., "MRI brain", "colonoscopy")'
      }
    ],
    defaultArgs: { 
      testName: 'MRI brain scan'
    }
  }
]

export default function McpToolsPage() {
  const [serverInfo, setServerInfo] = useState<any>(null)
  const [results, setResults] = useState<Record<string, McpToolResult | null>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState<Record<string, Record<string, any>>>({})

  useEffect(() => {
    // Initialize form data with default arguments
    const initialFormData: Record<string, Record<string, any>> = {}
    TOOL_TESTS.forEach(tool => {
      initialFormData[tool.id] = { ...tool.defaultArgs }
    })
    setFormData(initialFormData)

    // Get server info
    mcpClient.getServerInfo().then(setServerInfo).catch(console.error)
  }, [])

  const handleInputChange = (toolId: string, paramName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        [paramName]: value
      }
    }))
  }

  const runTool = async (tool: ToolTest) => {
    setLoading(prev => ({ ...prev, [tool.id]: true }))
    
    try {
      // Process arguments
      const args = { ...formData[tool.id] }
      
      // Convert comma-separated services to array
      if (args.services && typeof args.services === 'string') {
        args.services = args.services.split(',').map((s: string) => s.trim()).filter(Boolean)
      }
      
      const result = await mcpClient.callTool({
        tool: tool.id,
        arguments: args
      })
      
      setResults(prev => ({ ...prev, [tool.id]: result }))
    } catch (error) {
      console.error('Tool execution error:', error)
    } finally {
      setLoading(prev => ({ ...prev, [tool.id]: false }))
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Document Search': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
      case 'Cost Intelligence': return 'from-purple-500/20 to-violet-500/20 border-purple-500/30'
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/30'
    }
  }

  const categories = [...new Set(TOOL_TESTS.map(tool => tool.category))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.08),transparent_50%)]" />
      
      <div className="relative z-10">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="outline" className="glass border-gray-600 text-gray-300 hover:text-white">
                    <Home className="h-4 w-4 mr-2" />
                    Back to Chat
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    MCP Tools Testing
                  </h1>
                  <p className="text-gray-400 mt-1">Test healthcare AI tools directly in the frontend</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Activity className="h-3 w-3 mr-1" />
                  {serverInfo?.status || 'Loading...'}
                </Badge>
                {serverInfo && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {serverInfo.toolsCount} Tools Available
                  </Badge>
                )}
              </div>
            </div>

            {/* Server Info */}
            {serverInfo && (
              <Card className="glass-strong border border-gray-600/50 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Server:</span>
                    <span className="text-white ml-2">{serverInfo.server}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Transport:</span>
                    <span className="text-white ml-2">{serverInfo.transport}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Version:</span>
                    <span className="text-white ml-2">{serverInfo.version}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {serverInfo.capabilities?.map((capability: string, index: number) => (
                    <Badge key={index} className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Tools by Category */}
          {categories.map(category => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-400" />
                {category}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {TOOL_TESTS.filter(tool => tool.category === category).map(tool => {
                  const Icon = tool.icon
                  const result = results[tool.id]
                  const isLoading = loading[tool.id]
                  
                  return (
                    <Card key={tool.id} className={`glass border-2 ${getCategoryColor(category)} p-6 shadow-professional`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                            <Icon className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{tool.name}</h3>
                            <p className="text-sm text-gray-400">{tool.description}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => runTool(tool)}
                          disabled={isLoading}
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Parameters */}
                      <div className="space-y-3 mb-4">
                        {tool.parameters.map(param => (
                          <div key={param.name}>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              {param.name}
                              {param.required && <span className="text-red-400 ml-1">*</span>}
                            </label>
                            {param.type === 'select' ? (
                              <select
                                value={formData[tool.id]?.[param.name] || ''}
                                onChange={(e) => handleInputChange(tool.id, param.name, e.target.value)}
                                className="w-full glass border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-white rounded-lg px-3 py-2 text-sm"
                              >
                                {param.options?.map(option => (
                                  <option key={option} value={option} className="bg-gray-800">
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <Input
                                value={formData[tool.id]?.[param.name] || ''}
                                onChange={(e) => handleInputChange(tool.id, param.name, e.target.value)}
                                placeholder={param.placeholder}
                                className="glass border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-white"
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Results */}
                      {result && (
                        <div className="mt-4 p-3 glass border border-gray-600/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            {result.result.success ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-400" />
                            )}
                            <span className="text-sm font-medium text-white">
                              {result.result.success ? 'Success' : 'Error'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-300 bg-gray-800/50 rounded p-2 max-h-40 overflow-y-auto">
                            <pre className="whitespace-pre-wrap">
                              {result.result.success 
                                ? JSON.stringify(result.result.data, null, 2)
                                : result.result.error
                              }
                            </pre>
                          </div>
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="text-center mt-12 text-gray-400 text-sm">
            <p>Healthcare AI Assistant MCP Tools • Test interface for development and debugging</p>
          </div>
        </div>
      </div>
    </div>
  )
}