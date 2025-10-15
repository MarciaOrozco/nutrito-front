import { useEffect, useMemo, useState } from "react";
import useNutritionistProfile from "../../hooks/useNutritionistProfile.js";
import useAvailability from "../../hooks/useAvailability.js";
import useCreateAppointment from "../../hooks/useCreateAppointment.js";
import {
  todayISO,
  buildLocationOptions,
  buildPaymentOptions,
} from "../../utils/scheduleUtils.js";

const DURATION_OPTIONS = [30, 45, 60];

const isOnlineLabel = (label) =>
  typeof label === "string" && label.toLowerCase().includes("online");

const showToast = (message, type = "success") => {
  const toastApi = window?.toast;
  if (toastApi && typeof toastApi[type] === "function") {
    toastApi[type](message);
    return;
  }
  if (type === "error") {
    window.alert?.(message);
  } else {
    console.log(message);
  }
};

export default function ProgramarProximaCita({
  pacienteId,
  nutricionistaId,
  consultaId,
  onSuccess,
}) {
  const {
    profile,
    fetchProfile,
    error: profileError,
  } = useNutritionistProfile();
  const {
    slots,
    loading: loadingAvailability,
    error: availabilityError,
    fetchAvailability,
  } = useAvailability();
  const {
    createAppointment,
    loading: creatingAppointment,
    error: bookingError,
  } = useCreateAppointment();

  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedPaymentOptionId, setSelectedPaymentOptionId] = useState("");
  const [duration, setDuration] = useState(45);
  const [notes, setNotes] = useState("");
  const [locationDetail, setLocationDetail] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState("success");

  useEffect(() => {
    if (nutricionistaId) {
      fetchProfile(nutricionistaId);
    }
  }, [nutricionistaId, fetchProfile]);

  useEffect(() => {
    if (!nutricionistaId || !selectedDate) return;
    fetchAvailability({ nutricionistaId, date: selectedDate });
  }, [nutricionistaId, selectedDate, fetchAvailability]);

  useEffect(() => {
    const locationOptions = buildLocationOptions(profile?.modalities ?? []);
    if (!locationOptions.length) return;

    if (!selectedLocationId) {
      const onlineOption = locationOptions.find((option) =>
        isOnlineLabel(option.label)
      );
      setSelectedLocationId((onlineOption ?? locationOptions[0]).id);
    }
  }, [profile?.modalities, selectedLocationId]);

  const locationOptions = useMemo(
    () => buildLocationOptions(profile?.modalities ?? []),
    [profile?.modalities]
  );

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

  const selectedLocation = locationOptions.find(
    (option) => option.id === selectedLocationId
  );
  const selectedPaymentOption = paymentOptions.find(
    (option) => option.id === selectedPaymentOptionId
  );

  useEffect(() => {
    if (!selectedLocation) {
      setLocationDetail("");
      return;
    }
    if (isOnlineLabel(selectedLocation.label)) {
      setLocationDetail((prev) => prev || "https://");
    } else {
      setLocationDetail((prev) => prev || "");
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedTime && !slots.some((slot) => slot.time === selectedTime)) {
      setSelectedTime("");
    }
  }, [slots, selectedTime]);

  const handleSelectSlot = (time) => {
    setSelectedTime(time);
    setStatusMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!pacienteId || !nutricionistaId) {
      setStatusType("error");
      setStatusMessage("No se encontró la información del paciente.");
      return;
    }

    if (!selectedDate || !selectedTime) {
      setStatusType("error");
      setStatusMessage("Completá la fecha y hora para continuar.");
      return;
    }

    const payload = {
      pacienteId: Number(pacienteId),
      nutricionistaId: Number(nutricionistaId),
      fecha: selectedDate,
      hora: selectedTime,
      modalidadId: selectedLocation?.modalidadId ?? null,
      metodoPagoId: selectedPaymentOption?.methodId ?? null,
      consultaId: consultaId ? Number(consultaId) : null,
      duracionMinutos: duration ? Number(duration) : null,
      notas: notes?.trim() ? notes.trim() : null,
      ubicacion: !selectedLocation
        ? null
        : isOnlineLabel(selectedLocation.label)
        ? null
        : locationDetail?.trim() || null,
      linkReunion:
        selectedLocation && isOnlineLabel(selectedLocation.label)
          ? locationDetail?.trim() || null
          : null,
    };

    const result = await createAppointment(payload);

    if (result.success) {
      setStatusType("success");
      setStatusMessage("Próxima cita programada correctamente");
      showToast("Próxima cita programada correctamente", "success");
      if (typeof onSuccess === "function") {
        onSuccess(result.data ?? null);
      }
      setSelectedTime("");
      fetchAvailability({ nutricionistaId, date: selectedDate });
    } else {
      const status = result.error?.response?.status;
      if (status === 409) {
        setStatusMessage("Horario no disponible");
      } else {
        setStatusMessage("Error al programar la cita. Intentá nuevamente.");
      }
      setStatusType("error");
      showToast(
        status === 409
          ? "Horario no disponible"
          : "Error al programar la cita. Intentá nuevamente.",
        "error"
      );
    }
  };

  const renderSlots = () => {
    if (loadingAvailability) {
      return (
        <div className="flex flex-wrap gap-3">
          {[...Array(4)].map((_, index) => (
            <div
              key={`slot-skeleton-${index}`}
              className="h-10 w-20 animate-pulse rounded-full bg-bone"
            />
          ))}
        </div>
      );
    }

    if (!slots.length) {
      return (
        <p className="rounded-2xl border border-sand bg-bone p-3 text-sm text-bark/70">
          No hay horarios disponibles para la fecha seleccionada.
        </p>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => (
          <button
            key={slot.time}
            type="button"
            onClick={() => handleSelectSlot(slot.time)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedTime === slot.time
                ? "bg-clay text-white shadow"
                : "border border-sand text-bark hover:border-clay hover:text-clay"
            }`}
          >
            {slot.label ?? `${slot.time} hs`}
          </button>
        ))}
      </div>
    );
  };

  const canSubmit =
    !!selectedDate &&
    !!selectedTime &&
    !!selectedLocationId &&
    !!selectedPaymentOptionId &&
    !creatingAppointment;

  return (
    <div className="rounded-2xl bg-bone p-4">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-bark/50">
            Modalidad
          </label>
          <select
            value={selectedLocationId}
            onChange={(event) => setSelectedLocationId(event.target.value)}
            className="rounded-xl border border-sand bg-white px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
            disabled={!locationOptions.length}
          >
            {locationOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs text-bark/60">
            Fecha
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              min={todayISO()}
              className="rounded-xl border border-sand bg-white px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
            />
          </label>
          <div className="flex flex-col gap-2 text-xs text-bark/60">
            <span>Horarios disponibles</span>
            {availabilityError ? (
              <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {availabilityError}
              </p>
            ) : null}
            {renderSlots()}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs text-bark/60">
            Duración (minutos)
            <select
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className="rounded-xl border border-sand bg-white px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
            >
              {DURATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} min
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-xs text-bark/60">
            Método de pago
            <select
              value={selectedPaymentOptionId}
              onChange={(event) =>
                setSelectedPaymentOptionId(event.target.value)
              }
              className="rounded-xl border border-sand bg-white px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
              disabled={!paymentOptions.length}
            >
              {paymentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-2 text-xs text-bark/60">
          Notas adicionales
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="min-h-[80px] rounded-xl border border-sand bg-white px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
            placeholder="Objetivo, recordatorios o preparación del paciente"
          />
        </label>

        {statusMessage ? (
          <p
            className={`rounded-xl border px-3 py-2 text-sm ${
              statusType === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {statusMessage}
          </p>
        ) : null}
        {bookingError ? (
          <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {bookingError}
          </p>
        ) : null}
        {profileError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
            {profileError}
          </p>
        ) : null}

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-full bg-clay px-5 py-2 text-sm font-semibold text-white transition hover:bg-clay/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creatingAppointment ? "Guardando..." : "Programar cita"}
          </button>
        </div>
      </form>
    </div>
  );
}
