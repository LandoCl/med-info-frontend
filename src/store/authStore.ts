import { create } from "zustand";
import type { UsuarioClean } from "../types/user.types";
import * as authService from "../services/auth.service";

interface AuthState {
  user: UsuarioClean | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: authService.LoginCredentials) => Promise<void>;
  register: (userData: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  setProfile: (user: UsuarioClean) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Cargar token inicial si existe
  const storedToken = localStorage.getItem("qr_medico_token");
  const storedUser = localStorage.getItem("qr_medico_user");
  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
    isAuthenticated: !!storedToken,
    isLoading: false,
    error: null,
    login: async (credentials) => {
      set({ isLoading: true, error: null });
      try {
        const { user, token } = await authService.login(credentials);
        localStorage.setItem("qr_medico_token", token);
        localStorage.setItem("qr_medico_user", JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoading: false });
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        set({
          error:
            error.response?.data?.message || "Error en credenciales de acceso",
          isLoading: false,
        });
        throw err;
      }
    },
    register: async (userData) => {
      set({ isLoading: true, error: null });
      try {
        const { user, token } = await authService.register(userData);
        localStorage.setItem("qr_medico_token", token);
        localStorage.setItem("qr_medico_user", JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoading: false });
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        set({
          error:
            error.response?.data?.message || "Error al completar el registro",
          isLoading: false,
        });
        throw err;
      }
    },
    logout: () => {
      localStorage.removeItem("qr_medico_token");
      localStorage.removeItem("qr_medico_user");
      set({ user: null, token: null, isAuthenticated: false });
    },
    setProfile: (user) => {
      localStorage.setItem("qr_medico_user", JSON.stringify(user));
      set({ user });
    },
  };
});
