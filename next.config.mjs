/** @type {import('next').NextConfig} */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bucketurl.onrender.com';
const hostname = new URL(APP_URL).hostname;

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'flagcdn.com' },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        hostname,
        `www.${hostname}`,
      ],
    },
  },
};

export default nextConfig;
