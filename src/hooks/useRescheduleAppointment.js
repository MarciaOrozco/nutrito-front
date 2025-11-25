import { useCallback, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/useAuth.js';
import { extractCalendarLink } from './useCreateAppointment.js';

export default function useRescheduleAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

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
      return { success: true, calendarLink: null, icsContent: null };
    }

    if (!token) {
      setLoading(false);
      setError('Debes iniciar sesión para reprogramar el turno');
      return { success: false, error: new Error('No autenticado') };
    }

    try {
      const response = await axios.put(
        `${baseUrl}/api/turnos/${turnoId}/reprogramar`,
        {
          nuevaFecha: fecha,
          nuevaHora: hora,
          pacienteId,
        },
        {
          timeout: 5000,
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = response?.data ?? {};
      const calendarLink = data.calendarLink ?? extractCalendarLink(data.notificaciones);
      const icsContent = data.icsContent ?? null;

      return { success: true, calendarLink, icsContent };
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
  }, [token]);

  const resetError = useCallback(() => setError(null), []);

  return { reschedule, loading, error, resetError };
}
