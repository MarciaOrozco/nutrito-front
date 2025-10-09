import { createContext, useContext, useMemo, useState } from 'react';

const initialFilters = {
  name: '',
  specialty: '',
  specialties: [],
  modalities: [],
};

// Estado global para compartir filtros activos entre los componentes de búsqueda.
const FiltersContext = createContext(undefined);

export function FiltersProvider({ children }) {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilters = (partialFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...partialFilters,
    }));
  };

  const toggleListFilter = (key, value) => {
    setFilters((prev) => {
      const currentValues = prev[key] ?? [];
      const exists = currentValues.includes(value);
      const nextValues = exists
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [key]: nextValues,
      };
    });
  };

  const resetFilters = () => setFilters(initialFilters);

  const value = useMemo(
    () => ({
      filters,
      updateFilters,
      toggleListFilter,
      resetFilters,
    }),
    [filters],
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFilters() {
  const context = useContext(FiltersContext);

  if (context === undefined) {
    throw new Error('useFilters debe usarse dentro de FiltersProvider');
  }

  return context;
}
