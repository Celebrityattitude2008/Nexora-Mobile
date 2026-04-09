# Spotify App Remote SDK Integration Guide

You've already completed **Step 2** (adding Android Package Name and SHA-1 Fingerprint to Spotify Developer Dashboard). Here's what has been done for **Steps 1 & 3**:

## What Was Installed & Created

### Step 1: Spotify SDK Dependencies
✅ **Gradle Dependencies Added** (`android/app/build.gradle`)
```gradle
implementation 'com.spotify.android:auth:2.1.1'
implementation 'com.spotify.android:spotify-app-remote:0.8.0'
```

### Step 1.5: Native Plugin Created
✅ **Capacitor Plugin** (`android/app/src/main/java/com/zti/nexora/SpotifyAppRemotePlugin.java`)
- Manages Spotify App Remote connection
- Handles `play()`, `pause()`, and `resume()` commands
- Automatic fallback to preview URLs if native isn't available

### Step 3: React Integration
✅ **Spotify AppRemote Service** (`lib/spotifyAppRemote.ts`)
- Bridges JavaScript to native plugin
- Auto-detects platform (mobile vs web)
- Provides fallback preview URL playback

✅ **Updated SpotifySearch Component** (`components/SpotifySearch.tsx`)
- Attempts native playback first
- Falls back to preview if needed
- Shows "Play on Spotify" when native is available
- Shows "Play Preview" when using web fallback

## Setup Steps You Need to Complete

### 1. Build for Android
```bash
npm run build
npx cap build android
```

### 2. Verify Plugin Registration
Make sure the plugin is registered in `MainActivity.java`. Check that your `MainActivity` extends `BridgeActivity`:

```java
public class MainActivity extends BridgeActivity {}
```

Capacitor should auto-discover the plugin from the `SpotifyAppRemotePlugin.java` file.

### 3. Set Spotify Redirect URI in Your App
Update `AndroidManifest.xml` to handle Spotify redirect:
```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="nexora" android:host="callback" />
</intent-filter>
```

### 4. Environment Variables
Ensure your Spotify credentials are set:
```
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=your_client_secret
```

### 5. Test on Device
Install the app on an Android device and test:
- Search for a track
- Tap "Play on Spotify" (if native available) or "Play Preview"
- Music should stream through your app via Spotify

## How It Works

### Native Playback (Android with Spotify App)
```
User clicks "Play on Spotify"
    ↓
SpotifySearch calls selectTrack()
    ↓
spotifyAppRemote.playTrack() is invoked
    ↓
Native plugin connects to Spotify App Remote
    ↓
Spotify SDK plays the track natively
```

### Web Fallback (No Native Plugin)
```
User clicks "Play Preview"
    ↓
Audio element plays the preview_url
    ↓
Duration & progress tracked in React state
```

## Testing Tips

1. **On Web/Dev**: You'll see "Play Preview" (web fallback)
2. **On Android**: You'll see "Play on Spotify" if Spotify app is installed
3. **Check Errors**: Open Chrome DevTools → Console to see any native plugin errors

## Files Modified/Created

- ✅ `android/app/build.gradle` - Added Spotify SDK dependencies
- ✅ `android/app/src/main/java/com/zti/nexora/SpotifyAppRemotePlugin.java` - New native plugin
- ✅ `lib/spotifyAppRemote.ts` - New TypeScript service wrapper
- ✅ `components/SpotifySearch.tsx` - Updated for native playback
- ✅ `SPOTIFY_SETUP.md` - This file

## Troubleshooting

### "Spotify App Remote is not connected"
- Make sure Spotify app is installed on the device
- Check that Client ID is correct in `AndroidManifest.xml`
- Verify SHA-1 fingerprint matches in Spotify Developer Dashboard

### "Play on Spotify" button doesn't appear
- App might be running on web platform (fallback to preview)
- Check browser console for errors
- Verify `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` is set

### Preview plays but native doesn't work
- This is normal! The fallback is working
- Ensure Android setup is complete (gradle build, manifest)

## Next Steps

1. Run `npx cap sync` to sync JavaScript with native
2. Run `npx cap build android` to build APK
3. Test on a physical Android device with Spotify installed
4. For iOS support, add similar integration to `ios/App` (not included here)
