import { useState, useEffect } from "react";
import { Baby, GraduationCap, Loader2 } from "lucide-react";
import { T } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Btn } from "../../components/ui/Btn";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/layout/PageHeader";

export function VerAlunos({ params, onNavigate }) {
  const { api } = useAuth();
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.responsavelId) {
      api.buscarAlunosDoResponsavel(params.responsavelId).then(setAlunos).catch(() => {}).finally(() => setLoading(false));
    }
  }, [params?.responsavelId, api]);

  return (
    <div>
      <PageHeader title={`Alunos — ${params?.responsavelNome || "Responsável"}`}
        subtitle={`${alunos.length} aluno(s) vinculados`}
        action={<Btn variant="ghost" onClick={() => onNavigate("listar-responsaveis")}> Voltar</Btn>} />
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Loader2 size={32} color={T.green} style={{ animation: "spin 1s linear infinite" }} /></div>
      ) : alunos.length === 0 ? (
        <EmptyState icon={Baby} title="Nenhum aluno" subtitle="Este responsável ainda não tem alunos cadastrados" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {alunos.map((a) => (
            <Card key={a.id} style={{ position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 4,
                background: `linear-gradient(90deg, ${T.green}, ${T.blue})`,
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: T.greenLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <GraduationCap size={24} color={T.green} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{a.nome}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    <Badge color={T.blue}>{a.serie}</Badge>
                    {a.dataNascimento && <Badge color={T.warmGray}>{new Date(a.dataNascimento + "T12:00:00").toLocaleDateString("pt-BR")}</Badge>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
