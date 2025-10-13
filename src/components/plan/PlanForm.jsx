import { useMemo } from 'react';

const medicalConditionsOptions = [
  'Diabetes',
  'Hipertension',
  'Colesterol alto',
  'Enfermedad celiaca',
  'Hipotiroidismo',
  'Sindrome metabolico',
];

const allergyOptions = [
  'Frutos secos',
  'Lacteos',
  'Gluten',
  'Mariscos',
  'Huevos',
  'Soja',
];

const dietTypes = [
  'Equilibrada',
  'Hipocalorica',
  'Hipercalorica',
  'Vegetariana',
  'Vegana',
  'Cetogenica',
];

const activityLevels = [
  'Sedentaria',
  'Ligera',
  'Moderada',
  'Alta',
  'Atleta',
];

const updateNested = (metadata, section, field, value) => {
  const previousSection = metadata?.[section] ?? {};
  return {
    ...metadata,
    [section]: {
      ...previousSection,
      [field]: value,
    },
  };
};

const toggleFromList = (list = [], item) => {
  if (list.includes(item)) {
    return list.filter((value) => value !== item);
  }
  return [...list, item];
};

export default function PlanForm({
  value = {},
  onChange,
  disabled = false,
  title = 'Crear plan alimentario',
  description = 'Completa la informacion del paciente para iniciar el plan.',
  children,
}) {
  const metadata = useMemo(() => value ?? {}, [value]);
  const patientInfo = metadata.patientInfo ?? {};
  const objectives = metadata.objectives ?? {};
  const medicalConditions = metadata.medicalConditions ?? {};
  const restrictions = metadata.restrictions ?? {};
  const preferences = metadata.preferences ?? {};

  const handleChange = (next) => {
    onChange?.(next);
  };

  const updatePatientInfo = (field, raw) => {
    const next = updateNested(metadata, 'patientInfo', field, raw);
    handleChange(next);
  };

  const updateObjectives = (field, raw) => {
    const next = updateNested(metadata, 'objectives', field, raw);
    handleChange(next);
  };

  const updateMedical = (field, raw) => {
    const next = updateNested(metadata, 'medicalConditions', field, raw);
    handleChange(next);
  };

  const updateRestrictions = (field, raw) => {
    const next = updateNested(metadata, 'restrictions', field, raw);
    handleChange(next);
  };

  const updatePreferences = (field, raw) => {
    const next = updateNested(metadata, 'preferences', field, raw);
    handleChange(next);
  };

  const updateTitle = (raw) => {
    handleChange({
      ...metadata,
      title: raw,
    });
  };

  const updateNotes = (raw) => {
    handleChange({
      ...metadata,
      notes: raw,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-bark/50">
          Planes alimentarios
        </p>
        <h1 className="text-2xl font-semibold text-bark">{title}</h1>
        <p className="text-sm text-bark/60">{description}</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-bark">Informacion basica</h2>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-bark/80">
              Edad
              <input
                type="number"
                min="0"
                value={patientInfo.age ?? ''}
                onChange={(event) => updatePatientInfo('age', event.target.value)}
                disabled={disabled}
                className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-bark/80">
              Sexo
              <select
                value={patientInfo.sex ?? ''}
                onChange={(event) => updatePatientInfo('sex', event.target.value)}
                disabled={disabled}
                className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
              >
                <option value="">Seleccionar</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
                <option value="Otro">Otro</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-bark/80">
              Peso (kg)
              <input
                type="number"
                min="0"
                step="0.1"
                value={patientInfo.weight ?? ''}
                onChange={(event) => updatePatientInfo('weight', event.target.value)}
                disabled={disabled}
                className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-bark/80">
              Altura (cm)
              <input
                type="number"
                min="0"
                step="0.1"
                value={patientInfo.height ?? ''}
                onChange={(event) => updatePatientInfo('height', event.target.value)}
                disabled={disabled}
                className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-bark/80">
              Nivel de actividad
              <select
                value={patientInfo.activityLevel ?? ''}
                onChange={(event) => updatePatientInfo('activityLevel', event.target.value)}
                disabled={disabled}
                className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
              >
                <option value="">Seleccionar nivel</option>
                {activityLevels.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-bark">Objetivos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-bark/80 sm:col-span-2">
              Titulo del plan
              <input
                type="text"
                value={metadata.title ?? ''}
                onChange={(event) => updateTitle(event.target.value)}
                disabled={disabled}
                className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-bark/80 sm:col-span-2">
              Objetivo principal
              <input
                type="text"
                value={objectives.primary ?? ''}
                onChange={(event) => updateObjectives('primary', event.target.value)}
                disabled={disabled}
                className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-bark/80 sm:col-span-2">
              Objetivo secundario
              <input
                type="text"
                value={objectives.secondary ?? ''}
                onChange={(event) => updateObjectives('secondary', event.target.value)}
                disabled={disabled}
                className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-bark/80">
              Peso objetivo (kg)
              <input
                type="number"
                min="0"
                step="0.1"
                value={objectives.targetWeight ?? ''}
                onChange={(event) => updateObjectives('targetWeight', event.target.value)}
                disabled={disabled}
                className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-bark/80">
              Tiempo estimado
              <input
                type="text"
                value={objectives.timeframe ?? ''}
                onChange={(event) => updateObjectives('timeframe', event.target.value)}
                disabled={disabled}
                className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-bark">Condiciones medicas</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {medicalConditionsOptions.map((option) => {
              const selected = medicalConditions.conditions ?? [];
              const checked = selected.includes(option);
              return (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                    checked
                      ? 'border-clay bg-clay text-white'
                      : 'border-sand bg-white text-bark/70 hover:border-clay/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={() =>
                      updateMedical(
                        'conditions',
                        toggleFromList(selected, option),
                      )
                    }
                    disabled={disabled}
                  />
                  {option}
                </label>
              );
            })}
          </div>
          <label className="mt-4 flex flex-col gap-1 text-sm text-bark/80">
            Otras condiciones
            <textarea
              value={medicalConditions.notes ?? ''}
              onChange={(event) => updateMedical('notes', event.target.value)}
              disabled={disabled}
              className="min-h-[96px] rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
            />
          </label>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-bark">
            Restricciones y preferencias
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {allergyOptions.map((option) => {
              const selected = restrictions.allergies ?? [];
              const checked = selected.includes(option);
              return (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                    checked
                      ? 'border-clay bg-clay text-white'
                      : 'border-sand bg-white text-bark/70 hover:border-clay/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={() =>
                      updateRestrictions(
                        'allergies',
                        toggleFromList(selected, option),
                      )
                    }
                    disabled={disabled}
                  />
                  {option}
                </label>
              );
            })}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-bark/80">
              Tipo de dieta
              <select
                value={restrictions.dietType ?? ''}
                onChange={(event) => updateRestrictions('dietType', event.target.value)}
                disabled={disabled}
                className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
              >
                <option value="">Seleccionar</option>
                {dietTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-bark/80">
              Alimentos que no prefiere
              <input
                type="text"
                value={restrictions.dislikes?.join(', ') ?? ''}
                onChange={(event) =>
                  updateRestrictions(
                    'dislikes',
                    event.target.value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  )
                }
                disabled={disabled}
                className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
              />
            </label>
          </div>
          <label className="mt-4 flex flex-col gap-1 text-sm text-bark/80">
            Observaciones adicionales
            <textarea
              value={restrictions.other ?? ''}
              onChange={(event) => updateRestrictions('other', event.target.value)}
              disabled={disabled}
              className="min-h-[96px] rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-bark">
          Preferencias adicionales
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-bark/80">
            Alimentos favoritos
            <input
              type="text"
              value={preferences.likedFoods?.join(', ') ?? ''}
              onChange={(event) =>
                updatePreferences(
                  'likedFoods',
                  event.target.value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
              disabled={disabled}
              className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-bark/80">
            Alimentos a evitar
            <input
              type="text"
              value={preferences.dislikedFoods?.join(', ') ?? ''}
              onChange={(event) =>
                updatePreferences(
                  'dislikedFoods',
                  event.target.value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
              disabled={disabled}
              className="rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
            />
          </label>
        </div>
        <label className="mt-4 flex flex-col gap-1 text-sm text-bark/80">
          Notas generales
          <textarea
            value={metadata.notes ?? preferences.notes ?? ''}
            onChange={(event) => {
              updateNotes(event.target.value);
              updatePreferences('notes', event.target.value);
            }}
            disabled={disabled}
            className="min-h-[96px] rounded-xl border border-sand px-3 py-2 text-bark focus:border-clay focus:outline-none"
          />
        </label>
      </section>

      {children ? <div className="mt-2 flex flex-wrap gap-3">{children}</div> : null}
    </div>
  );
}
