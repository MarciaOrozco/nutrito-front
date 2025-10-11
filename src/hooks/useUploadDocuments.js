import { useCallback, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/useAuth.js';

export default function useUploadDocuments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const uploadDocuments = useCallback(async ({ pacienteId, files, descripcion }) => {
    if (!pacienteId) {
      throw new Error('pacienteId es requerido para subir documentos');
    }

    if (!files || !files.length) {
      throw new Error('Debes seleccionar al menos un archivo');
    }

    setLoading(true);
    setError(null);

    const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === 'true';
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

    if (!shouldUseBackend) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setLoading(false);
      return { success: true };
    }

    if (!token) {
      setLoading(false);
      setError('Debes iniciar sesión para subir documentos');
      return { success: false, error: new Error('No autenticado') };
    }

    const formData = new FormData();
    formData.append('pacienteId', pacienteId);
    if (descripcion) {
      formData.append('descripcion', descripcion);
    }

    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(`${baseUrl}/api/documentos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      return { success: true, data: response.data };
    } catch (apiError) {
      const message =
        apiError instanceof Error && apiError.message
          ? apiError.message
          : 'No se pudieron subir los documentos';
      setError(message);
      return { success: false, error: apiError };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const resetError = useCallback(() => setError(null), []);

  return { uploadDocuments, loading, error, resetError };
}
