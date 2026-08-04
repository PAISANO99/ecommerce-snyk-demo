import { Link } from "react-router-dom";
import { loginRequest } from "../services/api";
import { useLoginForm, useAuth } from "../hooks";
import { AuthLayout } from "../layouts";
import { AuthInput, FormMessage, SocialButtons, SubmitButton } from "../components";
import bgImage from "../assets/imagen-login.png";

export default function Login() {
  const {
    email,
    password,
    showPassword,
    setShowPassword,
    isSubmitting,
    serverError,
    emailError,
    passwordError,
    buttonDisabled,
    handleBlur,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    emailState,
    passwordState,
  } = useLoginForm();

  const { login } = useAuth();

  const emailIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
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
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  return (
    <AuthLayout
      backgroundImage={bgImage}
      pageTitle="Bienvenido"
      pageDescription="Ingresa tus credenciales para continuar tu experiencia de compra sin fricciones."
      showMobileIntro={false}
      sideTitle={
        <>
          Únete a la
          <br />
          Revolución
          <br />
          Urbana.
        </>
      }
      sideSubtitle="Descubre las últimas tendencias con una experiencia de compra diseñada para el futuro."
      sideBottom="ELECTRIC EDITORIAL © 2024"
      badge={{ text: "VIBRA SHOP" }}
    >
      <div className="w-full max-w-[420px]">
        <h1 className="mb-2.5 text-[1.85rem] font-display font-bold tracking-tight text-slate-900 sm:text-[2rem]">
          Bienvenido
        </h1>
        <p className="mb-6 text-[0.95rem] text-slate-600 sm:mb-8">
          Ingresa tus credenciales para continuar tu experiencia.
        </p>

        <form
          onSubmit={(e) =>
            handleSubmit(e, async () => {
              const result = await loginRequest({
                email: email.trim().toLowerCase(),
                password,
              });
              login({
                user: result.user,
                token: result.token,
              });
            })
          }
          noValidate
        >
          <AuthInput
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => handleBlur("email")}
            placeholder="nombre@ejemplo.com"
            error={emailError}
            touched={emailState === "error" || emailState === "success"}
            icon={emailIcon}
            autoComplete="username"
            ariaDescribedBy="login-email-error"
          />

          <div className="relative mb-5">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label
                className="block text-xs font-bold text-slate-600 uppercase tracking-wide"
                htmlFor="login-password"
              >
                Contraseña
              </label>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Recuperación próximamente
              </span>
            </div>
            <AuthInput
              id="login-password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur("password")}
              placeholder="••••••••"
              error={passwordError}
              touched={passwordState === "error" || passwordState === "success"}
              icon={passwordIcon}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((v) => !v)}
              autoComplete="current-password"
              ariaDescribedBy="login-password-error"
            />
          </div>

          <FormMessage type="error" message={serverError || ""} />

          <SubmitButton
            id="login-submit-btn"
            disabled={buttonDisabled}
            isSubmitting={isSubmitting}
            label="Iniciar sesión"
          />
        </form>

        <SocialButtons />

        <div className="mt-6 text-center text-[0.95rem] text-slate-600">
          ¿Aún no tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-blue-900 font-bold no-underline ml-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-md"
          >
            Crear cuenta
          </Link>
        </div>

        <div className="mt-8 text-center text-[0.7rem] font-medium uppercase tracking-wide text-slate-500 sm:mt-10">
          © 2024 VIBRA SHOP. ELECTRIC EDITORIAL. TODOS LOS DERECHOS RESERVADOS.
        </div>
      </div>
    </AuthLayout>
  );
}
