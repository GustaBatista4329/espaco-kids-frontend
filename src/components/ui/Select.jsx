import { ChevronDown } from "lucide-react";
import { T } from "../../constants/theme";

export function Select({ label, options, value, onChange, placeholder, style: sx }) {
  return (
    <div style={{ marginBottom: 16, ...sx }}>
      {label && <label style={{ fontSize: 13, fontWeight: 700, color: T.textSecondary, marginBottom: 6, display: "block", fontFamily: "'Nunito', sans-serif" }}>{label}</label>}
      <div style={{ position: "relative" }}>
        <select value={value} onChange={(e) => onChange(e.target.value)} style={{
          width: "100%", padding: "13px 40px 13px 14px", borderRadius: 12,
          border: "2px solid transparent", background: T.lightGray,
          fontSize: 15, color: T.textPrimary, fontWeight: 600,
          fontFamily: "'Nunito', sans-serif", cursor: "pointer",
          appearance: "none", outline: "none",
        }}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={18} color={T.textSecondary} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
}
