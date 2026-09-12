import api from "./api";
import type { Client } from "../types";

export interface ClientCreate {
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  empresa?: string | null;
}

/**
 * POST /api/clientes — también público en el backend. Se usa para
 * registrar al cliente que deja el comentario (si comparte su
 * nombre o correo) y así poder asociar el comentario a su ficha.
 */
export async function crearCliente(cliente: ClientCreate): Promise<Client> {
  const response = await api.post<Client>("/clientes/", cliente);
  return response.data;
}
