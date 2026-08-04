interface FormMessageProps {
  type: "error" | "success";
  message: string;
}

export default function FormMessage({ type, message }: FormMessageProps) {
  if (!message) return null;

  const baseStyle =
    "p-3.5 px-4 rounded-xl mb-6 font-semibold text-[0.9rem] border";

  if (type === "error") {
    return (
      <div
        className={`${baseStyle} bg-red-50 text-red-800 border-red-200`}
        role="alert"
      >
        {message}
      </div>
    );
  }

  return (
    <div
      className={`${baseStyle} bg-green-50 text-green-800 border-green-200`}
      role="alert"
    >
      {message}
    </div>
  );
}
