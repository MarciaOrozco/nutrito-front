import { useCallback, useState } from 'react';
import axios from 'axios';
import { getMockAvailabilityFor } from '../mocks/availability.js';

export default function useAvailability() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('mock');

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

    try {
      const response = await axios.get(
        `${baseUrl}/api/turnos/disponibles/${nutricionistaId}`,
        {
          params: { fecha: date },
          timeout: 5000,
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
  }, []);

  return {
    slots,
    loading,
    error,
    source,
    fetchAvailability,
  };
}
