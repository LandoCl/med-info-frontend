import api from "./api";
import type { UserSession } from "../types/user.types";

export interface LoginCredentials {
  email: string;
  password?: string;
}

export const login = async (
  credentials: LoginCredentials,
): Promise<UserSession> => {
  const response = await api.post("/auth/login", credentials);
  return response.data.data;
};
export const register = async (
  userData: Record<string, unknown>,
): Promise<UserSession> => {
  const response = await api.post("/auth/register", userData);
  return response.data.data;
};
