'use strict';

require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 1024,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  cors: {
    // Parse CORS_ORIGIN as a comma-separated list of explicit allowed origins.
    // In development, defaults to localhost only.  In production, you MUST
    // supply an explicit CORS_ORIGIN — a bare wildcard is never used.
    allowedOrigins: (function () {
      const raw = (process.env.CORS_ORIGIN || '').trim();
      if (!raw) {
        // Default: allow localhost variants in development; deny all in production.
        return process.env.NODE_ENV === 'production'
          ? []
          : ['http://localhost:3000', 'http://localhost:8080'];
      }
      return raw.split(',').map((o) => o.trim()).filter(Boolean);
    }()),
  },
};

module.exports = config;
