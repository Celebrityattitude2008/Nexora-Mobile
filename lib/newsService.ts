export type NewsCategory = 'technology' | 'sports' | 'business' | 'general';

export type NewsArticle = {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  source: { name: string };
  publishedAt: string;
};

export type NewsResponse = {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
};

export async function getNews(category: NewsCategory = 'general'): Promise<NewsResponse> {
  const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;

  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_NEWS_API_KEY is not configured. Add it to .env.local.');
  }

  const url = new URL('https://newsapi.org/v2/top-headlines');
  url.searchParams.set('category', category);
  url.searchParams.set('country', 'us');
  url.searchParams.set('apiKey', apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || `News API request failed with status ${response.status}`);
  }

  return data as NewsResponse;
}
