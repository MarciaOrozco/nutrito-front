import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import SidebarFilters from '../components/SidebarFilters.jsx';
import NutritionistList from '../components/NutritionistList.jsx';
import { useFilters } from '../context/FiltersContext.jsx';
import useNutritionists from '../hooks/useNutritionists.js';

export default function SearchPage() {
  const navigate = useNavigate();
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

  const handleViewProfile = (id) => {
    navigate(`/perfil/${id}`);
  };

  return (
    <section className="flex w-full flex-col gap-6">
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
          onSelect={handleViewProfile}
        />
      </div>
    </section>
  );
}
