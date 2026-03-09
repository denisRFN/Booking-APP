import { apiClient } from "./apiClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<{ access_token: string }>("/auth/login", payload);
  localStorage.setItem("access_token", data.access_token);
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
}

export function logout() {
  localStorage.removeItem("access_token");
}

