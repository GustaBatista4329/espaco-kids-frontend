import { useState, useEffect } from "react";
import { Users, Phone } from "lucide-react";
import { formatarTelefone } from "../../utils/formatters";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Btn } from "../../components/ui/Btn";
import { PageHeader } from "../../components/layout/PageHeader";

export function CadastrarResponsavel() {
  const { api } = useAuth();
  const toast = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ usuarioId: "", telefone: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listarUsuariosDisponiveis()
      .then(setUsuarios)
      .catch(() => toast("Erro ao carregar usuários", "error"));
  }, []);

  async function submit() {
    if (!form.usuarioId || !form.telefone) { toast("Preencha todos os campos", "error"); return; }
    setLoading(true);
    try {
      await api.cadastrarResponsavel({ usuarioId: Number(form.usuarioId), telefone: form.telefone });
      toast("Responsável cadastrado com sucesso!");
      setUsuarios((prev) => prev.filter((u) => u.id !== Number(form.usuarioId)));
      setForm({ usuarioId: "", telefone: "" });
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }

  return (
    <div>
      <PageHeader title="Cadastrar Responsável" subtitle="Vincule um responsável a um usuário existente" />
      <Card style={{ maxWidth: 520 }}>
        <Select
          label="Responsável"
          placeholder="Selecione um usuário"
          options={usuarios.map((u) => ({ value: String(u.id), label: `${u.nome} (${u.login})` }))}
          value={form.usuarioId}
          onChange={(val) => setForm({ ...form, usuarioId: val })}
        />
        <Input label="Telefone" icon={Phone} placeholder="Ex: (62) 99999-9999" value={form.telefone}
          onChange={(e) => setForm({ ...form, telefone: formatarTelefone(e.target.value) })} />
        <Btn loading={loading} onClick={submit} full variant="secondary" style={{ marginTop: 8 }}>
          <Users size={18} /> Cadastrar Responsável
        </Btn>
      </Card>
    </div>
  );
}
