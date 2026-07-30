'use strict';

const express = require('express');
const seoAnalyzer = require('../middleware/seoAnalyzer');
const aiSuggestions = require('../middleware/aiSuggestions');
const seoService = require('../services/seoService');
const aiService = require('../services/aiService');

const router = express.Router();

/**
 * GET /api/seo/analyze
 *
 * Analyze keywords for SEO metrics.
 *
 * Query params:
 *   - keywords  (string|string[]) Required. Comma-separated or repeated.
 *   - searchEngine (string)       Optional. Default: google.
 *   - locale    (string)          Optional. Default: en-US.
 */
router.get('/analyze', seoAnalyzer, (req, res, next) => {
  try {
    const { keywords, searchEngine, locale } = req.seoContext;

    if (!keywords.length) {
      return res.status(400).json({
        success: false,
        error: { message: 'At least one keyword is required.' },
      });
    }

    const result = seoService.analyzeKeywords(keywords, searchEngine, locale);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/seo/analyze
 *
 * Analyze keywords for SEO metrics (body variant).
 *
 * Body params:
 *   - keywords  (string[]) Required.
 *   - searchEngine (string) Optional.
 *   - locale    (string)    Optional.
 */
router.post('/analyze', seoAnalyzer, (req, res, next) => {
  try {
    const { keywords, searchEngine, locale } = req.seoContext;

    if (!keywords.length) {
      return res.status(400).json({
        success: false,
        error: { message: 'At least one keyword is required.' },
      });
    }

    const result = seoService.analyzeKeywords(keywords, searchEngine, locale);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/seo/meta
 *
 * Generate meta-tag recommendations for a topic and keywords.
 *
 * Body params:
 *   - topic     (string)   Required.
 *   - keywords  (string[]) Optional.
 */
router.post('/meta', (req, res, next) => {
  try {
    const body = req.body || {};
    const topic = body.topic ? String(body.topic).trim().slice(0, 200) : '';

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: { message: 'topic is required.' },
      });
    }

    const rawKeywords = body.keywords;
    const keywords = Array.isArray(rawKeywords)
      ? rawKeywords.map((k) => String(k).trim()).filter(Boolean)
      : [];

    const meta = seoService.generateMetaRecommendations(topic, keywords);

    res.json({ success: true, data: meta });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/seo/suggestions
 *
 * Generate AI-powered SEO keyword suggestions.
 *
 * Body params:
 *   - keywords  (string[]) Required.
 *   - locale    (string)   Optional.
 */
router.post('/suggestions', seoAnalyzer, aiSuggestions, async (req, res, next) => {
  try {
    const { keywords, locale } = req.seoContext;

    if (!keywords.length) {
      return res.status(400).json({
        success: false,
        error: { message: 'At least one keyword is required.' },
      });
    }

    if (!req.aiAvailable) {
      return res.status(503).json({
        success: false,
        error: { message: 'AI service is not configured. Set the OPENAI_API_KEY environment variable.' },
      });
    }

    const suggestions = await aiService.generateSeoSuggestions(keywords, locale);

    res.json({
      success: true,
      data: {
        keywords,
        locale,
        suggestions,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
