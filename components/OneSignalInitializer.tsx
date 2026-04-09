"use client";

import { useEffect } from 'react';
import OneSignal from 'onesignal-cordova-plugin';

export default function OneSignalInitializer() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ?? 'YOUR_ONESIGNAL_APP_ID';

    if (!appId || appId === 'YOUR_ONESIGNAL_APP_ID') {
      console.warn('OneSignal app ID is not configured. Set NEXT_PUBLIC_ONESIGNAL_APP_ID in your environment.');
      return;
    }

    OneSignal.setAppId(appId);
  }, []);

  return null;
}
