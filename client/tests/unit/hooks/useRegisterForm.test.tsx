import { act, renderHook } from '@testing-library/react';
import { useRegisterForm } from '../../../src/hooks/useRegisterForm';

function buildInputEvent(value: string, type = 'text') {
  return { target: { value, type } } as React.ChangeEvent<HTMLInputElement>;
}

function buildCheckboxEvent(checked: boolean) {
  return { target: { checked, type: 'checkbox' } } as React.ChangeEvent<HTMLInputElement>;
}

function buildSubmitEvent() {
  return { preventDefault: vi.fn() } as unknown as React.FormEvent<HTMLFormElement>;
}

describe('useRegisterForm', () => {
  it('marks required fields when submit is invalid', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      await result.current.handleSubmit(buildSubmitEvent(), onSubmit);
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.touched.acceptedTerms).toBe(true);
    expect(result.current.errors.termsError).toContain('Debes aceptar');
    expect(result.current.buttonDisabled).toBe(true);
  });

  it('submits a valid payload and surfaces async errors', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Registro no disponible'));
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.set('name')(buildInputEvent('Alex Rivera'));
      result.current.set('email')(buildInputEvent('alex@example.com'));
      result.current.set('password')(buildInputEvent('secret123'));
      result.current.set('confirmPassword')(buildInputEvent('secret123'));
      result.current.set('acceptedTerms')(buildCheckboxEvent(true));
    });

    expect(result.current.isValid).toBe(true);

    await act(async () => {
      await result.current.handleSubmit(buildSubmitEvent(), onSubmit);
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(result.current.serverError).toBe('Registro no disponible');
    expect(result.current.isSubmitting).toBe(false);
  });
});
