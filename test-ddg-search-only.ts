import { getDuckDuckGoClient } from './lib/mcp/duckduckgo-client';
import * as fs from 'fs';

async function testSearch() {
  const client = getDuckDuckGoClient();
  
  try {
    console.log('🦆 Testing DuckDuckGo Search...\n');
    
    await client.connect();
    
    // Try a simple search without listing tools first
    console.log('🔍 Searching for "FinOps platform"...');
    const result = await client.search('FinOps platform', 5);
    console.log('✅ Result:', JSON.stringify(result, null, 2));
    fs.writeFileSync('ddg-test-search.json', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testSearch().catch(console.error);
