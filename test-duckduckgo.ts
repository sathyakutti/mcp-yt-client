import { getDuckDuckGoClient } from './lib/mcp/duckduckgo-client';
import * as fs from 'fs';

async function testDuckDuckGo() {
  const client = getDuckDuckGoClient();
  
  try {
    console.log('🦆 Testing DuckDuckGo MCP Client...\n');
    
    // Connect to the server
    await client.connect();
    
    // List available tools
    console.log('📋 Listing available tools...');
    const tools = await client.listTools();
    console.log(`Found ${tools.length} tools:`);
    tools.forEach((tool: any) => {
      console.log(`  - ${tool.name}: ${tool.description || 'No description'}`);
    });
    fs.writeFileSync('ddg-available-tools.json', JSON.stringify(tools, null, 2));
    console.log('✅ Saved to ddg-available-tools.json\n');
    
    // Search for FinOps + AI
    console.log('🔍 Searching for "FinOps AI automation"...');
    try {
      const finopsAI = await client.search('FinOps AI automation platform', 20);
      console.log(`Found: ${JSON.stringify(finopsAI).substring(0, 200)}...`);
      fs.writeFileSync('ddg-finops-ai.json', JSON.stringify(finopsAI, null, 2));
      console.log('✅ Saved to ddg-finops-ai.json\n');
    } catch (error) {
      console.log(`⚠️  Search failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    
    // Search for Transformer.js examples
    console.log('🔍 Searching for "Transformer.js tutorial"...');
    try {
      const transformerTutorials = await client.search('Transformer.js tutorial examples', 20);
      console.log(`Found: ${JSON.stringify(transformerTutorials).substring(0, 200)}...`);
      fs.writeFileSync('ddg-transformerjs-tutorials.json', JSON.stringify(transformerTutorials, null, 2));
      console.log('✅ Saved to ddg-transformerjs-tutorials.json\n');
    } catch (error) {
      console.log(`⚠️  Search failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    
    // Search for AWS cost optimization tools
    console.log('🔍 Searching for "AWS cost optimization tools 2025"...');
    try {
      const awsTools = await client.search('AWS cost optimization tools 2025', 20);
      console.log(`Found: ${JSON.stringify(awsTools).substring(0, 200)}...`);
      fs.writeFileSync('ddg-aws-cost-tools.json', JSON.stringify(awsTools, null, 2));
      console.log('✅ Saved to ddg-aws-cost-tools.json\n');
    } catch (error) {
      console.log(`⚠️  Search failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    
    // Search for client-side AI
    console.log('🔍 Searching for "client-side AI inference WebGPU"...');
    try {
      const clientAI = await client.search('client-side AI inference WebGPU browser', 20);
      console.log(`Found: ${JSON.stringify(clientAI).substring(0, 200)}...`);
      fs.writeFileSync('ddg-client-ai.json', JSON.stringify(clientAI, null, 2));
      console.log('✅ Saved to ddg-client-ai.json\n');
    } catch (error) {
      console.log(`⚠️  Search failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    
    // Search for MCP server implementations
    console.log('🔍 Searching for "Model Context Protocol MCP server"...');
    try {
      const mcpServers = await client.search('Model Context Protocol MCP server implementation', 20);
      console.log(`Found: ${JSON.stringify(mcpServers).substring(0, 200)}...`);
      fs.writeFileSync('ddg-mcp-servers.json', JSON.stringify(mcpServers, null, 2));
      console.log('✅ Saved to ddg-mcp-servers.json\n');
    } catch (error) {
      console.log(`⚠️  Search failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    
    // Search news for recent FinOps developments
    console.log('🔍 Searching news for "FinOps"...');
    try {
      const finopsNews = await client.searchNews('FinOps cloud cost management', 20);
      console.log(`Found: ${JSON.stringify(finopsNews).substring(0, 200)}...`);
      fs.writeFileSync('ddg-finops-news.json', JSON.stringify(finopsNews, null, 2));
      console.log('✅ Saved to ddg-finops-news.json\n');
    } catch (error) {
      console.log(`⚠️  News search failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    
    console.log('\n✅ DuckDuckGo MCP test completed successfully!');
    console.log('\n📊 Results saved:');
    console.log('- ddg-available-tools.json - All available DDG MCP tools');
    console.log('- ddg-finops-ai.json - FinOps AI automation results');
    console.log('- ddg-transformerjs-tutorials.json - Transformer.js tutorials');
    console.log('- ddg-aws-cost-tools.json - AWS cost optimization tools');
    console.log('- ddg-client-ai.json - Client-side AI results');
    console.log('- ddg-mcp-servers.json - MCP server implementations');
    console.log('- ddg-finops-news.json - Recent FinOps news');
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  } finally {
    await client.disconnect();
  }
}

testDuckDuckGo().catch(console.error);
