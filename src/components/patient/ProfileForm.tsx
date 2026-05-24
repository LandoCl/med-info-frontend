import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuthStore } from '../../store/authStore';
import * as patientService from '../../services/patient.service';

const profileSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido_paterno: z.string().min(1, 'El apellido paterno es obligatorio'),
  apellido_materno: z.string().optional().nullable(),
  fecha_nacimiento: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  sexo: z.enum(['masculino', 'femenino', 'otro']),
  curp: z.string().length(18, 'El CURP debe tener exactamente 18 caracteres').or(z.string().length(0)).optional().nullable(),
  telefono: z.string().min(10, 'Debe contener al menos 10 dígitos').max(15, 'Máximo 15 dígitos'),
  foto_url: z.string().url('URL de foto inválida').or(z.string().length(0)).optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileForm: React.FC = () => {
  const { user, setProfile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Formatear fecha para el input date
  const formatInitialDate = (dateStr: any) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nombre: user?.nombre || '',
      apellido_paterno: user?.apellido_paterno || '',
      apellido_materno: user?.apellido_materno || '',
      fecha_nacimiento: formatInitialDate(user?.fecha_nacimiento),
      sexo: user?.sexo || 'masculino',
      curp: user?.curp || '',
      telefono: user?.telefono || '',
      foto_url: user?.foto_url || '',
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    setAlert(null);
    try {
      // Limpiar campos vacíos opcionales antes de enviar
      const cleanedValues = {
        ...values,
        apellido_materno: values.apellido_materno || null,
        curp: values.curp || null,
        foto_url: values.foto_url || null,
      };

      const updated = await patientService.updateProfile(cleanedValues);
      setProfile(updated);
      setAlert({ type: 'success', message: 'Datos personales actualizados con éxito.' });
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Error al actualizar la información.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-2xl bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Información Personal</h3>
        <p className="text-xs text-slate-500">Actualiza tus datos de contacto y CURP necesarios para la identificación.</p>
      </div>

      {alert && (
        <div
          className={`p-4 rounded-lg text-sm font-medium ${
            alert.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-300 border border-rose-100 dark:border-rose-900/40'
          }`}
        >
          {alert.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre(s)"
          error={errors.nombre?.message}
          {...register('nombre')}
        />
        <Input
          label="Apellido Paterno"
          error={errors.apellido_paterno?.message}
          {...register('apellido_paterno')}
        />
        <Input
          label="Apellido Materno (Opcional)"
          error={errors.apellido_materno?.message}
          {...register('apellido_materno')}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sexo</label>
          <select
            className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            {...register('sexo')}
          >
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <Input
          label="Fecha de Nacimiento"
          type="date"
          error={errors.fecha_nacimiento?.message}
          {...register('fecha_nacimiento')}
        />
        <Input
          label="CURP (18 Caracteres)"
          error={errors.curp?.message}
          maxLength={18}
          {...register('curp')}
        />
        <Input
          label="Teléfono Móvil"
          placeholder="Ej: 4921234567"
          error={errors.telefono?.message}
          {...register('telefono')}
        />
        <Input
          label="URL Foto de Perfil (Opcional)"
          placeholder="https://ejemplo.com/foto.jpg"
          error={errors.foto_url?.message}
          {...register('foto_url')}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={isSubmitting}>
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
};
