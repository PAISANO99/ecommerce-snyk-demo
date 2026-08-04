import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';

describe('global rate limit integration', () => {
  it('respects the environment-driven global rate limit window', async () => {
    process.env.RATE_LIMIT_MAX_REQUESTS = '2';
    process.env.RATE_LIMIT_WINDOW_MS = '120000';

    const app = createApp();

    await request(app).get('/api/health').expect(200);
    await request(app).get('/api/health').expect(200);
    const response = await request(app).get('/api/health').expect(429);

    expect(response.headers['retry-after']).toBeDefined();
    expect(response.body.error?.statusCode).toBe(429);
    expect(response.body.error?.message).toMatch(/demasiadas solicitudes/i);
  });
});
