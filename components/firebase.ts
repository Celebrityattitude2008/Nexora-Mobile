import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyCcZR1t3ygtpVbBqYcqxwFjv5SrGXpqWXU',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'nexora-f50db.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'nexora-f50db',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'nexora-f50db.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '476639252277',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:476639252277:web:9f84400fce7c417e87e6ee',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? 'https://nexora-f50db-default-rtdb.firebaseio.com',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const database = getDatabase(app);

export const userTasksRef        = (uid: string) => ref(database, `users/${uid}/tasks`);
export const userCalendarEventsRef = (uid: string) => ref(database, `users/${uid}/calendarEvents`);
export const userGoalsRef        = (uid: string) => ref(database, `users/${uid}/goals`);
export const userProfilePicRef   = (uid: string) => ref(database, `users/${uid}/profilePic`);
export const userExpensesRef     = (uid: string) => ref(database, `users/${uid}/expenses`);
export const userTimersRef       = (uid: string) => ref(database, `users/${uid}/timers`);
