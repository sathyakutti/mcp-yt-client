import { getDuckDuckGoClient } from './lib/mcp/duckduckgo-client';
import * as fs from 'fs';

async function testDuckDuckGoSimple() {
  const client = getDuckDuckGoClient();
  
  try {
    console.log('🦆 Testing DuckDuckGo MCP Client (Simple)...\n');
    
    // Connect to the server with a delay
    await client.connect();
    
    // Wait a bit for initialization
    console.log('⏳ Waiting for server initialization...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Try listing tools
    console.log('📋 Attempting to list tools...');
    try {
      const tools = await client.listTools();
      console.log(`✅ Found ${tools.length} tools:`);
      tools.forEach((tool: any) => {
        console.log(`  - ${tool.name}: ${tool.description || 'No description'}`);
      });
      fs.writeFileSync('ddg-available-tools.json', JSON.stringify(tools, null, 2));
      console.log('✅ Saved to ddg-available-tools.json\n');
      
      // If tools are available, try one simple search
      if (tools.length > 0) {
        console.log('🔍 Trying a simple search...');
        const result = await client.search('FinOps platform', 5);
        console.log(`Result: ${JSON.stringify(result, null, 2)}`);
        fs.writeFileSync('ddg-test-result.json', JSON.stringify(result, null, 2));
        console.log('✅ Saved to ddg-test-result.json');
      }
    } catch (error) {
      console.error('❌ Tool listing failed:', error);
      console.log('\nThis MCP server may require specific initialization or parameters.');
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await client.close();
  }
}

testDuckDuckGoSimple().catch(console.error);
