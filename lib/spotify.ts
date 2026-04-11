type SpotifySearchType = 'track' | 'artist';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.token;
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);
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

export async function searchSpotifyDirect(
  query: string,
  type: SpotifySearchType = 'track',
  limit: number = 5
): Promise<any[]> {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Spotify credentials not configured. Add NEXT_PUBLIC_SPOTIFY_CLIENT_ID and NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET.'
    );
  }

  const accessToken = await getAccessToken(clientId, clientSecret);

  const url = new URL('https://api.spotify.com/v1/search');
  url.searchParams.set('q', query);
  url.searchParams.set('type', type);
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMessage = (data as any)?.error?.message ?? `Spotify search failed (${res.status})`;
    throw new Error(errorMessage);
  }

  if (type === 'track' && data.tracks?.items) return data.tracks.items;
  if (type === 'artist' && data.artists?.items) return data.artists.items;
  return [];
}