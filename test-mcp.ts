/**
 * Test script for YouTube MCP Client
 * Run with: npx tsx test-mcp.ts
 */

import { YouTubeMCPClient } from './lib/mcp/youtube-client';

async function testMCPClient() {
  console.log('🚀 Starting YouTube MCP Client test...\n');

  const client = new YouTubeMCPClient();

  try {
    // Connect to MCP server
    console.log('📡 Connecting to MCP server...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // List available tools
    console.log('🔧 Listing available tools...');
    const tools = await client.listTools();
    console.log('Available tools:', JSON.stringify(tools, null, 2));
    console.log('');

    // Test with a very short YouTube video
    // Using "Me at the zoo" - first YouTube video ever (18 seconds)
    const testVideoUrl = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';
    console.log(`📹 Testing with video: ${testVideoUrl}\n`);

    // Get transcript
    console.log('📝 Fetching transcript...');
    const transcript = await client.getTranscript(testVideoUrl);
    console.log('✅ Transcript received!');
    console.log('Title:', transcript.title);
    console.log('Transcript length:', transcript.transcript?.length || 0, 'characters');
    console.log('\nTranscript text:');
    console.log(transcript.transcript);
    console.log('');

    console.log('✅ All tests completed successfully!');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await client.disconnect();
    console.log('✅ Disconnected');
  }
}

// Run the test
testMCPClient().catch(console.error);
