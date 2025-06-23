import { google } from 'googleapis';

const customsearch = google.customsearch('v1');

export interface SearchResult {
  title: string;
  snippet: string;
  link: string;
}

export async function searchGoogle(query: string): Promise<SearchResult[]> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      throw new Error('Google API credentials not configured');
    }

    const response = await customsearch.cse.list({
      auth: apiKey,
      cx: searchEngineId,
      q: query,
      num: 5, // Number of results to return
    });

    const items = response.data.items || [];
    
    return items.map(item => ({
      title: item.title || '',
      snippet: item.snippet || '',
      link: item.link || '',
    }));
  } catch (error) {
    console.error('Google search error:', error);
    return [];
  }
}

export async function searchMedicalTestCost(testName: string): Promise<string> {
  try {
    const query = `${testName} cost price medical test procedure "average cost" "$"`;
    const results = await searchGoogle(query);
    
    if (results.length === 0) {
      return `Unable to find current cost information for ${testName}. Please consult with healthcare providers for accurate pricing.`;
    }

    // Extract cost information from snippets
    const costInfo = extractCostFromResults(results, testName);
    
    if (costInfo) {
      return `${testName} Cost Estimate:\n\n${costInfo}\n\nNote: Costs vary significantly by location, insurance coverage, and healthcare provider. Always verify with your specific provider.`;
    } else {
      return `${testName} costs vary widely based on location and provider. Typical ranges are $200-$3,000+ depending on the type of ${testName.toLowerCase()}, location, and insurance coverage. Contact your healthcare provider for specific pricing.`;
    }
  } catch (error) {
    console.error('Error searching for medical test cost:', error);
    return `Unable to retrieve cost information for ${testName} at this time. Please try again later.`;
  }
}

function extractCostFromResults(results: SearchResult[], testName: string): string | null {
  const costPatterns = [
    /\$[\d,]+(?:\s*-\s*\$[\d,]+)?/g,
    /[\d,]+\s*(?:to|-)?\s*[\d,]+\s*dollars?/gi,
    /costs?\s+(?:range|between|from)?\s*\$?[\d,]+/gi,
    /average\s+(?:cost|price)\s*:?\s*\$?[\d,]+/gi
  ];
  
  const foundCosts: string[] = [];
  
  results.forEach(result => {
    const text = `${result.title} ${result.snippet}`.toLowerCase();
    
    costPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        foundCosts.push(...matches);
      }
    });
  });
  
  if (foundCosts.length > 0) {
    // Clean up and deduplicate costs
    const uniqueCosts = [...new Set(foundCosts)]
      .slice(0, 3) // Take first 3 unique cost mentions
      .map(cost => cost.replace(/costs?\s+(?:range|between|from)?\s*/gi, '').trim());
    
    return `Based on current data: ${uniqueCosts.join(', ')}`;
  }
  
  return null;
} 