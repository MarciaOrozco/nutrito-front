import { useCallback, useState } from "react";
import axios from "axios";
import { getMockAvailabilityFor } from "../mocks/availability.js";
import { useAuth } from "../auth/useAuth.js";

const normalizeSlot = (slot) => {
  if (typeof slot === "string") {
    const time = slot.slice(0, 5);
    return {
      time,
      label: `${time} hs`,
      dia_semana: null,
    };
  }

  const time = (slot.time ?? slot.hora ?? "").slice(0, 5);
  const label = slot.label ?? slot.etiqueta ?? (time ? `${time} hs` : "");

  return {
    time,
    label: label || "Horario",
    dia_semana: slot.dia_semana ?? slot.dia ?? null,
  };
};

export default function useAvailability() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState("mock");
  const { token } = useAuth();

  const fetchAvailability = useCallback(
    async ({ nutricionistaId, date }) => {
      if (!nutricionistaId || !date) {
        setSlots([]);
        return;
      }

      setLoading(true);
      setError(null);

      const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === "true";
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

      const loadMock = () => {
        const mock = getMockAvailabilityFor(nutricionistaId, date);
        setSlots(mock.slots.map(normalizeSlot));
        setSource("mock");
        setError(null);
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
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );

        const apiSlots = Array.isArray(response.data?.slots)
          ? response.data.slots
          : Array.isArray(response.data)
          ? response.data
          : [];

        const normalized = apiSlots.map(normalizeSlot);
        setSlots(normalized);
        setSource("backend");
        setError(normalized.length ? null : "No hay horarios disponibles");
      } catch (apiError) {
        if (axios.isAxiosError(apiError) && apiError.response?.status === 404) {
          setSlots([]);
          setSource("backend");
        } else {
          loadMock();
          const message =
            apiError instanceof Error && apiError.message
              ? apiError.message
              : "No se pudo acceder al backend";
          setError(`No pudimos obtener los horarios (${message}).`);
        }
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return {
    slots,
    loading,
    error,
    source,
    fetchAvailability,
  };
}
