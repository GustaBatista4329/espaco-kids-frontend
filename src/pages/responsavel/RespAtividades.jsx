import { useState, useEffect } from "react";
import { GraduationCap, FileText, Loader2 } from "lucide-react";
import { T } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Btn } from "../../components/ui/Btn";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/layout/PageHeader";

export function RespAtividades({ onNavigate }) {
  const { api, user } = useAuth();
  const rid = user?.responsavelId;
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rid) { setLoading(false); return; }
    api.buscarAlunosDoResponsavel(rid)
      .then((lista) => {
        setAlunos(lista);
        // Se só tem um filho, navega direto para as atividades dele
        if (lista.length === 1) {
          onNavigate("ver-atividades-aluno", { alunoId: lista[0].id, nomeAluno: lista[0].nome, voltarPara: "atividades" });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rid, api]);

  if (loading) return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <Loader2 size={32} color={T.red} style={{ animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div>
      <PageHeader title="Atividades" subtitle="Selecione o aluno para ver as atividades" />
      {alunos.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum aluno" subtitle="Nenhum filho matriculado ainda" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {alunos.map((a) => (
            <Card key={a.id} style={{ position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 4,
                background: `linear-gradient(90deg, ${T.red}, ${T.red}88)`,
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: T.greenLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <GraduationCap size={24} color={T.green} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{a.nome}</div>
                  <Badge color={T.blue}>{a.serie}</Badge>
                </div>
              </div>
              <Btn full onClick={() => onNavigate("ver-atividades-aluno", { alunoId: a.id, nomeAluno: a.nome, voltarPara: "atividades" })}
                style={{ marginTop: 14, fontSize: 13 }}>
                <FileText size={15} /> Ver Atividades
              </Btn>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
