import api from "./api";
import type {
  Statistics,
  OptimizationResult,
  InterpolationResult,
} from "../types";

export async function obtenerEstadisticas(
  dias = 30
): Promise<Statistics> {
  const response = await api.get<Statistics>(
    "/scipy/estadisticas",
    { params: { dias } }
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

export async function obtenerInterpolacion(
  dias = 7
): Promise<InterpolationResult> {
  const response = await api.get<InterpolationResult>(
    "/scipy/interpolacion",
    { params: { dias } }
  );

  return response.data;
}

export async function calcularInterpolacion(
  valores: number[]
): Promise<InterpolationResult> {
  const response = await api.post<InterpolationResult>(
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