/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // NextJS <Image> component needs to whitelist domains for src={}
      {hostname:"images.pexels.com"},
      {hostname: "lh3.googleusercontent.com"},
      {hostname: "pbs.twimg.com"},
      {hostname: "images.unsplash.com"},
      {hostname: "logos-world.net"},
    ],
  },
};

module.exports = nextConfig;
