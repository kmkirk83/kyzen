'use strict';

const OpenAI = require('openai');
const config = require('../config');

let _client = null;

function getClient() {
  if (!_client) {
    if (!config.openai.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured.');
    }
    _client = new OpenAI({ apiKey: config.openai.apiKey });
  }
  return _client;
}

/**
 * Generate AI-powered suggestions using OpenAI.
 *
 * @param {string} systemPrompt  - Role / behaviour instructions for the model.
 * @param {string} userPrompt    - The user-facing request.
 * @returns {Promise<string>}    - The model's text response.
 */
async function generateSuggestions(systemPrompt, userPrompt) {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: config.openai.model,
    max_tokens: config.openai.maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content returned from AI service.');
  }
  return content;
}

/**
 * Generate SEO keyword suggestions.
 *
 * @param {string[]} keywords   - Seed keywords.
 * @param {string}   locale     - Target locale (e.g. "en-US").
 * @returns {Promise<string>}
 */
async function generateSeoSuggestions(keywords, locale) {
  const systemPrompt =
    'You are an expert SEO strategist. ' +
    'Provide actionable keyword suggestions, search intent analysis, ' +
    'and content recommendations based on the provided seed keywords and target locale. ' +
    'Be concise and specific. Format your response in clear sections.';

  const userPrompt =
    `Seed keywords: ${keywords.join(', ')}\n` +
    `Target locale: ${locale}\n\n` +
    'Please provide:\n' +
    '1. Related long-tail keyword suggestions (at least 5)\n' +
    '2. Search intent analysis for each seed keyword\n' +
    '3. Content topic recommendations\n' +
    '4. SEO difficulty assessment (Low/Medium/High) for the seed keywords';

  return generateSuggestions(systemPrompt, userPrompt);
}

/**
 * Generate marketing campaign suggestions.
 *
 * @param {string}   topic     - Campaign topic or product.
 * @param {string}   audience  - Target audience description.
 * @param {string[]} channels  - Marketing channels (e.g. ["email", "social"]).
 * @returns {Promise<string>}
 */
async function generateMarketingSuggestions(topic, audience, channels) {
  const systemPrompt =
    'You are a senior marketing strategist with expertise in digital marketing. ' +
    'Provide creative, data-driven campaign suggestions tailored to the given topic, ' +
    'audience, and channels. Be actionable and include measurable goals.';

  const channelList = channels.length ? channels.join(', ') : 'all channels';

  const userPrompt =
    `Campaign topic / product: ${topic}\n` +
    `Target audience: ${audience}\n` +
    `Marketing channels: ${channelList}\n\n` +
    'Please provide:\n' +
    '1. Campaign concept and messaging strategy\n' +
    '2. Key value propositions to highlight\n' +
    '3. Channel-specific tactics and content ideas\n' +
    '4. KPIs and success metrics to track\n' +
    '5. Potential risks and mitigation strategies';

  return generateSuggestions(systemPrompt, userPrompt);
}

/**
 * Generate competitor analysis suggestions.
 *
 * @param {string}   industry   - Industry or niche.
 * @param {string[]} competitors - Competitor names.
 * @returns {Promise<string>}
 */
async function generateCompetitorInsights(industry, competitors) {
  const systemPrompt =
    'You are a competitive intelligence expert specializing in SEO and digital marketing. ' +
    'Provide strategic insights and opportunities based on the given industry and competitors.';

  const competitorList =
    competitors.length ? competitors.join(', ') : 'general industry players';

  const userPrompt =
    `Industry / niche: ${industry}\n` +
    `Key competitors: ${competitorList}\n\n` +
    'Please provide:\n' +
    '1. Competitive landscape overview\n' +
    '2. Potential content gap opportunities\n' +
    '3. Differentiation strategies\n' +
    '4. Keyword opportunities competitors may be missing\n' +
    '5. Recommended positioning strategy';

  return generateSuggestions(systemPrompt, userPrompt);
}

module.exports = {
  generateSuggestions,
  generateSeoSuggestions,
  generateMarketingSuggestions,
  generateCompetitorInsights,
};
