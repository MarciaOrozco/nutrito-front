import axios from 'axios';
import { useAuth } from '../auth/useAuth.js';

const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === 'true';
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export default function useConsultas() {
  const { token, user } = useAuth();

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

  const createConsulta = async ({ pacienteId }) => {
    if (!shouldUseBackend) {
      return { consultaId: Date.now() };
    }

    const response = await axios.post(
      `${baseUrl}/api/consultas`,
      { pacienteId, nutricionistaId: user?.nutricionistaId },
      { headers: authHeaders },
    );

    return response.data;
  };

  const listConsultas = async ({ pacienteId }) => {
    if (!shouldUseBackend) {
      return { consultas: [] };
    }

    const response = await axios.get(
      `${baseUrl}/api/pacientes/${pacienteId}/consultas`,
      { headers: authHeaders },
    );

    return response.data;
  };

  const getConsulta = async (consultaId) => {
    if (!shouldUseBackend) {
      return { consulta_id: consultaId };
    }

    const response = await axios.get(`${baseUrl}/api/consultas/${consultaId}`, {
      headers: authHeaders,
    });

    return response.data;
  };

  const updateConsulta = async (consultaId, payload) => {
    if (!shouldUseBackend) return { success: true };

    const response = await axios.put(`${baseUrl}/api/consultas/${consultaId}`, payload, {
      headers: authHeaders,
    });

    return response.data;
  };

  const deleteConsulta = async (consultaId, motivo) => {
    if (!shouldUseBackend) return { success: true };

    const response = await axios.delete(`${baseUrl}/api/consultas/${consultaId}`, {
      headers: authHeaders,
      data: { motivo },
    });

    return response.data;
  };

  const uploadDocuments = async (consultaId, files) => {
    if (!shouldUseBackend) return { documentos: [] };

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));

    const response = await axios.post(
      `${baseUrl}/api/consultas/${consultaId}/documentos`,
      formData,
      {
        headers: {
          ...authHeaders,
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  };

  const exportConsulta = async (consultaId, secciones) => {
    if (!shouldUseBackend) return {};

    const response = await axios.post(
      `${baseUrl}/api/consultas/${consultaId}/exportar`,
      { secciones },
      {
        headers: authHeaders,
        responseType: 'blob',
      },
    );

    return response.data;
  };

  const scheduleNext = async (consultaId, payload) => {
    if (!shouldUseBackend) return { turnoId: Date.now() };

    const response = await axios.post(
      `${baseUrl}/api/consultas/${consultaId}/proxima-cita`,
      payload,
      { headers: authHeaders },
    );

    return response.data;
  };

  return {
    createConsulta,
    listConsultas,
    getConsulta,
    updateConsulta,
    deleteConsulta,
    uploadDocuments,
    exportConsulta,
    scheduleNext,
  };
}
