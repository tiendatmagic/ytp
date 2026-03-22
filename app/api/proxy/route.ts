import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) return new NextResponse('Missing url parameter', { status: 400 });

  try {
    const fetchHeaders: any = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.youtube.com/',
    };
    
    // Forward Range header for timeline scrubbing/seeking support in <audio> tag
    const range = request.headers.get('range');
    if (range) fetchHeaders['Range'] = range;

    const res = await fetch(url, { headers: fetchHeaders });

    if (!res.ok) {
      return new NextResponse(`Proxy error: ${res.statusText}`, { status: res.status });
    }

    const headers = new Headers();
    const headersToProxy = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control'];
    headersToProxy.forEach(h => {
      if (res.headers.get(h)) headers.set(h, res.headers.get(h)!);
    });

    // Provide a long caching header to ensure local proxy caches it too
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    // Next.js Response streams the fetch body efficiently
    return new NextResponse(res.body, { status: res.status, headers });
  } catch (error: any) {
    return new NextResponse(`Proxy server error: ${error.message}`, { status: 500 });
  }
}
