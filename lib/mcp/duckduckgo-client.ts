import { spawn, ChildProcess } from 'child_process';

interface MCPResponse {
  jsonrpc: string;
  id?: number;
  result?: any;
  error?: any;
}

export class DuckDuckGoMCPClient {
  private process: ChildProcess | null = null;
  private messageId = 0;
  private pendingRequests: Map<number, { resolve: Function; reject: Function }> = new Map();
  private buffer = '';

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('[DuckDuckGoMCP] Starting DuckDuckGo MCP server...');
      
      // Spawn the DuckDuckGo MCP server from Docker
      this.process = spawn('docker', [
        'run',
        '-i',
        '--rm',
        'mcp/duckduckgo'
      ]);

      if (!this.process.stdin || !this.process.stdout || !this.process.stderr) {
        reject(new Error('Failed to create process streams'));
        return;
      }

      // Handle stdout data
      this.process.stdout.on('data', (data) => {
        this.buffer += data.toString();
        this.processBuffer();
      });

      // Handle stderr for logging
      this.process.stderr.on('data', (data) => {
        const message = data.toString();
        // Ignore debug and warning messages during initialization
        if (!message.includes('[debug]') && !message.includes('WARNING')) {
          console.error('[DuckDuckGoMCP]', message);
        }
      });

      // Handle process errors
      this.process.on('error', (error) => {
        console.error('[DuckDuckGoMCP] Process error:', error);
        reject(error);
      });

      // Handle process exit
      this.process.on('close', (code) => {
        console.log(`[DuckDuckGoMCP] Process closed with code: ${code}`);
        this.process = null;
      });

      // Initialize with longer timeout for server startup
      setTimeout(async () => {
        try {
          await this.initialize();
          console.log('[DuckDuckGoMCP] Connected successfully');
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 3000); // Increased timeout for initialization
    });
  }

  private async initialize(): Promise<any> {
    return this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      clientInfo: {
        name: 'finops-research-client',
        version: '1.0.0'
      }
    });
  }

  private processBuffer(): void {
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        try {
          const response: MCPResponse = JSON.parse(line);
          
          if (response.id !== undefined) {
            const pending = this.pendingRequests.get(response.id);
            if (pending) {
              this.pendingRequests.delete(response.id);
              if (response.error) {
                const errorMsg = JSON.stringify(response.error);
                console.error('[DuckDuckGoMCP] Server error:', errorMsg);
                pending.reject(new Error(errorMsg));
              } else {
                pending.resolve(response.result);
              }
            }
          }
        } catch (error) {
          if (!line.includes('[debug]')) {
            console.error('[DuckDuckGoMCP] Failed to parse response:', line);
          }
        }
      }
    }
  }

  private sendRequest(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.process || !this.process.stdin) {
        reject(new Error('Process not initialized'));
        return;
      }

      const id = ++this.messageId;
      const request: any = {
        jsonrpc: '2.0',
        id,
        method
      };

      // Only include params if they are provided
      if (params !== undefined) {
        request.params = params;
      }

      this.pendingRequests.set(id, { resolve, reject });

      this.process.stdin.write(JSON.stringify(request) + '\n');

      // Timeout after 30 seconds
      setTimeout(() => {
        const pending = this.pendingRequests.get(id);
        if (pending) {
          this.pendingRequests.delete(id);
          pending.reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  async listTools(): Promise<any> {
    const result = await this.sendRequest('tools/list', {});
    return result.tools || [];
  }

  async search(query: string, maxResults: number = 10): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'search',
      arguments: {
        query,
        max_results: maxResults
      }
    });
    return result;
  }

  async fetchContent(url: string): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'fetch_content',
      arguments: {
        url
      }
    });
    return result;
  }

  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  async close(): Promise<void> {
    await this.disconnect();
  }
}

// Singleton instance
let duckDuckGoClientInstance: DuckDuckGoMCPClient | null = null;

export function getDuckDuckGoClient(): DuckDuckGoMCPClient {
  if (!duckDuckGoClientInstance) {
    duckDuckGoClientInstance = new DuckDuckGoMCPClient();
  }
  return duckDuckGoClientInstance;
}
