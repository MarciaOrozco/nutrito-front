import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/useAuth.js';

export default function useLinkedPatients(nutricionistaId) {
  const { token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === 'true';
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

  const fetchPatients = useCallback(async () => {
    if (!nutricionistaId) return;

    setLoading(true);
    setError(null);

    if (!shouldUseBackend) {
      setPatients([
        {
          pacienteId: 1,
          nombre: 'Marcia',
          apellido: 'Orozco',
          email: 'marcia@example.com',
          estadoRegistro: 'activo',
          estadoRegistroLabel: 'Activo',
        },
        {
          pacienteId: 2,
          nombre: 'Laura',
          apellido: 'Fernández',
          email: 'laura@example.com',
          estadoRegistro: 'pendiente',
          estadoRegistroLabel: 'No registrado',
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${baseUrl}/api/nutricionistas/${nutricionistaId}/pacientes`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );

      const pacientes = (response.data?.pacientes ?? []).map((paciente) => {
        const estado = paciente?.estadoRegistro ?? null;
        return {
          ...paciente,
          estadoRegistro: estado,
          estadoRegistroLabel:
            paciente?.estadoRegistroLabel ??
            (estado === 'pendiente'
              ? 'No registrado'
              : estado
              ? `${estado.slice(0, 1).toUpperCase()}${estado.slice(1)}`
              : null),
        };
      });

      setPatients(pacientes);
    } catch (apiError) {
      const message =
        apiError instanceof Error && apiError.message
          ? apiError.message
          : 'No pudimos cargar tus pacientes vinculados';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [nutricionistaId, shouldUseBackend, baseUrl, token]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return { patients, loading, error, refresh: fetchPatients };
}
