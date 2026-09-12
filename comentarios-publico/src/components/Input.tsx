import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
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
    <label className="grid gap-2">
      {label && (
        <span className="text-[0.86rem] font-bold text-[var(--text)]">
          {label}
        </span>
      )}

      <input
        className={`
          w-full rounded-xl border px-3.5 py-3 text-sm
          outline-none transition
          border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)]
          placeholder:text-[var(--muted)] placeholder:opacity-80
          focus:border-[var(--accent)] focus:bg-[var(--surface)]
          focus:ring-4 focus:ring-[var(--accent-soft)]
          ${error ? "border-[var(--danger)]" : ""}
          ${className}
        `}
        {...props}
      />

      {error && (
        <span className="text-xs text-[var(--danger)]">{error}</span>
      )}
    </label>
  );
}
