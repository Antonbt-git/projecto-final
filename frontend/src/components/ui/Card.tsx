import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl
        border
        dark:border-slate-800
        bg-white dark:bg-slate-900
        p-5
        shadow-soft
        transition-colors

        dark:bg-slate-900

        ${className}
      `}
    >
      {children}
    </div>
  );
}