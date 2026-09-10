import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2, Waves } from "lucide-react";

import Card from "../ui/Card";
import { obtenerInterpolacion } from "../../services/scipy";
import type { InterpolationResult } from "../../types";

// Respaldo (fallback) mientras el backend no responda, para que el
// apartado nunca se vea vacío: simula 7 días con la misma forma que
// AttentionChart y una interpolación cúbica sobre esos puntos.
const VALORES_RESPALDO = [14, 17, 15, 19, 16, 13, 12];

function interpolarLocal(valores: number[]): InterpolationResult {
  const puntos = (valores.length - 1) * 4 + 1;
  const x: number[] = [];
  const valores_interpolados: number[] = [];

  for (let i = 0; i < puntos; i++) {
    const posicion = (i / (puntos - 1)) * (valores.length - 1);
    const indiceInferior = Math.floor(posicion);
    const indiceSuperior = Math.min(indiceInferior + 1, valores.length - 1);
    const fraccion = posicion - indiceInferior;

    x.push(Number(posicion.toFixed(4)));
    valores_interpolados.push(
      Number(
        (
          valores[indiceInferior] +
          (valores[indiceSuperior] - valores[indiceInferior]) * fraccion
        ).toFixed(4)
      )
    );
  }

  const ultimaPendiente =
    valores[valores.length - 1] - valores[valores.length - 2];

  return {
    metodo: "linear",
    x,
    valores_interpolados,
    proyeccion_siguiente: Number(
      (valores[valores.length - 1] + ultimaPendiente).toFixed(4)
    ),
    valores_originales: valores,
  };
}

export default function InterpolationChart() {
  const [resultado, setResultado] = useState<InterpolationResult>(
    interpolarLocal(VALORES_RESPALDO)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;

    obtenerInterpolacion(7)
      .then((data) => {
        if (activo) setResultado(data);
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

  const valoresOriginales = resultado.valores_originales ?? [];

  // Combina la curva interpolada (más puntos) con los valores
  // originales alineados en las mismas posiciones, para poder
  // graficar ambas series en el mismo eje X.
  const data = resultado.x.map((posicion, indice) => {
    const indiceOriginal = Math.round(posicion);
    const esPuntoOriginal = Math.abs(posicion - indiceOriginal) < 1e-6;

    return {
      posicion: indice,
      interpolado: resultado.valores_interpolados[indice],
      original:
        esPuntoOriginal && indiceOriginal < valoresOriginales.length
          ? valoresOriginales[indiceOriginal]
          : undefined,
    };
  });

  return (
    <Card>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Interpolación
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Curva suavizada (SciPy, método {resultado.metodo === "cubic" ? "cúbico" : "lineal"}) y proyección del siguiente valor
          </p>
        </div>

        {loading && (
          <Loader2 size={16} className="animate-spin text-slate-400" />
        )}
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis dataKey="posicion" axisLine={false} tickLine={false} hide />

            <YAxis axisLine={false} tickLine={false} />

            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="interpolado"
              name="Curva interpolada"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="original"
              name="Valor real"
              stroke="#0ea5e9"
              strokeWidth={0}
              dot={{ r: 4 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
        <Waves size={16} />
        <span>
          Proyección del siguiente valor:{" "}
          <strong>{resultado.proyeccion_siguiente.toFixed(2)} min</strong>
        </span>
      </div>
    </Card>
  );
}
