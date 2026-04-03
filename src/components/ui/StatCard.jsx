import { T } from "../../constants/theme";
import { Card } from "./Card";

export function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16, background: color + "18",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 900, color: T.textPrimary, lineHeight: 1, fontFamily: "'Nunito', sans-serif" }}>{value}</div>
        <div style={{ fontSize: 13, color: T.textSecondary, fontWeight: 600, marginTop: 2, fontFamily: "'Nunito', sans-serif" }}>{label}</div>
      </div>
    </Card>
  );
}
