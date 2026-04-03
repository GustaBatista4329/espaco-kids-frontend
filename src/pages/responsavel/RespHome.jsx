import { useState, useEffect } from "react";
import { Baby, Calendar, GraduationCap, Clock, BookOpen, AlertCircle, Loader2 } from "lucide-react";
import { T } from "../../constants/theme";
import { diaLabel } from "../../constants/days";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/layout/PageHeader";

const DIA_ORDER = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

export function RespHome() {
  const { api, user } = useAuth();
  const [alunos, setAlunos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const rid = user?.responsavelId;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!rid) { setLoading(false); return; }
    Promise.all([
      api.buscarAlunosDoResponsavel(rid).catch(() => []),
      api.buscarHorariosPorResponsavel(rid).catch(() => []),
    ]).then(([a, h]) => { setAlunos(a); setHorarios(h); }).finally(() => setLoading(false));
  }, [rid, api]);

  if (!rid) return (
    <Card>
      <div style={{ textAlign: "center", padding: 40 }}>
        <AlertCircle size={40} color={T.yellow} />
        <h3 style={{ fontFamily: "'Nunito', sans-serif", color: T.textPrimary, marginTop: 12 }}>Perfil incompleto</h3>
        <p style={{ fontFamily: "'Nunito', sans-serif", color: T.textSecondary, fontSize: 14 }}>
          Seu cadastro de responsável ainda não foi vinculado. Entre em contato com a administração.
        </p>
      </div>
    </Card>
  );

  if (loading) return <div style={{ textAlign: "center", padding: 60 }}><Loader2 size={36} color={T.green} style={{ animation: "spin 1s linear infinite" }} /></div>;

  const grouped = {};
  horarios.forEach((h) => {
    if (!grouped[h.diaSemana]) grouped[h.diaSemana] = [];
    grouped[h.diaSemana].push(h);
  });

  return (
    <div>
      <PageHeader title="Meus Filhos" subtitle="Acompanhe os horários de aula do reforço" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard icon={Baby} label="Filhos matriculados" value={alunos.length} color={T.green} />
        <StatCard icon={Calendar} label="Aulas agendadas" value={horarios.length} color={T.blue} />
      </div>

      {alunos.length > 0 && (
        <>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, marginBottom: 12, fontFamily: "'Nunito', sans-serif" }}>
            Alunos
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginBottom: 28 }}>
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
                    <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{a.nome}</div>
                    <Badge color={T.blue}>{a.serie}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {horarios.length > 0 && (
        <>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, marginBottom: 12, fontFamily: "'Nunito', sans-serif" }}>
            Horários da Semana
          </h3>
          {DIA_ORDER.filter((d) => grouped[d]).map((dia) => (
            <div key={dia} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 13, fontWeight: 800, color: T.red, marginBottom: 8,
                fontFamily: "'Nunito', sans-serif", textTransform: "uppercase", letterSpacing: 1,
              }}>
                {diaLabel(dia)}
              </div>
              {grouped[dia].map((h, i) => (
                <Card key={i} style={{ padding: 14, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Clock size={16} color={T.blue} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{h.nomeAluno}</span>
                    </div>
                    <Badge color={T.green}>{h.horaInicio?.slice(0, 5)} — {h.horaFim?.slice(0, 5)}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </>
      )}

      {alunos.length === 0 && horarios.length === 0 && (
        <EmptyState icon={BookOpen} title="Tudo tranquilo por aqui" subtitle="Seus filhos ainda não possuem horários agendados" />
      )}
    </div>
  );
}
