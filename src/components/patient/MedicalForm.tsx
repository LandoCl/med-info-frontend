import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { usePatientStore } from '../../store/patientStore';
import { Plus, X } from 'lucide-react';

const medicalDataSchema = z.object({
  tipo_sangre: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'desconocido']),
  peso_kg: z.preprocess((val) => (val === '' ? null : Number(val)), z.number().positive('El peso debe ser positivo').nullable().optional()),
  altura_cm: z.preprocess((val) => (val === '' ? null : Number(val)), z.number().positive('La altura debe ser positiva').nullable().optional()),
  alergias: z.array(z.string()).default([]),
  medicamentos_actuales: z.array(z.string()).default([]),
  enfermedades_cronicas: z.array(z.string()).default([]),
  cirugias_previas: z.array(z.string()).default([]),
  donador_organos: z.boolean().default(false),
  seguro_medico: z.string().optional().nullable(),
  numero_poliza: z.string().optional().nullable(),

  // Campos de condiciones especiales
  discapacidades: z.array(z.string()).default([]),
  implantes: z.array(z.string()).default([]),
  protesis: z.array(z.string()).default([]),
  restricciones_medicamento: z.array(z.string()).default([]),
  notas_adicionales: z.string().optional().nullable(),
});

type MedicalFormValues = z.infer<typeof medicalDataSchema>;

