import { useEffect } from 'react';
import SearchBar from './components/SearchBar.jsx';
import SidebarFilters from './components/SidebarFilters.jsx';
import NutritionistList from './components/NutritionistList.jsx';
import { useFilters } from './context/FiltersContext.jsx';
import useNutritionists from './hooks/useNutritionists.js';

function App() {
  const { filters, updateFilters, toggleListFilter } = useFilters();
  const {
    nutritionists,
    loading,
    error,
    source,
    fetchNutritionists,
    availableSpecialties,
    availableModalities,
  } = useNutritionists();

  useEffect(() => {
    fetchNutritionists(filters);
  }, [filters, fetchNutritionists]);

  const handleSearch = (searchFilters) => {
    updateFilters(searchFilters);
  };

  const handleToggleSpecialty = (value) => {
    toggleListFilter('specialties', value);
  };

  const handleToggleModality = (value) => {
    toggleListFilter('modalities', value);
  };

  return (
    <div className="flex min-h-screen flex-col bg-bone">
      <header className="border-b border-sand/80 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand text-2xl font-bold text-clay">
              N
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-bark/60">CU-001-001</p>
              <h1 className="font-display text-2xl text-bark">Nutrito</h1>
            </div>
          </div>
          <button className="rounded-full border border-clay px-5 py-2 text-sm font-semibold text-clay transition hover:bg-clay hover:text-white">
            Iniciar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10 lg:flex-row">
        <section className="flex w-full flex-col gap-6 lg:flex-1">
          <SearchBar initialValues={filters} onSearch={handleSearch} loading={loading} />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <SidebarFilters
              specialtyOptions={availableSpecialties}
              modalityOptions={availableModalities}
              selectedSpecialties={filters.specialties}
              selectedModalities={filters.modalities}
              onToggleSpecialty={handleToggleSpecialty}
              onToggleModality={handleToggleModality}
            />

            <NutritionistList
              items={nutritionists}
              loading={loading}
              error={error}
              source={source}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
