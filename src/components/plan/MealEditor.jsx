const mealTypes = [
  'Desayuno',
  'Media manana',
  'Almuerzo',
  'Merienda',
  'Cena',
  'Colacion',
];

const toFoodsArray = (text) =>
  text
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((name) => ({ name }));

export default function MealEditor({
  meal,
  index = 0,
  disabled = false,
  onChange,
  onRemove,
}) {
  const handleField = (field, value) => {
    onChange?.({
      ...meal,
      [field]: value,
    });
  };

  const foodsText = (meal.foods ?? []).map((item) => item.name).join('\n');

  return (
    <div className="rounded-2xl border border-sand bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-bark">
          Comida {index + 1} · {meal.type ?? 'Sin tipo'}
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-bark/50">Orden</span>
          <input
            type="number"
            min="1"
            value={meal.order ?? index + 1}
            onChange={(event) => handleField('order', Number(event.target.value))}
            disabled={disabled}
            className="w-16 rounded-full border border-sand px-2 py-1 text-center text-sm text-bark focus:border-clay focus:outline-none"
          />
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="rounded-full border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Quitar
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-bark/70">
          Tipo de comida
          <select
            value={meal.type ?? ''}
            onChange={(event) => handleField('type', event.target.value)}
            disabled={disabled}
            className="rounded-xl border border-sand px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
          >
            <option value="">Seleccionar</option>
            {mealTypes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-bark/70">
          Hora
          <input
            type="time"
            value={meal.time ?? ''}
            onChange={(event) => handleField('time', event.target.value)}
            disabled={disabled}
            className="rounded-xl border border-sand px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-bark/70 md:col-span-2">
          Titulo o nombre
          <input
            type="text"
            value={meal.title ?? ''}
            onChange={(event) => handleField('title', event.target.value)}
            disabled={disabled}
            className="rounded-xl border border-sand px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-bark/70 md:col-span-2">
          Descripcion
          <textarea
            value={meal.description ?? ''}
            onChange={(event) => handleField('description', event.target.value)}
            disabled={disabled}
            className="min-h-[80px] rounded-xl border border-sand px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs text-bark/70">
          Calorias
          <input
            type="number"
            value={meal.calories ?? ''}
            onChange={(event) => handleField('calories', Number(event.target.value))}
            disabled={disabled}
            className="rounded-xl border border-sand px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-bark/70">
          Proteinas
          <input
            type="number"
            value={meal.proteins ?? ''}
            onChange={(event) => handleField('proteins', Number(event.target.value))}
            disabled={disabled}
            className="rounded-xl border border-sand px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-bark/70">
          Carbohidratos
          <input
            type="number"
            value={meal.carbs ?? ''}
            onChange={(event) => handleField('carbs', Number(event.target.value))}
            disabled={disabled}
            className="rounded-xl border border-sand px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-bark/70">
          Grasas
          <input
            type="number"
            value={meal.fats ?? ''}
            onChange={(event) => handleField('fats', Number(event.target.value))}
            disabled={disabled}
            className="rounded-xl border border-sand px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-bark/70">
          Alimentos (uno por linea)
          <textarea
            value={foodsText}
            onChange={(event) => handleField('foods', toFoodsArray(event.target.value))}
            disabled={disabled}
            className="min-h-[72px] rounded-xl border border-sand px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-bark/70">
          Observaciones
          <textarea
            value={meal.notes ?? ''}
            onChange={(event) => handleField('notes', event.target.value)}
            disabled={disabled}
            className="min-h-[72px] rounded-xl border border-sand px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
          />
        </label>
      </div>
    </div>
  );
}
