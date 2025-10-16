// next.config.js
import { fileURLToPath } from 'url';
import { dirname } from 'path';

/** @type {import('next').NextConfig} */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  turbopack: { root: __dirname }, // works in ESM now
};

export default nextConfig;

