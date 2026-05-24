import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  PDFDownloadLink,
} from '@react-pdf/renderer';
import { useAuthStore } from '../../store/authStore';
import { usePatientStore } from '../../store/patientStore';
import { Button } from '../common/Button';
import { Copy, Check, Download, RefreshCw } from 'lucide-react';
import * as qrService from '../../services/qr.service';

// Estilos del documento PDF
const pdfStyles = StyleSheet.create({
  page: {
    padding: 10,
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 242.6, // 8.5 cm (ID-1 / CR-80)
    height: 153, // 5.4 cm
    backgroundColor: '#0f172a', // Deep dark slate
    borderRadius: 8,
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#38bdf8', // Sky accent border
  },
  leftCol: {
    flex: 1.3,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  rightCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#38bdf8',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 6,
    maxLines: 2,
  },
  metaLabel: {
    fontSize: 6,
    color: '#94a3b8',
    marginTop: 4,
  },
  metaValue: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emergencyText: {
    fontSize: 5,
    color: '#ef4444', // Red alert
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  qrImage: {
    width: 60,
    height: 60,
    backgroundColor: '#ffffff',
    padding: 2,
    borderRadius: 3,
  },
  footer: {
    fontSize: 5,
    color: '#64748b',
    textAlign: 'left',
    marginTop: 4,
  },
});

// Componente del PDF
interface PDFProps {
  nombre: string;
  curp?: string;
  tipoSangre?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  qrDataUrl: string;
}

const MedicalCardPDF: React.FC<PDFProps> = ({
  nombre,
  curp,
  tipoSangre,
  contactoEmergencia,
  telefonoEmergencia,
  qrDataUrl,
}) => (
  <Document>
    <Page size={[250, 160]} style={pdfStyles.page}>
      <View style={pdfStyles.card}>
        <View style={pdfStyles.leftCol}>
          <View>
            <Text style={pdfStyles.title}>TARJETA DE EMERGENCIA</Text>
            <Text style={pdfStyles.name}>{nombre}</Text>
            {curp && (
              <>
                <Text style={pdfStyles.metaLabel}>CURP</Text>
                <Text style={pdfStyles.metaValue}>{curp}</Text>
              </>
            )}
          </View>
          <View>
            <Text style={pdfStyles.metaLabel}>TIPO DE SANGRE</Text>
            <Text style={pdfStyles.metaValue}>{tipoSangre || 'NO REGISTRADO'}</Text>
            {contactoEmergencia && (
              <>
                <Text style={pdfStyles.metaLabel}>EMERGENCIA</Text>
                <Text style={pdfStyles.metaValue}>
                  {contactoEmergencia}: {telefonoEmergencia}
                </Text>
              </>
            )}
          </View>
          <Text style={pdfStyles.footer}>QR Médico - Prototipo de Emergencias</Text>
        </View>
        <View style={pdfStyles.rightCol}>
          {qrDataUrl && <Image style={pdfStyles.qrImage} src={qrDataUrl} />}
          <Text style={pdfStyles.emergencyText}>ESCANEAR EN CASO DE</Text>
          <Text style={pdfStyles.emergencyText}>EMERGENCIA MÉDICA</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export const QRCard: React.FC = () => {
  const { user, setProfile } = useAuthStore();
  const { medicalData, contacts } = usePatientStore();
  const [copied, setCopied] = useState(false);
  const [qrBase64, setQrBase64] = useState<string>('');
  const [regenerating, setRegenerating] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);

  const qrUrl = `${window.location.origin}/ficha/${user?.qr_token}`;

  // Extraer el canvas generado para inyectar su base64 al PDF
  useEffect(() => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      setQrBase64(canvas.toDataURL('image/png'));
    }
  }, [user?.qr_token]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles', err);
    }
  };

  const handleRegenerateQR = async () => {
    if (!window.confirm('¿Estás seguro de regenerar tu código QR? El código anterior dejará de funcionar de inmediato.')) {
      return;
    }
    setRegenerating(true);
    try {
      const response = await qrService.regenerateQR();
      if (user) {
        setProfile({
          ...user,
          qr_token: response.qr_token,
        });
      }
    } catch (err) {
      console.error('Error al regenerar código QR', err);
      alert('Ocurrió un error al regenerar tu QR. Por favor intenta más tarde.');
    } finally {
      setRegenerating(false);
    }
  };

  const principalContact = contacts.find((c) => c.es_principal) || contacts[0];

  return (
    <div className="flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-xl shadow-sm w-full max-w-sm">
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">Tu Código QR de Emergencia</h3>
      <p className="text-xs text-slate-500 text-center mb-6">
        Este código contiene el acceso directo y público a tu expediente médico en caso de que sufras un accidente.
      </p>

      {/* Renderizador del QR del navegador */}
      <div ref={qrRef} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center justify-center mb-6">
        {user?.qr_token && (
          <QRCodeCanvas
            value={qrUrl}
            size={180}
            level="H"
            includeMargin={true}
          />
        )}
      </div>

      <div className="w-full flex flex-col gap-2.5">
        <Button
          variant="secondary"
          className="w-full text-xs font-semibold py-2.5"
          onClick={copyToClipboard}
          leftIcon={copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        >
          {copied ? '¡Enlace Copiado!' : 'Copiar Enlace de Ficha'}
        </Button>

        {qrBase64 && (
          <PDFDownloadLink
            document={
              <MedicalCardPDF
                nombre={`${user?.nombre} ${user?.apellido_paterno} ${user?.apellido_materno || ''}`}
                curp={user?.curp || undefined}
                tipoSangre={medicalData?.tipo_sangre}
                contactoEmergencia={principalContact?.nombre}
                telefonoEmergencia={principalContact?.telefono}
                qrDataUrl={qrBase64}
              />
            }
            fileName={`tarjeta-emergencia-${user?.nombre.toLowerCase().replace(/\s+/g, '-')}.pdf`}
            style={{ textDecoration: 'none', width: '100%' }}
          >
            {({ loading }) => (
              <Button
                variant="primary"
                className="w-full text-xs font-semibold py-2.5"
                disabled={loading}
                leftIcon={<Download size={14} />}
              >
                {loading ? 'Preparando Tarjeta...' : 'Descargar Tarjeta PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        )}

        <button
          type="button"
          disabled={regenerating}
          onClick={handleRegenerateQR}
          className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold mt-4 inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={12} className={regenerating ? 'animate-spin' : ''} />
          Regenerar mi Código QR
        </button>
      </div>
    </div>
  );
};
