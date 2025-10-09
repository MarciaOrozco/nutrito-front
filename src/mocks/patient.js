export const mockPatientProfile = {
  contacto: {
    pacienteId: 1,
    nombre: 'Marcia',
    apellido: 'Orozco',
    email: 'marcia@example.com',
    telefono: '+54 341 304 1989',
    ciudad: 'Rosario, Santa Fe',
  },
  proximoTurno: {
    id: 101,
    fecha: '2025-02-15',
    hora: '16:30',
    modalidad: 'Consulta online',
    modalidadId: 2,
    estado: 'Confirmado',
    estadoId: 2,
    nutricionista: {
      id: 1,
      nombre: 'Andrea',
      apellido: 'Sosa',
    },
  },
  historial: [
    {
      id: 90,
      fecha: '2024-12-10',
      hora: '15:00',
      modalidad: 'Consulta presencial',
      estado: 'Completado',
      estadoId: 4,
      nutricionista: {
        id: 1,
        nombre: 'Andrea',
        apellido: 'Sosa',
      },
    },
  ],
  planes: [
    {
      id: 201,
      fechaCreacion: '2024-11-05',
      estado: 'Activo',
      notas: 'Plan hipocalórico adaptado a actividad física.',
    },
  ],
  documentos: [
    {
      id: 301,
      descripcion: 'Análisis laboratorio septiembre',
      ruta: 'uploads/mock-analisis.pdf',
      fecha: '2024-09-02',
    },
    {
      id: 302,
      descripcion: 'Plan inicial.pdf',
      ruta: 'uploads/mock-plan.pdf',
      fecha: '2024-08-12',
    },
  ],
};
