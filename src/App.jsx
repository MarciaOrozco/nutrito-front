import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import SearchPage from "./pages/SearchPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SchedulePage from "./pages/SchedulePage.jsx";
import PatientProfilePage from "./pages/PatientProfilePage.jsx";
import NutritionistDashboard from "./pages/NutritionistDashboard.jsx";
import LoginPage from "./auth/LoginPage.jsx";
import RegisterPage from "./auth/RegisterPage.jsx";
import PrivateRoute from "./auth/PrivateRoute.jsx";
import { useAuth } from "./auth/useAuth.js";

function App() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-bone">
        <header className="border-b border-sand/80 bg-white">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand text-2xl font-bold text-clay">
                <Link to="/ "> N </Link>
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-bark/60">
                  Nutrito
                </p>
                <h1 className="font-display text-2xl text-bark">
                  Cuidando tu alimentación
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {user?.rol === "paciente" ? (
                    <Link
                      to="/mi-perfil"
                      className="rounded-full border border-clay px-5 py-2 text-sm font-semibold text-clay transition hover:bg-clay hover:text-white"
                    >
                      Mi perfil
                    </Link>
                  ) : null}
                  {user?.rol === "nutricionista" ? (
                    <Link
                      to="/panel-profesional"
                      className="rounded-full border border-clay px-5 py-2 text-sm font-semibold text-clay transition hover:bg-clay hover:text-white"
                    >
                      Panel profesional
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-full border border-sand px-5 py-2 text-sm font-semibold text-bark/70 transition hover:border-clay hover:text-clay"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-full border border-clay px-5 py-2 text-sm font-semibold text-clay transition hover:bg-clay hover:text-white"
                  >
                    Ingresar
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full border border-sand px-5 py-2 text-sm font-semibold text-bark/70 transition hover:border-clay hover:text-clay"
                  >
                    Registrarme
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
          <Routes>
            <Route path="/" element={<Navigate to="/buscar" replace />} />
            <Route path="/buscar" element={<SearchPage />} />
            <Route path="/perfil/:id" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<PrivateRoute roles={["paciente"]} />}>
              <Route
                path="/agendar/:nutricionistaId"
                element={<SchedulePage />}
              />
              <Route path="/mi-perfil" element={<PatientProfilePage />} />
            </Route>
            <Route element={<PrivateRoute roles={["nutricionista"]} />}>
              <Route
                path="/panel-profesional"
                element={<NutritionistDashboard />}
              />
              <Route
                path="/paciente/:pacienteId"
                element={<PatientProfilePage readOnly />}
              />
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
