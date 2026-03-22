import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });

  try {
    const platformExt = process.platform === 'win32' ? '.exe' : '';
    const binPath = path.resolve(process.cwd(), `bin/yt-dlp${platformExt}`);
    
    // Add android,web fallback to bypass "Sign in to confirm you're not a bot" datacenter IP blocks
    const cmd = `"${binPath}" -j --no-warnings --no-check-certificate --extractor-args "youtube:player_client=android,web" "https://www.youtube.com/watch?v=${id}"`;
    const { stdout } = await execAsync(cmd, { maxBuffer: 1024 * 1024 * 10 });
    const data = JSON.parse(stdout);

    const audioFormats = data.formats?.filter((f: any) => f.vcodec === 'none' && f.acodec !== 'none') || [];
    const mergedFormats = data.formats?.filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none') || [];

    const bestAudio = audioFormats.sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0))[0];
    const bestVideo = mergedFormats.sort((a: any, b: any) => (b.height || 0) - (a.height || 0))[0];

    const rawAudioUrl = bestAudio?.url || bestVideo?.url || data.url || null;
    const rawVideoUrl = bestVideo?.url || data.url || null; 

    // Wrap in our Next.js Proxy to bypass ORB/CORS block
    const audioUrl = rawAudioUrl ? `/api/proxy?url=${encodeURIComponent(rawAudioUrl)}` : null;
    const videoUrl = rawVideoUrl ? `/api/proxy?url=${encodeURIComponent(rawVideoUrl)}` : null;

    if (audioUrl || videoUrl) {
      return NextResponse.json({
          audioUrl,
          videoUrl,
          title: data.title || '',
          thumbnail: data.thumbnail || ''
      });
    }

    return NextResponse.json({ error: 'No suitable formats found' }, { status: 500 });
  } catch (error: any) {
    console.error('Standalone yt-dlp stream error:', error?.message || String(error));
    return NextResponse.json({ error: 'Failed to extract stream', details: error?.message || String(error) }, { status: 500 });
  }
}
