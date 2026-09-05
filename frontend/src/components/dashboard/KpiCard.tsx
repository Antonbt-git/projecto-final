import type { LucideIcon } from "lucide-react";

import Card from "../ui/Card";

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
}

export default function KpiCard({
  title,
  value,
  description,
  icon: Icon,
}: KpiCardProps) {
  return (
    <Card className="group relative overflow-hidden">

      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/5 transition group-hover:scale-150" />

      <div className="relative flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>

          {description && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:scale-105 dark:bg-blue-500/10 dark:text-blue-400">
          <Icon size={21} />
        </div>

      </div>

    </Card>
  );
}