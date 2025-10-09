import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { mockPatientProfile } from '../mocks/patient.js';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('backend');

  const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === 'true';
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

  const aplicarDatos = useCallback((data) => {
    setContacto(data.contacto ?? null);
    setProximoTurno(data.proximoTurno ? normalizeTurno(data.proximoTurno) : null);
    setHistorial(data.historial?.map(normalizeTurno) ?? []);
    setPlanes(data.planes ?? []);
    setDocumentos(data.documentos ?? []);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!pacienteId) return;

    setLoading(true);
    setError(null);

    if (!shouldUseBackend) {
      aplicarDatos(mockPatientProfile);
      setSource('mock');
      setLoading(false);
      return;
    }

    try {
      const [perfilRes, turnosRes, planesRes, documentosRes] = await Promise.all([
        axios.get(`${baseUrl}/api/pacientes/${pacienteId}/perfil`),
        axios.get(`${baseUrl}/api/pacientes/${pacienteId}/turnos`),
        axios.get(`${baseUrl}/api/pacientes/${pacienteId}/planes`),
        axios.get(`${baseUrl}/api/pacientes/${pacienteId}/documentos`),
      ]);

      aplicarDatos({
        contacto: perfilRes.data?.contacto,
        proximoTurno: turnosRes.data?.proximoTurno,
        historial: turnosRes.data?.historial,
        planes: planesRes.data?.planes,
        documentos: documentosRes.data?.documentos,
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
  }, [aplicarDatos, baseUrl, pacienteId, shouldUseBackend]);

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
    loading,
    error,
    source,
    refresh: fetchProfile,
    resumenTurnos,
  };
}
