import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { usePatientStore } from '../../store/patientStore';
import { QRCard } from '../../components/patient/QRCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { LogOut, Heart, Phone, Plus, Trash2, FolderHeart, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    medicalData,
    contacts,
    fetchMedicalInfo,
    addContact,
    removeContact,
  } = usePatientStore();

  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    nombre: '',
    relacion: '',
    telefono: '',
    telefono_alt: '',
    es_principal: false,
  });

  useEffect(() => {
    fetchMedicalInfo();
  }, [fetchMedicalInfo]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.nombre || !newContact.relacion || !newContact.telefono) {
      alert('Por favor completa los campos obligatorios');
      return;
    }
    try {
      await addContact({
        ...newContact,
        telefono_alt: newContact.telefono_alt || null,
      });
      setShowAddContact(false);
      setNewContact({
        nombre: '',
        relacion: '',
        telefono: '',
        telefono_alt: '',
        es_principal: false,
      });
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al guardar el contacto.');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este contacto de emergencia?')) {
      try {
        await removeContact(id);
      } catch (err) {
        console.error(err);
        alert('No se pudo eliminar el contacto.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* HEADER PRINCIPAL */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-purple-600" size={24} />
            <span className="font-black text-slate-900 dark:text-slate-100 tracking-tight">TAG Médico</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/profile" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400">
              Mi Perfil
            </Link>
            <Link to="/medical-data" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400">
              Expediente Clínico
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-2 py-1 gap-1.5 font-bold">
              <LogOut size={14} />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Banner de Bienvenida */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950/30 text-purple-600 flex items-center justify-center font-bold text-2xl border-2 border-purple-500 overflow-hidden">
              {user?.foto_url ? (
                <img src={user.foto_url} alt={user.nombre} className="w-full h-full object-cover" />
              ) : (
                user?.nombre.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Hola, {user?.nombre} {user?.apellido_paterno}
              </h2>
              <p className="text-xs text-slate-500">Administra tu información médica y mantén tu código QR actualizado.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => navigate('/medical-data')} variant="primary" size="sm" leftIcon={<FolderHeart size={14} />} className="font-semibold text-xs py-2.5">
              Editar Expediente
            </Button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: QR Card */}
          <div className="flex justify-center lg:col-span-1">
            <QRCard />
          </div>

          {/* Columna Derecha: Resumen de Expediente y Contactos */}
          <div className="lg:col-span-2 space-y-8">

            {/* Resumen Clínico */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-950 dark:text-slate-50 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2.5">
                <Heart size={16} className="text-purple-600" />
                Resumen Clínico Rápido
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center">
                  <span className="text-xxs uppercase tracking-wider text-slate-400 font-bold block mb-1">Sangre</span>
                  <Badge variant={medicalData?.tipo_sangre === 'desconocido' ? 'secondary' : 'danger'} className="font-bold">
                    {medicalData?.tipo_sangre || 'No registrado'}
                  </Badge>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center">
                  <span className="text-xxs uppercase tracking-wider text-slate-400 font-bold block mb-1">Peso</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {medicalData?.peso_kg ? `${medicalData.peso_kg} kg` : 'N/D'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center">
                  <span className="text-xxs uppercase tracking-wider text-slate-400 font-bold block mb-1">Altura</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {medicalData?.altura_cm ? `${medicalData.altura_cm} cm` : 'N/D'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center">
                  <span className="text-xxs uppercase tracking-wider text-slate-400 font-bold block mb-1">Donante</span>
                  <Badge variant={medicalData?.donador_organos ? 'success' : 'secondary'} className="font-bold">
                    {medicalData?.donador_organos ? 'Sí' : 'No'}
                  </Badge>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Alergias Detectadas:</span>
                <div className="flex flex-wrap gap-1">
                  {medicalData?.alergias && medicalData.alergias.length > 0 ? (
                    medicalData.alergias.map((al, idx) => (
                      <Badge key={idx} variant="danger" className="text-[10px]">
                        {al}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No tienes alergias registradas</span>
                  )}
                </div>
              </div>
            </div>

            {/* Contactos de Emergencia */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2.5">
                <h3 className="text-sm font-bold text-slate-950 dark:text-slate-50 flex items-center gap-2">
                  <Phone size={16} className="text-purple-600" />
                  Contactos de Emergencia
                </h3>
                {!showAddContact && (
                  <button
                    onClick={() => setShowAddContact(true)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    Agregar Contacto
                  </button>
                )}
              </div>

              {/* Formulario Agregar Contacto */}
              {showAddContact && (
                <form onSubmit={handleAddContactSubmit} className="p-4 border border-purple-100 dark:border-purple-900/40 rounded-xl bg-purple-50/10 dark:bg-purple-950/5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Nuevo Contacto de Emergencia</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Nombre Completo *"
                      placeholder="Ej: María Pérez"
                      value={newContact.nombre}
                      onChange={(e) => setNewContact({ ...newContact, nombre: e.target.value })}
                    />
                    <Input
                      label="Relación/Parentesco *"
                      placeholder="Ej: Madre, Cónyuge"
                      value={newContact.relacion}
                      onChange={(e) => setNewContact({ ...newContact, relacion: e.target.value })}
                    />
                    <Input
                      label="Teléfono Principal *"
                      placeholder="Ej: 4921234567"
                      value={newContact.telefono}
                      onChange={(e) => setNewContact({ ...newContact, telefono: e.target.value })}
                    />
                    <Input
                      label="Teléfono Alternativo (Opcional)"
                      placeholder="Ej: 4929876543"
                      value={newContact.telefono_alt}
                      onChange={(e) => setNewContact({ ...newContact, telefono_alt: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="es_principal_chk"
                      checked={newContact.es_principal}
                      onChange={(e) => setNewContact({ ...newContact, es_principal: e.target.checked })}
                      className="rounded border-slate-350 text-purple-600 focus:ring-purple-500/20"
                    />
                    <label htmlFor="es_principal_chk" className="text-xs text-slate-600 dark:text-slate-400 font-semibold cursor-pointer">
                      Establecer como contacto principal de emergencia
                    </label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddContact(false)} className="text-xs font-bold">
                      Cancelar
                    </Button>
                    <Button type="submit" variant="primary" size="sm" className="text-xs font-bold px-4 py-2">
                      Agregar
                    </Button>
                  </div>
                </form>
              )}

              {/* Lista de Contactos */}
              <div className="space-y-3">
                {contacts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 dark:bg-slate-800/10 rounded-xl">
                    Aún no has agregado contactos. Es de vital importancia agregar al menos un contacto principal.
                  </p>
                ) : (
                  contacts.map((c) => (
                    <div
                      key={c.id}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${c.es_principal
                          ? 'border-purple-200 dark:border-purple-900 bg-purple-50/20 dark:bg-purple-950/10'
                          : 'border-slate-200 dark:border-slate-800'
                        }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{c.nombre}</h4>
                          <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/30">
                            {c.relacion}
                          </span>
                          {c.es_principal && (
                            <Badge variant="success" className="text-[9px] py-0">Principal</Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          <span>Tel: <strong>{c.telefono}</strong></span>
                          {c.telefono_alt && <span className="ml-3">Alt: <strong>{c.telefono_alt}</strong></span>}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteContact(c.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default Dashboard;
