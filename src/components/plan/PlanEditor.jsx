import { useMemo, useState } from 'react';
import PlanForm from './PlanForm.jsx';
import DayEditor from './DayEditor.jsx';
import PreviewPlan from './PreviewPlan.jsx';
import useMeals from '../../hooks/useMeals.js';

const buildMetadataFromPlan = (plan) => ({
  title: plan?.title ?? '',
  notes: plan?.notes ?? '',
  patientInfo: plan?.patientInfo ?? {},
  objectives: plan?.objectives ?? {},
  medicalConditions: plan?.medicalConditions ?? {},
  restrictions: plan?.restrictions ?? {},
  preferences: plan?.preferences ?? {},
});

const tabs = [
  { id: 'detalles', label: 'Informacion' },
  { id: 'plan', label: 'Plan semanal' },
  { id: 'preview', label: 'Previsualizacion' },
];

export default function PlanEditor({
  value,
  onChange,
  onSave,
  onValidate,
  onExport,
  saving = false,
  validating = false,
  exporting = false,
  disabled = false,
}) {
  const [activeTab, setActiveTab] = useState('plan');
  const plan = value;
  const mealsManager = useMeals(onChange);

  const metadata = useMemo(() => buildMetadataFromPlan(plan), [plan]);

  if (!plan) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-soft">
        <p className="text-sm text-bark/60">Cargando plan alimentario...</p>
      </div>
    );
  }

  const handleMetadataChange = (nextMetadata) => {
    onChange((current) => {
      if (!current) return current;
      return {
        ...current,
        title: nextMetadata.title ?? '',
        notes: nextMetadata.notes ?? '',
        patientInfo: nextMetadata.patientInfo ?? {},
        objectives: nextMetadata.objectives ?? {},
        medicalConditions: nextMetadata.medicalConditions ?? {},
        restrictions: nextMetadata.restrictions ?? {},
        preferences: nextMetadata.preferences ?? {},
      };
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-bark/50">
            Plan #{plan.planId}
          </p>
          <h1 className="text-2xl font-semibold text-bark">
            {plan.title || 'Plan sin titulo'}
          </h1>
          <p className="text-sm text-bark/60">
            Estado actual: <span className="font-semibold text-clay">{plan.status}</span> ·
            Origen: {plan.origin}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className="rounded-full border border-sand px-4 py-2 text-sm font-semibold text-bark/70 hover:border-clay hover:text-clay"
          >
            Previsualizar
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="rounded-full border border-clay px-4 py-2 text-sm font-semibold text-clay hover:bg-clay hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? 'Generando PDF...' : 'Exportar PDF'}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white hover:bg-clay/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={validating}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {validating ? 'Validando...' : 'Validar plan'}
          </button>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'bg-clay text-white shadow-soft'
                : 'bg-white text-bark/70 shadow-sm hover:text-clay'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'detalles' ? (
        <PlanForm
          value={metadata}
          onChange={handleMetadataChange}
          disabled={disabled}
          title="Editar detalles del plan"
          description="Actualiza la informacion general, objetivos y restricciones."
        />
      ) : null}

      {activeTab === 'plan' ? (
        <div className="flex flex-col gap-4">
          {plan.days?.length ? (
            plan.days.map((day) => (
              <DayEditor
                key={day.dayId ?? day.dayNumber}
                day={day}
                disabled={disabled}
                onChange={(updatedDay) =>
                  mealsManager.updateDayInfo(day.dayNumber, updatedDay)
                }
                onUpdateMeal={(dayNumber, index, updatedMeal) =>
                  mealsManager.updateMeal(dayNumber, index, updatedMeal)
                }
                onAddMeal={(dayNumber) =>
                  mealsManager.addMeal(dayNumber, {
                    order: (day.meals?.length ?? 0) + 1,
                    type: 'Comida',
                  })
                }
                onRemoveMeal={(dayNumber, index) =>
                  mealsManager.removeMeal(dayNumber, index)
                }
                onUpdateTotals={(dayNumber, totals) =>
                  mealsManager.updateDayTotals(dayNumber, totals)
                }
              />
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-sand bg-white p-8 text-center shadow-soft">
              <p className="text-sm text-bark/60">
                Este plan aun no tiene dias configurados. Genera un plan con IA o crea un borrador
                manual para comenzar.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {activeTab === 'preview' ? <PreviewPlan plan={plan} /> : null}
    </div>
  );
}
