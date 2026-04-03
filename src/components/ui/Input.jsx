import { useState } from "react";
import { Eye } from "lucide-react";
import { T } from "../../constants/theme";

export function Input({ label, icon: Icon, error, style: sx, showToggle, ...props }) {
  const [visible, setVisible] = useState(false);
  const isPassword = props.type === "password";
  const inputType = isPassword && showToggle ? (visible ? "text" : "password") : props.type;

  return (
    <div style={{ marginBottom: 16, ...sx }}>
      {label && <label style={{ fontSize: 13, fontWeight: 700, color: T.textSecondary, marginBottom: 6, display: "block", fontFamily: "'Nunito', sans-serif" }}>{label}</label>}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: T.lightGray, borderRadius: 12, padding: "0 14px",
        border: error ? `2px solid ${T.red}` : "2px solid transparent",
        transition: "border .2s",
      }}>
        {Icon && <Icon size={18} color={T.textSecondary} />}
        <input style={{
          border: "none", background: "transparent", padding: "13px 0",
          fontSize: 15, color: T.textPrimary, outline: "none", width: "100%",
          fontFamily: "'Nunito', sans-serif", fontWeight: 600,
        }} {...props} type={inputType} />
        {isPassword && showToggle && (
          <button type="button" onClick={() => setVisible((v) => !v)} style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            display: "flex", alignItems: "center", color: T.textSecondary, flexShrink: 0,
          }}>
            {visible
              ? <Eye size={18} color={T.textSecondary} style={{ opacity: 0.5 }} />
              : <Eye size={18} color={T.textSecondary} />}
          </button>
        )}
      </div>
      {error && <span style={{ fontSize: 12, color: T.red, marginTop: 4, display: "block", fontFamily: "'Nunito', sans-serif" }}>{error}</span>}
    </div>
  );
}
