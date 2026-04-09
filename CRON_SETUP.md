# Nexora Cron Jobs Setup

This guide explains how to set up automated cron jobs for your Nexora dashboard using GitHub Actions.

## Overview

The cron jobs automate:
- **News Updates**: Fetch latest headlines every hour
- **Weather Updates**: Get 3-day forecast daily at 6 AM UTC
- **Daily Briefings**: Send personalized notifications at 8 AM UTC
- **Spotify Cache**: Update music data weekly on Mondays
- **Database Cleanup**: Remove old data weekly on Sundays

## GitHub Secrets Setup

You need to add these secrets to your GitHub repository:

### Required Secrets:

1. **FIREBASE_SERVICE_ACCOUNT**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate a new private key
   - Copy the entire JSON content and paste as the secret value

2. **NEWS_API_KEY**
   - Get from: https://newsapi.org
   - Free tier: 100 requests/day

3. **ONESIGNAL_APP_ID** & **ONESIGNAL_API_KEY**
   - Get from: https://onesignal.com
   - Required for push notifications

4. **SPOTIFY_CLIENT_ID** & **SPOTIFY_CLIENT_SECRET**
   - Get from: https://developer.spotify.com
   - Required for music features

5. **WEATHER_API_KEY** (Optional)
   - Get from: https://openweathermap.org (free tier available)
   - If not set, weather updates will be skipped

### How to Add Secrets:

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add each secret with its name and value

## Testing Cron Jobs

You can test the cron jobs manually:

```bash
# Test news update
npm run cron:news-update

# Test weather update
npm run cron:weather-update

# Test daily briefing
npm run cron:daily-briefing

# Test Spotify cache
npm run cron:spotify-cache

# Test database cleanup
npm run cron:cleanup
```

## Environment Variables

For local testing, add these to your `.env.local` file:

```env
# Firebase (for local testing)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# APIs
NEWS_API_KEY=your_news_api_key
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_API_KEY=your_onesignal_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
WEATHER_API_KEY=your_weather_api_key
```

## Cron Schedule

The jobs run on these schedules (UTC time):

- **News**: Every hour (`0 * * * *`)
- **Weather**: Daily at 6 AM (`0 6 * * *`)
- **Daily Briefing**: Daily at 8 AM (`0 8 * * *`)
- **Spotify Cache**: Weekly on Mondays at 2 AM (`0 2 * * 1`)
- **Database Cleanup**: Weekly on Sundays at 3 AM (`0 3 * * 0`)

## Monitoring

Check the "Actions" tab in your GitHub repository to monitor cron job execution and view logs.

## Troubleshooting

### Common Issues:

1. **"Secret not found"**: Make sure all required secrets are added to GitHub
2. **"API limit exceeded"**: Check your API usage limits
3. **"Firebase permission denied"**: Verify the service account has proper permissions
4. **"Script timeout"**: Some APIs might be slow; consider increasing timeout if needed

### Logs:

All cron job output is logged in the GitHub Actions console. Check there for detailed error messages.