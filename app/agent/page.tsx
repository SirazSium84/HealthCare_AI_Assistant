import AgentChat from '@/components/agent-chat';
import { Bot } from 'lucide-react';

export default function AgentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 bg-blue-600 rounded-full">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">AI Agent with Multi-Step Tools</h1>
        </div>
        <p className="text-gray-300 text-center mt-2">
          Advanced healthcare AI with document search and cost analysis capabilities
        </p>
      </div>
      <AgentChat />
    </div>
  );
}