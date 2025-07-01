"use client"

import { useChat } from "ai/react"
import { useState, useEffect, useRef } from "react"
import { Send, FileSearch, Search, Bot, User, Loader2, Heart, Activity, Upload, File, CheckCircle, X, Home, RotateCcw, Shield, FileText, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"


export default function HealthInsuranceChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/agent",
    maxSteps: 5,
  })

  const [activeTools, setActiveTools] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Upload functionality
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [showUploadArea, setShowUploadArea] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const formatMessage = (content: string) => {
    // Convert markdown-like formatting to JSX
    const lines = content.split("\n")
    const formatted = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.startsWith("• ") || line.startsWith("- ")) {
        formatted.push(
          <li key={i} className="ml-4 mb-1 text-gray-300">
            {formatInlineText(line.substring(2))}
          </li>,
        )
      } else if (line.startsWith("**") && line.endsWith("**")) {
        formatted.push(
          <h3 key={i} className="font-semibold text-white mt-4 mb-2">
            {line.slice(2, -2)}
          </h3>,
        )
      } else if (line.trim() === "") {
        formatted.push(<br key={i} />)
      } else {
        formatted.push(
          <p key={i} className="mb-2 text-gray-300">
            {formatInlineText(line)}
          </p>,
        )
      }
    }

    return formatted
  }

  const formatInlineText = (text: string) => {
    // Handle bold text within lines
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-blue-400">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case "searchDocuments":
        return <FileSearch className="h-4 w-4" />
      case "getMedicalTestCost":
        return <Search className="h-4 w-4" />
      default:
        return <Bot className="h-4 w-4" />
    }
  }

  const getToolLabel = (toolName: string) => {
    switch (toolName) {
      case "searchDocuments":
        return "Searching coverage documents...";
    }
  }

  const quickPrompts = [
    {
      text: "What's covered under my plan?",
      icon: <Shield className="h-5 w-5" />,
      category: "Coverage",
      gradient: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/30"
    },
    {
      text: "How much does an MRI cost?",
      icon: <Search className="h-5 w-5" />,
      category: "Costs",
      gradient: "from-green-500/20 to-emerald-500/20",
      border: "border-green-500/30"
    },
    {
      text: "Do I need a referral for specialists?",
      icon: <Stethoscope className="h-5 w-5" />,
      category: "Referrals",
      gradient: "from-purple-500/20 to-violet-500/20",
      border: "border-purple-500/30"
    },
    {
      text: "What are my preventive care benefits?",
      icon: <Heart className="h-5 w-5" />,
      category: "Preventive",
      gradient: "from-pink-500/20 to-rose-500/20",
      border: "border-pink-500/30"
    }
  ]

  const handleFileUpload = async (file: File) => {
    if (!file) {
      return
    }
    
    setUploading(true)
    setUploadStatus(`Uploading ${file.name}...`)
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch('/api/upload-pinecone', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setUploadStatus(`✅ Successfully uploaded ${file.name}`)
        setUploadedFiles(prev => [...prev, file.name])
        setTimeout(() => setUploadStatus(''), 3000)
      } else {
        setUploadStatus(`❌ Upload failed: ${result.error}`)
        setTimeout(() => setUploadStatus(''), 5000)
      }
    } catch (error) {
      setUploadStatus(`❌ Upload failed: ${error}`)
      setTimeout(() => setUploadStatus(''), 5000)
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const resetToLanding = () => {
    setMessages([])
    setUploadStatus('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.03)_50%,transparent_75%)]" />
      
      {/* Animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-xl animate-pulse-healthcare" />
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/5 rounded-full blur-xl animate-pulse-healthcare" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto max-w-5xl px-4 pt-4 pb-6 min-h-screen flex flex-col">

          {/* Professional Header - Only show when no messages */}
          {messages.length === 0 && (
            <div className="text-center mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20 shadow-professional">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-glow">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Healthcare AI Assistant
                </h1>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs font-medium">
                  Available 24/7
                </Badge>
              </div>
              
              <p className="text-lg text-gray-300 mb-2 max-w-2xl mx-auto leading-relaxed">
                Your intelligent healthcare companion for <span className="text-blue-400 font-semibold">coverage analysis</span>, 
                <span className="text-purple-400 font-semibold"> benefit exploration</span>, and 
                <span className="text-green-400 font-semibold"> cost estimation</span>
              </p>
              
              <div className="flex items-center justify-center gap-6 text-sm text-gray-400 mt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-400" />
                  <span>Document Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <span>Real-time Insights</span>
                </div>
              </div>
            </div>
          )}

          {/* Chat Container */}
          <Card 
            className={`flex-1 glass-strong border-2 rounded-3xl shadow-professional-lg transition-all duration-500 ${
              isDragOver ? 'border-green-400/50 bg-green-900/10 shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)]' : 'border-gray-700/50'
            } ${messages.length === 0 ? 'animate-slide-in' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col relative min-h-[500px]">
              {/* Enhanced Drag overlay */}
              {isDragOver && (
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-2 border-dashed border-green-400/60 rounded-3xl flex items-center justify-center z-10 backdrop-blur-sm">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Upload className="h-10 w-10 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-green-300 mb-2">Drop your health document here</h3>
                    <p className="text-green-400 text-sm">PDF, DOCX, or TXT files supported • Maximum 10MB</p>
                  </div>
                </div>
              )}
              
              {/* Messages Area */}
              <div className="flex-1 p-6 scrollbar-thin overflow-y-auto">
                <div className="space-y-8">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    
                    {/* Enhanced Quick Prompt Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
                      {quickPrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            handleInputChange({ target: { value: prompt.text } } as any);
                            setTimeout(() => {
                              const form = document.querySelector('form');
                              if (form) {
                                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                              }
                            }, 100);
                          }}
                          className={`group p-5 bg-gradient-to-br ${prompt.gradient} border-2 ${prompt.border} rounded-2xl hover:scale-[1.02] transition-all duration-300 text-left shadow-professional hover:shadow-professional-lg btn-professional`}
                        >
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              {prompt.icon}
                            </div>
                            <div>
                              <span className="font-semibold text-white text-sm block">{prompt.category}</span>
                              <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mt-1" />
                            </div>
                          </div>
                          <p className="text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                            {prompt.text}
                          </p>
                        </button>
                      ))}
                    </div>

                    {/* Enhanced Feature Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                      <div className="group p-6 glass border border-gray-600/50 rounded-2xl hover:border-gray-500/50 transition-all duration-300 shadow-professional">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Upload className="h-7 w-7 text-white" />
                        </div>
                        <h4 className="font-semibold text-white mb-2 text-center">Secure Document Upload</h4>
                        <p className="text-sm text-gray-400 text-center leading-relaxed">Upload insurance documents for personalized analysis and insights</p>
                      </div>
                      <div className="group p-6 glass border border-gray-600/50 rounded-2xl hover:border-gray-500/50 transition-all duration-300 shadow-professional">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Search className="h-7 w-7 text-white" />
                        </div>
                        <h4 className="font-semibold text-white mb-2 text-center">Intelligent Search</h4>
                        <p className="text-sm text-gray-400 text-center leading-relaxed">AI-powered search through your documents and medical databases</p>
                      </div>
                      <div className="group p-6 glass border border-gray-600/50 rounded-2xl hover:border-gray-500/50 transition-all duration-300 shadow-professional">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Bot className="h-7 w-7 text-white" />
                        </div>
                        <h4 className="font-semibold text-white mb-2 text-center">Expert Analysis</h4>
                        <p className="text-sm text-gray-400 text-center leading-relaxed">Professional healthcare insights and accurate cost estimates</p>
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-professional">
                          <Bot className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-3xl px-6 py-4 shadow-professional ${
                        message.role === "user" 
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto" 
                          : "glass-strong text-white border border-gray-600/50"
                      }`}
                    >
                      {message.role === "user" ? (
                        <p className="text-white leading-relaxed">{message.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none prose-invert leading-relaxed">{formatMessage(message.content)}</div>
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 glass border border-gray-600 rounded-2xl flex items-center justify-center shadow-professional">
                          <User className="h-6 w-6 text-blue-400" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Enhanced Loading Indicator */}
                {isLoading && (
                  <div className="flex gap-4 justify-start animate-fade-in">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-professional animate-pulse">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="glass-strong border border-gray-600/50 rounded-3xl px-6 py-4 shadow-professional max-w-xs">
                      <div className="flex items-center gap-4 mb-3">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                        <span className="text-gray-300 font-medium">Analyzing your request...</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Scroll target */}
                <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Enhanced Input Area */}
              <div className="p-6 glass border-t border-gray-700/50 mt-auto rounded-b-3xl">

                {/* Upload Area - Only show when no messages */}
                {messages.length === 0 && (
                  <div className="mb-6 p-5 glass border border-gray-600/50 rounded-2xl shadow-professional">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-professional hover:shadow-professional-lg transition-all duration-300 disabled:opacity-50 btn-professional"
                        >
                          {uploading ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          ) : (
                            <Upload className="h-5 w-5 mr-2" />
                          )}
                          {uploading ? 'Processing Document...' : 'Upload Health Documents'}
                        </Button>
                        
                        {uploadedFiles.length > 0 && (
                          <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <span className="text-sm font-medium text-green-300">Documents Ready for Analysis</span>
                          </div>
                        )}
                      </div>
                      

                      
                      <p className="text-xs text-gray-400 text-center leading-relaxed">
                        📄 Upload insurance documents, EOBs, or medical records for personalized analysis
                      </p>
                    </div>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex items-center gap-4">
                  {/* Navigation buttons */}
                  <div className="flex gap-2">
                    {/* Reset button - only show when there are messages */}
                    {messages.length > 0 && (
                      <Button
                        onClick={resetToLanding}
                        variant="outline"
                        className="glass border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-xl transition-all duration-300 shadow-professional hover:shadow-professional-lg"
                        title="Return to landing page"
                      >
                        <Home className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  
                  <form onSubmit={handleSubmit} className="flex gap-4 flex-1">
                    <Input
                      value={input}
                      onChange={handleInputChange}
                      placeholder={uploadedFiles.length > 0 
                        ? "Ask me anything about your uploaded documents..." 
                        : "Ask about your health insurance, coverage, benefits, or medical costs..."
                      }
                      className="flex-1 glass border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-white placeholder:text-gray-400 rounded-xl py-3 px-4 shadow-professional transition-all duration-300"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 rounded-xl shadow-professional hover:shadow-professional-lg transition-all duration-300 disabled:opacity-50 btn-professional"
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Footer */}
          <div className="text-center mt-6 mb-4 animate-fade-in">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3" />
                <span>Real-time Analysis</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
