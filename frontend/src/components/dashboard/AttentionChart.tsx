import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

import Card from "../ui/Card";
import { getTiemposDiarios } from "../../services/dashboard";

interface PuntoGrafico {
  dia: string;
  tiempo: number;
}

// Respaldo (fallback) mientras el backend no responda, para que la
// gráfica nunca se vea vacía.
const RESPALDO: PuntoGrafico[] = [
  { dia: "Lun", tiempo: 14 },
  { dia: "Mar", tiempo: 17 },
  { dia: "Mié", tiempo: 15 },
  { dia: "Jue", tiempo: 19 },
  { dia: "Vie", tiempo: 16 },
  { dia: "Sáb", tiempo: 13 },
  { dia: "Dom", tiempo: 12 },
];

function formatearDia(fechaISO: string): string {
  const fecha = new Date(`${fechaISO}T00:00:00`);
  const etiqueta = fecha.toLocaleDateString("es-PE", { weekday: "short" });
  return etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1, 3);
}

export default function AttentionChart() {
  const [data, setData] = useState<PuntoGrafico[]>(RESPALDO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;

    getTiemposDiarios(7)
      .then((registros) => {
        if (activo && registros.length > 0) {
          setData(
            registros.map((registro) => ({
              dia: formatearDia(registro.fecha),
              tiempo: registro.promedio_minutos,
            }))
          );
        }
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
            Tiempos de atención
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Evolución del tiempo promedio durante la semana
          </p>
        </div>

        {loading && (
          <Loader2 size={16} className="animate-spin text-slate-400" />
        )}
      </div>

      <div className="h-72">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart data={data}>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="dia"
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="tiempo"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

    </Card>
  );
}
