export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Load the Sentry server config
    require("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Load the Sentry edge config
    require("./sentry.edge.config");
  }
}