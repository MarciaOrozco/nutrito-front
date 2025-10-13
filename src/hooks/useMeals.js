import { useCallback } from 'react';

const withArray = (value) => (Array.isArray(value) ? value : []);

export default function useMeals(setPlan) {
  const updateDay = useCallback(
    (dayNumber, updater) =>
      setPlan((current) => {
        if (!current) return current;
        const nextDays = withArray(current.days).map((day) => {
          if (day.dayNumber !== dayNumber) return day;
          const updated = updater(day) ?? day;
          return {
            ...day,
            ...updated,
          };
        });
        return {
          ...current,
          days: nextDays,
        };
      }),
    [setPlan],
  );

  const addMeal = useCallback(
    (dayNumber, meal) => {
      updateDay(dayNumber, (day) => {
        const meals = withArray(day.meals);
        const nextOrder =
          meal?.order ??
          (meals.length ? Math.max(...meals.map((m) => m.order ?? 0)) + 1 : 1);
        return {
          meals: [
            ...meals,
            {
              order: nextOrder,
              type: 'Comida',
              description: '',
              ...meal,
            },
          ],
        };
      });
    },
    [updateDay],
  );

  const updateMeal = useCallback(
    (dayNumber, mealIndex, updates) => {
      updateDay(dayNumber, (day) => {
        const meals = withArray(day.meals);
        if (mealIndex < 0 || mealIndex >= meals.length) return;
        const updatedMeals = meals.map((meal, index) =>
          index === mealIndex ? { ...meal, ...updates } : meal,
        );
        return { meals: updatedMeals };
      });
    },
    [updateDay],
  );

  const removeMeal = useCallback(
    (dayNumber, mealIndex) => {
      updateDay(dayNumber, (day) => {
        const meals = withArray(day.meals);
        if (mealIndex < 0 || mealIndex >= meals.length) return;
        const updatedMeals = meals.filter((_, index) => index !== mealIndex);
        return { meals: updatedMeals };
      });
    },
    [updateDay],
  );

  const updateDayInfo = useCallback(
    (dayNumber, info) => {
      updateDay(dayNumber, () => info);
    },
    [updateDay],
  );

  const updateDayTotals = useCallback(
    (dayNumber, totals) => {
      updateDay(dayNumber, (day) => ({
        totals: {
          ...(day.totals ?? {}),
          ...totals,
        },
      }));
    },
    [updateDay],
  );

  const reorderMeals = useCallback(
    (dayNumber, fromIndex, toIndex) => {
      updateDay(dayNumber, (day) => {
        const meals = withArray(day.meals);
        if (
          fromIndex < 0 ||
          fromIndex >= meals.length ||
          toIndex < 0 ||
          toIndex >= meals.length
        ) {
          return;
        }
        const nextMeals = [...meals];
        const [moved] = nextMeals.splice(fromIndex, 1);
        nextMeals.splice(toIndex, 0, moved);
        return {
          meals: nextMeals.map((meal, index) => ({
            ...meal,
            order: index + 1,
          })),
        };
      });
    },
    [updateDay],
  );

  return {
    addMeal,
    updateMeal,
    removeMeal,
    updateDayInfo,
    updateDayTotals,
    reorderMeals,
  };
}
