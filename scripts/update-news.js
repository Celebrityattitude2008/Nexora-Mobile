#!/usr/bin/env node

/**
 * Cron Job: Update News Data
 * Runs every hour to fetch latest news headlines
 */

const axios = require('axios');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://nexora-f50db-default-rtdb.firebaseio.com'
});

const db = admin.database();

async function updateNews() {
  try {
    console.log('🔄 Starting news update...');

    const newsApiKey = process.env.NEWS_API_KEY;
    if (!newsApiKey) {
      throw new Error('NEWS_API_KEY environment variable is required');
    }

    // Fetch top headlines from NewsAPI
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us',
        apiKey: newsApiKey,
        pageSize: 20
      }
    });

    const articles = response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source.name,
      timestamp: admin.database.ServerValue.TIMESTAMP
    }));

    // Save to Firebase
    await db.ref('news/headlines').set(articles);

    console.log(`✅ Updated ${articles.length} news articles`);

  } catch (error) {
    console.error('❌ News update failed:', error.message);
    process.exit(1);
  }
}

updateNews();