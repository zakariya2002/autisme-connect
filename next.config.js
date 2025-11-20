/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  experimental: {
    // Désactiver l'erreur pour useSearchParams sans Suspense
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
