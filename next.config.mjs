const nextConfig = {
  reactStrictMode: true,
  // Static export mode for Capacitor/APK builds — set NEXT_STATIC_EXPORT=1 in CI
  ...(process.env.NEXT_STATIC_EXPORT === '1' ? { output: 'export' } : {}),
};

export default nextConfig;
