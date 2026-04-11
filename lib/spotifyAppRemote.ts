export interface SpotifyPlaybackResult {
  status: 'playing' | 'paused' | 'resumed';
  uri?: string;
}

class SpotifyAppRemoteService {
  private get isNative(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const cap = (window as any).Capacitor;
      return cap?.isNativePlatform?.() === true;
    } catch {
      return false;
    }
  }

  async playTrack(track: { uri: string; previewUrl?: string }): Promise<SpotifyPlaybackResult> {
    if (this.isNative) {
      try {
        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
        const result = await (window as any).Capacitor.Plugins.SpotifyAppRemote.play({
          uri: track.uri,
          clientId,
        });
        return result;
      } catch (err) {
        console.warn('Native Spotify playback failed, falling back to preview:', err);
      }
    }

    if (track.previewUrl) {
      return this._playPreview(track.previewUrl);
    }

    throw new Error('No playback method available');
  }

  private _playPreview(previewUrl: string): SpotifyPlaybackResult {
    const audio = new Audio(previewUrl);
    audio.play().catch((err) => console.error('Preview playback failed:', err));
    return { status: 'playing' };
  }

  async pause(): Promise<SpotifyPlaybackResult> {
    if (!this.isNative) throw new Error('Pause is only available on native platforms');
    const result = await (window as any).Capacitor.Plugins.SpotifyAppRemote.pause();
    return result;
  }

  async resume(): Promise<SpotifyPlaybackResult> {
    if (!this.isNative) throw new Error('Resume is only available on native platforms');
    const result = await (window as any).Capacitor.Plugins.SpotifyAppRemote.resume();
    return result;
  }

  isNativePlaybackAvailable(): boolean {
    return this.isNative;
  }
}

export const spotifyAppRemote = new SpotifyAppRemoteService();
