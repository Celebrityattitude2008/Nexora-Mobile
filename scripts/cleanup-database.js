#!/usr/bin/env node

/**
 * Cron Job: Database Cleanup
 * Runs weekly on Sundays to clean up old data
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://nexora-f50db-default-rtdb.firebaseio.com'
});

const db = admin.database();

async function cleanupDatabase() {
  try {
    console.log('🧹 Starting database cleanup...');

    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    let totalCleaned = 0;

    // Clean up old news articles (older than 7 days)
    console.log('📰 Cleaning up old news...');
    const newsRef = db.ref('news/headlines');
    const newsSnapshot = await newsRef.once('value');
    const news = newsSnapshot.val();

    if (news && Array.isArray(news)) {
      const filteredNews = news.filter(article => {
        const articleTime = new Date(article.publishedAt).getTime();
        return articleTime > sevenDaysAgo;
      });

      if (filteredNews.length !== news.length) {
        await newsRef.set(filteredNews);
        totalCleaned += (news.length - filteredNews.length);
        console.log(`📰 Removed ${news.length - filteredNews.length} old news articles`);
      }
    }

    // Archive old completed tasks (older than 30 days)
    console.log('📋 Archiving old completed tasks...');
    const usersRef = db.ref('users');
    const usersSnapshot = await usersRef.once('value');
    const users = usersSnapshot.val();

    if (users) {
      for (const [userId, userData] of Object.entries(users)) {
        const tasksRef = db.ref(`users/${userId}/tasks`);
        const tasksSnapshot = await tasksRef.once('value');
        const tasks = tasksSnapshot.val();

        if (tasks) {
          const activeTasks = {};
          const archivedTasks = {};

          for (const [taskId, task] of Object.entries(tasks)) {
            if (task.completed && task.completedAt) {
              const completedTime = new Date(task.completedAt).getTime();
              if (completedTime < thirtyDaysAgo) {
                // Move to archive
                archivedTasks[taskId] = { ...task, archivedAt: now };
                totalCleaned++;
              } else {
                // Keep active
                activeTasks[taskId] = task;
              }
            } else {
              // Keep active uncompleted tasks
              activeTasks[taskId] = task;
            }
          }

          // Update active tasks
          await tasksRef.set(activeTasks);

          // Add to archive if any
          if (Object.keys(archivedTasks).length > 0) {
            const archiveRef = db.ref(`users/${userId}/archivedTasks`);
            const existingArchiveSnapshot = await archiveRef.once('value');
            const existingArchive = existingArchiveSnapshot.val() || {};
            await archiveRef.set({ ...existingArchive, ...archivedTasks });
          }
        }
      }
    }

    // Clean up old notifications (older than 7 days)
    console.log('🔔 Cleaning up old notifications...');
    if (users) {
      for (const [userId] of Object.entries(users)) {
        const notificationsRef = db.ref(`users/${userId}/notifications`);
        const notificationsSnapshot = await notificationsRef.once('value');
        const notifications = notificationsSnapshot.val();

        if (notifications) {
          const filteredNotifications = {};
          for (const [notifId, notification] of Object.entries(notifications)) {
            const notifTime = notification.timestamp || notification.createdAt;
            if (notifTime && notifTime > sevenDaysAgo) {
              filteredNotifications[notifId] = notification;
            } else {
              totalCleaned++;
            }
          }
          await notificationsRef.set(filteredNotifications);
        }
      }
    }

    console.log(`✅ Database cleanup complete. Removed/archived ${totalCleaned} items.`);

  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanupDatabase();