import React from "react";

interface AuthInputProps {
  id: string;
  label?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  placeholder: string;
  error?: string;
  touched: boolean;
  icon: React.ReactNode;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  autoComplete?: string;
  ariaDescribedBy?: string;
}

const inputBase =
  "w-full bg-violet-100 border border-transparent rounded-xl py-4 pr-4 pl-11 text-[0.95rem] text-slate-800 outline-none font-medium transition-all duration-200 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
const inputError = "border-red-500 bg-red-50";
const inputSuccess = "border-green-500 bg-green-50";

export default function AuthInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
  icon,
  showPassword,
  onTogglePassword,
  autoComplete,
  ariaDescribedBy,
}: AuthInputProps) {
  const state = touched ? (error ? "error" : "success") : "";
  const inputClass = `${inputBase} ${
    state === "error"
      ? inputError
      : state === "success"
        ? inputSuccess
        : ""
  }`;

  const isPasswordType = type === "password";
  const inputType = isPasswordType && showPassword ? "text" : type;

  return (
    <div className="mb-5 relative">
      {label && (
        <label
          className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <span className="absolute left-4 text-slate-500 flex pointer-events-none" aria-hidden="true">
          {icon}
        </span>
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={inputClass}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-describedby={ariaDescribedBy}
          aria-invalid={!!error && touched}
        />
        {isPasswordType && onTogglePassword && (
          <button
            type="button"
            className="absolute right-4 bg-transparent border-none text-slate-500 cursor-pointer flex p-1 rounded-full hover:bg-black/5"
            onClick={onTogglePassword}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && touched && (
        <span
          id={ariaDescribedBy}
          className="block text-red-500 text-sm mt-1.5 font-medium"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}
