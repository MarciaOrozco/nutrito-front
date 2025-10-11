import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth.js';

export default function RegisterPage() {
  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formValues, setFormValues] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const nextPath = new URLSearchParams(location.search).get('next') ?? '/mi-perfil';

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(nextPath, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, nextPath]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await register(formValues);

    if (!result.success) {
      setError(result.error ?? 'No se pudo completar el registro');
      setSubmitting(false);
      return;
    }

    navigate(nextPath, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bone px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-semibold text-bark">Crear cuenta</h1>
        <p className="mt-2 text-sm text-bark/60">
          Registrate para reservar consultas y acceder a tus planes personalizados.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-bark">
              Nombre
              <input
                name="nombre"
                type="text"
                required
                value={formValues.nombre}
                onChange={handleChange}
                className="rounded-xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-bark">
              Apellido
              <input
                name="apellido"
                type="text"
                required
                value={formValues.apellido}
                onChange={handleChange}
                className="rounded-xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-bark">
            Correo electrónico
            <input
              name="email"
              type="email"
              required
              value={formValues.email}
              onChange={handleChange}
              className="rounded-xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
              placeholder="usuario@nutrito.com"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-bark">
            Teléfono (opcional)
            <input
              name="telefono"
              type="text"
              value={formValues.telefono}
              onChange={handleChange}
              className="rounded-xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
              placeholder="Ej: +54 9 11 1234 5678"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-bark">
            Contraseña
            <input
              name="password"
              type="password"
              required
              minLength={6}
              value={formValues.password}
              onChange={handleChange}
              className="rounded-xl border border-sand bg-bone px-4 py-3 text-sm text-bark outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/30"
              placeholder="••••••••"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-bark/60">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-semibold text-clay hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
