export type UserRole =
  | "ADMIN"
  | "ANALISTA"
  | "SUPERVISOR"
  | "USUARIO";

export type CommentCategory =
  | "VENTAS"
  | "SOPORTE"
  | "RECLAMO"
  | "CONSULTA"
  | "FELICITACION"
  | "OTROS";

export type CommentStatus =
  | "pendiente"
  | "procesado"
  | "resuelto";

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  rostro_registrado: boolean;
}

export interface Client {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  activo: boolean;
  created_at?: string;
}

export interface Comment {
  id: number;
  cliente_id?: number | null;
  contenido: string;
  canal: string;
  estado: CommentStatus;
  categoria?: CommentCategory | null;
  fecha: string;
  procesado: boolean;
}

export interface NLPAnalysis {
  idioma: string;
  cantidad_palabras: number;
  tokens: string[];
  palabras_frecuentes: FrequentWord[];
  categoria: CommentCategory;
  confianza?: number;
}

export interface FrequentWord {
  palabra: string;
  frecuencia: number;
}

export interface Statistics {
  cantidad: number;
  media: number;
  mediana: number;
  desviacion_estandar: number;
  minimo: number;
  maximo: number;
  percentil_25?: number;
  percentil_75?: number;
}

export interface OptimizationResult {
  recurso_a: number;
  recurso_b: number;
  costo: number;
}

export interface DashboardData {
  clientes: number;
  comentarios: number;
  promedio: number;
  procesados: number;
}