import { getDuckDuckGoClient } from './lib/mcp/duckduckgo-client';
import * as fs from 'fs';

async function debugDuckDuckGo() {
  const client = getDuckDuckGoClient();
  
  try {
    console.log('🦆 Testing DuckDuckGo MCP Client (Debug Mode)...\n');
    
    // Connect to the server
    await client.connect();
    console.log('✅ Connected successfully\n');
    
    // Wait longer for initialization
    console.log('⏳ Waiting 5 seconds for full initialization...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Manually send tools/list request to see raw response
    console.log('📋 Sending tools/list request...\n');
    
    // Access the private sendRequest method by type assertion
    const result = await (client as any).sendRequest('tools/list', {});
    console.log('✅ Raw result:', JSON.stringify(result, null, 2));
    fs.writeFileSync('ddg-debug-result.json', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  } finally {
    await client.close();
  }
}

debugDuckDuckGo().catch(console.error);
