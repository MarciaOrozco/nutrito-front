import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProfileHeader from '../components/ProfileHeader.jsx';
import ProfileSection from '../components/ProfileSection.jsx';
import useNutritionistProfile from '../hooks/useNutritionistProfile.js';
import useAvailability from '../hooks/useAvailability.js';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function SchedulePage() {
  const { nutricionistaId } = useParams();
  const navigate = useNavigate();

  const { profile, fetchProfile, loading: loadingProfile, error: profileError } =
    useNutritionistProfile();
  const {
    slots,
    error: availabilityError,
    loading: loadingSlots,
    source: availabilitySource,
    fetchAvailability,
  } = useAvailability();

  const [step, setStep] = useState('schedule');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    fetchProfile(nutricionistaId);
  }, [nutricionistaId, fetchProfile]);

  useEffect(() => {
    if (!nutricionistaId || !selectedDate) return;
    fetchAvailability({ nutricionistaId, date: selectedDate });
  }, [nutricionistaId, selectedDate, fetchAvailability]);

  useEffect(() => {
    setSelectedTime('');
  }, [selectedDate]);

  useEffect(() => {
    if (selectedTime && !slots.some((slot) => slot.time === selectedTime)) {
      setSelectedTime('');
    }
  }, [slots, selectedTime]);

  useEffect(() => {
    if (!selectedLocation && profile?.modalities?.length) {
      setSelectedLocation(profile.modalities[0]);
    }
  }, [profile?.modalities, selectedLocation]);

  const locations = useMemo(
    () => profile?.modalities ?? ['Consulta presencial', 'Consulta virtual'],
    [profile?.modalities],
  );

  const paymentMethods = useMemo(
    () => profile?.paymentMethods ?? [],
    [profile?.paymentMethods],
  );

  useEffect(() => {
    if (!selectedPayment && paymentMethods.length) {
      setSelectedPayment(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedPayment]);

  const canContinueSchedule = Boolean(selectedLocation && selectedDate && selectedTime);
  const canConfirmPayment = Boolean(selectedPayment);

  const handleContinue = () => {
    if (step === 'schedule' && canContinueSchedule) {
      setStep('payment');
    } else if (step === 'payment' && canConfirmPayment) {
      setShowConfirmation(true);
    }
  };

  const handleReset = () => {
    setShowConfirmation(false);
    setStep('schedule');
    setSelectedTime('');
  };

  const handleBack = () => {
    if (step === 'payment') {
      setStep('schedule');
      return;
    }
    navigate(-1);
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
          No hay turnos disponibles.
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
                ? 'bg-clay text-white shadow-md'
                : 'border border-sand text-bark hover:border-clay hover:text-clay'
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
      <h2 className="text-xl font-semibold text-bark">Agendar consulta con nutricionista</h2>
      <p className="mt-2 text-sm text-bark/70">
        Consulta las fechas y horarios disponibles para agendar tu cita.
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm font-medium text-bark">
          Elige el lugar:
          <select
            value={selectedLocation}
            onChange={(event) => setSelectedLocation(event.target.value)}
            className="rounded-xl border border-sand bg-bone px-4 py-3 text-sm font-normal text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
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
          {availabilitySource === 'mock' ? (
            <p className="text-xs text-bark/50">
              Mostramos horarios simulados hasta conectar con la disponibilidad real.
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
        Este profesional acepta los siguientes métodos. Selecciona uno para continuar.
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <ProfileSection title="Resumen de la cita" className="bg-bone">
          <ul className="text-sm text-bark/80">
            <li>
              <strong>Lugar:</strong> {selectedLocation}
            </li>
            <li>
              <strong>Fecha:</strong> {new Date(selectedDate).toLocaleDateString()}
            </li>
            <li>
              <strong>Hora:</strong> {selectedTime}
            </li>
          </ul>
        </ProfileSection>

        <label className="flex flex-col gap-2 text-sm font-medium text-bark">
          Selecciona un método de pago
          <select
            value={selectedPayment}
            onChange={(event) => setSelectedPayment(event.target.value)}
            className="rounded-xl border border-sand bg-bone px-4 py-3 text-sm font-normal text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
          >
            {paymentMethods.length ? (
              paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))
            ) : (
              <option value="manual">Acordar en consulta</option>
            )}
          </select>
        </label>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setStep('schedule')}
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
          Confirmar turno
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="rounded-3xl bg-white p-6 text-center shadow-soft">
      <h2 className="text-xl font-semibold text-bark">¡Turno reservado!</h2>
      <p className="mt-4 text-sm text-bark/70">
        Guardamos tu selección. Podrás gestionar el turno desde tu panel de paciente en la próxima
        iteración.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/buscar')}
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
    if (step === 'payment') return renderPaymentStep();
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
          CU-001-003 Agendar turno
        </p>
      </div>

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
