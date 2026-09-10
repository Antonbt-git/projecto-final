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
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <input
        className={`
          w-full rounded-lg border
          border-slate-300 dark:border-slate-700
          bg-white dark:bg-slate-800/60
          px-3 py-2
          text-sm
          text-slate-900 dark:text-white
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          outline-none
          transition
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-100 dark:focus:ring-blue-500/20
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