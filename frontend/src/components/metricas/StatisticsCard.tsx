import type { LucideIcon } from "lucide-react";

interface StatisticsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "blue" | "purple" | "orange" | "green" | "red" | "slate";
}

const ACCENTS = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400",
};

export default function StatisticsCard({
  label,
  value,
  icon: Icon,
  accent = "blue",
}: StatisticsCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${ACCENTS[accent]}`}>
        <Icon size={17} />
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
