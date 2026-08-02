'use strict';

const {
  analyzeKeywords,
  generateMetaRecommendations,
  estimateDifficulty,
  difficultyLabel,
  detectIntent,
} = require('../src/services/seoService');

describe('detectIntent', () => {
  it('detects Transactional intent', () => {
    expect(detectIntent('buy running shoes online')).toBe('Transactional');
    expect(detectIntent('cheap laptop deals')).toBe('Transactional');
  });

  it('detects Commercial intent', () => {
    expect(detectIntent('best seo tools')).toBe('Commercial');
    expect(detectIntent('top crm software review')).toBe('Commercial');
  });

  it('detects Navigational intent', () => {
    expect(detectIntent('github login')).toBe('Navigational');
    expect(detectIntent('google official website')).toBe('Navigational');
  });

  it('defaults to Informational intent', () => {
    expect(detectIntent('how seo works')).toBe('Informational');
    expect(detectIntent('seo tips for beginners')).toBe('Informational');
  });
});

describe('difficultyLabel', () => {
  it('returns Low for scores below 35', () => {
    expect(difficultyLabel(0)).toBe('Low');
    expect(difficultyLabel(34)).toBe('Low');
  });

  it('returns Medium for scores 35-64', () => {
    expect(difficultyLabel(35)).toBe('Medium');
    expect(difficultyLabel(64)).toBe('Medium');
  });

  it('returns High for scores 65+', () => {
    expect(difficultyLabel(65)).toBe('High');
    expect(difficultyLabel(100)).toBe('High');
  });
});

describe('estimateDifficulty', () => {
  it('returns a number between 0 and 100', () => {
    const score = estimateDifficulty('seo');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('single-word keywords score higher than multi-word', () => {
    const single = estimateDifficulty('shoes');
    const multi = estimateDifficulty('buy comfortable running shoes for marathon');
    expect(single).toBeGreaterThan(multi);
  });
});

describe('analyzeKeywords', () => {
  it('returns correct structure', () => {
    const result = analyzeKeywords(['seo tools', 'buy sneakers'], 'google', 'en-US');
    expect(result.searchEngine).toBe('google');
    expect(result.locale).toBe('en-US');
    expect(result.totalKeywords).toBe(2);
    expect(result.analysis).toHaveLength(2);
    expect(result.summary).toHaveProperty('lowDifficulty');
    expect(result.summary).toHaveProperty('mediumDifficulty');
    expect(result.summary).toHaveProperty('highDifficulty');
  });

  it('summary counts add up to totalKeywords', () => {
    const result = analyzeKeywords(['a', 'b', 'c', 'd', 'e'], 'bing', 'fr-FR');
    const { lowDifficulty, mediumDifficulty, highDifficulty } = result.summary;
    expect(lowDifficulty + mediumDifficulty + highDifficulty).toBe(5);
  });
});

describe('generateMetaRecommendations', () => {
  it('title is at most 60 chars', () => {
    const meta = generateMetaRecommendations('digital marketing automation', ['seo', 'content']);
    expect(meta.title.length).toBeLessThanOrEqual(60);
  });

  it('description is at most 160 chars', () => {
    const meta = generateMetaRecommendations('cloud security', ['zero-trust', 'vpn', 'firewall']);
    expect(meta.description.length).toBeLessThanOrEqual(160);
  });

  it('returns expected fields', () => {
    const meta = generateMetaRecommendations('SEO tools', ['keyword research']);
    expect(meta).toHaveProperty('title');
    expect(meta).toHaveProperty('description');
    expect(meta).toHaveProperty('canonicalUrl');
    expect(meta).toHaveProperty('recommendedH1');
    expect(meta).toHaveProperty('structuredDataType');
  });

  it('slugifies and encodes canonical URL path segment', () => {
    const meta = generateMetaRecommendations('Topic / One #1', ['keyword']);
    expect(meta.canonicalUrl).toBe('https://example.com/topic-one-1');
  });
});
