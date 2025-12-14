export default function ConsultaInfoForm({ data, onChange, readOnly = false }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    if (readOnly) return;
    onChange({ [name]: value });
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm text-bark">
        Fecha de consulta
        <input
          type="date"
          name="fecha_consulta"
          value={data.fecha_consulta?.slice(0, 10) ?? ''}
          onChange={handleChange}
          disabled={readOnly}
          className="rounded-xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-bark">
        Estado
        <select
          name="estado"
          value={data.estado ?? 'borrador'}
          onChange={handleChange}
          disabled={readOnly}
          className="rounded-xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
        >
          <option value="borrador">Borrador</option>
          <option value="guardada">Guardada</option>
          <option value="cerrada">Cerrada</option>
        </select>
      </label>
    </div>
  );
}
