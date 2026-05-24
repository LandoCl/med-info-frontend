import type { FichaMedicaCompleta } from '../../types/medical.types';
import { Badge } from '../common/Badge';
import { ShieldAlert, Heart, Phone, User, Clipboard, AlertOctagon } from 'lucide-react';

interface MedicalSheetProps {
  sheet: FichaMedicaCompleta;
}

export const MedicalSheet: React.FC<MedicalSheetProps> = ({ sheet }) => {
  const { paciente, datos_medicos: med, condiciones_especiales: cond, contactos_emergencia: contacts } = sheet;

  // Calcular edad
  const calculateAge = (birthDateStr: any) => {
    if (!birthDateStr) return 'Desconocida';
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  const formattedBirthDate = paciente.fecha_nacimiento 
    ? new Date(paciente.fecha_nacimiento).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'No registrada';

  const criticalAllergies = med?.alergias || [];
  const drugRestrictions = cond?.restricciones_medicamento || [];
  const hasCriticalAlerts = criticalAllergies.length > 0 || drugRestrictions.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* SECCIÓN 1: CABECERA DE ALERTAS CRÍTICAS */}
      {hasCriticalAlerts && (
        <div className="bg-red-500 text-white rounded-2xl p-5 shadow-md flex items-start gap-4 border-2 border-red-600 animate-pulse">
          <AlertOctagon size={48} className="shrink-0 text-white mt-1" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-wide">ALERTAS CRÍTICAS DE SALUD</h2>
            <div className="flex flex-wrap gap-2">
              {criticalAllergies.map((al, idx) => (
                <span key={idx} className="bg-white text-red-700 font-extrabold px-3 py-1 rounded-md text-xs uppercase tracking-wide">
                  ALERGIA: {al}
                </span>
              ))}
              {drugRestrictions.map((res, idx) => (
                <span key={idx} className="bg-amber-100 text-amber-950 font-extrabold px-3 py-1 rounded-md text-xs uppercase tracking-wide border border-amber-300">
                  RESTRICCIÓN: {res}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 2: IDENTIFICACIÓN DEL PACIENTE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-purple-500 overflow-hidden flex items-center justify-center shrink-0">
          {paciente.foto_url ? (
            <img src={paciente.foto_url} alt="Paciente" className="w-full h-full object-cover" />
          ) : (
            <User size={48} className="text-slate-400 dark:text-slate-500" />
          )}
        </div>
        <div className="flex-1 text-center md:text-left space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            {paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno || ''}
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center text-sm font-medium mt-2">
            <Badge variant="primary">{calculateAge(paciente.fecha_nacimiento)}</Badge>
            <Badge variant="secondary" className="capitalize">{paciente.sexo}</Badge>
            {med?.tipo_sangre && (
              <Badge variant={med.tipo_sangre === 'desconocido' ? 'secondary' : 'danger'} className="font-bold">
                Sangre: {med.tipo_sangre}
              </Badge>
            )}
            {med?.donador_organos && (
              <Badge variant="success" className="font-bold flex items-center gap-1">
                <Heart size={10} fill="currentColor" /> Donante
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pt-3 text-xs text-slate-500 dark:text-slate-400">
            <span><strong>CURP:</strong> {paciente.curp || 'No registrado'}</span>
            <span><strong>Teléfono:</strong> {paciente.telefono || 'No registrado'}</span>
            <span><strong>Nacimiento:</strong> {formattedBirthDate}</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: EXPEDIENTE CLÍNICO Y CONDICIONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna Izquierda: Datos Vitales e Historial */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Clipboard size={18} className="text-purple-600" />
            Datos Clínicos Generales
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-xxs uppercase tracking-wider text-slate-400 font-bold block">Peso</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {med?.peso_kg ? `${med.peso_kg} kg` : 'No registrado'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-xxs uppercase tracking-wider text-slate-400 font-bold block">Estatura</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {med?.altura_cm ? `${med.altura_cm} cm` : 'No registrado'}
              </span>
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Medicamentos de Uso Diario</span>
              <div className="flex flex-wrap gap-1">
                {med?.medicamentos_actuales && med.medicamentos_actuales.length > 0 ? (
                  med.medicamentos_actuales.map((m, i) => <Badge key={i} variant="info">{m}</Badge>)
                ) : (
                  <span className="text-xs text-slate-400 italic">Sin registros de medicamentos diarios</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Enfermedades Crónicas</span>
              <div className="flex flex-wrap gap-1">
                {med?.enfermedades_cronicas && med.enfermedades_cronicas.length > 0 ? (
                  med.enfermedades_cronicas.map((e, i) => <Badge key={i} variant="warning">{e}</Badge>)
                ) : (
                  <span className="text-xs text-slate-400 italic">Sin registros de enfermedades crónicas</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Cirugías Previas</span>
              <div className="flex flex-wrap gap-1">
                {med?.cirugias_previas && med.cirugias_previas.length > 0 ? (
                  med.cirugias_previas.map((c, i) => <Badge key={i} variant="secondary">{c}</Badge>)
                ) : (
                  <span className="text-xs text-slate-400 italic">Sin registros de cirugías previas</span>
                )}
              </div>
            </div>

            {med?.seguro_medico && (
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                <span className="text-xxs uppercase tracking-wider text-blue-500 font-bold block">Seguro Médico</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{med.seguro_medico}</span>
                {med.numero_poliza && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">Póliza/NSS: {med.numero_poliza}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Condiciones Especiales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <ShieldAlert size={18} className="text-purple-600" />
            Condiciones Especiales y Prótesis
          </h3>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Discapacidades</span>
              <div className="flex flex-wrap gap-1">
                {cond?.discapacidades && cond.discapacidades.length > 0 ? (
                  cond.discapacidades.map((d, i) => <Badge key={i} variant="warning">{d}</Badge>)
                ) : (
                  <span className="text-xs text-slate-400 italic">Ninguna</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Implantes</span>
              <div className="flex flex-wrap gap-1">
                {cond?.implantes && cond.implantes.length > 0 ? (
                  cond.implantes.map((imp, i) => <Badge key={i} variant="secondary">{imp}</Badge>)
                ) : (
                  <span className="text-xs text-slate-400 italic">Ninguno</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Prótesis</span>
              <div className="flex flex-wrap gap-1">
                {cond?.protesis && cond.protesis.length > 0 ? (
                  cond.protesis.map((p, i) => <Badge key={i} variant="secondary">{p}</Badge>)
                ) : (
                  <span className="text-xs text-slate-400 italic">Ninguna</span>
                )}
              </div>
            </div>

            {cond?.notas_adicionales && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Indicaciones Clínicas Adicionales</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{cond.notas_adicionales}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: CONTACTOS DE EMERGENCIA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
          <Phone size={18} className="text-purple-600" />
          Contactos de Emergencia
        </h3>

        {contacts.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800/20 rounded-lg">
            No se han registrado contactos de emergencia para este paciente.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contacts.map((c) => (
              <div
                key={c.id}
                className={`p-4 rounded-xl border relative ${
                  c.es_principal
                    ? 'border-purple-300 dark:border-purple-800 bg-purple-50/20 dark:bg-purple-950/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                {c.es_principal && (
                  <Badge variant="primary" className="absolute top-3 right-3 text-[10px] py-0.5">
                    Principal
                  </Badge>
                )}
                <div className="space-y-1.5 pr-16">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">{c.nombre}</h4>
                  <span className="text-xxs font-semibold uppercase tracking-wider text-purple-600 block">{c.relacion}</span>
                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                    <p><strong>Teléfono:</strong> {c.telefono}</p>
                    {c.telefono_alt && <p><strong>Teléfono Alt:</strong> {c.telefono_alt}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
