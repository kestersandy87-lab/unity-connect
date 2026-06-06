import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1,

  // If you are using the Session Replay SDK, enable it here
  // replaysSessionSampleRate: 0.1,
  // replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console
  // when setting up Sentry.
  debug: false,

  // Enable automatic instrumentation of Vercel Cron Monitors
  // See https://docs.sentry.io/platforms/javascript/guides/nextjs/crons/ for more information
  // experimental: {
  //   enableInteractivityTracing: true,
  // },
});