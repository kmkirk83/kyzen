'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const seoRoutes = require('./routes/seo');
const marketingRoutes = require('./routes/marketing');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS — only allow explicitly configured origins
const allowedOrigins = new Set(config.cors.allowedOrigins);
app.use(
  cors({
    origin: function (requestOrigin, callback) {
      // Allow server-to-server requests (no Origin header) and configured origins.
      if (!requestOrigin || allowedOrigins.has(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${requestOrigin}' is not allowed.`));
      }
    },
    optionsSuccessStatus: 200,
  }),
);

// Request logging (skip in test mode to keep output clean)
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later.' },
  },
});
app.use('/api/', limiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'clarion',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/seo', seoRoutes);
app.use('/api/marketing', marketingRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found.' },
  });
});

// Central error handler
app.use(errorHandler);

// Start server only when this module is the entry point
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Clarion middleware running on port ${config.port} [${config.nodeEnv}]`);
  });
}

module.exports = app;
