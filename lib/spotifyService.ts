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
  const { searchSpotifyDirect } = await import('./spotify');
  return searchSpotifyDirect(query, type, limit);
}
