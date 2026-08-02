'use strict';

/**
 * AI Suggestions Middleware
 *
 * Validates that the AI service is configured and enriches `req` with an
 * `aiAvailable` flag that routes can check before calling the AI service.
 */

const config = require('../config');

function aiSuggestions(req, _res, next) {
  req.aiAvailable = Boolean(config.openai.apiKey);
  next();
}

module.exports = aiSuggestions;
