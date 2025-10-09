import { useCallback, useState } from 'react';
import axios from 'axios';

export default function useRescheduleAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reschedule = useCallback(async ({ turnoId, pacienteId, fecha, hora }) => {
    if (!turnoId) {
      throw new Error('turnoId es obligatorio para reprogramar un turno');
    }

    if (!fecha || !hora) {
      throw new Error('Fecha y hora son obligatorias para reprogramar');
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

    try {
      await axios.put(
        `${baseUrl}/api/turnos/${turnoId}/reprogramar`,
        {
          nuevaFecha: fecha,
          nuevaHora: hora,
          pacienteId,
        },
        {
          timeout: 5000,
        },
      );

      return { success: true };
    } catch (apiError) {
      const message =
        apiError instanceof Error && apiError.message
          ? apiError.message
          : 'No se pudo reprogramar el turno';
      setError(message);
      return { success: false, error: apiError };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetError = useCallback(() => setError(null), []);

  return { reschedule, loading, error, resetError };
}
