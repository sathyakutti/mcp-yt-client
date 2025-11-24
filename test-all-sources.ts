import { getGitHubClient } from './lib/mcp/github-client';
import { getHackerNewsClient } from './lib/mcp/hackernews-client';
import { getDuckDuckGoClient } from './lib/mcp/duckduckgo-client';
import * as fs from 'fs';

interface ResearchSource {
  name: string;
  client: any;
  enabled: boolean;
  requiresAuth: boolean;
}

async function comprehensiveResearch() {
  console.log('🔬 COMPREHENSIVE FINOPS & AI RESEARCH');
  console.log('='.repeat(80));
  console.log('');
  
  const sources: ResearchSource[] = [
    {
      name: 'GitHub',
      client: getGitHubClient(),
      enabled: !!process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
      requiresAuth: true
    },
    {
      name: 'Hacker News',
      client: getHackerNewsClient(),
      enabled: true,
      requiresAuth: false
    },
    {
      name: 'DuckDuckGo',
      client: getDuckDuckGoClient(),
      enabled: true,
      requiresAuth: false
    }
  ];
  
  const results: any = {
    timestamp: new Date().toISOString(),
    sources: {},
    summary: {
      total_sources: 0,
      successful_sources: 0,
      failed_sources: 0
    }
  };
  
  // Research queries
  const queries = {
    finops: ['FinOps', 'cloud cost optimization', 'cloud cost management'],
    ai: ['AI agents', 'autonomous AI', 'AI automation'],
    transformerjs: ['Transformer.js', 'client-side AI', 'browser AI', 'WebGPU'],
    aws: ['AWS cost optimization', 'AWS FinOps'],
    competitors: ['OpenOps', 'infracost', 'cloud custodian'],
    mcp: ['Model Context Protocol', 'MCP server']
  };
  
  for (const source of sources) {
    console.log(`\n📡 Testing ${source.name}...`);
    console.log('-'.repeat(80));
    
    if (!source.enabled) {
      if (source.requiresAuth) {
        console.log(`⚠️  ${source.name} requires authentication - skipping`);
        results.summary.failed_sources++;
      } else {
        console.log(`⚠️  ${source.name} disabled - skipping`);
        results.summary.failed_sources++;
      }
      continue;
    }
    
    try {
      results.summary.total_sources++;
      
      // Connect
      await source.client.connect();
      console.log(`✅ Connected to ${source.name}`);
      
      // List tools
      const tools = await source.client.listTools();
      console.log(`   Found ${tools.length} available tools`);
      
      results.sources[source.name.toLowerCase()] = {
        connected: true,
        tools_count: tools.length,
        tools: tools.map((t: any) => t.name)
      };
      
      results.summary.successful_sources++;
      
      // Disconnect
      await source.client.disconnect();
      console.log(`✅ ${source.name} test complete`);
      
    } catch (error) {
      console.error(`❌ ${source.name} failed:`, error instanceof Error ? error.message : String(error));
      results.sources[source.name.toLowerCase()] = {
        connected: false,
        error: error instanceof Error ? error.message : String(error)
      };
      results.summary.failed_sources++;
    }
  }
  
  // Save results
  fs.writeFileSync('research-sources-summary.json', JSON.stringify(results, null, 2));
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESEARCH SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total sources tested: ${results.summary.total_sources}`);
  console.log(`Successful: ${results.summary.successful_sources}`);
  console.log(`Failed: ${results.summary.failed_sources}`);
  console.log('\n✅ Summary saved to research-sources-summary.json');
  
  // Generate next steps
  console.log('\n' + '='.repeat(80));
  console.log('📋 NEXT STEPS');
  console.log('='.repeat(80));
  
  const successfulSources = Object.entries(results.sources)
    .filter(([_, data]: [string, any]) => data.connected)
    .map(([name, _]: [string, any]) => name);
  
  if (successfulSources.length > 0) {
    console.log('\n✅ Run individual tests for successful sources:');
    successfulSources.forEach(source => {
      console.log(`   npx tsx test-${source}.ts`);
    });
  }
  
  const failedSources = Object.entries(results.sources)
    .filter(([_, data]: [string, any]) => !data.connected)
    .map(([name, data]: [string, any]) => ({ name, error: data.error }));
  
  if (failedSources.length > 0) {
    console.log('\n⚠️  Fix these sources:');
    failedSources.forEach(({ name, error }) => {
      console.log(`   ${name}: ${error}`);
    });
  }
  
  console.log('');
}

comprehensiveResearch().catch(console.error);
