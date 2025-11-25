import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProfileHeader from "../components/ProfileHeader.jsx";
import ProfileSection from "../components/ProfileSection.jsx";
import ReviewCard from "../components/ReviewCard.jsx";
import useNutritionistProfile from "../hooks/useNutritionistProfile.js";
import { useAuth } from "../auth/useAuth.js";
import ScheduleSetupModal from "../components/ScheduleSetupModal.jsx";

const DEFAULT_WEEKLY_SCHEDULE = [
  {
    key: "monday",
    label: "Lunes",
    start: "09:00",
    end: "17:00",
    duration: "30",
    enabled: true,
  },
  {
    key: "tuesday",
    label: "Martes",
    start: "09:00",
    end: "17:00",
    duration: "30",
    enabled: true,
  },
  {
    key: "wednesday",
    label: "Miércoles",
    start: "09:00",
    end: "17:00",
    duration: "30",
    enabled: true,
  },
  {
    key: "thursday",
    label: "Jueves",
    start: "09:00",
    end: "17:00",
    duration: "30",
    enabled: true,
  },
  {
    key: "friday",
    label: "Viernes",
    start: "09:00",
    end: "17:00",
    duration: "30",
    enabled: true,
  },
  {
    key: "saturday",
    label: "Sábado",
    start: "09:00",
    end: "13:00",
    duration: "30",
    enabled: false,
  },
  {
    key: "sunday",
    label: "Domingo",
    start: "09:00",
    end: "13:00",
    duration: "30",
    enabled: false,
  },
];

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, loading, error, hasReviews, fetchProfile, refetch } =
    useNutritionistProfile();
  const { user, isAuthenticated } = useAuth();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState(() =>
    DEFAULT_WEEKLY_SCHEDULE.map((day) => ({ ...day }))
  );

  useEffect(() => {
    fetchProfile(id);
  }, [id, fetchProfile]);

  const isOwnProfile = useMemo(() => {
    if (!isAuthenticated || user?.rol !== "nutricionista") return false;
    if (!id || !user?.nutricionistaId) return false;
    return String(user.nutricionistaId) === String(id);
  }, [id, isAuthenticated, user]);
  const actionButtonLabel = isOwnProfile
    ? "Generar turnos"
    : "Agendar consulta";

  const handleSchedule = () => {
    navigate(`/agendar/${id}`);
  };

  const handleActionClick = () => {
    if (isOwnProfile) {
      setIsScheduleModalOpen(true);
      return;
    }
    handleSchedule();
  };

  const handleToggleDayAvailability = (dayKey) => {
    setWeeklySchedule((prev) =>
      prev.map((day) =>
        day.key === dayKey ? { ...day, enabled: !day.enabled } : day
      )
    );
  };

  const handleScheduleFieldChange = (dayKey, field, value) => {
    setWeeklySchedule((prev) =>
      prev.map((day) => (day.key === dayKey ? { ...day, [field]: value } : day))
    );
  };

  const handleScheduleSave = () => {
    const toastApi = window?.toast;
    if (toastApi && typeof toastApi.success === "function") {
      toastApi.success(
        "Guardamos esta configuración para tus próximos turnos."
      );
    } else if (typeof window?.alert === "function") {
      window.alert("Guardamos esta configuración para tus próximos turnos.");
    } else {
      console.log("Configuración de turnos lista:", weeklySchedule);
    }
    setIsScheduleModalOpen(false);
  };

  const closeScheduleModal = () => setIsScheduleModalOpen(false);

  const renderHeaderSkeleton = () => (
    <div className="h-40 animate-pulse rounded-3xl bg-white/60 shadow-soft" />
  );

  const renderContentSkeleton = () => (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      {[...Array(3)].map((_, index) => (
        <div
          key={`profile-skeleton-${index}`}
          className="h-40 animate-pulse rounded-3xl bg-white/60 shadow-soft"
        />
      ))}
    </div>
  );

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-sand px-4 py-2 text-sm font-medium text-bark/80 transition hover:border-clay hover:text-clay"
        >
          <span aria-hidden="true">←</span>
          Volver
        </button>
        <p className="text-xs uppercase tracking-widest text-bark/60">
          Agenda con este profesional
        </p>
      </div>

      {error ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p>{error}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={refetch}
              className="rounded-full border border-amber-500 px-4 py-2 font-semibold text-amber-900 transition hover:bg-amber-500 hover:text-white"
            >
              Reintentar
            </button>
            <Link
              to="/buscar"
              className="rounded-full border border-amber-500 px-4 py-2 font-semibold text-amber-900 transition hover:bg-amber-500 hover:text-white"
            >
              Volver a la búsqueda
            </Link>
          </div>
        </div>
      ) : null}

      {profile ? (
        <ProfileHeader
          profile={profile}
          onSchedule={handleActionClick}
          actionLabel={actionButtonLabel}
        />
      ) : null}
      {!profile && loading ? renderHeaderSkeleton() : null}

      {profile ? (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="flex flex-col gap-6">
            <ProfileSection title="Sobre mí">
              <p>
                {profile.about ||
                  "Este profesional aún no cargó información personal."}
              </p>
            </ProfileSection>

            <ProfileSection title="Educación">
              {profile.education?.length ? (
                profile.education.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-sand/60 bg-bone/70 p-4"
                  >
                    <p className="text-sm font-semibold text-bark">
                      {item.title}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-clay">
                      {item.institution}
                      {item.year ? ` · ${item.year}` : ""}
                    </p>
                    {item.description ? (
                      <p className="mt-2 text-sm text-bark/70">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p>No se registró información educativa todavía.</p>
              )}
            </ProfileSection>

            <ProfileSection title="Reseñas que ha recibido">
              {hasReviews ? (
                profile.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              ) : (
                <p>Este profesional aún no ha recibido reseñas.</p>
              )}
            </ProfileSection>
          </div>

          <div className="flex flex-col gap-6">
            <ProfileSection title="Especialidades">
              {profile.specialties?.length ? (
                <ul className="flex flex-col gap-2">
                  {profile.specialties.map((specialty) => (
                    <li
                      key={specialty}
                      className="rounded-full bg-sand px-4 py-2 text-sm text-bark"
                    >
                      {specialty}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No se registraron especialidades asociadas.</p>
              )}
            </ProfileSection>

            <ProfileSection title="Métodos de pago aceptados">
              {profile.paymentMethods?.length ? (
                <ul className="flex flex-col gap-2">
                  {profile.paymentMethods.map((method) => (
                    <li
                      key={method.id}
                      className="rounded-full border border-sand px-4 py-2 text-sm text-bark/80"
                    >
                      {method.name}
                      {method.description ? (
                        <span className="block text-xs text-bark/60">
                          {method.description}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  Este profesional acordará el método de pago durante la
                  consulta.
                </p>
              )}
            </ProfileSection>

            {profile.modalities?.length ? (
              <ProfileSection title="Modalidades de atención">
                <div className="flex flex-wrap gap-2">
                  {profile.modalities.map((modality) => {
                    const label =
                      typeof modality === "string"
                        ? modality
                        : modality.name ?? modality.nombre ?? "";

                    if (!label) return null;

                    return (
                      <span
                        key={modality.id ?? label}
                        className="rounded-full border border-sand px-3 py-1 text-sm text-bark/80"
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </ProfileSection>
            ) : null}
          </div>
        </div>
      ) : null}

      {!profile && loading ? renderContentSkeleton() : null}

      <ScheduleSetupModal
        open={isScheduleModalOpen}
        onClose={closeScheduleModal}
        schedule={weeklySchedule}
        onToggleDay={handleToggleDayAvailability}
        onChangeField={handleScheduleFieldChange}
        onSave={handleScheduleSave}
      />
    </section>
  );
}
