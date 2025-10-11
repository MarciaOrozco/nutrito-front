import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { mockPatientProfile } from '../mocks/patient.js';
import { useAuth } from '../auth/useAuth.js';

const normalizeTurno = (turno) => ({
  ...turno,
  fecha: turno?.fecha ?? null,
  hora: turno?.hora ?? null,
  modalidad: turno?.modalidad ?? 'Consulta',
});

export default function usePatientProfile(pacienteId) {
  const [contacto, setContacto] = useState(null);
  const [proximoTurno, setProximoTurno] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('backend');
  const { token, user } = useAuth();

  const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === 'true';
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

  const aplicarDatos = useCallback((data) => {
    setContacto(data.contacto ?? null);
    setProximoTurno(data.proximoTurno ? normalizeTurno(data.proximoTurno) : null);
    setHistorial(data.historial?.map(normalizeTurno) ?? []);
    setPlanes(data.planes ?? []);
    setDocumentos(data.documentos ?? []);
    setConsultas(data.consultas ?? []);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!pacienteId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (!shouldUseBackend) {
      aplicarDatos(mockPatientProfile);
      setSource('mock');
      setLoading(false);
      return;
    }

    if (!token) {
      setError('Debes iniciar sesión para acceder a tu perfil');
      setLoading(false);
      return;
    }

    try {
      const baseRequests = [
        axios.get(`${baseUrl}/api/pacientes/${pacienteId}/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}/api/pacientes/${pacienteId}/turnos`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}/api/pacientes/${pacienteId}/planes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}/api/pacientes/${pacienteId}/documentos`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ];

      const includeConsultas = user?.rol === 'nutricionista';

      if (includeConsultas) {
        baseRequests.push(
          axios.get(`${baseUrl}/api/pacientes/${pacienteId}/consultas`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        );
      }

      const responses = await Promise.all(baseRequests);

      const [perfilRes, turnosRes, planesRes, documentosRes, consultasRes] =
        includeConsultas
          ? responses
          : [...responses, { data: { consultas: [] } }];

      aplicarDatos({
        contacto: perfilRes.data?.contacto,
        proximoTurno: turnosRes.data?.proximoTurno,
        historial: turnosRes.data?.historial,
        planes: planesRes.data?.planes,
        documentos: documentosRes.data?.documentos,
        consultas: consultasRes.data?.consultas,
      });
      setSource('backend');
    } catch (apiError) {
      setError(
        apiError instanceof Error && apiError.message
          ? apiError.message
          : 'No pudimos cargar tu perfil. Mostramos datos simulados.',
      );
      aplicarDatos(mockPatientProfile);
      setSource('mock');
    } finally {
      setLoading(false);
    }
  }, [aplicarDatos, baseUrl, pacienteId, shouldUseBackend, token, user?.rol]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const resumenTurnos = useMemo(
    () => ({
      proximoTurno,
      historial,
    }),
    [historial, proximoTurno],
  );

  return {
    contacto,
    proximoTurno,
    historial,
    planes,
    documentos,
    consultas,
    loading,
    error,
    source,
    refresh: fetchProfile,
    resumenTurnos,
  };
}
