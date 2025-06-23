"use client"

import { useChat } from "ai/react"
import { useState, useEffect, useRef } from "react"
import { Send, FileSearch, Search, Bot, User, Loader2 } from "lucide-react"
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
          <li key={i} className="ml-4 mb-1">
            {formatInlineText(line.substring(2))}
          </li>,
        )
      } else if (line.startsWith("**") && line.endsWith("**")) {
        formatted.push(
          <h3 key={i} className="font-semibold text-blue-900 mt-4 mb-2">
            {line.slice(2, -2)}
          </h3>,
        )
      } else if (line.trim() === "") {
        formatted.push(<br key={i} />)
      } else {
        formatted.push(
          <p key={i} className="mb-2">
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
          <strong key={index} className="font-semibold text-blue-800">
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
        return "Searching coverage documents..."
      case "getMedicalTestCost":
        return "Searching medical costs..."
      default:
        return "Processing..."
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.02)_50%,transparent_75%)]" />

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto max-w-4xl p-4">
          {/* Header */}
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-full">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">HealthCare AI Assistant</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Get instant answers about your health insurance coverage, benefits, and medical costs
            </p>
          </div>

          {/* Chat Container */}
          <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-2xl">
            <div className="h-[600px] flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-6">
                  <div className="space-y-6">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <Bot className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Welcome to your Health Insurance Assistant
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Ask me anything about your coverage, benefits, or medical costs
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                        <Card className="p-4 bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
                          <div className="flex items-center gap-2 mb-2">
                            <FileSearch className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-blue-800">Coverage Questions</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            "What's covered under my plan?" or "Do I need a referral for specialists?"
                          </p>
                        </Card>
                        <Card className="p-4 bg-green-50 border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
                          <div className="flex items-center gap-2 mb-2">
                            <Search className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-800">Cost Information</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            "How much does an MRI cost?" or "What's the price of blood work?"
                          </p>
                        </Card>
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
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === "user" ? "bg-blue-600 text-white ml-auto" : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}
                      >
                        {message.role === "user" ? (
                          <p>{message.content}</p>
                        ) : (
                          <div className="prose prose-sm max-w-none">{formatMessage(message.content)}</div>
                        )}


                      </div>

                      {message.role === "user" && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading Indicator */}
                  {isLoading && (
                    <div className="flex gap-4 justify-start">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          <span className="text-gray-600">Thinking...</span>
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
              <div className="border-t border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="flex gap-3">
                                      <Input
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Ask about your health insurance coverage, benefits, or medical costs..."
                      className="flex-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800 placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>


              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-gray-400 text-sm">
            <p>
              Powered by AI with real-time document search and medical cost analysis
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
