declare module 'onesignal-cordova-plugin' {
  const OneSignal: {
    setAppId(appId: string): void;
    [key: string]: any;
  };
  export default OneSignal;
}
