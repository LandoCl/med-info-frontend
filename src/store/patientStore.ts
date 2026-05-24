import { create } from "zustand";
import type {
  DatosMedicos,
  CondicionesEspeciales,
  ContactoEmergencia,
} from "../types/medical.types";

type DatosMedicosInput = Omit<DatosMedicos, "id" | "usuario_id" | "updated_at">;
type CondicionesEspecialesInput = Omit<
  CondicionesEspeciales,
  "id" | "usuario_id" | "updated_at"
>;
type ContactoEmergenciaInput = Omit<
  ContactoEmergencia,
  "id" | "usuario_id" | "created_at"
>;
type ContactoEmergenciaUpdate = Partial<ContactoEmergenciaInput>;
import * as patientService from "../services/patient.service";

interface PatientState {
  medicalData: DatosMedicos | null;
  conditions: CondicionesEspeciales | null;
  contacts: ContactoEmergencia[];
  isLoading: boolean;
  error: string | null;
  fetchMedicalInfo: () => Promise<void>;
  saveMedicalInfo: (data: DatosMedicosInput) => Promise<void>;
  saveConditionsInfo: (data: CondicionesEspecialesInput) => Promise<void>;
  addContact: (data: ContactoEmergenciaInput) => Promise<void>;
  updateContact: (id: string, data: ContactoEmergenciaUpdate) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  medicalData: null,
  conditions: null,
  contacts: [],
  isLoading: false,
  error: null,

  fetchMedicalInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const [medicalData, conditions, contacts] = await Promise.all([
        patientService.getMedicalData(),
        patientService.getConditions(),
        patientService.getContacts(),
      ]);
      set({ medicalData, conditions, contacts, isLoading: false });
    } catch (err: unknown) {
      console.log(err);
      set({
        error: "Error al recuperar información del expediente",
        isLoading: false,
      });
    }
  },

  saveMedicalInfo: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const medicalData = await patientService.saveMedicalData(data);
      set({ medicalData, isLoading: false });
    } catch (err: unknown) {
      set({ error: "Error al guardar expediente médico", isLoading: false });
      throw err;
    }
  },

  saveConditionsInfo: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const conditions = await patientService.saveConditions(data);
      set({ conditions, isLoading: false });
    } catch (err: unknown) {
      set({
        error: "Error al guardar condiciones especiales",
        isLoading: false,
      });
      throw err;
    }
  },

  addContact: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const contact = await patientService.createContact(data);
      const contacts = get().contacts;
      // Si el contacto nuevo es el principal, desactivar anteriores en estado local
      const updatedContacts = data.es_principal
        ? contacts.map((c) => ({ ...c, es_principal: false })).concat(contact)
        : [...contacts, contact];
      set({ contacts: updatedContacts, isLoading: false });
    } catch (err: unknown) {
      set({ error: "Error al agregar contacto", isLoading: false });
      throw err;
    }
  },

  updateContact: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedContact = await patientService.updateContact(id, data);
      const contacts = get().contacts;
      const updatedContacts = contacts.map((c) => {
        if (c.id === id) return updatedContact;
        if (data.es_principal) return { ...c, es_principal: false };
        return c;
      });
      set({ contacts: updatedContacts, isLoading: false });
    } catch (err: unknown) {
      set({ error: "Error al actualizar contacto", isLoading: false });
      throw err;
    }
  },

  removeContact: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await patientService.deleteContact(id);
      const contacts = get().contacts.filter((c) => c.id !== id);
      set({ contacts, isLoading: false });
    } catch (err: unknown) {
      set({ error: "Error al eliminar contacto", isLoading: false });
      throw err;
    }
  },
}));
