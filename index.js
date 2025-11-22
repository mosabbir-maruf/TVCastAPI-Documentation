import { serve } from '@hono/node-server';
import app from './src/app.js';
import { closeBrowser, clearCacheCleanup } from './src/services/axiosInstance.js';

const port = Number(process.env.PORT) || 3030;

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server started on http://localhost:${port}`);
console.log('\x1b[32mDocumentation: https://docs-tvcastapi.vercel.app/\x1b[0m');

// Cleanup function
const cleanup = async () => {
  console.log('\nShutting down gracefully...');
  clearCacheCleanup(); // Clear cache cleanup interval
  await closeBrowser(); // Close browser instance
  process.exit(0);
};

// Cleanup on process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Also cleanup on uncaught exceptions (best effort)
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await cleanup();
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit on unhandled rejection, just log it
});
