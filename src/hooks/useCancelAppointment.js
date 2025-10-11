import { useCallback, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/useAuth.js';

export default function useCancelAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const cancelAppointment = useCallback(async ({ turnoId, pacienteId, motivo }) => {
    if (!turnoId) {
      throw new Error('turnoId es obligatorio para cancelar un turno');
    }

    setLoading(true);
    setError(null);

    const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === 'true';
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

    if (!shouldUseBackend) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      setLoading(false);
      return { success: true };
    }

    if (!token) {
      setLoading(false);
      setError('Debes iniciar sesión para cancelar un turno');
      return { success: false, error: new Error('No autenticado') };
    }

    try {
      await axios.delete(`${baseUrl}/api/turnos/${turnoId}`, {
        data: { pacienteId, motivo },
        timeout: 5000,
        headers: { Authorization: `Bearer ${token}` },
      });

      return { success: true };
    } catch (apiError) {
      const message =
        apiError instanceof Error && apiError.message
          ? apiError.message
          : 'No se pudo cancelar el turno';
      setError(message);

      return { success: false, error: apiError };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const resetError = useCallback(() => setError(null), []);

  return { cancelAppointment, loading, error, resetError };
}
