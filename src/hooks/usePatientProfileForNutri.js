import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/useAuth.js';
import { mockPatientProfile } from '../mocks/patient.js';

export default function usePatientProfileForNutri(nutricionistaId, pacienteId) {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === 'true';
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

  const fetchProfile = useCallback(async () => {
    if (!nutricionistaId || !pacienteId) return;

    setLoading(true);
    setError(null);

    if (!shouldUseBackend) {
      setData(mockPatientProfile);
      setLoading(false);
      return;
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const [perfilRes, turnosRes, planesRes, documentosRes, consultasRes] = await Promise.all([
        axios.get(`${baseUrl}/api/nutricionistas/${nutricionistaId}/pacientes/${pacienteId}`, {
          headers,
        }),
        axios.get(`${baseUrl}/api/pacientes/${pacienteId}/turnos`, { headers }),
        axios.get(`${baseUrl}/api/pacientes/${pacienteId}/planes`, { headers }),
        axios.get(`${baseUrl}/api/pacientes/${pacienteId}/documentos`, { headers }),
        axios.get(`${baseUrl}/api/pacientes/${pacienteId}/consultas`, { headers }),
      ]);

      setData({
        contacto: perfilRes.data?.contacto,
        proximoTurno: turnosRes.data?.proximoTurno,
        historial: turnosRes.data?.historial,
        planes: planesRes.data?.planes,
        documentos: documentosRes.data?.documentos,
        consultas: consultasRes.data?.consultas,
      });
    } catch (apiError) {
      const message =
        apiError instanceof Error && apiError.message
          ? apiError.message
          : 'No pudimos cargar el perfil del paciente';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [nutricionistaId, pacienteId, shouldUseBackend, baseUrl, token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { data, loading, error, refresh: fetchProfile };
}
