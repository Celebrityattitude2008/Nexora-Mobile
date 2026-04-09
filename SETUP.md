# Quick Setup Guide for Nexora v2.0

## 📋 What's New

Your Nexora dashboard has been upgraded with 5 powerful new features and full mobile responsiveness!

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your API Keys

Create/update `.env.local` in your project root with these keys:

#### News Aggregator

```env
NEXT_PUBLIC_NEWS_API_KEY=your_key_from_newsapi.org
```

- Get free key from [newsapi.org](https://newsapi.org)
- Provides real-time news with Tech/Sports/Business/General categories

#### Spotify Search

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=your_client_secret
```

- Register app at [developer.spotify.com](https://developer.spotify.com)
- Search songs/artists, view albums, listen to previews

#### Stock Market Tracker

```env
NEXT_PUBLIC_FINANCE_API_KEY=your_key_from_alphavantage.co
```

- Get free key from [alphavantage.co](https://www.alphavantage.co)
- Real-time stock prices, trends, and movements

#### Meme Generator (Optional - Works without key)

- Uses imgflip API (no API key needed)
- Generate custom memes with templates
- Upload profile pictures as base64

### 3. Add Your Profile Picture

1. Place your profile picture as `paul.png` in the `public/` folder
2. The CreatorPanel will automatically display it
3. Dimensions: 128x128px (square) recommended

### 4. Update Creator Information (Optional)

Edit [CreatorPanel.tsx](components/CreatorPanel.tsx) to update social links:

- LinkedIn: [https://www.linkedin.com/in/paul-adamu-67bb46324](https://www.linkedin.com/in/paul-adamu-67bb46324)
- Instagram: [https://instagram.com/paul_dev_zti](https://instagram.com/paul_dev_zti)
- TikTok: [https://tiktok.com/@pa_zti](https://tiktok.com/@pa_zti)
- YouTube: [https://www.youtube.com/@officialpauladamu](https://www.youtube.com/@officialpauladamu)

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📱 Mobile Responsiveness

All components are fully responsive:

- **Mobile**: 320px+ (optimized for small screens)
- **Tablet**: 768px+ (two-column layouts)
- **Desktop**: 1024px+ (full multi-column layouts)

Features adjusted for mobile:

- Smaller font sizes and padding
- Touch-friendly button sizes
- Stacked layouts on small screens
- Optimized images and lazy loading ready

## 🎯 Component Overview

| Component | Feature | Status |
| --- | --- | --- |
| NewsAggregator | Real-time news feeds | Works with API key |
| SpotifySearch | Music discovery | Works with API credentials |
| StockMarketTracker | Market data | Works with API key |
| CreatorPanel | Developer showcase | Always active |
| Weather, Tasks, Goals | Original features | Already working |

## 🔄 Demo Mode

If you skip API key setup, components will show demo data so you can still see the UI/UX.

## 📚 Full Documentation

See [README.md](README.md) for complete setup, deployment, and technical details.

## 💡 Tips

1. **NewsAPI Free Tier**: ~100 requests/day
2. **Spotify**: Requires OAuth, backend proxy recommended for production
3. **Alpha Vantage**: Free tier = 5 calls/min, 500/day
4. **Local Development**: All environment variables work from `.env.local`
5. **Production**: Add environment variables to Vercel/hosting platform settings

## ✅ Next Steps

1. Add your API keys to `.env.local`
2. Add `paul.png` to `public/` folder
3. Run `npm run dev`
4. Test all features on mobile and desktop
5. Deploy when ready!

Happy coding! 🚀
