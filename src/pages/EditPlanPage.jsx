import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PlanEditor from '../components/plan/PlanEditor.jsx';
import usePlan from '../hooks/usePlan.js';

const normalizeId = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const buildPayloadFromPlan = (plan) => ({
  metadata: {
    title: plan.title,
    notes: plan.notes,
    patientInfo: plan.patientInfo,
    objectives: plan.objectives,
    medicalConditions: plan.medicalConditions,
    restrictions: plan.restrictions,
    preferences: plan.preferences,
  },
  days: (plan.days ?? []).map((day, index) => ({
    dayId: day.dayId,
    planId: day.planId,
    dayNumber: day.dayNumber ?? index + 1,
    name: day.name,
    goal: day.goal,
    notes: day.notes,
    totals: day.totals,
    meals: (day.meals ?? []).map((meal, mealIndex) => ({
      mealId: meal.mealId,
      dayId: meal.dayId,
      order: meal.order ?? mealIndex + 1,
      type: meal.type,
      title: meal.title,
      description: meal.description,
      time: meal.time,
      calories: meal.calories,
      proteins: meal.proteins,
      carbs: meal.carbs,
      fats: meal.fats,
      fiber: meal.fiber,
      foods: meal.foods,
      notes: meal.notes,
    })),
  })),
});

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default function EditPlanPage() {
  const params = useParams();
  const planId = normalizeId(params.planId);
  const navigate = useNavigate();
  const location = useLocation();
  const { getPlan, updatePlan, validatePlan, exportPlan } = usePlan();

  const [draft, setDraft] = useState(location.state?.plan ?? null);
  const [loading, setLoading] = useState(!location.state?.plan);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  const fetchPlan = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getPlan(planId);
      setDraft(result.plan ?? null);
    } catch (apiError) {
      const message =
        apiError?.response?.data?.error ??
        (apiError instanceof Error ? apiError.message : 'No fue posible cargar el plan.');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [getPlan, planId]);

  useEffect(() => {
    if (!draft && planId) {
      fetchPlan();
    }
  }, [draft, fetchPlan, planId]);

  useEffect(() => {
    if (location.state?.plan) {
      setDraft(location.state.plan);
      setLoading(false);
    }
  }, [location.state]);

  const handleSave = async () => {
    if (!planId || !draft) return;
    try {
      setSaving(true);
      setFeedback(null);
      const payload = buildPayloadFromPlan(draft);
      const result = await updatePlan(planId, payload);
      if (result?.plan) {
        setDraft(result.plan);
        setFeedback('Los cambios se guardaron correctamente.');
      }
    } catch (apiError) {
      const message =
        apiError?.response?.data?.error ??
        (apiError instanceof Error ? apiError.message : 'No se pudieron guardar los cambios.');
      setFeedback(message);
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    if (!planId) return;
    const sendToPatient = window.confirm(
      '¿Desea enviar el plan al paciente? Al aceptar, el plan quedara marcado como enviado.',
    );
    const estado = sendToPatient ? 'enviado' : 'validado';
    try {
      setValidating(true);
      setFeedback(null);
      const result = await validatePlan(planId, estado);
      if (result?.plan) {
        setDraft(result.plan);
        setFeedback(result.message ?? 'Plan validado correctamente.');
      }
    } catch (apiError) {
      const message =
        apiError?.response?.data?.error ??
        (apiError instanceof Error ? apiError.message : 'No fue posible validar el plan.');
      setFeedback(message);
    } finally {
      setValidating(false);
    }
  };

  const handleExport = async () => {
    if (!planId) return;
    try {
      setExporting(true);
      const result = await exportPlan(planId);
      if (result?.blob) {
        downloadBlob(result.blob, result.filename ?? `plan-${planId}.pdf`);
        setFeedback('El plan se exporto correctamente.');
      }
    } catch (apiError) {
      const message =
        apiError?.response?.data?.error ??
        (apiError instanceof Error ? apiError.message : 'No fue posible exportar el plan.');
      setFeedback(message);
    } finally {
      setExporting(false);
    }
  };

  const goToPreviewPage = () => {
    if (!planId) return;
    navigate(`/previsualizar-plan/${planId}`, {
      state: { plan: draft },
    });
  };

  const pageTitle = useMemo(() => {
    if (!draft) return 'Editar plan alimentario';
    return `Editar plan #${draft.planId}`;
  }, [draft]);

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <p className="text-xs uppercase tracking-widest text-bark/50">Planes alimentarios</p>
        <h1 className="text-3xl font-semibold text-bark">{pageTitle}</h1>
        <p className="mt-2 text-sm text-bark/60">
          Ajusta las comidas, metas y restricciones antes de validar y compartir el plan con el
          paciente.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={goToPreviewPage}
            className="rounded-full border border-sand px-4 py-2 text-sm font-semibold text-bark/70 hover:border-clay hover:text-clay"
          >
            Abrir previsualizacion completa
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}

      {feedback ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-soft">
          <p className="text-sm text-bark/60">Cargando plan...</p>
        </div>
      ) : (
        <PlanEditor
          value={draft}
          onChange={setDraft}
          onSave={handleSave}
          onValidate={handleValidate}
          onExport={handleExport}
          saving={saving}
          validating={validating}
          exporting={exporting}
        />
      )}
    </section>
  );
}
