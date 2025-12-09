import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";

type Benefit = {
  title: string;
  description: string;
};

const benefits: Benefit[] = [
  {
    title: "Más pacientes y mayor visibilidad",
    description:
      "Publicá tu perfil profesional con reseñas verificadas para atraer nuevos pacientes.",
  },
  {
    title: "Menos tareas repetitivas",
    description:
      "Usá plantillas y asistentes con IA para trabajar más rápido y con menos errores.",
  },
  {
    title: "Mejor seguimiento clínico",
    description:
      "Mantené historial de consultas, peso y evolución nutricional en un solo lugar.",
  },
  {
    title: "Agenda online eficiente",
    description:
      "Configurá turnos con recordatorios automáticos para reducir ausencias y cancelaciones.",
  },
];

export default function MembershipPage() {
  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-3xl bg-white p-8 shadow-soft">
        <p className="text-xs uppercase tracking-widest text-bark/50">
          Membresía profesional
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-bark">
          Potenciá tu consulta con Nutrito
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-bark/70">
          Esta es una membresía paga para nutricionistas que quieren operar toda
          la plataforma con la versión completa y centrarse en sus pacientes
          mientras automatizamos las tareas repetitivas.
        </p>
      </div>

      <div className="grid gap-6 rounded-3xl bg-white p-8 shadow-soft md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-sand/70 bg-bone/60 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-clay">
              Todo tu consultorio en un solo panel
            </p>
            <p className="mt-2 text-lg text-bark/80">
              Con la membresía profesional de Nutrito podés gestionar a tus
              pacientes de punta a punta: agenda online, historia clínica,
              consultas, planes personalizados (incluso con apoyo de IA) y
              comunicación asincrónica con tus pacientes desde un solo lugar.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex h-full flex-col gap-2 rounded-2xl border border-sand/70 bg-white p-4 shadow-sm"
              >
                <p className="text-sm font-semibold text-bark">
                  {benefit.title}
                </p>
                <p className="text-sm text-bark/70">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-sand/70 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-bark">
            Listo para sumar más pacientes
          </p>
          <p className="text-sm text-bark/70">
            Accedé a la versión profesional para centralizar tu práctica y
            ofrecer una experiencia moderna a cada paciente.
          </p>
          <Link
            to="/nutricionista/membresia/detalle"
            className="inline-flex items-center justify-center rounded-xl bg-clay px-4 py-3 text-center text-sm font-semibold text-white shadow transition hover:bg-clay/90"
          >
            Ver plan y beneficios
          </Link>

          <p className="text-xs text-bark/60">
            Solo los nutricionistas pueden acceder a este plan. Si sos paciente,
            volvé al inicio.
          </p>
        </div>
      </div>
    </section>
  );
}
