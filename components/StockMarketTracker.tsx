'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type StockData = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  timestamp: string;
};

export function StockMarketTracker() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchSymbol, setSearchSymbol] = useState('AAPL');

  const defaultStocks: StockData[] = [
    {
      symbol: 'AAPL',
      price: 180.45,
      change: 2.15,
      changePercent: 1.21,
      high: 182.5,
      low: 178.2,
      timestamp: new Date().toISOString(),
    },
    {
      symbol: 'GOOGL',
      price: 140.23,
      change: -1.5,
      changePercent: -1.06,
      high: 142.8,
      low: 139.1,
      timestamp: new Date().toISOString(),
    },
    {
      symbol: 'MSFT',
      price: 420.15,
      change: 5.85,
      changePercent: 1.41,
      high: 425.0,
      low: 414.3,
      timestamp: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    setLoading(true);
    setError('');
    try {
      const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '';
      
      if (!apiKey) {
        setError('Finnhub API key not configured');
        setStocks(defaultStocks);
        setLoading(false);
        return;
      }

      // Using Finnhub API
      const symbols = ['AAPL', 'GOOGL', 'MSFT'];
      const promises = symbols.map((symbol) =>
        axios.get(`https://finnhub.io/api/v1/quote`, {
          params: {
            symbol: symbol,
            token: apiKey,
          },
        })
      );

      const responses = await Promise.all(promises);
      const fetchedStocks: StockData[] = responses
        .map((res, idx) => {
          const data = res.data;
          return {
            symbol: symbols[idx],
            price: parseFloat(data.c || '0'),
            change: parseFloat(data.d || '0'),
            changePercent: parseFloat(data.dp || '0'),
            high: parseFloat(data.h || '0'),
            low: parseFloat(data.l || '0'),
            timestamp: new Date().toISOString(),
          };
        })
        .filter((stock) => stock.price > 0);

      setStocks(fetchedStocks.length ? fetchedStocks : defaultStocks);
    } catch (err) {
      setError('Failed to fetch stock data');
      setStocks(defaultStocks);
    }
    setLoading(false);
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchSymbol.trim()) return;

    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
      
      if (!apiKey) {
        // Demo data
        const newStock: StockData = {
          symbol: searchSymbol.toUpperCase(),
          price: Math.random() * 500,
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 5,
          high: Math.random() * 500 + 100,
          low: Math.random() * 400 + 50,
          timestamp: new Date().toISOString(),
        };
        setStocks([...stocks, newStock]);
      } else {
        const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
          params: {
            symbol: searchSymbol,
            token: apiKey,
          },
        });

        const data = response.data;
        const newStock: StockData = {
          symbol: searchSymbol.toUpperCase(),
          price: parseFloat(data.c || '0'),
          change: parseFloat(data.d || '0'),
          changePercent: parseFloat(data.dp || '0'),
          high: parseFloat(data.h || '0'),
          low: parseFloat(data.l || '0'),
          timestamp: new Date().toISOString(),
        };

        if (!stocks.find((s) => s.symbol === newStock.symbol)) {
          setStocks([...stocks, newStock]);
        }
      }
      setSearchSymbol('');
    } catch (err) {
      setError('Failed to add stock');
    }
    setLoading(false);
  };

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-4 sm:p-6 shadow-panel backdrop-blur-xl">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Market Data</p>
        <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-white">Stock Tracker</h2>
      </div>

      {/* Search Form */}
      <form onSubmit={handleAddStock} className="mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchSymbol}
          onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
          placeholder="Add stock symbol..."
          className="flex-1 rounded-lg bg-slate-800/60 border border-slate-700/60 px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20"
          style={{ maxWidth: '100%' }}
        />
        <button
          type="submit"
          disabled={loading || !searchSymbol.trim()}
          className="rounded-lg bg-amber-400/20 border border-amber-400/40 px-4 sm:px-6 py-2.5 text-sm font-medium text-amber-200 hover:bg-amber-400/30 transition disabled:opacity-50 whitespace-nowrap"
        >
          Add
        </button>
      </form>

      {/* Error Message */}
      {error && <div className="text-sm text-amber-300 mb-4">{error}</div>}

      {/* Stocks List */}
      {stocks.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stocks.map((stock) => (
            <div
              key={stock.symbol}
              className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4 hover:border-amber-400/30 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-100 text-base sm:text-lg">{stock.symbol}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    {new Date(stock.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    stock.change >= 0
                      ? 'bg-green-400/20 text-green-300'
                      : 'bg-slate-700/20 text-slate-300'
                  }`}
                >
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-3xl sm:text-2xl font-bold text-white">${stock.price.toFixed(2)}</p>
                <p
                  className={`text-sm mt-1 ${
                    stock.changePercent >= 0 ? 'text-green-400' : 'text-slate-400'
                  }`}
                >
                  {stock.changePercent >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
                </p>
              </div>

              <div className="border-t border-slate-700/60 pt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-500">High</p>
                  <p className="text-slate-100 font-medium">${stock.high.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Low</p>
                  <p className="text-slate-100 font-medium">${stock.low.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : loading ? (
        <div className="text-center py-8 text-slate-400">Loading stocks...</div>
      ) : (
        <div className="text-center py-8 text-slate-400 text-sm">
          No stocks added. Search to add stocks.
        </div>
      )}
    </section>
  );
}
