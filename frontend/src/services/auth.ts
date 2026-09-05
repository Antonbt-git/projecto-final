import api from "./api";
import type { User } from "../types";

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    {
      email,
      password,
    }
  );

  localStorage.setItem(
    "access_token",
    response.data.access_token
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
