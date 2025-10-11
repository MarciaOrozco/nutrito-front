export default function DocumentosForm({ documentos, onUpload }) {
  const handleChange = (event) => {
    const { files } = event.target;
    if (files && files.length) {
      onUpload(files);
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 text-sm text-bark/80">
        {documentos.length ? (
          documentos.map((doc) => (
            <div key={doc.id ?? doc.ruta} className="rounded-2xl bg-bone px-4 py-2">
              {doc.descripcion ?? doc.nombre}
            </div>
          ))
        ) : (
          <p>No hay documentos asociados.</p>
        )}
      </div>
      <label className="flex flex-col gap-2 text-sm text-bark">
        Adjuntar archivos
        <input
          type="file"
          multiple
          onChange={handleChange}
          className="rounded-xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
        />
      </label>
    </div>
  );
}
