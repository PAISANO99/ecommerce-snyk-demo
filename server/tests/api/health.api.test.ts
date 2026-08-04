import request from 'supertest';
import { createApp } from '../../src/app';

describe('GET /api/health', () => {
  it('returns the expected health payload', async () => {
    const response = await request(createApp()).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      message: 'API is running',
    });
  });
});
