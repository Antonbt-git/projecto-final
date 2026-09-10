import api from "./api";
import type { Category, CategorySummary } from "../types";

/**
 * Trae las categorías guardadas en la tabla `categorias` de la base
 * de datos (VENTAS, SOPORTE, RECLAMO, CONSULTA, FELICITACION, OTROS,
 * o cualquier otra que se agregue), en vez de tener la lista fija en
 * el frontend.
 */
export async function getCategorias(
  soloActivas = true
): Promise<Category[]> {
  const response = await api.get<Category[]>("/categorias", {
    params: soloActivas ? { activo: true } : undefined,
  });

  return response.data;
}

/**
 * Igual que `getCategorias`, pero además trae, por cada categoría,
 * cuántos comentarios tiene asociados (total, procesados y
 * pendientes). Alimenta el apartado "Comentarios por categoría".
 */
export async function getResumenCategorias(): Promise<CategorySummary[]> {
  const response = await api.get<CategorySummary[]>("/categorias/resumen");
  return response.data;
}
