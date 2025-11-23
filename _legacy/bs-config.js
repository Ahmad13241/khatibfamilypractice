/**
 * Browser-Sync Config
 * Integrates with Node.js express server for comprehensive logging
 */

module.exports = {
  // Use proxy mode to integrate with our Express server
  proxy: "localhost:3000",

  // Port for Browser-Sync UI
  ui: {
    port: 3001,
  },

  // Customize Browser-Sync settings
  files: ["*.html", "pages/*.html", "css/*.css", "js/*.js", "images/*"],

  // Don't open browser automatically
  open: false,

  // Notify on changes
  notify: true,

  // Customize logging output
  logLevel: "info",
  logPrefix: "Khatib Website",
  logConnections: true,

  // Inject CSS changes without reloading the page
  injectChanges: true,

  // Don't show Browser-Sync connected message in the console
  logFileChanges: true,

  // Allow any connection (local network, etc.)
  listen: "localhost",

  // Use HTTPS
  https: false,

  // Browser-Sync middleware configuration
  middleware: function (req, res, next) {
    // Log all requests to Browser-Sync
    console.log(`[BS] ${req.method} ${req.url}`);
    next();
  },

  // Scripts to inject in all pages
  // snippetOptions: {
  //   rule: {
  //     match: /<\/body>/i,
  //     fn: function (snippet, match) {
  //       return '<script src="/js/logger.js"></script>' + snippet + match;
  //     },
  //   },
  // },

  // Customize rewrite rules as needed
  rewriteRules: [
    {
      match: /Comprehensive logging enabled/g,
      replace: "Comprehensive logging enabled with Browser-Sync",
    },
  ],
};
