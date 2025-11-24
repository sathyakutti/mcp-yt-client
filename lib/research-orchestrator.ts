/**
 * 🔬 Market Research Orchestrator
 * 
 * PURPOSE: Reusable framework for comprehensive market research on ANY topic
 * FEATURES: Multi-source data collection, analysis, report generation
 * 
 * USAGE:
 * ```typescript
 * const orchestrator = new ResearchOrchestrator({
 *   topic: 'FinOps AI automation',
 *   sources: ['youtube', 'github', 'hackernews', 'reddit'],
 *   outputDir: './research-output',
 * });
 * 
 * await orchestrator.runFullResearch();
 * ```
 */

import { GenericMCPClient, createMCPClient, MCPServers } from './generic-mcp-client';
import fs from 'fs/promises';
import path from 'path';

interface ResearchConfig {
  topic: string;
  keywords: string[];
  sources: ('youtube' | 'github' | 'hackernews' | 'reddit' | 'brave' | 'exa' | 'tavily')[];
  outputDir: string;
  limits?: {
    youtube?: number;
    github?: number;
    hackernews?: number;
    reddit?: number;
    brave?: number;
    exa?: number;
    tavily?: number;
  };
}

interface ResearchResult {
  source: string;
  dataPoints: number;
  sizeKB: number;
  filePath: string;
  timestamp: Date;
  keywords: string[];
}

interface ResearchSummary {
  topic: string;
  totalSources: number;
  totalDataPoints: number;
  totalSizeKB: number;
  sources: ResearchResult[];
  completedAt: Date;
  duration: number; // seconds
}

export class ResearchOrchestrator {
  private config: ResearchConfig;
  private results: ResearchResult[] = [];
  private startTime: Date | null = null;

  constructor(config: ResearchConfig) {
    this.config = {
      ...config,
      limits: {
        youtube: 50,
        github: 100,
        hackernews: 50,
        reddit: 50,
        brave: 100,
        exa: 50,
        tavily: 50,
        ...config.limits,
      },
    };
  }

  /**
   * Run full research pipeline across all configured sources
   */
  async runFullResearch(): Promise<ResearchSummary> {
    this.startTime = new Date();
    console.log(`\n🔬 STARTING MARKET RESEARCH: ${this.config.topic}`);
    console.log(`📊 Sources: ${this.config.sources.join(', ')}`);
    console.log(`📁 Output: ${this.config.outputDir}\n`);

    // Create output directory
    await fs.mkdir(this.config.outputDir, { recursive: true });

    // Run research for each source
    for (const source of this.config.sources) {
      try {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`📡 Collecting data from: ${source.toUpperCase()}`);
        console.log(`${'='.repeat(80)}\n`);

        await this.collectFromSource(source);
      } catch (error) {
        console.error(`❌ Error collecting from ${source}:`, error);
        // Continue with other sources
      }
    }

    // Generate comprehensive analysis
    const summary = await this.generateSummary();
    await this.generateReport(summary);

    console.log(`\n✅ RESEARCH COMPLETE!`);
    console.log(`📊 Total Sources: ${summary.totalSources}`);
    console.log(`📈 Total Data Points: ${summary.totalDataPoints}`);
    console.log(`💾 Total Size: ${summary.totalSizeKB.toFixed(1)}KB`);
    console.log(`⏱️  Duration: ${summary.duration}s\n`);

