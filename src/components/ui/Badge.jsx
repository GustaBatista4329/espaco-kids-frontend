import { T } from "../../constants/theme";

export function Badge({ children, color = T.blue }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
      background: color + "18", color: color, fontFamily: "'Nunito', sans-serif",
    }}>{children}</span>
  );
}
