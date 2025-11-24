# 🔍 Exa (Metaphor) MCP Setup Guide

## What is Exa?

**Exa (formerly Metaphor)** is an AI-powered semantic search engine that finds content by **meaning**, not just keywords.

**Why It's Valuable for Research:**
- ✅ **Neural search** - Understands context and intent
- ✅ **High-quality results** - Filters for authoritative sources
- ✅ **Similar content** - Find pages like a given URL
- ✅ **Better than Google** for research tasks

**Perfect For:**
- Finding expert blog posts
- Discovering technical documentation
- Research papers and case studies
- Related content discovery

---

## 🚀 Setup Instructions

### Step 1: Get Your Exa API Key

1. **Visit:** https://exa.ai (or https://metaphor.systems)
2. **Sign up** for a free account
3. **Navigate to:** Dashboard → API Keys
4. **Copy** your API key (starts with `exa_...`)

**Free Tier Includes:**
- 1,000 searches/month
- Neural + keyword search
- Basic features

### Step 2: Configure the API Key

**PowerShell (Windows):**
```powershell
# Set for current session
$env:EXA_API_KEY = "exa_your_actual_key_here"

# Verify it's set
echo $env:EXA_API_KEY

# Set permanently (optional)
[System.Environment]::SetEnvironmentVariable('EXA_API_KEY', 'exa_your_actual_key_here', 'User')
```

**Bash (Mac/Linux):**
```bash
# Set for current session
export EXA_API_KEY="exa_your_actual_key_here"

# Add to ~/.bashrc or ~/.zshrc for permanent
echo 'export EXA_API_KEY="exa_your_actual_key_here"' >> ~/.bashrc
```

### Step 3: Pull the Docker Image

```powershell
# Pull the Exa MCP server image
docker pull mcp/exa

# Verify it's available
docker images | Select-String "exa"
```

**Note:** If `mcp/exa` doesn't exist, the image might be:
- `metaphorsystems/mcp-server`
- `exa/mcp-server`
- Or you may need to build it from source

### Step 4: Test the Connection

```powershell
# Navigate to the project
cd c:\Users\sathy\OneDrive\Documents\youtube-mcp-client

# Run the test script
npx tsx test-exa.ts
```

**Expected Output:**
```
🔍 Connecting to Exa (Metaphor) MCP Server
✅ EXA_API_KEY found
📦 Docker Image: mcp/exa

📋 Discovering available tools...

Available Tools:

1. search
   Neural search for high-quality content
   Parameters: query, num_results, type, use_autoprompt

2. find_similar
   Find content similar to a given URL
   Parameters: url, num_results

🔍 Testing FinOps AI Research
...
```

---

## 🔧 Troubleshooting

### Issue: "Unable to find image 'mcp/exa:latest'"

**Solution 1:** Check alternative image names
```powershell
docker search metaphor
docker search exa
```

**Solution 2:** Build from source
```powershell
git clone https://github.com/metaphorsystems/mcp-server
cd mcp-server
docker build -t mcp/exa .
```

**Solution 3:** Use different MCP server
If Exa isn't available, try:
- Brave Search MCP
- Tavily MCP
- Perplexity MCP (if available)

### Issue: "EXA_API_KEY not configured"

**Solution:**
```powershell
# Set the key
$env:EXA_API_KEY = "your-actual-key"

# NOT this placeholder!
# $env:EXA_API_KEY = "your-api-key-here"  ❌
```

### Issue: "API key invalid" or 401 errors

**Solution:**
1. Verify key is correct (copy-paste from Exa dashboard)
2. Check if key has expired
3. Ensure you're on the right plan (free tier limits)

### Issue: Network timeout errors

**Solution:**
```powershell
# Check Docker networking
docker network ls

# Test basic connectivity
docker run --rm alpine ping -c 3 exa.ai

# Check firewall/VPN settings
```

---

## 📊 Usage Examples

### Example 1: FinOps Research

```typescript
import { ExaMCPClient } from './test-exa';

const client = new ExaMCPClient();
await client.connect();

const results = await client.search(
  'AI-powered FinOps platforms with automated cost optimization',
  { numResults: 20, type: 'neural' }
);

// High-quality blog posts, whitepapers, case studies
console.log('Found:', results.length, 'expert sources');
```

### Example 2: Technology Validation

```typescript
const results = await client.search(
  'Transformer.js production deployment success stories',
  { numResults: 15, type: 'neural' }
);

// Real-world production usage examples
```

