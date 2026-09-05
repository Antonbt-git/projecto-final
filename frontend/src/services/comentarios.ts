import api from "./api";
import type { Comment } from "../types";

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