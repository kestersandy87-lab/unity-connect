import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // Automatically tree-shake Sentry SDK logger statements to reduce bundle size
  silent: true,

  // Automatically widen source maps to improve error stack traces in production
  org: "unity-connect",
  project: "javascript-nextjs",
});
