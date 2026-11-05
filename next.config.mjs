/** @type {import('next').NextConfig} */
// BASE_PATH is set by the GitHub Pages workflow (e.g. "/dose"). Locally it is empty.
const basePath = process.env.BASE_PATH || '';

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  reactStrictMode: true,
};

export default nextConfig;
