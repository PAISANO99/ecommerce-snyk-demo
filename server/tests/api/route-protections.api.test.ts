import request from 'supertest';
import { createApp } from '../../src/app';

describe('route protections and validation contracts', () => {
  it('rejects malformed public auth payloads before deeper processing', async () => {
    const app = createApp();

    await request(app).post('/api/auth/register').send({}).expect(400);
    await request(app).post('/api/auth/login').send({}).expect(400);
  });

  it('protects authenticated user routes when no token is provided', async () => {
    const app = createApp();

    await request(app).get('/api/auth/me').expect(401);
    await request(app).get('/api/auth/profile').expect(401);
    await request(app).get('/api/auth/admin-only').expect(401);
    await request(app).get('/api/cart').expect(401);
    await request(app).get('/api/orders').expect(401);
    await request(app).post('/api/cart/items').send({ productId: 1, quantity: 1 }).expect(401);
    await request(app).patch('/api/cart/items/1').send({ quantity: 2 }).expect(401);
    await request(app).delete('/api/cart/items/1').expect(401);
  });

  it('protects privileged product and category mutations when no token is provided', async () => {
    const app = createApp();

    await request(app).post('/api/products').send({}).expect(401);
    await request(app).put('/api/products/1').send({}).expect(401);
    await request(app).delete('/api/products/1').expect(401);
    await request(app).post('/api/categories').send({}).expect(401);
    await request(app).put('/api/categories/1').send({}).expect(401);
    await request(app).delete('/api/categories/1').send({}).expect(401);
  });

  it('protects admin backoffice routes when no token is provided', async () => {
    const app = createApp();

    await request(app).get('/api/admin/dashboard/metrics').expect(401);
    await request(app).get('/api/admin/users').expect(401);
    await request(app).get('/api/admin/orders').expect(401);
    await request(app).patch('/api/admin/orders/1/status').send({ status: 'DELIVERED' }).expect(401);
  });
});
