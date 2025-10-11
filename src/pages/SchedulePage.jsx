import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ProfileHeader from "../components/ProfileHeader.jsx";
import ProfileSection from "../components/ProfileSection.jsx";
import useNutritionistProfile from "../hooks/useNutritionistProfile.js";
import useAvailability from "../hooks/useAvailability.js";
import useCreateAppointment from "../hooks/useCreateAppointment.js";
import useRescheduleAppointment from "../hooks/useRescheduleAppointment.js";
import useLinkPatientProfessional from "../hooks/useLinkPatientProfessional.js";
import { useAuth } from "../auth/useAuth.js";

const todayISO = () => new Date().toISOString().slice(0, 10);

const buildLocationOptions = (modalities = []) =>
  modalities
    .map((modality, index) => {
      const label =
        typeof modality === "string"
          ? modality
          : modality.name ?? modality.nombre ?? "";

      if (!label) return null;

      return {
        id:
          typeof modality === "string"
            ? `mod-${index}`
            : String(modality.id ?? modality.modalidad_id ?? `mod-${index}`),
        label,
        modalidadId:
          typeof modality === "string"
            ? null
            : Number(modality.id ?? modality.modalidad_id ?? NaN),
      };
    })
    .filter(Boolean);

const buildPaymentOptions = (paymentMethods = [], insuranceProviders = []) => {
  const normalizedMethods = paymentMethods.map((method, index) => ({
    id: method.id ?? `method-${index}`,
    name: method.name ?? `Método ${index + 1}`,
  }));

  const obraSocialMethod = normalizedMethods.find((method) =>
    method.name.toLowerCase().includes("obra")
  );

  const insuranceOptions = obraSocialMethod
    ? insuranceProviders.map((insurance) => ({
        id: `insurance-${insurance.id}`,
        label: `${insurance.name} (Obra social)`,
        methodId: obraSocialMethod.id,
        insuranceId: insurance.id,
        type: "insurance",
      }))
    : [];

  const methodOptions = normalizedMethods.map((method) => ({
    id: `method-${method.id}`,
    label: method.name,
    methodId: method.id,
    type: "method",
  }));

  return [...insuranceOptions, ...methodOptions];
};

