import { spawn, ChildProcess } from 'child_process';

interface MCPResponse {
  jsonrpc: string;
  id?: number;
  result?: any;
  error?: any;
}

export class LinkedInMCPClient {
  private process: ChildProcess | null = null;
  private messageId = 0;
  private pendingRequests: Map<number, { resolve: Function; reject: Function }> = new Map();
  private buffer = '';

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('[LinkedInMCP] Starting LinkedIn MCP server...');
      
      // Spawn the LinkedIn MCP server from Docker
      this.process = spawn('docker', [
        'run',
        '-i',
        '--rm',
        'mcp/linkedin',  // Adjust this to your actual LinkedIn MCP Docker image name
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
          console.error('[LinkedInMCP]', message);
        }
      });

      // Handle process errors
      this.process.on('error', (error) => {
        console.error('[LinkedInMCP] Process error:', error);
        reject(error);
      });

      // Handle process exit
      this.process.on('close', (code) => {
        console.log(`[LinkedInMCP] Process closed with code: ${code}`);
        this.process = null;
      });

      // Initialize with longer timeout for server startup
      setTimeout(async () => {
        try {
          await this.initialize();
          console.log('[LinkedInMCP] Connected successfully');
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
                pending.reject(new Error(response.error.message || 'Unknown error'));
              } else {
                pending.resolve(response.result);
              }
            }
          }
        } catch (error) {
          console.error('[LinkedInMCP] Failed to parse response:', line);
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
    const result = await this.sendRequest('tools/list');
    return result.tools || [];
  }

  async searchPosts(query: string, limit: number = 20): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'search_posts',
      arguments: {
        query,
        limit
      }
    });
    return result;
  }

  async getProfile(profileUrl: string): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'get_profile',
      arguments: {
        url: profileUrl
      }
    });
    return result;
  }

  async getCompanyPosts(companyName: string, limit: number = 20): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'get_company_posts',
      arguments: {
        company: companyName,
        limit
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
    return this.disconnect();
  }
}

// Singleton instance
let linkedinClientInstance: LinkedInMCPClient | null = null;

export function getLinkedInClient(): LinkedInMCPClient {
  if (!linkedinClientInstance) {
    linkedinClientInstance = new LinkedInMCPClient();
  }
  return linkedinClientInstance;
}
