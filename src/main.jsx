import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import App from './App.jsx';
import { FiltersProvider } from './context/FiltersContext.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <FiltersProvider>
        <App />
      </FiltersProvider>
    </AuthProvider>
  </StrictMode>,
);
