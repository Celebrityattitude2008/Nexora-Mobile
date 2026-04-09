'use client';

import { useEffect, useRef } from 'react';
import { onValue } from 'firebase/database';
import { userTasksRef, userGoalsRef } from './firebase';
import type { User } from 'firebase/auth';

// Extend Window interface for OneSignal
declare global {
  interface Window {
    OneSignalDeferred?: any[];
  }
}

type Task = {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
};

type Goal = {
  id: string;
  label: string;
  current: number;
  total: number;
  category: string;
  createdAt: string;
};

type NotificationTrigger = {
  type: 'task-deadline' | 'missed-goal' | 'weekly-summary' | 'inactivity';
  title: string;
  message: string;
  data?: Record<string, string>;
};

let OneSignal: any;

interface NotificationServiceProps {
  user: User;
}

export function NotificationService({ user }: NotificationServiceProps) {
  const lastCheckRef = useRef<Record<string, number>>({});
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const weeklyCheckRef = useRef<Date>(new Date());
  const tasksRef_internal = useRef<Task[]>([]);
  const goalsRef_internal = useRef<Goal[]>([]);

  // Initialize OneSignal
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load OneSignal SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.async = true;
    script.defer = true;

    script.onload = async () => {
      if (window.OneSignalDeferred) {
        window.OneSignalDeferred.push(async (OS: any) => {
          OneSignal = OS;
          try {
            await OS.init({
              appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || 'eb3fd719-274c-4e0c-ba1b-14a87d504eee',
            });
            console.log('OneSignal initialized successfully');
          } catch (error) {
            console.error('OneSignal initialization error:', error);
          }
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Fetch and update tasks from Firebase
  useEffect(() => {
    const unsubscribe = onValue(userTasksRef(user.uid), (snapshot) => {
      const value = snapshot.val();
      if (value) {
        tasksRef_internal.current = Object.entries(value).map(([key, data]) => ({
          id: key,
          ...(data as Omit<Task, 'id'>),
        }));
      }
    });
    return unsubscribe;
  }, [user.uid]);

  // Fetch and update goals from Firebase
  useEffect(() => {
    const unsubscribe = onValue(userGoalsRef(user.uid), (snapshot) => {
      const value = snapshot.val();
      if (value) {
        goalsRef_internal.current = Object.entries(value).map(([key, data]) => ({
          id: key,
          ...(data as Omit<Goal, 'id'>),
        }));
      }
    });
    return unsubscribe;
  }, [user.uid]);
  const sendNotification = async (trigger: NotificationTrigger) => {
    if (!OneSignal) return;

    try {
      await OneSignal.sendNotification(
        {
          heading: trigger.title,
          contents: trigger.message,
          url: window.location.href,
          data: trigger.data || {},
        },
        {
          segmentNames: ['All'],
        }
      );
      console.log(`Notification sent: ${trigger.title}`);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      // Reset inactivity timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      // Set new inactivity timer (4 hours)
      inactivityTimerRef.current = setTimeout(() => {
        if (OneSignal && Date.now() - lastActivityRef.current > 4 * 60 * 60 * 1000) {
          sendNotification({
            type: 'inactivity',
            title: '⏰ Break Check-in',
            message: "You've been inactive for a while. How about reviewing your progress?",
          });
        }
      }, 4 * 60 * 60 * 1000);
    };

    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  // Check for task deadlines (tasks with high priority not completed)
  useEffect(() => {
    if (!OneSignal) return;

    const checkTaskDeadlines = () => {
      const tasks = tasksRef_internal.current;
      if (tasks.length === 0) return;

      tasks.forEach((task) => {
        if (!task.completed && task.priority === 'high' && task.progress < 80) {
          const lastCheck = lastCheckRef.current[`task-${task.id}`] || 0;
          const now = Date.now();

          // Check every 30 minutes
          if (now - lastCheck > 30 * 60 * 1000) {
            const hoursOld = (now - new Date(task.createdAt).getTime()) / (1000 * 60 * 60);
            if (hoursOld > 2) {
              sendNotification({
                type: 'task-deadline',
                title: '⚡ High Priority Task',
                message: `"${task.title}" is still pending. Make progress today!`,
                data: { taskId: task.id, taskTitle: task.title },
              });
              lastCheckRef.current[`task-${task.id}`] = now;
            }
          }
        }
      });
    };

    const interval = setInterval(checkTaskDeadlines, 60 * 1000); // Check every minute
    checkTaskDeadlines(); // Check immediately

    return () => clearInterval(interval);
  }, []);

  // Check for missed daily goals
  useEffect(() => {
    if (!OneSignal) return;

    const checkMissedGoals = () => {
      const goals = goalsRef_internal.current;
      if (goals.length === 0) return;

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      goals.forEach((goal) => {
        const goalCreatedDate = new Date(goal.createdAt);
        const goalCreatedTodayOrBefore = goalCreatedDate <= now;

        if (goalCreatedTodayOrBefore && goal.current === 0) {
          const lastCheck = lastCheckRef.current[`goal-${goal.id}`] || 0;
          const nowTime = Date.now();

          // Check every hour if goal hasn't been started today
          if (nowTime - lastCheck > 60 * 60 * 1000) {
            const hoursSinceStart = (nowTime - startOfDay.getTime()) / (1000 * 60 * 60);
            if (hoursSinceStart > 6) {
              // After 6 AM
              sendNotification({
                type: 'missed-goal',
                title: '🎯 Daily Goal Reminder',
                message: `Don't forget: "${goal.label}" (${goal.category})`,
                data: { goalId: goal.id, goalLabel: goal.label },
              });
              lastCheckRef.current[`goal-${goal.id}`] = nowTime;
            }
          }
        }
      });
    };

    const interval = setInterval(checkMissedGoals, 60 * 1000); // Check every minute
    checkMissedGoals(); // Check immediately

    return () => clearInterval(interval);
  }, []);

  // Weekly productivity summary (every Sunday at 9 PM)
  useEffect(() => {
    if (!OneSignal) return;

    const checkWeeklySummary = () => {
      const tasks = tasksRef_internal.current;
      if (tasks.length === 0) return;

      const now = new Date();
      const lastCheck = weeklyCheckRef.current;

      // Check if it's Sunday
      if (now.getDay() === 0) {
        // Check if we haven't already sent this week
        if (lastCheck.getDay() !== 0 || now.getDate() !== lastCheck.getDate()) {
          // Send at 9 PM
          if (now.getHours() === 21) {
            const completedCount = tasks.filter((t) => t.completed).length;
            const completionRate = Math.round(
              (completedCount / tasks.length) * 100
            );
            const avgProgress = Math.round(
              tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length
            );

            sendNotification({
              type: 'weekly-summary',
              title: '📊 Weekly Productivity Report',
              message: `You completed ${completedCount} tasks this week! Completion rate: ${completionRate}%, Avg progress: ${avgProgress}%`,
              data: {
                completedTasks: completedCount.toString(),
                completionRate: completionRate.toString(),
                avgProgress: avgProgress.toString(),
              },
            });

            weeklyCheckRef.current = new Date();
          }
        }
      }
    };

    const interval = setInterval(checkWeeklySummary, 60 * 1000); // Check every minute
    checkWeeklySummary(); // Check immediately

    return () => clearInterval(interval);
  }, []);

  return null;
}
