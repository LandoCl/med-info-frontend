import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Activity, ShieldAlert } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setGeneralError(null);
    try {
      await login(data);
      navigate('/dashboard');
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || 'Credenciales incorrectas. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
        {/* Header/Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-purple-100 dark:bg-purple-950/30 text-purple-600 rounded-full mb-3">
            <Activity size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">TAG Médico</h2>
          <p className="text-xs text-slate-500 mt-1">Expediente Clínico Móvil de Emergencia</p>
        </div>

        {/* Alertas */}
        {(error || generalError) && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-350 border border-rose-100 dark:border-rose-900/40 rounded-lg text-xs font-semibold text-center">
            {generalError || error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="correo@ejemplo.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-1">
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Button type="submit" className="w-full py-2.5 font-bold mt-2" isLoading={isLoading}>
            Iniciar Sesión
          </Button>
        </form>

        {/* Links */}
        <div className="text-center text-xs text-slate-500 space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-850">
          <p>
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-purple-600 hover:underline font-semibold">
              Regístrate aquí
            </Link>
          </p>
          <div className="pt-2">
            <Link to="/scanner" className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-bold">
              <ShieldAlert size={14} className="text-red-500" />
              Lector QR de Emergencias (Médicos)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
