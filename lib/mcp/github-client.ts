import { spawn, ChildProcess } from 'child_process';

interface MCPResponse {
  jsonrpc: string;
  id?: number;
  result?: any;
  error?: any;
}

export class GitHubMCPClient {
  private process: ChildProcess | null = null;
  private messageId = 0;
  private pendingRequests: Map<number, { resolve: Function; reject: Function }> = new Map();
  private buffer = '';

  async connect(githubToken?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('[GitHubMCP] Starting GitHub MCP server...');
      
      // Get token from parameter or environment variable
      const token = githubToken || process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
      
      if (!token) {
        reject(new Error('GITHUB_PERSONAL_ACCESS_TOKEN not provided. Please set it as environment variable or pass it to connect().'));
        return;
      }
      
      // Spawn the GitHub MCP server from Docker
      this.process = spawn('docker', [
        'run',
        '-i',
        '--rm',
        '-e',
        `GITHUB_PERSONAL_ACCESS_TOKEN=${token}`,
        'ghcr.io/github/github-mcp-server'
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
        // Only log actual errors, not debug info
        if (!message.includes('[debug]')) {
          console.error('[GitHubMCP]', message);
        }
      });

      // Handle process errors
      this.process.on('error', (error) => {
        console.error('[GitHubMCP] Process error:', error);
        reject(error);
      });

      // Handle process exit
      this.process.on('close', (code) => {
        console.log(`[GitHubMCP] Process closed with code: ${code}`);
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
          console.log('[GitHubMCP] Connected successfully');
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
          // Skip non-JSON lines (like debug output)
          if (!line.includes('[debug]')) {
            console.error('[GitHubMCP] Failed to parse response:', line);
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

  async searchRepositories(query: string, limit: number = 30): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'search_repositories',
      arguments: {
        query,
        limit
      }
    });
    return result;
  }

  async searchIssues(query: string, limit: number = 50): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'search_issues',
      arguments: {
        query,
        limit
      }
    });
    return result;
  }

  async searchCode(query: string, limit: number = 30): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'search_code',
      arguments: {
        query,
        limit
      }
    });
    return result;
  }

  async getRepository(owner: string, repo: string): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'get_repository',
      arguments: {
        owner,
        repo
      }
    });
    return result;
  }

  async getIssue(owner: string, repo: string, issueNumber: number): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'get_issue',
      arguments: {
        owner,
        repo,
        issue_number: issueNumber
      }
    });
    return result;
  }

  async listIssues(owner: string, repo: string, state: string = 'open', limit: number = 30): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name: 'list_issues',
      arguments: {
        owner,
        repo,
        state, // open, closed, all
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
let githubClientInstance: GitHubMCPClient | null = null;

export function getGitHubClient(): GitHubMCPClient {
  if (!githubClientInstance) {
    githubClientInstance = new GitHubMCPClient();
  }
  return githubClientInstance;
}
