import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root so Next ignores the stray lockfile in the home dir.
  outputFileTracingRoot: path.resolve(process.cwd()),
};

export default nextConfig;
