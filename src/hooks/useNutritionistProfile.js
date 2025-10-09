import { useCallback, useMemo, useState } from 'react';
import axios from 'axios';
import { getMockNutritionistById } from '../mocks/nutritionists.js';

const mapEducation = (items) =>
  (items ?? []).map((item, index) => ({
    id:
      item.id ??
      item.educacion_id ??
      globalThis.crypto?.randomUUID?.() ??
      `education-${index}`,
    title: item.title ?? item.titulo ?? '',
    institution: item.institution ?? item.institucion ?? '',
    description: item.description ?? item.descripcion ?? '',
    year: item.year ?? null,
  }));

const mapReviews = (items) =>
  (items ?? []).map((item, index) => ({
    id:
      item.id ??
      item.resena_id ??
      item.reviewId ??
      globalThis.crypto?.randomUUID?.() ??
      `review-${index}`,
    patient: item.patient ?? item.paciente ?? item.nombrePaciente ?? 'Paciente',
    comment: item.comment ?? item.comentario ?? '',
    rating: Number(item.rating ?? item.puntuacion ?? 0) || 0,
    date: item.date ?? item.fecha ?? null,
  }));

const mapProfileFromResponse = (payload) => {
  if (!payload) return null;

  const base = Array.isArray(payload) ? payload[0] : payload;

  if (!base) return null;

  const id =
    base.id ??
    base.nutricionista_id ??
    base.nutricionistaId ??
    globalThis.crypto?.randomUUID?.() ??
    `nutricionista-${Math.random().toString(36).slice(2, 9)}`;

  let fullName =
    base.name ??
    base.nombreCompleto ??
    `${base.nombre ?? ''} ${base.apellido ?? ''}`.trim();
  if (!fullName) {
    fullName = 'Nutricionista';
  }

  let specialties = [];
  if (Array.isArray(base.especialidades) && base.especialidades.length) {
    specialties = base.especialidades;
  } else if (typeof base.especialidades === 'string') {
    specialties = base.especialidades
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  } else if (Array.isArray(base.specialties)) {
    specialties = base.specialties;
  } else if (typeof base.specialties === 'string') {
    specialties = base.specialties
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return {
    id,
    name: fullName,
    title:
      base.title ??
      base.titulo ??
      base.sobre_mi ??
      base.specialtyTitle ??
      'Especialista en nutrición',
    mainSpecialty: specialties[0] ?? 'Nutrición integral',
    rating:
      Number(
        base.rating ??
          base.reputacionPromedio ??
          base.reputacion_promedio ??
          base.promedioResenas ??
          0,
      ) || 0,
    reviewCount: Number(base.totalOpiniones ?? base.reviewCount ?? 0) || 0,
    photoUrl: base.photoUrl ?? base.fotoUrl ?? base.foto_url ?? null,
    about: base.about ?? base.sobre_mi ?? '',
    specialties,
    education: mapEducation(base.educacion ?? base.education ?? []),
    reviews: mapReviews(base.resenas ?? base.reviews ?? []),
    modalities: base.modalidades ?? base.modalities ?? [],
  };
};

export default function useNutritionistProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('mock');
  const [lastId, setLastId] = useState(null);

  const fetchProfile = useCallback(async (id) => {
    if (!id) {
      setError('Nutricionista no encontrado.');
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);
    setLastId(id);

    const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === 'true';
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

    const loadMock = () => {
      const mock = getMockNutritionistById(id);
      setProfile(mock);
      setSource('mock');
      if (!mock) {
        setError('No encontramos un perfil con el identificador solicitado.');
      }
    };

    if (!shouldUseBackend) {
      loadMock();
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${baseUrl}/api/nutricionistas/${id}`, {
        timeout: 5000,
      });
      const mapped = mapProfileFromResponse(response.data);
      setProfile(mapped);
      setSource('backend');
    } catch (apiError) {
      loadMock();
      setSource('mock');
      const message =
        apiError instanceof Error && apiError.message
          ? apiError.message
          : 'Error de conexión';
      setError(`No se pudo cargar el perfil (${message}). Intente nuevamente.`);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (lastId != null) {
      fetchProfile(lastId);
    }
  }, [fetchProfile, lastId]);

  const hasReviews = useMemo(() => (profile?.reviews?.length ?? 0) > 0, [profile]);

  return {
    profile,
    loading,
    error,
    source,
    hasReviews,
    fetchProfile,
    refetch,
  };
}
