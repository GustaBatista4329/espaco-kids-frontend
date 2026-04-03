import { T } from "../../constants/theme";

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%", background: T.yellowLight,
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
      }}>
        <Icon size={36} color={T.yellow} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, margin: "0 0 8px", fontFamily: "'Nunito', sans-serif" }}>{title}</h3>
      <p style={{ fontSize: 14, color: T.textSecondary, margin: 0, fontFamily: "'Nunito', sans-serif" }}>{subtitle}</p>
    </div>
  );
}
