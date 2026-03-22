import { NextResponse } from 'next/server';
import ytSearch from 'yt-search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const results = await ytSearch(q);
    const videos = results.videos.slice(0, 20).map(v => ({
      id: v.videoId,
      title: v.title,
      thumbnail: v.thumbnail,
      duration: v.timestamp,
      author: v.author.name
    }));
    return NextResponse.json({ videos });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message || 'Failed to search' }, { status: 500 });
  }
}
