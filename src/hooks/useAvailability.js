import { useCallback, useState } from 'react';
import axios from 'axios';
import { getMockAvailabilityFor } from '../mocks/availability.js';
import { useAuth } from '../auth/useAuth.js';

export default function useAvailability() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('mock');
  const { token } = useAuth();

  const fetchAvailability = useCallback(async ({ nutricionistaId, date }) => {
    if (!nutricionistaId || !date) {
      setSlots([]);
      return;
    }

    setLoading(true);
    setError(null);

    const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === 'true';
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

    const loadMock = () => {
      const mock = getMockAvailabilityFor(nutricionistaId, date);
      setSlots(mock.slots);
      setSource('mock');
    };

    if (!shouldUseBackend) {
      loadMock();
      setLoading(false);
      return;
    }

    if (!token) {
      setError('Debes iniciar sesión para consultar la disponibilidad');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${baseUrl}/api/turnos/disponibles/${nutricionistaId}`,
        {
          params: { fecha: date },
          timeout: 5000,
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const apiSlots = Array.isArray(response.data?.slots)
        ? response.data.slots
        : Array.isArray(response.data)
          ? response.data
          : [];

      setSlots(apiSlots.map((slot) => (typeof slot === 'string' ? { time: slot, label: `${slot} hs` } : slot)));
      setSource('backend');
    } catch (apiError) {
      loadMock();
      const message =
        apiError instanceof Error && apiError.message ? apiError.message : 'No se pudo acceder al backend';
      setError(`No pudimos obtener los horarios (${message}).`);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    slots,
    loading,
    error,
    source,
    fetchAvailability,
  };
}
