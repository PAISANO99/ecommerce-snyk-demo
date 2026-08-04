import { useMemo, useState } from "react";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ValidationResult {
  emailError: string;
  passwordError: string;
}

function validate(email: string, password: string): ValidationResult {
  let emailError = "";
  let passwordError = "";

  if (email.trim().length === 0) {
    emailError = "El correo es obligatorio.";
  } else if (!emailPattern.test(email)) {
    emailError = "Ingresa un correo con formato válido (ej: usuario@correo.com).";
  }

  if (password.trim().length === 0) {
    passwordError = "La contraseña no puede estar vacía.";
  }

  return { emailError, passwordError };
}

export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { emailError, passwordError } = useMemo(
    () => validate(email, password),
    [email, password]
  );

  const isValid = !emailError && !passwordError;
  const buttonDisabled = !isValid || isSubmitting;

  const handleBlur = (field: "email" | "password") =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setServerError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setServerError(null);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    onSubmit: () => Promise<void>
  ) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isValid || isSubmitting) return;

    setServerError(null);
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

  const emailState = touched.email ? (emailError ? "error" : "success") : "";
  const passwordState = touched.password ? (passwordError ? "error" : "success") : "";

  return {
    email,
    password,
    showPassword,
    setShowPassword,
    touched,
    isSubmitting,
    serverError,
    setServerError,
    emailError,
    passwordError,
    isValid,
    buttonDisabled,
    handleBlur,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    emailState,
    passwordState,
  };
}
