const computeImc = (peso, altura) => {
  const p = Number.parseFloat(peso ?? '');
  const h = Number.parseFloat(altura ?? '') / 100;
  if (!p || !h) return '';
  const value = p / (h * h);
  return Number.isFinite(value) ? value.toFixed(2) : '';
};

export default function MedidasForm({ data, onChange }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    const next = { [name]: value };
    if (name === 'peso' || name === 'altura') {
      const peso = name === 'peso' ? value : data.peso;
      const altura = name === 'altura' ? value : data.altura;
      next.imc = computeImc(peso, altura);
    }
    onChange(next);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[
        { name: 'peso', label: 'Peso (kg)' },
        { name: 'altura', label: 'Altura (cm)' },
        { name: 'imc', label: 'IMC', readOnly: true },
        { name: 'cintura', label: 'Perímetro cintura (cm)' },
        { name: 'cadera', label: 'Perímetro cadera (cm)' },
        { name: 'porcentaje_grasa', label: '% Grasa corporal' },
        { name: 'porcentaje_magra', label: '% Masa magra' },
        { name: 'meta_peso', label: 'Meta de peso (kg)' },
        { name: 'meta_semanal', label: 'Meta semanal (kg)' },
      ].map((field) => (
        <label key={field.name} className="flex flex-col gap-2 text-sm text-bark">
          {field.label}
          <input
            name={field.name}
            type="number"
            step="any"
            value={data[field.name] ?? ''}
            onChange={handleChange}
            readOnly={field.readOnly}
            className="rounded-xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
          />
        </label>
      ))}
      <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-bark">
        Observaciones de medidas
        <textarea
          name="observaciones_medidas"
          value={data.observaciones_medidas ?? ''}
          onChange={handleChange}
          rows={3}
          className="rounded-2xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
        />
      </label>
    </div>
  );
}
