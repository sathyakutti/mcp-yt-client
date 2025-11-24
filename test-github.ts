import { getGitHubClient } from './lib/mcp/github-client';
import * as fs from 'fs';

async function testGitHub() {
  const client = getGitHubClient();
  
  try {
    console.log('🐙 Testing GitHub MCP Client...\n');
    
    // Check for GitHub token
    if (!process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
      console.log('⚠️  GITHUB_PERSONAL_ACCESS_TOKEN not found in environment variables');
      console.log('📝 Please set it by running:');
      console.log('   $env:GITHUB_PERSONAL_ACCESS_TOKEN="your_token_here"');
      console.log('\n💡 Or pass it directly to connect():');
      console.log('   await client.connect("your_token_here")');
      process.exit(1);
    }
    
    // Connect to the server
    await client.connect();
    
    // List available tools
    console.log('📋 Listing available tools...');
    const tools = await client.listTools();
    console.log(`Found ${tools.length} tools:`);
    tools.forEach((tool: any) => {
      console.log(`  - ${tool.name}: ${tool.description || 'No description'}`);
    });
    fs.writeFileSync('github-available-tools.json', JSON.stringify(tools, null, 2));
    console.log('✅ Saved to github-available-tools.json\n');
    
    // Search for FinOps repositories
    console.log('🔍 Searching for "FinOps" repositories...');
    try {
      const finopsRepos = await client.searchRepositories('finops stars:>10', 20);
      console.log(`Found repositories: ${JSON.stringify(finopsRepos).substring(0, 200)}...`);
      fs.writeFileSync('github-finops-repos.json', JSON.stringify(finopsRepos, null, 2));
      console.log('✅ Saved to github-finops-repos.json\n');
    } catch (error) {
      console.log(`⚠️  Search repositories failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    
    // Search for Transformer.js usage
    console.log('🔍 Searching for "Transformer.js" code...');
    try {
      const transformerCode = await client.searchCode('@xenova/transformers', 20);
      console.log(`Found code examples: ${JSON.stringify(transformerCode).substring(0, 200)}...`);
      fs.writeFileSync('github-transformerjs-code.json', JSON.stringify(transformerCode, null, 2));
      console.log('✅ Saved to github-transformerjs-code.json\n');
    } catch (error) {
      console.log(`⚠️  Code search failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    
    // Search for AWS cost optimization tools
    console.log('🔍 Searching for "AWS cost optimization" repositories...');
    try {
      const awsCostRepos = await client.searchRepositories('aws cost optimization stars:>50', 20);
      console.log(`Found repositories: ${JSON.stringify(awsCostRepos).substring(0, 200)}...`);
      fs.writeFileSync('github-aws-cost-repos.json', JSON.stringify(awsCostRepos, null, 2));
      console.log('✅ Saved to github-aws-cost-repos.json\n');
    } catch (error) {
      console.log(`⚠️  Search failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    
    // Search for AI agent + FinOps discussions
    console.log('🔍 Searching for "AI agent FinOps" issues...');
    try {
      const aiFinopsIssues = await client.searchIssues('ai agent finops', 30);
      console.log(`Found issues: ${JSON.stringify(aiFinopsIssues).substring(0, 200)}...`);
      fs.writeFileSync('github-ai-finops-issues.json', JSON.stringify(aiFinopsIssues, null, 2));
      console.log('✅ Saved to github-ai-finops-issues.json\n');
    } catch (error) {
      console.log(`⚠️  Issue search failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    
    console.log('\n✅ GitHub MCP test completed successfully!');
    console.log('\n📊 Results saved:');
    console.log('- github-available-tools.json - All available GitHub MCP tools');
    console.log('- github-finops-repos.json - FinOps repositories (if found)');
    console.log('- github-transformerjs-code.json - Transformer.js code examples (if found)');
    console.log('- github-aws-cost-repos.json - AWS cost optimization tools (if found)');
    console.log('- github-ai-finops-issues.json - AI agent FinOps discussions (if found)');
    console.log('\n💡 Check the JSON files for detailed results!');
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    console.error('\n💡 Make sure your GitHub token has the following permissions:');
    console.error('   - repo (if searching private repos)');
    console.error('   - public_repo (for public repos)');
  } finally {
    await client.disconnect();
  }
}

testGitHub().catch(console.error);
