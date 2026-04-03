import { useState, useEffect } from "react";
import { Users, Pencil, Check, X, Loader2, ShieldAlert, GraduationCap, UserCheck } from "lucide-react";
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

const PERFIL_OPTIONS = [
  { value: "ADM", label: "ADM" },
  { value: "PROFESSORA", label: "Professora" },
  { value: "RESPONSAVEL", label: "Responsável" },
];

const PERFIL_COLOR = {
  ADM: T.red,
  PROFESSORA: T.blue,
  RESPONSAVEL: T.green,
};

const PERFIL_ICON = {
  ADM: ShieldAlert,
  PROFESSORA: GraduationCap,
  RESPONSAVEL: UserCheck,
};

export function ListarUsuarios() {
  const { api } = useAuth();
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ nome: "", login: "", perfil: "" });
  const [savingId, setSavingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    api.listarTodosUsuarios().then(setData).catch(() => toast("Erro ao carregar usuários", "error")).finally(() => setLoading(false));
  }, [api]);

  function startEdit(u) {
    setEditingId(u.id);
    setEditForm({ nome: u.nome, login: u.login, perfil: u.perfil });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ nome: "", login: "", perfil: "" });
  }

  async function saveEdit(u) {
    if (!editForm.nome || !editForm.login || !editForm.perfil) {
      toast("Preencha todos os campos", "error"); return;
    }
    setSavingId(u.id);
    try {
      await api.editarUsuario(u.id, editForm);
      setData((prev) => prev.map((x) => x.id === u.id ? { ...x, ...editForm } : x));
      toast("Usuário atualizado com sucesso!");
      cancelEdit();
    } catch (e) { toast(e.message, "error"); }
    setSavingId(null);
  }

  async function toggleStatus(u) {
    const acao = u.ativo ? "desativar" : "reativar";
    if (!window.confirm(`Deseja ${acao} o usuário "${u.nome}"?`)) return;
    setTogglingId(u.id);
    try {
      await api.alterarStatusUsuario(u.id, !u.ativo);
      setData((prev) => prev.map((x) => x.id === u.id ? { ...x, ativo: !u.ativo } : x));
      toast(`Usuário ${u.ativo ? "desativado" : "reativado"} com sucesso!`);
    } catch (e) { toast(e.message, "error"); }
    setTogglingId(null);
  }

  return (
    <div>
      <PageHeader title="Usuários" subtitle={`${data.length} usuários no sistema`} />
      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <Loader2 size={32} color={T.red} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : data.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum usuário" subtitle="Nenhum usuário cadastrado ainda" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
          {data.map((u) => {
            const isEditing = editingId === u.id;
            const PerfilIcon = PERFIL_ICON[u.perfil] || Users;
            return (
              <Card key={u.id} style={{ opacity: u.ativo === false ? 0.65 : 1, position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 4,
                  background: `linear-gradient(90deg, ${PERFIL_COLOR[u.perfil] || T.blue}, ${PERFIL_COLOR[u.perfil] || T.blue}88)`,
                }} />

                {isEditing ? (
                  <div style={{ marginTop: 8 }}>
                    <Input label="Nome" placeholder="Nome completo" value={editForm.nome}
                      onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} />
                    <Input label="Login" placeholder="Login de acesso" value={editForm.login}
                      onChange={(e) => setEditForm({ ...editForm, login: e.target.value })} />
                    <Select label="Perfil" options={PERFIL_OPTIONS} value={editForm.perfil}
                      onChange={(val) => setEditForm({ ...editForm, perfil: val })} />
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <Btn full onClick={() => saveEdit(u)} loading={savingId === u.id}>
                        <Check size={16} /> Salvar
                      </Btn>
                      <Btn full variant="ghost" onClick={cancelEdit}>
                        <X size={16} /> Cancelar
                      </Btn>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                        background: (PERFIL_COLOR[u.perfil] || T.blue) + "18",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <PerfilIcon size={22} color={PERFIL_COLOR[u.perfil] || T.blue} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.nome}</div>
                        <div style={{ fontSize: 13, color: T.textSecondary, fontFamily: "'Nunito', sans-serif" }}>@{u.login}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                          <Badge color={PERFIL_COLOR[u.perfil] || T.blue}>{u.perfil}</Badge>
                          <Badge color={u.ativo === false ? T.warmGray : T.green}>
                            {u.ativo === false ? "Inativo" : "Ativo"}
                          </Badge>
                          {u.dataCriacao && (
                            <Badge color={T.lightGray} style={{ color: T.textSecondary }}>
                              {new Date(u.dataCriacao).toLocaleDateString("pt-BR")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      <Btn full variant="ghost" onClick={() => startEdit(u)} style={{ fontSize: 13 }}>
                        <Pencil size={14} /> Editar
                      </Btn>
                      <Btn
                        full
                        variant="ghost"
                        loading={togglingId === u.id}
                        onClick={() => toggleStatus(u)}
                        style={{ fontSize: 13, color: u.ativo === false ? T.green : T.red }}
                      >
                        {u.ativo === false ? <><UserCheck size={14} /> Reativar</> : <><X size={14} /> Desativar</>}
                      </Btn>
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
