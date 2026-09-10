import { useEffect, useMemo, useState } from "react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

import {
  Calculator,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  Clock,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import { calcularEstadisticas } from "../services/scipy";
import { getTiemposAtencion } from "../services/tiemposAtencion";
import type { AttentionTimeRecord, Statistics } from "../types";

const RANGOS = [
  { dias: 7, label: "Últimos 7 días" },
  { dias: 30, label: "Últimos 30 días" },
  { dias: 90, label: "Últimos 90 días" },
  { dias: 0, label: "Todos" },
];

export default function Metricas() {
  const [values, setValues] = useState(
    "12,15,18,20,11,25,19,17,14,21"
  );

  const [statistics, setStatistics] =
    useState<Statistics | null>(null);

  // Registros reales de la tabla `tiempos_atencion`.
  const [registros, setRegistros] = useState<AttentionTimeRecord[]>([]);
  const [cargandoRegistros, setCargandoRegistros] = useState(true);
  const [errorRegistros, setErrorRegistros] = useState(false);
  const [rangoDias, setRangoDias] = useState(30);

  useEffect(() => {
    let activo = true;

    setCargandoRegistros(true);
    setErrorRegistros(false);

    getTiemposAtencion()
      .then((data) => {
        if (activo) {
          // Más recientes primero.
          const ordenados = [...data].sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );
          setRegistros(ordenados);
        }
      })
      .catch(() => {
        if (activo) setErrorRegistros(true);
      })
      .finally(() => {
        if (activo) setCargandoRegistros(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const registrosFiltrados = useMemo(() => {
    if (rangoDias === 0) return registros;

    const limite = new Date();
    limite.setHours(0, 0, 0, 0);
    limite.setDate(limite.getDate() - (rangoDias - 1));

    return registros.filter((r) => new Date(r.fecha) >= limite);
  }, [registros, rangoDias]);

  const promedioFiltrado = useMemo(() => {
    if (registrosFiltrados.length === 0) return null;

    const suma = registrosFiltrados.reduce(
      (acc, r) => acc + Number(r.tiempo_minutos),
      0
    );

    return suma / registrosFiltrados.length;
  }, [registrosFiltrados]);

  function usarTiemposReales() {
    if (registrosFiltrados.length === 0) return;

    setValues(
      registrosFiltrados
        .map((r) => Number(r.tiempo_minutos))
        .join(",")
    );
  }

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

      {/* Tiempos reales guardados en la tabla `tiempos_atencion` */}
      <Card>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Clock className="text-blue-600" />

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Tiempos de atención registrados
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Datos reales guardados en la base de datos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
              value={rangoDias}
              onChange={(e) => setRangoDias(Number(e.target.value))}
            >
              {RANGOS.map((rango) => (
                <option key={rango.dias} value={rango.dias}>
                  {rango.label}
                </option>
              ))}
            </select>

            <Button
              variant="secondary"
              className="!px-3 !py-1.5 text-xs"
              disabled={registrosFiltrados.length === 0}
              onClick={usarTiemposReales}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} />
                Usar estos tiempos
              </span>
            </Button>
          </div>
        </div>

        {cargandoRegistros && (
          <p className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            Cargando registros...
          </p>
        )}

        {!cargandoRegistros && errorRegistros && (
          <p className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            <AlertCircle size={14} />
            No se pudo conectar con la base de datos para traer los tiempos
            de atención.
          </p>
        )}

        {!cargandoRegistros && !errorRegistros && registrosFiltrados.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            No hay registros de tiempos de atención en este rango.
          </p>
        )}

        {!cargandoRegistros && !errorRegistros && registrosFiltrados.length > 0 && (
          <>
            <div className="mb-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Registros:{" "}
                <strong className="text-slate-800 dark:text-white">
                  {registrosFiltrados.length}
                </strong>
              </span>

              {promedioFiltrado !== null && (
                <span>
                  Promedio:{" "}
                  <strong className="text-slate-800 dark:text-white">
                    {promedioFiltrado.toFixed(2)} min
                  </strong>
                </span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">Operador</th>
                    <th className="px-4 py-2 text-right">Tiempo (min)</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {registrosFiltrados.map((registro) => (
                    <tr key={registro.id}>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                        {new Date(registro.fecha).toLocaleDateString("es-PE")}
                      </td>

                      <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                        {registro.operador ?? "—"}
                      </td>

                      <td className="px-4 py-2 text-right font-medium text-slate-800 dark:text-white">
                        {Number(registro.tiempo_minutos).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

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
          className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:placeholder:text-slate-500"
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
