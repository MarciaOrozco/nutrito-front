export default function ProfileSection({ title, description, children, className = '' }) {
  return (
    <section className={`rounded-3xl bg-white p-6 shadow-soft ${className}`}>
      <header className="mb-4">
        <h3 className="text-lg font-semibold text-bark">{title}</h3>
        {description ? <p className="mt-2 text-sm text-bark/60">{description}</p> : null}
      </header>
      <div className="flex flex-col gap-3 text-sm text-bark/80">{children}</div>
    </section>
  );
}
