import { useState, useEffect } from "react";
import { FileText, Download, Eye, Trash2, Loader2, Calendar, X } from "lucide-react";
import { T } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Btn } from "../../components/ui/Btn";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/layout/PageHeader";
import { PdfViewer } from "../../components/ui/PdfViewer";

function agruparPorData(atividades) {
  const grupos = {};
  atividades.forEach((atv) => {
    const data = atv.dataAtribuicao?.split("T")[0] || "sem-data";
    if (!grupos[data]) grupos[data] = [];
    grupos[data].push(atv);
  });
  return Object.entries(grupos).sort((a, b) => b[0].localeCompare(a[0]));
}

function formatarDataCompleta(data) {
  if (data === "sem-data") return "Sem data";
  return new Date(data + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

export function AtividadesAluno({ params, onNavigate, podeExcluir = false }) {
  const { api } = useAuth();
  const toast = useToast();
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroData, setFiltroData] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);
  const [removendoId, setRemovendoId] = useState(null);
  const [pdfViewer, setPdfViewer] = useState(null);

  const alunoId = params?.alunoId;
  const nomeAluno = params?.nomeAluno || "Aluno";
  const voltarPara = params?.voltarPara || "home";

  useEffect(() => {
    if (!alunoId) { setLoading(false); return; }
    api.listarAtividadesAluno(alunoId)
      .then(setAtividades)
      .catch(() => toast("Erro ao carregar atividades", "error"))
      .finally(() => setLoading(false));
  }, [alunoId, api]);

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

  async function handleDownload(atv) {
    setDownloadingId(atv.id);
    try {
      await api.downloadAtividade(atv.nomeArquivo);
    } catch (e) { toast(e.message, "error"); }
    setDownloadingId(null);
  }

  async function handleRemover(atv) {
    if (!window.confirm(`Remover "${atv.titulo}"?`)) return;
    setRemovendoId(atv.id);
    try {
      await api.removerAtribuicao(atv.id);
      setAtividades((prev) => prev.filter((x) => x.id !== atv.id));
      toast("Atividade removida!");
    } catch (e) { toast(e.message, "error"); }
    setRemovendoId(null);
  }

  // Datas únicas com atividades, ordenadas desc
  const datasDisponiveis = [...new Set(
    atividades.map((atv) => atv.dataAtribuicao?.split("T")[0]).filter(Boolean)
  )].sort((a, b) => b.localeCompare(a));

  const atividadesFiltradas = filtroData
    ? atividades.filter((atv) => atv.dataAtribuicao?.startsWith(filtroData))
    : atividades;

  const grupos = agruparPorData(atividadesFiltradas);

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

      <PageHeader
        title={`Atividades — ${nomeAluno}`}
        subtitle={`${atividades.length} atividade(s) atribuída(s)`}
        action={<Btn variant="ghost" onClick={() => onNavigate(voltarPara)}> Voltar</Btn>}
      />

      {/* Filtro por data */}
      {!loading && atividades.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {/* Select de datas disponíveis */}
          <div style={{ position: "relative" }}>
            <Calendar size={16} color={T.textSecondary} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <select
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              style={{
                padding: "12px 40px 12px 38px", borderRadius: 12, border: "2px solid transparent",
                background: filtroData ? T.redLight : T.lightGray,
                color: filtroData ? T.red : T.textPrimary,
                fontSize: 14, fontWeight: 700, fontFamily: "'Nunito', sans-serif",
                outline: "none", cursor: "pointer", appearance: "none",
              }}
            >
              <option value="">Todas as datas</option>
              {datasDisponiveis.map((d) => (
                <option key={d} value={d}>
                  {new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                </option>
              ))}
            </select>
          </div>

          {/* Separador */}
          <span style={{ fontSize: 12, color: T.textSecondary, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>ou</span>

          {/* Input manual */}
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            style={{
              padding: "12px 14px", borderRadius: 12, border: "2px solid transparent",
              background: T.lightGray, fontSize: 14, color: T.textPrimary, fontWeight: 600,
              fontFamily: "'Nunito', sans-serif", outline: "none", cursor: "pointer",
            }}
          />

          {filtroData && (
            <Btn variant="ghost" onClick={() => setFiltroData("")} style={{ padding: "10px 14px", fontSize: 13 }}>
              <X size={14} /> Limpar
            </Btn>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <Loader2 size={32} color={T.red} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : grupos.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhuma atividade" subtitle={filtroData ? "Nenhuma atividade nessa data" : "Este aluno ainda não tem atividades atribuídas"} />
      ) : (
        grupos.map(([data, lista]) => (
          <div key={data}>
            {/* Cabeçalho de data */}
            <div style={{
              fontSize: 14, fontWeight: 900, color: T.red,
              fontFamily: "'Nunito', sans-serif", textTransform: "uppercase",
              letterSpacing: 1, marginTop: 28, marginBottom: 12,
              paddingBottom: 8, borderBottom: `3px solid ${T.red}22`,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <Calendar size={16} /> {formatarDataCompleta(data)}
            </div>

            {lista.map((atv) => (
              <div key={atv.id} style={{ marginBottom: 12 }}>
                {/* Enunciado colado ao card */}
                {atv.enunciado && (
                  <div style={{
                    fontSize: 13, color: T.textPrimary, fontFamily: "'Nunito', sans-serif",
                    padding: "10px 14px", background: T.yellowLight,
                    borderRadius: "10px 10px 0 0",
                    borderLeft: `4px solid ${T.yellow}`,
                    fontStyle: "italic", fontWeight: 600,
                  }}>
                    📝 {atv.enunciado}
                  </div>
                )}

                <Card style={{
                  borderRadius: atv.enunciado ? "0 0 12px 12px" : 12,
                  position: "relative", overflow: "hidden",
                  marginBottom: 0,
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 4,
                    background: `linear-gradient(90deg, ${T.red}, ${T.red}88)`,
                  }} />
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginTop: 4 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: T.redLight, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <FileText size={22} color={T.red} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>
                        {atv.titulo}
                      </div>
                      {atv.descricao && (
                        <div style={{ fontSize: 12, color: T.textSecondary, fontFamily: "'Nunito', sans-serif", marginTop: 2 }}>
                          {atv.descricao}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                        {atv.dataAtribuicao && (
                          <Badge color={T.blue}>
                            {new Date(atv.dataAtribuicao).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <Btn full variant="ghost" onClick={() => handleVisualizar(atv)} style={{ fontSize: 13, color: T.blue }}>
                      <Eye size={14} /> Ver
                    </Btn>
                    <Btn full variant="ghost" loading={downloadingId === atv.id} onClick={() => handleDownload(atv)} style={{ fontSize: 13 }}>
                      <Download size={14} /> Baixar
                    </Btn>
                    {podeExcluir && (
                      <Btn full variant="ghost" loading={removendoId === atv.id} onClick={() => handleRemover(atv)} style={{ fontSize: 13, color: T.red }}>
                        <Trash2 size={14} /> Remover
                      </Btn>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
