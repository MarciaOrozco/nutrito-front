import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../auth/useAuth.js";

type BenefitGroup = {
  title: string;
  items: string[];
};

const benefitGroups: BenefitGroup[] = [
  {
    title: "Gestión de pacientes y consultas",
    items: [
      "Panel con listado de pacientes y ficha individual.",
      "Historia clínica y carga de estudios adjuntos.",
      "Registro de consultas con evolución, notas y seguimiento de peso.",
      "Visión clara de próximas citas y consultas recientes.",
    ],
  },
  {
    title: "Agenda online y retención",
    items: [
      "Agenda de turnos online configurable por el nutricionista.",
      "Recordatorios automáticos de turnos para los pacientes.",
      "Reprogramación y cancelación de turnos desde la plataforma.",
      "Herramientas orientadas a mejorar la retención de pacientes.",
    ],
  },
  {
    title: "Planes de alimentación y soporte con IA",
    items: [
      "Creación de planes de alimentación personalizados.",
      "Asistentes con IA para sugerir estructuras de planes según objetivos y restricciones.",
      "Generación de recetas y listas de compras basadas en el plan del paciente.",
      "Plantillas reutilizables para acelerar la carga de planes.",
    ],
  },
  {
    title: "Comunicación con el paciente",
    items: [
      "Mensajería asincrónica controlada por el nutricionista.",
      "Espacios para compartir material educativo y recomendaciones.",
      "Foros / secciones donde solo los nutricionistas pueden responder, para posicionarse como referentes.",
    ],
  },
  {
    title: "Visibilidad y reputación profesional",
    items: [
      "Perfil profesional visible para potenciales pacientes.",
      "Carga de formación académica y especialidades.",
      "Gestión de reseñas y valoraciones de pacientes para reforzar tu reputación online.",
    ],
  },
];

export default function MembershipDetailPage() {
  const navigate = useNavigate();

  const summaryItems = useMemo(
    () => [
      "Centralizá toda tu práctica en una única herramienta.",
      "Ahorrá tiempo con plantillas y asistentes de IA.",
      "Ofrecé una experiencia moderna a tus pacientes con agenda online y recordatorios.",
      "Ganá visibilidad y construí tu reputación con reseñas verificadas.",
    ],
    []
  );

  const handleCheckout = () => {
    // TODO: integrar con checkout de Mercado Pago aquí.
    navigate("/nutricionista/membresia/pago-pendiente");
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-3xl bg-white p-8 shadow-soft">
        <p className="text-xs uppercase tracking-widest text-bark/50">
          Plan profesional
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-bark">
          Plan Profesional para Nutricionistas
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-bark/70">
          Todo lo que necesitás para organizar tu consulta, mejorar la
          experiencia de tus pacientes y hacer crecer tu negocio desde un solo
          panel.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid gap-4">
            {benefitGroups.map((group) => (
              <div
                key={group.title}
                className="rounded-3xl border border-sand/70 bg-white p-6 shadow-soft"
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-clay">
                  {group.title}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-bark/80">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span
                        className="mt-1 h-2 w-2 rounded-full bg-clay"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-sand/70 bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold text-bark">
            Todo en una sola membresía
          </p>
          <ul className="space-y-3 text-sm text-bark/80">
            {summaryItems.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span
                  className="mt-1 h-2 w-2 rounded-full bg-clay"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handleCheckout}
            className="mt-2 inline-flex items-center justify-center rounded-xl bg-clay px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-clay/90"
          >
            Continuar al pago (placeholder)
          </button>

          <Link
            to="/panel-profesional"
            className="inline-flex items-center justify-center rounded-xl border border-sand px-4 py-3 text-sm font-semibold text-bark/80 transition hover:border-clay hover:text-clay"
          >
            Volver al panel
          </Link>

          <p className="text-xs text-bark/60">
            Esta sección es exclusiva para nutricionistas registrados. Iniciá
            sesión con tu cuenta profesional para continuar.
          </p>
        </div>
      </div>
    </section>
  );
}
