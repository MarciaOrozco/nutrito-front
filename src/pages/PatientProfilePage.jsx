import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSection from '../components/ProfileSection.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import usePatientProfile from '../hooks/usePatientProfile.js';
import useCancelAppointment from '../hooks/useCancelAppointment.js';
import useUploadDocuments from '../hooks/useUploadDocuments.js';
import { useAuth } from '../auth/useAuth.js';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export default function PatientProfilePage() {
  const { user } = useAuth();
  const pacienteId = user?.pacienteId ?? null;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const {
    contacto,
    proximoTurno,
    historial,
    planes,
    documentos,
    loading,
    error,
    source,
    refresh,
  } = usePatientProfile(pacienteId);

  const {
    cancelAppointment,
    loading: cancelLoading,
    error: cancelError,
    resetError: resetCancelError,
  } = useCancelAppointment();

  const {
    uploadDocuments,
    loading: uploadLoading,
    error: uploadError,
    resetError: resetUploadError,
  } = useUploadDocuments();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const safeHistorial = useMemo(() => historial ?? [], [historial]);
  const safePlanes = useMemo(() => planes ?? [], [planes]);
  const safeDocumentos = useMemo(() => documentos ?? [], [documentos]);

  const closeCancelDialog = () => {
    setShowCancelDialog(false);
    resetCancelError();
  };

  const handleCancelTurno = async () => {
    if (!proximoTurno) return;
    const result = await cancelAppointment({
      turnoId: proximoTurno.id,
      pacienteId,
    });

    if (result.success) {
      setFeedback('El turno se canceló correctamente.');
      closeCancelDialog();
      refresh();
    }
  };

  const handleReprogramar = () => {
    if (!proximoTurno) return;
    navigate(`/agendar/${proximoTurno.nutricionista.id}?turnoId=${proximoTurno.id}`, {
      state: { turno: proximoTurno },
    });
  };

  const handleOpenCancelDialog = () => {
    resetCancelError();
    setShowCancelDialog(true);
  };

  const handleAddDocuments = () => {
    resetUploadError();
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (event) => {
    const { files } = event.target;
    if (!files || !files.length) return;

    const result = await uploadDocuments({ pacienteId, files });
    if (result.success) {
      setFeedback('Documentos cargados correctamente.');
      refresh();
    }
    event.target.value = '';
  };

  const headerNotice = source === 'mock'
    ? 'Mostramos información simulada mientras se configura la conexión con el backend.'
    : null;

  if (!pacienteId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bone px-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-soft">
          <h1 className="text-2xl font-semibold text-bark">Mi perfil</h1>
          <p className="mt-4 text-sm text-bark/70">
            No encontramos la información de tu perfil de paciente. Comunicate con soporte para
            completar el registro.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-bark">Mi perfil</h1>
          <p className="text-sm text-bark/60">
            Gestioná tus datos, turnos y documentación desde un solo lugar.
          </p>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      ) : null}

      {headerNotice ? (
        <div className="rounded-2xl border border-sand bg-bone p-4 text-sm text-bark/70">
          {headerNotice}
        </div>
      ) : null}

      {feedback ? (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-700">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <div className="flex flex-col gap-6">
          <ProfileSection title="Datos de contacto">
            {loading && !contacto ? (
              <div className="h-32 animate-pulse rounded-2xl bg-bone" />
            ) : contacto ? (
              <ul className="text-sm text-bark/80">
                <li>
                  <strong>{contacto.nombre} {contacto.apellido}</strong>
                </li>
                <li>{contacto.telefono ?? 'Sin teléfono registrado'}</li>
                <li>{contacto.email}</li>
                <li>{contacto.ciudad ?? 'Ciudad no especificada'}</li>
              </ul>
            ) : (
              <p className="text-sm text-bark/60">No encontramos información de contacto.</p>
            )}
          </ProfileSection>

          <ProfileSection title="Documentos">
            {uploadError ? (
              <p className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                {uploadError}
              </p>
            ) : null}
            <div className="flex flex-col gap-2 text-sm text-bark/80">
              {safeDocumentos.length ? (
                safeDocumentos.map((documento) => (
                  <div key={documento.id} className="flex items-center justify-between rounded-2xl bg-bone px-4 py-2">
                    <span>{documento.descripcion}</span>
                    <span className="text-xs text-bark/50">{formatDate(documento.fecha)}</span>
                  </div>
                ))
              ) : (
                <p>No se cargaron documentos todavía.</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddDocuments}
              disabled={uploadLoading}
              className="mt-4 w-fit rounded-full bg-[#739273] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {uploadLoading ? 'Subiendo...' : 'Agregar documentos'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />
          </ProfileSection>
        </div>

        <div className="flex flex-col gap-6">
          <ProfileSection title="Próximo turno" description="Gestioná tu próxima consulta">
            {proximoTurno ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 text-sm text-bark/80">
                  <span className="text-base font-semibold text-bark">{proximoTurno.modalidad}</span>
                  <span>{formatDate(proximoTurno.fecha)} · {proximoTurno.hora}</span>
                  <span className="text-sm text-bark/60">
                    Con {proximoTurno.nutricionista.nombre} {proximoTurno.nutricionista.apellido}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleReprogramar}
                    className="rounded-full bg-[#739273] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Reprogramar
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenCancelDialog}
                    className="rounded-full bg-[#D9534F] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? 'Cancelando...' : 'Cancelar'}
                  </button>
                </div>
                {cancelError ? (
                  <p className="text-sm text-[#D9534F]">{cancelError}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-bark/60">No tenés un turno programado.</p>
            )}
          </ProfileSection>

          <ProfileSection title="Mis planes" description="Planes alimentarios disponibles">
            {safePlanes.length ? (
              <div className="flex flex-col gap-3">
                {safePlanes.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between rounded-2xl bg-bone px-4 py-3 text-sm text-bark/80">
                    <div className="flex flex-col">
                      <span className="font-semibold text-bark">Plan #{plan.id}</span>
                      <span>{plan.estado ?? 'Sin estado'} · {formatDate(plan.fechaCreacion)}</span>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-[#739273] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                      onClick={() => setFeedback('Descarga de plan no implementada en el entorno de ejemplo.')}
                    >
                      Descargar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-bark/60">Aún no hay planes asignados.</p>
            )}
          </ProfileSection>

          <ProfileSection title="Consultas pasadas" description="Historial de atenciones">
            {safeHistorial.length ? (
              <div className="flex flex-col gap-3">
                {safeHistorial.map((turno) => (
                  <div key={turno.id} className="flex items-center justify-between rounded-2xl bg-bone px-4 py-3 text-sm text-bark/80">
                    <div className="flex flex-col">
                      <span className="font-semibold text-bark">{turno.modalidad}</span>
                      <span>{formatDate(turno.fecha)} · {turno.hora}</span>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-[#739273] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                      onClick={() => setFeedback('Visualización de consulta no implementada en esta iteración.')}
                    >
                      Ver
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-bark/60">Todavía no registramos consultas previas.</p>
            )}
          </ProfileSection>
        </div>
      </div>

      <ConfirmDialog
        open={showCancelDialog}
        title="¿Deseás cancelar este turno?"
        description="Liberaremos el horario seleccionado y podrás agendar una nueva fecha cuando lo necesites."
        confirmLabel="Cancelar turno"
        confirmClassName="bg-[#D9534F] text-white"
        onConfirm={handleCancelTurno}
        onClose={closeCancelDialog}
      />
    </section>
  );
}
