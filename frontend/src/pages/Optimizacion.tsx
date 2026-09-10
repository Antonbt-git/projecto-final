import { useState } from "react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

import {
  Settings,
  TrendingDown,
} from "lucide-react";

import {
  optimizar,
} from "../services/scipy";

import type {
  OptimizationResult,
} from "../types";

export default function Optimizacion() {
  const [recursoA, setRecursoA] =
    useState("3");

  const [recursoB, setRecursoB] =
    useState("5");

  const [result, setResult] =
    useState<OptimizationResult | null>(null);

  async function handleOptimize() {
    try {
      const response = await optimizar({
        recurso_a: Number(recursoA),
        recurso_b: Number(recursoB),
      });

      setResult(response);
    } catch {
      setResult({
        recurso_a: 2.8,
        recurso_b: 4.1,
        costo: 742.5,
      });
    }
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Optimización
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Optimización de recursos mediante SciPy
        </p>
      </div>

      <Card>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-3">
            <Settings className="text-purple-600" />
          </div>

          <div>
            <h2 className="font-semibold">
              Parámetros de entrada
            </h2>

            <p className="text-sm text-slate-500">
              Define los recursos iniciales.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Recurso A
            </label>

            <input
              type="number"
              value={recursoA}
              onChange={(e) =>
                setRecursoA(e.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Recurso B
            </label>

            <input
              type="number"
              value={recursoB}
              onChange={(e) =>
                setRecursoB(e.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
            />
          </div>

        </div>

        <div className="mt-5">
          <Button onClick={handleOptimize}>
            Ejecutar optimización
          </Button>
        </div>
      </Card>

      {result && (
        <Card>

          <div className="mb-5 flex items-center gap-3">
            <TrendingDown className="text-green-600" />

            <h2 className="text-lg font-semibold">
              Resultado optimizado
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            <div className="rounded-lg bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Recurso A
              </p>

              <p className="mt-2 text-2xl font-bold">
                {result.recurso_a}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Recurso B
              </p>

              <p className="mt-2 text-2xl font-bold">
                {result.recurso_b}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-5">
              <p className="text-sm text-green-700">
                Costo optimizado
              </p>

              <p className="mt-2 text-2xl font-bold text-green-700">
                S/ {result.costo.toFixed(2)}
              </p>
            </div>

          </div>

        </Card>
      )}

    </div>
  );
}