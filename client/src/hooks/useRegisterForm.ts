import { useMemo, useState } from "react";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

interface Fields {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

interface TouchedFields {
  name: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
  acceptedTerms: boolean;
}

interface ValidationErrors {
  nameError: string;
  emailError: string;
  passwordError: string;
  confirmPasswordError: string;
  termsError: string;
}

function validate(fields: Fields): ValidationErrors {
  const { name, email, password, confirmPassword, acceptedTerms } = fields;
  return {
    nameError:
      name.trim().length === 0 ? "El nombre completo es obligatorio." : "",
    emailError:
      email.trim().length === 0
        ? "El correo es obligatorio."
        : !emailPattern.test(email)
        ? "Ingresa un correo con formato válido (ej: usuario@correo.com)."
        : "",
    passwordError:
      password.trim().length === 0
        ? "La contraseña es obligatoria."
        : password.length < MIN_PASSWORD_LENGTH
        ? `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
        : "",
    confirmPasswordError:
      confirmPassword.trim().length === 0
        ? "Por favor confirma tu contraseña."
        : confirmPassword !== password
        ? "Las contraseñas no coinciden. Verifica e intenta de nuevo."
        : "",
    termsError: acceptedTerms ? "" : "Debes aceptar los términos y condiciones para continuar.",
  };
}

export function useRegisterForm() {
  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });
  const [touched, setTouched] = useState<TouchedFields>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    acceptedTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const errors = useMemo(() => validate(fields), [fields]);

  const isValid =
    !errors.nameError &&
    !errors.emailError &&
    !errors.passwordError &&
    !errors.confirmPasswordError &&
    !errors.termsError;

  const buttonDisabled = !isValid || isSubmitting;

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFields((prev) => ({ ...prev, [key]: value }));
    setServerError(null);
  };

  const blur = (key: keyof TouchedFields) => () =>
    setTouched((prev) => ({ ...prev, [key]: true }));

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    onSubmit: () => Promise<void>
  ) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      acceptedTerms: true,
    });
    if (!isValid || isSubmitting) return;

    setServerError(null);
    setServerMessage(null);
    setIsSubmitting(true);

    try {
      await onSubmit();
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Error inesperado. Intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    fields,
    touched,
    showPassword,
    setShowPassword,
    isSubmitting,
    serverMessage,
    setServerMessage,
    serverError,
    setServerError,
    errors,
    isValid,
    buttonDisabled,
    set,
    blur,
    handleSubmit,
  };
}
