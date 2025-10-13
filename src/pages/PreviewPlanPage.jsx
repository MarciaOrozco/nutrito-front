import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import PreviewPlan from '../components/plan/PreviewPlan.jsx';
import usePlan from '../hooks/usePlan.js';

const normalizeId = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export default function PreviewPlanPage() {
  const params = useParams();
  const planId = normalizeId(params.planId);
  const location = useLocation();
  const { getPlan } = usePlan();
  const [plan, setPlan] = useState(location.state?.plan ?? null);
  const [loading, setLoading] = useState(!location.state?.plan);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!planId || plan) return;

    const fetchPlan = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getPlan(planId);
        setPlan(result.plan ?? null);
      } catch (apiError) {
        const message =
          apiError?.response?.data?.error ??
          (apiError instanceof Error ? apiError.message : 'No fue posible cargar el plan.');
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [getPlan, plan, planId]);

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <p className="text-xs uppercase tracking-widest text-bark/50">
          Previsualizacion del plan
        </p>
        <h1 className="text-3xl font-semibold text-bark">
          {plan ? `Plan #${plan.planId}` : 'Plan alimentario'}
        </h1>
        <p className="mt-2 text-sm text-bark/60">
          Visualiza la version consolidada del plan antes de enviarlo al paciente.
        </p>
        <div className="mt-3">
          <Link
            to={planId ? `/editar-plan/${planId}` : '/panel-profesional'}
            className="inline-flex rounded-full border border-clay px-4 py-2 text-sm font-semibold text-clay hover:bg-clay hover:text-white"
          >
            Volver a edicion
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-soft">
          <p className="text-sm text-bark/60">Cargando previsualizacion...</p>
        </div>
      ) : (
        <PreviewPlan plan={plan} />
      )}
    </section>
  );
}
