import { NextRequest, NextResponse } from 'next/server';

type SpotifySearchType = 'track' | 'artist';

type SpotifySearchResponse = {
  tracks?: { items: any[] };
  artists?: { items: any[] };
};

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Spotify auth failed: ${body}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return cachedToken.token;
}

export async function GET(req: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Spotify server credentials are not configured.' }, { status: 500 });
  }

  const query = req.nextUrl.searchParams.get('query')?.trim();
  const type = (req.nextUrl.searchParams.get('type') ?? 'track') as SpotifySearchType;
  const limit = Math.min(10, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || '5')));

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required.' }, { status: 400 });
  }

  try {
    const accessToken = await getAccessToken(clientId, clientSecret);
    const url = new URL('https://api.spotify.com/v1/search');
    url.searchParams.set('q', query);
    url.searchParams.set('type', type);
    url.searchParams.set('limit', String(limit));

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data: SpotifySearchResponse = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data?.error?.message ?? `Spotify search failed (${res.status})` }, { status: res.status });
    }

    const items = type === 'track' ? data.tracks?.items ?? [] : data.artists?.items ?? [];
    return NextResponse.json(items);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Spotify request failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
