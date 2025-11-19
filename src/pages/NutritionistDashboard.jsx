import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useLinkedPatients from "../hooks/useLinkedPatients.js";
import useCreateManualPatient from "../hooks/useCreateManualPatient.js";
import useNutritionistAppointments from "../hooks/useNutritionistAppointments.js";
import { useAuth } from "../auth/useAuth.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import RescheduleDialog from "../components/RescheduleDialog.jsx";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export default function NutritionistDashboard() {
  const { user } = useAuth();
  const nutricionistaId = user?.nutricionistaId ?? null;
  const {
    patients,
    loading,
    error,
    refresh: refreshPatients,
  } = useLinkedPatients(nutricionistaId);
  const {
    createManualPatient,
    loading: creatingPatient,
    error: createPatientError,
    resetError: resetCreatePatientError,
  } = useCreateManualPatient(nutricionistaId);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    cancelAppointment,
    rescheduleAppointment,
  } = useNutritionistAppointments(nutricionistaId);
  const [processingTurnoId, setProcessingTurnoId] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [turnoPendienteCancelacion, setTurnoPendienteCancelacion] =
    useState(null);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [turnoPendienteReprogramacion, setTurnoPendienteReprogramacion] =
    useState(null);
  const [showCreatePatientModal, setShowCreatePatientModal] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    nombre: "",
    apellido: "",
    email: "",
  });
  const [createPatientFeedback, setCreatePatientFeedback] = useState(null);

  const showFeedback = (message, type = "message") => {
    const toastApi = window?.toast;
    if (toastApi) {
      if (type === "success" && typeof toastApi.success === "function") {
        toastApi.success(message);
        return;
      }
      if (type === "error" && typeof toastApi.error === "function") {
        toastApi.error(message);
        return;
      }
      if (typeof toastApi[type] === "function") {
        toastApi[type](message);
        return;
      }
      if (typeof toastApi.message === "function") {
        toastApi.message(message);
        return;
      }
    }

    if (type === "error") {
      window.alert?.(message);
    } else {
      console.log(message);
    }
  };

  const openCreatePatientModal = () => {
    resetCreatePatientError();
    setCreatePatientFeedback(null);
    setShowCreatePatientModal(true);
  };

  const closeCreatePatientModal = () => {
    if (creatingPatient) return;
    setShowCreatePatientModal(false);
    setNewPatientData({ nombre: "", apellido: "", email: "" });
    setCreatePatientFeedback(null);
    resetCreatePatientError();
  };

  const handleChangePatientField = (field) => (event) => {
    setNewPatientData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmitNewPatient = async (event) => {
    event.preventDefault();
    if (!nutricionistaId) {
      setCreatePatientFeedback(
        "No se encontró el identificador del profesional."
      );
      return;
    }

    const trimmed = {
      nombre: newPatientData.nombre.trim(),
      apellido: newPatientData.apellido.trim(),
      email: newPatientData.email.trim().toLowerCase(),
    };

    if (!trimmed.nombre || !trimmed.apellido || !trimmed.email) {
      setCreatePatientFeedback("Completá todos los campos.");
      return;
    }

    const emailPattern =
      /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
    if (!emailPattern.test(trimmed.email)) {
      setCreatePatientFeedback("Ingresá un email válido.");
      return;
    }

    try {
      setCreatePatientFeedback(null);
      const response = await createManualPatient(trimmed);
      if (response?.paciente) {
        showFeedback("Paciente agregado e invitación enviada.", "success");
      } else {
        showFeedback("Paciente agregado correctamente.", "success");
      }
      closeCreatePatientModal();
      await refreshPatients();
    } catch (apiError) {
      const status = apiError?.response?.status;
      if (status === 409) {
        setCreatePatientFeedback("El correo ya está en uso.");
        showFeedback("El correo ya está en uso.", "error");
      } else {
        const message =
          apiError?.response?.data?.error ??
          (apiError instanceof Error
            ? apiError.message
            : "No se pudo completar el registro.");
        setCreatePatientFeedback(message);
        showFeedback(message, "error");
      }
    }
  };

  const handleReschedule = (turn) => {
    if (!turn?.id) return;
    setTurnoPendienteReprogramacion(turn);
    setShowRescheduleDialog(true);
  };

  const closeRescheduleDialog = () => {
    if (
      processingTurnoId &&
      turnoPendienteReprogramacion?.id === processingTurnoId
    ) {
      return;
    }
    setShowRescheduleDialog(false);
    setTurnoPendienteReprogramacion(null);
  };

  const handleRescheduleConfirm = async ({ fecha, hora }) => {
    if (!turnoPendienteReprogramacion?.id || !fecha || !hora) return;

    try {
      setProcessingTurnoId(turnoPendienteReprogramacion.id);
      const result = await rescheduleAppointment(
        turnoPendienteReprogramacion.id,
        {
          fecha,
          hora,
        }
      );

      if (result.success) {
        showFeedback("Turno reprogramado con éxito.", "success");
        setShowRescheduleDialog(false);
        setTurnoPendienteReprogramacion(null);
      } else {
        throw result.error ?? new Error("No se pudo reprogramar el turno.");
      }
    } catch (error) {
      showFeedback(
        error instanceof Error
          ? error.message
          : "No se pudo reprogramar el turno.",
        "error"
      );
    } finally {
      setProcessingTurnoId(null);
    }
  };

  const handleCancel = (turn) => {
    if (!turn?.id) return;
    setTurnoPendienteCancelacion(turn);
    setShowCancelDialog(true);
  };

  const closeCancelDialog = () => {
    if (
      processingTurnoId &&
      turnoPendienteCancelacion?.id === processingTurnoId
    ) {
      return;
    }
    setShowCancelDialog(false);
    setTurnoPendienteCancelacion(null);
  };

  const handleConfirmCancel = async () => {
    if (!turnoPendienteCancelacion?.id || processingTurnoId) return;

    try {
      setProcessingTurnoId(turnoPendienteCancelacion.id);
      const result = await cancelAppointment(turnoPendienteCancelacion.id, {
        motivo: "Cancelado por el profesional desde el panel.",
      });

      if (result.success) {
        showFeedback("Turno cancelado correctamente.", "success");
        setShowCancelDialog(false);
        setTurnoPendienteCancelacion(null);
      } else {
        throw result.error ?? new Error("No se pudo cancelar el turno.");
      }
    } catch (error) {
      showFeedback(
        error instanceof Error
          ? error.message
          : "No se pudo cancelar el turno.",
        "error"
      );
    } finally {
      setProcessingTurnoId(null);
    }
  };

  const filteredPatients = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return patients;

    return patients.filter((patient) => {
      const fullName = `${patient.nombre ?? ""} ${
        patient.apellido ?? ""
      }`.toLowerCase();
      const email = (patient.email ?? "").toLowerCase();
      return (
        fullName.includes(normalizedTerm) || email.includes(normalizedTerm)
      );
    });
  }, [patients, searchTerm]);

  if (!nutricionistaId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bone px-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-soft">
          <h1 className="text-2xl font-semibold text-bark">
            Panel aprofesional
          </h1>
          <p className="mt-4 text-sm text-bark/70">
            No encontramos tu perfil de nutricionista. Verificá con el
            administrador de la plataforma si tu cuenta está configurada
            correctamente.
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
            Panel profesional
          </h1>
          <p className="text-sm text-bark/60">
            Consultá tus pacientes y turnos próximos.
          </p>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      ) : null}
      {appointmentsError ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {appointmentsError}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-bark">Mis pacientes</h2>
          <p className="mt-2 text-sm text-bark/60">
            Seleccioná un paciente para ver su ficha completa.
          </p>
          <div className="mt-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nombre o email"
              className="w-full rounded-xl border border-sand bg-white px-4 py-2 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
            />
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {loading ? (
              <div className="h-32 animate-pulse rounded-2xl bg-bone" />
            ) : filteredPatients.length ? (
              filteredPatients.map((patient) => (
                <div
                  key={patient.pacienteId}
                  className="flex flex-col gap-3 rounded-2xl bg-bone px-4 py-3 text-sm text-bark/80 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-bark">
                        {patient.nombre} {patient.apellido}
                      </span>
                      {patient.estadoRegistro ? (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            patient.estadoRegistro === "pendiente"
                              ? "bg-sand/60 text-bark/80"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {patient.estadoRegistro === "pendiente"
                            ? "No registrado"
                            : patient.estadoRegistroLabel ?? "Activo"}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-xs text-bark/50">
                      {patient.email}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/paciente/${patient.pacienteId}`}
                      className="rounded-full border border-[#739273] px-4 py-2 text-sm font-semibold text-[#739273] transition hover:bg-[#739273] hover:text-white"
                    >
                      Ver perfil
                    </Link>
                    <Link
                      to={`/crear-plan/${patient.pacienteId}`}
                      className="rounded-full border border-sand px-4 py-2 text-sm font-semibold text-bark/70 transition hover:border-clay hover:text-clay"
                    >
                      Crear plan
                    </Link>
                  </div>
                </div>
              ))
            ) : patients.length ? (
              <p className="text-sm text-bark/60">
                No se encontraron pacientes que coincidan con tu búsqueda.
              </p>
            ) : (
              <p className="text-sm text-bark/60">
                Todavía no tenés pacientes vinculados.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={openCreatePatientModal}
            className="mt-4 inline-flex items-center justify-center rounded-full border border-dashed border-clay/50 px-4 py-2 text-sm font-semibold text-clay transition hover:border-clay hover:text-white hover:bg-clay"
          >
            Agregar paciente nuevo
          </button>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-bark">Próximos turnos</h2>
          <p className="mt-2 text-sm text-bark/60">
            Visualizá tus consultas agendadas y administralas desde aquí.
          </p>

          <div className="mt-5 flex flex-col gap-3">
            {appointmentsLoading ? (
              <div className="h-32 animate-pulse rounded-2xl bg-bone" />
            ) : appointments.length ? (
              appointments.map((turn) => (
                <div
                  key={turn.id}
                  className="flex items-center justify-between rounded-2xl bg-bone px-4 py-3 text-sm text-bark/80"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-bark">
                      {turn.paciente?.nombre ?? ""}{" "}
                      {turn.paciente?.apellido ?? ""}
                    </span>
                    <span className="text-xs text-bark/50">
                      {turn.paciente?.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm text-bark/70">
                      <p>{formatDate(turn.fecha)}</p>
                      {turn.hora ? <p>{turn.hora} hs</p> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      {processingTurnoId === turn.id ? (
                        <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-[#739273]/30 border-t-[#739273]" />
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleReschedule(turn)}
                        disabled={processingTurnoId === turn.id}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#739273] text-[#739273] transition hover:bg-[#739273]/10 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Reprogramar turno"
                        title="Reprogramar turno"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <path d="M12 5V3M19 12h2M3 12H5M17.5 6.5l1.5-1.5M5 18.5l1.5-1.5M5 5l1.5 1.5M18.5 18.5 17 17" />
                          <path d="M15 9l-6 6-2 1 1-2 6-6 1 1Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancel(turn)}
                        disabled={processingTurnoId === turn.id}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500 text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Cancelar turno"
                        title="Cancelar turno"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <rect x="4" y="4" width="16" height="16" rx="3" />
                          <path d="M9 9l6 6M15 9l-6 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-bark/60">
                No hay turnos próximos registrados.
              </p>
            )}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={showCancelDialog}
        title="¿Deseás cancelar este turno?"
        description="Liberaremos el horario seleccionado y podrás agendar una nueva fecha cuando lo necesites."
        confirmLabel="Cancelar turno"
        confirmClassName="bg-[#D9534F] text-white"
        onConfirm={handleConfirmCancel}
        onClose={closeCancelDialog}
      />
      <RescheduleDialog
        open={showRescheduleDialog}
        turno={turnoPendienteReprogramacion}
        nutricionistaId={nutricionistaId}
        onClose={closeRescheduleDialog}
        onConfirm={handleRescheduleConfirm}
        isProcessing={Boolean(
          processingTurnoId &&
            processingTurnoId === turnoPendienteReprogramacion?.id
        )}
      />
      {showCreatePatientModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-bark">
                  Agregar paciente manualmente
                </h3>
                <p className="mt-1 text-sm text-bark/60">
                  Completá los datos básicos para enviar la invitación y crear
                  una ficha temporal.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreatePatientModal}
                className="rounded-full border border-sand px-3 py-1 text-xs font-semibold text-bark/60 transition hover:border-bark/40 hover:text-bark"
              >
                Cerrar
              </button>
            </div>
            <form
              className="mt-4 flex flex-col gap-4"
              onSubmit={handleSubmitNewPatient}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-bark/70">
                  Nombre
                  <input
                    type="text"
                    value={newPatientData.nombre}
                    onChange={handleChangePatientField("nombre")}
                    className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-bark/70">
                  Apellido
                  <input
                    type="text"
                    value={newPatientData.apellido}
                    onChange={handleChangePatientField("apellido")}
                    className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
                    required
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1 text-sm text-bark/70">
                Correo electrónico
                <input
                  type="email"
                  value={newPatientData.email}
                  onChange={handleChangePatientField("email")}
                  className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
                  required
                />
              </label>
              {createPatientFeedback || createPatientError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {createPatientFeedback ?? createPatientError}
                </div>
              ) : null}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCreatePatientModal}
                  className="rounded-full border border-sand px-4 py-2 text-sm font-semibold text-bark/70 transition hover:border-bark/50 hover:text-bark"
                  disabled={creatingPatient}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingPatient}
                  className="inline-flex items-center gap-2 rounded-full bg-clay px-5 py-2 text-sm font-semibold text-white transition hover:bg-clay/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingPatient ? (
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : null}
                  {creatingPatient
                    ? "Enviando invitación..."
                    : "Guardar y enviar invitación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
