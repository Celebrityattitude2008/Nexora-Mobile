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

export async function searchSpotify(
  query: string,
  type: SpotifySearchType = 'track',
  limit: number = 5
): Promise<SpotifySearchResult[]> {
  const url = new URL('/api/spotify-search', window.location.origin);
  url.searchParams.set('query', query);
  url.searchParams.set('type', type);
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error ?? `Spotify search failed (${res.status})`);
  }

  return data as SpotifySearchResult[];
}
