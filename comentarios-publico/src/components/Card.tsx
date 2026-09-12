import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`
        rounded-[22px] border
        border-[var(--border)] bg-[var(--surface)]
        p-6 sm:p-8
        shadow-[var(--shadow)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
