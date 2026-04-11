export type SpotifySearchType = 'track' | 'artist';

export type SpotifyTrack = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  preview_url: string | null;
  external_urls: { spotify: string };
};

export type SpotifyArtist = {
  id: string;
  name: string;
  images: { url: string }[];
  external_urls: { spotify: string };
};

export type SpotifySearchResult = SpotifyTrack | SpotifyArtist;

export type SpotifySearchResponse = {
  tracks?: { items: SpotifyTrack[] };
  artists?: { items: SpotifyArtist[] };
};

let _cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const now = Date.now();
  if (_cachedToken && _cachedToken.expiresAt > now + 30_000) {
    return _cachedToken.token;
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
  _cachedToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return _cachedToken.token;
}

export async function searchSpotify(
  query: string,
  type: SpotifySearchType = 'track',
  limit: number = 5
): Promise<SpotifySearchResult[]> {
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
    throw new Error(data?.error?.message ?? `Spotify search failed (${res.status})`);
  }

  if (type === 'track' && data.tracks?.items) return data.tracks.items;
  if (type === 'artist' && data.artists?.items) return data.artists.items;
  return [];
}
