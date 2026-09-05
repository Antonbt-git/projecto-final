import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "blue" | "green" | "yellow" | "red" | "gray";
}

export default function Badge({
  children,
  variant = "gray",
}: BadgeProps) {
  const styles = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`
        inline-flex rounded-full
        px-2.5 py-1
        text-xs font-medium
        ${styles[variant]}
      `}
    >
      {children}
    </span>
  );
}