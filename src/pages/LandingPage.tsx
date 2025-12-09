import { Link } from "react-router-dom";

const nutritBenefits = [
  "Dashboard con tus pacientes y próximas consultas.",
  "Historia clínica, evolución y registro de peso.",
  "Planes de alimentación con plantillas y asistencia de IA.",
  "Agenda online con recordatorios automatizados.",
];

const patientBenefits = [
  "Buscá nutricionistas por especialidad.",
  "Agendá y reprogramá turnos de forma sencilla.",
  "Recibí recordatorios de tus consultas.",
  "Accedé a tus planes y materiales compartidos.",
];

export default function LandingPage() {
  return (
    <section className="flex flex-col gap-8">
      <div className="rounded-3xl bg-white p-8 shadow-soft">
        <p className="text-xs uppercase tracking-widest text-bark/50">
          Plataforma integral
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-bark">
          Organizá tu consulta nutricional y conectá con más pacientes.
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-bark/70">
          Una plataforma pensada para nutricionistas y pacientes: agenda online,
          seguimiento de consultas, planes personalizados y comunicación
          centralizada.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link
            to="/nutricionista/membresia"
            className="inline-flex items-center justify-center rounded-xl bg-clay px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-clay/90"
          >
            Soy nutricionista: ver membresía
          </Link>
          <Link
            to="/buscar"
            className="inline-flex items-center justify-center rounded-xl border border-sand px-5 py-3 text-sm font-semibold text-bark/80 transition hover:border-clay hover:text-clay"
          >
            Soy paciente: conseguí tu próximo turno
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-3xl border border-sand/70 bg-white p-6 shadow-soft">
          <div>
            <p className="text-xs uppercase tracking-widest text-bark/50">
              Para nutricionistas
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-bark">
              Impulsá tu consultorio
            </h2>
            <p className="mt-2 text-sm text-bark/70">
              Centralizá la gestión de tus pacientes, organizá tu agenda y
              generá planes personalizados con apoyo de IA, todo desde un solo
              panel.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-bark/80">
            {nutritBenefits.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span
                  className="mt-1 h-2 w-2 rounded-full bg-clay"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/nutricionista/membresia"
            className="inline-flex w-full items-center justify-center rounded-xl border border-clay px-4 py-3 text-sm font-semibold text-clay transition hover:bg-clay hover:text-white sm:w-auto"
          >
            Ver membresía
          </Link>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-sand/70 bg-white p-6 shadow-soft">
          <div>
            <p className="text-xs uppercase tracking-widest text-bark/50">
              Para pacientes
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-bark">
              Cuidá tu alimentación
            </h2>
            <p className="mt-2 text-sm text-bark/70">
              Encontrá a tu nutricionista ideal, agendá turnos online y seguí
              tus planes y recomendaciones desde un solo lugar.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-bark/80">
            {patientBenefits.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span
                  className="mt-1 h-2 w-2 rounded-full bg-sand"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/buscar"
            className="inline-flex w-full items-center justify-center rounded-xl bg-clay px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-clay/90 sm:w-auto"
          >
            Ver nutricionistas disponibles
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-sand/70 bg-white p-6 text-center shadow-soft">
        <p className="text-lg font-semibold text-bark">
          Nutrito reúne en un solo lugar todo lo que necesitan nutricionistas y
          pacientes para trabajar juntos de forma organizada y eficiente.
        </p>
        <p className="mt-2 text-sm text-bark/70">
          Hecha para profesionales que quieren dar un mejor servicio, y para
          pacientes que buscan un seguimiento claro y sostenido.
        </p>
      </div>
    </section>
  );
}
