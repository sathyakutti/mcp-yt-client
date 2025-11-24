import { getLinkedInClient } from './lib/mcp/linkedin-client';

async function testLinkedIn() {
  const client = getLinkedInClient();
  
  try {
    console.log('🔗 Testing LinkedIn MCP Client...\n');
    
    // Connect to the server
    await client.connect();
    
    // List available tools
    console.log('📋 Available tools:');
    const tools = await client.listTools();
    console.log(JSON.stringify(tools, null, 2));
    
    // Search for FinOps posts
    console.log('\n🔍 Searching for "FinOps" posts...');
    const finopsResults = await client.searchPosts('FinOps', 10);
    console.log(JSON.stringify(finopsResults, null, 2));
    
    // Search for Transformer.js posts
    console.log('\n🔍 Searching for "Transformer.js" posts...');
    const transformerResults = await client.searchPosts('Transformer.js OR client-side AI', 10);
    console.log(JSON.stringify(transformerResults, null, 2));
    
    // Search for AWS cost optimization
    console.log('\n🔍 Searching for "AWS cost optimization" posts...');
    const awsResults = await client.searchPosts('AWS cost optimization', 10);
    console.log(JSON.stringify(awsResults, null, 2));
    
    console.log('\n✅ LinkedIn MCP test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  } finally {
    await client.disconnect();
  }
}

testLinkedIn().catch(console.error);
