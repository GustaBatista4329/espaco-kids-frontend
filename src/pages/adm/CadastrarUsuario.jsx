import { useState } from "react";
import { Users, Eye, UserPlus, Pencil } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { addPendingResponsavel } from "../../utils/pendingResponsaveis";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Btn } from "../../components/ui/Btn";
import { PageHeader } from "../../components/layout/PageHeader";

const PERFIL_OPTIONS = [
  { value: "PROFESSORA", label: "Professora" },
  { value: "RESPONSAVEL", label: "Responsável" },
];

export function CadastrarUsuario() {
  const { api } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ nome: "", login: "", senha: "", perfil: "" });
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!form.nome || !form.login || !form.senha || !form.perfil) { toast("Preencha todos os campos", "error"); return; }
    setLoading(true);
    try {
      const result = await api.cadastrarUsuario(form);
      if (form.perfil === "RESPONSAVEL" && result?.id) {
        addPendingResponsavel({ id: result.id, nome: form.nome, login: form.login });
      }
      toast("Usuário criado com sucesso!");
      setForm({ nome: "", login: "", senha: "", perfil: "" });
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }

  return (
    <div>
      <PageHeader title="Cadastrar Usuário" subtitle="Crie uma conta de acesso ao sistema" />
      <Card style={{ maxWidth: 520 }}>
        <Input label="Nome completo" icon={Users} placeholder="Ex: Maria Silva" value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        <Input label="Login" icon={Pencil} placeholder="Ex: maria.silva" value={form.login}
          onChange={(e) => setForm({ ...form, login: e.target.value })} />
        <Input label="Senha" icon={Eye} placeholder="Senha de acesso" type="password" showToggle value={form.senha}
          onChange={(e) => setForm({ ...form, senha: e.target.value })} />
        <Select label="Perfil" placeholder="Selecione o perfil" value={form.perfil}
          onChange={(v) => setForm({ ...form, perfil: v })}
          options={PERFIL_OPTIONS} />
        <Btn loading={loading} onClick={submit} full style={{ marginTop: 8 }}>
          <UserPlus size={18} /> Cadastrar Usuário
        </Btn>
      </Card>
    </div>
  );
}
