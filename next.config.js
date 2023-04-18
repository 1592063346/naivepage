/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, /* @note: To prevent duplicated call of useEffect */
  swcMinify: true
};

module.exports = nextConfig;
