const axiosState = vi.hoisted(() => {
  const publicApi = {
    get: vi.fn(),
    post: vi.fn(),
  };

  const authApi = {
    get: vi.fn(),
    request: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
      },
    },
  };

  return {
    authApi,
    create: vi.fn()
      .mockReturnValueOnce(publicApi)
      .mockReturnValueOnce(authApi),
    isAxiosError: vi.fn((error: unknown) => Boolean((error as { response?: unknown })?.response)),
    publicApi,
  };
});

vi.mock('axios', () => ({
  default: {
    create: axiosState.create,
    isAxiosError: axiosState.isAxiosError,
  },
}));

import {
  createOrderRequest,
  getProductsRequest,
  loginRequest,
  requestAuthGet,
} from '../../../src/services/api';

describe('api service', () => {
  beforeEach(() => {
    axiosState.publicApi.get.mockReset();
    axiosState.publicApi.post.mockReset();
    axiosState.authApi.get.mockReset();
    axiosState.authApi.request.mockReset();
    localStorage.clear();
  });

  it('registers the auth interceptor and injects the bearer token', async () => {
    const interceptor = axiosState.authApi.interceptors.request.use.mock.calls[0][0] as (
      config: { headers: Record<string, string> }
    ) => { headers: Record<string, string> };

    localStorage.setItem('vibe-pulse-token', 'stored-token');
    const config = interceptor({ headers: {} });

    expect(axiosState.authApi.interceptors.request.use).toHaveBeenCalledTimes(1);
    expect(config.headers.Authorization).toBe('Bearer stored-token');
  });

  it('calls the expected endpoints for public and auth requests', async () => {
    axiosState.publicApi.post.mockResolvedValueOnce({ data: { token: 'abc', user: { role: 'CLIENT' } } });
    axiosState.publicApi.get.mockResolvedValueOnce({
      data: { success: true, data: [], total: 0, page: 1, limit: 12, totalPages: 0 },
    });
    axiosState.authApi.request.mockResolvedValueOnce({ data: { success: true, order: { id: 9 } } });

    await expect(loginRequest({ email: 'user@example.com', password: 'secret123' })).resolves.toMatchObject({
      token: 'abc',
    });
    await expect(getProductsRequest({ category: 'hoodies' })).resolves.toMatchObject({ success: true });
    await expect(
      createOrderRequest({
        name: 'Alex',
        email: 'alex@example.com',
        address: 'Main 123',
        city: 'Bogota',
        country: 'CO',
        postalCode: '110111',
        phone: '123456789',
        paymentMethod: 'tarjeta',
        items: [{ productId: 1, quantity: 1, price: 120 }],
      })
    ).resolves.toMatchObject({ success: true });

    expect(axiosState.publicApi.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'user@example.com',
      password: 'secret123',
    });
    expect(axiosState.publicApi.get).toHaveBeenCalledWith('/api/products', {
      params: { category: 'hoodies' },
    });
    expect(axiosState.authApi.request).toHaveBeenCalledWith({
      method: 'post',
      url: '/api/orders',
      data: expect.objectContaining({ name: 'Alex' }),
    });
  });

  it('maps rate limit and server errors to user-friendly messages', async () => {
    axiosState.publicApi.get.mockRejectedValueOnce({
      response: { status: 429, data: {} },
    });
    axiosState.authApi.get.mockRejectedValueOnce({
      response: { status: 500, data: { error: { message: 'Fallo interno' } } },
    });

    await expect(getProductsRequest()).rejects.toThrow('Exceso de peticiones, espere un momento');
    await expect(requestAuthGet('/api/admin/orders')).rejects.toThrow('Fallo interno');
  });
});