export const MedicalForm: React.FC = () => {
  const { medicalData, conditions, fetchMedicalInfo, saveMedicalInfo, saveConditionsInfo } = usePatientStore();
  const [activeTab, setActiveTab] = useState<'clinicos' | 'condiciones'>('clinicos');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchMedicalInfo();
  }, [fetchMedicalInfo]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: zodResolver(medicalDataSchema),
    defaultValues: {
      tipo_sangre: 'desconocido',
      peso_kg: null,
      altura_cm: null,
      alergias: [],
      medicamentos_actuales: [],
      enfermedades_cronicas: [],
      cirugias_previas: [],
      donador_organos: false,
      seguro_medico: '',
      numero_poliza: '',
      discapacidades: [],
      implantes: [],
      protesis: [],
      restricciones_medicamento: [],
      notas_adicionales: '',
    },
  });

  // Rellenar formulario cuando se cargan los datos de Zustand
  useEffect(() => {
    if (medicalData || conditions) {
      reset({
        tipo_sangre: medicalData?.tipo_sangre || 'desconocido',
        peso_kg: medicalData?.peso_kg || null,
        altura_cm: medicalData?.altura_cm || null,
        alergias: medicalData?.alergias || [],
        medicamentos_actuales: medicalData?.medicamentos_actuales || [],
        enfermedades_cronicas: medicalData?.enfermedades_cronicas || [],
        cirugias_previas: medicalData?.cirugias_previas || [],
        donador_organos: medicalData?.donador_organos || false,
        seguro_medico: medicalData?.seguro_medico || '',
        numero_poliza: medicalData?.numero_poliza || '',
        discapacidades: conditions?.discapacidades || [],
        implantes: conditions?.implantes || [],
        protesis: conditions?.protesis || [],
        restricciones_medicamento: conditions?.restricciones_medicamento || [],
        notas_adicionales: conditions?.notas_adicionales || '',
      });
    }
  }, [medicalData, conditions, reset]);

  const onSubmit = async (values: MedicalFormValues) => {
    setIsSubmitting(true);
    setAlert(null);
    try {
      // 1. Separar datos de expediente general
      const generalData = {
        tipo_sangre: values.tipo_sangre,
        peso_kg: values.peso_kg,
        altura_cm: values.altura_cm,
        alergias: values.alergias,
        medicamentos_actuales: values.medicamentos_actuales,
        enfermedades_cronicas: values.enfermedades_cronicas,
        cirugias_previas: values.cirugias_previas,
        donador_organos: values.donador_organos,
        seguro_medico: values.seguro_medico || null,
        numero_poliza: values.numero_poliza || null,
      };

      // 2. Separar datos de condiciones especiales
      const specialData = {
        discapacidades: values.discapacidades,
        implantes: values.implantes,
        protesis: values.protesis,
        restricciones_medicamento: values.restricciones_medicamento,
        notas_adicionales: values.notas_adicionales || null,
      };

      // 3. Ejecutar peticiones en paralelo
      await Promise.all([
        saveMedicalInfo(generalData),
        saveConditionsInfo(specialData),
      ]);

      setAlert({ type: 'success', message: 'Expediente clínico actualizado correctamente.' });
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Error al guardar los datos clínicos.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Componente de input con tags/chips
  const TagsInput = ({
    name,
    label,
    placeholder,
  }: {
    name: keyof MedicalFormValues;
    label: string;
    placeholder: string;
  }) => {
    const [inputValue, setInputValue] = useState('');
    const tags = (watch(name) as string[]) || [];

    const addTag = () => {
      const val = inputValue.trim();
      if (val && !tags.includes(val)) {
        const updated = [...tags, val];
        setValue(name, updated as any, { shouldDirty: true });
        setInputValue('');
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag();
      }
    };

    const removeTag = (indexToRemove: number) => {
      const updated = tags.filter((_, i) => i !== indexToRemove);
      setValue(name, updated as any, { shouldDirty: true });
    };

    return (
      <div className="flex flex-col gap-1 w-full">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>
        <div className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
          <Button type="button" variant="secondary" onClick={addTag} className="px-3">
            <Plus size={16} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2 min-h-6">
          {tags.length === 0 ? (
            <span className="text-xs text-slate-400 italic">Ninguno registrado</span>
          ) : (
            tags.map((tag, idx) => (
              <Badge key={idx} variant={name === 'alergias' || name === 'restricciones_medicamento' ? 'danger' : 'secondary'} className="gap-1 pr-1.5">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(idx)}
                  className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
              </Badge>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
        <button
          type="button"
          onClick={() => setActiveTab('clinicos')}
          className={`flex-1 py-3.5 text-sm font-semibold text-center transition-colors cursor-pointer border-b-2 ${
            activeTab === 'clinicos'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Datos Médicos Vitales
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('condiciones')}
          className={`flex-1 py-3.5 text-sm font-semibold text-center transition-colors cursor-pointer border-b-2 ${
            activeTab === 'condiciones'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Condiciones Especiales
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
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

        {activeTab === 'clinicos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tipo de Sangre</label>
                <select
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  {...register('tipo_sangre')}
                >
                  <option value="desconocido">Desconocido</option>
                  <option value="O+">O Positivo (O+)</option>
                  <option value="O-">O Negativo (O-)</option>
                  <option value="A+">A Positivo (A+)</option>
                  <option value="A-">A Negativo (A-)</option>
                  <option value="B+">B Positivo (B+)</option>
                  <option value="B-">B Negativo (B-)</option>
                  <option value="AB+">AB Positivo (AB+)</option>
                  <option value="AB-">AB Negativo (AB-)</option>
                </select>
              </div>
              <Input
                label="Peso (kg)"
                type="number"
                step="0.1"
                placeholder="Ej: 72.5"
                error={errors.peso_kg?.message ? String(errors.peso_kg.message) : undefined}
                {...register('peso_kg')}
              />
              <Input
                label="Altura (cm)"
                type="number"
                placeholder="Ej: 175"
                error={errors.altura_cm?.message ? String(errors.altura_cm.message) : undefined}
                {...register('altura_cm')}
              />
            </div>

            <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Donación de Órganos</span>
              <label className="inline-flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500/20 w-4 h-4"
                  {...register('donador_organos')}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">Soy donador voluntario de órganos y tejidos</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Seguro Médico / Institución"
                placeholder="Ej: IMSS, ISSSTE, Seguro Privado"
                error={errors.seguro_medico?.message ? String(errors.seguro_medico.message) : undefined}
                {...register('seguro_medico')}
              />
              <Input
                label="Número de Póliza / Afiliación"
                placeholder="Ej: 123456789-0"
                error={errors.numero_poliza?.message ? String(errors.numero_poliza.message) : undefined}
                {...register('numero_poliza')}
              />
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <TagsInput name="alergias" label="Alergias Clínicas" placeholder="Alergia a... (ej. Penicilina) y presione Enter" />
              <TagsInput name="medicamentos_actuales" label="Medicamentos de Uso Diario" placeholder="Medicamento... (ej. Insulina 10 UI) y presione Enter" />
              <TagsInput name="enfermedades_cronicas" label="Enfermedades Crónicas" placeholder="Enfermedad... (ej. Hipertensión) y presione Enter" />
              <TagsInput name="cirugias_previas" label="Cirugías Previas" placeholder="Procedimiento... (ej. Apendicectomía) y presione Enter" />
            </div>
          </div>
        )}

        {activeTab === 'condiciones' && (
          <div className="space-y-6">
            <TagsInput name="discapacidades" label="Discapacidades" placeholder="Ej: Discapacidad visual parcial y presione Enter" />
            <TagsInput name="implantes" label="Implantes" placeholder="Ej: Marcapasos cardíaco y presione Enter" />
            <TagsInput name="protesis" label="Prótesis" placeholder="Ej: Prótesis de cadera derecha y presione Enter" />
            <TagsInput name="restricciones_medicamento" label="Restricciones Críticas de Medicamentos" placeholder="Ej: Evitar antiinflamatorios (AINEs) y presione Enter" />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notas Médicas Adicionales</label>
              <textarea
                rows={4}
                placeholder="Ingresa cualquier otra indicación o dato que consideres vital en caso de una urgencia médica..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                {...register('notas_adicionales')}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="submit" isLoading={isSubmitting}>
            Guardar Expediente
          </Button>
        </div>
      </form>
    </div>
  );
};
