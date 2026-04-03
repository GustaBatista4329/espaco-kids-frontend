import { Loader2 } from "lucide-react";
import { T } from "../../constants/theme";

export function Btn({ children, onClick, variant = "primary", disabled, loading, full, style: sx, ...props }) {
  const base = {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700, fontSize: 14, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 12, padding: "12px 24px", display: "inline-flex", alignItems: "center", gap: 8,
    transition: "all .2s", opacity: disabled ? 0.5 : 1,
    width: full ? "100%" : "auto", justifyContent: "center",
  };
  const variants = {
    primary: { background: T.red, color: "#fff" },
    secondary: { background: T.blue, color: "#fff" },
    outline: { background: "transparent", color: T.red, border: `2px solid ${T.red}` },
    ghost: { background: "transparent", color: T.textSecondary },
    success: { background: T.green, color: "#fff" },
    yellow: { background: T.yellow, color: T.textPrimary },
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{ ...base, ...variants[variant], ...sx }}
      onMouseEnter={(e) => { if (!disabled) e.target.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.target.style.transform = "none"; }}
      {...props}
    >
      {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
      {children}
    </button>
  );
}
