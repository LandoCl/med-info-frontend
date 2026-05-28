import React from 'react';
import { QRScanner } from '../../components/doctor/QRScanner';
import { Button } from '../../components/common/Button';
import { ArrowLeft, Activity, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Scanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* HEADER */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-purple-600" size={24} />
            <span className="font-black text-slate-900 dark:text-slate-100 tracking-tight">TAG Médico</span>
            <Badge variant="danger" className="gap-1 font-bold text-[10px] py-0.5">
              <ShieldAlert size={10} /> MÓDULO MÉDICO
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="text-xs font-bold gap-1">
            <ArrowLeft size={14} />
            Volver al Inicio
          </Button>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <QRScanner />
      </main>
    </div>
  );
};

// Componente Badge local si no se importó de common
const Badge: React.FC<{ children: React.ReactNode; variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'; className?: string }> = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  const variantClasses = {
    primary: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
    secondary: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Scanner;
