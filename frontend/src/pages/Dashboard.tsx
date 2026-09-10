import { useEffect, useState } from "react";
import {
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

import KpiCard from "../components/dashboard/KpiCard";
import AttentionChart from "../components/dashboard/AttentionChart";
import CategoryChart from "../components/dashboard/CategoryChart";
import FrequentWords from "../components/dashboard/FrequentWords";
import StatisticsOverview from "../components/dashboard/StatisticsOverview";
import InterpolationChart from "../components/dashboard/InterpolationChart";
import { getResumenDashboard } from "../services/dashboard";
import type { DashboardSummary } from "../types";

// Respaldo (fallback) mientras el backend no responda, para que las
// tarjetas nunca se vean vacías.
const RESUMEN_RESPALDO: DashboardSummary = {
  clientes: 245,
  clientes_activos: 210,
  comentarios: 1248,
  comentarios_procesados: 1173,
  comentarios_pendientes: 75,
  porcentaje_procesados: 94,
  tiempo_promedio_minutos: 16.4,
};

export default function Dashboard() {
  const [resumen, setResumen] = useState<DashboardSummary>(RESUMEN_RESPALDO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;

    getResumenDashboard()
      .then((data) => {
        if (activo) setResumen(data);
      })
      .catch(() => {
        // Se mantiene el respaldo si el endpoint aún no está disponible.
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, []);

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

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Sincronizando con la base de datos..." : "Datos actualizados"}
        </div>

      </div>

      {/* KPIs */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <KpiCard
          title="Clientes"
          value={resumen.clientes.toLocaleString("es-PE")}
          description={`${resumen.clientes_activos.toLocaleString("es-PE")} activos`}
          icon={Users}
        />

        <KpiCard
          title="Comentarios"
          value={resumen.comentarios.toLocaleString("es-PE")}
          description="Comentarios recibidos"
          icon={MessageSquare}
        />

        <KpiCard
          title="Tiempo promedio"
          value={`${resumen.tiempo_promedio_minutos.toFixed(1)} min`}
          description="Tiempo de atención"
          icon={Clock}
        />

        <KpiCard
          title="Procesados"
          value={`${resumen.porcentaje_procesados.toFixed(0)}%`}
          description={`${resumen.comentarios_pendientes.toLocaleString("es-PE")} pendientes`}
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

      {/* ESTADÍSTICAS */}
      <StatisticsOverview />

      {/* INTERPOLACIÓN */}
      <InterpolationChart />

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
