'use strict';

const {
  sanitizeChannels,
  sanitizeCompetitors,
  scoreChannels,
  buildCampaignBrief,
} = require('../src/services/marketingService');

describe('sanitizeChannels', () => {
  it('filters out invalid channel names', () => {
    const result = sanitizeChannels(['email', 'invalid', 'seo', '']);
    expect(result).toEqual(['email', 'seo']);
  });

  it('returns empty array for non-array input', () => {
    expect(sanitizeChannels(null)).toEqual([]);
    expect(sanitizeChannels('email')).toEqual([]);
  });

  it('normalizes channel names to lowercase', () => {
    const result = sanitizeChannels(['EMAIL', 'SEO']);
    expect(result).toContain('email');
    expect(result).toContain('seo');
  });
});

describe('sanitizeCompetitors', () => {
  it('returns at most 10 competitors', () => {
    const many = Array.from({ length: 15 }, (_, i) => `Competitor${i}`);
    expect(sanitizeCompetitors(many)).toHaveLength(10);
  });

  it('trims and filters blank entries', () => {
    const result = sanitizeCompetitors(['  Ahrefs  ', '', 'SEMrush']);
    expect(result).toContain('Ahrefs');
    expect(result).toContain('SEMrush');
    expect(result).not.toContain('');
  });

  it('returns empty array for non-array input', () => {
    expect(sanitizeCompetitors(null)).toEqual([]);
  });
});

describe('scoreChannels', () => {
  it('returns sorted results by score descending', () => {
    const result = scoreChannels(['ppc', 'email', 'social'], 'sales');
    const scores = result.map((r) => r.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('assigns Prioritise recommendation for high-scoring channels', () => {
    const result = scoreChannels(['email'], 'retention');
    expect(result[0].recommendation).toBe('Prioritise');
  });

  it('assigns Consider recommendation for lower-scoring channels', () => {
    const result = scoreChannels(['affiliate'], 'retention');
    expect(result[0].recommendation).toBe('Consider');
  });

  it('falls back to default scores for unknown goal', () => {
    const result = scoreChannels(['email', 'seo'], 'unknown-goal');
    expect(result).toHaveLength(2);
    result.forEach((r) => {
      expect(r.score).toBeGreaterThan(0);
    });
  });
});

describe('buildCampaignBrief', () => {
  it('returns expected structure', () => {
    const brief = buildCampaignBrief('AI tools', 'marketers', ['seo', 'email'], 'leads');
    expect(brief.topic).toBe('AI tools');
    expect(brief.audience).toBe('marketers');
    expect(brief.goal).toBe('leads');
    expect(brief.channels).toBeInstanceOf(Array);
    expect(brief.suggestedBudgetAllocation).toBeInstanceOf(Array);
    expect(brief.estimatedTimelineWeeks).toBe(4);
  });

  it('uses default channels when none provided', () => {
    const brief = buildCampaignBrief('Product', 'Everyone', [], 'awareness');
    expect(brief.channels.length).toBeGreaterThan(0);
  });

  it('budget allocation percentages sum to ~100', () => {
    const brief = buildCampaignBrief('Clarion', 'Marketers', ['seo', 'email', 'social'], 'awareness');
    const total = brief.suggestedBudgetAllocation.reduce((s, a) => s + a.percentageShare, 0);
    // Allow rounding error of ±2%
    expect(total).toBeGreaterThanOrEqual(98);
    expect(total).toBeLessThanOrEqual(102);
  });
});
