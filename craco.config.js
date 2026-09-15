const path = require('path');

// Production-safe CRACO configuration for the Vercel demo.
// The application is frontend-only: no Emergent overlay, health-check server,
// API proxy, or backend integration is loaded during build or runtime.

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};
