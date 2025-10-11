import { Link } from 'react-router-dom';
import useLinkedPatients from '../hooks/useLinkedPatients.js';
import { useAuth } from '../auth/useAuth.js';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export default function NutritionistDashboard() {
  const { user } = useAuth();
  const nutricionistaId = user?.nutricionistaId ?? null;
  const { patients, loading, error } = useLinkedPatients(nutricionistaId);

  const mockTurns = [
    { id: 1, paciente: 'Marcia Orozco', fecha: '2025-02-15' },
    { id: 2, paciente: 'Laura Fernández', fecha: '2025-02-18' },
  ];

  if (!nutricionistaId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bone px-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-soft">
          <h1 className="text-2xl font-semibold text-bark">Panel profesional</h1>
          <p className="mt-4 text-sm text-bark/70">
            No encontramos tu perfil de nutricionista. Verificá con el administrador de la
            plataforma si tu cuenta está configurada correctamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-bark">Panel profesional</h1>
          <p className="text-sm text-bark/60">Consultá tus pacientes y turnos próximos.</p>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-bark">Mis pacientes</h2>
          <p className="mt-2 text-sm text-bark/60">
            Seleccioná un paciente para ver su ficha completa.
          </p>

          <div className="mt-5 flex flex-col gap-4">
            {loading ? (
              <div className="h-32 animate-pulse rounded-2xl bg-bone" />
            ) : patients.length ? (
              patients.map((patient) => (
                <div
                  key={patient.pacienteId}
                  className="flex items-center justify-between rounded-2xl bg-bone px-4 py-3 text-sm text-bark/80"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-bark">
                      {patient.nombre} {patient.apellido}
                    </span>
                    <span className="text-xs text-bark/50">{patient.email}</span>
                  </div>
                  <Link
                    to={`/paciente/${patient.pacienteId}`}
                    className="rounded-full border border-[#739273] px-4 py-2 text-sm font-semibold text-[#739273] transition hover:bg-[#739273] hover:text-white"
                  >
                    Ver perfil
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-bark/60">Todavía no tenés pacientes vinculados.</p>
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-bark">Próximos turnos</h2>
          <p className="mt-2 text-sm text-bark/60">
            Visualizá tus consultas agendadas. (Reprogramar y cancelar llegarán pronto)
          </p>

          <div className="mt-5 flex flex-col gap-3">
            {mockTurns.map((turn) => (
              <div
                key={turn.id}
                className="flex items-center justify-between rounded-2xl bg-bone px-4 py-3 text-sm text-bark/80"
              >
                <span>{turn.paciente}</span>
                <span>{formatDate(turn.fecha)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
