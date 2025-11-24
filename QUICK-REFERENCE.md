# 📚 Research Toolkit - Quick Reference Index
## All Documentation in One Place

**Last Updated:** November 24, 2025

---

## 🎯 What Do You Need?

### I want to research a new topic
→ Read: [RESEARCH-TOOLKIT-GUIDE.md](./RESEARCH-TOOLKIT-GUIDE.md)  
→ Use: `quickResearch('Your Topic', ['keyword1', 'keyword2'])`

### I want to know what data sources are available
→ Read: [MCP-CATALOG-RESEARCH.md](./MCP-CATALOG-RESEARCH.md)  
→ See: 8 MCP servers documented (3 working, 2 broken, 3 to test)

### I want to test a new MCP server
→ Read: [MCP-SERVER-COMPATIBILITY.md](./MCP-SERVER-COMPATIBILITY.md)  
→ Run: `npx tsx test-new-mcp.ts <docker-image>`

### I want to see the FinOps research results
→ Read: [COMPLETE-RESEARCH-ANALYSIS.md](../build/COMPLETE-RESEARCH-ANALYSIS.md)  
→ Data: 163 sources, 60KB analysis, competitive intelligence

### I want to understand the code structure
→ Read: This file (Architecture section below)

---

## 📁 File Structure

```
youtube-mcp-client/
│
├── 📚 DOCUMENTATION
│   ├── RESEARCH-TOOLKIT-GUIDE.md          # Complete tutorial & reference
│   ├── MCP-CATALOG-RESEARCH.md            # All available MCP servers
│   ├── MCP-SERVER-COMPATIBILITY.md        # Test results & compatibility
│   ├── LINKEDIN-RESEARCH-GUIDE.md         # Manual LinkedIn research
│   └── QUICK-REFERENCE.md                 # This file
│
├── 🔧 CORE FRAMEWORK
│   └── lib/
│       ├── research-orchestrator.ts       # Main orchestration engine
│       └── mcp/
│           ├── generic-mcp-client.ts      # Universal MCP client
│           ├── youtube-client.ts          # YouTube-specific
│           ├── github-client.ts           # GitHub-specific
│           ├── hackernews-client.ts       # Hacker News-specific
│           ├── duckduckgo-client.ts       # DuckDuckGo (broken)
│           └── linkedin-client.ts         # LinkedIn (ToS issues)
│
├── 🧪 TEST SCRIPTS
│   ├── test-new-mcp.ts                    # Test any MCP server
│   ├── test-github.ts                     # GitHub MCP example
│   ├── test-hackernews.ts                 # Hacker News example
│   └── test-*.ts                          # Various test scripts
│
└── 📊 RESEARCH OUTPUT (example)
    └── ../build/
        ├── COMPLETE-RESEARCH-ANALYSIS.md  # FinOps research report
        ├── GITHUB-RESEARCH-*.md           # GitHub data
        ├── TRANSFORMER-*.md               # YouTube transcripts
        └── *.json                         # Raw data files
```

---

## 🚀 Common Tasks

### 1. Research a New Topic (Fastest)

```typescript
import { quickResearch } from './lib/research-orchestrator';

// One-liner for quick research
await quickResearch('AI Coding Tools', [
  'GitHub Copilot alternatives',
  'Cursor AI',
  'Codeium',
  'Continue.dev'
]);

// Output: ./research-ai-coding-tools/RESEARCH-SUMMARY.md
```

### 2. Research a New Topic (Advanced)

```typescript
import { ResearchOrchestrator } from './lib/research-orchestrator';

const orchestrator = new ResearchOrchestrator({
  topic: 'Your Topic Here',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  sources: ['github', 'hackernews'], // Working sources
  outputDir: './my-research',
  limits: {
    github: 100,
    hackernews: 50
  }
});

const results = await orchestrator.runFullResearch();
console.log(`Collected ${results.totalDataPoints} data points!`);
```

### 3. Test a New MCP Server

