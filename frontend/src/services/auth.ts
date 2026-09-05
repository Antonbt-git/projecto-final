import api from "./api";
import type { User } from "../types";

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface LoginInitResponse {
  requiere_2fa: boolean;
  email: string;
  mensaje: string;
}

export async function login(
  email: string,
  password: string
): Promise<LoginInitResponse> {
  const response = await api.post<LoginInitResponse>(
    "/auth/login",
    {
      email,
      password,
    }
  );

  return response.data;
}

export async function loginFacial(
  email: string,
  rostroImagen: string
): Promise<LoginInitResponse> {
  const response = await api.post<LoginInitResponse>(
    "/auth/login-facial",
    {
      email,
      rostro_imagen: rostroImagen,
    }
  );

  return response.data;
}

export async function verifyTwoFactorCode(
  email: string,
  codigo: string
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/auth/verify-2fa",
    {
      email,
      codigo,
    }
  );

  localStorage.setItem(
    "access_token",
    response.data.access_token
  );

  return response.data;
}

export async function resendTwoFactorCode(
  email: string
): Promise<LoginInitResponse> {
  const response = await api.post<LoginInitResponse>(
    "/auth/resend-2fa",
    {
      email,
    }
  );

  return response.data;
}

export interface RegistroInfo {
  nombre: string;
  email: string;
  password: string;
  // Foto del rostro capturada con la cámara, en formato Data URL
  // (data:image/jpeg;base64,...).
  rostro_imagen: string;
}

export interface RegistroInitResponse {
  email: string;
  mensaje: string;
}

export async function registrarAdministrador(
  datos: RegistroInfo
): Promise<RegistroInitResponse> {
  const response = await api.post<RegistroInitResponse>(
    "/auth/register",
    {
      nombre: datos.nombre,
      email: datos.email,
      password: datos.password,
      rostro_imagen: datos.rostro_imagen,
    }
  );

  return response.data;
}

export async function verificarTokenRegistro(
  email: string,
  codigo: string
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/auth/verify-register",
    {
      email,
      codigo,
    }
  );

  localStorage.setItem(
    "access_token",
    response.data.access_token
  );

  return response.data;
}

export async function reenviarTokenRegistro(
  email: string
): Promise<RegistroInitResponse> {
  const response = await api.post<RegistroInitResponse>(
    "/auth/resend-register",
    {
      email,
    }
  );

  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>("/auth/me");

  return response.data;
}

export function logout(): void {
  localStorage.removeItem("access_token");
}

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem("access_token"));
}
