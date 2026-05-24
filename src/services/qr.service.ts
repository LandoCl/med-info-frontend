import api from "./api";
import type { FichaMedicaCompleta } from "../types/medical.types";

export const getMedicalSheet = async (
  token: string,
): Promise<FichaMedicaCompleta> => {
  const response = await api.get(`/qr/sheet/${token}`);
  return response.data.data;
};

export const regenerateQR = async (): Promise<{ qr_token: string }> => {
  const response = await api.post("/qr/regenerate");
  return response.data.data;
};
