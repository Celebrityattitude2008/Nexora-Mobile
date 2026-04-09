#!/usr/bin/env node

/**
 * Cron Job: Send Daily Briefing
 * Runs daily at 8 AM to send personalized notifications
 */

const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://nexora-f50db-default-rtdb.firebaseio.com'
});

const db = admin.database();

async function sendDailyBriefing() {
  try {
    console.log('📱 Starting daily briefing...');

    const oneSignalAppId = process.env.ONESIGNAL_APP_ID;
    const oneSignalApiKey = process.env.ONESIGNAL_API_KEY;

    if (!oneSignalAppId || !oneSignalApiKey) {
      console.log('⚠️ OneSignal credentials not configured, skipping notifications');
      return;
    }

    // Get all users
    const usersSnapshot = await db.ref('users').once('value');
    const users = usersSnapshot.val();

    if (!users) {
      console.log('ℹ️ No users found');
      return;
    }

    // Process each user
    for (const [userId, userData] of Object.entries(users)) {
      try {
        await sendUserBriefing(userId, userData, oneSignalAppId, oneSignalApiKey);
      } catch (error) {
        console.error(`❌ Failed to send briefing to user ${userId}:`, error.message);
      }
    }

    console.log('✅ Daily briefings sent');

  } catch (error) {
    console.error('❌ Daily briefing failed:', error.message);
    process.exit(1);
  }
}

async function sendUserBriefing(userId, userData, appId, apiKey) {
  // Get today's tasks
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const tasksSnapshot = await db.ref(`users/${userId}/tasks`).once('value');
  const tasks = tasksSnapshot.val() || {};

  const todayTasks = Object.values(tasks).filter(task =>
    task.dueDate === todayString && !task.completed
  );

  // Get current weather
  const weatherSnapshot = await db.ref('weather/forecast').once('value');
  const weather = weatherSnapshot.val();

  let weatherInfo = '';
  if (weather && weather.forecast && weather.forecast.length > 0) {
    const currentWeather = weather.forecast[0];
    weatherInfo = `${currentWeather.temperature}°C, ${currentWeather.description}`;
  }

  // Build notification message
  let message = `Good morning! `;

  if (weatherInfo) {
    message += `It's ${weatherInfo} today. `;
  }

  if (todayTasks.length > 0) {
    message += `You have ${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} due today.`;
  } else {
    message += `You have no tasks due today. Enjoy your day!`;
  }

  // Send via OneSignal
  const notificationData = {
    app_id: appId,
    headings: { en: "Daily Briefing" },
    contents: { en: message },
    filters: [
      {
        field: "tag",
        key: "userId",
        relation: "=",
        value: userId
      }
    ],
    data: {
      type: "daily_briefing",
      taskCount: todayTasks.length,
      weather: weatherInfo
    }
  };

  const response = await axios.post(
    'https://onesignal.com/api/v1/notifications',
    notificationData,
    {
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log(`📤 Sent briefing to user ${userId}: ${response.data.id}`);
}

sendDailyBriefing();