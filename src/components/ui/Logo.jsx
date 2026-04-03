import { Sun } from "lucide-react";
import { T } from "../../constants/theme";

export function Logo({ size = "md" }) {
  const s = size === "lg" ? 1.4 : size === "sm" ? 0.7 : 1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 * s }}>
      <div style={{ position: "relative", width: 44 * s, height: 44 * s }}>
        <div style={{
          width: 44 * s, height: 44 * s, borderRadius: 12 * s,
          background: `linear-gradient(135deg, ${T.red}, ${T.red}dd)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 12px ${T.red}44`,
          transform: "rotate(-3deg)",
        }}>
          <span style={{ color: "#fff", fontSize: 18 * s, fontWeight: 900, fontFamily: "'Nunito', sans-serif" }}>D</span>
        </div>
        <div style={{
          position: "absolute", top: -4 * s, right: -6 * s,
          width: 18 * s, height: 18 * s, borderRadius: 6 * s,
          background: T.yellow, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 2px 8px ${T.yellow}66`,
        }}>
          <Sun size={10 * s} color={T.warmGray} strokeWidth={3} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11 * s, fontWeight: 700, color: T.blue, letterSpacing: 1, fontFamily: "'Nunito', sans-serif", lineHeight: 1 }}>Tia Dalqui</div>
        <div style={{ fontSize: 18 * s, fontWeight: 900, color: T.red, lineHeight: 1.1, fontFamily: "'Nunito', sans-serif" }}>Espaço Kids</div>
      </div>
    </div>
  );
}
