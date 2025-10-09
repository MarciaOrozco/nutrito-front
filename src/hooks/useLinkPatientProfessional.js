import { useCallback, useState } from 'react';
import axios from 'axios';

export default function useLinkPatientProfessional() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const link = useCallback(async ({ pacienteId, nutricionistaId }) => {
    setLoading(true);
    setError(null);

    const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === 'true';
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

    if (!shouldUseBackend) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setLoading(false);
      return { success: true };
    }

    try {
      const response = await axios.post(`${baseUrl}/api/pacientes/vinculaciones`, {
        pacienteId,
        nutricionistaId,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (apiError) {
      const message =
        apiError instanceof Error && apiError.message
          ? apiError.message
          : 'Error al crear la vinculación';
      setError(message);
      return {
        success: false,
        error: apiError,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetError = useCallback(() => setError(null), []);

  return {
    link,
    loading,
    error,
    resetError,
  };
}
