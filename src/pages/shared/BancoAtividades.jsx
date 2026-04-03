import { useState, useEffect, useRef, useCallback } from "react";
import { FileText, Upload, Trash2, Download, Send, Loader2, Eye } from "lucide-react";
import { T } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Btn } from "../../components/ui/Btn";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/layout/PageHeader";
import { PdfViewer } from "../../components/ui/PdfViewer";

const TABS = [
  { id: "banco", label: "Banco de PDFs", icon: FileText },
  { id: "atribuir", label: "Enviar para Aluno", icon: Send },
];

export function BancoAtividades() {
  const { api } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);

  const [tab, setTab] = useState("banco");
  const [banco, setBanco] = useState([]);
  const [loadingBanco, setLoadingBanco] = useState(true);
  const [alunos, setAlunos] = useState([]);

  const [uploadForm, setUploadForm] = useState({ titulo: "", descricao: "", arquivo: null });
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [atribuirForm, setAtribuirForm] = useState({ bancoAtividadeId: "", alunoId: "" });
  const [atribuindo, setAtribuindo] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [pdfViewer, setPdfViewer] = useState(null); // { titulo, url, nomeArquivo }

  useEffect(() => {
    api.listarBancoAtividades().then(setBanco).catch(() => toast("Erro ao carregar banco", "error")).finally(() => setLoadingBanco(false));
    api.listarTodosAlunos().then(setAlunos).catch(() => {});
  }, [api]);

  // Limpar blob URL ao fechar o viewer
  function closePdfViewer() {
    if (pdfViewer?.url) window.URL.revokeObjectURL(pdfViewer.url);
    setPdfViewer(null);
  }

  async function handleVisualizar(item) {
    try {
      const url = await api.visualizarAtividade(item.nomeArquivo);
      setPdfViewer({ titulo: item.titulo, url, nomeArquivo: item.nomeArquivo });
    } catch (e) { toast(e.message, "error"); }
  }

  // Drag & drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast("Apenas arquivos PDF são aceitos", "error"); return;
    }
    setUploadForm((prev) => ({ ...prev, arquivo: file }));
    if (fileRef.current) fileRef.current.value = "";
  }, [toast]);

  async function handleUpload() {
    if (!uploadForm.titulo) { toast("Informe o título", "error"); return; }
    if (!uploadForm.arquivo) { toast("Selecione um arquivo PDF", "error"); return; }
    setUploading(true);
    try {
      const novo = await api.uploadAtividade(uploadForm.titulo, uploadForm.descricao, uploadForm.arquivo);
      if (novo) setBanco((prev) => [novo, ...prev]);
      toast("Atividade enviada com sucesso!");
      setUploadForm({ titulo: "", descricao: "", arquivo: null });
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) { toast(e.message, "error"); }
    setUploading(false);
  }

  async function handleDelete(item) {
    if (!window.confirm(`Excluir "${item.titulo}" do banco?`)) return;
    setDeletingId(item.id);
    try {
      await api.excluirAtividadeBanco(item.id);
      setBanco((prev) => prev.filter((x) => x.id !== item.id));
      toast("Atividade excluída!");
    } catch (e) { toast(e.message, "error"); }
    setDeletingId(null);
  }

  async function handleDownload(item) {
    setDownloadingId(item.id);
    try {
      await api.downloadAtividade(item.nomeArquivo);
    } catch (e) { toast(e.message, "error"); }
    setDownloadingId(null);
  }

  async function handleAtribuir() {
    if (!atribuirForm.bancoAtividadeId || !atribuirForm.alunoId) {
      toast("Selecione a atividade e o aluno", "error"); return;
    }
    setAtribuindo(true);
    try {
      await api.atribuirAtividade({
        bancoAtividadeId: Number(atribuirForm.bancoAtividadeId),
        alunoId: Number(atribuirForm.alunoId),
      });
      toast("Atividade enviada para o aluno!");
      setAtribuirForm({ bancoAtividadeId: "", alunoId: "" });
    } catch (e) { toast(e.message, "error"); }
    setAtribuindo(false);
  }

  function formatData(str) {
    if (!str) return "";
    return new Date(str).toLocaleDateString("pt-BR");
  }

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

      <PageHeader title="Atividades" subtitle="Gerencie o banco de PDFs e envie para os alunos" />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 20px", borderRadius: 12, border: "none",
            background: tab === t.id ? T.red : T.lightGray,
            color: tab === t.id ? "#fff" : T.textSecondary,
            fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Banco de PDFs */}
      {tab === "banco" && (
        <div>
          {/* Formulário de upload */}
          <Card style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Upload size={18} color={T.red} /> Enviar novo PDF
            </div>
            <Input label="Título" placeholder="Ex: Tabuada do 2" value={uploadForm.titulo}
              onChange={(e) => setUploadForm({ ...uploadForm, titulo: e.target.value })} />
            <Input label="Descrição (opcional)" placeholder="Breve descrição da atividade" value={uploadForm.descricao}
              onChange={(e) => setUploadForm({ ...uploadForm, descricao: e.target.value })} />

            {/* Zona de drag & drop */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: T.textSecondary, marginBottom: 6, display: "block", fontFamily: "'Nunito', sans-serif" }}>
                Arquivo PDF
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${isDragging ? T.red : uploadForm.arquivo ? T.green : T.textSecondary + "44"}`,
                  borderRadius: 14,
                  padding: "24px 20px",
                  background: isDragging ? T.redLight : uploadForm.arquivo ? T.greenLight : T.lightGray,
                  textAlign: "center",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
              >
                <label style={{ cursor: "pointer", display: "block" }}>
                  <FileText size={32} color={isDragging ? T.red : uploadForm.arquivo ? T.green : T.textSecondary} style={{ margin: "0 auto 10px" }} />
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, color: uploadForm.arquivo ? T.green : isDragging ? T.red : T.textPrimary, marginBottom: 4 }}>
                    {uploadForm.arquivo ? uploadForm.arquivo.name : isDragging ? "Solte o arquivo aqui!" : "Arraste um PDF aqui"}
                  </div>
                  {!uploadForm.arquivo && !isDragging && (
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: T.textSecondary }}>
                      ou <span style={{ color: T.red, fontWeight: 700 }}>clique para selecionar</span>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf"
                    style={{ display: "none" }}
                    onChange={(e) => setUploadForm({ ...uploadForm, arquivo: e.target.files[0] || null })}
                  />
                </label>
                {uploadForm.arquivo && (
                  <button onClick={() => { setUploadForm({ ...uploadForm, arquivo: null }); if (fileRef.current) fileRef.current.value = ""; }}
                    style={{ marginTop: 8, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: T.red, fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                    Remover arquivo
                  </button>
                )}
              </div>
            </div>

            <Btn loading={uploading} onClick={handleUpload}>
              <Upload size={16} /> Enviar PDF
            </Btn>
          </Card>

          {/* Lista do banco */}
          {loadingBanco ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Loader2 size={32} color={T.red} style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ) : banco.length === 0 ? (
            <EmptyState icon={FileText} title="Banco vazio" subtitle="Envie o primeiro PDF para começar" />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
              {banco.map((item) => (
                <Card key={item.id} style={{ position: "relative", overflow: "hidden" }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 4,
                    background: `linear-gradient(90deg, ${T.red}, ${T.red}88)`,
                  }} />
                  <div
                    onClick={() => handleVisualizar(item)}
                    style={{ display: "flex", alignItems: "flex-start", gap: 14, marginTop: 4, cursor: "pointer" }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: T.redLight, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <FileText size={22} color={T.red} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{item.titulo}</div>
                      {item.descricao && (
                        <div style={{
                          fontSize: 12, color: T.textSecondary, fontFamily: "'Nunito', sans-serif",
                          marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>{item.descricao}</div>
                      )}
                      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                        <Badge color={T.red}>PDF</Badge>
                        {item.criadoEm && <Badge color={T.warmGray}>{formatData(item.criadoEm)}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <Btn full variant="ghost" onClick={() => handleVisualizar(item)} style={{ fontSize: 13, color: T.blue }}>
                      <Eye size={14} /> Ver
                    </Btn>
                    <Btn full variant="ghost" loading={downloadingId === item.id} onClick={() => handleDownload(item)} style={{ fontSize: 13 }}>
                      <Download size={14} /> Baixar
                    </Btn>
                    <Btn full variant="ghost" loading={deletingId === item.id} onClick={() => handleDelete(item)} style={{ fontSize: 13, color: T.red }}>
                      <Trash2 size={14} /> Excluir
                    </Btn>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Enviar para Aluno */}
      {tab === "atribuir" && (
        <Card style={{ maxWidth: 520 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Send size={18} color={T.red} /> Atribuir atividade
          </div>
          <Select
            label="Atividade"
            placeholder="Selecione uma atividade"
            options={banco.map((b) => ({ value: String(b.id), label: b.titulo }))}
            value={atribuirForm.bancoAtividadeId}
            onChange={(val) => setAtribuirForm({ ...atribuirForm, bancoAtividadeId: val })}
          />
          <Select
            label="Aluno"
            placeholder="Selecione o aluno"
            options={alunos.map((a) => ({ value: String(a.id), label: `${a.nome} — ${a.serie}` }))}
            value={atribuirForm.alunoId}
            onChange={(val) => setAtribuirForm({ ...atribuirForm, alunoId: val })}
          />
          <Btn loading={atribuindo} onClick={handleAtribuir} full style={{ marginTop: 8 }}>
            <Send size={16} /> Enviar Atividade
          </Btn>
        </Card>
      )}
    </div>
  );
}
