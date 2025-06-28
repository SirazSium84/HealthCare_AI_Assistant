"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<string>('')
  const [testQuery, setTestQuery] = useState('')
  const [testResults, setTestResults] = useState('')
  const [testing, setTesting] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<'vectorize' | 'pinecone'>('pinecone')
  const [chatQuery, setChatQuery] = useState('')
  const [chatResponse, setChatResponse] = useState('')
  const [chatting, setChatting] = useState(false)
  const [serverStatus, setServerStatus] = useState('')
  
  const handleUpload = async () => {
    if (!file) {
      return
    }
    
    setUploading(true)
    setStatus(`Processing document for ${selectedPlatform}...`)
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const endpoint = selectedPlatform === 'pinecone' ? '/api/upload-pinecone' : '/api/upload'
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setStatus(`✅ ${result.message || `Successfully uploaded to ${selectedPlatform}`}`)
        console.log('Upload result:', result)
      } else {
        setStatus(`❌ Upload failed: ${result.error}`)
      }
    } catch (error) {
      setStatus(`❌ Upload failed: ${error}`)
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const testSearch = async () => {
    if (!testQuery.trim()) {
      return
    }
    
    setTesting(true)
    try {
      const endpoint = selectedPlatform === 'pinecone' ? '/api/search-pinecone' : '/api/test-search'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery })
      })
      
      const result = await response.json()
      setTestResults(JSON.stringify(result, null, 2))
    } catch (error) {
      setTestResults(`Error: ${error}`)
    } finally {
      setTesting(false)
    }
  }

  const testChat = async () => {
    if (!chatQuery.trim()) {
      return
    }
    
    setChatting(true)
    setChatResponse('🤔 Thinking...')
    
    try {
      console.log('🚀 Starting agent chat request:', chatQuery)
      
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: chatQuery }]
        })
      })
      
      console.log('📡 Agent response status:', response.status)
      
      if (response.ok) {
        const reader = response.body?.getReader()
        if (!reader) {
          setChatResponse('❌ Failed to get response reader')
          return
        }
        
        const decoder = new TextDecoder()
        let fullResponse = ''
        let hasStartedContent = false
        
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              console.log('✅ Streaming completed')
              break
            }
            
            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim()
                
                if (dataStr === '[DONE]') {
                  console.log('🏁 Received [DONE] signal')
                  continue
                }
                
                try {
                  const data = JSON.parse(dataStr)
                  
                  if (data.content) {
                    fullResponse += data.content
                    setChatResponse(fullResponse)
                    hasStartedContent = true
                    
                    // Log first few characters to confirm content is coming through
                    if (fullResponse.length <= 50) {
                      console.log('📝 Receiving content:', fullResponse)
                    }
                  }
                } catch (parseError) {
                  // Skip invalid JSON lines - this is normal for streaming
                  if (dataStr && dataStr !== '') {
                    console.log('⚠️ Skipping non-JSON data:', dataStr.substring(0, 50))
                  }
                }
              }
            }
          }
          
          if (!hasStartedContent) {
            setChatResponse('🤷‍♂️ No content received. Check console for details.')
            console.warn('No content was parsed from the streaming response')
          }
          
        } catch (streamError) {
          console.error('Streaming error:', streamError)
          setChatResponse(`❌ Streaming Error: ${streamError}`)
        }
        
      } else {
        const errorText = await response.text()
        console.error('Agent API Error:', response.status, errorText)
        setChatResponse(`❌ Error ${response.status}: ${errorText || 'Request failed'}`)
      }
    } catch (error) {
      console.error('Chat request error:', error)
      setChatResponse(`❌ Request Error: ${error}`)
    } finally {
      setChatting(false)
    }
  }

  const testServer = async () => {
    setServerStatus('🔄 Testing agent server...')
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: 'test' }]
        })
      })
      
      if (response.ok) {
        setServerStatus('✅ Agent server is responding')
      } else {
        setServerStatus(`❌ Agent server error: ${response.status}`)
      }
    } catch (error) {
      setServerStatus(`❌ Cannot connect to agent server - restart dev server`)
    }
  }

  
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Document Upload Test</h1>
      
      {/* Upload Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Upload Document</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Choose Platform
            </label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="platform"
                  value="pinecone"
                  checked={selectedPlatform === 'pinecone'}
                  onChange={(e) => setSelectedPlatform(e.target.value as 'pinecone')}
                  className="mr-2"
                />
                <span className="text-sm">
                  🆓 <strong>Pinecone</strong> (Free - Recommended)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="platform"
                  value="vectorize"
                  checked={selectedPlatform === 'vectorize'}
                  onChange={(e) => setSelectedPlatform(e.target.value as 'vectorize')}
                  className="mr-2"
                />
                <span className="text-sm">
                  💰 <strong>Vectorize.io</strong> (Paid Plan Required)
                </span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Select file (.txt, .pdf, .docx)
              {selectedPlatform === 'pinecone' && (
                <span className="text-green-600 text-xs ml-2">✅ PDF support enabled</span>
              )}
              {selectedPlatform === 'vectorize' && (
                <span className="text-orange-600 text-xs ml-2">⚠️ .txt only</span>
              )}
            </label>
            <input
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading}
              className="flex-1"
            >
              {uploading ? 'Processing...' : 'Upload & Vectorize'}
            </Button>
            
            {status && (
              <Button 
                onClick={() => setStatus('')} 
                variant="outline"
                className="px-4"
              >
                Clear
              </Button>
            )}
          </div>
          
          {status && (
            <div className={`p-4 rounded-md text-sm border ${
              status.includes('✅') 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="font-semibold mb-2">Upload Status:</div>
              <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-48">
                {status}
              </pre>
            </div>
          )}
        </div>
      </Card>

      {/* Test Search Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          2. Test Raw Search 
          <span className="text-sm font-normal text-gray-600">
            (Using {selectedPlatform === 'pinecone' ? '🆓 Pinecone' : '💰 Vectorize.io'})
          </span>
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Ask a question about your uploaded document
            </label>
            <Input
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="e.g., What is this document about?"
              onKeyPress={(e) => e.key === 'Enter' && testSearch()}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={testSearch} 
              disabled={!testQuery.trim() || testing}
              className="flex-1"
            >
              {testing ? 'Searching...' : 'Test Search'}
            </Button>
            
            {testResults && (
              <Button 
                onClick={() => setTestResults('')} 
                variant="outline"
                className="px-4"
              >
                Clear
              </Button>
            )}
          </div>
          
          {testResults && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Search Results:</h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <pre className="text-xs overflow-auto max-h-64 whitespace-pre-wrap text-blue-900">
                  {testResults}
                </pre>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Chat Testing Section */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">
          3. Test AI Chat 🤖
          <span className="text-sm font-normal text-gray-600">
            (Full streaming agent with Pinecone search)
          </span>
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Ask a healthcare question about your uploaded document
            </label>
            <Input
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              placeholder="e.g., What is the copay for specialist visits according to this policy?"
              onKeyPress={(e) => e.key === 'Enter' && !chatting && testChat()}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={testChat} 
              disabled={!chatQuery.trim() || chatting}
              className="flex-1"
            >
              {chatting ? '🤔 AI is thinking...' : '🤖 Ask Agent (Streaming)'}
            </Button>
            
            <Button 
              onClick={testServer} 
              variant="outline"
              className="whitespace-nowrap"
            >
              🔧 Test Agent
            </Button>
            
            {(chatResponse || serverStatus) && (
              <Button 
                onClick={() => {
                  setChatResponse('')
                  setServerStatus('')
                }} 
                variant="outline"
                className="px-4"
              >
                Clear
              </Button>
            )}
          </div>
          
          {serverStatus && (
            <div className={`p-3 rounded-md text-sm ${
              serverStatus.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <strong>Server Status:</strong> {serverStatus}
            </div>
          )}
          
          {chatResponse && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">🤖 AI Response:</h3>
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm text-green-900 whitespace-pre-wrap">
                  {chatResponse}
                </div>
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-md">
            <strong>💡 Tip:</strong> This uses the exact same AI agent as your main chat interface. 
            It searches through your Pinecone-uploaded documents with full streaming responses and 
            healthcare expertise. Perfect for testing your uploaded PDFs!
          </div>
        </div>
      </Card>



      {/* Quick Guide */}
      <Card className="p-6 mt-8 bg-green-50">
        <h2 className="text-lg font-semibold mb-2 text-green-800">✅ Ready to Use!</h2>
        <div className="space-y-2">
          <p className="text-sm text-green-700">
            <strong>Your PDF upload system is working perfectly!</strong> 
            Upload any healthcare document and get intelligent AI responses.
          </p>
          <div className="text-xs text-green-600 space-y-1">
            <div>• 📄 <strong>PDF Support:</strong> Upload medical certificates, insurance policies, etc.</div>
            <div>• 🧠 <strong>AI Chat:</strong> Ask questions and get expert healthcare answers</div>
            <div>• 🔍 <strong>Smart Search:</strong> Find information across all your documents</div>
            <div>• 🆓 <strong>Free Tier:</strong> Powered by Pinecone's generous free plan</div>
          </div>
        </div>
      </Card>
    </div>
  )
} 