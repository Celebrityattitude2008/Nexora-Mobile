'use client';

import dynamic from 'next/dynamic';
import { ProtectedPage } from '../../components/ProtectedPage';

const NewsAggregator = dynamic(() => import('../../components/NewsAggregator').then((mod) => mod.NewsAggregator), {
  ssr: false,
});
const StockMarketTracker = dynamic(() => import('../../components/StockMarketTracker').then((mod) => mod.StockMarketTracker), {
  ssr: false,
});

export default function FinancePage() {
  return (
    <ProtectedPage>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Finance</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Track markets and news</h1>
          <p className="mt-2 text-sm text-slate-400">
            Monitor stock movement, access headlines, and spot opportunities quickly.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <StockMarketTracker />
          <NewsAggregator />
        </div>
      </div>
    </ProtectedPage>
  );
}
