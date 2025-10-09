export default function SidebarFilters({
  specialtyOptions,
  modalityOptions,
  selectedSpecialties,
  selectedModalities,
  onToggleSpecialty,
  onToggleModality,
}) {
  const renderOption = (option, selected, onToggle, name) => (
    <label
      key={option}
      className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-bone"
    >
      <input
        type="checkbox"
        name={name}
        value={option}
        checked={selected}
        onChange={() => onToggle(option)}
        className="h-4 w-4 rounded border-sand text-clay focus:ring-clay"
      />
      <span className="text-sm font-medium text-bark/90 group-hover:text-bark">{option}</span>
    </label>
  );

  return (
    <aside className="flex w-full flex-col gap-8 rounded-3xl bg-white p-6 shadow-soft lg:w-72">
      <div>
        <h2 className="text-lg font-semibold text-bark">Especialista en</h2>
        <div className="mt-3 flex flex-col">
          {specialtyOptions.length ? (
            specialtyOptions.map((option) =>
              renderOption(option, selectedSpecialties.includes(option), onToggleSpecialty, 'specialty'),
            )
          ) : (
            <p className="text-sm text-bark/60">No hay especialidades disponibles.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-bark">Modalidad</h2>
        <div className="mt-3 flex flex-col">
          {modalityOptions.length ? (
            modalityOptions.map((option) =>
              renderOption(option, selectedModalities.includes(option), onToggleModality, 'modality'),
            )
          ) : (
            <p className="text-sm text-bark/60">No hay modalidades registradas.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
