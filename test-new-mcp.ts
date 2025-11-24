/**
 * 🔍 Test New MCP Server
 * 
 * PURPOSE: Quick testing script for any MCP server
 * USAGE: npx tsx test-new-mcp.ts <docker-image-name>
 */

import { createMCPClient } from './lib/mcp/generic-mcp-client';

async function testMCPServer(dockerImage: string, serverName?: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 TESTING MCP SERVER`);
  console.log(`${'='.repeat(80)}\n`);
  console.log(`📦 Docker Image: ${dockerImage}`);
  console.log(`🏷️  Server Name: ${serverName || 'Unknown'}\n`);

  try {
    // Step 1: Connect to server
    const client = await createMCPClient(serverName || 'Test Server', dockerImage);

    // Step 2: List available tools
    console.log(`\n📋 Available Tools:`);
    const tools = client.getTools();
    tools.forEach((tool, index) => {
      console.log(`\n${index + 1}. ${tool.name}`);
      if (tool.description) {
        console.log(`   Description: ${tool.description}`);
      }
      if (tool.inputSchema) {
        console.log(`   Input Schema:`, JSON.stringify(tool.inputSchema, null, 2));
      }
    });

    // Step 3: Test first search-like tool
    const searchTools = tools.filter(t => 
      t.name.toLowerCase().includes('search') ||
      t.name.toLowerCase().includes('query') ||
      t.name.toLowerCase().includes('find')
    );

    if (searchTools.length > 0) {
      const searchTool = searchTools[0];
      console.log(`\n🔍 Testing search tool: ${searchTool.name}`);
      
      try {
        const result = await client.executeTool(searchTool.name, {
          query: 'test',
          limit: 5
        });
        
        console.log(`✅ Search test successful!`);
        console.log(`   Results:`, JSON.stringify(result, null, 2).substring(0, 500) + '...');
      } catch (error: any) {
        console.log(`⚠️  Search test failed:`, error.message);
      }
    } else {
      console.log(`\nℹ️  No search tools found. Available tools:`, tools.map(t => t.name).join(', '));
    }

    // Step 4: Disconnect
    await client.disconnect();

    console.log(`\n✅ TEST COMPLETE - Server is functional!`);
    console.log(`\n💡 Next Steps:`);
    console.log(`   1. Add to MCPServers in generic-mcp-client.ts`);
    console.log(`   2. Create collection method in research-orchestrator.ts`);
    console.log(`   3. Use in your research projects!\n`);

    return { success: true, tools };

  } catch (error: any) {
    console.error(`\n❌ TEST FAILED:`, error.message);
    console.error(`\n🔧 Troubleshooting:`);
    console.error(`   1. Check if Docker image exists: docker images | grep ${dockerImage.split('/')[1] || dockerImage}`);
    console.error(`   2. Try running manually: docker run -i --rm ${dockerImage}`);
    console.error(`   3. Check server logs for errors\n`);

    return { success: false, error: error.message };
  }
}

// CLI usage
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`\n🔍 MCP Server Tester`);
  console.log(`\nUsage: npx tsx test-new-mcp.ts <docker-image> [server-name]`);
  console.log(`\nExamples:`);
  console.log(`  npx tsx test-new-mcp.ts mcp/reddit "Reddit MCP"`);
  console.log(`  npx tsx test-new-mcp.ts mcp/brave-search "Brave Search"`);
  console.log(`  npx tsx test-new-mcp.ts mcp/exa "Exa Search"`);
  console.log(`  npx tsx test-new-mcp.ts mcp/tavily "Tavily Research"\n`);
  process.exit(0);
}

const [dockerImage, serverName] = args;

testMCPServer(dockerImage, serverName)
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
