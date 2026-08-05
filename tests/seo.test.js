'use strict';

const request = require('supertest');
const app = require('../src/index');

describe('GET /api/seo/analyze', () => {
  it('returns 400 when no keywords supplied', async () => {
    const res = await request(app).get('/api/seo/analyze');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('analyzes a single keyword', async () => {
    const res = await request(app)
      .get('/api/seo/analyze')
      .query({ keywords: 'best running shoes' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.analysis).toHaveLength(1);
    expect(res.body.data.analysis[0].keyword).toBe('best running shoes');
    expect(res.body.data.analysis[0].intent).toBe('Commercial');
    expect(['Low', 'Medium', 'High']).toContain(res.body.data.analysis[0].difficulty);
  });

  it('analyzes multiple comma-separated keywords', async () => {
    const res = await request(app)
      .get('/api/seo/analyze')
      .query({ keywords: 'seo tools,keyword research' });

    expect(res.status).toBe(200);
    expect(res.body.data.totalKeywords).toBe(2);
    expect(res.body.data.analysis).toHaveLength(2);
  });

  it('defaults searchEngine to google', async () => {
    const res = await request(app)
      .get('/api/seo/analyze')
      .query({ keywords: 'ai marketing' });

    expect(res.status).toBe(200);
    expect(res.body.data.searchEngine).toBe('google');
  });

  it('accepts valid searchEngine parameter', async () => {
    const res = await request(app)
      .get('/api/seo/analyze')
      .query({ keywords: 'content marketing', searchEngine: 'bing' });

    expect(res.status).toBe(200);
    expect(res.body.data.searchEngine).toBe('bing');
  });

  it('falls back to google for invalid searchEngine', async () => {
    const res = await request(app)
      .get('/api/seo/analyze')
      .query({ keywords: 'seo', searchEngine: 'evil-engine' });

    expect(res.status).toBe(200);
    expect(res.body.data.searchEngine).toBe('google');
  });
});

describe('POST /api/seo/analyze', () => {
  it('returns 400 when no keywords supplied', async () => {
    const res = await request(app)
      .post('/api/seo/analyze')
      .send({ keywords: [] });

    expect(res.status).toBe(400);
  });

  it('analyzes keywords from request body', async () => {
    const res = await request(app)
      .post('/api/seo/analyze')
      .send({ keywords: ['buy shoes online', 'cheap sneakers'] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalKeywords).toBe(2);
  });
});

describe('POST /api/seo/meta', () => {
  it('returns 400 when topic is missing', async () => {
    const res = await request(app).post('/api/seo/meta').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('generates meta recommendations', async () => {
    const res = await request(app)
      .post('/api/seo/meta')
      .send({ topic: 'digital marketing', keywords: ['seo', 'ppc', 'content'] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBeDefined();
    expect(res.body.data.description).toBeDefined();
    expect(res.body.data.title.length).toBeLessThanOrEqual(60);
    expect(res.body.data.description.length).toBeLessThanOrEqual(160);
  });
});

describe('POST /api/seo/suggestions (AI endpoint)', () => {
  it('returns 503 when AI is not configured', async () => {
    const res = await request(app)
      .post('/api/seo/suggestions')
      .send({ keywords: ['seo tools'] });

    // OPENAI_API_KEY not set in test env → 503
    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when no keywords provided', async () => {
    const res = await request(app)
      .post('/api/seo/suggestions')
      .send({ keywords: [] });

    expect(res.status).toBe(400);
  });
});
