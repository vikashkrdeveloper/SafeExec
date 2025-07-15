import request from 'supertest';
import { app } from '../src/index';

describe('API Health Check', () => {
  test('GET /health - should return health status', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body.status).toBe('healthy');
    expect(response.body.timestamp).toBeDefined();
  });

  test.skip('GET /api/problems - should return problems list', async () => {
    // Skipped: Requires MongoDB connection
    const response = await request(app).get('/api/problems').expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('GET /nonexistent - should return 404', async () => {
    const response = await request(app).get('/nonexistent').expect(404);

    expect(response.body.error).toBe('Endpoint not found');
  });
});
