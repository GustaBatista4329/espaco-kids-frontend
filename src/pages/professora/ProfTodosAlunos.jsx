import { useState, useEffect } from "react";
import { GraduationCap, Search, Loader2, FileText } from "lucide-react";
import { T } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Btn } from "../../components/ui/Btn";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/layout/PageHeader";

export function ProfTodosAlunos({ onNavigate }) {
  const { api } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.listarTodosAlunos().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [api]);

  const filtered = data.filter((a) => a.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Todos os Alunos" subtitle={`${data.length} alunos cadastrados`} />
      <div style={{ marginBottom: 20 }}>
        <Input icon={Search} placeholder="Buscar por nome..." value={search}
          onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 0, maxWidth: 360 }} />
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Loader2 size={32} color={T.red} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Nenhum aluno" subtitle="Nenhum aluno cadastrado ainda" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {filtered.map((a) => (
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
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{a.nome}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    <Badge color={T.blue}>{a.serie}</Badge>
                    {a.dataNascimento && <Badge color={T.warmGray}>{new Date(a.dataNascimento + "T12:00:00").toLocaleDateString("pt-BR")}</Badge>}
                  </div>
                </div>
              </div>
              {onNavigate && (
                <Btn variant="ghost" onClick={() => onNavigate("ver-atividades-aluno", { alunoId: a.id, nomeAluno: a.nome, voltarPara: "alunos" })}
                  style={{ marginTop: 10, fontSize: 12, padding: "4px 10px" }}>
                  <FileText size={14} /> Atividades
                </Btn>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
