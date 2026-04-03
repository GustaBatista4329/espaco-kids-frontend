import { useState, useEffect } from "react";
import { Users, GraduationCap, Baby, ChevronRight, Clock, Loader2 } from "lucide-react";
import { T } from "../../constants/theme";
import { diaLabel } from "../../constants/days";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Btn } from "../../components/ui/Btn";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/layout/PageHeader";

const TABS = [
  { id: "responsaveis", label: "Responsáveis", icon: Users },
  { id: "alunos", label: "Alunos", icon: GraduationCap },
];

export function ProfHome() {
  const { api } = useAuth();
  const [responsaveis, setResponsaveis] = useState([]);
  const [selectedResp, setSelectedResp] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("responsaveis");

  useEffect(() => {
    api.listarResponsaveis().then(setResponsaveis).catch(() => {}).finally(() => setLoading(false));
  }, [api]);

  async function selectResp(r) {
    setSelectedResp(r);
    setTab("alunos");
    const [a, h] = await Promise.all([
      api.buscarAlunosDoResponsavel(r.id).catch(() => []),
      api.buscarHorariosPorResponsavel(r.id).catch(() => []),
    ]);
    setAlunos(a);
    setHorarios(h);
  }

  if (loading) return <div style={{ textAlign: "center", padding: 60 }}><Loader2 size={36} color={T.blue} style={{ animation: "spin 1s linear infinite" }} /></div>;

  return (
    <div>
      <PageHeader title="Painel da Professora" subtitle="Visualize alunos e horários" />

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {TABS.map((t) => {
          const disabled = t.id === "alunos" && !selectedResp;
          return (
            <button key={t.id} onClick={() => !disabled && setTab(t.id)} style={{
              padding: "10px 20px", borderRadius: 12, border: "none",
              background: tab === t.id ? T.blue : T.lightGray,
              color: tab === t.id ? "#fff" : T.textSecondary,
              fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13,
              cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <t.icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "responsaveis" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {responsaveis.map((r) => (
            <Card key={r.id} hover onClick={() => selectResp(r)}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, background: T.blueLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Users size={20} color={T.blue} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{r.nome}</div>
                  <div style={{ fontSize: 12, color: T.textSecondary, fontFamily: "'Nunito', sans-serif" }}>{r.telefone}</div>
                </div>
                <ChevronRight size={18} color={T.textSecondary} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "alunos" && selectedResp && (
        <div>
          <Btn variant="ghost" onClick={() => { setTab("responsaveis"); setSelectedResp(null); }}
            style={{ marginBottom: 16, padding: "6px 12px", fontSize: 13 }}>
            ← Voltar para responsáveis
          </Btn>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif", marginBottom: 12 }}>
            Alunos de {selectedResp.nome}
          </h3>
          {alunos.length === 0 ? (
            <EmptyState icon={Baby} title="Sem alunos" subtitle="Nenhum aluno vinculado" />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginBottom: 24 }}>
              {alunos.map((a) => (
                <Card key={a.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: T.greenLight,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <GraduationCap size={22} color={T.green} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{a.nome}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                        <Badge color={T.blue}>{a.serie}</Badge>
                        {a.dataNascimento && <Badge color={T.warmGray}>{new Date(a.dataNascimento + "T12:00:00").toLocaleDateString("pt-BR")}</Badge>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {horarios.length > 0 && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif", marginBottom: 12 }}>
                Horários
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
                {horarios.map((h, i) => (
                  <Card key={i} style={{ padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{h.nomeAluno}</div>
                        <Badge color={T.red}>{diaLabel(h.diaSemana)}</Badge>
                      </div>
                      <Badge color={T.green}><Clock size={12} /> {h.horaInicio?.slice(0, 5)} — {h.horaFim?.slice(0, 5)}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
