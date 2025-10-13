import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfileSection from "../components/ProfileSection.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import usePatientProfile from "../hooks/usePatientProfile.js";
import useCancelAppointment from "../hooks/useCancelAppointment.js";
import useUploadDocuments from "../hooks/useUploadDocuments.js";
import usePatientProfileForNutri from "../hooks/usePatientProfileForNutri.js";
import useConsultas from "../hooks/useConsultas.js";
import usePlan from "../hooks/usePlan.js";
import { useAuth } from "../auth/useAuth.js";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export default function PatientProfilePage({ readOnly = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  let pacienteId = readOnly
    ? Number.parseInt(params.pacienteId ?? "", 10)
    : user?.pacienteId ?? null;
  const nutricionistaId = readOnly ? user?.nutricionistaId ?? null : null;
  const fileInputRef = useRef(null);

  const patientHookForNutri = usePatientProfileForNutri(
    readOnly ? nutricionistaId : null,
    readOnly ? pacienteId : null
  );
  const patientHookForPatient = usePatientProfile(readOnly ? null : pacienteId);

  const contacto = readOnly
    ? patientHookForNutri.data?.contacto ?? null
    : patientHookForPatient.contacto;
  const proximoTurno = readOnly
    ? patientHookForNutri.data?.proximoTurno ?? null
    : patientHookForPatient.proximoTurno;
  const planes = readOnly
    ? patientHookForNutri.data?.planes ?? []
    : patientHookForPatient.planes;
  const documentos = readOnly
    ? patientHookForNutri.data?.documentos ?? []
    : patientHookForPatient.documentos;
  const consultas = readOnly
    ? patientHookForNutri.data?.consultas ?? []
    : patientHookForPatient.consultas ?? [];
  const loading = readOnly
    ? patientHookForNutri.loading
    : patientHookForPatient.loading;
  const error = readOnly
    ? patientHookForNutri.error
    : patientHookForPatient.error;
  const source = readOnly ? "backend" : patientHookForPatient.source;
  const refresh = readOnly
    ? patientHookForNutri.refresh
    : patientHookForPatient.refresh;

  const canManageOwnProfile = !readOnly;
  const canManageConsultas = readOnly;

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

  const { createConsulta, deleteConsulta } = useConsultas();
  const { exportPlan } = usePlan();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);
  const [showDeleteConsulta, setShowDeleteConsulta] = useState(false);
  const [deleteMotivo, setDeleteMotivo] = useState("Error de carga");
  const [deleteDetalle, setDeleteDetalle] = useState("");
  const [deleteDialogError, setDeleteDialogError] = useState(null);
  const [deletingConsulta, setDeletingConsulta] = useState(false);
  const [downloadingPlanId, setDownloadingPlanId] = useState(null);
  const [planDownloadError, setPlanDownloadError] = useState(null);

  const safePlanes = planes ?? [];
  const safeDocumentos = documentos ?? [];
  const safeConsultas = consultas ?? [];

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
      setFeedback("El turno se canceló correctamente.");
      closeCancelDialog();
      refresh();
    }
  };

  const handleReprogramar = () => {
    if (!proximoTurno) return;
    navigate(
      `/agendar/${proximoTurno.nutricionista.id}?turnoId=${proximoTurno.id}`,
      {
        state: { turno: proximoTurno },
      }
    );
  };

  const downloadPlanFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const handleDownloadPlan = async (planId) => {
    try {
      setPlanDownloadError(null);
      setDownloadingPlanId(planId);
      const result = await exportPlan(planId);
      if (result?.blob) {
        downloadPlanFile(result.blob, result.filename ?? `plan-${planId}.pdf`);
        setFeedback("El plan se descargó correctamente.");
      }
    } catch (error) {
      const message =
        error?.response?.data?.error ??
        (error instanceof Error
          ? error.message
          : "No fue posible descargar el plan. Intenta nuevamente.");
      setPlanDownloadError(message);
    } finally {
      setDownloadingPlanId(null);
    }
  };

  const handleNuevaConsulta = async () => {
    if (!pacienteId) return;
    try {
      const { consultaId } = await createConsulta({ pacienteId });
      navigate(`/consulta/${consultaId}?paciente=${pacienteId}`);
    } catch {
      setFeedback("No pudimos crear la consulta. Intenta nuevamente.");
    }
  };

  const openDeleteConsultaDialog = (consultaId) => {
    setConsultaSeleccionada(consultaId);
    setDeleteMotivo("Error de carga");
    setDeleteDetalle("");
    setDeleteDialogError(null);
    setDeletingConsulta(false);
    setShowDeleteConsulta(true);
  };

  const closeDeleteConsultaDialog = () => {
    if (deletingConsulta) return;
    setShowDeleteConsulta(false);
    setConsultaSeleccionada(null);
    setDeleteDialogError(null);
    setDeleteDetalle("");
    setDeleteMotivo("Error de carga");
  };

  const handleBorrarConsulta = (consultaId) => {
    openDeleteConsultaDialog(consultaId);
  };

  const confirmarBorrarConsulta = async () => {
    if (!consultaSeleccionada || deletingConsulta) return;
    if (!deleteMotivo) {
      setDeleteDialogError("Seleccioná un motivo de eliminación.");
      return;
    }
    if (deleteMotivo === "Otra" && !deleteDetalle.trim()) {
      setDeleteDialogError("Indicá un detalle para el motivo seleccionado.");
      return;
    }

    let deletedSuccessfully = false;

    try {
      setDeletingConsulta(true);
      setDeleteDialogError(null);
      const result = await deleteConsulta(consultaSeleccionada, {
        motivo: deleteMotivo,
        detalle: deleteMotivo === "Otra" ? deleteDetalle.trim() : undefined,
      });

      if (result?.success) {
        setFeedback("Consulta eliminada correctamente.");
        deletedSuccessfully = true;
      } else {
        setDeleteDialogError("No se pudo eliminar la consulta. Intentá nuevamente.");
      }
    } catch (error) {
      const message =
        error?.response?.data?.error ??
        (error instanceof Error ? error.message : "No se pudo eliminar la consulta.");
      setDeleteDialogError(message);
    } finally {
      setDeletingConsulta(false);
      if (deletedSuccessfully) {
        closeDeleteConsultaDialog();
        refresh();
      }
    }
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
      setFeedback("Documentos cargados correctamente.");
      refresh();
    }
    event.target.value = "";
  };

  const headerNotice =
    source === "mock"
      ? "Mostramos información simulada mientras se configura la conexión con el backend."
      : null;

  if (!pacienteId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bone px-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-soft">
          <h1 className="text-2xl font-semibold text-bark">Mi perfil</h1>
          <p className="mt-4 text-sm text-bark/70">
            No encontramos la información de tu perfil de paciente. Comunicate
            con soporte para completar el registro.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-bark">
            {readOnly ? "Ficha del paciente" : "Mi perfil"}
          </h1>
          <p className="text-sm text-bark/60">
            Gestioná tus datos, turnos y documentación desde un solo lugar.
          </p>
        </div>
        {readOnly ? (
          <button
            type="button"
            onClick={handleNuevaConsulta}
            className="rounded-full bg-[#739273] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Nueva consulta
          </button>
        ) : null}
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
                  <strong>
                    {contacto.nombre} {contacto.apellido}
                  </strong>
                </li>
                <li>{contacto.telefono ?? "Sin teléfono registrado"}</li>
                <li>{contacto.email}</li>
                <li>{contacto.ciudad ?? "Ciudad no especificada"}</li>
              </ul>
            ) : (
              <p className="text-sm text-bark/60">
                No encontramos información de contacto.
              </p>
            )}
          </ProfileSection>

          <ProfileSection title="Documentos">
            {uploadError && canManageOwnProfile ? (
              <p className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                {uploadError}
              </p>
            ) : null}
            <div className="flex flex-col gap-2 text-sm text-bark/80">
              {safeDocumentos.length ? (
                safeDocumentos.map((documento) => (
                  <div
                    key={documento.id}
                    className="flex items-center justify-between rounded-2xl bg-bone px-4 py-2"
                  >
                    <span>{documento.descripcion}</span>
                    <span className="text-xs text-bark/50">
                      {formatDate(documento.fecha)}
                    </span>
                  </div>
                ))
              ) : (
                <p>No se cargaron documentos todavía.</p>
              )}
            </div>

            <>
              <button
                type="button"
                onClick={handleAddDocuments}
                disabled={uploadLoading}
                className="mt-4 w-fit rounded-full bg-[#739273] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {uploadLoading ? "Subiendo..." : "Agregar documentos"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFilesSelected}
              />
            </>
          </ProfileSection>
        </div>

        <div className="flex flex-col gap-6">
          <ProfileSection
            title="Próximo turno"
            description="Gestioná tu próxima consulta"
          >
            {proximoTurno ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 text-sm text-bark/80">
                  <span className="text-base font-semibold text-bark">
                    {proximoTurno.modalidad}
                  </span>
                  <span>
                    {formatDate(proximoTurno.fecha)} · {proximoTurno.hora}
                  </span>
                  <span className="text-sm text-bark/60">
                    Con {proximoTurno.nutricionista.nombre}{" "}
                    {proximoTurno.nutricionista.apellido}
                  </span>
                </div>

                {canManageOwnProfile ? (
                  <>
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
                        {cancelLoading ? "Cancelando..." : "Cancelar"}
                      </button>
                    </div>
                    {cancelError ? (
                      <p className="text-sm text-[#D9534F]">{cancelError}</p>
                    ) : null}
                  </>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-bark/60">
                No tenés un turno programado.
              </p>
            )}
          </ProfileSection>

          <ProfileSection
            title="Mis planes"
            description="Planes alimentarios disponibles"
          >
            {planDownloadError ? (
              <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {planDownloadError}
              </div>
            ) : null}
            {safePlanes.length ? (
              <div className="flex flex-col gap-3">
                {safePlanes.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between rounded-2xl bg-bone px-4 py-3 text-sm text-bark/80"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-bark">
                        {plan.titulo ? plan.titulo : `Plan #${plan.id}`}
                      </span>
                      <span>
                        {plan.estado ?? "Sin estado"} ·{" "}
                        {formatDate(plan.fechaCreacion)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {readOnly ? (
                        <>
                          <button
                            type="button"
                            className="rounded-full border border-[#739273] px-3 py-1 text-xs font-semibold text-[#739273] transition hover:bg-[#739273] hover:text-white"
                            onClick={() =>
                              navigate(`/editar-plan/${plan.id}`, {
                                state: { from: "perfil" },
                              })
                            }
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-sand px-3 py-1 text-xs font-semibold text-bark/70 transition hover:border-clay hover:text-clay"
                            onClick={() =>
                              navigate(`/previsualizar-plan/${plan.id}`, {
                                state: { from: "perfil" },
                              })
                            }
                          >
                            Ver
                          </button>
                        </>
                      ) : null}
                      <button
                        type="button"
                        className="rounded-full bg-[#739273] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => handleDownloadPlan(plan.id)}
                        disabled={downloadingPlanId === plan.id}
                      >
                        {downloadingPlanId === plan.id
                          ? "Descargando..."
                          : "Descargar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-bark/60">
                Aún no hay planes asignados.
              </p>
            )}
          </ProfileSection>

          <ProfileSection
            title="Consultas pasadas"
            description="Historial de atenciones"
          >
            {safeConsultas.length ? (
              <div className="flex flex-col gap-3">
                {safeConsultas.map((consulta) => (
                  <div
                    key={consulta.consulta_id}
                    className="flex items-center justify-between rounded-2xl bg-bone px-4 py-3 text-sm text-bark/80"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-bark">
                        Consulta #{consulta.consulta_id}
                      </span>
                      <span>
                        {formatDate(consulta.fecha_consulta)} ·{" "}
                        {consulta.estado}
                      </span>
                    </div>
                    {readOnly ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-[#739273] px-3 py-1 text-sm font-semibold text-[#739273] transition hover:bg-[#739273] hover:text-white"
                          onClick={() =>
                            navigate(
                              `/consulta/${consulta.consulta_id}?paciente=${pacienteId}`
                            )
                          }
                        >
                          Ver
                        </button>
                        {canManageConsultas ? (
                          <>
                            <button
                              type="button"
                              className="rounded-full border border-[#739273] px-3 py-1 text-sm font-semibold text-[#739273] transition hover:bg-[#739273] hover:text-white"
                              onClick={() =>
                                navigate(
                                  `/consulta/${consulta.consulta_id}?paciente=${pacienteId}`
                                )
                              }
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="rounded-full border border-[#D9534F] px-3 py-1 text-sm font-semibold text-[#D9534F] transition hover:bg-[#D9534F] hover:text-white"
                              onClick={() =>
                                handleBorrarConsulta(consulta.consulta_id)
                              }
                            >
                              Borrar
                            </button>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-bark/60">
                Todavía no registramos consultas previas.
              </p>
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
      <ConfirmDialog
        open={showDeleteConsulta}
        title="¿Deseás eliminar esta consulta?"
        description="La información asociada se perderá."
        confirmLabel={deletingConsulta ? "Eliminando..." : "Eliminar"}
        confirmClassName="bg-[#D9534F] text-white"
        onConfirm={confirmarBorrarConsulta}
        onClose={closeDeleteConsultaDialog}
        confirmDisabled={deletingConsulta}
        cancelDisabled={deletingConsulta}
      >
        <label className="flex flex-col gap-2 text-sm font-medium text-bark">
          Motivo de eliminación
          <select
            value={deleteMotivo}
            onChange={(event) => setDeleteMotivo(event.target.value)}
            disabled={deletingConsulta}
            className="rounded-xl border border-sand bg-white px-4 py-2 text-sm font-normal text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="Error de carga">Error de carga</option>
            <option value="Duplicada">Duplicada</option>
            <option value="Otra">Otra</option>
          </select>
        </label>
        {deleteMotivo === "Otra" ? (
          <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-bark">
            Detalle
            <textarea
              value={deleteDetalle}
              onChange={(event) => setDeleteDetalle(event.target.value)}
              rows={3}
              disabled={deletingConsulta}
              className="rounded-xl border border-sand bg-white px-4 py-2 text-sm font-normal text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Contanos brevemente por qué querés eliminarla."
            />
          </label>
        ) : null}
        {deleteDialogError ? (
          <p className="mt-3 text-sm text-red-500">{deleteDialogError}</p>
        ) : null}
      </ConfirmDialog>
    </section>
  );
}
