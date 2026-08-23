import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // hero/advert images are admin-provided URLs, so allow any secure host
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};



module.exports = nextConfig;

export default nextConfig;
