import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import SearchPage from './pages/SearchPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-bone">
        <header className="border-b border-sand/80 bg-white">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand text-2xl font-bold text-clay">
                N
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-bark/60">Nutrito</p>
                <h1 className="font-display text-2xl text-bark">Cuidando tu alimentación</h1>
              </div>
            </div>
            <button className="rounded-full border border-clay px-5 py-2 text-sm font-semibold text-clay transition hover:bg-clay hover:text-white">
              Mi perfil
            </button>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
          <Routes>
            <Route path="/" element={<Navigate to="/buscar" replace />} />
            <Route path="/buscar" element={<SearchPage />} />
            <Route path="/perfil/:id" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
