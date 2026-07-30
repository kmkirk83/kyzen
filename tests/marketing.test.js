'use strict';

const request = require('supertest');
const app = require('../src/index');

describe('POST /api/marketing/campaign', () => {
  it('returns 400 when topic is missing', async () => {
    const res = await request(app)
      .post('/api/marketing/campaign')
      .send({ audience: 'small business owners' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('topic is required.');
  });

  it('returns 400 when audience is missing', async () => {
    const res = await request(app)
      .post('/api/marketing/campaign')
      .send({ topic: 'AI tools' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('audience is required.');
  });

  it('builds a campaign brief with default goal', async () => {
    const res = await request(app)
      .post('/api/marketing/campaign')
      .send({
        topic: 'AI-powered SEO platform',
        audience: 'marketing managers at mid-size companies',
        channels: ['email', 'seo', 'content'],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.topic).toBe('AI-powered SEO platform');
    expect(res.body.data.goal).toBe('awareness');
    expect(res.body.data.channels).toBeInstanceOf(Array);
    expect(res.body.data.suggestedBudgetAllocation).toBeInstanceOf(Array);
  });

  it('accepts a valid goal parameter', async () => {
    const res = await request(app)
      .post('/api/marketing/campaign')
      .send({
        topic: 'CRM software',
        audience: 'sales teams',
        goal: 'leads',
        channels: ['ppc', 'email'],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.goal).toBe('leads');
  });

  it('falls back to awareness for invalid goal', async () => {
    const res = await request(app)
      .post('/api/marketing/campaign')
      .send({
        topic: 'CRM software',
        audience: 'sales teams',
        goal: 'world-domination',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.goal).toBe('awareness');
  });

  it('filters out invalid channel names', async () => {
    const res = await request(app)
      .post('/api/marketing/campaign')
      .send({
        topic: 'Analytics platform',
        audience: 'data analysts',
        channels: ['email', 'invalid-channel', 'seo'],
      });

    expect(res.status).toBe(200);
    const channelNames = res.body.data.channels.map((c) => c.channel);
    expect(channelNames).not.toContain('invalid-channel');
    expect(channelNames).toContain('email');
    expect(channelNames).toContain('seo');
  });
});

describe('POST /api/marketing/suggestions (AI endpoint)', () => {
  it('returns 503 when AI is not configured', async () => {
    const res = await request(app)
      .post('/api/marketing/suggestions')
      .send({ topic: 'SEO tools', audience: 'marketers' });

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when topic is missing', async () => {
    const res = await request(app)
      .post('/api/marketing/suggestions')
      .send({ audience: 'marketers' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when audience is missing', async () => {
    const res = await request(app)
      .post('/api/marketing/suggestions')
      .send({ topic: 'SEO tools' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/marketing/competitor-analysis (AI endpoint)', () => {
  it('returns 503 when AI is not configured', async () => {
    const res = await request(app)
      .post('/api/marketing/competitor-analysis')
      .send({ industry: 'SaaS CRM', competitors: ['Salesforce', 'HubSpot'] });

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when industry is missing', async () => {
    const res = await request(app)
      .post('/api/marketing/competitor-analysis')
      .send({ competitors: ['Ahrefs', 'SEMrush'] });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('industry is required.');
  });
});
