'use strict';

/**
 * SEO Service
 *
 * Provides keyword analysis utilities and structures SEO research results.
 * In production these helpers can be extended to call real SEO data APIs
 * (e.g. Google Search Console, Ahrefs, SEMrush).
 */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'as', 'be', 'this', 'that',
  'are', 'was', 'were', 'has', 'have', 'had', 'do', 'does', 'did', 'not',
]);

/**
 * Estimate a very rough "difficulty score" (0-100) based on keyword length
 * and stop-word ratio. Real implementations would use actual search data.
 *
 * @param {string} keyword
 * @returns {number}
 */
function estimateDifficulty(keyword) {
  const words = keyword.toLowerCase().split(/\s+/);
  const contentWords = words.filter((w) => !STOP_WORDS.has(w));
  const wordCount = words.length;

  // Longer-tail keywords (more words) tend to have lower competition.
  const longtailBonus = Math.min(wordCount * 8, 40);

  // Very short keywords are typically high-competition.
  const baseScore = wordCount === 1 ? 80 : wordCount === 2 ? 60 : 40;

  // Penalise if most words are stop words.
  const contentRatio = wordCount > 0 ? contentWords.length / wordCount : 1;
  const penalty = Math.round((1 - contentRatio) * 20);

  return Math.max(0, Math.min(100, baseScore - longtailBonus + penalty));
}

/**
 * Classify a difficulty score into a label.
 *
 * @param {number} score
 * @returns {'Low'|'Medium'|'High'}
 */
function difficultyLabel(score) {
  if (score < 35) return 'Low';
  if (score < 65) return 'Medium';
  return 'High';
}

/**
 * Detect broad search intent from a keyword string.
 *
 * @param {string} keyword
 * @returns {'Informational'|'Navigational'|'Transactional'|'Commercial'}
 */
function detectIntent(keyword) {
  const kw = String(keyword).toLowerCase();

  const transactionalTerms = ['buy', 'purchase', 'order', 'shop', 'cheap', 'price', 'deal', 'discount', 'sale'];
  const commercialTerms = ['best', 'top', 'review', 'compare', 'vs', 'versus', 'alternatives'];
  const navigationalTerms = ['login', 'sign in', 'official', 'website', 'site', 'account'];

  const containsTerm = (term) => {
    if (term.includes(' ')) return kw.includes(term);
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`).test(kw);
  };

  if (transactionalTerms.some(containsTerm)) return 'Transactional';
  if (commercialTerms.some(containsTerm)) return 'Commercial';
  if (navigationalTerms.some(containsTerm)) return 'Navigational';
  return 'Informational';
}

/**
 * Analyse an array of keywords and return a structured report.
 *
 * @param {string[]} keywords
 * @param {string}   searchEngine
 * @param {string}   locale
 * @returns {object}
 */
function analyzeKeywords(keywords, searchEngine, locale) {
  const analysis = keywords.map((kw) => {
    const difficulty = estimateDifficulty(kw);
    return {
      keyword: kw,
      intent: detectIntent(kw),
      difficultyScore: difficulty,
      difficulty: difficultyLabel(difficulty),
    };
  });

  return {
    searchEngine,
    locale,
    timestamp: new Date().toISOString(),
    totalKeywords: keywords.length,
    analysis,
    summary: {
      lowDifficulty: analysis.filter((a) => a.difficulty === 'Low').length,
      mediumDifficulty: analysis.filter((a) => a.difficulty === 'Medium').length,
      highDifficulty: analysis.filter((a) => a.difficulty === 'High').length,
    },
  };
}

/**
 * Generate basic meta-tag recommendations for a given topic.
 *
 * @param {string}   topic
 * @param {string[]} keywords
 * @returns {object}
 */
function generateMetaRecommendations(topic, keywords) {
  const primaryKeyword = keywords[0] || topic;
  const title = `${topic} | ${primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1)}`;
  const description =
    `Discover everything about ${topic}. ` +
    `Explore ${keywords.slice(0, 3).join(', ')} and more — expert insights and research.`;

  return {
    title: title.slice(0, 60),
    description: description.slice(0, 160),
    canonicalUrl: `https://example.com/${topic.toLowerCase().replace(/\s+/g, '-')}`,
    recommendedH1: topic,
    structuredDataType: 'Article',
  };
}

module.exports = {
  analyzeKeywords,
  generateMetaRecommendations,
  estimateDifficulty,
  difficultyLabel,
  detectIntent,
};