```bash
# Quick test
npx tsx test-new-mcp.ts mcp/reddit "Reddit MCP"

# Check results
# ✅ = Server works, add to framework
# ❌ = Server broken, document issue
```

### 4. Add New MCP Server to Framework

**Step 1:** Test it first
```bash
npx tsx test-new-mcp.ts mcp/your-server "Server Name"
```

**Step 2:** Add to `lib/mcp/generic-mcp-client.ts`
```typescript
export const MCPServers = {
  // ... existing
  YOUR_SERVER: { name: 'Your Server', image: 'mcp/your-server' },
};
```

**Step 3:** Add collection method to `lib/research-orchestrator.ts`
```typescript
private async collectYourServer(): Promise<void> {
  const client = await createMCPClient(
    MCPServers.YOUR_SERVER.name,
    MCPServers.YOUR_SERVER.image
  );
  
  try {
    const data = await client.executeTool('search', {
      query: this.config.keywords[0],
      limit: 50
    });
    
    await this.saveData('your-server', data);
  } finally {
    await client.disconnect();
  }
}
```

**Step 4:** Use it!
```typescript
sources: ['github', 'hackernews', 'your-server']
```

### 5. Analyze Research Results

```typescript
import fs from 'fs/promises';

// Load research data
const data = JSON.parse(
  await fs.readFile('./my-research/github-2025-11-24.json', 'utf-8')
);

// Top 10 by stars
const top10 = data
  .sort((a, b) => b.stars - a.stars)
  .slice(0, 10);

console.log('Top Projects:', top10);
```

---

## 📊 Data Source Quick Reference

| Source | Status | Docker Image | Auth Required | Best For |
|--------|--------|--------------|---------------|----------|
| **GitHub** | ✅ Working | `ghcr.io/github/github-mcp-server` | Yes (PAT) | Code, Repos, Discussions |
| **Hacker News** | ✅ Working | `mcp/hackernews-mcp` | No | Trends, Community Sentiment |
| **YouTube** | ✅ Working | `mcp/youtube-transcript` | No | Video Content, Tutorials |
| **DuckDuckGo** | ⚠️ Broken | `mcp/duckduckgo` | No | (Server compatibility issues) |
| **LinkedIn** | ⚠️ ToS Issue | N/A | Cookie | (Use manual method instead) |
| **Reddit** | 🔜 Untested | `mcp/reddit` (?) | TBD | Community Discussions |
| **Brave Search** | 🔜 Untested | `mcp/brave-search` (?) | TBD | Web Search |
| **Exa** | 🔜 Untested | `mcp/exa` (?) | TBD | Semantic Search |
| **Tavily** | 🔜 Untested | `mcp/tavily` (?) | TBD | Research API |

---

## 🔧 Environment Setup

### Required for GitHub MCP

```powershell
# Set GitHub Personal Access Token
$env:GITHUB_PERSONAL_ACCESS_TOKEN = "ghp_your_token_here"

# Verify
echo $env:GITHUB_PERSONAL_ACCESS_TOKEN
```

### Check Docker Images

```powershell
# List all MCP images
docker images | Select-String "mcp"

# Pull a new image
docker pull mcp/reddit
```

---

## 📖 Code Examples

### Example 1: FinOps Research (Actual Project)

```typescript
const orchestrator = new ResearchOrchestrator({
  topic: 'FinOps AI Automation Platform',
  keywords: [
    'FinOps AI',
    'AWS cost optimization',
    'Transformer.js browser AI',
    'cloud cost management',
    'OpenOps FinOps'
  ],
  sources: ['youtube', 'github', 'hackernews'],
  outputDir: './finops-research'
});

// Result: 163 sources, found OpenOps competitor, validated tech stack
```

### Example 2: Web3 Gaming Research

```typescript
await quickResearch('Web3 Gaming Platforms', [
  'blockchain gaming',
  'play to earn',
  'NFT games',
  'GameFi platforms',
  'Axie Infinity alternatives'
]);
```

### Example 3: Developer Tools Research

