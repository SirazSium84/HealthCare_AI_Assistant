#!/usr/bin/env node

/**
 * Claude MCP Bridge for Healthcare AI Assistant
 * 
 * This script bridges your Healthcare MCP server to Claude Desktop
 * by translating between Claude's MCP protocol and your HTTP API.
 */

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3000/http';

// Healthcare MCP Bridge Class
class HealthcareMcpBridge {
  constructor() {
    this.serverUrl = MCP_SERVER_URL;
    console.error(`🏥 Healthcare MCP Bridge starting...`);
    console.error(`📡 Server URL: ${this.serverUrl}`);
  }

  async callHealthcareTool(toolName, args = {}) {
    try {
      console.error(`🔧 Calling tool: ${toolName} with args:`, args);

      // For Node.js environments that might not have fetch
      const fetch = globalThis.fetch || (await import('node-fetch')).default;
      
      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: toolName,
          arguments: args
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.error(`✅ Tool result:`, result);

      if (result.result && result.result.success) {
        return {
          content: [
            {
              type: "text",
              text: this.formatToolResult(toolName, result.result.data)
            }
          ]
        };
      } else {
        throw new Error(result.result?.error || 'Unknown error from healthcare server');
      }
    } catch (error) {
      console.error(`❌ Tool execution failed:`, error);
      throw new Error(`Healthcare tool '${toolName}' failed: ${error.message}`);
    }
  }

  formatToolResult(toolName, data) {
    // Format the results in a user-friendly way
    switch (toolName) {
      case 'list_documents':
        return `📄 **Healthcare Documents Summary**

Total Documents: ${data.totalDocuments}
Document Type Filter: ${data.documentType}
Database Status: Active

Index Statistics:
${JSON.stringify(data.indexStats, null, 2)}

✅ Document listing completed successfully.`;

      case 'analyze_insurance_info':
        const info = data.extractedInformation;
        const analysis = data.coverageAnalysis;
        return `🔍 **Insurance Information & Coverage Analysis**

**Query**: "${data.query}"

**📝 Extracted Information**:
- Policy Numbers: ${info.policyNumbers?.length || 0} found
- Dollar Amounts: ${info.amounts?.length || 0} found
- Dates: ${info.dates?.length || 0} found  
- Percentages: ${info.percentages?.length || 0} found
- Phone Numbers: ${info.phoneNumbers?.length || 0} found

**🛡️ Coverage Analysis**:
- Coverage Type: ${analysis.coverageType}
- Deductibles Found: ${analysis.deductibles.length}
- Copays Found: ${analysis.copays.length}  
- Coinsurance Rates: ${analysis.coinsurance.length}
- Out-of-Pocket Maximums: ${analysis.outOfPocketMax.length}
- Network Providers: ${analysis.networkProviders ? 'Yes' : 'No'}
- Preventive Care: ${analysis.preventiveCare ? 'Covered' : 'Check details'}

**Key Details**:
${Object.entries(info).map(([key, values]) => 
  values.length > 0 ? `- ${key}: ${values.slice(0, 3).join(', ')}${values.length > 3 ? '...' : ''}` : ''
).filter(Boolean).join('\n')}

**Summary**: ${data.summary}

✅ Insurance analysis completed successfully.`;

      case 'get_cost_intelligence':
        return `💰 **Healthcare Cost Intelligence**

**Procedure**: ${data.procedure}
**Location**: ${data.location}

**Cost Information**:
${data.costInformation}

**💡 Cost-Saving Tips**:
${data.costSavingTips.map(tip => `• ${tip}`).join('\n')}

**📈 Additional Factors**:
${data.additionalFactors.map(factor => `• ${factor}`).join('\n')}

**Summary**: ${data.summary}

✅ Cost intelligence analysis completed successfully.`;

      case 'manage_session':
        if (data.sessionInfo) {
          const session = data.sessionInfo;
          return `⚙️ **Session Management**

**📋 Session Information**:
- Session ID: ${session.sessionId}
- Document Count: ${session.documentCount}
- Uptime: ${Math.round(session.uptime / 1000)}s
- Clear on Start: ${session.config.clearOnStart}
- Clear Method: ${session.config.clearMethod}

**Message**: ${data.message}

✅ Session management completed successfully.`;
        } else {
          return `⚙️ **Session Management**

**Message**: ${data.message}
${data.clearedAt ? `**Cleared At**: ${data.clearedAt}` : ''}

✅ Session management completed successfully.`;
        }

      case 'calculate_out_of_pocket':
        return `💰 **Out-of-Pocket Cost Calculation**

**Scenario**: ${data.scenario}
**Services**: ${data.services.join(', ')}

**Estimated Costs**:
- Deductible: ${data.estimatedCosts.deductible}
- Coinsurance: ${data.estimatedCosts.coinsurance}  
- Total Estimate: ${data.estimatedCosts.estimatedTotal}

**💡 Recommendations**:
${data.recommendations.map(rec => `• ${rec}`).join('\n')}

✅ Cost calculation completed successfully.`;

      case 'get_enhanced_procedure_costs':
        return `💲 **Medical Procedure Cost Analysis**

**Procedure**: ${data.procedure}
**Location**: ${data.location}

**Cost Information**:
${data.costInformation}

**💡 Cost-Saving Tips**:
${data.costSavingTips.map(tip => `• ${tip}`).join('\n')}

**📊 Additional Factors**:
${data.additionalFactors.map(factor => `• ${factor}`).join('\n')}

✅ Procedure cost lookup completed successfully.`;

      default:
        return `📋 **Tool Result**: ${toolName}

${JSON.stringify(data, null, 2)}

✅ Tool execution completed successfully.`;
    }
  }
}

