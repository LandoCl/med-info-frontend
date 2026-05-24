import api from "./api";
import type {
  DatosMedicos,
  CondicionesEspeciales,
  ContactoEmergencia,
} from "../types/medical.types";
import type { UsuarioClean } from "../types/user.types";
export const getProfile = async (): Promise<UsuarioClean> => {
  const response = await api.get("/patient/profile");
  return response.data.data;
};
export const updateProfile = async (
  data: Partial<UsuarioClean>,
): Promise<UsuarioClean> => {
  const response = await api.put("/patient/profile", data);
  return response.data.data;
};
export const getMedicalData = async (): Promise<DatosMedicos | null> => {
  const response = await api.get("/patient/medical");
  return response.data.data;
};
export const saveMedicalData = async (
  data: Partial<DatosMedicos>,
): Promise<DatosMedicos> => {
  const response = await api.put("/patient/medical", data);
  return response.data.data;
};
export const getConditions =
  async (): Promise<CondicionesEspeciales | null> => {
    const response = await api.get("/patient/conditions");
    return response.data.data;
  };
export const saveConditions = async (
  data: Partial<CondicionesEspeciales>,
): Promise<CondicionesEspeciales> => {
  const response = await api.put("/patient/conditions", data);
  return response.data.data;
};
export const getContacts = async (): Promise<ContactoEmergencia[]> => {
  const response = await api.get("/patient/contacts");
  return response.data.data;
};
export const createContact = async (
  data: Partial<ContactoEmergencia>,
): Promise<ContactoEmergencia> => {
  const response = await api.post("/patient/contacts", data);
  return response.data.data;
};
export const updateContact = async (
  id: string,
  data: Partial<ContactoEmergencia>,
): Promise<ContactoEmergencia> => {
  const response = await api.put(`/patient/contacts/${id}`, data);
  return response.data.data;
};
export const deleteContact = async (id: string): Promise<void> => {
  await api.delete(`/patient/contacts/${id}`);
};
