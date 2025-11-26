/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  experimental: {
    // Désactiver l'erreur pour useSearchParams sans Suspense
    missingSuspenseWithCSRBailout: false,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externaliser pdfkit pour éviter les problèmes de bundling des fonts
      config.externals = config.externals || [];
      config.externals.push({
        'pdfkit': 'commonjs pdfkit',
        'canvas': 'canvas'
      });
    }
    return config;
  },
}

module.exports = nextConfig
