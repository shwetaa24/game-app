const request = require('supertest');
const app = require('../server'); // Assumes server.js is one directory up

// The describe block groups related tests for clarity.
describe('API Endpoint Testing', () => {

  // Test 1: Verifies the /health endpoint returns HTTP 200 (OK).
  it('should return 200 for the health check endpoint', async () => {
    // Send a GET request to the /health route
    const res = await request(app).get('/health');
    // Expect the HTTP status code to be 200
    expect(res.statusCode).toEqual(200);
  });

  // Test 2: Verifies score submission and retrieval.
  it('should correctly update and retrieve the high score', async () => {
    // 1. Submit a score (e.g., 100) using a POST request.
    // This updates the in-memory 'highScore' variable in the server module.
    await request(app)
      .post('/api/score')
      .send({ score: 100 })
      .expect(200); // Expect a successful POST

    // 2. Retrieve the high score using a GET request.
    const res = await request(app).get('/api/score');

    // 3. Verify the retrieved score is at least the score we just posted.
    // (We use toBeGreaterThanOrEqual because another test might have run first
    // and set a higher score, although in isolation it should equal 100).
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('highScore');
    expect(res.body.highScore).toBeGreaterThanOrEqual(100);
  });
});