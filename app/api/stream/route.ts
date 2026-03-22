import { NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });

  try {
    const output = await youtubedl(`https://www.youtube.com/watch?v=${id}`, {
      dumpJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    });

    const data: any = output;
    
    // Sort audio formats by abr, fetch the best one
    const audioFormats = data.formats?.filter((f: any) => f.vcodec === 'none' && f.acodec !== 'none') || [];
    const mergedFormats = data.formats?.filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none') || [];

    const bestAudio = audioFormats.sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0))[0];
    const bestVideo = mergedFormats.sort((a: any, b: any) => (b.height || 0) - (a.height || 0))[0];

    // fallback to generic `url` which is usually the best merged
    const audioUrl = bestAudio?.url || bestVideo?.url || data.url || null;
    const videoUrl = bestVideo?.url || data.url || null; 

    if (audioUrl || videoUrl) {
        return NextResponse.json({
            audioUrl: audioUrl,
            videoUrl: videoUrl,
            title: data.title || '',
            thumbnail: data.thumbnail || ''
        });
    }

    return NextResponse.json({ error: 'No suitable formats found' }, { status: 500 });
  } catch (error: any) {
    console.error('YTDL stream error:', error.message);
    return NextResponse.json({ error: 'Failed to extract stream' }, { status: 500 });
  }
}
