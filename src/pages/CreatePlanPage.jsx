import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PlanForm from "../components/plan/PlanForm.jsx";
import usePlan from "../hooks/usePlan.js";
import useAIPlan from "../hooks/useAIPlan.js";
import usePatientProfileForNutri from "../hooks/usePatientProfileForNutri.js";
import { useAuth } from "../auth/useAuth.js";

const normalizeId = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export default function CreatePlanPage() {
  const params = useParams();
  const pacienteId = normalizeId(params.pacienteId);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const nutricionistaId = user?.nutricionistaId ?? null;
  const { createManualPlan, createAiPlan } = usePlan();
  const {
    generatePlan,
    loading: aiLoading,
    error: aiError,
    resetError,
  } = useAIPlan();
  const [metadata, setMetadata] = useState({});
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const profile = usePatientProfileForNutri(nutricionistaId, pacienteId);

  useEffect(() => {
    if (!profile.data?.contacto) return;
    setMetadata((prev) => ({
      title:
        prev.title ??
        `Plan para ${profile.data.contacto.nombre ?? ""} ${
          profile.data.contacto.apellido ?? ""
        }`.trim(),
      patientInfo: prev.patientInfo ?? {},
      objectives: prev.objectives ?? {},
      medicalConditions: prev.medicalConditions ?? {},
      restrictions: prev.restrictions ?? {},
      preferences: prev.preferences ?? {},
      notes: prev.notes ?? "",
    }));
  }, [profile.data]);

  useEffect(() => {
    if (location.state?.metadata) {
      setMetadata(location.state.metadata);
    }
  }, [location.state]);

  const pacienteNombre = useMemo(() => {
    const contacto = profile.data?.contacto;
    if (!contacto) return null;
    return `${contacto.nombre ?? ""} ${contacto.apellido ?? ""}`.trim();
  }, [profile.data]);

  const handleManualCreation = async () => {
    if (!pacienteId) {
      setFeedback("Paciente no valido.");
      return;
    }

    try {
      setCreating(true);
      resetError();
      setFeedback(null);
      const result = await createManualPlan({
        pacienteId,
        metadata,
      });
      if (result?.plan?.planId) {
        navigate(`/editar-plan/${result.plan.planId}`, {
          state: { plan: result.plan },
        });
      } else {
        setFeedback("No fue posible crear el borrador manual.");
      }
    } catch (error) {
      const message =
        error?.response?.data?.error ??
        (error instanceof Error
          ? error.message
          : "No fue posible crear el plan.");
      setFeedback(message);
    } finally {
      setCreating(false);
    }
  };

  const handleAiGeneration = async () => {
    if (!pacienteId) {
      setFeedback("Paciente no valido.");
      return;
    }

    const result = await generatePlan({ pacienteId, metadata });
    if (result?.planId) {
      navigate(`/editar-plan/${result.planId}`, {
        state: { plan: result, nuevaIA: true },
      });
    } else if (!aiError) {
      setFeedback("No fue posible generar el plan.");
    }
  };

  const isLoadingProfile = profile.loading || creating || aiLoading;

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <p className="text-xs uppercase tracking-widest text-bark/50">
          Crear plan alimentario
        </p>
        <h1 className="text-3xl font-semibold text-bark">
          {pacienteNombre
            ? `Nuevo plan para ${pacienteNombre}`
            : "Nuevo plan alimentario"}
        </h1>
        <p className="mt-2 text-sm text-bark/60">
          Completa la informacion para generar un plan adaptado al paciente.
          Puedes crear un borrador manual o generar una propuesta con IA.
        </p>

        {profile.error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {profile.error}
          </div>
        ) : null}
      </div>

      <PlanForm
        value={metadata}
        onChange={setMetadata}
        disabled={isLoadingProfile}
        title="Informacion del paciente"
        description="Estos datos ayudan a personalizar el plan segun el objetivo nutricional."
      >
        <button
          type="button"
          onClick={handleAiGeneration}
          disabled={isLoadingProfile}
          className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {aiLoading ? "Generando con IA..." : "Generar plan con IA"}
        </button>
        <button
          type="button"
          onClick={handleManualCreation}
          disabled={isLoadingProfile}
          className="rounded-full border border-clay px-6 py-2 text-sm font-semibold text-clay hover:bg-clay hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating ? "Creando borrador..." : "Crear borrador manual"}
        </button>
      </PlanForm>

      {aiError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {aiError}
        </div>
      ) : null}
      {feedback ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {feedback}
        </div>
      ) : null}
    </section>
  );
}
