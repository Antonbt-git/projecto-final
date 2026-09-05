import type {
  InputHTMLAttributes,
} from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <input
        className={`
          w-full rounded-lg border
          border-slate-300
          bg-white
          px-3 py-2
          text-sm
          outline-none
          transition
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-100
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}