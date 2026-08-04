import { renderHook } from '@testing-library/react';
import { useAuth } from '../../../src/hooks/useAuth';

const navigateMock = vi.fn();
const authUtils = vi.hoisted(() => ({
  clearAuth: vi.fn(),
  getAuth: vi.fn(),
  setAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('../../../src/utils/auth', () => authUtils);

describe('useAuth', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    authUtils.clearAuth.mockReset();
    authUtils.getAuth.mockReset();
    authUtils.setAuth.mockReset();
    authUtils.getAuth.mockReturnValue(null);
  });

  it('returns the stored user and routes clients to home', () => {
    const user = { id: 1, name: 'Alex', email: 'alex@example.com', role: 'CLIENT' };
    authUtils.getAuth.mockReturnValue(user);
    const { result } = renderHook(() => useAuth());

    result.current.login({ user, token: 'token-123' });

    expect(result.current.user).toEqual(user);
    expect(authUtils.setAuth).toHaveBeenCalledWith(user, 'token-123');
    expect(navigateMock).toHaveBeenCalledWith('/home', { replace: true });
  });

  it('routes admins to admin and clears auth on logout', () => {
    const user = { id: 2, name: 'Admin', email: 'admin@example.com', role: 'ADMIN' };
    const { result } = renderHook(() => useAuth());

    result.current.login({ user, token: 'admin-token' });
    result.current.logout();

    expect(navigateMock).toHaveBeenNthCalledWith(1, '/admin', { replace: true });
    expect(authUtils.clearAuth).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenNthCalledWith(2, '/login', { replace: true });
  });
});
