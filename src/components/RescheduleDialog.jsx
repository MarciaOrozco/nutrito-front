import { useEffect, useMemo, useState } from 'react';
import useAvailability from '../hooks/useAvailability.js';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function RescheduleDialog({
  open,
  turno,
  nutricionistaId,
  onClose,
  onConfirm,
  isProcessing = false,
}) {
  const {
    slots,
    loading: availabilityLoading,
    error: availabilityError,
    fetchAvailability,
  } = useAvailability();

  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    if (!open) return;
    const initialDate = turno?.fecha ?? todayISO();
    setSelectedDate(initialDate);
    setSelectedTime(turno?.hora ?? '');
  }, [open, turno]);

  useEffect(() => {
    if (!open || !selectedDate || !nutricionistaId) return;
    fetchAvailability({ nutricionistaId, date: selectedDate });
  }, [open, selectedDate, nutricionistaId, fetchAvailability]);

  useEffect(() => {
    if (!selectedTime) return;
    if (!slots.some((slot) => slot.time === selectedTime)) {
      setSelectedTime('');
    }
  }, [slots, selectedTime]);

  const canConfirm = useMemo(
    () =>
      Boolean(
        selectedDate &&
          selectedTime &&
          !availabilityLoading &&
          !isProcessing &&
          slots.some((slot) => slot.time === selectedTime),
      ),
    [selectedDate, selectedTime, availabilityLoading, isProcessing, slots],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-bark">Reprogramar turno</h3>
            <p className="mt-1 text-sm text-bark/70">
              Elegí una nueva fecha y horario disponible para este paciente.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-full border border-transparent px-2 py-1 text-sm text-bark/60 transition hover:text-bark disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {turno ? (
          <div className="mt-4 rounded-2xl border border-sand bg-bone/60 px-4 py-3 text-sm text-bark/80">
            <p>
              <strong>Paciente:</strong>{' '}
              {`${turno.paciente?.nombre ?? ''} ${turno.paciente?.apellido ?? ''}`.trim() ||
                'Sin nombre'}
            </p>
            <p>
              <strong>Turno actual:</strong>{' '}
              {turno.fecha ? new Date(turno.fecha).toLocaleDateString() : 'Sin fecha'}
              {turno.hora ? ` • ${turno.hora} hs` : ''}
            </p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-bark">
            Nueva fecha:
            <input
              type="date"
              min={todayISO()}
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              disabled={availabilityLoading || isProcessing}
              className="rounded-xl border border-sand bg-white px-4 py-2 text-sm font-normal text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <div className="flex flex-col gap-2 text-sm font-medium text-bark">
            <span>Nueva hora:</span>
            {availabilityLoading ? (
              <div className="flex flex-wrap gap-3">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={`slot-skeleton-${index}`}
                    className="h-10 w-24 animate-pulse rounded-full bg-bone"
                  />
                ))}
              </div>
            ) : slots.length ? (
              <div className="flex flex-wrap gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => setSelectedTime(slot.time)}
                    disabled={isProcessing}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedTime === slot.time
                        ? 'bg-clay text-white shadow-md'
                        : 'border border-sand text-bark hover:border-clay hover:text-clay'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {slot.label ?? `${slot.time} hs`}
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-sand bg-bone/60 px-4 py-3 text-sm text-bark/70">
                No hay horarios disponibles para la fecha seleccionada.
              </p>
            )}
            {availabilityError ? (
              <p className="text-xs text-red-500">{availabilityError}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-full border border-sand px-5 py-2 text-sm font-medium text-bark/80 transition hover:border-clay hover:text-clay disabled:cursor-not-allowed disabled:opacity-60"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={() => onConfirm({ fecha: selectedDate, hora: selectedTime })}
            disabled={!canConfirm}
            className="rounded-full bg-clay px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
