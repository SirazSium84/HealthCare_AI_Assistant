'use client';

import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';

export default function AgentChat() {
  const { messages, input, setInput, append } = useChat({
    api: '/api/agent',
    maxSteps: 5,
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      {messages.length > 0 && (
        <div className="border rounded-lg p-4 mb-4 h-96 overflow-y-auto bg-gray-50">
          {messages.map((message, index) => (
            <div key={index} className={`mb-2 p-2 rounded ${
              message.role === 'user' 
                ? 'bg-blue-100 ml-8' 
                : 'bg-white mr-8'
            }`}>
              <div className="font-semibold text-sm mb-1">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="markdown-content">
                <ReactMarkdown 
                  components={{
                    strong: ({children}) => <strong className="font-bold">{children}</strong>,
                    p: ({children}) => <p className="mb-2">{children}</p>,
                    ul: ({children}) => <ul className="mb-2">{children}</ul>,
                    li: ({children}) => <li className="ml-4 mb-1">• {children}</li>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
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
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          onClick={() => {
            append({ content: input, role: 'user' });
            setInput('');
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
} 