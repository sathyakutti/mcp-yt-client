/**
 * MCP Client for YouTube Transcript Server
 * Connects to the YouTube transcript MCP server running in Docker
 */

import { spawn } from 'child_process';

interface MCPRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export class YouTubeMCPClient {
  private process: any = null;
  private requestId = 0;
  private pendingRequests = new Map<number, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }>();
  private buffer = '';

  /**
   * Start the MCP server Docker container
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Start the Docker container with MCP server
      this.process = spawn('docker', [
        'run',
        '-i',
        '--rm',
        'mcp/youtube-transcript'
      ]);

      this.process.stdout.on('data', (data: Buffer) => {
        this.handleData(data);
      });

      this.process.stderr.on('data', (data: Buffer) => {
        console.error('[YouTubeMCP] Error:', data.toString());
      });

      this.process.on('error', (error: Error) => {
        console.error('[YouTubeMCP] Process error:', error);
        reject(error);
      });

      this.process.on('close', (code: number) => {
        console.log('[YouTubeMCP] Process closed with code:', code);
        this.process = null;
      });

      // Initialize connection
      setTimeout(() => {
        this.initialize()
          .then(() => resolve())
          .catch(reject);
      }, 1000);
    });
  }

  /**
   * Handle incoming data from MCP server
   */
  private handleData(data: Buffer): void {
    this.buffer += data.toString();
    
    // Process complete JSON-RPC messages
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      
      try {
        const response: MCPResponse = JSON.parse(line);
        const pending = this.pendingRequests.get(response.id);
        
        if (pending) {
          this.pendingRequests.delete(response.id);
          
          if (response.error) {
            pending.reject(new Error(response.error.message));
          } else {
            pending.resolve(response.result);
          }
        }
      } catch (error) {
        console.error('[YouTubeMCP] Failed to parse response:', line, error);
      }
    }
  }

  /**
   * Send request to MCP server
   */
  private async sendRequest(method: string, params?: any): Promise<any> {
    if (!this.process) {
      throw new Error('MCP client not connected');
    }

    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      const request: MCPRequest = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      this.pendingRequests.set(id, { resolve, reject });

      // Send request
      this.process.stdin.write(JSON.stringify(request) + '\n');

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  /**
   * Initialize the MCP server
   */
  async initialize(): Promise<any> {
    return this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      clientInfo: {
        name: 'youtube-mcp-client',
        version: '1.0.0'
      }
    });
  }

  /**
   * List available tools from the MCP server
   */
  async listTools(): Promise<any> {
    return this.sendRequest('tools/list');
  }

  /**
   * Get YouTube transcript
   */
  async getTranscript(videoUrl: string): Promise<{
    videoId: string;
    title: string;
    transcript: Array<{
      text: string;
      start: number;
      duration: number;
    }>;
  }> {
    const result = await this.sendRequest('tools/call', {
      name: 'get_transcript',
      arguments: {
        url: videoUrl
      }
    });

    return result;
  }

  /**
   * Search within a transcript
   */
  async searchTranscript(videoUrl: string, query: string): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'search_transcript',
      arguments: {
        url: videoUrl,
        query: query
      }
    });

    return result;
  }

  /**
   * Get transcript summary
   */
  async summarizeTranscript(videoUrl: string): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'summarize_transcript',
      arguments: {
        url: videoUrl
      }
    });

    return result;
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.stdin.end();
      this.process.kill();
      this.process = null;
    }
    this.pendingRequests.clear();
    this.buffer = '';
  }
}

// Singleton instance
let mcpClient: YouTubeMCPClient | null = null;

/**
 * Get or create MCP client instance
 */
export async function getYouTubeMCPClient(): Promise<YouTubeMCPClient> {
  if (!mcpClient) {
    mcpClient = new YouTubeMCPClient();
    await mcpClient.connect();
  }
  return mcpClient;
}

/**
 * Cleanup MCP client on process exit
 */
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    if (mcpClient) {
      mcpClient.disconnect();
    }
  });
}
