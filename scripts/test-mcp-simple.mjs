#!/usr/bin/env node

/**
 * Simple HTTP-based test for Healthcare AI Assistant MCP Server
 * 
 * Usage: node scripts/test-mcp-simple.mjs [baseUrl]
 * Example: node scripts/test-mcp-simple.mjs http://localhost:3002
 */

const DEFAULT_BASE_URL = 'http://localhost:3002';

async function testMcpTool(baseUrl, toolName, args = {}) {
  try {
    const response = await fetch(`${baseUrl}/http`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: toolName,
        arguments: args
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return { error: error.message };
  }
}

async function main() {
  const baseUrl = process.argv[2] || DEFAULT_BASE_URL;
  
  console.log('🏥 Healthcare AI Assistant MCP Test Client (Simple)');
  console.log('===================================================');
  console.log(`Testing server at: ${baseUrl}\n`);

  // Test server availability
  try {
    const healthCheck = await fetch(`${baseUrl}/http`);
    if (healthCheck.ok) {
      console.log('✅ MCP server is responding\n');
    } else {
      console.log('⚠️ MCP server responded with status:', healthCheck.status);
    }
  } catch (error) {
    console.log('❌ Cannot connect to MCP server:', error.message);
    console.log('Make sure the Next.js development server is running with: pnpm dev');
    return;
  }

  // Test Healthcare Document Management Server
  console.log('📄 Testing Healthcare Document Management Server');
  console.log('================================================');
  
  console.log('\n1. Testing list_documents tool:');
  const listResult = await testMcpTool(baseUrl, 'list_documents', { documentType: 'all' });
  console.log('Result:', JSON.stringify(listResult, null, 2));

  console.log('\n2. Testing analyze_document_type tool:');
  const analysisResult = await testMcpTool(baseUrl, 'analyze_document_type', { 
    query: 'insurance policy coverage benefits deductible copay' 
  });
  console.log('Result:', JSON.stringify(analysisResult, null, 2));

  console.log('\n3. Testing extract_key_info tool:');
  const extractResult = await testMcpTool(baseUrl, 'extract_key_info', { 
    query: 'policy number deductible amount' 
  });
  console.log('Result:', JSON.stringify(extractResult, null, 2));

  // Test Insurance Policy Analysis Server
  console.log('\n\n🛡️ Testing Insurance Policy Analysis Server');
  console.log('=============================================');

  console.log('\n4. Testing analyze_coverage tool:');
  const coverageResult = await testMcpTool(baseUrl, 'analyze_coverage', { coverageType: 'medical' });
  console.log('Result:', JSON.stringify(coverageResult, null, 2));

  console.log('\n5. Testing calculate_out_of_pocket tool:');
  const costResult = await testMcpTool(baseUrl, 'calculate_out_of_pocket', { 
    scenario: 'routine',
    services: ['annual physical', 'blood work']
  });
  console.log('Result:', JSON.stringify(costResult, null, 2));

  console.log('\n6. Testing find_coverage_gaps tool:');
  const gapsResult = await testMcpTool(baseUrl, 'find_coverage_gaps', { focusArea: 'mental_health' });
  console.log('Result:', JSON.stringify(gapsResult, null, 2));

  // Test Medical Cost Intelligence Server
  console.log('\n\n💰 Testing Medical Cost Intelligence Server');
  console.log('==========================================');

  console.log('\n7. Testing get_enhanced_procedure_costs tool:');
  const procedureResult = await testMcpTool(baseUrl, 'get_enhanced_procedure_costs', { 
    procedure: 'MRI brain',
    location: 'California'
  });
  console.log('Result:', JSON.stringify(procedureResult, null, 2));

  console.log('\n8. Testing calculate_insurance_savings tool:');
  const savingsResult = await testMcpTool(baseUrl, 'calculate_insurance_savings', { 
    procedure: 'colonoscopy',
    uninsuredCost: 1500
  });
  console.log('Result:', JSON.stringify(savingsResult, null, 2));

  console.log('\n9. Testing predict_annual_costs tool:');
  const predictionResult = await testMcpTool(baseUrl, 'predict_annual_costs', { 
    healthProfile: 'moderate_conditions',
    age: 45
  });
  console.log('Result:', JSON.stringify(predictionResult, null, 2));

  console.log('\n🎉 MCP Server Testing Complete!');
  console.log('================================');
  console.log('All three healthcare MCP servers have been tested:');
  console.log('✅ Healthcare Document Management Server');
  console.log('✅ Insurance Policy Analysis Server');
  console.log('✅ Medical Cost Intelligence Server');
  
  console.log('\n📝 Next Steps:');
  console.log('- Upload some documents via the web interface');
  console.log('- Try the tools again to see real data processing');
  console.log('- Integrate MCP tools into your application UI');
}

// Error handling for the main function
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});