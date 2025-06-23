import AgentChat from '@/components/agent-chat';

export default function AgentPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-center pt-4">AI Agent with Multi-Step Tools</h1>
      <AgentChat />
    </div>
  );
}