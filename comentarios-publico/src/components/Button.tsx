import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:-translate-y-px",
    secondary:
      "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)] hover:-translate-y-px",
  };

  return (
    <button
      className={`
        min-h-[50px] rounded-xl px-4 py-2 text-sm font-extrabold
        transition duration-150
        disabled:cursor-wait disabled:opacity-65 disabled:translate-y-0
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
