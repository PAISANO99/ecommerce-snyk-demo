import authRoutes from '../../src/routes/auth';
import productRoutes from '../../src/routes/products';
import categoryRoutes from '../../src/routes/categories';
import cartRoutes from '../../src/routes/cart';
import orderRoutes from '../../src/routes/orders';
import adminRoutes from '../../src/routes/admin';

function extractRoutes(basePath: string, router: { stack?: Array<{ route?: { path: string; methods: Record<string, boolean> } }> }) {
  return (router.stack ?? [])
    .filter((layer) => layer.route)
    .flatMap((layer) => {
      const route = layer.route;
      if (!route) return [];

      return Object.keys(route.methods).map((method) => `${method.toUpperCase()} ${basePath}${route.path}`);
    });
}

describe('server route manifest', () => {
  it('exposes the 27 expected endpoints across the application', () => {
    const routes = [
      'GET /api/health',
      ...extractRoutes('/api/auth', authRoutes),
      ...extractRoutes('/api/products', productRoutes),
      ...extractRoutes('/api/categories', categoryRoutes),
      ...extractRoutes('/api/cart', cartRoutes),
      ...extractRoutes('/api/orders', orderRoutes),
      ...extractRoutes('/api/admin', adminRoutes),
    ].sort();

    expect(routes).toEqual([
      'DELETE /api/cart/items/:id',
      'DELETE /api/categories/:id',
      'DELETE /api/products/:id',
      'GET /api/admin/dashboard/metrics',
      'GET /api/admin/orders',
      'GET /api/admin/users',
      'GET /api/auth/admin-only',
      'GET /api/auth/me',
      'GET /api/auth/profile',
      'GET /api/cart/',
      'GET /api/categories/',
      'GET /api/categories/:slug',
      'GET /api/health',
      'GET /api/orders/',
      'GET /api/products/',
      'GET /api/products/:id',
      'GET /api/products/featured',
      'PATCH /api/admin/orders/:id/status',
      'PATCH /api/cart/items/:id',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'POST /api/cart/items',
      'POST /api/categories/',
      'POST /api/orders/',
      'POST /api/products/',
      'PUT /api/categories/:id',
      'PUT /api/products/:id',
    ]);
  });
});
