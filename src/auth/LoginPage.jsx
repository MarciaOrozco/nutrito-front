import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth.js';

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formValues, setFormValues] = useState({ email: '', password: '' });
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

    const result = await login(formValues);

    if (!result.success) {
      setError(result.error ?? 'Credenciales inválidas');
      setSubmitting(false);
      return;
    }

    navigate(nextPath, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bone px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-semibold text-bark">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-bark/60">
          Accedé para gestionar tus turnos y documentos.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
            Contraseña
            <input
              name="password"
              type="password"
              required
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
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-bark/60">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-semibold text-clay hover:underline">
            Registrate como paciente
          </Link>
        </p>
      </div>
    </div>
  );
}
