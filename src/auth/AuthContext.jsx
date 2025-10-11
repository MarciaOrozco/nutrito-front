import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext({});

const TOKEN_STORAGE_KEY = 'nutrito_token';

const anonymousState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export function AuthProvider({ children }) {
  const [state, setState] = useState(anonymousState);
  const [loading, setLoading] = useState(true);

  const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === 'true';
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

  const fetchMe = useCallback(
    async (token) => {
      if (!shouldUseBackend) {
        setState({
          user: {
            usuarioId: 1,
            rol: 'paciente',
            nombre: 'Paciente Demo',
            apellido: 'Nutrito',
            email: 'demo@nutrito.test',
            pacienteId: 1,
          },
          token: 'mock-token',
          isAuthenticated: true,
        });
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setState({
          user: response.data,
          token,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('No se pudo recuperar la sesión:', error);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setState(anonymousState);
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, shouldUseBackend],
  );

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    fetchMe(storedToken);
  }, [fetchMe]);

  const handleLogin = useCallback(
    async ({ email, password }) => {
      if (!shouldUseBackend) {
        const mockToken = 'mock-token';
        localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);
        await fetchMe(mockToken);
        return { success: true };
      }

      try {
        const response = await axios.post(`${baseUrl}/api/auth/login`, {
          email,
          password,
        });

        const { token } = response.data;
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        setLoading(true);
        await fetchMe(token);
        return { success: true };
      } catch (error) {
        setState(anonymousState);
        setLoading(false);
        const message = axios.isAxiosError(error)
          ? error.response?.data?.error ?? 'No se pudo iniciar sesión'
          : error instanceof Error && error.message
            ? error.message
            : 'No se pudo iniciar sesión';

        return {
          success: false,
          error: message,
        };
      }
    },
    [baseUrl, fetchMe, shouldUseBackend],
  );

  const handleRegister = useCallback(
    async (payload) => {
      if (!shouldUseBackend) {
        const mockToken = 'mock-token';
        localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);
        await fetchMe(mockToken);
        return { success: true };
      }

      try {
        const response = await axios.post(`${baseUrl}/api/auth/register`, payload);
        const { token } = response.data;
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        setLoading(true);
        await fetchMe(token);
        return { success: true };
      } catch (error) {
        setLoading(false);
        const message = axios.isAxiosError(error)
          ? error.response?.data?.error ?? 'No se pudo completar el registro'
          : error instanceof Error && error.message
            ? error.message
            : 'No se pudo completar el registro';

        return {
          success: false,
          error: message,
        };
      }
    },
    [baseUrl, fetchMe, shouldUseBackend],
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setState(anonymousState);
  }, []);

  const decodedToken = useMemo(() => {
    if (!state.token) return null;
    try {
      return jwtDecode(state.token);
    } catch {
      return null;
    }
  }, [state.token]);

  const value = useMemo(
    () => ({
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated,
      loading,
      login: handleLogin,
      logout: handleLogout,
      register: handleRegister,
      decodedToken,
      refreshSession: () => {
        if (state.token) fetchMe(state.token);
      },
    }),
    [state, loading, handleLogin, handleLogout, handleRegister, decodedToken, fetchMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
