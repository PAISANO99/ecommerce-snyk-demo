import { act, renderHook } from '@testing-library/react';
import { useLoginForm } from '../../../src/hooks/useLoginForm';

function buildInputEvent(value: string) {
  return { target: { value } } as React.ChangeEvent<HTMLInputElement>;
}

function buildSubmitEvent() {
  return { preventDefault: vi.fn() } as unknown as React.FormEvent<HTMLFormElement>;
}

describe('useLoginForm', () => {
  it('validates fields and submits successfully', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.handleEmailChange(buildInputEvent('user@example.com'));
      result.current.handlePasswordChange(buildInputEvent('secret123'));
      result.current.handleBlur('email');
      result.current.handleBlur('password');
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.buttonDisabled).toBe(false);
    expect(result.current.emailState).toBe('success');
    expect(result.current.passwordState).toBe('success');

    await act(async () => {
      await result.current.handleSubmit(buildSubmitEvent(), onSubmit);
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.serverError).toBeNull();
  });

  it('captures server errors during submit', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Credenciales inválidas'));
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.handleEmailChange(buildInputEvent('user@example.com'));
      result.current.handlePasswordChange(buildInputEvent('secret123'));
    });

    await act(async () => {
      await result.current.handleSubmit(buildSubmitEvent(), onSubmit);
    });

    expect(result.current.serverError).toBe('Credenciales inválidas');
    expect(result.current.isSubmitting).toBe(false);
  });
});
