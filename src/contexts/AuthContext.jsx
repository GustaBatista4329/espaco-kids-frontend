import { useState, useCallback, createContext, useContext } from "react";
import { decodeJwt } from "../utils/jwt";
import { createApi } from "../services/api";

const AuthCtx = createContext(null);

export function useAuth() { return useContext(AuthCtx); }

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try { return sessionStorage.getItem("ek_token"); } catch { return null; }
  });
  const [user, setUser] = useState(() => {
    if (!token) return null;
    const d = decodeJwt(token);
    if (!d) return null;
    return { login: d.sub, perfil: d.perfil, userId: d.userId, responsavelId: d.responsavelId };
  });

  const getToken = useCallback(() => token, [token]);

  const logout = useCallback(() => {
    sessionStorage.removeItem("ek_token");
    setToken(null);
    setUser(null);
  }, []);

  const api = useCallback(() => createApi(getToken, logout), [getToken, logout])();

  function login(tk) {
    sessionStorage.setItem("ek_token", tk);
    setToken(tk);
    const d = decodeJwt(tk);
    if (d) setUser({ login: d.sub, perfil: d.perfil, userId: d.userId, responsavelId: d.responsavelId });
  }

  return (
    <AuthCtx.Provider value={{ token, user, api, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
