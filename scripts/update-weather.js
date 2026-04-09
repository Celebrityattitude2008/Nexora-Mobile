#!/usr/bin/env node

/**
 * Cron Job: Update Weather Data
 * Runs daily at 6 AM to fetch 3-day weather forecast
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

async function updateWeather() {
  try {
    console.log('🌤️ Starting weather update...');

    // Using a free weather API (you can replace with your preferred service)
    // For demo purposes, using OpenWeatherMap free tier
    // Note: You'll need to sign up for a free API key
    const weatherApiKey = process.env.WEATHER_API_KEY || 'demo'; // Replace with actual key

    // Default location (you can make this configurable per user later)
    const lat = 40.7128; // New York City
    const lon = -74.0060;

    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat,
        lon,
        appid: weatherApiKey,
        units: 'metric',
        cnt: 24 // 3 days * 8 readings per day
      }
    });

    const weatherData = {
      location: 'New York, NY', // Make this dynamic later
      forecast: response.data.list.map(item => ({
        timestamp: item.dt * 1000,
        temperature: Math.round(item.main.temp),
        feelsLike: Math.round(item.main.feels_like),
        humidity: item.main.humidity,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        windSpeed: item.wind.speed,
        precipitation: item.pop * 100 // Probability of precipitation
      })),
      updatedAt: admin.database.ServerValue.TIMESTAMP
    };

    // Save to Firebase
    await db.ref('weather/forecast').set(weatherData);

    console.log('✅ Weather forecast updated');

  } catch (error) {
    console.error('❌ Weather update failed:', error.message);
    process.exit(1);
  }
}

updateWeather();