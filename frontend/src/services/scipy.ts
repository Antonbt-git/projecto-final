import api from "./api";
import type {
  Statistics,
  OptimizationResult,
} from "../types";

export async function obtenerEstadisticas(): Promise<Statistics> {
  const response = await api.get<Statistics>(
    "/scipy/estadisticas"
  );

  return response.data;
}

export async function calcularEstadisticas(
  valores: number[]
): Promise<Statistics> {
  const response = await api.post<Statistics>(
    "/scipy/estadisticas",
    {
      valores,
    }
  );

  return response.data;
}

export async function calcularInterpolacion(
  valores: number[]
) {
  const response = await api.post(
    "/scipy/interpolacion",
    {
      valores,
    }
  );

  return response.data;
}

export async function optimizar(
  parametros: Record<string, number>
): Promise<OptimizationResult> {
  const response = await api.post<OptimizationResult>(
    "/scipy/optimizacion",
    parametros
  );

  return response.data;
}