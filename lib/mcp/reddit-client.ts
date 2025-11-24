import { spawn, ChildProcess } from 'child_process';

interface MCPResponse {
  jsonrpc: string;
  id?: number;
  result?: any;
  error?: any;
}

export class RedditMCPClient {
  private process: ChildProcess | null = null;
  private messageId = 0;
  private pendingRequests: Map<number, { resolve: Function; reject: Function }> = new Map();
  private buffer = '';

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('[RedditMCP] Starting Reddit MCP server...');
      
      // Spawn the Reddit MCP server from Docker
      this.process = spawn('docker', [
        'run',
        '-i',
        '--rm',
        'mcp/reddit',  // Adjust this to your actual Reddit MCP Docker image name
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
        console.error('[RedditMCP] Error:', data.toString());
      });

      // Handle process errors
      this.process.on('error', (error) => {
        console.error('[RedditMCP] Process error:', error);
        reject(error);
      });

      // Handle process exit
      this.process.on('close', (code) => {
        console.log(`[RedditMCP] Process closed with code: ${code}`);
      });

      // Send initialize request
      setTimeout(async () => {
        try {
          await this.sendRequest('initialize', {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'finops-research-client',
              version: '1.0.0'
            }
          });
          console.log('[RedditMCP] Connected successfully');
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 2000); // Give the server time to start
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
          console.error('[RedditMCP] Failed to parse response:', line);
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
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params: params || {}
      };

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

  async searchSubreddit(subreddit: string, query: string, limit: number = 25): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'search_subreddit',
      arguments: {
        subreddit,
        query,
        limit
      }
    });
    return result;
  }

  async getTopPosts(subreddit: string, timeframe: string = 'week', limit: number = 25): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'get_top_posts',
      arguments: {
        subreddit,
        timeframe, // hour, day, week, month, year, all
        limit
      }
    });
    return result;
  }

  async getPostComments(postUrl: string, limit: number = 50): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'get_comments',
      arguments: {
        url: postUrl,
        limit
      }
    });
    return result;
  }

  async searchReddit(query: string, limit: number = 50): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'search_all',
      arguments: {
        query,
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
}

// Singleton instance
let redditClientInstance: RedditMCPClient | null = null;

export function getRedditClient(): RedditMCPClient {
  if (!redditClientInstance) {
    redditClientInstance = new RedditMCPClient();
  }
  return redditClientInstance;
}
