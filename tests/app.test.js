'use strict';

const request = require('supertest');
const app = require('../src/index');

describe('Health check', () => {
  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('clarion');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('404 handler', () => {
  it('GET /nonexistent returns 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe('Route not found.');
  });
});

describe('CORS policy', () => {
  it('returns 403 for disallowed origins', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'https://disallowed.example.com');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toMatch(/not allowed/);
  });
});
