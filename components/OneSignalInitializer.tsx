"use client";

import { useEffect } from 'react';

export default function OneSignalInitializer() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ?? 'YOUR_ONESIGNAL_APP_ID';

    if (!appId || appId === 'YOUR_ONESIGNAL_APP_ID') {
      console.warn('OneSignal app ID is not configured. Set NEXT_PUBLIC_ONESIGNAL_APP_ID in your environment.');
      return;
    }

    const initOneSignal = async () => {
      try {
        const OneSignal = await import('onesignal-cordova-plugin');
        const OneSignalInstance = OneSignal.default ?? OneSignal;
        OneSignalInstance.setAppId(appId);
      } catch (error) {
        console.warn('OneSignal failed to load on this platform:', error);
      }
    };

    initOneSignal();
  }, []);

  return null;
}