```typescript
const orchestrator = new ResearchOrchestrator({
  topic: 'Modern Developer Tools',
  keywords: [
    'VS Code extensions',
    'AI coding assistants',
    'terminal tools',
    'git workflows',
    'debugging tools'
  ],
  sources: ['github', 'hackernews'],
  outputDir: './dev-tools-research',
  limits: {
    github: 150,
    hackernews: 75
  }
});
```

---

## 🎓 Learning Path

### Beginner: Use the Framework

1. Read [RESEARCH-TOOLKIT-GUIDE.md](./RESEARCH-TOOLKIT-GUIDE.md)
2. Try `quickResearch()` on a simple topic
3. Review the output in `RESEARCH-SUMMARY.md`
4. Analyze the JSON data files

### Intermediate: Customize Research

1. Use `ResearchOrchestrator` with custom config
2. Adjust limits and keywords
3. Test different data sources
4. Write custom analysis scripts

### Advanced: Extend the Framework

1. Test new MCP servers with `test-new-mcp.ts`
2. Add new data sources to orchestrator
3. Build custom collection methods
4. Contribute improvements

---

## 🐛 Troubleshooting

### Server Won't Connect

```powershell
# Check Docker is running
docker ps

# Check image exists
docker images | Select-String "mcp"

# Test manually
docker run -i --rm mcp/your-server
```

### Tool Not Found Error

```typescript
// List available tools first
const client = await createMCPClient('Server', 'mcp/image');
console.log('Tools:', client.getTools().map(t => t.name));

// Use exact name
await client.executeTool('exact_tool_name', { params });
```

### GitHub Authentication Error

```powershell
# Verify token is set
echo $env:GITHUB_PERSONAL_ACCESS_TOKEN

# Re-set if needed
$env:GITHUB_PERSONAL_ACCESS_TOKEN = "ghp_new_token"
```

---

## 📈 Performance Tips

### Fast Testing (5-10 minutes)

```typescript
limits: {
  github: 20,
  hackernews: 10
}
```

### Standard Research (30-60 minutes)

```typescript
limits: {
  github: 100,
  hackernews: 50
}
```

### Comprehensive Analysis (2-3 hours)

```typescript
limits: {
  github: 300,
  hackernews: 150,
  youtube: 100
}
```

---

## 🎯 Success Metrics

### FinOps Research (Real Example)

- **Sources:** 163 total (YouTube: 35, GitHub: 93, HN: 35)
- **Data Size:** ~1.5MB
- **Time:** 2 hours automated collection
- **Value:** 
  - Found top competitor (OpenOps: 958 stars)
  - Validated tech stack (Transformer.js: 1.7M downloads/week)
  - Identified cost savings ($10,450/year)
  - Generated 6-week sprint plan

**Manual Equivalent:** 20+ hours of research

---

## 🚀 Next Steps

1. **Pick a topic** you want to research
2. **Copy an example** from RESEARCH-TOOLKIT-GUIDE.md
3. **Run the research** with `quickResearch()` or `ResearchOrchestrator`
4. **Analyze results** using the JSON data
5. **Share insights** with your team

---

## 📞 Getting Help

### Documentation

- **Full Tutorial:** [RESEARCH-TOOLKIT-GUIDE.md](./RESEARCH-TOOLKIT-GUIDE.md)
- **Available Sources:** [MCP-CATALOG-RESEARCH.md](./MCP-CATALOG-RESEARCH.md)
- **Compatibility:** [MCP-SERVER-COMPATIBILITY.md](./MCP-SERVER-COMPATIBILITY.md)
- **Example Output:** `../build/COMPLETE-RESEARCH-ANALYSIS.md`

### Code Examples

- `test-github.ts` - GitHub MCP usage
- `test-hackernews.ts` - Hacker News MCP usage
- `test-new-mcp.ts` - Test any server
- `lib/research-orchestrator.ts` - Main framework

---

*🎉 Happy Researching! Use this toolkit to 10x your market research speed.*
