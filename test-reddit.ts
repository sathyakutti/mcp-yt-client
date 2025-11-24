import { getRedditClient } from './lib/mcp/reddit-client';

async function testReddit() {
  const client = getRedditClient();
  
  try {
    console.log('🤖 Testing Reddit MCP Client...\n');
    
    // Connect to the server
    await client.connect();
    
    // List available tools
    console.log('📋 Available tools:');
    const tools = await client.listTools();
    console.log(JSON.stringify(tools, null, 2));
    
    // Search r/aws for cost optimization
    console.log('\n🔍 Searching r/aws for "cost optimization"...');
    const awsResults = await client.searchSubreddit('aws', 'cost optimization', 15);
    console.log(JSON.stringify(awsResults, null, 2));
    
    // Search r/devops for FinOps
    console.log('\n🔍 Searching r/devops for "FinOps"...');
    const finopsResults = await client.searchSubreddit('devops', 'FinOps', 15);
    console.log(JSON.stringify(finopsResults, null, 2));
    
    // Search r/MachineLearning for Transformer.js
    console.log('\n🔍 Searching r/MachineLearning for "Transformer.js"...');
    const transformerResults = await client.searchSubreddit('MachineLearning', 'Transformer.js OR client-side AI', 15);
    console.log(JSON.stringify(transformerResults, null, 2));
    
    // Get top posts from r/FinOps (if it exists)
    console.log('\n🔥 Getting top posts from r/FinOps...');
    const topPosts = await client.getTopPosts('FinOps', 'month', 10);
    console.log(JSON.stringify(topPosts, null, 2));
    
    console.log('\n✅ Reddit MCP test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  } finally {
    await client.disconnect();
  }
}

testReddit().catch(console.error);
