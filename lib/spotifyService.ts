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

export async function searchSpotify(
  query: string,
  type: SpotifySearchType = 'track',
  limit: number = 5
): Promise<SpotifySearchResult[]> {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials are not configured. Add NEXT_PUBLIC_SPOTIFY_CLIENT_ID and NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET to .env.local.');
  }

  // Get access token
  const authToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text();
    throw new Error(`Spotify authentication failed: ${errorBody}`);
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // Search for tracks/artists
  const searchUrl = new URL('https://api.spotify.com/v1/search');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('type', type);
  searchUrl.searchParams.set('limit', limit.toString());

  const response = await fetch(searchUrl.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || `Spotify search failed with status ${response.status}`);
  }

  // Return the items array based on search type
  if (type === 'track' && data.tracks?.items) {
    return data.tracks.items;
  } else if (type === 'artist' && data.artists?.items) {
    return data.artists.items;
  }

  return [];
}