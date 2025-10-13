import MealEditor from './MealEditor.jsx';

export default function DayEditor({
  day,
  onChange,
  onUpdateMeal,
  onAddMeal,
  onRemoveMeal,
  onUpdateTotals,
  disabled = false,
}) {
  const handleField = (field, value) => {
    onChange?.({
      ...day,
      [field]: value,
    });
  };

  const totals = day.totals ?? {};
  const meals = day.meals ?? [];

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-soft">
      <header className="flex flex-col gap-2 border-b border-sand/60 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-bark/50">
            Dia {day.dayNumber}
          </p>
          <input
            type="text"
            value={day.name ?? ''}
            onChange={(event) => handleField('name', event.target.value)}
            disabled={disabled}
            className="mt-1 w-full rounded-xl border border-sand px-3 py-2 text-lg font-semibold text-bark focus:border-clay focus:outline-none md:w-72"
            placeholder="Nombre del dia"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex flex-col text-xs text-bark/70">
            Calorias
            <input
              type="number"
              value={totals.calories ?? ''}
              onChange={(event) =>
                onUpdateTotals?.(day.dayNumber, {
                  ...totals,
                  calories: Number(event.target.value),
                })
              }
              disabled={disabled}
              className="mt-1 w-24 rounded-full border border-sand px-3 py-1 text-sm text-bark focus:border-clay focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-xs text-bark/70">
            Proteinas
            <input
              type="number"
              value={totals.proteins ?? ''}
              onChange={(event) =>
                onUpdateTotals?.(day.dayNumber, {
                  ...totals,
                  proteins: Number(event.target.value),
                })
              }
              disabled={disabled}
              className="mt-1 w-24 rounded-full border border-sand px-3 py-1 text-sm text-bark focus:border-clay focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-xs text-bark/70">
            Carbohidratos
            <input
              type="number"
              value={totals.carbs ?? ''}
              onChange={(event) =>
                onUpdateTotals?.(day.dayNumber, {
                  ...totals,
                  carbs: Number(event.target.value),
                })
              }
              disabled={disabled}
              className="mt-1 w-24 rounded-full border border-sand px-3 py-1 text-sm text-bark focus:border-clay focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-xs text-bark/70">
            Grasas
            <input
              type="number"
              value={totals.fats ?? ''}
              onChange={(event) =>
                onUpdateTotals?.(day.dayNumber, {
                  ...totals,
                  fats: Number(event.target.value),
                })
              }
              disabled={disabled}
              className="mt-1 w-24 rounded-full border border-sand px-3 py-1 text-sm text-bark focus:border-clay focus:outline-none"
            />
          </label>
        </div>
      </header>

      <label className="flex flex-col gap-2 text-xs text-bark/70">
        Objetivo del dia
        <input
          type="text"
          value={day.goal ?? ''}
          onChange={(event) => handleField('goal', event.target.value)}
          disabled={disabled}
          className="rounded-xl border border-sand px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-2 text-xs text-bark/70">
        Notas
        <textarea
          value={day.notes ?? ''}
          onChange={(event) => handleField('notes', event.target.value)}
          disabled={disabled}
          className="min-h-[64px] rounded-xl border border-sand px-3 py-2 text-sm text-bark focus:border-clay focus:outline-none"
        />
      </label>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-bark">
            Comidas del dia ({meals.length})
          </h3>
          <button
            type="button"
            onClick={() => onAddMeal?.(day.dayNumber)}
            disabled={disabled}
            className="rounded-full bg-clay px-4 py-2 text-xs font-semibold text-white hover:bg-clay/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Agregar comida
          </button>
        </div>
        {meals.length ? (
          <div className="flex flex-col gap-4">
            {meals.map((meal, index) => (
              <MealEditor
                key={meal.mealId ?? `${day.dayNumber}-${index}`}
                meal={meal}
                index={index}
                disabled={disabled}
                onChange={(updatedMeal) =>
                  onUpdateMeal?.(day.dayNumber, index, updatedMeal)
                }
                onRemove={() => onRemoveMeal?.(day.dayNumber, index)}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-sand bg-bone/50 p-4 text-sm text-bark/60">
            Todavia no hay comidas registradas para este dia. Agrega una para comenzar.
          </p>
        )}
      </div>
    </div>
  );
}
