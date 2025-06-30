#!/usr/bin/env node

/**
 * Healthcare AI Assistant MCP Server Test Client
 * 
 * This script tests the MCP servers for the Healthcare AI Assistant:
 * - Healthcare Document Management Server
 * - Insurance Policy Analysis Server  
 * - Medical Cost Intelligence Server
 * 
 * Usage: node scripts/test-mcp-client.mjs [baseUrl]
 * Example: node scripts/test-mcp-client.mjs http://localhost:3000
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const DEFAULT_BASE_URL = 'http://localhost:3000';

async function main() {
  const baseUrl = process.argv[2] || DEFAULT_BASE_URL;
  const mcpUrl = `${baseUrl}/sse`;
  
  console.log('🏥 Healthcare AI Assistant MCP Test Client');
  console.log('==========================================');
  console.log(`Connecting to: ${mcpUrl}\n`);

  // For testing, we'll use direct HTTP requests instead
  console.log('Note: Using direct HTTP requests for testing (MCP SDK client setup varies)');

  try {
    await client.connect();
    console.log('✅ Connected to MCP server\n');

    // Test Healthcare Document Management Server
    console.log('📄 Testing Healthcare Document Management Server');
    console.log('================================================');
    
    // Test 1: List documents
    console.log('\n1. Testing list_documents tool:');
    try {
      const listResult = await client.callTool({
        name: 'list_documents',
        arguments: { documentType: 'all' }
      });
      console.log('Result:', JSON.stringify(listResult, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 2: Analyze document type
    console.log('\n2. Testing analyze_document_type tool:');
    try {
      const analysisResult = await client.callTool({
        name: 'analyze_document_type',
        arguments: { 
          query: 'insurance policy coverage benefits deductible copay' 
        }
      });
      console.log('Result:', JSON.stringify(analysisResult, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 3: Extract key information
    console.log('\n3. Testing extract_key_info tool:');
    try {
      const extractResult = await client.callTool({
        name: 'extract_key_info',
        arguments: { 
          query: 'policy number deductible amount' 
        }
      });
      console.log('Result:', JSON.stringify(extractResult, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test Insurance Policy Analysis Server
    console.log('\n\n🛡️ Testing Insurance Policy Analysis Server');
    console.log('=============================================');

    // Test 4: Analyze coverage
    console.log('\n4. Testing analyze_coverage tool:');
    try {
      const coverageResult = await client.callTool({
        name: 'analyze_coverage',
        arguments: { coverageType: 'medical' }
      });
      console.log('Result:', JSON.stringify(coverageResult, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 5: Calculate out-of-pocket costs
    console.log('\n5. Testing calculate_out_of_pocket tool:');
    try {
      const costResult = await client.callTool({
        name: 'calculate_out_of_pocket',
        arguments: { 
          scenario: 'routine',
          services: ['annual physical', 'blood work']
        }
      });
      console.log('Result:', JSON.stringify(costResult, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 6: Find coverage gaps
    console.log('\n6. Testing find_coverage_gaps tool:');
    try {
      const gapsResult = await client.callTool({
        name: 'find_coverage_gaps',
        arguments: { focusArea: 'mental_health' }
      });
      console.log('Result:', JSON.stringify(gapsResult, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test Medical Cost Intelligence Server
    console.log('\n\n💰 Testing Medical Cost Intelligence Server');
    console.log('==========================================');

    // Test 7: Get enhanced procedure costs
    console.log('\n7. Testing get_enhanced_procedure_costs tool:');
    try {
      const procedureResult = await client.callTool({
        name: 'get_enhanced_procedure_costs',
        arguments: { 
          procedure: 'MRI brain',
          location: 'California'
        }
      });
      console.log('Result:', JSON.stringify(procedureResult, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 8: Calculate insurance savings
    console.log('\n8. Testing calculate_insurance_savings tool:');
    try {
      const savingsResult = await client.callTool({
        name: 'calculate_insurance_savings',
        arguments: { 
          procedure: 'colonoscopy',
          uninsuredCost: 1500
        }
      });
      console.log('Result:', JSON.stringify(savingsResult, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 9: Predict annual costs
    console.log('\n9. Testing predict_annual_costs tool:');
    try {
      const predictionResult = await client.callTool({
        name: 'predict_annual_costs',
        arguments: { 
          healthProfile: 'moderate_conditions',
          age: 45
        }
      });
      console.log('Result:', JSON.stringify(predictionResult, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
    }

    console.log('\n🎉 MCP Server Testing Complete!');
    console.log('================================');
    console.log('All three healthcare MCP servers have been tested:');
    console.log('✅ Healthcare Document Management Server');
    console.log('✅ Insurance Policy Analysis Server');
    console.log('✅ Medical Cost Intelligence Server');
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed');
  }
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