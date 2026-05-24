import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { FichaMedicaCompleta } from '../../types/medical.types';
import * as qrService from '../../services/qr.service';
import { MedicalSheet } from '../../components/doctor/MedicalSheet';
import { Spinner } from '../../components/common/Spinner';
import { Button } from '../../components/common/Button';
import { ArrowLeft, Activity, AlertTriangle } from 'lucide-react';

export const PatientSheet: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState<FichaMedicaCompleta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSheet = async () => {
      if (!token) {
        setError('Token de consulta inválido');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await qrService.getMedicalSheet(token);
        setSheet(response);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudo recuperar la ficha médica. Es posible que el código QR haya vencido o sea incorrecto.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSheet();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* HEADER CRÍTICO */}
      <header className="bg-red-600 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={24} className="text-white animate-pulse" />
            <span className="font-black text-white tracking-tight text-lg">QR Médico — EMERGENCIA</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/scanner')}
            className="text-white hover:bg-red-700 font-bold border border-white/20 gap-1"
          >
            <ArrowLeft size={14} />
            Escanear Otro
          </Button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {isLoading && (
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-xs text-slate-500 font-medium">Buscando expediente en base de datos segura...</p>
          </div>
        )}

        {error && (
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/20 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Error de Lectura</h3>
            <p className="text-xs text-slate-505 leading-relaxed">{error}</p>
            <div className="pt-2">
              <Button onClick={() => navigate('/scanner')} variant="primary" className="font-bold text-xs py-2">
                Volver al Lector QR
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && sheet && (
          <MedicalSheet sheet={sheet} />
        )}
      </main>
    </div>
  );
};
export default PatientSheet;
