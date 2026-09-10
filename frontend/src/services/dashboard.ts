import api from "./api";
import type { DashboardSummary, DailyAttentionTime } from "../types";

/**
 * Números reales agregados directamente desde la base de datos
 * (Supabase): clientes, comentarios, porcentaje procesado y tiempo
 * promedio de atención. Alimenta las tarjetas KPI del dashboard.
 */
export async function getResumenDashboard(): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>("/dashboard/resumen");
  return response.data;
}

/**
 * Promedio diario del tiempo de atención de los últimos `dias` días,
 * calculado sobre los registros reales de `tiempos_atencion`.
 */
export async function getTiemposDiarios(
  dias = 7
): Promise<DailyAttentionTime[]> {
  const response = await api.get<DailyAttentionTime[]>(
    "/dashboard/tiempos-diarios",
    { params: { dias } }
  );
  return response.data;
}
