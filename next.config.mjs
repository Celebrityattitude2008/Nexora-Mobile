/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Force it to always create the 'out' folder
  images: {
    unoptimized: true, // This is required for static exports
  },
};

export default nextConfig;
