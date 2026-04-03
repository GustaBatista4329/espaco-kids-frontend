import { useState, useCallback, createContext, useContext } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { T } from "../constants/theme";

const ToastCtx = createContext(null);

export function useToast() { return useContext(ToastCtx); }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            padding: "12px 20px", borderRadius: 14,
            background: t.type === "error" ? T.red : T.green,
            color: "#fff", fontSize: 14, fontWeight: 600,
            boxShadow: T.shadow, display: "flex", alignItems: "center", gap: 8,
            animation: "slideIn .3s ease",
            fontFamily: "'Nunito', sans-serif",
          }}>
            {t.type === "error" ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
