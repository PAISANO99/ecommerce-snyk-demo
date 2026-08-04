import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';

describe('health endpoint observability contract', () => {
  it('returns a stable machine-readable contract', async () => {
    const response = await request(createApp()).get('/api/health');

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('message');
  });
});
