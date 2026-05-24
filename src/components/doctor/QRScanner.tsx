import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '../common/Button';
import { Camera, Upload, AlertCircle, RefreshCw } from 'lucide-react';

export const QRScanner: React.FC = () => {
  const navigate = useNavigate();
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const containerId = 'qr-scanner-element';

  // Limpieza en desmontaje
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      // Pedir permisos y obtener cámaras disponibles
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        throw new Error('No se encontraron cámaras en este dispositivo.');
      }

      // Inicializar lector
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      // Usar cámara trasera si existe, de lo contrario la primera
      const backCamera = devices.find((device) =>
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('trasera')
      );
      const cameraId = backCamera ? backCamera.id : devices[0].id;

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Callback de éxito del escaneo
          handleQRSuccess(decodedText);
        },
        () => {
          // Callback de error de lectura (silencioso por cada frame)
        }
      );

      setCameraActive(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al acceder a la cámara. Asegúrese de otorgar los permisos necesarios.');
      setCameraActive(false);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setCameraActive(false);
      } catch (err) {
        console.error('Error al detener la cámara:', err);
      }
    }
  };

  const handleQRSuccess = (text: string) => {
    stopCamera();
    
    // Validar si el enlace contiene el token del formato correcto
    // Ej: http://localhost:3000/ficha/abcd-1234
    if (text.includes('/ficha/')) {
      const parts = text.split('/ficha/');
      const token = parts[parts.length - 1]?.trim();
      if (token) {
        navigate(`/ficha/${token}`);
      } else {
        setErrorMsg('El QR escaneado no contiene un código de ficha válido.');
      }
    } else {
      setErrorMsg('El código QR escaneado no pertenece al sistema de Emergencias QR Médico.');
    }
  };

  // Subir imagen para decodificar
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setLoading(true);

    try {
      const scanner = new Html5Qrcode(containerId);
      const decodedText = await scanner.scanFile(file, true);
      handleQRSuccess(decodedText);
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo detectar ningún código QR en la imagen cargada.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-6 flex flex-col items-center gap-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Escáner de Emergencia</h3>
        <p className="text-xs text-slate-500 mt-1">
          Apunta con la cámara al código QR de la tarjeta del paciente o sube una imagen de tu galería.
        </p>
      </div>

      {errorMsg && (
        <div className="flex gap-2 p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border border-rose-100 dark:border-rose-900/40 rounded-lg text-xs font-medium w-full">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Visor de escaneo */}
      <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl overflow-hidden flex flex-col items-center justify-center">
        {/* Contenedor que html5-qrcode tomará */}
        <div id={containerId} className="w-full h-full [&>video]:object-cover" />

        {!cameraActive && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-950/30 text-purple-600 rounded-full">
              <Camera size={28} />
            </div>
            <span className="text-xs text-slate-400">La cámara está apagada</span>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center gap-2 text-white">
            <RefreshCw size={24} className="animate-spin text-purple-400" />
            <span className="text-xs">Cargando lector...</span>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-2">
        {!cameraActive ? (
          <Button
            onClick={startCamera}
            className="w-full py-2.5 font-semibold text-xs"
            leftIcon={<Camera size={14} />}
          >
            Iniciar Lector por Cámara
          </Button>
        ) : (
          <Button
            onClick={stopCamera}
            variant="secondary"
            className="w-full py-2.5 font-semibold text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400"
          >
            Detener Cámara
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="secondary"
          className="w-full py-2.5 font-semibold text-xs"
          leftIcon={<Upload size={14} />}
        >
          Cargar Imagen de QR
        </Button>
      </div>
    </div>
  );
};
