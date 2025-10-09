import { useEffect, useState } from 'react';

export default function SearchBar({ initialValues, onSearch, loading }) {
  const [formValues, setFormValues] = useState({
    name: '',
    specialty: '',
  });

  useEffect(() => {
    setFormValues({
      name: initialValues.name ?? '',
      specialty: initialValues.specialty ?? '',
    });
  }, [initialValues.name, initialValues.specialty]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(formValues);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-4 rounded-3xl bg-white p-6 shadow-soft lg:flex-row lg:items-end"
    >
      <div className="flex flex-1 flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-bark/70">
          Nombre del especialista
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Ej. Marcia, Andrea, Daniela..."
          className="rounded-xl border border-sand/60 bg-bone px-4 py-3 text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
          value={formValues.name}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <label htmlFor="specialty" className="text-sm font-medium text-bark/70">
          Especialidad
        </label>
        <input
          id="specialty"
          name="specialty"
          type="text"
          placeholder="Ej. Nutrición clínica, deportiva..."
          className="rounded-xl border border-sand/60 bg-bone px-4 py-3 text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
          value={formValues.specialty}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-clay px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-600 disabled:opacity-70 lg:w-auto"
        disabled={loading}
      >
        {loading ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  );
}
