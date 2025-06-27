'use client';

import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Send, Loader2 } from 'lucide-react';

export default function AgentChat() {
  const { messages, input, setInput, append, isLoading } = useChat({
    api: '/api/agent',
    maxSteps: 5,
  });

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-full">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Healthcare AI Agent</h2>
          </div>
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <div className="p-4 h-96 overflow-y-auto bg-gray-800/50">
            {messages.map((message, index) => (
              <div key={index} className="mb-4">
                <div className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}

                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-white border border-gray-600'
                  }`}>
                    <div className="font-semibold text-sm mb-2 opacity-75">
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                    </div>
                    <div className="markdown-content text-sm">
                      <ReactMarkdown 
                        components={{
                          strong: ({children}) => <strong className="font-bold text-blue-400">{children}</strong>,
                          p: ({children}) => <p className="mb-2 text-gray-200">{children}</p>,
                          ul: ({children}) => <ul className="mb-2 text-gray-200">{children}</ul>,
                          li: ({children}) => <li className="ml-4 mb-1 text-gray-200">• {children}</li>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="bg-gray-700 border border-gray-600 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                      <span className="text-gray-300 text-sm">Processing your request...</span>
                    </div>
                    <div className="mt-2 h-1 bg-gray-600 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="p-8 text-center">
            <Bot className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-pulse-healthcare" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Healthcare AI Agent Ready
            </h3>
            <p className="text-gray-300 mb-4">
              Ask about medical test costs or search healthcare documents
            </p>
            <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto text-sm">
              <div className="p-3 bg-blue-600/20 border border-blue-600/50 rounded-lg">
                <span className="text-blue-300">"What does a blood test cost?"</span>
              </div>
              <div className="p-3 bg-blue-600/20 border border-blue-600/50 rounded-lg">
                <span className="text-blue-300">"Search for coverage information"</span>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4 bg-gray-800/50">
          <div className="flex gap-2">
            <input
              className="flex-1 bg-gray-800 border border-gray-500 rounded-xl px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              placeholder="Ask about medical test costs or search documents..."
              onChange={event => {
                setInput(event.target.value);
              }}
              onKeyDown={async event => {
                if (event.key === 'Enter') {
                  append({ content: input, role: 'user' });
                  setInput('');
                }
              }}
              disabled={isLoading}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
              onClick={() => {
                append({ content: input, role: 'user' });
                setInput('');
              }}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 