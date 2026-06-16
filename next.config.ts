import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Optional URL prefix (e.g. "/store") so the storefront can live under the
  // dashboard domain (demo-pos.recety.com/store/{slug}) until it gets its own
  // subdomain. Set via BASE_PATH at build time; unset in local dev (root /{slug}).
  basePath: process.env.BASE_PATH || undefined,

  // Self-contained server build: `.next/standalone` bundles a minimal Node
  // server + only the traced dependencies, so the VPS runs it with no
  // `pnpm install`. outputFileTracingRoot points at the monorepo root so
  // workspace deps are traced correctly.
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "..", ".."),

  images: {
    // Storefront images come from the tenant's MinIO bucket, whose host differs
    // per environment (local / test VPS / prod). The POS already re-encodes
    // uploads to capped WebP, so we skip Next's optimizer (and its build-time
    // host allowlist) rather than maintain remotePatterns per environment.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
