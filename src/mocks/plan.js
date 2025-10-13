const now = () => new Date().toISOString();

const baseDays = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
];

const buildMockPlan = (overrides = {}) => {
  const planId = overrides.planId ?? Math.floor(Math.random() * 10000);
  return {
    planId,
    patientId: overrides.patientId ?? 1,
    nutritionistId: overrides.nutritionistId ?? 1,
    status: overrides.status ?? "borrador",
    origin: overrides.origin ?? "manual",
    title: overrides.title ?? "Plan de ejemplo",
    notes:
      overrides.notes ??
      "Plan alimentario de muestra generado en modo sin backend.",
    createdAt: now(),
    updatedAt: now(),
    validatedAt: null,
    patientInfo: {
      age: 30,
      sex: "F",
      weight: 70,
      height: 165,
      activityLevel: "Moderada",
      ...(overrides.patientInfo ?? {}),
    },
    objectives: {
      primary: "Mejorar composicion corporal",
      secondary: "Incrementar energia diaria",
      targetWeight: 65,
      timeframe: "12 semanas",
      ...(overrides.objectives ?? {}),
    },
    medicalConditions: {
      conditions: ["Hipertension"],
      notes: "Controlar sodio en preparaciones.",
      ...(overrides.medicalConditions ?? {}),
    },
    restrictions: {
      allergies: ["Lactosa"],
      dislikes: ["Brocoli"],
      dietType: "Equilibrada",
      other: null,
      ...(overrides.restrictions ?? {}),
    },
    preferences: {
      likedFoods: ["Frutas frescas", "Granos integrales"],
      dislikedFoods: ["Gaseosas"],
      notes: null,
      ...(overrides.preferences ?? {}),
    },
    days:
      overrides.days ??
      baseDays.map((name, index) => ({
        dayNumber: index + 1,
        name,
        goal: "Mantener balance energetico.",
        notes: null,
        totals: {
          calories: 1800,
          proteins: 90,
          carbs: 210,
          fats: 60,
        },
        meals: [
          {
            order: 1,
            type: "Desayuno",
            title: "Avena con frutas",
            description:
              "Avena cocida con leche vegetal, banana y semillas de chia.",
            time: "08:00",
            calories: 350,
            proteins: 12,
            carbs: 50,
            fats: 10,
            foods: [
              { name: "Avena", quantity: "60", unit: "g" },
              { name: "Leche vegetal", quantity: "200", unit: "ml" },
            ],
          },
          {
            order: 2,
            type: "Almuerzo",
            title: "Pollo con quinoa",
            description:
              "Pechuga a la plancha con quinoa y ensalada de hojas verdes.",
            time: "13:00",
            calories: 550,
            proteins: 45,
            carbs: 45,
            fats: 18,
          },
          {
            order: 3,
            type: "Merienda",
            title: "Yogur natural",
            description: "Yogur descremado con nueces y miel.",
            time: "17:00",
            calories: 250,
            proteins: 12,
            carbs: 28,
            fats: 9,
          },
          {
            order: 4,
            type: "Cena",
            title: "Sopa y tortillas",
            description:
              "Sopa de calabaza con tortilla de vegetales y pan integral.",
            time: "20:00",
            calories: 450,
            proteins: 22,
            carbs: 42,
            fats: 15,
          },
        ],
      })),
    ...(overrides ?? {}),
  };
};

export const mockPlan = buildMockPlan();

export const mockPlanList = [
  {
    id: mockPlan.planId,
    fechaCreacion: now().slice(0, 10),
    ultimaActualizacion: now().slice(0, 10),
    estado: "borrador",
    origen: "manual",
    titulo: "Plan de ejemplo",
    notas: "Plan simulado.",
  },
];

export const buildMockPlanFromMetadata = (metadata = {}) =>
  buildMockPlan({
    ...metadata,
    planId: Math.floor(Math.random() * 10000),
    createdAt: now(),
    updatedAt: now(),
    status: metadata.status ?? "borrador",
  });
