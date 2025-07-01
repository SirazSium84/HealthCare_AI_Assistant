import { z } from "zod";

export const uploadDocumentTool = {
  name: "uploadDocument",
  description: "Upload and process HEALTHCARE-ONLY documents (PDF, TXT) to the medical knowledge base. Only documents containing medical, insurance, or healthcare content will be accepted. General documents are automatically rejected to maintain database integrity.",
  schema: z.object({
    content: z.string().describe("Base64 encoded content of the document"),
    filename: z.string().describe("Name of the file including extension (e.g., 'insurance_policy.pdf')"),
    mimeType: z.string().describe("MIME type of the file (e.g., 'application/pdf', 'text/plain')")
  }),
  handler: async ({ content, filename, mimeType }: { content: string, filename: string, mimeType: string }) => {
    try {
      console.log(`📄 Analyzing document: "${filename}" (${mimeType})`);
      
      // Convert base64 content to buffer
      const buffer = Buffer.from(content, 'base64');
      
      // Extract text content for healthcare validation
      let textContent = '';
      try {
        if (mimeType === 'text/plain') {
          textContent = buffer.toString('utf-8');
        } else if (mimeType === 'application/pdf') {
          // For PDF, we'll do a basic check on filename and let the server handle full text extraction
          textContent = filename.toLowerCase();
        } else {
          throw new Error(`Unsupported file type: ${mimeType}. Only PDF and TXT files are supported.`);
        }
      } catch (error) {
        throw new Error(`Failed to extract content from file: ${error.message}`);
      }
      
      // Healthcare keywords and patterns
      const healthcareKeywords = [
        // Insurance terms
        'insurance', 'policy', 'premium', 'deductible', 'copay', 'coinsurance', 'coverage', 'benefit',
        'claim', 'eob', 'explanation of benefits', 'medicare', 'medicaid', 'hmo', 'ppo', 'fep',
        
        // Medical terms
        'medical', 'health', 'healthcare', 'physician', 'doctor', 'hospital', 'clinic', 'prescription',
        'medication', 'treatment', 'diagnosis', 'procedure', 'surgery', 'therapy', 'preventive',
        
        // Document types
        'medical record', 'discharge summary', 'lab result', 'radiology', 'pathology', 'immunization',
        'vaccination', 'physical exam', 'wellness', 'screening', 'mammogram', 'colonoscopy',
        
        // Health conditions
        'diabetes', 'hypertension', 'cancer', 'heart', 'mental health', 'depression', 'anxiety',
        
        // Healthcare providers
        'blue cross', 'blue shield', 'aetna', 'cigna', 'humana', 'kaiser', 'unitedhealth',
        'bcbs', 'anthem', 'molina', 'centene'
      ];
      
      // Check filename for healthcare indicators
      const filenameLower = filename.toLowerCase();
      const filenameIndicatesHealthcare = healthcareKeywords.some(keyword => 
        filenameLower.includes(keyword)
      );
      
      // Check content for healthcare indicators (for text files)
      const contentLower = textContent.toLowerCase();
      const contentIndicatesHealthcare = healthcareKeywords.some(keyword => 
        contentLower.includes(keyword)
      );
      
      // Require either filename or content to indicate healthcare
      if (!filenameIndicatesHealthcare && !contentIndicatesHealthcare) {
        const rejectionMessage = `🚫 **Document Upload Rejected**

**File**: ${filename}
**Reason**: This document does not appear to be healthcare-related

**Healthcare Content Required**:
The upload tool is specifically designed for healthcare documents such as:
• Insurance policies and cards
• Medical records and reports  
• Explanation of Benefits (EOB)
• Prescription information
• Lab results and test reports
• Healthcare provider documents

**Suggestion**: Please upload healthcare-related documents only. For general document storage, use alternative methods.

❌ Upload rejected to protect healthcare-specific database integrity.`;

        return {
          content: [
            {
              type: "text" as const,
              text: rejectionMessage
            }
          ],
          isError: true
        };
      }
      
      console.log(`✅ Healthcare content detected in "${filename}" - proceeding with upload`);
      
      // Create FormData for the upload
      const formData = new FormData();
      const blob = new Blob([buffer], { type: mimeType });
      formData.append('file', blob, filename);
      
      // Use the deployed Vercel app's upload endpoint
      const uploadUrl = 'https://healthcare-assistant-mcp-test.vercel.app/api/upload-pinecone';
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      const successMessage = `📄 **Document Upload Successful**

**File**: ${filename}
**Size**: ${(buffer.length / 1024).toFixed(1)} KB
**Type**: ${mimeType}

**Processing Results**:
• Document successfully parsed and processed
• Text extracted and chunked for optimal search
• Vectors generated and uploaded to Pinecone database
• Document is now searchable via the searchDocuments tool

**Next Steps**:
• Use the searchDocuments tool to find information from this document
• Ask questions about the uploaded content
• The document is now part of your healthcare knowledge base

✅ Upload and vectorization completed successfully!`;

      return {
        content: [
          {
            type: "text" as const,
            text: successMessage
          }
        ]
      };
    } catch (error: any) {
      console.error(`❌ Error uploading document:`, error);
      
      const errorMessage = `❌ **Document Upload Failed**

**File**: ${filename}
**Error**: ${error.message}

**Troubleshooting Tips**:
• Ensure the file is a supported format (PDF, TXT)
• Check that the file size is reasonable (< 10MB recommended)
• Verify the document content is properly encoded

Please try again or contact support if the issue persists.`;

      return {
        content: [
          {
            type: "text" as const,
            text: errorMessage
          }
        ],
        isError: true
      };
    }
  }
}; 