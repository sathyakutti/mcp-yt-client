/**
 * Generic MCP Client - Works with ANY MCP Server
 * 
 * PURPOSE: Reusable client that adapts to any MCP server's tool schema
 * FEATURES: Auto-discovers tools, dynamic method creation, unified interface
 */

import { spawn, ChildProcess } from 'child_process';

interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: any;
}

interface MCPMessage {
  jsonrpc: '2.0';
  id?: number;
  method?: string;
  params?: any;
  result?: any;
  error?: any;
}

export class GenericMCPClient {
  private process: ChildProcess | null = null;
  private messageId = 1;
  private tools: MCPTool[] = [];
  private serverName: string;
  private dockerImage: string;
  private responseHandlers: Map<number, (response: any) => void> = new Map();
  private errorHandlers: Map<number, (error: any) => void> = new Map();

  constructor(serverName: string, dockerImage: string) {
    this.serverName = serverName;
    this.dockerImage = dockerImage;
  }

  /**
   * Connect to the MCP server and discover available tools
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`\n🚀 Connecting to ${this.serverName} MCP Server...`);
      console.log(`📦 Docker Image: ${this.dockerImage}\n`);

      this.process = spawn('docker', ['run', '-i', '--rm', this.dockerImage], {
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
              const message: MCPMessage = JSON.parse(line);
              this.handleMessage(message);
            } catch (error) {
              console.error('Failed to parse message:', line);
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
          // Initialize the connection
          await this.sendRequest('initialize', {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'generic-mcp-client',
              version: '1.0.0',
            },
          });

          // Discover available tools
          await this.discoverTools();
          
          console.log(`✅ Connected to ${this.serverName}`);
          console.log(`🔧 Discovered ${this.tools.length} tools\n`);
          
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 2000);
    });
  }

  /**
   * Auto-discover all available tools from the server
   */
  private async discoverTools(): Promise<void> {
    const response = await this.sendRequest('tools/list');
    this.tools = response.tools || [];
    
    console.log('📋 Available Tools:');
    this.tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.name}${tool.description ? ` - ${tool.description}` : ''}`);
    });
  }

  /**
   * Get list of available tools
   */
  getTools(): MCPTool[] {
    return this.tools;
  }

  /**
   * Execute any tool by name with dynamic parameters
   */
  async executeTool(toolName: string, params?: any): Promise<any> {
    const tool = this.tools.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found. Available: ${this.tools.map(t => t.name).join(', ')}`);
    }

    console.log(`🔧 Executing: ${toolName}`);
    
    const requestParams: any = {
      name: toolName,
    };

    // Only include arguments if params are provided
    if (params !== undefined && params !== null && Object.keys(params).length > 0) {
      requestParams.arguments = params;
    }

    const response = await this.sendRequest('tools/call', requestParams);
    
    if (response.content && Array.isArray(response.content)) {
      return response.content;
    }
    
    return response;
  }

  /**
   * Generic search method (adapts to server's search tool name)
   */
  async search(query: string, options?: any): Promise<any> {
    // Try common search tool names
    const searchTools = ['search', 'search_repositories', 'search_stories', 'web_search'];
    
    for (const toolName of searchTools) {
      const tool = this.tools.find(t => t.name === toolName);
      if (tool) {
        return this.executeTool(toolName, { query, ...options });
      }
    }

    throw new Error(`No search tool found. Available tools: ${this.tools.map(t => t.name).join(', ')}`);
  }

  /**
   * Send a JSON-RPC request to the server
   */
  private async sendRequest(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.messageId++;
      
      this.responseHandlers.set(id, resolve);
      this.errorHandlers.set(id, reject);

      const request: MCPMessage = {
        jsonrpc: '2.0',
        id,
        method,
      };

      // Only include params if they exist and are not empty
      if (params !== undefined && params !== null) {
        if (typeof params === 'object' && Object.keys(params).length > 0) {
          request.params = params;
        } else if (typeof params !== 'object') {
          request.params = params;
        }
      }

      const message = JSON.stringify(request) + '\n';
      this.process?.stdin?.write(message);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.responseHandlers.has(id)) {
          this.responseHandlers.delete(id);
          this.errorHandlers.delete(id);
          reject(new Error(`Request timeout for ${method}`));
        }
      }, 30000);
    });
  }

  /**
   * Handle incoming messages from the server
   */
  private handleMessage(message: MCPMessage): void {
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

  /**
   * Disconnect from the server
   */
  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
      console.log(`\n👋 Disconnected from ${this.serverName}`);
    }
  }

  /**
   * Alias for disconnect (for compatibility)
   */
  async close(): Promise<void> {
    return this.disconnect();
  }
}

/**
 * Factory function to create MCP clients for different servers
 */
export async function createMCPClient(
  serverName: string,
  dockerImage: string
): Promise<GenericMCPClient> {
  const client = new GenericMCPClient(serverName, dockerImage);
  await client.connect();
  return client;
}

/**
 * Pre-configured clients for known MCP servers
 */
export const MCPServers = {
  YOUTUBE: { name: 'YouTube', image: 'mcp/youtube-transcript' },
  GITHUB: { name: 'GitHub', image: 'ghcr.io/github/github-mcp-server' },
  HACKERNEWS: { name: 'Hacker News', image: 'mcp/hackernews-mcp' },
  DUCKDUCKGO: { name: 'DuckDuckGo', image: 'mcp/duckduckgo' },
  // Add more as discovered...
  REDDIT: { name: 'Reddit', image: 'mcp/reddit' },
  BRAVE: { name: 'Brave Search', image: 'mcp/brave-search' },
  EXA: { name: 'Exa', image: 'mcp/exa' },
  TAVILY: { name: 'Tavily', image: 'mcp/tavily' },
};

/**
 * Quick helper to get a specific MCP client
 */
export async function getMCPClient(serverKey: keyof typeof MCPServers): Promise<GenericMCPClient> {
  const server = MCPServers[serverKey];
  return createMCPClient(server.name, server.image);
}
