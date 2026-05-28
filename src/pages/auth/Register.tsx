import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Activity } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido_paterno: z.string().min(1, 'El apellido paterno es obligatorio'),
  apellido_materno: z.string().optional().nullable(),
  fecha_nacimiento: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  sexo: z.enum(['masculino', 'femenino', 'otro']),
  curp: z.string().length(18, 'El CURP debe tener exactamente 18 caracteres').or(z.string().length(0)).optional().nullable(),
  telefono: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos').max(15),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: signup, isLoading, error } = useAuthStore();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setGeneralError(null);
    try {
      // Limpiar campos vacíos
      const cleaned = {
        ...data,
        apellido_materno: data.apellido_materno || null,
        curp: data.curp || null,
      };
      await signup(cleaned);
      navigate('/dashboard');
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Error al realizar el registro. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 py-8">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
        {/* Header/Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-purple-100 dark:bg-purple-950/30 text-purple-600 rounded-full mb-3">
            <Activity size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Registro de Paciente</h2>
          <p className="text-xs text-slate-500 mt-1">Crea tu cuenta para gestionar tu código QR de emergencia</p>
        </div>

        {/* Alertas */}
        {(error || generalError) && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-350 border border-rose-100 dark:border-rose-900/40 rounded-lg text-xs font-semibold text-center">
            {generalError || error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre(s) *"
              placeholder="Ej: Juan"
              error={errors.nombre?.message}
              {...register('nombre')}
            />
            <Input
              label="Apellido Paterno *"
              placeholder="Ej: Pérez"
              error={errors.apellido_paterno?.message}
              {...register('apellido_paterno')}
            />
            <Input
              label="Apellido Materno"
              placeholder="Ej: Gómez"
              error={errors.apellido_materno?.message}
              {...register('apellido_materno')}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sexo *</label>
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
              label="Fecha de Nacimiento *"
              type="date"
              error={errors.fecha_nacimiento?.message}
              {...register('fecha_nacimiento')}
            />
            <Input
              label="CURP (18 Caracteres)"
              placeholder="Ej: PEGJ900101HDFRRN01"
              maxLength={18}
              error={errors.curp?.message}
              {...register('curp')}
            />
            <Input
              label="Teléfono Móvil *"
              placeholder="Ej: 4921234567"
              error={errors.telefono?.message}
              {...register('telefono')}
            />
            <Input
              label="Correo Electrónico *"
              type="email"
              placeholder="correo@ejemplo.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="md:col-span-2">
              <Input
                label="Contraseña *"
                type="password"
                placeholder="Mínimo 6 caracteres"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>
          </div>

          <Button type="submit" className="w-full py-2.5 font-bold" isLoading={isLoading}>
            Crear Cuenta y Registrarse
          </Button>
        </form>

        {/* Links */}
        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-850">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-purple-600 hover:underline font-semibold">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Register;
