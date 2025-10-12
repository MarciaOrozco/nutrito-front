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

  return { appointments, loading, error, refresh: fetchAppointments };
}
