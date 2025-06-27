import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle pdf-parse and its dependencies on the server
      config.externals = config.externals || []
      config.externals.push({
        'canvas': 'canvas',
      })
    }
    return config
  }
};

export default nextConfig;
