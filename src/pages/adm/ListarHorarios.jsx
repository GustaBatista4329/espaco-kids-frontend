import { useState, useEffect } from "react";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { T } from "../../constants/theme";
import { DIAS, diaLabel } from "../../constants/days";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Select";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/layout/PageHeader";

const DIA_ORDER = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

export function ListarHorarios() {
  const { api } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDia, setFilterDia] = useState("");

  useEffect(() => {
    api.buscarTodosHorarios().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [api]);

  const filtered = filterDia ? data.filter((h) => h.diaSemana === filterDia) : data;
  const grouped = {};
  filtered.forEach((h) => {
    if (!grouped[h.diaSemana]) grouped[h.diaSemana] = [];
    grouped[h.diaSemana].push(h);
  });

  return (
    <div>
      <PageHeader title="Todos os Horários" subtitle={`${data.length} aulas agendadas`} />
      <div style={{ marginBottom: 20 }}>
        <Select placeholder="Filtrar por dia" value={filterDia} onChange={setFilterDia}
          options={[{ value: "", label: "Todos os dias" }, ...DIAS]} style={{ maxWidth: 260, marginBottom: 0 }} />
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Loader2 size={32} color={T.blue} style={{ animation: "spin 1s linear infinite" }} /></div>
      ) : Object.keys(grouped).length === 0 ? (
        <EmptyState icon={Calendar} title="Sem horários" subtitle="Nenhuma aula encontrada" />
      ) : (
        DIA_ORDER.filter((d) => grouped[d]).map((dia) => (
          <div key={dia} style={{ marginBottom: 24 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
              fontSize: 15, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif",
            }}>
              <Calendar size={18} color={T.red} /> {diaLabel(dia)}
              <Badge color={T.red}>{grouped[dia].length}</Badge>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
              {grouped[dia].map((h, i) => (
                <Card key={i} style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{h.nomeAluno}</div>
                      <div style={{ fontSize: 12, color: T.textSecondary, fontFamily: "'Nunito', sans-serif" }}>Responsável: {h.nomeResponsavel}</div>
                    </div>
                    <Badge color={T.green}>
                      <Clock size={12} /> {h.horaInicio?.slice(0, 5)} — {h.horaFim?.slice(0, 5)}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
