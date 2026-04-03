import { useState, useEffect } from "react";
import { Users, Phone, Search, ChevronRight, Loader2 } from "lucide-react";
import { T } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/layout/PageHeader";

export function ListarResponsaveis({ onNavigate }) {
  const { api } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.listarResponsaveis().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [api]);

  const filtered = data.filter((r) => r.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Responsáveis" subtitle={`${data.length} responsáveis cadastrados`} />
      <div style={{ marginBottom: 20 }}>
        <Input icon={Search} placeholder="Buscar por nome..." value={search}
          onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 0, maxWidth: 360 }} />
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Loader2 size={32} color={T.red} style={{ animation: "spin 1s linear infinite" }} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum responsável" subtitle="Cadastre o primeiro responsável para começar" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {filtered.map((r) => (
            <Card key={r.id} hover onClick={() => onNavigate("ver-alunos", { responsavelId: r.id, responsavelNome: r.nome })}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: T.blueLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Users size={20} color={T.blue} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{r.nome}</div>
                  <div style={{ fontSize: 13, color: T.textSecondary, fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                    <Phone size={12} /> {r.telefone}
                  </div>
                </div>
                <Badge color={T.blue}>ID: {r.id}</Badge>
                <ChevronRight size={18} color={T.textSecondary} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
