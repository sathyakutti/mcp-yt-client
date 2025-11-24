/**
 * 🔍 Test Exa (Metaphor) MCP Server
 * 
 * PURPOSE: Test Exa semantic search for FinOps research
 * REQUIRES: EXA_API_KEY environment variable
 * 
 * Exa provides AI-powered semantic search - finds content by meaning, not just keywords
 */

import { spawn, ChildProcess } from 'child_process';

interface ExaResult {
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  score?: number;
  text?: string;
}

class ExaMCPClient {
  private process: ChildProcess | null = null;
  private messageId = 1;
  private responseHandlers: Map<number, (response: any) => void> = new Map();
  private errorHandlers: Map<number, (error: any) => void> = new Map();

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🔍 Connecting to Exa (Metaphor) MCP Server`);
      console.log(`${'='.repeat(80)}\n`);

      // Check for API key
      const apiKey = process.env.EXA_API_KEY;
      if (!apiKey || apiKey === 'your-api-key-here') {
        console.error('❌ ERROR: EXA_API_KEY not set or using placeholder');
        console.error('\n💡 To get an API key:');
        console.error('   1. Visit https://exa.ai (or https://metaphor.systems)');
        console.error('   2. Sign up for an account');
        console.error('   3. Get your API key');
        console.error('   4. Set: $env:EXA_API_KEY = "your-real-key-here"\n');
        reject(new Error('EXA_API_KEY not configured'));
        return;
      }

      console.log('✅ EXA_API_KEY found');
      console.log('📦 Docker Image: mcp/exa\n');

      this.process = spawn('docker', [
        'run',
        '-i',
        '--rm',
        '-e',
        `EXA_API_KEY=${apiKey}`,
        'mcp/exa'
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let buffer = '';

      this.process.stdout?.on('data', (data) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const message = JSON.parse(line);
              this.handleMessage(message);
            } catch (error) {
              console.error('Failed to parse:', line);
            }
          }
        }
      });

      this.process.stderr?.on('data', (data) => {
        const errorText = data.toString();
        if (!errorText.includes('Starting') && !errorText.includes('Listening')) {
          console.error('Server error:', errorText);
        }
      });

      this.process.on('error', (error) => {
        console.error('Process error:', error);
        reject(error);
      });

      setTimeout(async () => {
        try {
          await this.sendRequest('initialize', {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'exa-test-client',
              version: '1.0.0',
            },
          });

          console.log('✅ Connected to Exa MCP\n');
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 3000);
    });
  }

  async listTools(): Promise<any[]> {
    console.log('📋 Discovering available tools...\n');
    const response = await this.sendRequest('tools/list');
    const tools = response.tools || [];
    
    console.log('Available Tools:');
    tools.forEach((tool: any, index: number) => {
      console.log(`\n${index + 1}. ${tool.name}`);
      if (tool.description) {
        console.log(`   ${tool.description}`);
      }
      if (tool.inputSchema?.properties) {
        console.log('   Parameters:', Object.keys(tool.inputSchema.properties).join(', '));
      }
    });
    
    return tools;
  }

  async search(query: string, options?: {
    numResults?: number;
    type?: 'neural' | 'keyword';
    useAutoprompt?: boolean;
  }): Promise<ExaResult[]> {
    console.log(`\n🔍 Searching Exa: "${query}"`);
    
    const params: any = {
      name: 'search',
      arguments: {
        query,
        num_results: options?.numResults || 10,
        type: options?.type || 'neural',
        use_autoprompt: options?.useAutoprompt !== false
      }
    };

    const response = await this.sendRequest('tools/call', params);
    
    if (response.content && Array.isArray(response.content)) {
      const results = response.content[0]?.text 
        ? JSON.parse(response.content[0].text)
        : response.content;
      
      console.log(`   Found ${results.length} results\n`);
      return results;
    }
    
    return [];
  }

  async findSimilar(url: string, numResults: number = 5): Promise<ExaResult[]> {
    console.log(`\n🔗 Finding content similar to: ${url}`);
    
    const response = await this.sendRequest('tools/call', {
      name: 'find_similar',
      arguments: {
        url,
        num_results: numResults
      }
    });
    
    if (response.content && Array.isArray(response.content)) {
      const results = response.content[0]?.text 
        ? JSON.parse(response.content[0].text)
        : response.content;
      
      console.log(`   Found ${results.length} similar pages\n`);
      return results;
    }
    
    return [];
  }

  private async sendRequest(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.messageId++;
      
      this.responseHandlers.set(id, resolve);
      this.errorHandlers.set(id, reject);

      const request: any = {
        jsonrpc: '2.0',
        id,
        method,
      };

      if (params !== undefined) {
        request.params = params;
      }

      const message = JSON.stringify(request) + '\n';
      this.process?.stdin?.write(message);

      setTimeout(() => {
        if (this.responseHandlers.has(id)) {
          this.responseHandlers.delete(id);
          this.errorHandlers.delete(id);
          reject(new Error(`Request timeout for ${method}`));
        }
      }, 30000);
    });
  }

  private handleMessage(message: any): void {
    if (message.id !== undefined) {
      const resolver = this.responseHandlers.get(message.id);
      const rejecter = this.errorHandlers.get(message.id);

      if (message.error) {
        rejecter?.(message.error);
      } else {
        resolver?.(message.result);
      }

      this.responseHandlers.delete(message.id);
      this.errorHandlers.delete(message.id);
    }
  }

  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
      console.log('\n👋 Disconnected from Exa MCP');
    }
  }
}

async function testExaMCP() {
  const client = new ExaMCPClient();

  try {
    // Step 1: Connect
    await client.connect();

    // Step 2: List available tools
    const tools = await client.listTools();

    // Step 3: Test semantic search for FinOps
    console.log(`\n${'='.repeat(80)}`);
    console.log('🔍 Testing FinOps AI Research');
    console.log(`${'='.repeat(80)}\n`);

    const finopsResults = await client.search(
      'AI-powered FinOps platforms with automated cost optimization',
      { numResults: 10, type: 'neural' }
    );

    console.log('Top FinOps Results:');
    finopsResults.slice(0, 5).forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.title}`);
      console.log(`   URL: ${result.url}`);
      if (result.author) console.log(`   Author: ${result.author}`);
      if (result.publishedDate) console.log(`   Date: ${result.publishedDate}`);
      if (result.text) {
        console.log(`   Preview: ${result.text.substring(0, 150)}...`);
      }
    });

    // Step 4: Test Transformer.js search
    console.log(`\n${'='.repeat(80)}`);
    console.log('🔍 Testing Browser AI / Transformer.js Research');
    console.log(`${'='.repeat(80)}\n`);

    const transformerResults = await client.search(
      'Transformer.js browser-based AI inference production usage',
      { numResults: 10, type: 'neural' }
    );

    console.log('Top Transformer.js Results:');
    transformerResults.slice(0, 5).forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.title}`);
      console.log(`   URL: ${result.url}`);
      if (result.publishedDate) console.log(`   Date: ${result.publishedDate}`);
    });

    // Step 5: Save results
    const fs = await import('fs/promises');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    await fs.writeFile(
      `exa-finops-${timestamp}.json`,
      JSON.stringify(finopsResults, null, 2)
    );

    await fs.writeFile(
      `exa-transformerjs-${timestamp}.json`,
      JSON.stringify(transformerResults, null, 2)
    );

    console.log(`\n💾 Saved results to:`);
    console.log(`   - exa-finops-${timestamp}.json`);
    console.log(`   - exa-transformerjs-${timestamp}.json`);

    // Summary
    console.log(`\n${'='.repeat(80)}`);
    console.log('✅ EXA MCP TEST COMPLETE');
    console.log(`${'='.repeat(80)}\n`);
    console.log('📊 Results:');
    console.log(`   - FinOps results: ${finopsResults.length}`);
    console.log(`   - Transformer.js results: ${transformerResults.length}`);
    console.log(`   - Total: ${finopsResults.length + transformerResults.length}`);
    console.log('\n💡 Next Steps:');
    console.log('   1. Review JSON files for quality');
    console.log('   2. Add Exa to research-orchestrator.ts');
    console.log('   3. Run full FinOps research with Exa included\n');

    await client.disconnect();

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('Unable to find image')) {
      console.error('\n🔧 Solution: Pull the image first');
      console.error('   docker pull mcp/exa');
    } else if (error.message.includes('EXA_API_KEY')) {
      console.error('\n🔧 Solution: Set your Exa API key');
      console.error('   $env:EXA_API_KEY = "your-actual-api-key"');
    }
    
    await client.disconnect();
    process.exit(1);
  }
}

// Run the test
console.log('🚀 Starting Exa MCP Test...\n');
testExaMCP();
