import express from 'express';
import request from 'supertest';
import { errorHandler, rateLimiter } from '../../src/middlewares';

describe('rateLimiter', () => {
  it('blocks requests after the configured limit', async () => {
    const app = express();
    app.use(rateLimiter(2, 60_000));
    app.get('/limited', (_req, res) => {
      res.status(200).json({ ok: true });
    });
    app.use(errorHandler);

    await request(app).get('/limited').expect(200);
    await request(app).get('/limited').expect(200);
    const response = await request(app).get('/limited').expect(429);

    expect(response.headers['retry-after']).toBeDefined();
    expect(response.body.error?.statusCode).toBe(429);
    expect(response.body.error?.message).toMatch(/demasiadas solicitudes/i);
  });
});
