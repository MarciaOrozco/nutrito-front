export default function ConsultaMotivoForm({ data, onChange }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange({ [name]: value });
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm text-bark">
        Motivo de consulta
        <textarea
          name="motivo"
          value={data.motivo ?? ''}
          onChange={handleChange}
          rows={4}
          className="rounded-2xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-bark">
        Antecedentes clínicos relevantes
        <textarea
          name="antecedentes"
          value={data.antecedentes ?? ''}
          onChange={handleChange}
          rows={4}
          className="rounded-2xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-bark">
        Objetivos del paciente
        <textarea
          name="objetivos"
          value={data.objetivos ?? ''}
          onChange={handleChange}
          rows={4}
          className="rounded-2xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
        />
      </label>
    </div>
  );
}
