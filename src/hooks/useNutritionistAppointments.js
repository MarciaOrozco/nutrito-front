import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/useAuth.js';

const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === 'true';
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const fallbackAppointments = [
  {
    id: 1,
    fecha: new Date().toISOString().slice(0, 10),
    hora: '10:00',
    paciente: { id: 1, nombre: 'Paciente', apellido: 'Demo', email: 'demo@example.com' },
    estado: 'Confirmado',
  },
];

export default function useNutritionistAppointments(nutricionistaId) {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    if (!nutricionistaId) return;

    setLoading(true);
    setError(null);

    if (!shouldUseBackend) {
      setAppointments(fallbackAppointments);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${baseUrl}/api/nutricionistas/${nutricionistaId}/turnos`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );

      setAppointments(response.data?.turnos ?? []);
    } catch (apiError) {
      const message =
        apiError instanceof Error && apiError.message
          ? apiError.message
          : 'No pudimos cargar tus próximos turnos.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [nutricionistaId, token, shouldUseBackend, baseUrl]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const cancelAppointment = useCallback(
    async (turnoId, { motivo } = {}) => {
      if (!turnoId) {
        return { success: false, error: new Error('turnoId es obligatorio') };
      }

      if (!nutricionistaId) {
        return { success: false, error: new Error('nutricionistaId no disponible') };
      }

      if (!shouldUseBackend) {
        setAppointments((prev) => prev.filter((turno) => turno.id !== turnoId));
        return { success: true };
      }

      try {
        await axios.patch(
          `${baseUrl}/api/nutricionistas/${nutricionistaId}/turnos/${turnoId}/cancelar`,
          { motivo },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          },
        );

        await fetchAppointments();
        return { success: true };
      } catch (apiError) {
        const message =
          apiError?.response?.data?.error ??
          (apiError instanceof Error ? apiError.message : 'Error al cancelar el turno.');
        return { success: false, error: new Error(message) };
      }
    },
    [nutricionistaId, token, fetchAppointments],
  );

  const rescheduleAppointment = useCallback(
    async (turnoId, { fecha, hora }) => {
      if (!turnoId) {
        return { success: false, error: new Error('turnoId es obligatorio') };
      }

      if (!nutricionistaId) {
        return { success: false, error: new Error('nutricionistaId no disponible') };
      }

      if (!fecha || !hora) {
        return { success: false, error: new Error('Fecha y hora son obligatorias') };
      }

      if (!shouldUseBackend) {
        setAppointments((prev) =>
          prev.map((turno) =>
            turno.id === turnoId ? { ...turno, fecha, hora } : turno,
          ),
        );
        return { success: true };
      }

      try {
        await axios.put(
          `${baseUrl}/api/nutricionistas/${nutricionistaId}/turnos/${turnoId}/reprogramar`,
          { nuevaFecha: fecha, nuevaHora: hora },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          },
        );

        await fetchAppointments();
        return { success: true };
      } catch (apiError) {
        const message =
          apiError?.response?.data?.error ??
          (apiError instanceof Error ? apiError.message : 'Error al reprogramar el turno.');
        return { success: false, error: new Error(message) };
      }
    },
    [nutricionistaId, token, fetchAppointments],
  );

  return {
    appointments,
    loading,
    error,
    refresh: fetchAppointments,
    cancelAppointment,
    rescheduleAppointment,
  };
}
