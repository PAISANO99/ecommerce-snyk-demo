import { render, screen } from '@testing-library/react';
import AdminOrdersPage from '../../../src/modules/admin/pages/AdminOrdersPage';
import {
  getAdminOrdersRequest,
  updateAdminOrderStatusRequest,
} from '../../../src/modules/admin/services/adminApi';

vi.mock('../../../src/modules/admin/services/adminApi', () => ({
  getAdminOrdersRequest: vi.fn(),
  updateAdminOrderStatusRequest: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => ({ searchQuery: '' }),
  };
});

describe('AdminOrdersPage', () => {
  beforeEach(() => {
    vi.mocked(updateAdminOrderStatusRequest).mockResolvedValue({
      success: true,
      data: { id: 1, status: 'pagado', updated: true },
    });
  });

  it('renderiza órdenes con datos mockeados sin llamadas reales', async () => {
    vi.mocked(getAdminOrdersRequest).mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 55,
          total: 98000,
          status: 'pendiente',
          createdAt: new Date().toISOString(),
          name: 'Cliente Uno',
          email: 'cliente1@test.dev',
          city: 'Medellín',
          country: 'CO',
          paymentMethod: 'tarjeta',
          user: { id: 2, name: 'Cliente Uno', email: 'cliente1@test.dev' },
          items: [
            {
              id: 201,
              quantity: 2,
              price: 49000,
              product: { id: 31, name: 'Tenis QA', imageUrl: 'https://example.com/z.jpg' },
            },
          ],
        },
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    render(<AdminOrdersPage />);

    expect(await screen.findByRole('heading', { level: 3, name: /^pedidos$/i })).toBeInTheDocument();
    expect((await screen.findAllByText(/cliente uno/i)).length).toBeGreaterThan(0);
    expect(getAdminOrdersRequest).toHaveBeenCalled();
  });

  it('muestra error cuando la API de órdenes falla', async () => {
    vi.mocked(getAdminOrdersRequest).mockRejectedValueOnce(new Error('Error admin orders'));

    render(<AdminOrdersPage />);

    expect(await screen.findByText(/error admin orders/i)).toBeInTheDocument();
  });
});
