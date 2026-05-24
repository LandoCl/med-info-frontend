import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuthStore } from '../../store/authStore';
import * as patientService from '../../services/patient.service';
import { User, Camera } from 'lucide-react';

const profileSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido_paterno: z.string().min(1, 'El apellido paterno es obligatorio'),
  apellido_materno: z.string().optional().nullable(),
  fecha_nacimiento: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  sexo: z.enum(['masculino', 'femenino', 'otro']),
  curp: z.string().length(18, 'El CURP debe tener exactamente 18 caracteres').or(z.string().length(0)).optional().nullable(),
  telefono: z.string().min(10, 'Debe contener al menos 10 dígitos').max(15, 'Máximo 15 dígitos'),
  foto_url: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileForm: React.FC = () => {
  const { user, setProfile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.foto_url || null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatear fecha para el input date
  const formatInitialDate = (dateStr: any) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
  };

  const {
    register,
    handleSubmit,
    setValue,
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

  // Mantener actualizado el preview de la foto si cambia el usuario global
  useEffect(() => {
    if (user?.foto_url) {
      setPhotoPreview(user.foto_url);
    }
  }, [user]);

  // Función para comprimir y redimensionar la imagen seleccionada a 300x300 en base64
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 300; // 300x300 es ideal para fotos de perfil
          let width = img.width;
          let height = img.height;

          // Calcular proporciones manteniendo el aspecto
          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Convertir a JPEG con compresión del 70%
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
        img.onerror = (err) => reject(err);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressImage(file);
      setPhotoPreview(compressedBase64);
      setValue('foto_url', compressedBase64, { shouldDirty: true });
    } catch (err) {
      console.error('Error al procesar la foto:', err);
      setAlert({ type: 'error', message: 'No se pudo procesar la imagen seleccionada.' });
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setValue('foto_url', null, { shouldDirty: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

      {/* ÁREA DE FOTO DE PERFIL */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-purple-500 overflow-hidden flex items-center justify-center shrink-0">
          {photoPreview ? (
            <img src={photoPreview} alt="Foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <User size={36} className="text-slate-400 dark:text-slate-500" />
          )}
        </div>
        <div className="flex flex-col gap-2 items-center sm:items-start text-center sm:text-left">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Foto de Perfil</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<Camera size={14} />}
              className="py-1.5 px-3 text-xs"
            >
              Cargar/Tomar Foto
            </Button>
            {photoPreview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs py-1.5 px-3 font-semibold"
                onClick={handleRemovePhoto}
              >
                Eliminar
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />
          <span className="text-[10px] text-slate-400">Captura desde tu cámara o sube un archivo. Se optimizará automáticamente.</span>
        </div>
      </div>

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
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button type="submit" isLoading={isSubmitting}>
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
};
