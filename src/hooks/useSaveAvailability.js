import { useCallback, useState } from "react";
import axios from "axios";
import { useAuth } from "../auth/useAuth.js";

const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === "true";
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export default function useSaveAvailability() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveAvailability = useCallback(
    async ({ nutricionistaId, rangos }) => {
      if (!nutricionistaId) {
        throw new Error("nutricionistaId es obligatorio");
      }

      setLoading(true);
      setError(null);

      if (!shouldUseBackend) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setLoading(false);
        return { success: true };
      }

      if (!token) {
        setLoading(false);
        setError("Debes iniciar sesión para actualizar la disponibilidad");
        return { success: false, error: new Error("No autenticado") };
      }

      try {
        await axios.put(
          `${baseUrl}/api/nutricionistas/${nutricionistaId}/disponibilidad`,
          { rangos },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 8000,
          }
        );

        return { success: true };
      } catch (apiError) {
        const message =
          apiError?.response?.data?.error ??
          (apiError instanceof Error ? apiError.message : "No se pudo guardar");
        setError(message);
        return { success: false, error: apiError };
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const resetError = useCallback(() => setError(null), []);

  return { saveAvailability, loading, error, resetError };
}
