import NutritionistCard from './NutritionistCard.jsx';

export default function NutritionistList({ items, loading, error, source, onSelect }) {
  if (loading) {
    return (
      <section className="flex flex-1 flex-col gap-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="h-32 w-full animate-pulse rounded-3xl bg-white/60 shadow-soft"
          />
        ))}
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col gap-4">
      {error ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      ) : null}

      {source === 'mock' ? (
        <div className="rounded-2xl border border-sand bg-bone p-4 text-sm text-bark/70">
          Estamos mostrando datos simulados. Configura <code>VITE_USE_BACKEND=true</code> y{' '}
          <code>VITE_API_BASE_URL</code> para consumir la API real.
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-3xl border border-sand bg-white p-8 text-center text-bark/70 shadow-soft">
          No encontramos nutricionistas con los filtros seleccionados. Ajusta tu búsqueda e intenta
          nuevamente.
        </div>
      ) : (
        items.map((nutritionist) => (
          <NutritionistCard
            key={nutritionist.id}
            nutritionist={nutritionist}
            onViewProfile={onSelect}
          />
        ))
      )}
    </section>
  );
}
