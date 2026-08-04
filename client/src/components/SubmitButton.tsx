interface SubmitButtonProps {
  id: string;
  disabled: boolean;
  isSubmitting: boolean;
  label: string;
}

export default function SubmitButton({
  id,
  disabled,
  isSubmitting,
  label,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      id={id}
      className="w-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none rounded-xl py-4 text-base font-semibold cursor-pointer transition-all duration-200 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 active:enabled:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
      disabled={disabled}
    >
      {isSubmitting ? (
        label.split(" ")[0] + "..."
      ) : (
        <>
          {label}
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
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </>
      )}
    </button>
  );
}
