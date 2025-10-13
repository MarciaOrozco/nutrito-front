import { useCallback, useState } from 'react';
import usePlan from './usePlan.js';

export default function useAIPlan() {
  const { createAiPlan } = usePlan();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePlan = useCallback(
    async ({ pacienteId, metadata }) => {
      if (!pacienteId) {
        setError('Paciente no valido para generar el plan.');
        return null;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await createAiPlan({ pacienteId, metadata });
        return result.plan ?? null;
      } catch (apiError) {
        const message =
          apiError?.response?.data?.error ??
          (apiError instanceof Error ? apiError.message : 'No fue posible generar el plan.');
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [createAiPlan],
  );

  const resetError = useCallback(() => setError(null), []);

  return {
    generatePlan,
    loading,
    error,
    resetError,
  };
}
