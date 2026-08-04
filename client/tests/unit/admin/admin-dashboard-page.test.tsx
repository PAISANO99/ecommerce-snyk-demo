import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboardPage from '../../../src/modules/admin/pages/AdminDashboardPage';
import {
  getAdminDashboardMetricsRequest,
  getAdminOrdersRequest,
} from '../../../src/modules/admin/services/adminApi';

vi.mock('../../../src/modules/admin/services/adminApi', () => ({
  getAdminDashboardMetricsRequest: vi.fn(),
  getAdminOrdersRequest: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('AdminDashboardPage', () => {
  it('renderiza métricas principales usando datos mockeados', async () => {
    vi.mocked(getAdminDashboardMetricsRequest).mockResolvedValueOnce({
      success: true,
      data: {
        totalUsers: 120,
        totalProducts: 48,
        totalOrders: 87,
        totalRevenue: 2500000,
        lowStockProducts: 4,
        ordersByStatus: { pendiente: 10, pagado: 30, enviado: 20, entregado: 25, cancelado: 2 },
      },
    });

    vi.mocked(getAdminOrdersRequest).mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 101,
          total: 120000,
          status: 'pagado',
          createdAt: new Date().toISOString(),
          name: 'Ana QA',
          email: 'ana@test.dev',
          city: 'Bogotá',
          country: 'CO',
          paymentMethod: 'tarjeta',
          user: { id: 1, name: 'Ana QA', email: 'ana@test.dev' },
          items: [
            {
              id: 1,
              quantity: 1,
              price: 120000,
              product: { id: 1, name: 'Producto test', imageUrl: 'https://example.com/a.jpg' },
            },
          ],
        },
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /dashboard general/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/total ventas/i)).toBeInTheDocument();
      expect(screen.getByText(/pedidos totales/i)).toBeInTheDocument();
      expect(screen.getByText(/usuarios/i)).toBeInTheDocument();
      expect(screen.getByText(/productos/i)).toBeInTheDocument();
    });
  });

  it('muestra estado de error cuando falla la carga', async () => {
    vi.mocked(getAdminDashboardMetricsRequest).mockRejectedValueOnce(new Error('Fallo dashboard'));
    vi.mocked(getAdminOrdersRequest).mockResolvedValueOnce({
      success: true,
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/fallo dashboard/i)).toBeInTheDocument();
  });
});
