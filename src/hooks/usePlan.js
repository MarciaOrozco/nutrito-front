import axios from 'axios';
import { useAuth } from '../auth/useAuth.js';
import {
  buildMockPlanFromMetadata,
  mockPlan,
  mockPlanList,
} from '../mocks/plan.js';

const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === 'true';
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const ensureBlob = (content, type = 'application/pdf') =>
  new Blob([content], { type });

const extractFilename = (response) => {
  const disposition = response?.headers?.['content-disposition'];
  if (!disposition) return null;
  const match = disposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? null;
};

export default function usePlan() {
  const { token } = useAuth();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

  const getPlan = async (planId) => {
    if (!shouldUseBackend) {
      return { plan: { ...mockPlan, planId } };
    }

    const response = await axios.get(`${baseUrl}/api/planes/${planId}`, {
      headers: authHeaders,
    });
    return response.data;
  };

  const createManualPlan = async ({ pacienteId, metadata, days }) => {
    if (!shouldUseBackend) {
      return {
        plan: buildMockPlanFromMetadata({
          patientId: pacienteId,
          days,
          ...(metadata ?? {}),
        }),
      };
    }

    const response = await axios.post(
      `${baseUrl}/api/planes/manual`,
      {
        pacienteId,
        metadata,
        days,
      },
      { headers: authHeaders },
    );
    return response.data;
  };

  const createAiPlan = async ({ pacienteId, metadata }) => {
    if (!shouldUseBackend) {
      return {
        plan: buildMockPlanFromMetadata({
          patientId: pacienteId,
          origin: 'ia',
          ...(metadata ?? {}),
        }),
      };
    }

    const response = await axios.post(
      `${baseUrl}/api/planes/ia`,
      { pacienteId, metadata },
      { headers: authHeaders },
    );
    return response.data;
  };

  const updatePlan = async (planId, payload) => {
    if (!shouldUseBackend) {
      const metadataUpdates = payload.metadata ?? {};
      return {
        plan: {
          ...mockPlan,
          ...metadataUpdates,
          patientInfo: metadataUpdates.patientInfo ?? mockPlan.patientInfo,
          objectives: metadataUpdates.objectives ?? mockPlan.objectives,
          medicalConditions:
            metadataUpdates.medicalConditions ?? mockPlan.medicalConditions,
          restrictions:
            metadataUpdates.restrictions ?? mockPlan.restrictions,
          preferences:
            metadataUpdates.preferences ?? mockPlan.preferences,
          days: payload.days ?? mockPlan.days,
          status: payload.status ?? mockPlan.status,
          planId,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    const response = await axios.put(
      `${baseUrl}/api/planes/${planId}`,
      payload,
      { headers: authHeaders },
    );
    return response.data;
  };

  const validatePlan = async (planId, estado = 'validado') => {
    if (!shouldUseBackend) {
      return {
        plan: {
          ...mockPlan,
          status: estado,
          validatedAt: new Date().toISOString(),
        },
        message:
          estado === 'enviado'
            ? 'Plan validado y enviado al paciente'
            : 'Plan validado correctamente',
      };
    }

    const response = await axios.post(
      `${baseUrl}/api/planes/${planId}/validar`,
      { estado },
      { headers: authHeaders },
    );
    return response.data;
  };

  const exportPlan = async (planId) => {
    if (!shouldUseBackend) {
      const blob = ensureBlob(
        `Plan alimentario #${planId}\nEste es un PDF simulado.`,
        'application/pdf',
      );
      return { blob, filename: `plan-${planId}.pdf` };
    }

    const response = await axios.post(
      `${baseUrl}/api/planes/${planId}/exportar`,
      {},
      {
        headers: authHeaders,
        responseType: 'blob',
      },
    );

    const filename = extractFilename(response) ?? `plan-${planId}.pdf`;

    return { blob: response.data, filename };
  };

  const listPatientPlans = async (pacienteId) => {
    if (!shouldUseBackend) {
      return { planes: mockPlanList };
    }

    const response = await axios.get(
      `${baseUrl}/api/pacientes/${pacienteId}/planes`,
      { headers: authHeaders },
    );
    return response.data;
  };

  const deletePlan = async (planId) => {
    if (!shouldUseBackend) {
      return { success: true };
    }

    const response = await axios.delete(
      `${baseUrl}/api/planes/${planId}`,
      { headers: authHeaders },
    );

    return response.data;
  };

  return {
    getPlan,
    createManualPlan,
    createAiPlan,
    updatePlan,
    validatePlan,
    exportPlan,
    listPatientPlans,
    deletePlan,
  };
}
