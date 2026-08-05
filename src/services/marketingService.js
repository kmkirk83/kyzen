'use strict';

/**
 * Marketing Service
 *
 * Provides marketing research utilities: audience segmentation,
 * channel scoring, and campaign planning helpers.
 */

const VALID_CHANNELS = new Set([
  'email', 'social', 'seo', 'ppc', 'content', 'influencer', 'affiliate', 'video',
]);

const MAX_CHANNEL_LENGTH = 50;
const MAX_COMPETITORS = 10;

/**
 * Sanitize and validate a list of marketing channels.
 *
 * @param {string[]} channels
 * @returns {string[]}
 */
function sanitizeChannels(channels) {
  if (!Array.isArray(channels)) return [];
  return channels
    .map((c) => String(c).trim().toLowerCase().slice(0, MAX_CHANNEL_LENGTH))
    .filter((c) => VALID_CHANNELS.has(c));
}

/**
 * Sanitize a list of competitor names.
 *
 * @param {string[]} competitors
 * @returns {string[]}
 */
function sanitizeCompetitors(competitors) {
  if (!Array.isArray(competitors)) return [];
  return competitors
    .map((c) => String(c).trim().slice(0, 100))
    .filter(Boolean)
    .slice(0, MAX_COMPETITORS);
}

/**
 * Score marketing channels for a given campaign goal.
 * Returns channels sorted by estimated effectiveness.
 *
 * @param {string[]} channels
 * @param {string}   goal - 'awareness'|'leads'|'sales'|'retention'
 * @returns {object[]}
 */
function scoreChannels(channels, goal) {
  const effectivenessMap = {
    awareness: { social: 9, content: 8, video: 8, influencer: 7, seo: 7, ppc: 6, email: 5, affiliate: 4 },
    leads: { seo: 9, ppc: 9, content: 8, email: 7, social: 6, affiliate: 5, influencer: 4, video: 4 },
    sales: { ppc: 9, email: 9, affiliate: 8, seo: 7, social: 7, content: 6, influencer: 5, video: 5 },
    retention: { email: 10, content: 8, social: 7, video: 6, seo: 5, ppc: 4, influencer: 3, affiliate: 2 },
  };

  const scores = effectivenessMap[goal] || effectivenessMap.awareness;

  return channels
    .map((channel) => ({
      channel,
      score: scores[channel] || 5,
      recommendation: (scores[channel] || 5) >= 7 ? 'Prioritise' : 'Consider',
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Build a high-level campaign brief from inputs.
 *
 * @param {string}   topic
 * @param {string}   audience
 * @param {string[]} channels
 * @param {string}   goal
 * @returns {object}
 */
function buildCampaignBrief(topic, audience, channels, goal) {
  const sanitizedChannels = sanitizeChannels(channels);
  const finalChannels = sanitizedChannels.length ? sanitizedChannels : ['content', 'seo', 'social'];
  const scoredChannels = scoreChannels(finalChannels, goal);
  const totalScore = scoredChannels.reduce((s, c) => s + c.score, 0) || 1;

  return {
    topic,
    audience,
    goal,
    timestamp: new Date().toISOString(),
    channels: scoredChannels,
    estimatedTimelineWeeks: 4,
    suggestedBudgetAllocation: scoredChannels.map((ch) => ({
      channel: ch.channel,
      percentageShare: Math.round((ch.score / totalScore) * 100),
    })),
  };
}

module.exports = {
  sanitizeChannels,
  sanitizeCompetitors,
  scoreChannels,
  buildCampaignBrief,
};
