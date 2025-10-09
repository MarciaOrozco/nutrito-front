import RatingStars from "./RatingStars.jsx";

const placeholderPhoto =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTc4zvZXFnRMQoRBx94eBCvl7_hKz_eLv7vg&s";

export default function NutritionistCard({ nutritionist, onViewProfile }) {
  const {
    name,
    title,
    rating = 0,
    reviewCount = 0,
    specialties = [],
    modalities = [],
    photoUrl,
  } = nutritionist;

  const handleClick = () => {
    if (onViewProfile) {
      onViewProfile(nutritionist.id);
    }
  };

  return (
    <article className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg md:flex-row md:items-center md:gap-6">
      <img
        src={photoUrl || placeholderPhoto}
        alt={`Foto de ${name}`}
        className="h-20 w-20 flex-shrink-0 rounded-full object-cover shadow-inner ring-2 ring-sand/60"
        loading="lazy"
      />

      <div className="flex flex-1 flex-col gap-3">
        <div>
          <h3 className="text-xl font-semibold text-bark">{name}</h3>
          <p className="text-sm text-bark/70">
            {title || "Nutricionista certificado/a"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-bark/80">
          <RatingStars value={rating} />
          <span>{rating.toFixed(1)}</span>
          <span className="text-bark/60">{reviewCount} opiniones</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {specialties.map((spec) => (
            <span
              key={spec}
              className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-bark/80"
            >
              {spec}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-bark/60">
          {modalities.map((modality) => {
            const label =
              typeof modality === "string"
                ? modality
                : modality.name ?? modality.nombre ?? "";

            if (!label) return null;

            return (
              <span
                key={label}
                className="rounded-full border border-sand px-2 py-0.5"
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handleClick}
        className="w-full rounded-xl border border-clay px-5 py-3 text-sm font-semibold text-clay transition hover:bg-clay hover:text-white md:w-auto"
      >
        Ver perfil
      </button>
    </article>
  );
}
