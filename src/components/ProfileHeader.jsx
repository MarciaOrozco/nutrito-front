import RatingStars from './RatingStars.jsx';

const placeholderPhoto =
  'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=240&h=240&q=80';

export default function ProfileHeader({ profile, onSchedule }) {
  if (!profile) return null;

  const {
    name,
    title,
    mainSpecialty,
    rating = 0,
    reviewCount = 0,
    photoUrl,
  } = profile;
  const ratingValue = Number(rating) || 0;

  return (
    <section className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <img
          src={photoUrl || placeholderPhoto}
          alt={`Foto de ${name}`}
          loading="lazy"
          className="h-24 w-24 rounded-full object-cover shadow-inner ring-2 ring-sand/60 md:h-28 md:w-28"
        />

        <div className="flex flex-col gap-2">
          <div>
            <h2 className="text-2xl font-semibold text-bark">{name}</h2>
            <p className="text-sm text-bark/70">{title || 'Nutricionista en Nutrito'}</p>
          </div>
          <p className="text-sm font-medium uppercase tracking-wide text-clay">
            {mainSpecialty ?? 'Nutrición integral'}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-sm text-bark/80">
            <RatingStars value={ratingValue} />
            <span>{ratingValue.toFixed(1)}</span>
            <span className="text-bark/60">{reviewCount} reseñas</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSchedule}
        className="w-full rounded-xl border border-clay px-6 py-3 text-base font-semibold text-clay transition hover:bg-clay hover:text-white lg:w-auto"
      >
        Agendar consulta
      </button>
    </section>
  );
}
