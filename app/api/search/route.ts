import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    
    const html = await res.text();
    const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
    
    if (!match) {
      return NextResponse.json({ error: 'Failed to extract YouTube data' }, { status: 500 });
    }

    const d = JSON.parse(match[1]);
    const contents = d?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
    
    const videos = contents.filter((x: any) => x.videoRenderer).map((x: any) => {
      const v = x.videoRenderer;
      return {
        id: v.videoId,
        title: v.title?.runs?.[0]?.text || '',
        thumbnail: v.thumbnail?.thumbnails?.[v.thumbnail.thumbnails.length - 1]?.url || '',
        duration: v.lengthText?.simpleText || '',
        author: v.ownerText?.runs?.[0]?.text || ''
      };
    }).slice(0, 20);

    return NextResponse.json({ videos });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message || 'Failed to search' }, { status: 500 });
  }
}
