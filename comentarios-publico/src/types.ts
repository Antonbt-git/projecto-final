export type CommentCategory =
  | "VENTAS"
  | "SOPORTE"
  | "RECLAMO"
  | "CONSULTA"
  | "FELICITACION"
  | "OTROS";

export interface Comment {
  id: number;
  cliente_id?: number | null;
  cliente_nombre?: string | null;
  contenido: string;
  canal: string;
  estado: string;
  categoria?: CommentCategory | null;
  fecha: string;
  procesado: boolean;
}

export interface Client {
  id: number;
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  empresa?: string | null;
  activo: boolean;
}
