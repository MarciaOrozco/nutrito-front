import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useLinkedPatients from '../hooks/useLinkedPatients.js';
import useNutritionistAppointments from '../hooks/useNutritionistAppointments.js';
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
  const [searchTerm, setSearchTerm] = useState('');
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
  } = useNutritionistAppointments(nutricionistaId);

  const filteredPatients = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return patients;

    return patients.filter((patient) => {
      const fullName = `${patient.nombre ?? ''} ${patient.apellido ?? ''}`.toLowerCase();
      const email = (patient.email ?? '').toLowerCase();
      return fullName.includes(normalizedTerm) || email.includes(normalizedTerm);
    });
  }, [patients, searchTerm]);

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
      {appointmentsError ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {appointmentsError}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-bark">Mis pacientes</h2>
          <p className="mt-2 text-sm text-bark/60">
            Seleccioná un paciente para ver su ficha completa.
          </p>
          <div className="mt-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nombre o email"
              className="w-full rounded-xl border border-sand bg-white px-4 py-2 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
            />
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {loading ? (
              <div className="h-32 animate-pulse rounded-2xl bg-bone" />
            ) : filteredPatients.length ? (
              filteredPatients.map((patient) => (
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
            ) : patients.length ? (
              <p className="text-sm text-bark/60">
                No se encontraron pacientes que coincidan con tu búsqueda.
              </p>
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
            {appointmentsLoading ? (
              <div className="h-32 animate-pulse rounded-2xl bg-bone" />
            ) : appointments.length ? (
              appointments.map((turn) => (
                <div
                  key={turn.id}
                  className="flex items-center justify-between rounded-2xl bg-bone px-4 py-3 text-sm text-bark/80"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-bark">
                      {turn.paciente?.nombre ?? ''} {turn.paciente?.apellido ?? ''}
                    </span>
                    <span className="text-xs text-bark/50">{turn.paciente?.email}</span>
                  </div>
                  <div className="text-right text-sm text-bark/70">
                    <p>{formatDate(turn.fecha)}</p>
                    {turn.hora ? <p>{turn.hora} hs</p> : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-bark/60">No hay turnos próximos registrados.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
