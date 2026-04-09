#!/usr/bin/env node

/**
 * Cron Job: Update Spotify Cache
 * Runs weekly on Mondays to cache user's top tracks and playlists
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

async function updateSpotifyCache() {
  try {
    console.log('🎵 Starting Spotify cache update...');

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.log('⚠️ Spotify credentials not configured, skipping cache update');
      return;
    }

    // Get access token
    const authResponse = await axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        grant_type: 'client_credentials'
      },
      auth: {
        username: clientId,
        password: clientSecret
      }
    });

    const accessToken = authResponse.data.access_token;

    // Get featured playlists (as a demo - you can expand this)
    const featuredResponse = await axios.get('https://api.spotify.com/v1/browse/featured-playlists', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        limit: 10
      }
    });

    const featuredPlaylists = featuredResponse.data.playlists.items.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      image: playlist.images[0]?.url,
      externalUrl: playlist.external_urls.spotify,
      tracks: playlist.tracks.total,
      updatedAt: admin.database.ServerValue.TIMESTAMP
    }));

    // Save to Firebase
    await db.ref('spotify/featuredPlaylists').set(featuredPlaylists);

    // Get new releases
    const newReleasesResponse = await axios.get('https://api.spotify.com/v1/browse/new-releases', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        limit: 10
      }
    });

    const newReleases = newReleasesResponse.data.albums.items.map(album => ({
      id: album.id,
      name: album.name,
      artist: album.artists[0].name,
      image: album.images[0]?.url,
      releaseDate: album.release_date,
      externalUrl: album.external_urls.spotify,
      updatedAt: admin.database.ServerValue.TIMESTAMP
    }));

    await db.ref('spotify/newReleases').set(newReleases);

    console.log('✅ Spotify cache updated');

  } catch (error) {
    console.error('❌ Spotify cache update failed:', error.message);
    process.exit(1);
  }
}

updateSpotifyCache();