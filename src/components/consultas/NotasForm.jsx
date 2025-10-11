export default function NotasForm({ data, onChange }) {
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    onChange({ [name]: type === 'checkbox' ? (checked ? 'profesional' : 'paciente') : value });
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm text-bark">
        Resumen de consulta
        <textarea
          name="resumen"
          value={data.resumen ?? ''}
          onChange={handleChange}
          rows={4}
          className="rounded-2xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-bark">
        Diagnóstico
        <textarea
          name="diagnostico"
          value={data.diagnostico ?? ''}
          onChange={handleChange}
          rows={4}
          className="rounded-2xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-bark">
        Indicaciones
        <textarea
          name="indicaciones"
          value={data.indicaciones ?? ''}
          onChange={handleChange}
          rows={4}
          className="rounded-2xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-bark">
        Observaciones internas
        <textarea
          name="observaciones_internas"
          value={data.observaciones_internas ?? ''}
          onChange={handleChange}
          rows={4}
          className="rounded-2xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
        />
      </label>
      <label className="flex items-center gap-3 text-sm text-bark">
        <input
          type="checkbox"
          name="visibilidad_notas"
          checked={(data.visibilidad_notas ?? 'profesional') === 'profesional'}
          onChange={handleChange}
        />
        Sólo visible para el profesional
      </label>
    </div>
  );
}
