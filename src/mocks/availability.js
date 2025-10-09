import { mockNutritionists } from './nutritionists.js';

const defaultSlots = ['09:00', '09:30', '10:00', '10:30', '11:00'];

const formatSlot = (time) => ({ time, label: `${time} hs` });

export function getMockAvailabilityFor(nutricionistaId, isoDate) {
  const nutritionist = mockNutritionists.find(
    (item) => String(item.id) === String(nutricionistaId),
  );

  const baseSlots = nutritionist?.mockSlots ?? defaultSlots;

  return {
    nutricionistaId,
    fecha: isoDate,
    slots: baseSlots.map(formatSlot),
  };
}
