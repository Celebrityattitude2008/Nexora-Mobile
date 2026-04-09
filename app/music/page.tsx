'use client';

import { CreatorPanel } from '../../components/CreatorPanel';
import { SpotifySearch } from '../../components/SpotifySearch';
import { ProtectedPage } from '../../components/ProtectedPage';

export default function MusicPage() {
  return (
    <ProtectedPage>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Music & creativity</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Stay inspired while you work</h1>
          <p className="mt-2 text-sm text-slate-400">
            Find music, explore ideas, and keep your creative flow moving.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SpotifySearch />
          <CreatorPanel />
        </div>
      </div>
    </ProtectedPage>
  );
}
