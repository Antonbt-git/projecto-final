import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Loader2 } from "lucide-react";

import Card from "../ui/Card";
import { getResumenCategorias } from "../../services/categorias";

interface Segmento {
  name: string;
  value: number;
}

// Respaldo (fallback) mientras el backend no responda, para que la
// gráfica nunca se vea vacía.
const RESPALDO: Segmento[] = [
  { name: "SOPORTE", value: 42 },
  { name: "VENTAS", value: 27 },
  { name: "RECLAMO", value: 18 },
  { name: "CONSULTA", value: 8 },
  { name: "FELICITACION", value: 5 },
];

export default function CategoryChart() {
  const [data, setData] = useState<Segmento[]>(RESPALDO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;

    getResumenCategorias()
      .then((categorias) => {
        const conDatos = categorias
          .filter((categoria) => categoria.total_comentarios > 0)
          .map((categoria) => ({
            name: categoria.nombre,
            value: categoria.total_comentarios,
          }));

        if (activo && conDatos.length > 0) setData(conDatos);
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
            Categorías NLP
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Distribución de comentarios clasificados
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
          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={55}
              paddingAngle={3}
              label
            >
              {data.map((item, index) => (
                <Cell
                  key={`${item.name}-${index}`}
                />
              ))}
            </Pie>

            <Tooltip />

          </PieChart>
        </ResponsiveContainer>

      </div>

    </Card>
  );
}
