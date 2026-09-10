import api from "./api";
import type { AttentionTimeRecord } from "../types";

export interface AttentionTimeCreate {
  cliente_id?: number | null;
  comentario_id?: number | null;
  tiempo_minutos: number;
  fecha?: string;
  operador?: string | null;
}

/**
 * Trae los registros guardados en la tabla `tiempos_atencion` de la
 * base de datos. Si se pasan `fechaInicio`/`fechaFin` (formato
 * "YYYY-MM-DD"), el backend filtra directamente en la consulta SQL;
 * si no, devuelve todos los registros.
 */
export async function getTiemposAtencion(
  fechaInicio?: string,
  fechaFin?: string
): Promise<AttentionTimeRecord[]> {
  const response = await api.get<AttentionTimeRecord[]>("/tiempos-atencion/", {
    params: {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    },
  });

  return response.data;
}

export async function crearTiempoAtencion(
  data: AttentionTimeCreate
): Promise<AttentionTimeRecord> {
  const response = await api.post<AttentionTimeRecord>(
    "/tiempos-atencion/",
    data
  );

  return response.data;
}