export default function SchedulePage() {
  const { nutricionistaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const existingTurnoId = searchParams.get("turnoId");
  const isReschedule = Boolean(existingTurnoId);
  const { user } = useAuth();
  const pacienteId = user?.pacienteId ?? null;

  const {
    profile,
    fetchProfile,
    loading: loadingProfile,
    error: profileError,
  } = useNutritionistProfile();

  const {
    slots,
    error: availabilityError,
    loading: loadingSlots,
    source: availabilitySource,
    fetchAvailability,
  } = useAvailability();

  const {
    createAppointment,
    loading: bookingLoading,
    error: bookingError,
    resetError: resetBookingError,
  } = useCreateAppointment();
  const {
    reschedule,
    loading: rescheduleLoading,
    error: rescheduleError,
    resetError: resetRescheduleError,
  } = useRescheduleAppointment();
  const {
    link: linkPatientProfessional,
    error: linkError,
    resetError: resetLinkError,
  } = useLinkPatientProfessional();

  const [step, setStep] = useState("schedule");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPaymentOptionId, setSelectedPaymentOptionId] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const prefillDoneRef = useRef(false);
  const initialDateRef = useRef(null);
  const [flowError, setFlowError] = useState(null);

  useEffect(() => {
    fetchProfile(nutricionistaId);
  }, [nutricionistaId, fetchProfile]);

  useEffect(() => {
    if (!nutricionistaId || !selectedDate) return;
    fetchAvailability({ nutricionistaId, date: selectedDate });
  }, [nutricionistaId, selectedDate, fetchAvailability]);

  useEffect(() => {
    if (isReschedule) {
      if (initialDateRef.current && selectedDate === initialDateRef.current) {
        return;
      }
    }
    setSelectedTime("");
  }, [selectedDate, isReschedule]);

  useEffect(() => {
    if (selectedTime && !slots.some((slot) => slot.time === selectedTime)) {
      setSelectedTime("");
    }
  }, [slots, selectedTime]);

  const locationOptions = useMemo(
    () => buildLocationOptions(profile?.modalities),
    [profile?.modalities]
  );

  useEffect(() => {
    if (!selectedLocationId && locationOptions.length) {
      setSelectedLocationId(locationOptions[0].id);
    }
  }, [locationOptions, selectedLocationId]);

  useEffect(() => {
    if (!isReschedule || prefillDoneRef.current) return;
    const turno = location.state?.turno;
    if (!turno) return;

    if (turno.fecha) {
      initialDateRef.current = turno.fecha;
      setSelectedDate(turno.fecha);
    }

    if (locationOptions.length) {
      const matchById = locationOptions.find((option) =>
        turno.modalidadId
          ? Number(option.modalidadId) === Number(turno.modalidadId)
          : false
      );
      const match =
        matchById ??
        locationOptions.find((option) => option.label === turno.modalidad) ??
        null;
      if (match) {
        setSelectedLocationId(match.id);
      }
    }

    if (turno.hora) {
      setSelectedTime(turno.hora.slice(0, 5));
    }

    prefillDoneRef.current = true;
  }, [isReschedule, location.state, locationOptions]);

  const selectedLocation =
    locationOptions.find((option) => option.id === selectedLocationId) ?? null;

  const paymentOptions = useMemo(
    () =>
      buildPaymentOptions(
        profile?.paymentMethods ?? [],
        profile?.insuranceProviders ?? []
      ),
    [profile?.paymentMethods, profile?.insuranceProviders]
  );

  useEffect(() => {
    if (!selectedPaymentOptionId && paymentOptions.length) {
      setSelectedPaymentOptionId(paymentOptions[0].id);
    }
  }, [paymentOptions, selectedPaymentOptionId]);

  const selectedPaymentOption =
    paymentOptions.find((option) => option.id === selectedPaymentOptionId) ??
    null;

  const actionLoading = bookingLoading || rescheduleLoading;

  const canContinueSchedule =
    Boolean(selectedLocation && selectedDate && selectedTime) && !actionLoading;
  const canConfirmPayment =
    Boolean(selectedPaymentOption?.methodId) && !actionLoading;

  const handleBack = () => {
    if (step === "payment") {
      setStep("schedule");
      return;
    }
    navigate(-1);
  };

  const handleReset = () => {
    setShowConfirmation(false);
    setStep("schedule");
    setSelectedTime("");
    setSelectedPaymentOptionId("");
    setConfirmationData(null);
    resetBookingError();
    resetLinkError();
    resetRescheduleError();
    initialDateRef.current = null;
    prefillDoneRef.current = false;
  };

  const handleChangePayment = (value) => {
    resetBookingError();
    resetLinkError();
    resetRescheduleError();
    setSelectedPaymentOptionId(value);
  };

  const handleContinue = async () => {
    setFlowError(null);

    if (step === "schedule") {
      if (canContinueSchedule) {
        setStep("payment");
      }
      return;
    }

    if (!pacienteId) {
      setFlowError(
        "Debes iniciar sesión como paciente para completar el proceso."
      );
      return;
    }

    if (step === "payment" && selectedPaymentOption?.methodId) {
      const payload = {
        pacienteId,
        nutricionistaId: Number(nutricionistaId),
        fecha: selectedDate,
        hora: selectedTime,
        modalidadId: selectedLocation?.modalidadId ?? null,
        metodoPagoId: selectedPaymentOption.methodId,
      };

      if (isReschedule && existingTurnoId) {
        const result = await reschedule({
          turnoId: Number(existingTurnoId),
          pacienteId,
          fecha: selectedDate,
          hora: selectedTime,
        });

        if (result.success) {
          setConfirmationData({
            location: selectedLocation?.label ?? "Sin definir",
            date: selectedDate,
            time: selectedTime,
            payment: selectedPaymentOption.label,
          });
          setShowConfirmation(true);
        }
      } else {
        const result = await createAppointment(payload);

        if (result.success) {
          const linkResult = await linkPatientProfessional({
            pacienteId,
            nutricionistaId: Number(nutricionistaId),
          });

          setConfirmationData({
            location: selectedLocation?.label ?? "Sin definir",
            date: selectedDate,
            time: selectedTime,
            payment: selectedPaymentOption.label,
          });
          if (!linkResult.success) {
            console.error(
              "Error al vincular paciente y profesional:",
              linkResult.error
            );
          }

          setShowConfirmation(true);
        }
      }
    }
  };

  const renderSlots = () => {
    if (loadingSlots) {
      return (
        <div className="flex flex-wrap gap-3">
          {[...Array(4)].map((_, index) => (
            <div
              key={`slot-skeleton-${index}`}
              className="h-12 w-24 animate-pulse rounded-full bg-white/70"
            />
          ))}
        </div>
      );
    }

    if (!slots.length) {
      return (
        <p className="rounded-2xl border border-sand bg-bone p-4 text-sm text-bark/70">
          No hay horarios disponibles.
        </p>
      );
    }

    return (
      <div className="flex flex-wrap gap-3">
        {slots.map((slot) => (
          <button
            key={slot.time}
            type="button"
            onClick={() => setSelectedTime(slot.time)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedTime === slot.time
                ? "bg-clay text-white shadow-md"
                : "border border-sand text-bark hover:border-clay hover:text-clay"
            }`}
          >
            {slot.label ?? `${slot.time} hs`}
          </button>
        ))}
      </div>
    );
  };

  const renderScheduleStep = () => (
    <div className="rounded-3xl bg-white p-6 shadow-soft">
      <h2 className="text-xl font-semibold text-bark">
        {isReschedule
          ? "Reprogramar consulta"
          : "Agendar consulta con nutricionista"}
      </h2>
      <p className="mt-2 text-sm text-bark/70">
        {isReschedule
          ? "Actualiza el turno con el horario que mejor se adapte a tu agenda."
          : "Consulta las fechas y horarios disponibles para agendar tu cita."}
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm font-medium text-bark">
          Elige el lugar:
          <select
            value={selectedLocationId}
            onChange={(event) => setSelectedLocationId(event.target.value)}
            className="rounded-xl border border-sand bg-bone px-4 py-3 text-sm font-normal text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
          >
            {locationOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-bark">
          Elige la fecha:
          <input
            type="date"
            value={selectedDate}
            min={todayISO()}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="rounded-xl border border-sand bg-bone px-4 py-3 text-sm font-normal text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
          />
        </label>

        <div className="flex flex-col gap-2 text-sm font-medium text-bark">
          <span>Elige la hora:</span>
          {availabilityError ? (
            <p className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {availabilityError}
            </p>
          ) : null}
          {availabilitySource === "mock" ? (
            <p className="text-xs text-bark/50">
              Mostramos horarios simulados hasta conectar con la disponibilidad
              real.
            </p>
          ) : null}
          {renderSlots()}
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-full border border-sand px-5 py-2 text-sm font-semibold text-bark/70 transition hover:border-clay hover:text-clay"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinueSchedule}
          className="rounded-full bg-clay px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
        >
          Continuar
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="rounded-3xl bg-white p-6 shadow-soft">
      <h2 className="text-xl font-semibold text-bark">Elegir método de pago</h2>
      <p className="mt-2 text-sm text-bark/70">
        {isReschedule
          ? "Podés mantener o actualizar la forma de pago para tu nueva fecha."
          : "Este profesional acepta los siguientes métodos. Selecciona uno para continuar."}
      </p>

      {profile?.insuranceProviders?.length ? (
        <div className="mt-4 rounded-2xl border border-sand bg-bone p-4 text-sm text-bark/80">
          <p className="font-semibold text-bark">
            Este profesional acepta OBRA SOCIAL.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.insuranceProviders.map((insurance) => (
              <span
                key={insurance.id}
                className="rounded-full border border-sand px-3 py-1 text-xs text-bark/70"
              >
                {insurance.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-5">
        <ProfileSection title="Resumen de la cita" className="bg-bone">
          <ul className="text-sm text-bark/80">
            <li>
              <strong>Lugar:</strong> {selectedLocation?.label ?? "Sin definir"}
            </li>
            <li>
              <strong>Fecha:</strong>{" "}
              {new Date(selectedDate).toLocaleDateString()}
            </li>
            <li>
              <strong>Hora:</strong> {selectedTime || "Sin seleccionar"}
            </li>
          </ul>
        </ProfileSection>

        <label className="flex flex-col gap-2 text-sm font-medium text-bark">
          Selecciona obra social o método de pago
          <select
            value={selectedPaymentOptionId}
            onChange={(event) => handleChangePayment(event.target.value)}
            disabled={paymentOptions.length === 0}
            className="rounded-xl border border-sand bg-bone px-4 py-3 text-sm font-normal text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
          >
            {paymentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
            {paymentOptions.length === 0 ? (
              <option value="">Sin métodos disponibles</option>
            ) : null}
          </select>
          {paymentOptions.length === 0 ? (
            <span className="text-xs text-bark/60">
              Este profesional aún no cargó métodos de pago. Por favor, intenta
              más tarde.
            </span>
          ) : null}
        </label>

        {!isReschedule && bookingError ? (
          <p className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            {bookingError}
          </p>
        ) : null}
        {!isReschedule && linkError ? (
          <p className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            No se pudo guardar el vínculo paciente–profesional. Podrás
            intentarlo nuevamente más tarde.
          </p>
        ) : null}
        {isReschedule && rescheduleError ? (
          <p className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            {rescheduleError}
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setStep("schedule")}
          className="rounded-full border border-sand px-5 py-2 text-sm font-semibold text-bark/70 transition hover:border-clay hover:text-clay"
        >
          Volver
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canConfirmPayment}
          className="rounded-full bg-clay px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
        >
          {actionLoading
            ? "Guardando..."
            : isReschedule
            ? "Guardar cambios"
            : "Confirmar turno"}
        </button>
      </div>
    </div>
  );

  const confirmationTitle = isReschedule
    ? "¡Turno reprogramado con éxito!"
    : "¡Turno agendado con éxito!";
  const confirmationDescription = isReschedule
    ? "Actualizamos la información de tu turno. Recibirás la confirmación en tu correo."
    : "Guardamos tu selección. Podrás gestionar el turno desde tu panel de paciente en la próxima iteración.";

  const renderConfirmation = () => (
    <div className="rounded-3xl bg-white p-6 text-center shadow-soft">
      <h2 className="text-xl font-semibold text-bark">{confirmationTitle}</h2>
      <p className="mt-4 text-sm text-bark/70">{confirmationDescription}</p>

      {confirmationData ? (
        <div className="mt-6 text-sm text-bark/80">
          <p>
            <strong>Lugar:</strong> {confirmationData.location}
          </p>
          <p>
            <strong>Fecha:</strong>{" "}
            {new Date(confirmationData.date).toLocaleDateString()}
          </p>
          <p>
            <strong>Hora:</strong> {confirmationData.time}
          </p>
          <p>
            <strong>Método de pago:</strong> {confirmationData.payment}
          </p>
        </div>
      ) : null}

      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/buscar")}
          className="rounded-full border border-sand px-5 py-2 text-sm font-semibold text-bark/70 transition hover:border-clay hover:text-clay"
        >
          Ir a la búsqueda
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-full bg-clay px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          Agendar otro turno
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (showConfirmation) return renderConfirmation();
    if (step === "payment") return renderPaymentStep();
    return renderScheduleStep();
  };

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-full border border-sand px-4 py-2 text-sm font-medium text-bark/80 transition hover:border-clay hover:text-clay"
        >
          <span aria-hidden="true">←</span>
          Volver
        </button>
        <p className="text-xs uppercase tracking-widest text-bark/60">
          {isReschedule ? "Reprogramar turno" : "Agendar turno"}
        </p>
      </div>

      {flowError ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {flowError}
        </div>
      ) : null}

      {profileError ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {profileError}
        </div>
      ) : null}

      {profile ? (
        <ProfileHeader profile={profile} showAction={false} />
      ) : loadingProfile ? (
        <div className="h-40 animate-pulse rounded-3xl bg-white/60 shadow-soft" />
      ) : null}

      <div className="mx-auto w-full max-w-3xl">{renderContent()}</div>
    </section>
  );
}
