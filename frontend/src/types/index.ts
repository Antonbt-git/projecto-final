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
  cliente_nombre?: string | null;
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

export type Sentimiento = "positivo" | "negativo" | "neutral";

export interface SentimentAnalysis {
  sentimiento: Sentimiento;
  puntaje: number;
  confianza: number;
  palabras_positivas: string[];
  palabras_negativas: string[];
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

export interface InterpolationResult {
  metodo: "linear" | "cubic";
  x: number[];
  valores_interpolados: number[];
  proyeccion_siguiente: number;
  fechas?: string[];
  valores_originales?: number[];
}

export interface Category {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  created_at: string;
}

export interface CategorySummary {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  total_comentarios: number;
  procesados: number;
  pendientes: number;
}

export interface DashboardData {
  clientes: number;
  comentarios: number;
  promedio: number;
  procesados: number;
}

export interface DashboardSummary {
  clientes: number;
  clientes_activos: number;
  comentarios: number;
  comentarios_procesados: number;
  comentarios_pendientes: number;
  porcentaje_procesados: number;
  tiempo_promedio_minutos: number;
}

export interface AttentionTimeRecord {
  id: number;
  cliente_id?: number | null;
  comentario_id?: number | null;
  tiempo_minutos: number;
  fecha: string;
  operador?: string | null;
  created_at: string;
}

export interface DailyAttentionTime {
  fecha: string;
  promedio_minutos: number;
  cantidad_registros: number;
}