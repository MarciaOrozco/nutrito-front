import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ConsultaTabs from "../components/consultas/ConsultaTabs.jsx";
import ConsultaInfoForm from "../components/consultas/ConsultaInfoForm.jsx";
import ConsultaMotivoForm from "../components/consultas/ConsultaMotivoForm.jsx";
import MedidasForm from "../components/consultas/MedidasForm.jsx";
import NotasForm from "../components/consultas/NotasForm.jsx";
import DocumentosForm from "../components/consultas/DocumentosForm.jsx";
import EvolucionChart from "../components/consultas/EvolucionChart.jsx";
import ExportForm from "../components/consultas/ExportForm.jsx";
import ProgramarProximaCita from "../components/consultas/ProgramarProximaCita.jsx";
import useConsultas from "../hooks/useConsultas.js";

const tabs = [
  { id: "informacion", label: "Información" },
  { id: "motivo", label: "Motivo" },
  { id: "medidas", label: "Medidas" },
  { id: "documentos", label: "Documentos" },
  { id: "notas", label: "Notas" },
  { id: "evolucion", label: "Evolución" },
  { id: "exportar", label: "Exportar" },
];

const defaultData = {
  fecha_consulta: new Date().toISOString().slice(0, 10),
  estado: "borrador",
};

const editableFields = [
  "fecha_consulta",
  "estado",
  "motivo",
  "antecedentes",
  "objetivos",
  "peso",
  "altura",
  "imc",
  "cintura",
  "cadera",
  "porcentaje_grasa",
  "porcentaje_magra",
  "meta_peso",
  "meta_semanal",
  "observaciones_medidas",
  "resumen",
  "diagnostico",
  "indicaciones",
  "observaciones_internas",
  "visibilidad_notas",
];

export default function ConsultaPage() {
  const { consultaId } = useParams();
  const [search] = useSearchParams();
  const pacienteId = search.get("paciente");
  const { getConsulta, updateConsulta, uploadDocuments, exportConsulta } =
    useConsultas();

  const [activeTab, setActiveTab] = useState("informacion");
  const [data, setData] = useState(defaultData);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSections, setSelectedSections] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getConsulta(consultaId);
        setData((prev) => ({ ...prev, ...response }));
        if (response.documentos) {
          setDocumentos(response.documentos);
        }
      } catch {
        setError("No pudimos cargar la consulta");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultaId]);

  const handleUpdate = (partial) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const handleSave = async () => {
    try {
      const payload = editableFields.reduce((acc, field) => {
        if (data[field] !== undefined) {
          acc[field] = data[field];
        }
        return acc;
      }, {});

      await updateConsulta(consultaId, payload);
      setFeedback("Consulta guardada correctamente");
    } catch {
      setFeedback("No pudimos guardar la consulta");
    }
  };

  const handleUploadDocuments = async (files) => {
    try {
      const response = await uploadDocuments(consultaId, files);
      setDocumentos((prev) => [...prev, ...response.documentos]);
      setFeedback("Documentos adjuntados");
    } catch {
      setFeedback("Error al adjuntar documentos");
    }
  };

  const toggleSection = (sectionId) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleExport = async () => {
    try {
      const blob = await exportConsulta(consultaId, selectedSections);
      if (blob instanceof Blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `consulta-${consultaId}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      }
      setFeedback("PDF generado");
    } catch {
      setFeedback("No pudimos generar el PDF");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bone">
        Cargando consulta...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bone">
        {error}
      </div>
    );
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-bark">
            Consulta #{consultaId}
          </h1>
          <p className="text-sm text-bark/60">
            {pacienteId ? `Paciente #${pacienteId}` : "Detalle de consulta"}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-[#739273] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Guardar
          </button>
          <Link
            to={pacienteId ? `/paciente/${pacienteId}` : "/panel-profesional"}
            className="rounded-full border border-sand px-5 py-2 text-sm font-semibold text-bark/70 transition hover:border-clay hover:text-clay"
          >
            Volver
          </Link>
        </div>
      </header>

      {feedback ? (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-700">
          {feedback}
        </div>
      ) : null}

      <ConsultaTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        {activeTab === "informacion" ? (
          <ConsultaInfoForm data={data} onChange={handleUpdate} />
        ) : null}
        {activeTab === "motivo" ? (
          <ConsultaMotivoForm data={data} onChange={handleUpdate} />
        ) : null}
        {activeTab === "medidas" ? (
          <MedidasForm data={data} onChange={handleUpdate} />
        ) : null}
        {activeTab === "documentos" ? (
          <DocumentosForm
            documentos={documentos}
            onUpload={handleUploadDocuments}
          />
        ) : null}
        {activeTab === "notas" ? (
          <NotasForm data={data} onChange={handleUpdate} />
        ) : null}
        {activeTab === "evolucion" ? (
          <EvolucionChart pacienteId={pacienteId} />
        ) : null}
        {activeTab === "exportar" ? (
          <div className="flex flex-col gap-6">
            <ExportForm
              selected={selectedSections}
              onToggle={toggleSection}
              onExport={handleExport}
            />
            <ProgramarProximaCita
              pacienteId={data?.paciente_id ?? pacienteId ?? null}
              nutricionistaId={data?.nutricionista_id ?? null}
              consultaId={consultaId ? Number(consultaId) : null}
              onSuccess={() => setFeedback("Próxima cita programada correctamente")}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
