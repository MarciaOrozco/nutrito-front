export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onClose,
  confirmClassName = 'bg-clay text-white',
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-bark">{title}</h3>
        {description ? (
          <p className="mt-3 text-sm text-bark/70">{description}</p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-full border border-sand px-5 py-2 text-sm font-medium text-bark/80 transition hover:border-clay hover:text-clay"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`rounded-full px-5 py-2 text-sm font-semibold transition hover:opacity-80 ${confirmClassName}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
