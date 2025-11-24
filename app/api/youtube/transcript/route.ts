/**
 * API Route: YouTube Transcript
 * Fetches transcripts from YouTube videos using MCP server
 * 
 * Note: Remove authentication if not using Next-Auth,
 * or replace with your own auth implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeMCPClient } from '../../../lib/mcp/youtube-client';

/**
 * POST /api/youtube/transcript
 * Get transcript for a YouTube video
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Add your authentication here
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await req.json();
    const { videoUrl, action = 'get' } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    console.log(`[POST /api/youtube/transcript] Action: ${action}, URL: ${videoUrl}`);

    // Get MCP client
    const client = await getYouTubeMCPClient();

    let result;
    switch (action) {
      case 'get':
        result = await client.getTranscript(videoUrl);
        break;
      
      case 'search':
        const { query } = body;
        if (!query) {
          return NextResponse.json(
            { error: 'Search query is required' },
            { status: 400 }
          );
        }
        result = await client.searchTranscript(videoUrl, query);
        break;
      
      case 'summarize':
        result = await client.summarizeTranscript(videoUrl);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: get, search, or summarize' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date()
    });

  } catch (error: any) {
    console.error('[POST /api/youtube/transcript] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/youtube/transcript
 * List available MCP tools
 */
export async function GET(req: NextRequest) {
  try {
    // Optional: Add your authentication here
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('[GET /api/youtube/transcript] Listing MCP tools');

    // Get MCP client
    const client = await getYouTubeMCPClient();
    const tools = await client.listTools();

    return NextResponse.json({
      success: true,
      tools,
      timestamp: new Date()
    });

  } catch (error: any) {
    console.error('[GET /api/youtube/transcript] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list tools' },
      { status: 500 }
    );
  }
}
