
const request = require('supertest');
const app = require('../server');

describe('API', () => {
  it('health check', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
  });
  it('high score update', async () => {
    await request(app).post('/api/score').send({ score: 100 });
    const res = await request(app).get('/api/score');
    expect(res.body.highScore).toBeGreaterThanOrEqual(100);
  });
});