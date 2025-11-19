const DURATION_OPTIONS = [
  { value: "20", label: "20 minutos" },
  { value: "30", label: "30 minutos" },
  { value: "60", label: "60 minutos" },
];

export default function ScheduleSetupModal({
  open,
  schedule,
  onClose,
  onToggleDay,
  onChangeField,
  onSave,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-sand px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-bark/60">
              Configuración semanal
            </p>
            <h3 className="text-2xl font-semibold text-bark">
              Elegí qué turnos ofrecer
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-sand px-4 py-2 text-sm font-semibold text-bark/70 transition hover:border-clay hover:text-clay"
          >
            Cerrar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="mb-4 text-sm text-bark/70">
            Indicá qué días y horarios vas a atender esta semana. Podés marcar días
            como no laborables y definir la duración de cada turno.
          </p>

          <div className="flex flex-col gap-4">
            {schedule?.length ? (
              schedule.map((day) => (
                <div
                  key={day.key}
                  className="flex flex-col gap-4 rounded-2xl border border-sand/80 bg-sand/30 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-bark">{day.label}</p>
                      <p className="text-sm text-bark/60">
                        {day.enabled
                          ? "Definí el intervalo de atención para este día."
                          : "No atenderás este día."}
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-bark/70">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-sand text-clay focus:ring-clay"
                        checked={!day.enabled}
                        onChange={() => onToggleDay?.(day.key)}
                      />
                      Día no laborable
                    </label>
                  </div>

                  {day.enabled ? (
                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="flex flex-col gap-1 text-sm font-medium text-bark/70">
                        Desde
                        <input
                          type="time"
                          value={day.start}
                          onChange={(event) =>
                            onChangeField?.(day.key, "start", event.target.value)
                          }
                          className="h-11 rounded-xl border border-sand bg-white px-3 font-semibold text-bark focus:border-clay focus:outline-none focus:ring-1 focus:ring-clay"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-medium text-bark/70">
                        Hasta
                        <input
                          type="time"
                          value={day.end}
                          onChange={(event) =>
                            onChangeField?.(day.key, "end", event.target.value)
                          }
                          className="h-11 rounded-xl border border-sand bg-white px-3 font-semibold text-bark focus:border-clay focus:outline-none focus:ring-1 focus:ring-clay"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-medium text-bark/70">
                        Duración del turno
                        <select
                          value={day.duration}
                          onChange={(event) =>
                            onChangeField?.(day.key, "duration", event.target.value)
                          }
                          className="h-11 rounded-xl border border-sand bg-white px-3 font-semibold text-bark focus:border-clay focus:outline-none focus:ring-1 focus:ring-clay"
                        >
                          {DURATION_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-sand/70 bg-sand/30 p-4 text-sm text-bark/70">
                No hay días configurados todavía.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-sand px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-sand px-5 py-2 text-sm font-semibold text-bark/70 transition hover:border-clay hover:text-clay"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-clay px-6 py-2 text-sm font-semibold text-white transition hover:bg-clay/90"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
