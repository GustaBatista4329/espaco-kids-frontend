import { T } from "../../constants/theme";

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: T.textPrimary, margin: 0, fontFamily: "'Nunito', sans-serif" }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: T.textSecondary, margin: "4px 0 0", fontFamily: "'Nunito', sans-serif", fontWeight: 500 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
