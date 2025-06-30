// MCP (Model Context Protocol) Types for Healthcare AI Assistant

export interface McpToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
}

export interface McpToolHandler<T = any> {
  (args: T): Promise<McpToolResult>;
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: McpToolHandler;
}

export interface McpServer {
  name: string;
  version: string;
  tools: McpTool[];
  resources?: McpResource[];
  prompts?: McpPrompt[];
}

export interface McpResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface McpPrompt {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
}

// Healthcare Document Management Types
export interface DocumentListArgs {
  documentType?: 'insurance' | 'eob' | 'medical_records' | 'all';
}

export interface DocumentAnalysisArgs {
  query: string;
}

export interface KeyInfoExtractionArgs {
  query: string;
}

export interface DocumentClassification {
  documentType: string;
  confidence: number;
  analysis: {
    contentLength: number;
    keyTermsFound: string[];
    classification: string;
  };
}

export interface ExtractedInformation {
  policyNumbers: string[];
  amounts: string[];
  dates: string[];
  percentages: string[];
  phoneNumbers: string[];
}

// Insurance Policy Analysis Types
export interface CoverageAnalysisArgs {
  coverageType?: 'medical' | 'dental' | 'vision' | 'prescription' | 'all';
}

export interface OutOfPocketCalculationArgs {
  scenario: 'routine' | 'moderate' | 'high' | 'emergency';
  services?: string[];
}

export interface CoverageGapAnalysisArgs {
  focusArea?: 'mental_health' | 'maternity' | 'prescription' | 'dental' | 'vision';
}

export interface CoverageAnalysis {
  coverageType: string;
  deductibles: string[];
  copays: string[];
  coinsurance: string[];
  outOfPocketMax: string[];
  networkProviders: boolean;
  preventiveCare: boolean;
}

export interface CostEstimate {
  scenario: string;
  services: string[];
  estimatedCosts: {
    deductible: string;
    coinsurance: string;
    estimatedTotal: string;
  };
  recommendations: string[];
}

export interface GapAnalysis {
  focusArea: string;
  potentialGaps: string[];
  exclusions: string[];
  restrictions: string[];
  recommendations: string[];
}

// Medical Cost Intelligence Types
export interface ProcedureCostArgs {
  procedure: string;
  location?: string;
}

export interface InsuranceSavingsArgs {
  procedure: string;
  uninsuredCost?: number;
}

export interface AnnualCostPredictionArgs {
  healthProfile: 'healthy' | 'moderate_conditions' | 'chronic_conditions' | 'high_needs';
  age?: number;
}

export interface EnhancedCostInfo {
  procedure: string;
  location: string;
  costInformation: string;
  additionalFactors: string[];
  costSavingTips: string[];
}

export interface SavingsAnalysis {
  procedure: string;
  uninsuredCost: number | string;
  insuranceBenefits: {
    coverage: string;
    copay: string;
    coinsurance: string;
    deductible: string;
  };
  estimatedSavings: string;
  recommendations: string[];
}

export interface CostPrediction {
  healthProfile: string;
  age: number | string;
  planDetails: {
    deductible: string;
    outOfPocketMaximum: string;
  };
  estimatedAnnualCosts: string;
  costFactors: string[];
  budgetingTips: string[];
}

// MCP Client Types for Integration
export interface McpClientConfig {
  baseUrl: string;
  transport: 'sse' | 'http';
  apiKey?: string;
}

export interface McpRequest {
  method: string;
  params: {
    name: string;
    arguments?: Record<string, any>;
  };
}

export interface McpResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

// Error Types
export interface McpError {
  code: number;
  message: string;
  data?: any;
}

// Healthcare-specific MCP result types
export type HealthcareDocumentResult = DocumentClassification | ExtractedInformation | { [key: string]: any };
export type InsuranceAnalysisResult = CoverageAnalysis | CostEstimate | GapAnalysis;
export type CostIntelligenceResult = EnhancedCostInfo | SavingsAnalysis | CostPrediction;

// Union type for all healthcare MCP results
export type HealthcareMcpResult = HealthcareDocumentResult | InsuranceAnalysisResult | CostIntelligenceResult;

// MCP Integration with existing chat types
import type { ChatMessageWithSources } from './chat';

export interface ChatMessageWithMcp extends ChatMessageWithSources {
  mcpResults?: HealthcareMcpResult[];
  mcpToolsUsed?: string[];
}