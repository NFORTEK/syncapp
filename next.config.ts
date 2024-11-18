const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Desabilita ESLint durante o build
  },
  async rewrites() {
    return [
      {
        source: '/v1/:path*', // Rota no frontend
        destination: 'https://api.blogsdf.uk/v1/:path*', // URL do backend
      },
    ];
  },
};

export default nextConfig;
