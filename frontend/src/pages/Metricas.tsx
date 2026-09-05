import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

import {
  Calculator,
  TrendingUp,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

import { useState } from "react";

import {
  calcularEstadisticas,
} from "../services/scipy";

import type { Statistics } from "../types";

export default function Metricas() {
  const [values, setValues] = useState(
    "12,15,18,20,11,25,19,17,14,21"
  );

  const [statistics, setStatistics] =
    useState<Statistics | null>(null);

  async function calculate() {
    const numbers = values
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => !Number.isNaN(value));

    if (!numbers.length) return;

    try {
      const result =
        await calcularEstadisticas(numbers);

      setStatistics(result);
    } catch {
      const sorted = [...numbers].sort(
        (a, b) => a - b
      );

      const mean =
        numbers.reduce(
          (sum, value) => sum + value,
          0
        ) / numbers.length;

      const median =
        sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] +
              sorted[sorted.length / 2]) /
            2
          : sorted[Math.floor(sorted.length / 2)];

      const variance =
        numbers.reduce(
          (sum, value) =>
            sum + Math.pow(value - mean, 2),
          0
        ) / numbers.length;

      setStatistics({
        cantidad: numbers.length,
        media: mean,
        mediana: median,
        desviacion_estandar: Math.sqrt(
          variance
        ),
        minimo: Math.min(...numbers),
        maximo: Math.max(...numbers),
      });
    }
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Métricas estadísticas
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Análisis científico de tiempos de atención
        </p>
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-3">
          <Calculator className="text-blue-600" />

          <h2 className="font-semibold">
            Valores
          </h2>
        </div>

        <textarea
          value={values}
          onChange={(e) => setValues(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
        />

        <div className="mt-4">
          <Button onClick={calculate}>
            Calcular estadísticas
          </Button>
        </div>
      </Card>

      {statistics && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          <Card>
            <TrendingUp className="text-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              Media
            </p>

            <p className="text-2xl font-bold">
              {statistics.media.toFixed(2)}
            </p>
          </Card>

          <Card>
            <Calculator className="text-purple-600" />

            <p className="mt-4 text-sm text-slate-500">
              Mediana
            </p>

            <p className="text-2xl font-bold">
              {statistics.mediana.toFixed(2)}
            </p>
          </Card>

          <Card>
            <TrendingUp className="text-orange-600" />

            <p className="mt-4 text-sm text-slate-500">
              Desviación estándar
            </p>

            <p className="text-2xl font-bold">
              {statistics.desviacion_estandar.toFixed(2)}
            </p>
          </Card>

          <Card>
            <ArrowDown className="text-green-600" />

            <p className="mt-4 text-sm text-slate-500">
              Mínimo
            </p>

            <p className="text-2xl font-bold">
              {statistics.minimo}
            </p>
          </Card>

          <Card>
            <ArrowUp className="text-red-600" />

            <p className="mt-4 text-sm text-slate-500">
              Máximo
            </p>

            <p className="text-2xl font-bold">
              {statistics.maximo}
            </p>
          </Card>

          <Card>
            <Calculator className="text-slate-600" />

            <p className="mt-4 text-sm text-slate-500">
              Cantidad
            </p>

            <p className="text-2xl font-bold">
              {statistics.cantidad}
            </p>
          </Card>

        </div>
      )}

    </div>
  );
}