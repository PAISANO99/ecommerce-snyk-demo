export default function SocialButtons() {
  return (
    <section aria-labelledby="social-login-status" className="my-8">
      <div className="flex items-center text-slate-500 text-xs font-semibold uppercase tracking-wider before:content-[''] before:flex-1 before:h-px before:bg-slate-200 before:mr-4 after:content-[''] after:flex-1 after:h-px after:bg-slate-200 after:ml-4">
        O Continúa con
      </div>

      <p id="social-login-status" className="sr-only">
        El inicio de sesión con Google y Apple todavía no está disponible.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2" aria-hidden="true">
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-slate-100 py-3.5 text-[0.95rem] font-semibold text-slate-700">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google próximamente
        </div>
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-slate-100 py-3.5 text-[0.95rem] font-semibold text-slate-700">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.82 3.59-.75 2.15.11 3.53 1.14 4.3 2.16-3.75 2.04-3.14 6.83.65 8.16-.83 1.99-1.92 3.8-3.62 2.6zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.4-1.99 4.34-3.74 4.25z" />
          </svg>
          Apple próximamente
        </div>
      </div>

      <p className="mt-3 text-center text-sm text-slate-600">
        Por ahora podés ingresar con tu correo y contraseña.
      </p>
    </section>
  );
}
