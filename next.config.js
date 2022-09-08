/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["localhost", "i.annihil.us"]
  },
  compiler: {
    styledComponents: true
  }
}

module.exports = nextConfig
