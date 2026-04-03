import { useState, useEffect } from "react";
import { Users, Calendar, Baby, Clock, UserPlus, ChevronRight } from "lucide-react";
import { T } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { StatCard } from "../../components/ui/StatCard";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/layout/PageHeader";

const QUICK_ACTIONS = [
  { id: "cadastrar-usuario", icon: UserPlus, label: "Novo Usuário", desc: "Cadastrar login no sistema", color: T.red },
  { id: "cadastrar-responsavel", icon: Users, label: "Novo Responsável", desc: "Vincular responsável a usuário", color: T.blue },
  { id: "cadastrar-aluno", icon: Baby, label: "Novo Aluno", desc: "Matricular um estudante", color: T.green },
  { id: "cadastrar-horario", icon: Clock, label: "Novo Horário", desc: "Agendar aula de reforço", color: T.yellow },
];

export function AdmHome({ onNavigate }) {
  const { api } = useAuth();
  const [stats, setStats] = useState({ responsaveis: 0, horarios: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [resp, hor] = await Promise.all([
          api.listarResponsaveis().catch(() => []),
          api.buscarTodosHorarios().catch(() => []),
        ]);
        setStats({ responsaveis: resp.length, horarios: hor.length });
      } catch { /* no-op */ }
    })();
  }, [api]);

  return (
    <div>
      <PageHeader title="Painel Administrativo" subtitle="Gerencie a escolinha com facilidade" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard icon={Users} label="Responsáveis" value={stats.responsaveis} color={T.blue} />
        <StatCard icon={Calendar} label="Aulas agendadas" value={stats.horarios} color={T.green} />
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, marginBottom: 16, fontFamily: "'Nunito', sans-serif" }}>Ações rápidas</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {QUICK_ACTIONS.map((a) => (
          <Card key={a.id} hover onClick={() => onNavigate(a.id)} style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: a.color + "18",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <a.icon size={22} color={a.color} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{a.label}</div>
                <div style={{ fontSize: 12, color: T.textSecondary, fontFamily: "'Nunito', sans-serif" }}>{a.desc}</div>
              </div>
              <ChevronRight size={18} color={T.textSecondary} style={{ marginLeft: "auto" }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
