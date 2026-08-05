'use strict';

/**
 * SEO Analyzer Middleware
 *
 * Analyzes incoming request data for SEO research parameters and
 * attaches a sanitized `seoContext` object to `req` for use by routes.
 */

const VALID_SEARCH_ENGINES = new Set(['google', 'bing', 'duckduckgo', 'yahoo']);
const MAX_KEYWORD_LENGTH = 200;
const MAX_KEYWORDS_COUNT = 20;

/**
 * Sanitize a keyword string to prevent injection risks.
 * @param {string} kw
 * @returns {string}
 */
function sanitizeKeyword(kw) {
  return String(kw).trim().slice(0, MAX_KEYWORD_LENGTH);
}

/**
 * Express middleware that parses SEO-related query/body params and
 * attaches a validated `seoContext` to `req`.
 */
function seoAnalyzer(req, res, next) {
  const source = req.method === 'GET' ? req.query : req.body || {};

  const rawKeywords = source.keywords;
  let keywords = [];

  if (rawKeywords) {
    const list = Array.isArray(rawKeywords) ? rawKeywords : String(rawKeywords).split(',');
    keywords = list
      .map(sanitizeKeyword)
      .filter(Boolean)
      .slice(0, MAX_KEYWORDS_COUNT);
  }

  const rawEngine = source.searchEngine;
  const searchEngine =
    rawEngine && VALID_SEARCH_ENGINES.has(String(rawEngine).toLowerCase())
      ? String(rawEngine).toLowerCase()
      : 'google';

  const rawLocale = source.locale;
  const locale = rawLocale ? String(rawLocale).trim().slice(0, 10) : 'en-US';

  req.seoContext = {
    keywords,
    searchEngine,
    locale,
  };

  next();
}

module.exports = seoAnalyzer;