### Example 3: Competitor Research

```typescript
const results = await client.search(
  'OpenOps FinOps platform reviews and comparisons',
  { numResults: 10, type: 'neural' }
);

// User reviews, comparison articles, case studies
```

### Example 4: Find Similar Content

```typescript
const similar = await client.findSimilar(
  'https://finops.org/introduction/',
  10
);

// Pages similar to FinOps Foundation intro
```

---

## 🎯 Integration with Research Framework

Once Exa is working, add it to your research orchestrator:

### Step 1: Update `generic-mcp-client.ts`

```typescript
export const MCPServers = {
  // ... existing servers
  EXA: { name: 'Exa', image: 'mcp/exa' },
};
```

### Step 2: Update `research-orchestrator.ts`

```typescript
private async collectExa(): Promise<void> {
  const client = new ExaMCPClient();
  
  try {
    await client.connect();
    const allData: any[] = [];
    
    for (const keyword of this.config.keywords) {
      const results = await client.search(keyword, {
        numResults: 10,
        type: 'neural'
      });
      
      allData.push(...results);
    }
    
    await this.saveData('exa', allData);
  } finally {
    await client.disconnect();
  }
}
```

### Step 3: Run Full Research

```typescript
const orchestrator = new ResearchOrchestrator({
  topic: 'FinOps AI Automation',
  keywords: ['FinOps AI', 'AWS cost optimization', 'Transformer.js'],
  sources: ['github', 'hackernews', 'exa'], // ← Exa added!
  outputDir: './finops-research-with-exa',
  limits: {
    github: 100,
    hackernews: 50,
    exa: 40  // 40 high-quality semantic results
  }
});

await orchestrator.runFullResearch();
// Expected: 163 + 40 = 203 sources!
```

---

## 📈 Expected Results

### Quality Over Quantity

Exa provides **fewer but higher-quality** results than keyword search:

**Keyword Search (Google, Brave):**
- 100 results
- 30% relevant
- Mix of ads, SEO spam, outdated content

**Exa Neural Search:**
- 40 results
- 90% relevant
- Expert blog posts, research papers, authoritative sources

### FinOps Research Impact

Adding Exa to your current 163 sources:
- **GitHub:** 93 repos (technical validation)
- **Hacker News:** 35 stories (community sentiment)
- **YouTube:** 35 videos (tutorials)
- **Exa:** 40 expert articles (deep insights) ← NEW!

= **203 total sources** with improved quality

---

## 💡 Pro Tips

### 1. Use Autoprompt for Better Results

```typescript
const results = await client.search(
  'FinOps',
  { 
    numResults: 10,
    useAutoprompt: true  // ← Exa enhances your query
  }
);

// Exa automatically expands to:
// "FinOps cloud cost optimization best practices platforms"
```

### 2. Neural vs Keyword Search

```typescript
// Neural search (better for research)
const neural = await client.search('FinOps AI', { type: 'neural' });

// Keyword search (better for specific terms)
const keyword = await client.search('AWS Cost Explorer API', { type: 'keyword' });
```

### 3. Find Related Content

```typescript
// Found a great article? Find more like it!
const similar = await client.findSimilar(
  'https://aws.amazon.com/blogs/aws-cost-management/',
  20
);
```

### 4. Combine with Other Sources

```typescript
// Exa for expert content
const expert = await exaClient.search('FinOps strategies');

// GitHub for code examples  
const code = await githubClient.search('FinOps tools');

// Hacker News for community discussion
const community = await hnClient.search('FinOps');

// Complete picture: Expert knowledge + Code + Community
```

---

## 🚀 Next Steps

1. **Get your API key** from https://exa.ai
2. **Set environment variable** `$env:EXA_API_KEY = "your-key"`
3. **Pull Docker image** (if available) or build from source
4. **Run test script** `npx tsx test-exa.ts`
5. **Add to research framework** if test succeeds
6. **Expand FinOps research** to 200+ sources

---

## 📞 Support

**Exa Documentation:** https://docs.exa.ai  
**MCP Server Repo:** (Check GitHub for mcp/exa or metaphor-mcp-server)  
**API Status:** https://status.exa.ai

**Need Help?**
- Check if API key is valid
- Verify Docker image name
- Try alternative search MCPs (Brave, Tavily)
- Use manual research as fallback

---

*Exa is a premium addition to your research toolkit - worth the setup for high-quality insights!*
