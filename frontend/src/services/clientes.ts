import api from "./api";
import type { Client } from "../types";

export interface ClientCreate {
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  empresa?: string | null;
  activo?: boolean;
}

export const obtenerClientes = async (): Promise<Client[]> => {
  const response = await api.get<Client[]>("/clientes/");
  return response.data;
};

export const obtenerCliente = async (id: number): Promise<Client> => {
  const response = await api.get<Client>(`/clientes/${id}`);
  return response.data;
};

export const crearCliente = async (
  cliente: ClientCreate,
): Promise<Client> => {
  const response = await api.post<Client>("/clientes/", cliente);
  return response.data;
};