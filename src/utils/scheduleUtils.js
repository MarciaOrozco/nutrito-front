export const todayISO = () => new Date().toISOString().slice(0, 10);

export const buildLocationOptions = (modalities = []) =>
  modalities
    .map((modality, index) => {
      const label =
        typeof modality === 'string'
          ? modality
          : modality.name ?? modality.nombre ?? '';

      if (!label) return null;

      return {
        id:
          typeof modality === 'string'
            ? `mod-${index}`
            : String(modality.id ?? modality.modalidad_id ?? `mod-${index}`),
        label,
        modalidadId:
          typeof modality === 'string'
            ? null
            : Number(modality.id ?? modality.modalidad_id ?? NaN),
      };
    })
    .filter(Boolean);

export const buildPaymentOptions = (
  paymentMethods = [],
  insuranceProviders = [],
) => {
  const normalizedMethods = paymentMethods.map((method, index) => ({
    id: method.id ?? `method-${index}`,
    name: method.name ?? method.nombre ?? `Método ${index + 1}`,
  }));

  const obraSocialMethod = normalizedMethods.find((method) =>
    method.name.toLowerCase().includes('obra'),
  );

  const insuranceOptions = obraSocialMethod
    ? insuranceProviders.map((insurance) => ({
        id: `insurance-${insurance.id}`,
        label: `${insurance.name} (Obra social)`,
        methodId: obraSocialMethod.id,
        insuranceId: insurance.id,
        type: 'insurance',
      }))
    : [];

  const methodOptions = normalizedMethods.map((method) => ({
    id: `method-${method.id}`,
    label: method.name,
    methodId: method.id,
    type: 'method',
  }));

  return [...insuranceOptions, ...methodOptions];
};
