import { getHackerNewsClient } from './lib/mcp/hackernews-client';
import * as fs from 'fs';

async function testHackerNews() {
  const client = getHackerNewsClient();
  
  try {
    console.log('📰 Testing Hacker News MCP Client...\n');
    
    // Connect to the server
    await client.connect();
    
    // List available tools
    console.log('📋 Listing available tools...');
    const tools = await client.listTools();
    console.log(`Found ${tools.length} tools:`);
    tools.forEach((tool: any) => {
      console.log(`  - ${tool.name}: ${tool.description || 'No description'}`);
    });
    fs.writeFileSync('hn-available-tools.json', JSON.stringify(tools, null, 2));
    console.log('✅ Saved to hn-available-tools.json\n');
    
    // Search for FinOps discussions
    console.log('🔍 Searching for "FinOps" stories...');
    try {
      const finopsStories = await client.searchStories('FinOps', 30);
      console.log(`Found: ${JSON.stringify(finopsStories).substring(0, 200)}...`);
      fs.writeFileSync('hn-finops-stories.json', JSON.stringify(finopsStories, null, 2));
      console.log('✅ Saved to hn-finops-stories.json\n');
    } catch (error) {
      console.log(`⚠️  Search failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    
    // Search for Transformer.js discussions
    console.log('🔍 Searching for "Transformer.js" stories...');
    try {
      const transformerStories = await client.searchStories('Transformer.js OR transformers.js', 30);
      console.log(`Found: ${JSON.stringify(transformerStories).substring(0, 200)}...`);
      fs.writeFileSync('hn-transformerjs-stories.json', JSON.stringify(transformerStories, null, 2));
      console.log('✅ Saved to hn-transformerjs-stories.json\n');
    } catch (error) {
      console.log(`⚠️  Search failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    
    // Search for AI cost optimization
    console.log('🔍 Searching for "AI cost optimization" stories...');
    try {
      const aiCostStories = await client.searchStories('AI cost optimization OR cloud cost AI', 30);
      console.log(`Found: ${JSON.stringify(aiCostStories).substring(0, 200)}...`);
      fs.writeFileSync('hn-ai-cost-stories.json', JSON.stringify(aiCostStories, null, 2));
      console.log('✅ Saved to hn-ai-cost-stories.json\n');
    } catch (error) {
      console.log(`⚠️  Search failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    
    // Search for AWS cost
    console.log('🔍 Searching for "AWS cost" stories...');
    try {
      const awsCostStories = await client.searchStories('AWS cost optimization', 30);
      console.log(`Found: ${JSON.stringify(awsCostStories).substring(0, 200)}...`);
      fs.writeFileSync('hn-aws-cost-stories.json', JSON.stringify(awsCostStories, null, 2));
      console.log('✅ Saved to hn-aws-cost-stories.json\n');
    } catch (error) {
      console.log(`⚠️  Search failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    
    // Search for client-side AI
    console.log('🔍 Searching for "client-side AI" stories...');
    try {
      const clientAIStories = await client.searchStories('client-side AI OR browser AI OR WebGPU', 30);
      console.log(`Found: ${JSON.stringify(clientAIStories).substring(0, 200)}...`);
      fs.writeFileSync('hn-client-ai-stories.json', JSON.stringify(clientAIStories, null, 2));
      console.log('✅ Saved to hn-client-ai-stories.json\n');
    } catch (error) {
      console.log(`⚠️  Search failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    
    console.log('\n✅ Hacker News MCP test completed successfully!');
    console.log('\n📊 Results saved:');
    console.log('- hn-available-tools.json - All available HN MCP tools');
    console.log('- hn-finops-stories.json - FinOps discussions (if found)');
    console.log('- hn-transformerjs-stories.json - Transformer.js discussions (if found)');
    console.log('- hn-ai-cost-stories.json - AI cost optimization discussions (if found)');
    console.log('- hn-aws-cost-stories.json - AWS cost discussions (if found)');
    console.log('- hn-client-ai-stories.json - Client-side AI discussions (if found)');
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  } finally {
    await client.disconnect();
  }
}

testHackerNews().catch(console.error);
