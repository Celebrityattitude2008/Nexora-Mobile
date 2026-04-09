import { Capacitor } from '@capacitor/core';

export interface SpotifyPlaybackResult {
  status: 'playing' | 'paused' | 'resumed';
  uri?: string;
}

class SpotifyAppRemoteService {
  private clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  private isNative = Capacitor.isNativePlatform();

  /**
   * Play a track using the Spotify App Remote SDK (native) or preview URL (web fallback)
   * @param track - { uri: string, previewUrl?: string }
   */
  async playTrack(track: { uri: string; previewUrl?: string }): Promise<SpotifyPlaybackResult> {
    if (!this.clientId) {
      throw new Error('Spotify Client ID is not configured');
    }

    // If on native platform (iOS/Android), use App Remote
    if (this.isNative) {
      try {
        const result = await (window as any).Capacitor.Plugins.SpotifyAppRemote.play({
          uri: track.uri,
          clientId: this.clientId,
        });
        return result;
      } catch (error) {
        console.warn('Native playback failed, falling back to preview:', error);
        // Fallback to preview URL if native fails
        if (track.previewUrl) {
          return this.playPreview(track.previewUrl);
        }
        throw error;
      }
    }

    // Web platform fallback: use preview URL
    if (track.previewUrl) {
      return this.playPreview(track.previewUrl);
    }

    throw new Error('No playback method available (preview URL missing and native not available)');
  }

  /**
   * Play a preview URL (web fallback)
   */
  private playPreview(previewUrl: string): SpotifyPlaybackResult {
    const audioElement = new Audio(previewUrl);
    audioElement.play().catch((err) => console.error('Preview playback failed:', err));
    return {
      status: 'playing',
    };
  }

  /**
   * Pause playback
   */
  async pause(): Promise<SpotifyPlaybackResult> {
    if (!this.isNative) {
      throw new Error('Pause is only available on native platforms');
    }

    try {
      const result = await (window as any).Capacitor.Plugins.SpotifyAppRemote.pause();
      return result;
    } catch (error) {
      throw new Error(`Pause failed: ${error}`);
    }
  }

  /**
   * Resume playback
   */
  async resume(): Promise<SpotifyPlaybackResult> {
    if (!this.isNative) {
      throw new Error('Resume is only available on native platforms');
    }

    try {
      const result = await (window as any).Capacitor.Plugins.SpotifyAppRemote.resume();
      return result;
    } catch (error) {
      throw new Error(`Resume failed: ${error}`);
    }
  }

  isNativePlaybackAvailable(): boolean {
    return this.isNative && !!this.clientId;
  }
}

export const spotifyAppRemote = new SpotifyAppRemoteService();
