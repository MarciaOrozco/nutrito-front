import { useCallback, useMemo, useState } from 'react';
import axios from 'axios';
import { mockNutritionists } from '../mocks/nutritionists.js';

const normalize = (value) =>
  value
    ?.toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase() ?? "";

const filterLocally = (items, filters) => {
  const nameFilter = normalize(filters.name);
  const specialtyFilter = normalize(filters.specialty);
  const selectedSpecialties = filters.specialties ?? [];
  const selectedModalities = filters.modalities ?? [];

  return items.filter((item) => {
    const normalizedName = normalize(item.name);
    const normalizedTitle = normalize(item.title);
    const normalizedSpecialties = item.specialties.map(normalize);

    const matchesName =
      !nameFilter ||
      normalizedName.includes(nameFilter) ||
      normalizedTitle.includes(nameFilter);
    const matchesSpecialty =
      !specialtyFilter ||
      normalizedSpecialties.some((spec) => spec.includes(specialtyFilter));
    const matchesSelectedSpecialties =
      selectedSpecialties.length === 0 ||
      selectedSpecialties.every((selected) =>
        item.specialties.some((spec) => normalize(spec) === normalize(selected))
      );
    const matchesModalities =
      selectedModalities.length === 0 ||
      selectedModalities.some((modality) => item.modalities.includes(modality));

    return (
      matchesName &&
      matchesSpecialty &&
      matchesSelectedSpecialties &&
      matchesModalities
    );
  });
};

const deriveSpecialties = (items) => {
  const unique = new Set(items.flatMap((item) => item.specialties));
  return Array.from(unique).sort((a, b) => a.localeCompare(b));
};

const deriveModalities = (items) => {
  const unique = new Set(items.flatMap((item) => item.modalities));
  return Array.from(unique).sort((a, b) => a.localeCompare(b));
};

const buildQueryParams = (filters) => {
  const params = {};

  if (filters.name) params.nombre = filters.name;
  if (filters.specialty) params.especialidad = filters.specialty;
  if (filters.specialties?.length)
    params.especialidades = filters.specialties.join(",");
  if (filters.modalities?.length)
    params.modalidades = filters.modalities.join(",");

  return params;
};

function mapResponseToNutritionists(payload) {
  if (!payload) return [];

  const rawItems = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.data)
    ? payload.data
    : [];

  return rawItems.map((item) => {
    const id =
      item.id ??
      item.nutricionista_id ??
      item.nutricionistaId ??
      globalThis.crypto?.randomUUID?.() ??
      `nutricionista-${Math.random().toString(36).slice(2, 9)}`;
    const fullName =
      (item.name ??
        item.nombreCompleto ??
        `${item.nombre ?? ""} ${item.apellido ?? ""}`.trim()) ||
      "Nutricionista";
    const title =
      item.title ??
      item.titulo ??
      item.sobre_mi ??
      item.descripcion ??
      item.descripcion_corta ??
      "";
    const rating =
      item.rating ??
      item.reputacionPromedio ??
      item.reputacion_promedio ??
      item.promedioResenas ??
      0;
    const reviewCount =
      item.reviewCount ?? item.totalOpiniones ?? item.total_opiniones ?? 0;

    const specialtiesRaw = item.specialties ?? item.especialidades ?? [];
    const modalitiesRaw = item.modalities ?? item.modalidades ?? [];

    const specialties = Array.isArray(specialtiesRaw)
      ? specialtiesRaw
      : specialtiesRaw
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);

    const modalities = Array.isArray(modalitiesRaw)
      ? modalitiesRaw
      : modalitiesRaw
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);

    return {
      id,
      name: fullName,
      title,
      rating: Number(rating) || 0,
      reviewCount: Number(reviewCount) || 0,
      specialties,
      modalities,
      photoUrl: item.photoUrl ?? item.fotoUrl ?? item.foto_url ?? null,
    };
  });
}

export default function useNutritionists() {
  const [nutritionists, setNutritionists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState("mock");

  const fetchNutritionists = useCallback(async (filters) => {
    setLoading(true);
    setError(null);

    const params = buildQueryParams(filters);
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
    const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === "true";

    if (!shouldUseBackend) {
      const fallbackData = filterLocally(mockNutritionists, filters);
      setNutritionists(fallbackData);
      setSource("mock");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${baseUrl}/api/nutricionistas`, {
        params,
        timeout: 5000,
      });

      const received = mapResponseToNutritionists(response.data);
      setNutritionists(received);
      setSource("backend");
    } catch (apiError) {
      const fallbackData = filterLocally(mockNutritionists, filters);
      setNutritionists(fallbackData);
      setSource("mock");

      setError(
        `No se pudo conectar con el backend (${apiError.message}). Mostramos resultados de ejemplo mientras verificas la API.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const availableSpecialties = useMemo(
    () =>
      deriveSpecialties(
        nutritionists.length ? nutritionists : mockNutritionists
      ),
    [nutritionists]
  );

  const availableModalities = useMemo(
    () =>
      deriveModalities(
        nutritionists.length ? nutritionists : mockNutritionists
      ),
    [nutritionists]
  );

  return {
    nutritionists,
    loading,
    error,
    source,
    fetchNutritionists,
    availableSpecialties,
    availableModalities,
  };
}
