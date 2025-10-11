export default function ConsultaTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-3xl bg-white p-4 shadow-soft">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === tab.id
              ? 'bg-[#739273] text-white'
              : 'bg-bone text-bark hover:bg-[#739273]/10'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
