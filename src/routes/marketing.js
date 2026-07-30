'use strict';

const express = require('express');
const aiSuggestions = require('../middleware/aiSuggestions');
const marketingService = require('../services/marketingService');
const aiService = require('../services/aiService');

const router = express.Router();

const VALID_GOALS = new Set(['awareness', 'leads', 'sales', 'retention']);

/**
 * POST /api/marketing/campaign
 *
 * Build a campaign brief with channel scoring.
 *
 * Body params:
 *   - topic     (string)   Required.
 *   - audience  (string)   Required.
 *   - channels  (string[]) Optional.
 *   - goal      (string)   Optional. One of: awareness|leads|sales|retention. Default: awareness.
 */
router.post('/campaign', (req, res, next) => {
  try {
    const body = req.body || {};

    const topic = body.topic ? String(body.topic).trim().slice(0, 200) : '';
    const audience = body.audience ? String(body.audience).trim().slice(0, 500) : '';

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: { message: 'topic is required.' },
      });
    }

    if (!audience) {
      return res.status(400).json({
        success: false,
        error: { message: 'audience is required.' },
      });
    }

    const rawGoal = body.goal ? String(body.goal).trim().toLowerCase() : 'awareness';
    const goal = VALID_GOALS.has(rawGoal) ? rawGoal : 'awareness';

    const channels = Array.isArray(body.channels) ? body.channels : [];
    const sanitizedChannels = marketingService.sanitizeChannels(channels);

    const brief = marketingService.buildCampaignBrief(topic, audience, sanitizedChannels, goal);

    res.json({ success: true, data: brief });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/marketing/suggestions
 *
 * Generate AI-powered marketing campaign suggestions.
 *
 * Body params:
 *   - topic     (string)   Required.
 *   - audience  (string)   Required.
 *   - channels  (string[]) Optional.
 */
router.post('/suggestions', aiSuggestions, async (req, res, next) => {
  try {
    const body = req.body || {};

    const topic = body.topic ? String(body.topic).trim().slice(0, 200) : '';
    const audience = body.audience ? String(body.audience).trim().slice(0, 500) : '';

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: { message: 'topic is required.' },
      });
    }

    if (!audience) {
      return res.status(400).json({
        success: false,
        error: { message: 'audience is required.' },
      });
    }

    if (!req.aiAvailable) {
      return res.status(503).json({
        success: false,
        error: { message: 'AI service is not configured. Set the OPENAI_API_KEY environment variable.' },
      });
    }

    const channels = Array.isArray(body.channels)
      ? marketingService.sanitizeChannels(body.channels)
      : [];

    const suggestions = await aiService.generateMarketingSuggestions(topic, audience, channels);

    res.json({
      success: true,
      data: {
        topic,
        audience,
        channels,
        suggestions,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/marketing/competitor-analysis
 *
 * Generate AI-powered competitor insights.
 *
 * Body params:
 *   - industry     (string)   Required.
 *   - competitors  (string[]) Optional.
 */
router.post('/competitor-analysis', aiSuggestions, async (req, res, next) => {
  try {
    const body = req.body || {};

    const industry = body.industry ? String(body.industry).trim().slice(0, 200) : '';

    if (!industry) {
      return res.status(400).json({
        success: false,
        error: { message: 'industry is required.' },
      });
    }

    if (!req.aiAvailable) {
      return res.status(503).json({
        success: false,
        error: { message: 'AI service is not configured. Set the OPENAI_API_KEY environment variable.' },
      });
    }

    const competitors = marketingService.sanitizeCompetitors(
      Array.isArray(body.competitors) ? body.competitors : [],
    );

    const insights = await aiService.generateCompetitorInsights(industry, competitors);

    res.json({
      success: true,
      data: {
        industry,
        competitors,
        insights,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
