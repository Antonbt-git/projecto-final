import api from "./api";
import type { Comment, FrequentWord } from "../types";

export interface CreateCommentData {
  cliente_id?: number;
  contenido: string;
  canal?: string;
}

export async function getComentarios(): Promise<Comment[]> {
  const response = await api.get<Comment[]>("/comentarios");
  return response.data;
}

export async function getComentario(id: number): Promise<Comment> {
  const response = await api.get<Comment>(`/comentarios/${id}`);
  return response.data;
}

export async function createComentario(
  data: CreateCommentData
): Promise<Comment> {
  const response = await api.post<Comment>("/comentarios", data);
  return response.data;
}

export async function deleteComentario(id: number): Promise<void> {
  await api.delete(`/comentarios/${id}`);
}

/**
 * Ejercicio 4 — trae las palabras más frecuentes agregando el
 * contenido de todos los comentarios recientes (tokenización +
 * eliminación de stopwords + conteo, hecho en el backend con NLTK).
 * Es un endpoint público, pensado para alimentar la pantalla de
 * "términos frecuentes" del área de atención al cliente.
 */
export async function getKeywords(topN = 10): Promise<FrequentWord[]> {
  const response = await api.get<FrequentWord[]>("/comentarios/keywords", {
    params: { top_n: topN },
  });
  return response.data;
}