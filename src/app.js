import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { rateLimiter } from 'hono-rate-limiter';

import tvLiveRoutes from './routes/routes.js';

import { AppError } from './utils/errors.js';
import { fail } from './utils/response.js';
import { logger } from 'hono/logger';

const app = new Hono();

config();

const localEnvPath = '.env.local';
if (existsSync(localEnvPath)) {
  config({ path: localEnvPath, override: true });
}

// Environment variables are optional and have sensible defaults

const origins = process.env.ORIGIN ? process.env.ORIGIN.split(',') : '*';

// third party middlewares
app.use(
  '*',
  cors({
    origin: origins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'Referer', 'User-Agent'],
    exposeHeaders: ['Content-Type'],
    credentials: true,
  })
);

// Apply the rate limiting middleware to all requests.
app.use(
  rateLimiter({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000,
    limit: process.env.RATE_LIMIT_LIMIT || 100,
    standardHeaders: 'draft-6', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    keyGenerator: (c) => {
      // Use IP address for rate limiting (fallback to 'unknown' if not available)
      return c.req.header('x-forwarded-for')?.split(',')[0] || 
             c.req.header('x-real-ip') || 
             'unknown';
    },
    // store: ... , // Redis, MemoryStore, etc. See below.
  })
);

// middlewares

// routes

// Logger middleware for all routes
app.use('*', logger((message) => {
  console.log(message);
}));

app.get('/', (c) => {
  c.status(200);
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TVCastAPI</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          background: hsl(0 0% 100%);
          color: hsl(222.2 84% 4.9%);
          line-height: 1.5;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .container {
          max-width: 42rem;
          width: 100%;
        }
        .card {
          background: hsl(0 0% 100%);
          border: 1px solid hsl(214.3 31.8% 91.4%);
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        h1 {
          font-size: 1.875rem;
          font-weight: 600;
          letter-spacing: -0.025em;
          color: hsl(222.2 47.4% 11.2%);
        }
        .content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .label {
          font-size: 0.875rem;
          font-weight: 500;
          color: hsl(215.4 16.3% 46.9%);
        }
        .value {
          font-size: 0.9375rem;
          color: hsl(222.2 47.4% 11.2%);
        }
        code {
          background: hsl(210 40% 96.1%);
          border: 1px solid hsl(214.3 31.8% 91.4%);
          border-radius: 0.375rem;
          padding: 0.125rem 0.5rem;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
          font-size: 0.875rem;
          color: hsl(222.2 47.4% 11.2%);
        }
        a {
          color: hsl(221.2 83.2% 53.3%);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        a:hover {
          color: hsl(221.2 83.2% 53.3%);
          text-decoration: underline;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          border-radius: 9999px;
          background: hsl(210 40% 96.1%);
          padding: 0.125rem 0.625rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: hsl(222.2 47.4% 11.2%);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <h1>Welcome to TVCastAPI 🎉</h1>
          </div>
          <div class="content">
            <div class="item">
              <span class="label">Start at</span>
              <div class="value">
                <code>/api/v1</code>
              </div>
            </div>
            <div class="item">
              <span class="label">For Documentation</span>
              <div class="value">
                <a href="https://docs-tvcastapi.vercel.app/" target="_blank" rel="noopener noreferrer" style="font-size: 1.1em; font-weight: bold;">https://docs-tvcastapi.vercel.app/</a>
              </div>
            </div>
            <div class="item">
              <span class="label">Health Check</span>
              <div class="value">
                <code>GET /ping</code> <span class="badge">Returns "pong"</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});
app.get('/ping', (c) => {
  return c.text('pong');
});
app.get('/favicon.ico', (c) => {
  return c.body(null, 204);
});

app.route('/api/v1', tvLiveRoutes);
app.onError((err, c) => {
  if (err instanceof AppError) {
    return fail(c, err.message, err.statusCode, err.details);
  }
  console.error('Unexpected Error:', err.message, err.stack);

  return fail(c);
});

export default app;
