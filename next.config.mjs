import path from 'path';

const nextConfig = {
  // ... other config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    config.resolve.alias['@contracts'] = path.join(__dirname, '../contracts/src');
    return config;
  },
};

export default nextConfig;