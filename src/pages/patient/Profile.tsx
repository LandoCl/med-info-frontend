import React from 'react';
import { ProfileForm } from '../../components/patient/ProfileForm';
import { Button } from '../../components/common/Button';
import { ArrowLeft, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* HEADER */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-purple-600" size={24} />
            <span className="font-black text-slate-900 dark:text-slate-100 tracking-tight">TAG Médico</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-xs font-bold gap-1">
            <ArrowLeft size={14} />
            Volver al Panel
          </Button>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="p-2"
            >
              <ArrowLeft size={16} />
            </Button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Mi Perfil Personal</h2>
          </div>

          <ProfileForm />
        </div>
      </main>
    </div>
  );
};
export default Profile;
