import {
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";

import KpiCard from "../components/dashboard/KpiCard";
import AttentionChart from "../components/dashboard/AttentionChart";
import CategoryChart from "../components/dashboard/CategoryChart";
import FrequentWords from "../components/dashboard/FrequentWords";

export default function Dashboard() {
  return (
    <div className="space-y-7">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

        <div>
          <p className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            Resumen general
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Visualiza el estado general de tu operación empresarial.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Actualizado hoy
        </div>

      </div>

      {/* KPIs */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <KpiCard
          title="Clientes"
          value="245"
          description="Clientes registrados"
          icon={Users}
        />

        <KpiCard
          title="Comentarios"
          value="1,248"
          description="Comentarios recibidos"
          icon={MessageSquare}
        />

        <KpiCard
          title="Tiempo promedio"
          value="16.4 min"
          description="Tiempo de atención"
          icon={Clock}
        />

        <KpiCard
          title="Procesados"
          value="94%"
          description="Comentarios analizados"
          icon={CheckCircle}
        />

      </div>

      {/* GRÁFICOS */}
      <div className="grid gap-5 xl:grid-cols-2">

        <AttentionChart />

        <CategoryChart />

      </div>

      {/* PALABRAS */}
      <FrequentWords />

      {/* RESUMEN */}
      <div className="grid gap-5 lg:grid-cols-3">

        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-blue-100">
                Inteligencia empresarial
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Análisis NLP activo
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                El sistema está preparado para analizar,
                clasificar y procesar los comentarios
                recibidos por los clientes.
              </p>
            </div>

            <div className="rounded-xl bg-white/10 p-3">
              <ArrowUpRight size={21} />
            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Estado del sistema
          </p>

          <div className="mt-4 flex items-center gap-3">

            <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30" />

            <span className="font-semibold text-slate-800 dark:text-white">
              Operativo
            </span>

          </div>

          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Todos los módulos principales están disponibles.
          </p>

        </div>

      </div>

    </div>
  );
}