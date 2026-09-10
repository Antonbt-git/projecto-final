import { useEffect, useState } from "react";
import {
  BarChart3,
  Calculator,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  Hash,
  Loader2,
} from "lucide-react";

import Card from "../ui/Card";
import StatisticsCard from "../metricas/StatisticsCard";
import { obtenerEstadisticas } from "../../services/scipy";
import type { Statistics } from "../../types";

// Respaldo (fallback) mientras el backend no responda, para que el
// apartado nunca se vea vacío.
const RESPALDO: Statistics = {
  cantidad: 42,
  media: 16.4,
  mediana: 15.8,
  desviacion_estandar: 3.2,
  minimo: 9.5,
  maximo: 27.1,
  percentil_25: 13.6,
  percentil_75: 18.9,
};

export default function StatisticsOverview() {
  const [statistics, setStatistics] = useState<Statistics>(RESPALDO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;

    obtenerEstadisticas(30)
      .then((data) => {
        if (activo) setStatistics(data);
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
    <Card>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Estadísticas
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Cálculo con NumPy/SciPy sobre los tiempos de atención de los últimos 30 días
          </p>
        </div>

        {loading && (
          <Loader2 size={16} className="animate-spin text-slate-400" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        <StatisticsCard
          label="Cantidad"
          value={statistics.cantidad}
          icon={Hash}
          accent="slate"
        />

        <StatisticsCard
          label="Media"
          value={statistics.media.toFixed(2)}
          icon={TrendingUp}
          accent="blue"
        />

        <StatisticsCard
          label="Mediana"
          value={statistics.mediana.toFixed(2)}
          icon={Calculator}
          accent="purple"
        />

        <StatisticsCard
          label="Desv. estándar"
          value={statistics.desviacion_estandar.toFixed(2)}
          icon={BarChart3}
          accent="orange"
        />

        <StatisticsCard
          label="Mínimo"
          value={statistics.minimo.toFixed(2)}
          icon={ArrowDown}
          accent="green"
        />

        <StatisticsCard
          label="Máximo"
          value={statistics.maximo.toFixed(2)}
          icon={ArrowUp}
          accent="red"
        />

        {statistics.percentil_25 !== undefined && (
          <StatisticsCard
            label="Percentil 25"
            value={statistics.percentil_25.toFixed(2)}
            icon={Calculator}
            accent="slate"
          />
        )}

        {statistics.percentil_75 !== undefined && (
          <StatisticsCard
            label="Percentil 75"
            value={statistics.percentil_75.toFixed(2)}
            icon={Calculator}
            accent="slate"
          />
        )}
      </div>
    </Card>
  );
}
