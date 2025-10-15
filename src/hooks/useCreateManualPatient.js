import { useCallback, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/useAuth.js';

const emailRegex =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export default function useCreateManualPatient(nutricionistaId) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === 'true';
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

  const resetError = useCallback(() => setError(null), []);

  const createManualPatient = useCallback(
    async ({ nombre, apellido, email }) => {
      if (!nutricionistaId) {
        throw new Error('Nutricionista no válido para crear paciente.');
      }

      if (!nombre || !apellido || !email || !emailRegex.test(email)) {
        throw new Error('Datos inválidos para crear el paciente.');
      }

      if (!shouldUseBackend) {
        return {
          paciente: {
            pacienteId: Date.now(),
            nombre,
            apellido,
            email,
            estadoRegistro: 'invitado',
            estadoRegistroLabel: 'No registrado',
          },
          consultaTemporal: {
            consultaId: Date.now() + 1,
            estado: 'borrador',
          },
        };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          `${baseUrl}/api/nutricionistas/${nutricionistaId}/pacientes/manual`,
          { nombre, apellido, email },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          },
        );

        return response.data;
      } catch (apiError) {
        const message =
          apiError?.response?.data?.error ??
          (apiError instanceof Error ? apiError.message : 'Error al crear el paciente');
        setError(message);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [nutricionistaId, shouldUseBackend, baseUrl, token],
  );

  return {
    createManualPatient,
    loading,
    error,
    resetError,
  };
}