    return summary;
  }

  /**
   * Collect data from a specific source
   */
  private async collectFromSource(source: string): Promise<void> {
    switch (source) {
      case 'youtube':
        return this.collectYouTube();
      case 'github':
        return this.collectGitHub();
      case 'hackernews':
        return this.collectHackerNews();
      case 'reddit':
        return this.collectReddit();
      case 'brave':
        return this.collectBraveSearch();
      case 'exa':
        return this.collectExa();
      case 'tavily':
        return this.collectTavily();
      default:
        throw new Error(`Unknown source: ${source}`);
    }
  }

  /**
   * YouTube research
   */
  private async collectYouTube(): Promise<void> {
    const client = await createMCPClient(MCPServers.YOUTUBE.name, MCPServers.YOUTUBE.image);
    
    try {
      const data: any[] = [];
      const limit = this.config.limits?.youtube || 50;

      // Search for videos using keywords
      for (const keyword of this.config.keywords) {
        console.log(`🔍 Searching YouTube for: "${keyword}"`);
        
        // Note: You'd need to implement video search logic here
        // For now, using example video URLs
        // In production, integrate with YouTube Data API or search mechanism
      }

      await this.saveData('youtube', data);
    } finally {
      await client.disconnect();
    }
  }

  /**
   * GitHub research
   */
  private async collectGitHub(): Promise<void> {
    const client = await createMCPClient(MCPServers.GITHUB.name, MCPServers.GITHUB.image);
    
    try {
      const allData: any[] = [];
      const limit = this.config.limits?.github || 100;

      for (const keyword of this.config.keywords) {
        console.log(`🔍 Searching GitHub for: "${keyword}"`);

        // Search repositories
        const repos = await client.executeTool('search_repositories', {
          query: keyword,
          per_page: Math.min(30, limit),
        });

        console.log(`   Found ${repos.length} repositories`);
        allData.push(...repos);
      }

      await this.saveData('github', allData);
    } finally {
      await client.disconnect();
    }
  }

  /**
   * Hacker News research
   */
  private async collectHackerNews(): Promise<void> {
    const client = await createMCPClient(MCPServers.HACKERNEWS.name, MCPServers.HACKERNEWS.image);
    
    try {
      const allData: any[] = [];
      const limit = this.config.limits?.hackernews || 50;

      for (const keyword of this.config.keywords) {
        console.log(`🔍 Searching Hacker News for: "${keyword}"`);

        const stories = await client.executeTool('search_stories', {
          query: keyword,
        });

        console.log(`   Found ${stories.length} stories`);
        allData.push(...stories);
      }

      await this.saveData('hackernews', allData);
    } finally {
      await client.disconnect();
    }
  }

  /**
   * Reddit research (if MCP available)
   */
  private async collectReddit(): Promise<void> {
    console.log('⚠️  Reddit MCP not yet tested - skipping for now');
    // TODO: Implement when Reddit MCP is available
  }

  /**
   * Brave Search research (if MCP available)
   */
  private async collectBraveSearch(): Promise<void> {
    console.log('⚠️  Brave Search MCP not yet tested - skipping for now');
    // TODO: Implement when Brave MCP is available
  }

  /**
   * Exa research (if MCP available)
   */
  private async collectExa(): Promise<void> {
    console.log('⚠️  Exa MCP not yet tested - skipping for now');
    // TODO: Implement when Exa MCP is available
  }

  /**
   * Tavily research (if MCP available)
   */
  private async collectTavily(): Promise<void> {
    console.log('⚠️  Tavily MCP not yet tested - skipping for now');
    // TODO: Implement when Tavily MCP is available
  }

  /**
   * Save collected data to file
   */
  private async saveData(source: string, data: any[]): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${source}-${timestamp}.json`;
    const filepath = path.join(this.config.outputDir, filename);

    await fs.writeFile(filepath, JSON.stringify(data, null, 2));

    const stats = await fs.stat(filepath);
    const sizeKB = stats.size / 1024;

    this.results.push({
      source,
      dataPoints: data.length,
      sizeKB,
      filePath: filepath,
      timestamp: new Date(),
      keywords: this.config.keywords,
    });

    console.log(`💾 Saved ${data.length} items to ${filename} (${sizeKB.toFixed(1)}KB)`);
  }

  /**
   * Generate research summary
   */
  private async generateSummary(): Promise<ResearchSummary> {
    const duration = this.startTime 
      ? Math.round((Date.now() - this.startTime.getTime()) / 1000)
      : 0;

    return {
      topic: this.config.topic,
      totalSources: this.results.length,
      totalDataPoints: this.results.reduce((sum, r) => sum + r.dataPoints, 0),
      totalSizeKB: this.results.reduce((sum, r) => sum + r.sizeKB, 0),
      sources: this.results,
      completedAt: new Date(),
      duration,
    };
  }

  /**
   * Generate comprehensive markdown report
   */
  private async generateReport(summary: ResearchSummary): Promise<void> {
    const report = `# Market Research Report: ${summary.topic}

**Generated:** ${summary.completedAt.toLocaleString()}  
**Duration:** ${summary.duration} seconds  
**Total Sources:** ${summary.totalSources}  
**Total Data Points:** ${summary.totalDataPoints}  
**Total Size:** ${summary.totalSizeKB.toFixed(1)}KB

---

## 📊 Data Collection Summary

${summary.sources.map((source, index) => `
### ${index + 1}. ${source.source.toUpperCase()}

- **Data Points:** ${source.dataPoints}
- **File Size:** ${source.sizeKB.toFixed(1)}KB
- **File:** \`${path.basename(source.filePath)}\`
- **Collected:** ${source.timestamp.toLocaleString()}
- **Keywords:** ${source.keywords.join(', ')}
`).join('\n')}

---

## 🔍 Research Keywords

${this.config.keywords.map(k => `- ${k}`).join('\n')}

---

## 📁 Output Files

All collected data is available in: \`${this.config.outputDir}\`

${summary.sources.map(s => `- \`${path.basename(s.filePath)}\``).join('\n')}

---

## 🚀 Next Steps

1. **Analyze Data** - Review collected JSON files for insights
2. **Extract Patterns** - Identify common themes and trends
3. **Generate Insights** - Create actionable recommendations
4. **Create Deliverables** - Build executive summary and strategy docs

---

*This report was generated automatically by Market Research Orchestrator*
`;

    const reportPath = path.join(this.config.outputDir, 'RESEARCH-SUMMARY.md');
    await fs.writeFile(reportPath, report);

    console.log(`\n📄 Generated research report: ${reportPath}`);
  }
}

/**
 * Quick start helper for common research patterns
 */
export async function quickResearch(topic: string, keywords: string[]): Promise<ResearchSummary> {
  const orchestrator = new ResearchOrchestrator({
    topic,
    keywords,
    sources: ['github', 'hackernews'], // Start with working sources
    outputDir: `./research-${topic.toLowerCase().replace(/\s+/g, '-')}`,
  });

  return orchestrator.runFullResearch();
}

/**
 * Example usage
 */
export async function exampleFinOpsResearch(): Promise<void> {
  const orchestrator = new ResearchOrchestrator({
    topic: 'FinOps AI Automation Platform',
    keywords: [
      'FinOps AI',
      'AWS cost optimization',
      'Transformer.js browser AI',
      'cloud cost management',
      'OpenOps FinOps',
    ],
    sources: ['github', 'hackernews'],
    outputDir: './finops-research',
    limits: {
      github: 100,
      hackernews: 50,
    },
  });

  await orchestrator.runFullResearch();
}
