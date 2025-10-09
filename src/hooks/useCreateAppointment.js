import { useCallback, useState } from 'react';
import axios from 'axios';

export default function useCreateAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createAppointment = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === 'true';
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

    if (!shouldUseBackend) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setLoading(false);
      return {
        success: true,
        data: { turnoId: Date.now() },
      };
    }

    try {
      const response = await axios.post(`${baseUrl}/api/turnos`, payload, {
        timeout: 5000,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (apiError) {
      setError('No se pudo registrar el método de pago. Intente nuevamente.');
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
    createAppointment,
    loading,
    error,
    resetError,
  };
}
