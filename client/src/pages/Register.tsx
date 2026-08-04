import { Link } from "react-router-dom";
import { registerRequest } from "../services/api";
import { useRegisterForm } from "../hooks";
import { useAuth } from "../hooks";
import { AuthLayout } from "../layouts";
import { AuthInput, FormMessage, SubmitButton } from "../components";
import bgImage from "../assets/imagen-register.png";

export default function Register() {
  const {
    fields,
    touched,
    showPassword,
    setShowPassword,
    isSubmitting,
    serverMessage,
    setServerMessage,
    serverError,
    errors,
    buttonDisabled,
    set,
    blur,
    handleSubmit,
  } = useRegisterForm();

  const { login } = useAuth();

  const nameIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const emailIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );

  const passwordIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  const confirmIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );

  return (
    <AuthLayout
      backgroundImage={bgImage}
      pageTitle="Crea tu cuenta"
      pageDescription="Regístrate para acceder a colecciones exclusivas, seguimiento de pedidos y una experiencia más rápida."
      showMobileIntro={false}
      sideTitle={
        <>
          Únete al
          <br />
          estilo
        </>
      }
      sideSubtitle="Crea tu cuenta y descubre tu flow. Acceso exclusivo a colecciones limitadas y envíos rápidos."
      badge={{
        text: "ÚNETE A LA ELITE",
        color: "bg-rose-700 text-white",
      }}
    >
      <div className="w-full max-w-[480px] rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)] sm:p-8 lg:p-12 max-sm:max-w-full max-sm:rounded-2xl max-sm:shadow-none">
        <h1 className="mb-2.5 text-[1.85rem] font-display font-bold tracking-tight text-slate-900 sm:text-[2rem]">
          Crea tu cuenta
        </h1>
        <p className="mb-6 text-[0.95rem] text-slate-600 sm:mb-8">
          Introduce tus datos para empezar la experiencia.
        </p>

        <form
          onSubmit={(e) =>
            handleSubmit(e, async () => {
              const result = await registerRequest({
                name: fields.name.trim(),
                email: fields.email.trim().toLowerCase(),
                password: fields.password,
              });
              setServerMessage(
                result.message || "¡Cuenta creada exitosamente! Iniciando sesión..."
              );
              // Auto-login después del registro
              setTimeout(() => {
                login({
                  user: result.user,
                  token: result.token,
                });
              }, 800);
            })
          }
          noValidate
        >
          {/* Nombre */}
          <AuthInput
            id="reg-name"
            label="Nombre Completo"
            type="text"
            value={fields.name}
            onChange={set("name")}
            onBlur={blur("name")}
            placeholder="Ej. Alex Rivera"
            error={errors.nameError}
            touched={touched.name}
            icon={nameIcon}
            autoComplete="name"
            ariaDescribedBy="reg-name-error"
          />

          {/* Correo */}
          <AuthInput
            id="reg-email"
            label="Correo Electrónico"
            type="email"
            value={fields.email}
            onChange={set("email")}
            onBlur={blur("email")}
            placeholder="hola@vibrashop.com"
            error={errors.emailError}
            touched={touched.email}
            icon={emailIcon}
            autoComplete="email"
            ariaDescribedBy="reg-email-error"
          />

          {/* Contraseña */}
          <AuthInput
            id="reg-password"
            label="Contraseña"
            type="password"
            value={fields.password}
            onChange={set("password")}
            onBlur={blur("password")}
            placeholder="••••••••"
            error={errors.passwordError}
            touched={touched.password}
            icon={passwordIcon}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((v) => !v)}
            autoComplete="new-password"
            ariaDescribedBy="reg-password-error"
          />

          {/* Confirmar Contraseña */}
          <AuthInput
            id="reg-confirm-password"
            label="Confirmar Contraseña"
            type="password"
            value={fields.confirmPassword}
            onChange={set("confirmPassword")}
            onBlur={blur("confirmPassword")}
            placeholder="••••••••"
            error={errors.confirmPasswordError}
            touched={touched.confirmPassword}
            icon={confirmIcon}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((v) => !v)}
            autoComplete="new-password"
            ariaDescribedBy="reg-confirm-error"
          />

          {/* Términos y condiciones */}
          <div className="my-6">
            <label
              className={`flex items-start gap-3 cursor-pointer transition-all ${
                touched.acceptedTerms && errors.termsError
                  ? "text-red-600"
                  : "text-slate-600"
              }`}
              htmlFor="reg-terms"
            >
              <input
                id="reg-terms"
                type="checkbox"
                checked={fields.acceptedTerms}
                onChange={set("acceptedTerms")}
                onBlur={blur("acceptedTerms")}
                className={`mt-1 h-4 w-4 shrink-0 cursor-pointer accent-blue-600 transition-all ${
                  touched.acceptedTerms && errors.termsError
                    ? "border-red-500"
                    : ""
                }`}
                aria-describedby="reg-terms-error"
              />
              <div className="text-[0.85rem] leading-relaxed">
                Acepto los{" "}
                <span className="text-blue-700 font-semibold">
                  términos y condiciones
                </span>{" "}
                y la política de privacidad.
              </div>
            </label>

            {errors.termsError && touched.acceptedTerms && (
              <span
                id="reg-terms-error"
                className="block text-red-500 text-sm font-medium mt-2 ml-7"
                role="alert"
              >
                {errors.termsError}
              </span>
            )}
          </div>

          {/* Server Messages */}
          <FormMessage type="error" message={serverError || ""} />
          <FormMessage type="success" message={serverMessage || ""} />

          <SubmitButton
            id="register-submit-btn"
            disabled={buttonDisabled}
            isSubmitting={isSubmitting}
            label="Crear cuenta"
          />
        </form>

        <div className="mt-6 text-center text-[0.95rem] text-slate-600">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-blue-900 font-bold no-underline ml-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-md"
          >
            Inicia sesión
          </Link>
        </div>

        <div className="mt-auto flex flex-wrap justify-center gap-4 pt-8 text-xs font-bold uppercase tracking-wide text-slate-500 sm:gap-5 sm:pt-10">
          <Link
            to="/login"
            className="text-slate-600 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-md"
          >
            Soporte
          </Link>
          <Link
            to="/login"
            className="text-slate-600 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-md"
          >
            Privacidad
          </Link>
          <Link
            to="/login"
            className="text-slate-600 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-md"
          >
            Ayuda
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
