# Nexora Personal Dashboard

A modern, dark-themed personal dashboard built with Next.js, Tailwind CSS, Firebase, and integrated with multiple external APIs. Fully responsive for mobile, tablet, and desktop.

## ✨ Features

### Core Features

- **Authentication**: Email/password signup, login, email verification, and Google sign-in
- **User Profile**: Welcome card with avatar and email verification status
- **Task Management**: Create and track tasks with progress indicators
- **Daily Goals**: Set and monitor daily goals and habits
- **Calendar**: Event creation and scheduling
- **Productivity Analytics**: Visual charts and performance metrics
- **Notes Widget**: Quick reminders and note-taking
- **Weather Integration**: Real-time weather with geolocation support

### New Features (v2.0)

- **📰 News Aggregator**: Real-time news with category filtering (Tech, Sports, Business, General)
- **🎵 Spotify Search**: Search tracks and artists, view albums, playlists, and preview audio
- **📈 Stock Market Tracker**: Real-time stock prices, trends, and daily movements
- **😄 Meme Generator**: Generate custom memes with templates, supports base64 profile pictures
- **👤 Creator Panel**: Developer showcase with social media links (LinkedIn, Instagram, TikTok, YouTube)
- **📱 Mobile Responsive**: Fully responsive design for all screen sizes (320px - 1536px)

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- API keys (see Configuration section)

### Installation

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with your API keys (see Configuration below)

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## ⚙️ Configuration

### Firebase Setup

The app uses Firebase for authentication and real-time database. Create a `.env.local` file with these values:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### External APIs Configuration

#### News API

- Get free API key from [newsapi.org](https://newsapi.org)
- Add to `.env.local`:

  ```env
  NEXT_PUBLIC_NEWS_API_KEY=your_newsapi_key_here
  ```

#### Spotify API

- Register app at [developer.spotify.com](https://developer.spotify.com)
- Get Client ID and Client Secret
- Add to `.env.local`:

  ```env
  NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
  NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
  ```

#### Finance API (Stock Data)

- Get free API key from [alphavantage.co](https://www.alphavantage.co)
- Free tier: 5 calls/minute, 500/day
- Add to `.env.local`:

  ```env
  NEXT_PUBLIC_FINANCE_API_KEY=your_alphavantage_key_here
  ```

#### Meme Generator

- Uses [imgflip.com API](https://imgflip.com/api) (no key required for basic functionality)
- Supports demo data without API key

### Firebase Realtime Database Rules

Apply these rules from `database.rules.json` to your Firebase Realtime Database:

```json
{
  "rules": {
    "tasks": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$uid": {
        ".validate": "newData.parent.parent.child('users').child(auth.uid).exists()"
      }
    },
    "users": {
      ".read": "auth != null",
      ".write": "auth.uid === $uid",
      "$uid": {
        ".validate": "root.child('users').child(auth.uid).exists()"
      }
    }
  }
}
```

### Authentication Setup

1. **Enable Email/Password Auth**
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable Email/Password provider

2. **Enable Google Sign-in**
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable Google provider
   - Configure OAuth consent screen

## 📁 Project Structure

```text
app/
├── layout.tsx           # Root layout
├── page.tsx            # Main dashboard page
└── globals.css         # Global styles

components/
├── TaskList.tsx        # Task management
├── DailyGoals.tsx      # Goals tracking
├── AnalyticsPanel.tsx  # Charts and analytics
├── NotesWidget.tsx     # Notes section
├── WeatherCard.tsx     # Weather display
├── CalendarWidget.tsx  # Calendar events
├── AuthPanel.tsx       # Authentication UI
├── WelcomeCard.tsx     # User profile card
├── NewsAggregator.tsx  # News feed (NEW)
├── SpotifySearch.tsx   # Music search (NEW)
├── StockMarketTracker.tsx  # Stock prices (NEW)
├── CreatorPanel.tsx    # Developer info (NEW)
└── firebase.ts         # Firebase config

public/
└── paul.png           # Creator profile picture (add your image here)
```

## 🎨 Responsive Design

The dashboard is built with a mobile-first approach using Tailwind CSS:

- **Mobile (320px+)**: Single column layout, optimized touch targets
- **Tablet (768px+)**: Two-column layout for better space utilization
- **Desktop (1024px+)**: Multi-column layout with full feature display

All components use responsive utilities:

- `text-sm sm:text-base md:text-lg` for font sizes
- `p-4 sm:p-5 md:p-6` for padding
- `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for grid layouts
- `gap-4 sm:gap-5 md:gap-6` for spacing

## 📦 Technologies Used

- **Frontend**: React 18, Next.js 14, TypeScript
- **Styling**: Tailwind CSS 3, PostCSS
- **Backend**: Firebase Realtime Database, Firebase Authentication
- **Charts**: Chart.js, react-chartjs-2
- **HTTP Client**: Axios
- **APIs**: NewsAPI, Spotify Web API, Alpha Vantage, imgflip, Open-Meteo Weather

## 🔒 Security Notes

- All Firebase credentials use `NEXT_PUBLIC_*` prefix (safe for client-side, public keys only)
- For production, sensitive APIs should use backend proxies
- Never commit `.env.local` to version control
- Add `.env.local` to `.gitignore` (already configured)

## 🚀 Deployment

Deploy to Vercel:

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel Settings → Environment Variables
4. Deploy

## 🛠️ Building

Create an optimized production build:

```bash
npm run build
npm start
```

## 📝 License

MIT License - Feel free to use this project for your own purposes.

## 👤 Creator

**Paul Adamu** - Full Stack Developer

- [LinkedIn](https://www.linkedin.com/in/paul-adamu-67bb46324)
- [Instagram](https://instagram.com/paul_dev_zti)
- [TikTok](https://tiktok.com/@pa_zti)
- [YouTube](https://www.youtube.com/@officialpauladamu)

## 📞 Support

For issues, questions, or feature requests, please reach out via the social links above.
