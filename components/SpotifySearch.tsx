'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { searchSpotify, type SpotifySearchResult, type SpotifyTrack, type SpotifyArtist, type SpotifySearchType } from '../lib/spotifyService';

const isTrack = (item: SpotifySearchResult): item is SpotifyTrack => 'preview_url' in item;

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

export function SpotifySearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'track' | 'artist'>('track');
  const [results, setResults] = useState<SpotifySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 30);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const data = await searchSpotify(searchQuery, searchType, 5);

      setResults(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Search failed. ${message}`);
    }

    setLoading(false);
  };

  const selectTrack = (track: SpotifyTrack) => {
    if (!track.preview_url) {
      setError('This track does not have a Spotify preview available.');
      return;
    }

    setError('');
    if (currentTrack?.id === track.id) {
      setIsPlaying((prev) => !prev);
      return;
    }

    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-4 sm:p-6 shadow-panel backdrop-blur-xl">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Music Discovery</p>
        <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-white">Spotify Search</h2>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${searchType}s...`}
            className="flex-1 rounded-lg bg-slate-800/60 border border-slate-700/60 px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-amber-400/20 border border-amber-400/40 px-4 sm:px-6 py-2.5 text-sm font-medium text-amber-200 hover:bg-amber-400/30 transition disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="flex gap-2">
          {(['track', 'artist'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSearchType(type)}
              className={`rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
                searchType === type
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'bg-slate-800/60 text-slate-400 border border-slate-700/60'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </form>

      {error && <div className="text-sm text-amber-300 mb-4 py-2">{error}</div>}

      {results.length > 0 ? (
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.id}
              className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4 hover:bg-slate-950/80 transition"
            >
              <div className="flex gap-4 items-start">
                <img
                  src={isTrack(result) ? result.album.images[0]?.url : result.images[0]?.url}
                  alt={result.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-100 text-sm sm:text-base truncate">{result.name}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        {isTrack(result) ? result.artists.map((a) => a.name).join(', ') : 'Artist'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (isTrack(result)) selectTrack(result);
                      }}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        isTrack(result)
                          ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40 hover:bg-amber-400/30'
                          : 'border border-slate-700/60 text-slate-400 bg-slate-800/50 cursor-not-allowed'
                      }`}
                      disabled={!isTrack(result)}
                    >
                      {isTrack(result)
                        ? currentTrack?.id === result.id && isPlaying
                          ? 'Pause Preview'
                          : 'Play Preview'
                        : 'No Preview'}
                    </button>
                  </div>
                  {isTrack(result) && <p className="text-xs text-slate-500 mt-2">{result.album.name}</p>}
                  <a
                    href={result.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-300 hover:text-amber-200 mt-2 inline-block"
                  >
                    Open in Spotify →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && !error ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          Search for tracks or artists to get started
        </div>
      ) : null}

      {currentTrack && currentTrack.preview_url && (
        <div className="mt-6 rounded-2xl border border-amber-400/30 bg-slate-950/70 p-4">
          <h3 className="font-semibold text-slate-100 text-sm sm:text-base mb-3">Now Playing</h3>
          <div className="flex gap-3 items-center">
            <img
              src={currentTrack.album.images[0]?.url}
              alt={currentTrack.name}
              className="w-12 h-12 rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-100 text-sm truncate">{currentTrack.name}</p>
              <p className="text-xs text-slate-400">{currentTrack.artists.map((a) => a.name).join(', ')}</p>
            </div>
          </div>
          <audio ref={audioRef} src={currentTrack.preview_url} preload="auto" hidden />
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                className="rounded-full bg-amber-400/20 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-400/30 transition"
              >
                {isPlaying ? 'Pause' : 'Play'} Preview
              </button>
              <span className="text-xs text-slate-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={duration || 30}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="h-1 w-full cursor-pointer rounded-full bg-slate-700 accent-amber-400"
            />
          </div>
        </div>
      )}
    </section>
  );
}
