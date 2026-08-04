import autocannon from 'autocannon';
import { createServer } from 'node:http';
import { AddressInfo } from 'node:net';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';

describe('health endpoint load baseline', () => {
  it('handles a short burst without 5xx responses', async () => {
    process.env.RATE_LIMIT_MAX_REQUESTS = '100000';
    process.env.RATE_LIMIT_WINDOW_MS = '120000';

    const server = createServer(createApp());

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;

    const result = await autocannon({
      url: `http://127.0.0.1:${port}/api/health`,
      connections: 5,
      duration: 2,
    });

    expect(result.errors).toBe(0);
    expect(result.non2xx).toBe(0);

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  });
});
