const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });
    return config;
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fastpic.org',
        port: '',
        pathname: '/**.jpg',
      },
      {
        protocol: 'https',
        hostname: 'imagebam.com',
        port: '',
        pathname: '/view/**',
      },
      // Add more image hosting domains as needed
    ],
  },
};

module.exports = nextConfig;
