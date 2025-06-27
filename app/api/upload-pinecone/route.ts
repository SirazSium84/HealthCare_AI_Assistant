import { NextRequest } from 'next/server'
import { PineconeService } from '@/lib/pinecone'

// Configure route segment for larger body size
export const runtime = 'nodejs'
export const maxDuration = 60

// Helper function to extract text from file
async function extractTextFromFile(file: File): Promise<string> {
  try {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // PDF parsing with pdf-parse
      console.log(`📄 Parsing PDF: ${file.name}`)
      
      try {
        // Use require instead of import to avoid dynamic import issues
        const pdfParse = require('pdf-parse')
        
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        const pdfData = await pdfParse(buffer)
        const text = pdfData.text
        
        console.log(`📄 Extracted ${text.length} characters from PDF`)
        console.log(`📊 PDF info: ${pdfData.numpages} pages`)
        
        return text
        
      } catch (pdfError: any) {
        console.error('PDF parsing failed:', pdfError.message)
        throw new Error(`PDF parsing failed: ${pdfError.message}`)
      }
      
    } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
      throw new Error('DOCX parsing not implemented yet. Please use .txt files for now.')
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text()
      return text
    } else {
      // Try to read as text anyway
      const text = await file.text()
      return text
    }
  } catch (error) {
    console.error('Text extraction error:', error)
    throw new Error(`Failed to extract text from ${file.name}: ${error}`)
  }
}

// Function to chunk text into manageable pieces
function chunkText(text: string, chunkSize: number = 1000): any[] {
  const chunks = []
  const words = text.split(' ')
  let currentChunk = ''
  
  for (const word of words) {
    if ((currentChunk + ' ' + word).length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        metadata: {
          chunk_index: chunks.length,
          source: 'uploaded_document',
          source_display_name: 'Uploaded Document',
          total_chunks: 0, // Will be updated after all chunks are created
          upload_date: new Date().toISOString(),
          document_type: 'user_upload'
        }
      })
      currentChunk = word
    } else {
      currentChunk += (currentChunk ? ' ' : '') + word
    }
  }
  
  // Add the last chunk
  if (currentChunk.trim()) {
    chunks.push({
      text: currentChunk.trim(),
      metadata: {
        chunk_index: chunks.length,
        source: 'uploaded_document',
        source_display_name: 'Uploaded Document',
        total_chunks: 0,
        upload_date: new Date().toISOString(),
        document_type: 'user_upload'
      }
    })
  }
  
  // Update total_chunks for all chunks
  chunks.forEach(chunk => {
    chunk.metadata.total_chunks = chunks.length
  })
  
  return chunks
}

export async function POST(req: NextRequest) {
  try {
    console.log('📁 Processing file upload request')
    
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: 'File size exceeds 10MB limit' }, { status: 413 })
    }
    
    console.log(`📁 Processing file: ${file.name} (${file.size} bytes, ${file.type})`)
    
    // 1. Extract text from file
    const text = await extractTextFromFile(file)
    console.log(`📄 Extracted ${text.length} characters from ${file.name}`)
    
    if (text.length === 0) {
      return Response.json({ error: 'No text could be extracted from the file' }, { status: 400 })
    }
    
    // 2. Chunk the text
    const chunks = chunkText(text)
    console.log(`📝 Created ${chunks.length} chunks`)
    
    // 3. Upload to Pinecone
    const pineconeService = new PineconeService()
    await pineconeService.uploadDocument(chunks, file.name)
    
    console.log(`✅ Successfully uploaded "${file.name}" to Pinecone`)
    
    return Response.json({ 
      message: `Successfully uploaded ${file.name}`,
      chunks: chunks.length,
      characters: text.length
    })
    
  } catch (error: any) {
    console.error('Upload error:', error)
    return Response.json({ 
      error: error.message || 'Upload failed' 
    }, { status: 500 })
  }
} 