// Initialize the bridge
const bridge = new HealthcareMcpBridge();

// Define available healthcare tools for Claude - Ultra Simplified (3 tools)
const HEALTHCARE_TOOLS = [
  {
    name: "analyze_insurance_info",
    description: "Extract key information and analyze comprehensive insurance coverage details in one powerful tool",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Information to extract or analyze (e.g., 'policy details', 'coverage benefits', 'deductible amounts')"
        },
        coverageType: {
          type: "string",
          enum: ["all", "medical", "dental", "vision", "prescription"],
          description: "Type of coverage to analyze (default: all)"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_cost_intelligence",
    description: "Get real-world pricing intelligence for medical procedures",
    inputSchema: {
      type: "object",
      properties: {
        procedure: {
          type: "string",
          description: "Medical procedure or test name (e.g., 'MRI brain', 'colonoscopy', 'blood test')"
        },
        location: {
          type: "string",
          description: "Geographic location for regional pricing (optional)"
        }
      },
      required: ["procedure"]
    }
  },
  {
    name: "manage_session",
    description: "Manage healthcare session documents and workspace settings",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["info", "clear", "initialize"],
          description: "Session management action to perform"
        },
        config: {
          type: "object",
          description: "Optional session configuration for initialize action"
        }
      },
      required: ["action"]
    }
  }
];

// Handle incoming MCP messages from Claude
process.stdin.on('data', async (data) => {
  try {
    const message = JSON.parse(data.toString().trim());
    console.error(`📨 Received message:`, message);
    
    let response;

    switch (message.method) {
      case 'initialize':
        response = {
          jsonrpc: "2.0",
          id: message.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
              prompts: {},
              resources: {}
            },
            serverInfo: {
              name: "healthcare-ai-assistant",
              version: "1.0.0"
            }
          }
        };
        break;

      case 'tools/list':
        response = {
          jsonrpc: "2.0",
          id: message.id,
          result: {
            tools: HEALTHCARE_TOOLS
          }
        };
        break;

      case 'tools/call':
        try {
          const { name, arguments: args } = message.params;
          const result = await bridge.callHealthcareTool(name, args || {});
          
          response = {
            jsonrpc: "2.0",
            id: message.id,
            result
          };
        } catch (error) {
          response = {
            jsonrpc: "2.0",
            id: message.id,
            error: {
              code: -32603,
              message: error.message
            }
          };
        }
        break;

      default:
        response = {
          jsonrpc: "2.0",
          id: message.id,
          error: {
            code: -32601,
            message: `Method not found: ${message.method}`
          }
        };
    }

    console.error(`📤 Sending response:`, response);
    process.stdout.write(JSON.stringify(response) + '\n');
    
  } catch (error) {
    console.error('❌ Bridge error:', error);
    
    const errorResponse = {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32700,
        message: `Parse error: ${error.message}`
      }
    };
    
    process.stdout.write(JSON.stringify(errorResponse) + '\n');
  }
});

// Handle process cleanup
process.on('SIGINT', () => {
  console.error('🛑 Healthcare MCP Bridge shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('🛑 Healthcare MCP Bridge terminated');
  process.exit(0);
});

console.error('🏥 Healthcare AI Assistant MCP Bridge ready for Claude Desktop!');
console.error('🔗 Available tools (3): analyze_insurance_info, get_cost_intelligence, manage_session');
console.error('✨ Claude can now access your healthcare documents with ultra-simplified, powerful tools!');