# YouTube MCP Client

A Model Context Protocol (MCP) client for connecting to YouTube transcript servers running in Docker containers.

## Features

- 🎥 Fetch YouTube video transcripts
- 🔍 Search within transcripts
- 📝 Summarize transcript content
- 🐳 Docker-based MCP server integration
- 🔐 Next.js API routes with authentication
- 📡 JSON-RPC 2.0 protocol support

## Prerequisites

- Node.js 18+ 
- Docker Desktop with MCP Toolkit installed
- YouTube transcript MCP server configured in Docker Desktop

## Installation

```bash
npm install
```

## Configuration

### Docker Desktop MCP Server

Add this to your Docker Desktop MCP settings:

```json
{
  "mcpServers": {
    "youtube_transcript": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "mcp/youtube-transcript"
      ]
    }
  }
}
```

## Usage

### Start Development Server

```bash
npm run dev
```

### API Endpoints

#### Get Transcript

```bash
POST /api/youtube/transcript
Content-Type: application/json

{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "action": "get"
}
```

#### Search Transcript

```bash
POST /api/youtube/transcript
Content-Type: application/json

{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "action": "search",
  "query": "search term"
}
```

#### Summarize Transcript

```bash
POST /api/youtube/transcript
Content-Type: application/json

{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "action": "summarize"
}
```

#### List Available Tools

```bash
GET /api/youtube/transcript
```

### Using the Client Directly

```typescript
import { getYouTubeMCPClient } from './lib/mcp/youtube-client';

// Get client instance
const client = await getYouTubeMCPClient();

// Get transcript
const transcript = await client.getTranscript('https://www.youtube.com/watch?v=VIDEO_ID');

// Search transcript
const results = await client.searchTranscript('https://www.youtube.com/watch?v=VIDEO_ID', 'keyword');

// Summarize
const summary = await client.summarizeTranscript('https://www.youtube.com/watch?v=VIDEO_ID');

// Cleanup
await client.disconnect();
```

## Architecture

```
youtube-mcp-client/
├── lib/
│   └── mcp/
│       └── youtube-client.ts    # MCP client implementation
├── app/
│   └── api/
│       └── youtube/
│           └── transcript/
│               └── route.ts     # API endpoints
└── package.json
```

### How It Works

1. **MCP Client** spawns Docker container with `docker run -i --rm mcp/youtube-transcript`
2. **JSON-RPC 2.0** communication over stdin/stdout
3. **Singleton pattern** ensures one container instance
4. **Auto-cleanup** on process exit

## MCP Protocol

The client implements the Model Context Protocol:

- **Initialize**: Establishes connection with server capabilities
- **Tools List**: Retrieves available tools from server
- **Tools Call**: Executes tool with arguments
- **Response Handling**: Parses JSON-RPC responses

## Error Handling

- Connection timeouts (30s default)
- Docker process errors
- JSON-RPC error responses
- Automatic cleanup on failures

## Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

## License

MIT
