import { getDuckDuckGoClient } from './lib/mcp/duckduckgo-client';
import * as fs from 'fs';

async function testDuckDuckGo() {
  const client = getDuckDuckGoClient();
  
  try {
    console.log('🦆 Testing DuckDuckGo MCP Client (Fixed)...\n');
    
    await client.connect();
    
    // List available tools
    console.log('📋 Listing available tools...');
    const tools = await client.listTools();
    console.log(`Found ${tools.length} tools:`);
    tools.forEach((tool: any) => {
      console.log(`  - ${tool.name}`);
    });
    fs.writeFileSync('ddg-tools.json', JSON.stringify(tools, null, 2));
    console.log('✅ Saved\n');
    
    // Test searches
    const searches = [
      { query: 'FinOps AI automation platform', file: 'ddg-finops-ai.json' },
      { query: 'Transformer.js tutorial', file: 'ddg-transformerjs.json' },
      { query: 'AWS cost optimization 2025', file: 'ddg-aws-cost.json' },
      { query: 'client-side AI inference', file: 'ddg-client-ai.json' },
      { query: 'Model Context Protocol MCP', file: 'ddg-mcp.json' },
      { query: 'FinOps best practices', file: 'ddg-finops-practices.json' }
    ];
    
    for (const { query, file } of searches) {
      console.log(`🔍 Searching: "${query}"...`);
      try {
        const result = await client.search(query, 10);
        fs.writeFileSync(file, JSON.stringify(result, null, 2));
        console.log(`✅ Saved to ${file}\n`);
      } catch (error) {
        console.log(`⚠️  Failed: ${error instanceof Error ? error.message : String(error)}\n`);
      }
    }
    
    console.log('\n🎉 DuckDuckGo MCP test completed!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  } finally {
    await client.close();
  }
}

testDuckDuckGo().catch(console.error);
