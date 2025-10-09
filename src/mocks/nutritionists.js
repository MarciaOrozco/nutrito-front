export const mockNutritionists = [
  {
    id: '1',
    name: 'Marcia Orozco',
    title: 'Lic. en Nutrición, Educadora en Diabetes, Nutrición Especializada',
    rating: 4.9,
    reviewCount: 128,
    specialties: ['Nutrición clínica', 'Diabetes', 'Nutrición especializada'],
    modalities: ['Presencial', 'Virtual'],
    photoUrl:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=240&h=240&q=80',
    about:
      'Apasionada por acompañar a personas con enfermedades metabólicas en la adopción de hábitos sostenibles. Combino herramientas de educación alimentaria y seguimiento personalizado.',
    education: [
      {
        id: 'ed-1',
        title: 'Licenciatura en Nutrición',
        institution: 'Universidad de Buenos Aires',
        description: 'Orientación en enfermedades crónicas no transmisibles.',
        year: 2017,
      },
      {
        id: 'ed-2',
        title: 'Diplomatura en Diabetes',
        institution: 'Hospital Italiano de Buenos Aires',
        description: 'Programa intensivo interdisciplinario en manejo de diabetes tipo 1 y 2.',
        year: 2020,
      },
    ],
    reviews: [
      {
        id: 'rv-1',
        patient: 'Laura Fernández',
        comment:
          'Excelente acompañamiento. Las pautas son claras y el seguimiento semanal me ayudó a sostener los cambios.',
        rating: 5,
        date: '2024-09-12',
      },
      {
        id: 'rv-2',
        patient: 'Mariano Díaz',
        comment:
          'Me brindó un plan flexible y adaptado a mis horarios. Muy buena disposición para responder dudas.',
        rating: 4,
        date: '2024-07-03',
      },
    ],
  },
  {
    id: '2',
    name: 'Andrea Sosa',
    title: 'Lic. en Nutrición Deportiva y Rehabilitación Metabólica',
    rating: 4.7,
    reviewCount: 96,
    specialties: ['Nutrición deportiva', 'Metabolismo'],
    modalities: ['Virtual'],
    photoUrl:
      'https://images.unsplash.com/photo-1544723795-3fb0b39d26c5?auto=format&fit=facearea&w=240&h=240&q=80',
    about:
      'Trabajo con deportistas amateur y profesionales para optimizar el rendimiento y la recuperación con planes personalizados.',
    education: [
      {
        id: 'ed-3',
        title: 'Licenciatura en Nutrición',
        institution: 'Universidad Nacional de La Plata',
        description: 'Especialización en fisiología del ejercicio.',
        year: 2016,
      },
      {
        id: 'ed-4',
        title: 'Posgrado en Nutrición Deportiva',
        institution: 'Universidad Austral',
        description: 'Estrategias nutricionales en deportes de resistencia y fuerza.',
        year: 2019,
      },
    ],
    reviews: [
      {
        id: 'rv-3',
        patient: 'Sofía Molina',
        comment: 'Los resultados se notaron rápido. Plan claro y adaptado a mis competencias.',
        rating: 5,
        date: '2024-05-21',
      },
    ],
  },
  {
    id: '3',
    name: 'Daniela Flores',
    title: 'Lic. en Nutrición Infantil y Trastornos Alimentarios',
    rating: 4.8,
    reviewCount: 142,
    specialties: ['Nutrición infantil', 'Nutrición clínica'],
    modalities: ['Presencial'],
    photoUrl:
      'https://images.unsplash.com/photo-1544723795-3fb13a1e97c5?auto=format&fit=facearea&w=240&h=240&q=80',
    about:
      'Acompaño a familias en el desarrollo de hábitos saludables desde las primeras etapas de la vida.',
    education: [
      {
        id: 'ed-5',
        title: 'Licenciatura en Nutrición',
        institution: 'Universidad Nacional de Córdoba',
        description: 'Prácticas en hospitales pediátricos.',
        year: 2015,
      },
      {
        id: 'ed-6',
        title: 'Especialización en Trastornos de la Conducta Alimentaria',
        institution: 'FLENI',
        description: 'Enfoque interdisciplinario y terapia familiar.',
        year: 2021,
      },
    ],
    reviews: [],
  },
];

export function getMockNutritionistById(id) {
  return mockNutritionists.find((item) => String(item.id) === String(id)) ?? null;
}
