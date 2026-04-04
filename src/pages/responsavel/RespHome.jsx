import { useState, useEffect } from "react";
import { Baby, Calendar, GraduationCap, Clock, BookOpen, AlertCircle, Loader2, FileText, Download, Eye } from "lucide-react";
import { T } from "../../constants/theme";
import { diaLabel } from "../../constants/days";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Btn } from "../../components/ui/Btn";
import { StatCard } from "../../components/ui/StatCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/layout/PageHeader";
import { PdfViewer } from "../../components/ui/PdfViewer";

const DIA_ORDER = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

export function RespHome({ onNavigate }) {
  const { api, user } = useAuth();
  const toast = useToast();
  const rid = user?.responsavelId;
  const [alunos, setAlunos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [atividadesPorAluno, setAtividadesPorAluno] = useState({});
  const [loading, setLoading] = useState(!!rid);
  const [downloadingId, setDownloadingId] = useState(null);
  const [pdfViewer, setPdfViewer] = useState(null);

  function closePdfViewer() {
    if (pdfViewer?.url) window.URL.revokeObjectURL(pdfViewer.url);
    setPdfViewer(null);
  }

  async function handleVisualizar(atv) {
    try {
      const url = await api.visualizarAtividade(atv.nomeArquivo);
      setPdfViewer({ titulo: atv.titulo, url, nomeArquivo: atv.nomeArquivo });
    } catch (e) { toast(e.message, "error"); }
  }

  useEffect(() => {
    if (!rid) return;
    Promise.all([
      api.buscarAlunosDoResponsavel(rid).catch(() => []),
      api.buscarHorariosPorResponsavel(rid).catch(() => []),
    ]).then(([a, h]) => {
      setAlunos(a);
      setHorarios(h);
      Promise.all(
        a.map((aluno) => api.listarAtividadesAluno(aluno.id)
          .then((ativs) => ({ alunoId: aluno.id, atividades: ativs }))
          .catch(() => ({ alunoId: aluno.id, atividades: [] })))
      ).then((results) => {
        const map = {};
        results.forEach(({ alunoId, atividades }) => { map[alunoId] = atividades; });
        setAtividadesPorAluno(map);
      });
    }).finally(() => setLoading(false));
  }, [rid, api]);

  async function handleDownload(atividade) {
    setDownloadingId(atividade.id);
    try {
      await api.downloadAtividade(atividade.nomeArquivo);
    } catch (e) { toast(e.message, "error"); }
    setDownloadingId(null);
  }

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

  const totalAtividades = Object.values(atividadesPorAluno).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div>
      {pdfViewer && (
        <PdfViewer
          titulo={pdfViewer.titulo}
          url={pdfViewer.url}
          onClose={closePdfViewer}
          onDownload={() => api.downloadAtividade(pdfViewer.nomeArquivo).catch((e) => toast(e.message, "error"))}
        />
      )}
      <PageHeader title="Meus Filhos" subtitle="Acompanhe os horários e atividades do reforço" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard icon={Baby} label="Filhos matriculados" value={alunos.length} color={T.green} />
        <StatCard icon={Calendar} label="Aulas agendadas" value={horarios.length} color={T.blue} />
        <StatCard icon={FileText} label="Atividades" value={totalAtividades} color={T.red} />
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
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
              <div style={{ fontSize: 13, fontWeight: 800, color: T.red, marginBottom: 8, fontFamily: "'Nunito', sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>
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

      {/* Atividades por aluno */}
      {alunos.map((a) => {
        const atividades = atividadesPorAluno[a.id] || [];
        if (atividades.length === 0) return null;
        return (
          <div key={a.id} style={{ marginTop: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, margin: 0, fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={18} color={T.red} /> Atividades — {a.nome}
              </h3>
              {onNavigate && (
                <Btn variant="ghost" onClick={() => onNavigate("ver-atividades-aluno", { alunoId: a.id, nomeAluno: a.nome, voltarPara: "home" })}
                  style={{ fontSize: 12, padding: "4px 10px" }}>
                  Ver todas as atividades →
                </Btn>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {atividades.map((atv) => (
                <Card key={atv.id} style={{ position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${T.red}, ${T.red}88)` }} />
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 4 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: T.redLight, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText size={20} color={T.red} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{atv.titulo}</div>
                      {atv.descricao && (
                        <div style={{ fontSize: 12, color: T.textSecondary, fontFamily: "'Nunito', sans-serif", marginTop: 2 }}>{atv.descricao}</div>
                      )}
                      {atv.enunciado && (
                        <div style={{
                          marginTop: 8,
                          padding: "10px 14px",
                          background: `linear-gradient(135deg, ${T.blue}12, ${T.red}08)`,
                          borderRadius: 10,
                          borderLeft: `4px solid ${T.red}`,
                        }}>
                          <div style={{ fontSize: 10, fontWeight: 900, color: T.red, fontFamily: "'Nunito', sans-serif", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>
                            📝 Enunciado da Professora
                          </div>
                          <div style={{ fontSize: 13, color: T.textPrimary, fontFamily: "'Nunito', sans-serif", fontWeight: 700, lineHeight: 1.5 }}>
                            {atv.enunciado}
                          </div>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                        {atv.dataAtribuicao && (
                          <Badge color={T.blue}>
                            Enviada em {new Date(atv.dataAtribuicao).toLocaleDateString("pt-BR")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <Btn full variant="ghost" onClick={() => handleVisualizar(atv)} style={{ fontSize: 13, color: T.blue }}>
                      <Eye size={14} /> Ver
                    </Btn>
                    <Btn full variant="ghost" loading={downloadingId === atv.id} onClick={() => handleDownload(atv)} style={{ fontSize: 13 }}>
                      <Download size={14} /> Baixar
                    </Btn>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {alunos.length === 0 && horarios.length === 0 && (
        <EmptyState icon={BookOpen} title="Tudo tranquilo por aqui" subtitle="Seus filhos ainda não possuem horários agendados" />
      )}
    </div>
  );
}
