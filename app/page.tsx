"use client"

import { useChat } from "ai/react"
import { useState, useEffect, useRef } from "react"
import { Send, FileSearch, Search, Bot, User, Loader2, Heart, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function HealthInsuranceChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/agent",
    maxSteps: 5,
  })

  const [activeTools, setActiveTools] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      icon: <FileSearch className="h-4 w-4" />,
      category: "Coverage"
    },
    {
      text: "How much does an MRI cost?",
      icon: <Search className="h-4 w-4" />,
      category: "Costs"
    },
    {
      text: "Do I need a referral for specialists?",
      icon: <Heart className="h-4 w-4" />,
      category: "Referrals"
    },
    {
      text: "What are my preventive care benefits?",
      icon: <Activity className="h-4 w-4" />,
      category: "Preventive"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.05)_50%,transparent_75%)]" />

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto max-w-4xl p-4">
          {/* Header */}
          <div className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 rounded-t-2xl px-6 py-4 mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-3 bg-blue-600 rounded-full shadow-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Healthcare AI Assistant</h1>
            </div>
            <p className="text-gray-300 text-lg text-center">
              Your intelligent healthcare companion for coverage, benefits, and medical costs
            </p>
          </div>

          {/* Chat Container */}
          <Card className="bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-2xl shadow-2xl">
            <div className="h-[600px] flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-6">
                  <div className="space-y-6">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <Bot className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-pulse-healthcare" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Welcome to your Healthcare AI Assistant
                      </h3>
                      <p className="text-gray-300 mb-8">
                        Ask me anything about your coverage, benefits, or medical costs
                      </p>
                      
                      {/* Quick Prompt Buttons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto mb-6">
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
                            className="p-4 bg-blue-600/20 border border-blue-600/50 rounded-xl hover:bg-blue-600/30 transition-all duration-200 text-left group"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
                                {prompt.icon}
                              </div>
                              <span className="font-medium text-blue-300 text-sm">{prompt.category}</span>
                            </div>
                            <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                              {prompt.text}
                            </p>
                          </button>
                        ))}
                      </div>

                      {/* Feature Highlights */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                        <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-xl">
                          <FileSearch className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                          <h4 className="font-medium text-white mb-1">Document Search</h4>
                          <p className="text-xs text-gray-400">Real-time coverage document analysis</p>
                        </div>
                        <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-xl">
                          <Search className="h-8 w-8 text-green-400 mx-auto mb-2" />
                          <h4 className="font-medium text-white mb-1">Cost Analysis</h4>
                          <p className="text-xs text-gray-400">Accurate medical procedure pricing</p>
                        </div>
                        <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-xl">
                          <Bot className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                          <h4 className="font-medium text-white mb-1">AI Powered</h4>
                          <p className="text-xs text-gray-400">Intelligent healthcare assistance</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === "user" 
                            ? "bg-blue-600 text-white ml-auto shadow-lg" 
                            : "bg-gray-700 text-white border border-gray-600 shadow-lg"
                        }`}
                      >
                        {message.role === "user" ? (
                          <p className="text-white">{message.content}</p>
                        ) : (
                          <div className="prose prose-sm max-w-none prose-invert">{formatMessage(message.content)}</div>
                        )}
                      </div>

                      {message.role === "user" && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading Indicator */}
                  {isLoading && (
                    <div className="flex gap-4 justify-start">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="bg-gray-700 border border-gray-600 rounded-2xl px-4 py-3 shadow-lg">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                          <span className="text-gray-300">Analyzing your request...</span>
                        </div>
                        <div className="mt-2 h-1 bg-gray-600 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Scroll target */}
                  <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-600 p-6 bg-gray-800/50">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask about your health insurance coverage, benefits, or medical costs..."
                    className="flex-1 bg-gray-800 border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-white placeholder:text-gray-400 rounded-xl"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Powered by AI with real-time document search and medical cost analysis
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
