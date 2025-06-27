import { NextRequest } from 'next/server'
import { VectorizeService } from '@/lib/vectorize'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log(`📁 Processing file: ${file.name} (${file.size} bytes, ${file.type})`)
    
    // 1. Extract text from file
    const text = await extractTextFromFile(file)
    console.log(`📄 Extracted ${text.length} characters from ${file.name}`)
    
    if (text.length === 0) {
      return Response.json({ error: 'No text content found in file' }, { status: 400 })
    }
    
    // 2. Chunk the document
    const chunks = chunkDocument(text, file.name)
    console.log(`📝 Created ${chunks.length} chunks`)
    
    // 3. Upload to Vectorize.io
    const vectorizeService = new VectorizeService()
    await vectorizeService.uploadDocument(chunks, file.name)
    console.log(`✅ Uploaded to Vectorize.io`)
    
    return Response.json({ 
      message: `Successfully processed ${file.name}`,
      chunks: chunks.length,
      characters: text.length,
      filename: file.name
    })
    
  } catch (error: any) {
    console.error('Upload error:', error)
    return Response.json({ 
      error: error.message || 'Failed to process document' 
    }, { status: 500 })
  }
}

// Helper function to extract text from file
async function extractTextFromFile(file: File): Promise<string> {
  try {
    if (file.type === 'application/pdf') {
      // TODO: Add PDF parsing (pdf-parse library)
      throw new Error('PDF parsing not implemented yet. Please use .txt files for now.')
    } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
      // TODO: Add DOCX parsing (mammoth library)  
      throw new Error('DOCX parsing not implemented yet. Please use .txt files for now.')
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      // Plain text file
      return await file.text();
    } else {
      // Try to read as text anyway
      return await file.text();
    }
  } catch (error) {
    console.error('Text extraction error:', error)
    throw new Error(`Failed to extract text from ${file.name}: ${error}`)
  }
}

// Helper function to chunk document
function chunkDocument(text: string, filename: string) {
  const chunkSize = 1000 // characters per chunk
  const overlap = 200   // character overlap between chunks
  
  const chunks = []
  let chunkIndex = 0
  
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    const chunk = text.slice(i, i + chunkSize)
    
    // Skip very small chunks at the end
    if (chunk.trim().length < 50) {
      continue
    }
    
    chunks.push({
      text: chunk.trim(),
      metadata: {
        source: filename,
        source_display_name: filename,
        chunk_id: `${filename}_chunk_${chunkIndex}`,
        chunk_index: chunkIndex,
        total_chunks: Math.ceil(text.length / (chunkSize - overlap)),
        upload_date: new Date().toISOString(),
        document_type: 'user_upload'
      }
    })
    
    chunkIndex++
  }
  
  console.log(`📊 Chunking stats: ${chunks.length} chunks, avg size: ${Math.round(chunks.reduce((sum, chunk) => sum + chunk.text.length, 0) / chunks.length)} chars`)
  
  return chunks
} 