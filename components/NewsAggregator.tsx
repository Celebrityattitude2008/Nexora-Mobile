'use client';

import { useEffect, useState } from 'react';
import { getNews, type NewsArticle, type NewsCategory } from '../lib/newsService';

const fallbackArticles: NewsArticle[] = [
  {
    title: 'Stay informed with Nexora News',
    description: 'Add your NewsAPI key to .env.local, or keep exploring with curated headlines while you configure the integration.',
    url: '#',
    urlToImage: 'https://via.placeholder.com/300x200?text=News+Preview',
    source: { name: 'Nexora' },
    publishedAt: new Date().toISOString(),
  },
];

export function NewsAggregator() {
  const [articles, setArticles] = useState<NewsArticle[]>(fallbackArticles);
  const [category, setCategory] = useState<NewsCategory>('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories: { value: NewsCategory; label: string }[] = [
    { value: 'technology', label: 'Tech' },
    { value: 'sports', label: 'Sports' },
    { value: 'business', label: 'Business' },
    { value: 'general', label: 'General' },
  ];

  useEffect(() => {
    fetchNews();
  }, [category]);

  const fetchNews = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getNews(category);

      if (!data?.articles?.length) {
        throw new Error('No articles available from NewsAPI.');
      }

      setArticles(data.articles.slice(0, 5));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      setError(`Failed to fetch news. ${message}`);
      setArticles(fallbackArticles);
    }

    setLoading(false);
  };

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-4 sm:p-6 shadow-panel backdrop-blur-xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">News Feed</p>
          <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-white">Latest Headlines</h2>
        </div>
        <div className="rounded-2xl bg-slate-800/90 px-3 py-2 text-xs sm:text-sm text-slate-300">Live</div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 sm:gap-3">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition ${
              category === cat.value
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:bg-slate-800/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading articles...</div>
      ) : error ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">{error}</div>
      ) : (
        <div className="grid gap-4 sm:gap-5">
          {articles.map((article, idx) => (
            <a
              key={idx}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4 transition hover:bg-slate-950/80 hover:border-amber-400/30"
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {article.urlToImage && (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    loading="lazy"
                    className="w-full sm:w-24 h-32 sm:h-20 object-cover rounded-lg"
                    onError={(event) => {
                      (event.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=News+Image';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-100 group-hover:text-amber-300 transition line-clamp-2 text-sm sm:text-base">
                    {article.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400 line-clamp-2">{article.description}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <span>{article.source.name}</span>
                    <span>•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
