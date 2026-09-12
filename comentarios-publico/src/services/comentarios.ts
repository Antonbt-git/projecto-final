import api from "./api";
import type { Comment } from "../types";

export interface CreateCommentData {
  cliente_id?: number;
  contenido: string;
  canal?: string;
}

/**
 * POST /api/comentarios — endpoint PÚBLICO del backend (no requiere
 * login). Apenas el backend recibe el comentario, ejecuta el
 * análisis NLP automáticamente y lo guarda en la base de datos
 * (tablas `comentarios` y `analisis_nlp`). Por eso el comentario
 * enviado desde este formulario aparece de inmediato en la pantalla
 * de Análisis NLP del panel administrativo.
 */
export async function createComentario(
  data: CreateCommentData
): Promise<Comment> {
  const response = await api.post<Comment>("/comentarios", data);
  return response.data;
}
