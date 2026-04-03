import { Phone, AtSign, LogOut } from "lucide-react";
import { T } from "../../constants/theme";
import { Logo } from "../ui/Logo";
import { Badge } from "../ui/Badge";
import { Btn } from "../ui/Btn";

const PERFIL_LABELS = { ADM: "Administrador(a)", PROFESSORA: "Professora", RESPONSAVEL: "Responsável" };
const PERFIL_COLORS = { ADM: T.red, PROFESSORA: T.blue, RESPONSAVEL: T.green };

export function Sidebar({ items, active, onNavigate, onLogout, user, open, onClose }) {
  return (
    <>
      {open && <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", zIndex: 998,
        display: "none",
      }} className="sidebar-overlay" />}
      <aside style={{
        width: 272, height: "100vh", position: "fixed", left: 0, top: 0,
        background: T.white, borderRight: `1px solid ${T.lightGray}`,
        display: "flex", flexDirection: "column", zIndex: 999,
        boxShadow: "2px 0 20px rgba(93,64,55,0.06)",
        transform: open ? "translateX(0)" : undefined,
        transition: "transform .3s",
      }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${T.lightGray}` }}>
          <Logo />
        </div>

        <div style={{ padding: "16px 16px 8px" }}>
          <div style={{
            background: `linear-gradient(135deg, ${T.cream}, ${T.yellowLight})`,
            borderRadius: 14, padding: "12px 14px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: PERFIL_COLORS[user?.perfil] || T.blue,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 800, fontFamily: "'Nunito', sans-serif" }}>
                {(user?.login || "?")[0].toUpperCase()}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{user?.login}</div>
              <Badge color={PERFIL_COLORS[user?.perfil] || T.blue}>{PERFIL_LABELS[user?.perfil] || user?.perfil}</Badge>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "8px 12px", overflowY: "auto" }}>
          {items.map((item) => {
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 12, border: "none",
                background: isActive ? T.red + "12" : "transparent",
                color: isActive ? T.red : T.textSecondary,
                cursor: "pointer", transition: "all .2s", marginBottom: 2,
                fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: isActive ? 800 : 600,
                textAlign: "left",
              }}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
                {isActive && <div style={{
                  marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: T.red,
                }} />}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "12px 16px 20px", borderTop: `1px solid ${T.lightGray}` }}>
          <div style={{ marginBottom: 12, padding: "10px 14px", background: T.blueLight, borderRadius: 12, fontSize: 12, color: T.blue, fontFamily: "'Nunito', sans-serif" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, marginBottom: 4 }}>
              <Phone size={13} /> (62) 98630-9743
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
              <AtSign size={13} /> @tia_dalqui
            </div>
          </div>
          <Btn variant="ghost" full onClick={onLogout} style={{ color: T.red, justifyContent: "flex-start", padding: "10px 14px" }}>
            <LogOut size={18} /> Sair
          </Btn>
        </div>
      </aside>
    </>
  );
}
