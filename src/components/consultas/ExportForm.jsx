const sections = [
  { id: "informacion", label: "Información" },
  { id: "motivo", label: "Motivo" },
  { id: "medidas", label: "Medidas" },
  { id: "notas", label: "Notas" },
];

export default function ExportForm({ selected, onToggle, onExport }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {sections.map((section) => (
          <label
            key={section.id}
            className="flex items-center gap-3 text-sm text-bark"
          >
            <input
              type="checkbox"
              checked={selected.includes(section.id)}
              onChange={() => onToggle(section.id)}
            />
            {section.label}
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={onExport}
        className="w-fit rounded-full bg-[#739273] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Generar PDF
      </button>
    </div>
  );
}
