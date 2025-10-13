const formatNumber = (value, suffix = '') => {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return '-';
  return `${Number(value)}${suffix}`;
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
};

export default function PreviewPlan({ plan }) {
  if (!plan) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-soft">
        <p className="text-sm text-bark/60">No hay informacion para previsualizar.</p>
      </div>
    );
  }

  const totalsByDay = plan.days?.map((day) => ({
    label: day.name ?? `Dia ${day.dayNumber}`,
    totals: day.totals ?? {},
  }));

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-bark/50">
              Plan #{plan.planId}
            </p>
            <h2 className="text-2xl font-semibold text-bark">
              {plan.title || 'Plan sin titulo'}
            </h2>
            <p className="text-sm text-bark/60">
              Estado: <span className="font-semibold text-clay">{plan.status}</span> · Origen:{' '}
              {plan.origin} · Creado: {formatDate(plan.createdAt)}
            </p>
          </div>
          <div className="rounded-2xl bg-bone px-4 py-3 text-sm text-bark/70">
            <p>Ultima actualizacion: {formatDate(plan.updatedAt)}</p>
            <p>Validado: {formatDate(plan.validatedAt)}</p>
          </div>
        </div>
        {plan.notes ? (
          <div className="mt-4 rounded-2xl bg-bone px-4 py-3 text-sm text-bark/80">
            <p className="font-semibold text-bark">Notas generales</p>
            <p className="mt-1 whitespace-pre-line text-sm">{plan.notes}</p>
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-bark">Datos del paciente</h3>
          <dl className="mt-4 grid gap-3 text-sm text-bark/70">
            <div className="flex items-center justify-between">
              <dt>Edad</dt>
              <dd>{plan.patientInfo?.age ?? '-'}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Sexo</dt>
              <dd>{plan.patientInfo?.sex ?? '-'}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Peso</dt>
              <dd>{formatNumber(plan.patientInfo?.weight, ' kg')}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Altura</dt>
              <dd>{formatNumber(plan.patientInfo?.height, ' cm')}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Nivel de actividad</dt>
              <dd>{plan.patientInfo?.activityLevel ?? '-'}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-bark">Objetivos del plan</h3>
          <dl className="mt-4 grid gap-3 text-sm text-bark/70">
            <div>
              <dt className="font-semibold text-bark">Principal</dt>
              <dd>{plan.objectives?.primary ?? '-'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-bark">Secundario</dt>
              <dd>{plan.objectives?.secondary ?? '-'}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Peso objetivo</dt>
              <dd>{formatNumber(plan.objectives?.targetWeight, ' kg')}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Tiempo estimado</dt>
              <dd>{plan.objectives?.timeframe ?? '-'}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-bark">Condiciones medicas</h3>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-bark/70">
            {(plan.medicalConditions?.conditions ?? []).length ? (
              plan.medicalConditions.conditions.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-bone px-3 py-1 text-xs font-semibold text-bark/70"
                >
                  {item}
                </span>
              ))
            ) : (
              <p>No se registraron condiciones especificas.</p>
            )}
          </div>
          {plan.medicalConditions?.notes ? (
            <p className="mt-3 rounded-2xl bg-bone px-4 py-3 text-sm text-bark/70">
              {plan.medicalConditions.notes}
            </p>
          ) : null}
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-bark">Restricciones</h3>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-bark/70">
            {(plan.restrictions?.allergies ?? []).map((item) => (
              <span
                key={item}
                className="rounded-full bg-bone px-3 py-1 text-xs font-semibold text-bark/70"
              >
                {item}
              </span>
            ))}
          </div>
          <dl className="mt-4 grid gap-3 text-sm text-bark/70">
            <div className="flex items-center justify-between">
              <dt>Dieta sugerida</dt>
              <dd>{plan.restrictions?.dietType ?? '-'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-bark">Alimentos a evitar</dt>
              <dd>
                {(plan.restrictions?.dislikes ?? []).length
                  ? plan.restrictions.dislikes.join(', ')
                  : '-'}
              </dd>
            </div>
            {plan.restrictions?.other ? (
              <div>
                <dt className="font-semibold text-bark">Notas</dt>
                <dd>{plan.restrictions.other}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </section>

      {totalsByDay?.length ? (
        <section className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-bark">Resumen semanal</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {totalsByDay.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-sand/60 bg-bone px-4 py-3 text-sm text-bark/80"
              >
                <p className="font-semibold text-bark">{item.label}</p>
                <p>Calorias: {formatNumber(item.totals.calories)}</p>
                <p>Proteinas: {formatNumber(item.totals.proteins)}</p>
                <p>Carbohidratos: {formatNumber(item.totals.carbs)}</p>
                <p>Grasas: {formatNumber(item.totals.fats)}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        {plan.days?.map((day) => (
          <div key={day.dayId ?? day.dayNumber} className="rounded-3xl bg-white p-6 shadow-soft">
            <header className="flex flex-col gap-1 border-b border-sand/60 pb-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-bark/50">
                  Dia {day.dayNumber}
                </p>
                <h4 className="text-lg font-semibold text-bark">
                  {day.name ?? `Dia ${day.dayNumber}`}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-bark/70">
                {day.totals?.calories ? (
                  <span className="rounded-full bg-bone px-3 py-1">
                    {day.totals.calories} kcal
                  </span>
                ) : null}
                {day.totals?.proteins ? (
                  <span className="rounded-full bg-bone px-3 py-1">
                    Proteinas: {day.totals.proteins} g
                  </span>
                ) : null}
                {day.totals?.carbs ? (
                  <span className="rounded-full bg-bone px-3 py-1">
                    Carbohidratos: {day.totals.carbs} g
                  </span>
                ) : null}
                {day.totals?.fats ? (
                  <span className="rounded-full bg-bone px-3 py-1">
                    Grasas: {day.totals.fats} g
                  </span>
                ) : null}
              </div>
            </header>

            {day.goal ? (
              <p className="mt-3 rounded-2xl bg-bone px-4 py-3 text-sm text-bark/80">
                Objetivo del dia: {day.goal}
              </p>
            ) : null}

            <div className="mt-4 flex flex-col gap-3">
              {day.meals?.length ? (
                day.meals.map((meal) => (
                  <div
                    key={meal.mealId ?? meal.order}
                    className="rounded-2xl border border-sand/60 bg-bone px-4 py-3 text-sm text-bark/80"
                  >
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <p className="font-semibold text-bark">
                        {meal.type} · {meal.title || 'Sin titulo'}
                      </p>
                      {meal.time ? (
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-bark/60">
                          {meal.time}
                        </span>
                      ) : null}
                    </div>
                    {meal.description ? (
                      <p className="mt-2 text-sm">{meal.description}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-bark/60">
                      {meal.calories ? <span>{meal.calories} kcal</span> : null}
                      {meal.proteins ? <span>Proteinas {meal.proteins} g</span> : null}
                      {meal.carbs ? <span>Carbohidratos {meal.carbs} g</span> : null}
                      {meal.fats ? <span>Grasas {meal.fats} g</span> : null}
                      {meal.fiber ? <span>Fibra {meal.fiber} g</span> : null}
                    </div>
                    {meal.foods?.length ? (
                      <div className="mt-2 text-xs text-bark/70">
                        <p className="font-semibold text-bark/80">Alimentos</p>
                        <ul className="mt-1 list-disc pl-5">
                          {meal.foods.map((food, index) => (
                            <li key={`${food.name}-${index}`}>
                              {food.quantity ? `${food.quantity}${food.unit ? ` ${food.unit}` : ''} ` : ''}
                              {food.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {meal.notes ? (
                      <p className="mt-2 rounded-xl bg-white px-3 py-2 text-xs text-bark/60">
                        {meal.notes}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-bark/60">
                  No hay comidas registradas para este dia.
                </p>
              )}
            </div>

            {day.notes ? (
              <p className="mt-3 rounded-2xl bg-bone px-4 py-3 text-sm text-bark/70">
                Notas del dia: {day.notes}
              </p>
            ) : null}
          </div>
        ))}
      </section>
    </div>
  );
}
